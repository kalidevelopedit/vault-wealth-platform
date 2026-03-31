import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { newsTable, assetsTable } from "@workspace/db/schema";
import { desc, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const news = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)).limit(limit);
    res.json(news.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary ?? null,
      source: n.source,
      url: n.url,
      imageUrl: n.imageUrl ?? null,
      publishedAt: n.publishedAt.toISOString(),
      category: n.category ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get news error");
    res.status(500).json({ error: "server_error", message: "Failed to get news" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const allAssets = await db.select().from(assetsTable);
    const sorted = [...allAssets].sort((a, b) => parseFloat(b.changePercent24h) - parseFloat(a.changePercent24h));
    const topGainers = sorted.slice(0, 5).filter(a => parseFloat(a.changePercent24h) > 0);
    const topLosers = sorted.slice(-5).reverse().filter(a => parseFloat(a.changePercent24h) < 0);
    const trending = sorted.slice(0, 8);

    const mapAsset = (a: any) => ({
      symbol: a.symbol,
      name: a.name,
      assetType: a.assetType,
      currentPrice: parseFloat(a.currentPrice),
      change24h: parseFloat(a.change24h),
      changePercent24h: parseFloat(a.changePercent24h),
      marketCap: a.marketCap ? parseFloat(a.marketCap) : null,
      logoUrl: a.logoUrl ?? null,
    });

    res.json({
      topGainers: topGainers.map(mapAsset),
      topLosers: topLosers.map(mapAsset),
      trending: trending.map(mapAsset),
    });
  } catch (err) {
    req.log.error({ err }, "Get market summary error");
    res.status(500).json({ error: "server_error", message: "Failed to get market summary" });
  }
});

export default router;
