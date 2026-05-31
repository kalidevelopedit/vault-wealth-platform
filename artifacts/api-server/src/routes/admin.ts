import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, holdingsTable, assetsTable, transactionsTable, kycDocumentsTable, activityLogTable, adminSettingsTable } from "@workspace/db/schema";
import { eq, and, ilike, or, desc, sql, count } from "drizzle-orm";
import crypto from "crypto";
import {
  sendApplicationReceivedEmail,
  sendWelcomeEmail,
  sendKycSubmittedEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendAccountActivatedEmail,
  sendForgotPinEmail,
  sendDepositConfirmationEmail,
  sendWithdrawalConfirmationEmail,
  sendTradeConfirmationEmail,
} from "../lib/email.js";

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
        lastSetPassword: (user as any).lastSetPassword ?? null,
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

// ── Asset fuzzy search (smart lookup for admin) ──────────────────────────────
router.get("/assets/search", requireAdminSession, async (req, res) => {
  try {
    const q = (req.query.q as string || "").toLowerCase().trim();
    if (!q) {
      const all = await db.select().from(assetsTable).orderBy(assetsTable.symbol).limit(20);
      res.json(all.map(a => ({
        id: a.id, symbol: a.symbol, name: a.name, assetType: a.assetType,
        currentPrice: parseFloat(a.currentPrice),
        change24h: parseFloat(a.changePercent24h),
      })));
      return;
    }

    // Common aliases / nicknames
    const ALIASES: Record<string, string> = {
      "bitcoin": "BTC", "btc": "BTC",
      "ethereum": "ETH", "eth": "ETH",
      "solana": "SOL", "sol": "SOL",
      "binance": "BNB", "bnb": "BNB",
      "cardano": "ADA", "ada": "ADA",
      "ripple": "XRP", "xrp": "XRP",
      "dogecoin": "DOGE", "doge": "DOGE",
      "apple": "AAPL", "aapl": "AAPL",
      "microsoft": "MSFT", "msft": "MSFT",
      "nvidia": "NVDA", "nvda": "NVDA",
      "tesla": "TSLA", "tsla": "TSLA",
      "google": "GOOGL", "alphabet": "GOOGL", "googl": "GOOGL",
      "amazon": "AMZN", "amzn": "AMZN",
      "meta": "META", "facebook": "META",
      "gold": "XAU", "xau": "XAU",
      "silver": "XAG", "xag": "XAG",
      "oil": "WTI", "crude": "WTI", "wti": "WTI",
      "s&p": "SPY", "spy": "SPY", "sp500": "SPY",
    };

    const aliasSymbol = ALIASES[q];
    const all = await db.select().from(assetsTable);

    const scored = all.map(a => {
      const sym = a.symbol.toLowerCase();
      const name = a.name.toLowerCase();
      let score = 0;
      if (sym === q || (aliasSymbol && sym === aliasSymbol.toLowerCase())) score = 100;
      else if (sym.startsWith(q)) score = 80;
      else if (name.startsWith(q)) score = 75;
      else if (sym.includes(q)) score = 50;
      else if (name.includes(q)) score = 40;
      else if (aliasSymbol && sym.includes(aliasSymbol.toLowerCase())) score = 60;
      return { asset: a, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ asset: a }) => ({
      id: a.id, symbol: a.symbol, name: a.name, assetType: a.assetType,
      currentPrice: parseFloat(a.currentPrice),
      change24h: parseFloat(a.changePercent24h),
    }));

    res.json(scored);
  } catch (err) {
    req.log.error({ err }, "Asset search error");
    res.status(500).json({ error: "server_error", message: "Failed to search assets" });
  }
});

// ── Get all pending/processing requests ──────────────────────────────────────
router.get("/pending-requests", requireAdminSession, async (req, res) => {
  try {
    const pending = await db
      .select({ t: transactionsTable, u: usersTable })
      .from(transactionsTable)
      .innerJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
      .where(sql`${transactionsTable.status} IN ('pending', 'processing')`)
      .orderBy(desc(transactionsTable.createdAt));

    res.json(pending.map(({ t, u }) => ({
      id: t.id,
      userId: t.userId,
      userFullName: u.fullName,
      userEmail: u.email,
      type: t.type,
      symbol: t.symbol ?? null,
      name: t.name ?? null,
      amount: parseFloat(t.amount),
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      notes: (t as any).notes ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Pending requests error");
    res.status(500).json({ error: "server_error", message: "Failed to get pending requests" });
  }
});

// ── Update transaction status (approve / reject) ──────────────────────────────
router.patch("/transactions/:txId/status", requireAdminSession, async (req, res) => {
  try {
    const txId = parseInt(req.params.txId);
    const { status, notes, approvalMode } = req.body;
    // approvalMode: "cash" | "invest" | "both" — only relevant for buy approvals

    if (!["completed", "pending", "processing", "failed"].includes(status)) {
      res.status(400).json({ error: "validation_error", message: "Invalid status" });
      return;
    }

    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, txId)).limit(1);
    if (!tx) {
      res.status(404).json({ error: "not_found", message: "Transaction not found" });
      return;
    }

    await db.update(transactionsTable).set({ status: status as any }).where(eq(transactionsTable.id, txId));

    // If approving a deposit, increase user cash balance
    if (status === "completed" && tx.type === "deposit") {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, tx.userId)).limit(1);
      if (user) {
        const newCash = parseFloat(user.availableCash) + parseFloat(tx.amount);
        await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, tx.userId));
      }
    }

    // Handle buy order approval with mode
    if (status === "completed" && tx.type === "buy") {
      const mode = approvalMode ?? "invest";
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, tx.userId)).limit(1);
      if (user) {
        // "cash" or "both": return the reserved funds to available cash
        if (mode === "cash" || mode === "both") {
          const restored = parseFloat(user.availableCash) + parseFloat(tx.amount);
          await db.update(usersTable).set({ availableCash: restored.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, tx.userId));
        }
        // "invest" or "both": create / update the holding
        if ((mode === "invest" || mode === "both") && tx.symbol && tx.quantity && tx.price) {
          const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, tx.symbol)).limit(1);
          if (asset) {
            const qty = parseFloat(tx.quantity);
            const price = parseFloat(tx.price);
            const [existing] = await db.select().from(holdingsTable)
              .where(and(eq(holdingsTable.userId, tx.userId), eq(holdingsTable.assetId, asset.id))).limit(1);
            if (existing) {
              const eQty = parseFloat(existing.quantity);
              const eAvg = parseFloat(existing.averageCost);
              const nQty = eQty + qty;
              const nAvg = ((eQty * eAvg) + (qty * price)) / nQty;
              await db.update(holdingsTable).set({
                quantity: nQty.toFixed(8), averageCost: nAvg.toFixed(8), updatedAt: new Date(),
              }).where(eq(holdingsTable.id, existing.id));
            } else {
              await db.insert(holdingsTable).values({
                userId: tx.userId, assetId: asset.id, symbol: asset.symbol,
                quantity: qty.toFixed(8), averageCost: price.toFixed(8),
              });
            }
          }
        }
      }
    }

    // If rejecting a buy, restore the reserved cash
    if (status === "failed" && tx.type === "buy") {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, tx.userId)).limit(1);
      if (user) {
        const restored = parseFloat(user.availableCash) + parseFloat(tx.amount);
        await db.update(usersTable).set({ availableCash: restored.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, tx.userId));
      }
    }

    // Log it
    const modeLabel = approvalMode ? ` [${approvalMode}]` : "";
    await db.insert(activityLogTable).values({
      userId: tx.userId,
      eventType: "transaction_status_updated",
      description: `Admin updated transaction #${txId} to ${status}${modeLabel}${notes ? `: ${notes}` : ""}`,
    });

    res.json({ message: `Transaction status updated to ${status}` });
  } catch (err) {
    req.log.error({ err }, "Update transaction status error");
    res.status(500).json({ error: "server_error", message: "Failed to update transaction status" });
  }
});

// Add or update a user holding (asset position)
router.post("/users/:userId/assets", requireAdminSession, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { symbol, quantity, usdAmount, averageCost } = req.body;

    if (!symbol || (quantity === undefined && usdAmount === undefined)) {
      res.status(400).json({ error: "validation_error", message: "symbol and quantity (or usdAmount) required" });
      return;
    }

    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
    if (!asset) {
      res.status(404).json({ error: "not_found", message: `Asset symbol ${symbol} not found` });
      return;
    }

    const currentPrice = parseFloat(asset.currentPrice);
    const cost = parseFloat(averageCost ?? asset.currentPrice);
    // If usdAmount provided, compute quantity from current price
    const qty = usdAmount !== undefined
      ? parseFloat(usdAmount) / currentPrice
      : parseFloat(quantity);

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
    const { type, amount, name, symbol, notes, status,
            bankName, bankAccount, bankRouting, bankIban, bankSwift, bankRef,
            cryptoAddress, cryptoNetwork, cryptoTxHash } = req.body;

    if (!type || !amount) {
      res.status(400).json({ error: "validation_error", message: "type and amount required" });
      return;
    }

    // Map any extended type to a valid DB enum value
    const typeToDbType: Record<string, string> = {
      deposit: "deposit", withdraw: "withdraw", buy: "buy", sell: "sell", convert: "convert",
      bank_withdrawal: "withdraw", crypto_withdrawal: "withdraw",
      fee: "withdraw", bonus: "deposit",
    };
    const dbType = typeToDbType[type] ?? "withdraw";

    // Build descriptive name including extra details
    const detailsSuffix = type === "bank_withdrawal" && bankName
      ? ` — ${bankName}${bankAccount ? " ··" + bankAccount.slice(-4) : ""}${bankSwift ? " SWIFT:" + bankSwift : ""}${bankIban ? " IBAN:" + bankIban : ""}${bankRef ? " Ref:" + bankRef : ""}`
      : type === "crypto_withdrawal" && cryptoAddress
      ? ` — ${cryptoNetwork || "ERC-20"}: ${cryptoAddress.slice(0, 8)}…${cryptoAddress.slice(-6)}`
      : "";
    const txName = (name || type) + detailsSuffix;

    await db.insert(transactionsTable).values({
      userId,
      type: dbType as any,
      amount: parseFloat(amount).toFixed(2),
      name: txName,
      symbol: symbol ?? null,
      status: (status ?? "completed") as any,
    });

    const logDesc = `Admin recorded ${type} of $${parseFloat(amount).toFixed(2)}${name ? ` (${name})` : ""}${notes ? `: ${notes}` : ""}${detailsSuffix}`;
    await db.insert(activityLogTable).values({
      userId,
      eventType: "transaction_added",
      description: logDesc,
    });

    res.json({ message: "Activity record added successfully" });
  } catch (err) {
    req.log.error({ err }, "Add transaction error");
    res.status(500).json({ error: "server_error", message: "Failed to add transaction" });
  }
});

router.post("/test-email", requireAdminSession, async (req: any, res: any) => {
  const { template, email, name } = req.body;
  const recipient = { email: email ?? "demo@vestplatform.com", fullName: name ?? "Test User" };

  try {
    switch (template) {
      case "application_received":
        await sendApplicationReceivedEmail({ ...recipient, applicationNumber: "VW-TEST-001" });
        break;
      case "welcome":
        await sendWelcomeEmail(recipient);
        break;
      case "kyc_submitted":
        await sendKycSubmittedEmail(recipient);
        break;
      case "kyc_approved":
        await sendKycApprovedEmail(recipient);
        break;
      case "kyc_rejected":
        await sendKycRejectedEmail(recipient, "Document image was blurry or unreadable.");
        break;
      case "account_activated":
        await sendAccountActivatedEmail({ ...recipient, tempPassword: "DEMO-1234" });
        break;
      case "forgot_pin":
        await sendForgotPinEmail({ ...recipient, tempPassword: "RESET-5678" });
        break;
      case "deposit":
        await sendDepositConfirmationEmail(recipient, 5000);
        break;
      case "withdrawal":
        await sendWithdrawalConfirmationEmail(recipient, 2500);
        break;
      case "trade":
        await sendTradeConfirmationEmail(recipient, {
          type: "buy", symbol: "BTC", name: "Bitcoin",
          quantity: 0.05, price: 65000, total: 3250,
        });
        break;
      default:
        res.status(400).json({ error: "unknown_template", message: `Unknown template: ${template}` });
        return;
    }
    res.json({ ok: true, message: `Test email "${template}" dispatched to ${recipient.email}` });
  } catch (err: any) {
    req.log.error({ err }, "Test email error");
    res.status(500).json({ error: "send_failed", message: err?.message ?? "Email send failed" });
  }
});

// ── One-time batch test-email sender (passcode in body, no session needed) ──
router.post("/send-test-batch", async (req: any, res: any) => {
  const { passcode, recipients } = req.body;
  if (!passcode || passcode !== ADMIN_PASSCODE) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({ error: "recipients required" });
    return;
  }

  const results: any[] = [];
  for (const { email, fullName } of recipients) {
    const r = { email, fullName };
    const appNo = `VW-TEST-${Math.floor(Math.random() * 90000) + 10000}`;
    const templates = [
      { label: "welcome", fn: () => sendWelcomeEmail(r) },
      { label: "application_received", fn: () => sendApplicationReceivedEmail({ ...r, applicationNumber: appNo }) },
      { label: "kyc_submitted", fn: () => sendKycSubmittedEmail(r) },
      { label: "kyc_approved", fn: () => sendKycApprovedEmail(r) },
      { label: "kyc_rejected", fn: () => sendKycRejectedEmail(r, "Document image was blurry. Please re-upload.") },
      { label: "account_activated", fn: () => sendAccountActivatedEmail({ ...r, tempPassword: "DEMO-4821" }) },
      { label: "deposit", fn: () => sendDepositConfirmationEmail(r, 25000) },
      { label: "withdrawal", fn: () => sendWithdrawalConfirmationEmail(r, 5000) },
      { label: "trade", fn: () => sendTradeConfirmationEmail(r, { type: "buy" as any, symbol: "BTC", name: "Bitcoin", quantity: 0.1, price: 65000, total: 6500 }) },
    ];
    for (const t of templates) {
      try {
        await t.fn();
        results.push({ email, template: t.label, ok: true });
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (err: any) {
        results.push({ email, template: t.label, ok: false, error: err?.message });
      }
    }
  }
  res.json({ ok: true, results });
});

// ── Set / Reset User Password ──────────────────────────────────────────────
router.patch("/users/:userId/password", requireAdminSession, async (req, res) => {
  const userId = Number(req.params.userId);
  const { password } = req.body;
  if (!password || String(password).length < 6) {
    res.status(400).json({ error: "invalid", message: "Password must be at least 6 characters" });
    return;
  }
  try {
    const newHash = hashPassword(String(password));
    await db.update(usersTable).set({
      passwordHash: newHash,
      lastSetPassword: String(password),
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));
    await db.insert(activityLogTable).values({
      userId, eventType: "password_reset", description: "Password reset by admin",
    });
    res.json({ ok: true, message: "Password updated" });
  } catch (err: any) {
    res.status(500).json({ error: "server_error", message: "Failed to update password" });
  }
});

// ── Email preview HTML ─────────────────────────────────────────────────────
router.get("/email-preview/:template", requireAdminSession, (req, res) => {
  const { template } = req.params;

  const LOGO_SRC = "https://20c145d0-7ea9-42f0-b115-f223a4c4ea88-00-2rfqdxecvl3ty.kirk.replit.dev/investment-platform/logo-dark.png";
  const DEMO_NAME = "James Harrison";
  const DEMO_FIRST = "James";
  const DEMO_APP = "APP-294710";

  const header = `
    <tr><td style="background:#0d1520;padding:28px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><img src="${LOGO_SRC}" alt="Vault Wealth" height="30" style="display:block;"></td>
        <td align="right" style="vertical-align:middle;"><span style="color:#8b9aae;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Institutional Investment</span></td>
      </tr></table>
    </td></tr>`;

  const wrap = (content: string) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 16px;"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e5ea;">
  ${header}${content}
  <tr><td style="background:#f8f9fb;padding:24px 40px;border-top:1px solid #e2e5ea;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8b9aae;">Vault Wealth · Institutional Investment · support@intbrokers.app</p>
  </td></tr>
  </table></td></tr></table></body></html>`;

  const TEMPLATES: Record<string, string> = {
    application_received: wrap(`
      <tr><td style="background:#0a3d2e;padding:14px 40px;">
        <span style="color:#bbf7d0;font-size:13px;font-weight:600;">✓ Application Successfully Received · Ref: ${DEMO_APP}</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <p style="margin:0 0 4px;font-size:11px;color:#8b9aae;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Dear ${DEMO_FIRST},</p>
        <h1 style="margin:8px 0 20px;font-size:26px;font-weight:700;color:#0d1520;line-height:1.25;letter-spacing:-0.5px;">Your application has<br>been received.</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Thank you for applying to open an account with <strong>Vault Wealth</strong>. Our compliance team has begun the review process and will contact you within 2 business days.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Applicant Name</td><td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;">${DEMO_NAME}</td></tr></table></td></tr>
          <tr><td style="padding:16px 24px;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Reference Number</td><td style="font-size:13px;color:#0d1520;font-weight:700;text-align:right;font-family:monospace;">${DEMO_APP}</td></tr></table></td></tr>
        </table>
      </td></tr>`),

    welcome: wrap(`
      <tr><td style="padding:48px 40px 36px;text-align:center;">
        <div style="width:64px;height:64px;background:#eef2ff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <span style="font-size:28px;">👋</span>
        </div>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Welcome to Vault Wealth</h1>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#4a5568;max-width:420px;margin-left:auto;margin-right:auto;">Your account has been created. Complete your KYC to unlock full access to trading, deposits, and withdrawals.</p>
        <a href="#" style="display:inline-block;background:#2563ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Get Started →</a>
      </td></tr>`),

    kyc_submitted: wrap(`
      <tr><td style="background:#fffbeb;padding:14px 40px;border-left:4px solid #f59e0b;">
        <span style="color:#92400e;font-size:13px;font-weight:600;">⏳ KYC Under Review</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0d1520;">Documents under review</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Thank you, ${DEMO_FIRST}. Your identity verification documents have been received and are now being reviewed by our compliance team. This typically takes 1–2 business days.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <tr><td style="font-size:14px;color:#92400e;font-weight:500;">You will be notified via email once the review is complete. No action is required from you at this time.</td></tr>
        </table>
      </td></tr>`),

    kyc_approved: wrap(`
      <tr><td style="background:#0a3d2e;padding:14px 40px;">
        <span style="color:#bbf7d0;font-size:13px;font-weight:600;">✅ Identity Verification Approved</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Your account is verified</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Congratulations ${DEMO_FIRST}. Your identity has been verified and your Vault Wealth account is now fully activated. You can now trade, deposit, and withdraw.</p>
        <a href="#" style="display:inline-block;background:#2563ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Access Your Account →</a>
      </td></tr>`),

    kyc_rejected: wrap(`
      <tr><td style="background:#3b0a0a;padding:14px 40px;">
        <span style="color:#fca5a5;font-size:13px;font-weight:600;">⚠ Action Required: Verification Unsuccessful</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0d1520;">Verification unsuccessful</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4a5568;">Unfortunately we were unable to verify your identity with the documents provided. Please resubmit clearer, valid government-issued identification documents.</p>
        <a href="#" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Resubmit Documents</a>
      </td></tr>`),

    account_activated: wrap(`
      <tr><td style="background:#0a3d2e;padding:14px 40px;">
        <span style="color:#bbf7d0;font-size:13px;font-weight:600;">🔓 Account Activated — Login Details</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Your account is ready</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Your Vault Wealth account has been activated. Use the credentials below to sign in. Please change your password after first login.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Email</td><td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;">james@example.com</td></tr></table></td></tr>
          <tr><td style="padding:16px 24px;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Temporary Password</td><td style="font-size:13px;color:#0d1520;font-weight:700;text-align:right;font-family:monospace;">TEMP-8X2K9M</td></tr></table></td></tr>
        </table>
        <a href="#" style="display:inline-block;background:#2563ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Sign In →</a>
      </td></tr>`),

    forgot_pin: wrap(`
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0d1520;">Passcode Reset</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">A passcode reset was requested for your account. Use the temporary credentials below to regain access.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <tr><td style="font-size:14px;color:#0d1520;font-weight:700;font-family:monospace;letter-spacing:2px;font-size:18px;">RESET-5678</td></tr>
          <tr><td style="font-size:12px;color:#8b9aae;margin-top:6px;padding-top:8px;">Valid for 24 hours</td></tr>
        </table>
      </td></tr>`),

    deposit_confirmation: wrap(`
      <tr><td style="background:#0a3d2e;padding:14px 40px;">
        <span style="color:#bbf7d0;font-size:13px;font-weight:600;">✅ Deposit Confirmed — $5,000.00</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Deposit confirmed</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Your deposit of <strong>$5,000.00 USD</strong> has been received and credited to your account.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Amount</td><td style="font-size:14px;color:#22c55e;font-weight:700;text-align:right;font-family:monospace;">+$5,000.00</td></tr></table></td></tr>
          <tr><td style="padding:16px 24px;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Status</td><td style="font-size:13px;color:#22c55e;font-weight:600;text-align:right;">Confirmed</td></tr></table></td></tr>
        </table>
      </td></tr>`),

    withdrawal_confirmation: wrap(`
      <tr><td style="background:#1a1a2e;padding:14px 40px;">
        <span style="color:#c7d2fe;font-size:13px;font-weight:600;">📤 Withdrawal Initiated — $2,500.00</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Withdrawal initiated</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Your withdrawal of <strong>$2,500.00 USD</strong> has been submitted and is being processed.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr><td style="padding:16px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Amount</td><td style="font-size:14px;color:#0d1520;font-weight:700;text-align:right;font-family:monospace;">-$2,500.00</td></tr></table></td></tr>
          <tr><td style="padding:16px 24px;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Status</td><td style="font-size:13px;color:#f59e0b;font-weight:600;text-align:right;">Processing (1–3 days)</td></tr></table></td></tr>
        </table>
      </td></tr>`),

    trade_confirmation: wrap(`
      <tr><td style="background:#0a3d2e;padding:14px 40px;">
        <span style="color:#bbf7d0;font-size:13px;font-weight:600;">✅ Trade Confirmed — Bought 0.05 BTC</span>
      </td></tr>
      <tr><td style="padding:40px 40px 32px;">
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#0d1520;">Trade executed</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4a5568;">Your order to <strong>buy 0.05 BTC</strong> has been executed successfully.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border:1px solid #e2e5ea;border-radius:12px;overflow:hidden;margin-bottom:28px;">
          <tr><td style="padding:14px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Asset</td><td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;">Bitcoin (BTC)</td></tr></table></td></tr>
          <tr><td style="padding:14px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Quantity</td><td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;font-family:monospace;">0.05 BTC</td></tr></table></td></tr>
          <tr><td style="padding:14px 24px;border-bottom:1px solid #e2e5ea;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Price</td><td style="font-size:13px;color:#0d1520;font-weight:600;text-align:right;font-family:monospace;">$65,000.00</td></tr></table></td></tr>
          <tr><td style="padding:14px 24px;"><table width="100%"><tr><td style="font-size:13px;color:#8b9aae;">Total</td><td style="font-size:14px;color:#22c55e;font-weight:700;text-align:right;font-family:monospace;">$3,250.00</td></tr></table></td></tr>
        </table>
      </td></tr>`),
  };

  const html = TEMPLATES[template];
  if (!html) {
    res.status(404).json({ error: "not_found", message: `Template '${template}' not found` });
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.send(html);
});

/* ── Admin Settings ── */
router.get("/settings", requireAdminSession, async (req, res) => {
  try {
    const rows = await db.select().from(adminSettingsTable);
    const obj: Record<string, string> = {};
    for (const r of rows) {
      if (r.key && r.value != null) obj[r.key] = r.value;
    }
    res.json(obj);
  } catch (err) {
    req.log.error({ err }, "Get settings error");
    res.status(500).json({ error: "server_error", message: "Failed to get settings" });
  }
});

router.patch("/settings", requireAdminSession, async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await db.insert(adminSettingsTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value, updatedAt: new Date() } });
    }
    res.json({ message: "Settings updated" });
  } catch (err) {
    req.log.error({ err }, "Update settings error");
    res.status(500).json({ error: "server_error", message: "Failed to update settings" });
  }
});

export default router;
