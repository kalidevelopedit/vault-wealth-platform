import { db } from "@workspace/db";
import { assetsTable, newsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  AVAX: "avalanche-2",
  DOGE: "dogecoin",
  DOT: "polkadot",
  LINK: "chainlink",
  MATIC: "matic-network",
  UNI: "uniswap",
  LTC: "litecoin",
  ATOM: "cosmos",
  XLM: "stellar",
  USDT: "tether",
  USDC: "usd-coin",
};

const STOCK_SEEDS: Record<string, { base: number; vol: number }> = {
  AAPL: { base: 191.50, vol: 2.5 },
  MSFT: { base: 415.30, vol: 5.0 },
  GOOGL: { base: 172.80, vol: 3.5 },
  AMZN: { base: 195.40, vol: 4.0 },
  TSLA: { base: 248.90, vol: 8.0 },
  META: { base: 510.20, vol: 7.0 },
  NVDA: { base: 875.40, vol: 15.0 },
  JPM: { base: 195.60, vol: 3.0 },
  V: { base: 275.80, vol: 3.5 },
  BAC: { base: 38.20, vol: 1.0 },
  NFLX: { base: 625.50, vol: 10.0 },
  DIS: { base: 110.30, vol: 2.5 },
};

const COMMODITY_SEEDS: Record<string, { base: number; vol: number }> = {
  GOLD: { base: 2380.50, vol: 15.0 },
  SILVER: { base: 29.40, vol: 0.5 },
  OIL: { base: 78.30, vol: 2.0 },
  GAS: { base: 2.45, vol: 0.08 },
  COPPER: { base: 4.52, vol: 0.05 },
  WHEAT: { base: 582.00, vol: 8.0 },
  CORN: { base: 435.00, vol: 6.0 },
  PLAT: { base: 985.00, vol: 12.0 },
};

let stockPrices: Record<string, number> = {};
let commodityPrices: Record<string, number> = {};

function jitter(base: number, vol: number): number {
  const move = (Math.random() - 0.5) * vol * 0.4;
  return Math.max(base * 0.5, base + move);
}

async function fetchCryptoPrices(): Promise<void> {
  try {
    const ids = Object.values(COINGECKO_IDS).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return;
    const data = await resp.json() as Record<string, any>;

    for (const [sym, cgId] of Object.entries(COINGECKO_IDS)) {
      const d = data[cgId];
      if (!d) continue;
      const price = d.usd;
      const change = d.usd_24h_change ?? 0;
      await db.update(assetsTable)
        .set({
          currentPrice: String(price),
          change24h: String(price * change / 100),
          changePercent24h: String(change.toFixed(4)),
          high24h: String(price * 1.02),
          low24h: String(price * 0.98),
          volume24h: d.usd_24h_vol ? String(d.usd_24h_vol) : null,
          marketCap: d.usd_market_cap ? String(d.usd_market_cap) : null,
          updatedAt: new Date(),
        })
        .where(eq(assetsTable.symbol, sym));
    }
  } catch {
    // silently fail if CoinGecko is unavailable
  }
}

async function updateSimulatedPrices(): Promise<void> {
  // Stocks
  for (const [sym, seed] of Object.entries(STOCK_SEEDS)) {
    const prev = stockPrices[sym] ?? seed.base;
    const next = jitter(prev, seed.vol);
    stockPrices[sym] = next;
    const changePct = ((next - seed.base) / seed.base) * 100;
    await db.update(assetsTable)
      .set({
        currentPrice: String(next.toFixed(2)),
        change24h: String((next - seed.base).toFixed(2)),
        changePercent24h: String(changePct.toFixed(4)),
        high24h: String((next * 1.015).toFixed(2)),
        low24h: String((next * 0.985).toFixed(2)),
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.symbol, sym));
  }
  // Commodities
  for (const [sym, seed] of Object.entries(COMMODITY_SEEDS)) {
    const prev = commodityPrices[sym] ?? seed.base;
    const next = jitter(prev, seed.vol);
    commodityPrices[sym] = next;
    const changePct = ((next - seed.base) / seed.base) * 100;
    await db.update(assetsTable)
      .set({
        currentPrice: String(next.toFixed(2)),
        change24h: String((next - seed.base).toFixed(2)),
        changePercent24h: String(changePct.toFixed(4)),
        high24h: String((next * 1.015).toFixed(2)),
        low24h: String((next * 0.985).toFixed(2)),
        updatedAt: new Date(),
      })
      .where(eq(assetsTable.symbol, sym));
  }
}

const NEWS_HEADLINES = [
  { title: "Bitcoin surpasses $72,000 as institutional demand accelerates", source: "CoinDesk", category: "crypto" },
  { title: "Federal Reserve signals potential rate pause amid inflation data", source: "Reuters", category: "macro" },
  { title: "NVIDIA earnings beat forecasts on AI chip demand surge", source: "Bloomberg", category: "stocks" },
  { title: "Ethereum ETF approval expected within 90 days, analysts say", source: "CryptoNews", category: "crypto" },
  { title: "Gold hits 6-month high as geopolitical tensions escalate", source: "MarketWatch", category: "commodities" },
  { title: "S&P 500 closes at record high for third consecutive week", source: "WSJ", category: "stocks" },
  { title: "Solana network processes record 65M transactions in 24 hours", source: "The Block", category: "crypto" },
  { title: "Oil prices dip on surprise inventory build", source: "Reuters", category: "commodities" },
  { title: "Apple unveils new iPhone model, stock climbs 3%", source: "CNBC", category: "stocks" },
  { title: "Tether market cap hits $115B as stablecoin adoption grows", source: "CoinTelegraph", category: "crypto" },
  { title: "Copper prices surge on China manufacturing rebound", source: "FT", category: "commodities" },
  { title: "Microsoft Azure revenue up 28% year-over-year", source: "Bloomberg", category: "stocks" },
  { title: "DeFi total value locked returns to $120B milestone", source: "DeFiPulse", category: "crypto" },
  { title: "ECB holds rates steady, euro strengthens against dollar", source: "Reuters", category: "macro" },
  { title: "XRP wins partial ruling in SEC case, token rallies 8%", source: "CoinDesk", category: "crypto" },
];

async function seedNews(): Promise<void> {
  try {
    const existing = await db.select().from(newsTable).limit(1);
    if (existing.length > 0) return;
    for (let i = 0; i < NEWS_HEADLINES.length; i++) {
      const h = NEWS_HEADLINES[i];
      await db.insert(newsTable).values({
        title: h.title,
        summary: h.title,
        source: h.source,
        url: "#",
        publishedAt: new Date(Date.now() - i * 3600000),
        category: h.category,
      }).onConflictDoNothing();
    }
  } catch {}
}

async function refreshNews(): Promise<void> {
  try {
    const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Blockchain,Trading&limit=15";
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return;
    const data = await resp.json() as any;
    if (!data?.Data?.length) return;
    for (const item of data.Data.slice(0, 10)) {
      await db.insert(newsTable).values({
        title: item.title,
        summary: item.body?.slice(0, 300) ?? item.title,
        source: item.source_info?.name ?? item.source,
        url: item.url,
        imageUrl: item.imageurl ?? null,
        publishedAt: new Date(item.published_on * 1000),
        category: "crypto",
      }).onConflictDoNothing();
    }
  } catch {
    // fall back to seeds
    await seedNews();
  }
}

export async function startPriceService(): Promise<void> {
  await seedNews();
  await fetchCryptoPrices();
  await updateSimulatedPrices();
  await refreshNews();

  setInterval(async () => {
    await fetchCryptoPrices();
    await updateSimulatedPrices();
  }, 30_000);

  setInterval(async () => {
    await refreshNews();
  }, 300_000);
}
