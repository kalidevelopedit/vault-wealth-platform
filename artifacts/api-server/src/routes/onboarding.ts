import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, kycDocumentsTable, activityLogTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendKycSubmittedEmail } from "../lib/email.js";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

router.post("/preferences", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { preferences, investmentPurpose, investmentAmount } = req.body;
    if (!preferences || !Array.isArray(preferences)) {
      res.status(400).json({ error: "validation_error", message: "Preferences array required" });
      return;
    }
    const updateData: any = {
      investmentPreferences: preferences,
      onboardingStep: Math.max(2, (await db.select({ step: usersTable.onboardingStep }).from(usersTable).where(eq(usersTable.id, userId)))[0]?.step ?? 2),
      updatedAt: new Date(),
    };
    if (investmentPurpose) updateData.investmentPurpose = investmentPurpose;
    if (investmentAmount) updateData.investmentAmount = investmentAmount;
    await db.update(usersTable).set(updateData).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "preferences_saved",
      description: `Investment preferences set: ${preferences.join(", ")}`,
    });

    res.json({ message: "Preferences saved" });
  } catch (err) {
    req.log.error({ err }, "Save preferences error");
    res.status(500).json({ error: "server_error", message: "Failed to save preferences" });
  }
});

router.post("/profile", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { legalName, dateOfBirth, phone, address, city, postalCode, country, profilePhotoUrl } = req.body;
    const [user] = await db.select({ step: usersTable.onboardingStep }).from(usersTable).where(eq(usersTable.id, userId));
    await db.update(usersTable).set({
      legalName,
      dateOfBirth,
      phone,
      address,
      city,
      postalCode,
      country,
      profilePhotoUrl: profilePhotoUrl ?? null,
      onboardingStep: Math.max(3, user?.step ?? 3),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "profile_updated",
      description: "User profile information updated",
    });

    res.json({ message: "Profile saved" });
  } catch (err) {
    req.log.error({ err }, "Save profile error");
    res.status(500).json({ error: "server_error", message: "Failed to save profile" });
  }
});

router.post("/kyc/upload-id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { documentType, side, fileUrl } = req.body;
    if (!documentType || !side || !fileUrl) {
      res.status(400).json({ error: "validation_error", message: "All fields required" });
      return;
    }
    const [doc] = await db.insert(kycDocumentsTable).values({
      userId,
      documentType,
      side,
      fileUrl,
      status: "pending",
    }).returning();

    const [user] = await db.select({ step: usersTable.onboardingStep }).from(usersTable).where(eq(usersTable.id, userId));
    const newStep = side === "front" ? Math.max(5, user?.step ?? 5) : Math.max(6, user?.step ?? 6);
    await db.update(usersTable).set({
      onboardingStep: newStep,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "document_uploaded",
      description: `Uploaded ${documentType} (${side} side)`,
    });

    res.json({ documentId: doc.id, message: "Document uploaded successfully" });
  } catch (err) {
    req.log.error({ err }, "Upload ID error");
    res.status(500).json({ error: "server_error", message: "Failed to upload document" });
  }
});

router.post("/kyc/upload-selfie", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { videoUrl } = req.body;
    if (!videoUrl) {
      res.status(400).json({ error: "validation_error", message: "Video URL required" });
      return;
    }
    await db.update(usersTable).set({
      selfieStatus: "submitted",
      selfieVideoUrl: videoUrl,
      onboardingStep: 7,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "selfie_submitted",
      description: "Liveness verification video submitted",
    });

    res.json({ message: "Selfie submitted successfully" });
  } catch (err) {
    req.log.error({ err }, "Upload selfie error");
    res.status(500).json({ error: "server_error", message: "Failed to upload selfie" });
  }
});

router.post("/kyc/submit", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    await db.update(usersTable).set({
      kycStatus: "pending",
      onboardingStep: 8,
      onboardingComplete: true,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "kyc_submitted",
      description: "KYC verification submitted for review",
    });

    const [user] = await db.select({ email: usersTable.email, fullName: usersTable.fullName })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user) sendKycSubmittedEmail({ email: user.email, fullName: user.fullName }).catch(() => {});

    res.json({ message: "KYC submitted for review" });
  } catch (err) {
    req.log.error({ err }, "Submit KYC error");
    res.status(500).json({ error: "server_error", message: "Failed to submit KYC" });
  }
});

router.get("/status", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    const docs = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId));
    const hasIdFront = docs.some(d => d.side === "front");
    const hasIdBack = docs.some(d => d.side === "back");

    const completedSteps: string[] = [];
    if (user.investmentPreferences && user.investmentPreferences.length > 0) completedSteps.push("preferences");
    if (user.legalName) completedSteps.push("profile");
    if (user.country) completedSteps.push("country");
    if (hasIdFront) completedSteps.push("id_front");
    if (hasIdBack) completedSteps.push("id_back");
    if (user.selfieStatus !== "not_submitted") completedSteps.push("selfie");

    res.json({
      currentStep: user.onboardingStep,
      totalSteps: 8,
      kycStatus: user.kycStatus,
      completedSteps,
      investmentPreferences: user.investmentPreferences ?? null,
      hasProfilePhoto: !!user.profilePhotoUrl,
      hasIdFront,
      hasIdBack,
      hasSelfie: user.selfieStatus !== "not_submitted",
    });
  } catch (err) {
    req.log.error({ err }, "Get onboarding status error");
    res.status(500).json({ error: "server_error", message: "Failed to get status" });
  }
});

export default router;
