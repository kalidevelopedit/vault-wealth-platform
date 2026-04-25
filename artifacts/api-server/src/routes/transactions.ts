import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { transactionsTable, usersTable, assetsTable, holdingsTable, activityLogTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendDepositConfirmationEmail, sendWithdrawalConfirmationEmail, sendTradeConfirmationEmail } from "../lib/email.js";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string | undefined;

    let txQuery = db.select().from(transactionsTable).where(eq(transactionsTable.userId, userId));
    if (type) {
      txQuery = db.select().from(transactionsTable).where(and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, type as any)));
    }

    const allTx = await txQuery.orderBy(desc(transactionsTable.createdAt));
    const total = allTx.length;
    const transactions = allTx.slice(offset, offset + limit);

    res.json({
      transactions: transactions.map(t => ({
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
      total,
      limit,
      offset,
    });
  } catch (err) {
    req.log.error({ err }, "Get transactions error");
    res.status(500).json({ error: "server_error", message: "Failed to get transactions" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { type, symbol, quantity, amount, fromSymbol, toSymbol } = req.body;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    const availableCash = parseFloat(user.availableCash);

    if (type === "deposit") {
      const newCash = availableCash + amount;
      await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));
      const [tx] = await db.insert(transactionsTable).values({
        userId,
        type: "deposit",
        amount: amount.toFixed(2),
        status: "completed",
      }).returning();

      await db.insert(activityLogTable).values({
        userId,
        eventType: "deposit",
        description: `Deposited $${amount.toFixed(2)}`,
      });

      sendDepositConfirmationEmail({ email: user.email, fullName: user.fullName }, amount).catch(() => {});

      res.status(201).json({
        id: tx.id, type: tx.type, symbol: null, name: null, quantity: null,
        price: null, amount: parseFloat(tx.amount), status: tx.status,
        createdAt: tx.createdAt.toISOString(), logoUrl: null,
      });
      return;
    }

    if (type === "withdraw") {
      if (availableCash < amount) {
        res.status(400).json({ error: "insufficient_funds", message: "Insufficient funds" });
        return;
      }
      const newCash = availableCash - amount;
      await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));
      const [tx] = await db.insert(transactionsTable).values({
        userId,
        type: "withdraw",
        amount: amount.toFixed(2),
        status: "completed",
      }).returning();

      await db.insert(activityLogTable).values({
        userId,
        eventType: "withdrawal",
        description: `Withdrew $${amount.toFixed(2)}`,
      });

      sendWithdrawalConfirmationEmail({ email: user.email, fullName: user.fullName }, amount).catch(() => {});

      res.status(201).json({
        id: tx.id, type: tx.type, symbol: null, name: null, quantity: null,
        price: null, amount: parseFloat(tx.amount), status: tx.status,
        createdAt: tx.createdAt.toISOString(), logoUrl: null,
      });
      return;
    }

    if (type === "buy" && symbol) {
      const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
      if (!asset) {
        res.status(404).json({ error: "not_found", message: "Asset not found" });
        return;
      }
      const price = parseFloat(asset.currentPrice);
      const qty = quantity ?? (amount / price);
      const totalCost = qty * price;

      if (availableCash < totalCost) {
        res.status(400).json({ error: "insufficient_funds", message: "Insufficient funds" });
        return;
      }

      const newCash = availableCash - totalCost;
      await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

      const [existingHolding] = await db.select().from(holdingsTable)
        .where(and(eq(holdingsTable.userId, userId), eq(holdingsTable.assetId, asset.id))).limit(1);

      if (existingHolding) {
        const existingQty = parseFloat(existingHolding.quantity);
        const existingAvg = parseFloat(existingHolding.averageCost);
        const newQty = existingQty + qty;
        const newAvg = ((existingQty * existingAvg) + (qty * price)) / newQty;
        await db.update(holdingsTable).set({
          quantity: newQty.toFixed(8),
          averageCost: newAvg.toFixed(8),
          updatedAt: new Date(),
        }).where(eq(holdingsTable.id, existingHolding.id));
      } else {
        await db.insert(holdingsTable).values({
          userId,
          assetId: asset.id,
          symbol: asset.symbol,
          quantity: qty.toFixed(8),
          averageCost: price.toFixed(8),
        });
      }

      const [tx] = await db.insert(transactionsTable).values({
        userId,
        type: "buy",
        symbol: asset.symbol,
        name: asset.name,
        quantity: qty.toFixed(8),
        price: price.toFixed(8),
        amount: totalCost.toFixed(2),
        status: "completed",
        logoUrl: asset.logoUrl,
      }).returning();

      await db.insert(activityLogTable).values({
        userId,
        eventType: "buy",
        description: `Bought ${qty.toFixed(4)} ${asset.symbol} at $${price.toFixed(2)}`,
      });

      sendTradeConfirmationEmail(
        { email: user.email, fullName: user.fullName },
        { type: "buy", symbol: asset.symbol, name: asset.name, quantity: qty, price, total: totalCost }
      ).catch(() => {});

      res.status(201).json({
        id: tx.id, type: tx.type, symbol: tx.symbol, name: tx.name,
        quantity: tx.quantity ? parseFloat(tx.quantity) : null,
        price: tx.price ? parseFloat(tx.price) : null,
        amount: parseFloat(tx.amount), status: tx.status,
        createdAt: tx.createdAt.toISOString(), logoUrl: tx.logoUrl,
      });
      return;
    }

    if (type === "sell" && symbol) {
      const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
      if (!asset) {
        res.status(404).json({ error: "not_found", message: "Asset not found" });
        return;
      }
      const price = parseFloat(asset.currentPrice);
      const [holding] = await db.select().from(holdingsTable)
        .where(and(eq(holdingsTable.userId, userId), eq(holdingsTable.assetId, asset.id))).limit(1);

      if (!holding) {
        res.status(400).json({ error: "no_holding", message: "No holding found" });
        return;
      }

      const existingQty = parseFloat(holding.quantity);
      const qty = quantity ?? (amount / price);
      if (existingQty < qty) {
        res.status(400).json({ error: "insufficient_holding", message: "Insufficient holding quantity" });
        return;
      }

      const proceeds = qty * price;
      const newCash = availableCash + proceeds;
      await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

      const newQty = existingQty - qty;
      if (newQty <= 0.000001) {
        await db.delete(holdingsTable).where(eq(holdingsTable.id, holding.id));
      } else {
        await db.update(holdingsTable).set({ quantity: newQty.toFixed(8), updatedAt: new Date() }).where(eq(holdingsTable.id, holding.id));
      }

      const [tx] = await db.insert(transactionsTable).values({
        userId,
        type: "sell",
        symbol: asset.symbol,
        name: asset.name,
        quantity: qty.toFixed(8),
        price: price.toFixed(8),
        amount: proceeds.toFixed(2),
        status: "completed",
        logoUrl: asset.logoUrl,
      }).returning();

      await db.insert(activityLogTable).values({
        userId,
        eventType: "sell",
        description: `Sold ${qty.toFixed(4)} ${asset.symbol} at $${price.toFixed(2)}`,
      });

      sendTradeConfirmationEmail(
        { email: user.email, fullName: user.fullName },
        { type: "sell", symbol: asset.symbol, name: asset.name, quantity: qty, price, total: proceeds }
      ).catch(() => {});

      res.status(201).json({
        id: tx.id, type: tx.type, symbol: tx.symbol, name: tx.name,
        quantity: tx.quantity ? parseFloat(tx.quantity) : null,
        price: tx.price ? parseFloat(tx.price) : null,
        amount: parseFloat(tx.amount), status: tx.status,
        createdAt: tx.createdAt.toISOString(), logoUrl: tx.logoUrl,
      });
      return;
    }

    const [tx] = await db.insert(transactionsTable).values({
      userId,
      type: type as any,
      symbol: symbol ?? null,
      amount: amount.toFixed(2),
      status: "completed",
    }).returning();

    res.status(201).json({
      id: tx.id, type: tx.type, symbol: tx.symbol ?? null, name: null, quantity: null,
      price: null, amount: parseFloat(tx.amount), status: tx.status,
      createdAt: tx.createdAt.toISOString(), logoUrl: null,
    });
  } catch (err) {
    req.log.error({ err }, "Create transaction error");
    res.status(500).json({ error: "server_error", message: "Failed to create transaction" });
  }
});

// ── Pending deposit / withdraw request (submitted by user, fulfilled by admin) ─
router.post("/request", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { type, amount, name, details } = req.body;

    if (!type || !amount || !["deposit", "withdraw"].includes(type)) {
      res.status(400).json({ error: "validation_error", message: "type (deposit|withdraw) and amount required" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: "validation_error", message: "Amount must be a positive number" });
      return;
    }

    // For withdrawals, check they have enough balance
    if (type === "withdraw") {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
      if (!user || parseFloat(user.availableCash) < parsedAmount) {
        res.status(400).json({ error: "insufficient_funds", message: "Insufficient available balance" });
        return;
      }
    }

    const [tx] = await db.insert(transactionsTable).values({
      userId,
      type: type as any,
      amount: parsedAmount.toFixed(2),
      name: name ?? (type === "deposit" ? "Deposit Request" : "Withdrawal Request"),
      status: "pending",
    }).returning();

    await db.insert(activityLogTable).values({
      userId,
      eventType: type === "deposit" ? "deposit_requested" : "withdrawal_requested",
      description: `User submitted ${type} request for $${parsedAmount.toFixed(2)}${details ? ` — ${details}` : ""}`,
    });

    res.status(201).json({
      id: tx.id,
      type: tx.type,
      amount: parseFloat(tx.amount),
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
      message: "Your request has been submitted. We will process it shortly.",
    });
  } catch (err) {
    req.log.error({ err }, "Submit request error");
    res.status(500).json({ error: "server_error", message: "Failed to submit request" });
  }
});

export default router;
