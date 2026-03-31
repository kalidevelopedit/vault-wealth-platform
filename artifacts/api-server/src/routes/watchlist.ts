import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { watchlistTable, assetsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

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
    const entries = await db.select({ w: watchlistTable, a: assetsTable })
      .from(watchlistTable)
      .innerJoin(assetsTable, eq(watchlistTable.symbol, assetsTable.symbol))
      .where(eq(watchlistTable.userId, userId));

    res.json(entries.map(({ w, a }) => ({
      id: w.id,
      symbol: a.symbol,
      name: a.name,
      assetType: a.assetType,
      currentPrice: parseFloat(a.currentPrice),
      change24h: parseFloat(a.change24h),
      changePercent24h: parseFloat(a.changePercent24h),
      logoUrl: a.logoUrl ?? null,
      addedAt: w.addedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get watchlist error");
    res.status(500).json({ error: "server_error", message: "Failed to get watchlist" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    const { symbol, assetType } = req.body;
    if (!symbol || !assetType) {
      res.status(400).json({ error: "validation_error", message: "Symbol and assetType required" });
      return;
    }
    const existing = await db.select().from(watchlistTable)
      .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, symbol.toUpperCase()))).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "already_exists", message: "Already in watchlist" });
      return;
    }
    const [entry] = await db.insert(watchlistTable).values({
      userId,
      symbol: symbol.toUpperCase(),
      assetType,
    }).returning();

    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
    res.status(201).json({
      id: entry.id,
      symbol: entry.symbol,
      name: asset?.name ?? symbol,
      assetType: entry.assetType,
      currentPrice: asset ? parseFloat(asset.currentPrice) : 0,
      change24h: asset ? parseFloat(asset.change24h) : 0,
      changePercent24h: asset ? parseFloat(asset.changePercent24h) : 0,
      logoUrl: asset?.logoUrl ?? null,
      addedAt: entry.addedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Add to watchlist error");
    res.status(500).json({ error: "server_error", message: "Failed to add to watchlist" });
  }
});

router.delete("/:symbol", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  try {
    await db.delete(watchlistTable)
      .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.symbol, req.params.symbol.toUpperCase())));
    res.json({ message: "Removed from watchlist" });
  } catch (err) {
    req.log.error({ err }, "Remove from watchlist error");
    res.status(500).json({ error: "server_error", message: "Failed to remove from watchlist" });
  }
});

export default router;
