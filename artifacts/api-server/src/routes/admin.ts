import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, holdingsTable, assetsTable, transactionsTable, kycDocumentsTable, activityLogTable } from "@workspace/db/schema";
import { eq, and, ilike, or, desc, sql, count } from "drizzle-orm";

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

    const userIds = paged.map(u => u.id);
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
      .limit(10);

    const docs = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId));

    const activity = await db.select().from(activityLogTable)
      .where(eq(activityLogTable.userId, userId))
      .orderBy(desc(activityLogTable.timestamp))
      .limit(20);

    const availableCash = parseFloat(user.availableCash);
    const totalPortfolioValue = availableCash + cryptoBalance + stockBalance + commodityBalance;

    res.json({
      user: {
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

    res.json({ message: `KYC status updated to ${status}` });
  } catch (err) {
    req.log.error({ err }, "Update KYC status error");
    res.status(500).json({ error: "server_error", message: "Failed to update KYC status" });
  }
});

export default router;
