import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { assetsTable, priceHistoryTable } from "@workspace/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/list", async (req, res) => {
  try {
    const type = req.query.type as string | undefined;
    let query = db.select().from(assetsTable);
    const assets = type
      ? await db.select().from(assetsTable).where(eq(assetsTable.assetType, type as any))
      : await db.select().from(assetsTable);

    res.json(assets.map(a => ({
      symbol: a.symbol,
      name: a.name,
      assetType: a.assetType,
      currentPrice: parseFloat(a.currentPrice),
      change24h: parseFloat(a.change24h),
      changePercent24h: parseFloat(a.changePercent24h),
      marketCap: a.marketCap ? parseFloat(a.marketCap) : null,
      logoUrl: a.logoUrl ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "List assets error");
    res.status(500).json({ error: "server_error", message: "Failed to list assets" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q as string) ?? "";
    const type = req.query.type as string | undefined;
    if (!q) {
      res.status(400).json({ error: "validation_error", message: "Query required" });
      return;
    }
    let assets;
    if (type) {
      assets = await db.select().from(assetsTable).where(
        and(
          eq(assetsTable.assetType, type as any),
          or(
            ilike(assetsTable.symbol, `%${q}%`),
            ilike(assetsTable.name, `%${q}%`)
          )
        )
      );
    } else {
      assets = await db.select().from(assetsTable).where(
        or(
          ilike(assetsTable.symbol, `%${q}%`),
          ilike(assetsTable.name, `%${q}%`)
        )
      );
    }

    res.json(assets.map(a => ({
      symbol: a.symbol,
      name: a.name,
      assetType: a.assetType,
      currentPrice: parseFloat(a.currentPrice),
      change24h: parseFloat(a.change24h),
      changePercent24h: parseFloat(a.changePercent24h),
      marketCap: a.marketCap ? parseFloat(a.marketCap) : null,
      logoUrl: a.logoUrl ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Search assets error");
    res.status(500).json({ error: "server_error", message: "Failed to search assets" });
  }
});

router.get("/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
    if (!asset) {
      res.status(404).json({ error: "not_found", message: "Asset not found" });
      return;
    }
    res.json({
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      currentPrice: parseFloat(asset.currentPrice),
      change24h: parseFloat(asset.change24h),
      changePercent24h: parseFloat(asset.changePercent24h),
      high24h: asset.high24h ? parseFloat(asset.high24h) : parseFloat(asset.currentPrice) * 1.03,
      low24h: asset.low24h ? parseFloat(asset.low24h) : parseFloat(asset.currentPrice) * 0.97,
      volume24h: asset.volume24h ? parseFloat(asset.volume24h) : parseFloat(asset.currentPrice) * 1000000,
      marketCap: asset.marketCap ? parseFloat(asset.marketCap) : null,
      description: asset.description ?? null,
      exchange: asset.exchange ?? null,
      lastUpdated: asset.updatedAt.toISOString(),
      logoUrl: asset.logoUrl ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Get asset detail error");
    res.status(500).json({ error: "server_error", message: "Failed to get asset" });
  }
});

router.get("/:symbol/chart", async (req, res) => {
  try {
    const { symbol } = req.params;
    const period = (req.query.period as string) ?? "1w";
    const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.symbol, symbol.toUpperCase())).limit(1);
    if (!asset) {
      res.status(404).json({ error: "not_found", message: "Asset not found" });
      return;
    }

    const currentPrice = parseFloat(asset.currentPrice);
    const now = new Date();
    let points: number;
    let startDate: Date;
    switch (period) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); points = 24; break;
      case "1w": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); points = 28; break;
      case "1m": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); points = 30; break;
      case "1y": startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); points = 52; break;
      default: startDate = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000); points = 36;
    }

    const data = [];
    const rangeMs = now.getTime() - startDate.getTime();
    for (let i = 0; i < points; i++) {
      const t = startDate.getTime() + (rangeMs * i) / (points - 1);
      const d = new Date(t);
      const progress = i / (points - 1);
      const noise = Math.sin(i * 1.7 + symbol.charCodeAt(0)) * 0.12 + Math.sin(i * 0.4) * 0.06;
      const trend = 0.7 + 0.3 * progress;
      const value = currentPrice * trend * (1 + noise * (1 - progress * 0.5));
      data.push({
        date: d.toISOString().split("T")[0],
        value: Math.round(Math.max(value, currentPrice * 0.3) * 100) / 100,
      });
    }
    data[data.length - 1].value = currentPrice;

    res.json({ symbol, period, data });
  } catch (err) {
    req.log.error({ err }, "Get asset chart error");
    res.status(500).json({ error: "server_error", message: "Failed to get chart data" });
  }
});

export default router;
