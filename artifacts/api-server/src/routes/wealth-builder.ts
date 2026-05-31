import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wealthBuilderInvestmentsTable, usersTable, activityLogTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

export const WEALTH_TIERS = [
  { level: "bronze",   label: "Bronze",   minAmount: 500,    maxAmount: 2500,   apy7d: 3,  apy14d: 7,  color: "#cd7f32", icon: "🥉" },
  { level: "silver",   label: "Silver",   minAmount: 2500,   maxAmount: 10000,  apy7d: 5,  apy14d: 11, color: "#c0c0c0", icon: "🥈" },
  { level: "gold",     label: "Gold",     minAmount: 10000,  maxAmount: 50000,  apy7d: 7,  apy14d: 16, color: "#ffd700", icon: "🥇" },
  { level: "platinum", label: "Platinum", minAmount: 50000,  maxAmount: 250000, apy7d: 10, apy14d: 22, color: "#e5e4e2", icon: "💎" },
  { level: "titanium", label: "Titanium", minAmount: 250000, maxAmount: null,   apy7d: 14, apy14d: 30, color: "#a8d8ea", icon: "🚀" },
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
      return {
        id: inv.id,
        level: inv.level,
        amount: parseFloat(inv.amount),
        durationDays: inv.durationDays,
        apyPercent: parseFloat(inv.apyPercent),
        expectedReturn: parseFloat(inv.expectedReturn),
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
    if (days !== 7 && days !== 14) {
      res.status(400).json({ error: "invalid_duration", message: "Duration must be 7 or 14 days" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    const availableCash = parseFloat(user.availableCash);
    if (availableCash < parsedAmount) {
      res.status(400).json({ error: "insufficient_funds", message: "Insufficient available balance" });
      return;
    }

    const apy = days === 7 ? tier.apy7d : tier.apy14d;
    const expectedReturn = (parsedAmount * apy) / 100;

    const maturesAt = new Date();
    maturesAt.setDate(maturesAt.getDate() + days);

    // Deduct from available cash
    const newCash = availableCash - parsedAmount;
    await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

    const [inv] = await db.insert(wealthBuilderInvestmentsTable).values({
      userId,
      level: tier.level,
      amount: parsedAmount.toFixed(2),
      durationDays: days,
      apyPercent: apy.toFixed(2),
      expectedReturn: expectedReturn.toFixed(2),
      maturesAt,
      status: "active",
    }).returning();

    await db.insert(activityLogTable).values({
      userId,
      eventType: "wealth_builder_invest",
      description: `Invested $${parsedAmount.toLocaleString()} in ${tier.label} plan (${days}-day, ${apy}% return)`,
    });

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
    const [inv] = await db.select()
      .from(wealthBuilderInvestmentsTable)
      .where(and(eq(wealthBuilderInvestmentsTable.id, invId), eq(wealthBuilderInvestmentsTable.userId, userId)))
      .limit(1);

    if (!inv) {
      res.status(404).json({ error: "not_found", message: "Investment not found" });
      return;
    }

    const now = new Date();
    const isMatured = new Date(inv.maturesAt) <= now;

    if (!isMatured) {
      res.status(400).json({ error: "not_matured", message: "Investment has not matured yet" });
      return;
    }

    if (inv.status === "withdrawn") {
      res.status(400).json({ error: "already_withdrawn", message: "Investment already withdrawn" });
      return;
    }

    const principal = parseFloat(inv.amount);
    const returns = parseFloat(inv.expectedReturn);
    const total = principal + returns;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "User not found" });
      return;
    }

    const newCash = parseFloat(user.availableCash) + total;
    await db.update(usersTable).set({ availableCash: newCash.toFixed(2), updatedAt: new Date() }).where(eq(usersTable.id, userId));

    await db.update(wealthBuilderInvestmentsTable).set({
      status: "withdrawn",
      withdrawnAt: now,
    }).where(eq(wealthBuilderInvestmentsTable.id, invId));

    await db.insert(activityLogTable).values({
      userId,
      eventType: "wealth_builder_cashout",
      description: `Cashed out ${inv.level} investment: $${principal.toFixed(2)} + $${returns.toFixed(2)} return = $${total.toFixed(2)}`,
    });

    res.json({
      message: "Investment cashed out successfully",
      principal,
      returns,
      total,
      newBalance: newCash,
    });
  } catch (err) {
    req.log.error({ err }, "Wealth builder cashout error");
    res.status(500).json({ error: "server_error", message: "Failed to cashout investment" });
  }
});

export default router;
