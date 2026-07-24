import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wealthBuilderInvestmentsTable, usersTable, activityLogTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { simulateWealthBuilder, wealthBuilderCurrentValue } from "../lib/wealth-sim";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

export const WEALTH_TIERS = [
  { level: "bronze",   label: "Bronze",   minAmount: 500,    maxAmount: 2500,   apy24h: 1,   apy7d: 3,  apy14d: 7,  color: "#cd7f32", icon: "🥉" },
  { level: "silver",   label: "Silver",   minAmount: 2500,   maxAmount: 10000,  apy24h: 1.5, apy7d: 5,  apy14d: 11, color: "#c0c0c0", icon: "🥈" },
  { level: "gold",     label: "Gold",     minAmount: 10000,  maxAmount: 50000,  apy24h: 2,   apy7d: 7,  apy14d: 16, color: "#ffd700", icon: "🥇" },
  { level: "platinum", label: "Platinum", minAmount: 50000,  maxAmount: 250000, apy24h: 3,   apy7d: 10, apy14d: 22, color: "#e5e4e2", icon: "💎" },
  { level: "titanium", label: "Titanium", minAmount: 250000, maxAmount: null,   apy24h: 4,   apy7d: 14, apy14d: 30, color: "#a8d8ea", icon: "🚀" },
];

router.get("/plans", requireAuth, (_req, res) => {
  res.json(WEALTH_TIERS);
});

router.get("/investments", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const investments = await db.select()
      .from(wealthBuilderInvestmentsTable)
      .where(eq(wealthBuilderInvestmentsTable.userId, userId))
      .orderBy(desc(wealthBuilderInvestmentsTable.createdAt));

    const now = new Date();
    const mapped = investments.map(inv => {
      const isMatured = new Date(inv.maturesAt) <= now;
      if (isMatured && inv.status === "active") {
        db.update(wealthBuilderInvestmentsTable)
          .set({ status: "matured" })
          .where(eq(wealthBuilderInvestmentsTable.id, inv.id))
          .catch(() => {});
      }
      const principal = parseFloat(inv.amount);
      const isSettled = inv.status === "withdrawn";
      const currentValue = isSettled
        ? principal + parseFloat(inv.expectedReturn)
        : wealthBuilderCurrentValue(inv, now);
      return {
        id: inv.id,
        level: inv.level,
        amount: principal,
        durationDays: inv.durationDays,
        apyPercent: parseFloat(inv.apyPercent),
        expectedReturn: parseFloat(inv.expectedReturn),
        currentValue: Math.round(currentValue * 100) / 100,
        pnl: Math.round((currentValue - principal) * 100) / 100,
        pnlPercent: principal > 0 ? Math.round(((currentValue - principal) / principal) * 10000) / 100 : 0,
        startedAt: inv.startedAt.toISOString(),
        maturesAt: inv.maturesAt.toISOString(),
        status: isMatured && inv.status === "active" ? "matured" : inv.status,
        withdrawnAt: inv.withdrawnAt?.toISOString() ?? null,
      };
    });

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Get wealth builder investments error");
    res.status(500).json({ error: "server_error", message: "Failed to get investments" });
  }
});

router.get("/investments/:id/performance", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const invId = parseInt(req.params.id);
  try {
    const [inv] = await db.select()
      .from(wealthBuilderInvestmentsTable)
      .where(and(
        eq(wealthBuilderInvestmentsTable.id, invId),
        eq(wealthBuilderInvestmentsTable.userId, userId),
      ));
    if (!inv) {
      res.status(404).json({ error: "not_found", message: "Investment not found" });
      return;
    }

    const sim = simulateWealthBuilder(inv);
    const principal = parseFloat(inv.amount);
    res.json({
      id: inv.id,
      level: inv.level,
      amount: principal,
      durationDays: inv.durationDays,
      apyPercent: parseFloat(inv.apyPercent),
      expectedReturn: parseFloat(inv.expectedReturn),
      startedAt: inv.startedAt.toISOString(),
      maturesAt: inv.maturesAt.toISOString(),
      status: inv.status,
      currentValue: sim.currentValue,
      pnl: sim.pnl,
      pnlPercent: sim.pnlPercent,
      series: sim.series,
      trades: sim.trades,
    });
  } catch (err) {
    req.log.error({ err }, "Wealth builder performance error");
    res.status(500).json({ error: "server_error", message: "Failed to get performance" });
  }
});

router.post("/invest", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { level, amount, durationDays } = req.body;

    const tier = WEALTH_TIERS.find(t => t.level === level);
    if (!tier) {
      res.status(400).json({ error: "invalid_tier", message: "Invalid investment tier" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < tier.minAmount) {
      res.status(400).json({ error: "invalid_amount", message: `Minimum investment for ${tier.label} is $${tier.minAmount.toLocaleString()}` });
      return;
    }
    if (tier.maxAmount && parsedAmount > tier.maxAmount) {
      res.status(400).json({ error: "invalid_amount", message: `Maximum investment for ${tier.label} is $${tier.maxAmount.toLocaleString()}` });
      return;
    }

    const days = parseInt(durationDays);
    if (days !== 1 && days !== 7 && days !== 14) {
      res.status(400).json({ error: "invalid_duration", message: "Duration must be 24 hours, 7 or 14 days" });
      return;
    }

    const apy = days === 1 ? tier.apy24h : days === 7 ? tier.apy7d : tier.apy14d;
    const expectedReturn = (parsedAmount * apy) / 100;

    const maturesAt = new Date();
    maturesAt.setDate(maturesAt.getDate() + days);

    // Atomic: lock the user row, check funds, deduct, and create records in one transaction
    let inv;
    try {
      inv = await db.transaction(async (tx) => {
        const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, userId)).for("update");
        if (!user) throw new Error("USER_NOT_FOUND");

        const availableCash = parseFloat(user.availableCash);
        if (availableCash < parsedAmount) throw new Error("INSUFFICIENT_FUNDS");

        const newCash = availableCash - parsedAmount;
        await tx.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

        const [created] = await tx.insert(wealthBuilderInvestmentsTable).values({
          userId,
          level: tier.level,
          amount: parsedAmount.toFixed(2),
          durationDays: days,
          apyPercent: apy.toFixed(2),
          expectedReturn: expectedReturn.toFixed(2),
          maturesAt,
          status: "active",
        }).returning();

        await tx.insert(transactionsTable).values({
          userId,
          type: "buy",
          symbol: `WB-${tier.level.toUpperCase()}`,
          name: `Wealth Builder ${tier.label} (${days === 1 ? "24h" : `${days}d`})`,
          quantity: "1",
          price: parsedAmount.toFixed(2),
          amount: parsedAmount.toFixed(2),
          status: "completed",
          notes: `Staked in Wealth Builder ${tier.label} plan, ${apy}% over ${days === 1 ? "24 hours" : `${days} days`}`,
        });

        await tx.insert(activityLogTable).values({
          userId,
          eventType: "wealth_builder_invest",
          description: `Invested $${parsedAmount.toLocaleString()} in ${tier.label} plan (${days}-day, ${apy}% return)`,
        });

        return created;
      });
    } catch (txErr: any) {
      if (txErr?.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "not_found", message: "User not found" });
        return;
      }
      if (txErr?.message === "INSUFFICIENT_FUNDS") {
        res.status(400).json({ error: "insufficient_funds", message: "Insufficient available balance" });
        return;
      }
      throw txErr;
    }

    res.status(201).json({
      id: inv.id,
      level: inv.level,
      amount: parseFloat(inv.amount),
      durationDays: inv.durationDays,
      apyPercent: parseFloat(inv.apyPercent),
      expectedReturn: parseFloat(inv.expectedReturn),
      startedAt: inv.startedAt.toISOString(),
      maturesAt: inv.maturesAt.toISOString(),
      status: inv.status,
    });
  } catch (err) {
    req.log.error({ err }, "Wealth builder invest error");
    res.status(500).json({ error: "server_error", message: "Failed to create investment" });
  }
});

router.post("/cashout/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const invId = parseInt(req.params.id);
  try {
    let result;
    try {
      result = await db.transaction(async (tx) => {
        // Lock the investment row so concurrent cashouts serialize
        const [inv] = await tx.select()
          .from(wealthBuilderInvestmentsTable)
          .where(and(eq(wealthBuilderInvestmentsTable.id, invId), eq(wealthBuilderInvestmentsTable.userId, userId)))
          .limit(1)
          .for("update");

        if (!inv) throw new Error("NOT_FOUND");

        const now = new Date();
        if (new Date(inv.maturesAt) > now) throw new Error("NOT_MATURED");
        if (inv.status === "withdrawn") throw new Error("ALREADY_WITHDRAWN");

        const principal = parseFloat(inv.amount);
        const returns = parseFloat(inv.expectedReturn);
        const total = principal + returns;

        const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, userId)).for("update");
        if (!user) throw new Error("NOT_FOUND");

        const newCash = parseFloat(user.availableCash) + total;
        await tx.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

        await tx.update(wealthBuilderInvestmentsTable).set({
          status: "withdrawn",
          withdrawnAt: now,
        }).where(eq(wealthBuilderInvestmentsTable.id, invId));

        await tx.insert(transactionsTable).values({
          userId,
          type: "sell",
          symbol: `WB-${inv.level.toUpperCase()}`,
          name: `Wealth Builder ${inv.level.charAt(0).toUpperCase() + inv.level.slice(1)} payout`,
          quantity: "1",
          price: total.toFixed(2),
          amount: total.toFixed(2),
          status: "completed",
          notes: `Wealth Builder cashout: $${principal.toFixed(2)} principal + $${returns.toFixed(2)} return`,
        });

        await tx.insert(activityLogTable).values({
          userId,
          eventType: "wealth_builder_cashout",
          description: `Cashed out ${inv.level} investment: $${principal.toFixed(2)} + $${returns.toFixed(2)} return = $${total.toFixed(2)}`,
        });

        return { principal, returns, total, newCash };
      });
    } catch (txErr: any) {
      const msg = txErr?.message;
      if (msg === "NOT_FOUND") {
        res.status(404).json({ error: "not_found", message: "Investment not found" });
        return;
      }
      if (msg === "NOT_MATURED") {
        res.status(400).json({ error: "not_matured", message: "Investment has not matured yet" });
        return;
      }
      if (msg === "ALREADY_WITHDRAWN") {
        res.status(400).json({ error: "already_withdrawn", message: "Investment already withdrawn" });
        return;
      }
      throw txErr;
    }

    res.json({
      message: "Investment cashed out successfully",
      principal: result.principal,
      returns: result.returns,
      total: result.total,
      newBalance: result.newCash,
    });
  } catch (err) {
    req.log.error({ err }, "Wealth builder cashout error");
    res.status(500).json({ error: "server_error", message: "Failed to cashout investment" });
  }
});

export default router;
