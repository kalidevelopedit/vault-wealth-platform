import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, activityLogTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendWelcomeEmail } from "../lib/email.js";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_investment_platform").digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, country, agreedToTerms } = req.body;
    if (!fullName || !email || !password || !phone || !country || !agreedToTerms) {
      res.status(400).json({ error: "validation_error", message: "All fields are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "email_taken", message: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      fullName,
      email,
      passwordHash,
      phone,
      country,
      role: "user",
      kycStatus: "not_started",
      onboardingStep: 1,
      onboardingComplete: false,
      availableCash: "10000.00",
    }).returning();

    await db.insert(activityLogTable).values({
      userId: user.id,
      eventType: "account_created",
      description: "Account registered",
    });

    sendWelcomeEmail({ email: user.email, fullName: user.fullName }).catch(() => {});

    (req.session as any).userId = user.id;
    res.status(201).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        onboardingStep: user.onboardingStep,
        onboardingComplete: user.onboardingComplete,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      message: "Account created successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "server_error", message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "validation_error", message: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
      return;
    }
    await db.update(usersTable).set({ lastActive: new Date() }).where(eq(usersTable.id, user.id));
    await db.insert(activityLogTable).values({
      userId: user.id,
      eventType: "login",
      description: "User logged in",
    });
    (req.session as any).userId = user.id;
    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        onboardingStep: user.onboardingStep,
        onboardingComplete: user.onboardingComplete,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      message: "Logged in successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "server_error", message: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any).userId;
  if (!userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      role: user.role,
      kycStatus: user.kycStatus,
      onboardingStep: user.onboardingStep,
      onboardingComplete: user.onboardingComplete,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "server_error", message: "Failed to get user" });
  }
});

export default router;
