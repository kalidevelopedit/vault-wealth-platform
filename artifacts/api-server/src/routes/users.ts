import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, holdingsTable, assetsTable, transactionsTable, kycDocumentsTable } from "@workspace/db/schema";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

router.get("/profile", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      fullName: user.fullName,
      legalName: user.legalName ?? null,
      email: user.email,
      phone: user.phone,
      country: user.country,
      dateOfBirth: user.dateOfBirth ?? null,
      address: user.address ?? null,
      city: user.city ?? null,
      postalCode: user.postalCode ?? null,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      kycStatus: user.kycStatus,
      investmentPreferences: user.investmentPreferences ?? null,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get profile error");
    res.status(500).json({ error: "server_error", message: "Failed to get profile" });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { fullName, phone, address, city, postalCode, profilePhotoUrl } = req.body;
    await db.update(usersTable).set({
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(postalCode !== undefined && { postalCode }),
      ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    res.json({
      id: user.id,
      fullName: user.fullName,
      legalName: user.legalName ?? null,
      email: user.email,
      phone: user.phone,
      country: user.country,
      dateOfBirth: user.dateOfBirth ?? null,
      address: user.address ?? null,
      city: user.city ?? null,
      postalCode: user.postalCode ?? null,
      profilePhotoUrl: user.profilePhotoUrl ?? null,
      kycStatus: user.kycStatus,
      investmentPreferences: user.investmentPreferences ?? null,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "server_error", message: "Failed to update profile" });
  }
});

router.get("/balance", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id))
      .where(eq(holdingsTable.userId, userId));

    let cryptoBalance = 0, stockBalance = 0, commodityBalance = 0;
    for (const { h, a } of holdings) {
      const val = parseFloat(h.quantity) * parseFloat(a.currentPrice);
      if (a.assetType === "crypto") cryptoBalance += val;
      else if (a.assetType === "stock") stockBalance += val;
      else if (a.assetType === "commodity") commodityBalance += val;
    }

    const availableCash = parseFloat(user?.availableCash ?? "10000");
    const totalPortfolioValue = availableCash + cryptoBalance + stockBalance + commodityBalance;

    res.json({
      availableCash: Math.round(availableCash * 100) / 100,
      totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
      cryptoBalance: Math.round(cryptoBalance * 100) / 100,
      stockBalance: Math.round(stockBalance * 100) / 100,
      commodityBalance: Math.round(commodityBalance * 100) / 100,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Get balance error");
    res.status(500).json({ error: "server_error", message: "Failed to get balance" });
  }
});

router.get("/kyc-documents", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const docs = await db.select().from(kycDocumentsTable)
      .where(eq(kycDocumentsTable.userId, userId))
      .orderBy(desc(kycDocumentsTable.uploadedAt));
    res.json(docs.map(d => ({
      id: d.id,
      documentType: d.documentType,
      side: d.side,
      fileUrl: d.fileUrl,
      status: d.status,
      uploadedAt: d.uploadedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get KYC docs error");
    res.status(500).json({ error: "server_error", message: "Failed to get KYC documents" });
  }
});

export default router;
