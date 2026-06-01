import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, holdingsTable, assetsTable, transactionsTable } from "@workspace/db/schema";
import { eq, and, sql, gte, desc } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
    return;
  }
  next();
}

router.get("/summary", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id))
      .where(eq(holdingsTable.userId, userId));

    let totalInvested = 0;
    let totalCurrentValue = 0;
    for (const { h, a } of holdings) {
      const qty = parseFloat(h.quantity);
      const cost = parseFloat(h.averageCost);
      const price = parseFloat(a.currentPrice);
      totalInvested += qty * cost;
      totalCurrentValue += qty * price;
    }

    const availableCash = parseFloat(user?.availableCash ?? "0");
    const totalAssets = totalCurrentValue + availableCash;
    const totalReturn = totalCurrentValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const dayChange = totalCurrentValue * 0.0043;
    const dayChangePercentage = 0.43;

    res.json({
      totalAssets: Math.round(totalAssets * 100) / 100,
      availableCash: Math.round(availableCash * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      returnPercentage: Math.round(returnPercentage * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      dayChange: Math.round(dayChange * 100) / 100,
      dayChangePercentage: Math.round(dayChangePercentage * 100) / 100,
    });
  } catch (err) {
    req.log.error({ err }, "Portfolio summary error");
    res.status(500).json({ error: "server_error", message: "Failed to get portfolio summary" });
  }
});

router.get("/performance", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const period = (req.query.period as string) ?? "all";
  try {
    const now = new Date();
    let startDate: Date;
    let points: number;
    switch (period) {
      case "ytd":
        startDate = new Date(now.getFullYear(), 0, 1);
        points = 12;
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        points = 12;
        break;
      case "3y":
        startDate = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
        points = 12;
        break;
      default:
        startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
        points = 20;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id))
      .where(eq(holdingsTable.userId, userId));

    let currentValue = parseFloat(user?.availableCash ?? "0");
    for (const { h, a } of holdings) {
      currentValue += parseFloat(h.quantity) * parseFloat(a.currentPrice);
    }

    const data = [];
    const rangeMs = now.getTime() - startDate.getTime();
    for (let i = 0; i < points; i++) {
      const t = startDate.getTime() + (rangeMs * i) / (points - 1);
      const d = new Date(t);
      const progress = i / (points - 1);
      const noise = (Math.sin(i * 2.3) * 0.08 + Math.sin(i * 0.7) * 0.05 + 1) * 0.5 + 0.5;
      const value = currentValue * (0.6 + 0.4 * progress) * (0.92 + noise * 0.08);
      data.push({
        date: d.toISOString().split("T")[0],
        value: Math.round(value * 100) / 100,
      });
    }
    data[data.length - 1].value = Math.round(currentValue * 100) / 100;

    res.json({
      period,
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
      data,
    });
  } catch (err) {
    req.log.error({ err }, "Portfolio performance error");
    res.status(500).json({ error: "server_error", message: "Failed to get performance" });
  }
});

router.get("/holdings", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id))
      .where(eq(holdingsTable.userId, userId));

    const result = holdings.map(({ h, a }) => {
      const qty = parseFloat(h.quantity);
      const avgCost = parseFloat(h.averageCost);
      const currentPrice = parseFloat(a.currentPrice);
      const currentValue = qty * currentPrice;
      const costBasis = qty * avgCost;
      const gainLoss = currentValue - costBasis;
      const gainLossPercentage = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return {
        id: h.id,
        symbol: a.symbol,
        name: a.name,
        assetType: a.assetType,
        quantity: qty,
        averageCost: avgCost,
        currentPrice,
        currentValue: Math.round(currentValue * 100) / 100,
        gainLoss: Math.round(gainLoss * 100) / 100,
        gainLossPercentage: Math.round(gainLossPercentage * 100) / 100,
        logoUrl: a.logoUrl ?? null,
      };
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Holdings error");
    res.status(500).json({ error: "server_error", message: "Failed to get holdings" });
  }
});

router.get("/asset-mix", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const holdings = await db
      .select({ h: holdingsTable, a: assetsTable })
      .from(holdingsTable)
      .innerJoin(assetsTable, eq(holdingsTable.assetId, assetsTable.id))
      .where(eq(holdingsTable.userId, userId));

    const byType: Record<string, number> = { crypto: 0, stock: 0, commodity: 0 };
    let total = 0;
    for (const { h, a } of holdings) {
      const val = parseFloat(h.quantity) * parseFloat(a.currentPrice);
      byType[a.assetType] = (byType[a.assetType] ?? 0) + val;
      total += val;
    }

    const colors: Record<string, string> = {
      crypto: "#1e3a5f",
      stock: "#f59e0b",
      commodity: "#8b5cf6",
    };

    const allocations = Object.entries(byType)
      .filter(([, v]) => v > 0)
      .map(([type, value]) => ({
        assetType: type,
        percentage: total > 0 ? Math.round((value / total) * 10000) / 100 : 0,
        value: Math.round(value * 100) / 100,
        color: colors[type] ?? "#94a3b8",
      }));

    res.json({ totalValue: Math.round(total * 100) / 100, allocations });
  } catch (err) {
    req.log.error({ err }, "Asset mix error");
    res.status(500).json({ error: "server_error", message: "Failed to get asset mix" });
  }
});

router.get("/open-orders", requireAuth, async (req, res) => {
  res.json([]);
});

export default router;
