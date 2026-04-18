import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, holdingsTable, assetsTable, transactionsTable, kycDocumentsTable, activityLogTable } from "@workspace/db/schema";
import { eq, and, ilike, or, desc, sql, count } from "drizzle-orm";
import crypto from "crypto";
import { sendKycApprovedEmail, sendKycRejectedEmail, sendAccountActivatedEmail } from "../lib/email.js";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_investment_platform").digest("hex");
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const router: IRouter = Router();

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE ?? "2468";

function requireAdminSession(req: any, res: any, next: any) {
  if (!(req.session as any).isAdmin) {
    res.status(401).json({ error: "unauthorized", message: "Admin authentication required" });
    return;
  }
  next();
}

router.post("/login", async (req, res) => {
  const { passcode } = req.body;
  if (!passcode || passcode !== ADMIN_PASSCODE) {
    res.status(401).json({ error: "invalid_passcode", message: "Invalid passcode" });
    return;
  }
  (req.session as any).isAdmin = true;
  res.json({ message: "Admin authenticated" });
});

router.get("/stats", requireAdminSession, async (req, res) => {
  try {
    const allUsers = await db.select().from(usersTable);
    const totalUsers = allUsers.length;
    const verifiedUsers = allUsers.filter(u => u.kycStatus === "approved").length;
    const pendingKyc = allUsers.filter(u => u.kycStatus === "pending").length;
    const rejectedKyc = allUsers.filter(u => u.kycStatus === "rejected").length;
    const frozenUsers = allUsers.filter(u => (u as any).isFrozen).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySignups = allUsers.filter(u => u.createdAt >= today).length;

    const allHoldings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id));
    let totalAssets = 0;
    for (const { h, a } of allHoldings) {
      totalAssets += parseFloat(h.quantity) * parseFloat(a.currentPrice);
    }
    for (const u of allUsers) {
      totalAssets += parseFloat(u.availableCash);
    }

    const allTx = await db.select().from(transactionsTable);
    let totalDeposits = 0, totalWithdrawals = 0;
    for (const tx of allTx) {
      if (tx.type === "deposit") totalDeposits += parseFloat(tx.amount);
      if (tx.type === "withdraw") totalWithdrawals += parseFloat(tx.amount);
    }

    res.json({
      totalUsers,
      verifiedUsers,
      pendingKyc,
      rejectedKyc,
      frozenUsers,
      todaySignups,
      totalPlatformAssets: Math.round(totalAssets * 100) / 100,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
    });
  } catch (err) {
    req.log.error({ err }, "Admin stats error");
    res.status(500).json({ error: "server_error", message: "Failed to get stats" });
  }
});

router.get("/users", requireAdminSession, async (req, res) => {
  try {
    const { kycStatus, country, search, sortBy, limit: lim, offset: off } = req.query;
    const limit = parseInt(lim as string) || 50;
    const offset = parseInt(off as string) || 0;

    let allUsers = await db.select().from(usersTable);

    if (kycStatus) allUsers = allUsers.filter(u => u.kycStatus === kycStatus);
    if (country) allUsers = allUsers.filter(u => u.country.toLowerCase() === (country as string).toLowerCase());
    if (search) {
      const s = (search as string).toLowerCase();
      allUsers = allUsers.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }

    if (sortBy === "balance") {
      allUsers.sort((a, b) => parseFloat(b.availableCash) - parseFloat(a.availableCash));
    } else if (sortBy === "createdAt") {
      allUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === "name") {
      allUsers.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    const total = allUsers.length;
    const paged = allUsers.slice(offset, offset + limit);

    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id));
    const holdingsByUser: Record<number, typeof holdings> = {};
    for (const h of holdings) {
      if (!holdingsByUser[h.h.userId]) holdingsByUser[h.h.userId] = [];
      holdingsByUser[h.h.userId].push(h);
    }

    const allTx = await db.select().from(transactionsTable);
    const txCountByUser: Record<number, number> = {};
    for (const tx of allTx) {
      txCountByUser[tx.userId] = (txCountByUser[tx.userId] ?? 0) + 1;
    }

    const users = paged.map(u => {
      const userHoldings = holdingsByUser[u.id] ?? [];
      let totalAssets = parseFloat(u.availableCash);
      for (const { h, a } of userHoldings) {
        totalAssets += parseFloat(h.quantity) * parseFloat(a.currentPrice);
      }
      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        country: u.country,
        profilePhotoUrl: u.profilePhotoUrl ?? null,
        kycStatus: u.kycStatus,
        onboardingStep: u.onboardingStep,
        onboardingComplete: u.onboardingComplete,
        availableBalance: parseFloat(u.availableCash),
        totalAssets: Math.round(totalAssets * 100) / 100,
        holdingsCount: userHoldings.length,
        transactionCount: txCountByUser[u.id] ?? 0,
        lastActive: u.lastActive ? u.lastActive.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
        isFrozen: (u as any).isFrozen ?? false,
        frozenReason: (u as any).frozenReason ?? null,
      };
    });

    res.json({ users, total, limit, offset });
  } catch (err) {
    req.log.error({ err }, "Admin users error");
    res.status(500).json({ error: "server_error", message: "Failed to get users" });
  }
});

router.get("/users/:userId", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

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

    const recentTx = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(20);

    const docs = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId));

    const activity = await db.select().from(activityLogTable)
      .where(eq(activityLogTable.userId, userId))
      .orderBy(desc(activityLogTable.timestamp))
      .limit(30);

    const availableCash = parseFloat(user.availableCash);
    const totalPortfolioValue = availableCash + cryptoBalance + stockBalance + commodityBalance;

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        legalName: user.legalName ?? null,
        email: user.email,
        passwordHash: user.passwordHash,
        phone: user.phone,
        country: user.country,
        dateOfBirth: user.dateOfBirth ?? null,
        address: user.address ?? null,
        city: user.city ?? null,
        postalCode: user.postalCode ?? null,
        profilePhotoUrl: user.profilePhotoUrl ?? null,
        kycStatus: user.kycStatus,
        investmentPreferences: user.investmentPreferences ?? null,
        investmentPurpose: (user as any).investmentPurpose ?? null,
        investmentAmount: (user as any).investmentAmount ?? null,
        onboardingComplete: user.onboardingComplete,
        onboardingStep: user.onboardingStep,
        isFrozen: (user as any).isFrozen ?? false,
        frozenReason: (user as any).frozenReason ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      balance: {
        availableCash: Math.round(availableCash * 100) / 100,
        totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
        cryptoBalance: Math.round(cryptoBalance * 100) / 100,
        stockBalance: Math.round(stockBalance * 100) / 100,
        commodityBalance: Math.round(commodityBalance * 100) / 100,
        pendingDeposits: 0,
        pendingWithdrawals: 0,
      },
      holdings: holdings.map(({ h, a }) => {
        const qty = parseFloat(h.quantity);
        const avgCost = parseFloat(h.averageCost);
        const price = parseFloat(a.currentPrice);
        const currentValue = qty * price;
        const costBasis = qty * avgCost;
        const gainLoss = currentValue - costBasis;
        return {
          id: h.id,
          symbol: a.symbol,
          name: a.name,
          assetType: a.assetType,
          quantity: qty,
          averageCost: avgCost,
          currentPrice: price,
          currentValue: Math.round(currentValue * 100) / 100,
          gainLoss: Math.round(gainLoss * 100) / 100,
          gainLossPercentage: costBasis > 0 ? Math.round((gainLoss / costBasis) * 10000) / 100 : 0,
          logoUrl: a.logoUrl ?? null,
        };
      }),
      recentTransactions: recentTx.map(t => ({
        id: t.id,
        type: t.type,
        symbol: t.symbol ?? null,
        name: t.name ?? null,
        quantity: t.quantity ? parseFloat(t.quantity) : null,
        price: t.price ? parseFloat(t.price) : null,
        amount: parseFloat(t.amount),
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        logoUrl: t.logoUrl ?? null,
        notes: (t as any).notes ?? null,
      })),
      kycDocuments: docs.map(d => ({
        id: d.id,
        documentType: d.documentType,
        side: d.side,
        fileUrl: d.fileUrl,
        uploadedAt: d.uploadedAt.toISOString(),
        status: d.status,
      })),
      selfieStatus: user.selfieStatus,
      kycNotes: user.kycNotes ?? null,
      activityTimeline: activity.map(a => ({
        id: a.id,
        eventType: a.eventType,
        description: a.description,
        timestamp: a.timestamp.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Admin user detail error");
    res.status(500).json({ error: "server_error", message: "Failed to get user detail" });
  }
});

router.patch("/users/:userId/kyc", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, notes } = req.body;
    if (!status) {
      res.status(400).json({ error: "validation_error", message: "Status required" });
      return;
    }

    const [userBefore] = await db.select({ email: usersTable.email, fullName: usersTable.fullName })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    await db.update(usersTable).set({
      kycStatus: status,
      kycNotes: notes ?? null,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "kyc_status_changed",
      description: `KYC status changed to ${status}${notes ? `: ${notes}` : ""}`,
    });

    if (userBefore) {
      if (status === "approved") {
        const tempPassword = generateTempPassword();
        const passwordHash = hashPassword(tempPassword);
        await db.update(usersTable).set({
          passwordHash,
          mustSetPin: true,
          pinHash: null,
          updatedAt: new Date(),
        }).where(eq(usersTable.id, userId));
        sendAccountActivatedEmail({ email: userBefore.email, fullName: userBefore.fullName, tempPassword }).catch(() => {});
        sendKycApprovedEmail({ email: userBefore.email, fullName: userBefore.fullName }).catch(() => {});
      } else if (status === "rejected") {
        sendKycRejectedEmail({ email: userBefore.email, fullName: userBefore.fullName }, notes).catch(() => {});
      }
    }

    res.json({ message: `KYC status updated to ${status}` });
  } catch (err) {
    req.log.error({ err }, "Update KYC status error");
    res.status(500).json({ error: "server_error", message: "Failed to update KYC status" });
  }
});

// Freeze / Unfreeze user
router.patch("/users/:userId/freeze", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { freeze, reason } = req.body;
    const isFrozen = freeze === true;

    await db.update(usersTable).set({
      isFrozen,
      frozenReason: isFrozen ? (reason ?? "Account suspended by admin") : null,
      updatedAt: new Date(),
    } as any).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: isFrozen ? "account_frozen" : "account_unfrozen",
      description: isFrozen
        ? `Account frozen${reason ? `: ${reason}` : ""}`
        : "Account unfrozen by admin",
    });

    res.json({ message: isFrozen ? "Account frozen" : "Account unfrozen", isFrozen });
  } catch (err) {
    req.log.error({ err }, "Freeze user error");
    res.status(500).json({ error: "server_error", message: "Failed to update freeze status" });
  }
});

// Delete user
router.delete("/users/:userId", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    await db.delete(activityLogTable).where(eq(activityLogTable.userId, userId));
    await db.delete(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId));
    await db.delete(transactionsTable).where(eq(transactionsTable.userId, userId));
    await db.delete(holdingsTable).where(eq(holdingsTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Delete user error");
    res.status(500).json({ error: "server_error", message: "Failed to delete user" });
  }
});

// Update user cash balance
router.patch("/users/:userId/cash", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { amount, notes } = req.body;
    if (amount === undefined || isNaN(parseFloat(amount))) {
      res.status(400).json({ error: "validation_error", message: "Valid amount required" });
      return;
    }
    const newAmount = Math.max(0, parseFloat(amount));
    await db.update(usersTable).set({
      availableCash: newAmount.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "cash_adjusted",
      description: `Available cash set to $${newAmount.toFixed(2)}${notes ? `: ${notes}` : ""}`,
    });

    res.json({ message: "Cash balance updated", availableCash: newAmount });
  } catch (err) {
    req.log.error({ err }, "Update cash error");
    res.status(500).json({ error: "server_error", message: "Failed to update cash" });
  }
});

// Add or update a user holding (asset position)
router.post("/users/:userId/assets", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { symbol, quantity, averageCost } = req.body;

    if (!symbol || quantity === undefined) {
      res.status(400).json({ error: "validation_error", message: "symbol and quantity required" });
      return;
    }

    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
    if (!asset) {
      res.status(404).json({ error: "not_found", message: `Asset symbol ${symbol} not found` });
      return;
    }

    const qty = parseFloat(quantity);
    const cost = parseFloat(averageCost ?? asset.currentPrice);

    const [existing] = await db.select().from(holdingsTable)
      .where(and(eq(holdingsTable.userId, userId), eq(holdingsTable.assetId, asset.id)))
      .limit(1);

    if (qty <= 0) {
      // Remove holding
      if (existing) {
        await db.delete(holdingsTable).where(eq(holdingsTable.id, existing.id));
      }
      await db.insert(activityLogTable).values({
        userId, eventType: "holding_removed",
        description: `Admin removed ${symbol} from portfolio`,
      });
      res.json({ message: `${symbol} holding removed` });
      return;
    }

    if (existing) {
      await db.update(holdingsTable).set({
        quantity: qty.toFixed(8),
        averageCost: cost.toFixed(4),
        updatedAt: new Date(),
      }).where(eq(holdingsTable.id, existing.id));
    } else {
      await db.insert(holdingsTable).values({
        userId,
        assetId: asset.id,
        quantity: qty.toFixed(8),
        averageCost: cost.toFixed(4),
      });
    }

    await db.insert(activityLogTable).values({
      userId, eventType: "holding_adjusted",
      description: `Admin set ${symbol} position: ${qty} units @ $${cost.toFixed(2)}`,
    });

    res.json({ message: `${symbol} holding updated`, quantity: qty, averageCost: cost });
  } catch (err) {
    req.log.error({ err }, "Update holding error");
    res.status(500).json({ error: "server_error", message: "Failed to update holding" });
  }
});

// Add transaction to user activity
router.post("/users/:userId/transactions", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { type, amount, name, symbol, notes, status } = req.body;

    if (!type || !amount) {
      res.status(400).json({ error: "validation_error", message: "type and amount required" });
      return;
    }

    const validTypes = ["deposit", "withdraw", "buy", "sell", "bank_withdrawal", "crypto_withdrawal"];
    const txType = validTypes.includes(type) ? type : "withdraw";

    await db.insert(transactionsTable).values({
      userId,
      type: txType as any,
      amount: parseFloat(amount).toFixed(2),
      name: name ?? null,
      symbol: symbol ?? null,
      status: (status ?? "completed") as any,
    });

    await db.insert(activityLogTable).values({
      userId,
      eventType: "transaction_added",
      description: `Admin added ${txType} of $${parseFloat(amount).toFixed(2)}${name ? ` (${name})` : ""}`,
    });

    res.json({ message: "Transaction added successfully" });
  } catch (err) {
    req.log.error({ err }, "Add transaction error");
    res.status(500).json({ error: "server_error", message: "Failed to add transaction" });
  }
});

export default router;
