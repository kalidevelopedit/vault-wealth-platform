import app from "./app";
import { logger } from "./lib/logger";
import { startPriceService } from "./lib/priceService.js";
import { db } from "@workspace/db";
import { assetsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAssetsIfEmpty() {
  const existing = await db.select({ s: assetsTable.symbol }).from(assetsTable).limit(1);
  if (existing.length > 0) return;

  logger.info("Assets table empty — seeding market data…");

  const assets = [
    { symbol: "BTC",    name: "Bitcoin",          assetType: "crypto" as const,    currentPrice: "107234.50", change24h: "1823.40", changePercent24h: "1.73",  high24h: "109100.00", low24h: "105200.00", volume24h: "38500000000", marketCap: "2120000000000", description: "The original cryptocurrency and largest by market capitalisation.", exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
    { symbol: "ETH",    name: "Ethereum",          assetType: "crypto" as const,    currentPrice: "2020.92",   change24h: "8.77",    changePercent24h: "0.43",  high24h: "2100.00",  low24h: "1980.00",  volume24h: "18200000000", marketCap: "243000000000",  description: "A decentralised platform enabling smart contracts and DApps.", exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
    { symbol: "SOL",    name: "Solana",            assetType: "crypto" as const,    currentPrice: "168.42",    change24h: "3.62",    changePercent24h: "2.20",  high24h: "172.00",  low24h: "164.00",  volume24h: "4300000000",  marketCap: "78000000000",   description: "A high-performance blockchain supporting fast transactions.",  exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
    { symbol: "BNB",    name: "BNB",               assetType: "crypto" as const,    currentPrice: "722.00",    change24h: "53.85",   changePercent24h: "7.46",  high24h: "740.00",  low24h: "668.00",  volume24h: "2100000000",  marketCap: "97000000000",   description: "Native token of the Binance ecosystem.",                       exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
    { symbol: "XRP",    name: "XRP",               assetType: "crypto" as const,    currentPrice: "2.3842",    change24h: "0.042",   changePercent24h: "1.79",  high24h: "2.44",   low24h: "2.31",   volume24h: "3100000000",  marketCap: "138000000000",  description: "Digital payment protocol and native currency of Ripple.",      exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
    { symbol: "ADA",    name: "Cardano",           assetType: "crypto" as const,    currentPrice: "0.2366",    change24h: "0.0020",  changePercent24h: "0.84",  high24h: "0.2450", low24h: "0.2290", volume24h: "520000000",   marketCap: "8800000000",    description: "A proof-of-stake blockchain platform.",                        exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
    { symbol: "AVAX",   name: "Avalanche",         assetType: "crypto" as const,    currentPrice: "38.24",     change24h: "0.91",    changePercent24h: "2.44",  high24h: "39.50",  low24h: "37.10",  volume24h: "680000000",   marketCap: "16000000000",   description: "Highly scalable smart contracts platform.",                    exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
    { symbol: "DOGE",   name: "Dogecoin",          assetType: "crypto" as const,    currentPrice: "0.1926",    change24h: "0.0052",  changePercent24h: "2.77",  high24h: "0.2010", low24h: "0.1860", volume24h: "1400000000",  marketCap: "28000000000",   description: "Meme-inspired cryptocurrency with a large retail following.",  exchange: "Crypto",  logoUrl: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },

    { symbol: "AAPL",  name: "Apple Inc.",        assetType: "stock" as const,     currentPrice: "192.44",    change24h: "0.94",    changePercent24h: "0.49",  high24h: "193.90", low24h: "191.10", volume24h: "65000000",    marketCap: "2850000000000", description: "Technology company designing consumer electronics and software.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/apple.com" },
    { symbol: "MSFT",  name: "Microsoft Corp.",   assetType: "stock" as const,     currentPrice: "421.06",    change24h: "5.76",    changePercent24h: "1.39",  high24h: "424.00", low24h: "415.00", volume24h: "22000000",    marketCap: "3090000000000", description: "Multinational technology corporation producing software and cloud services.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/microsoft.com" },
    { symbol: "GOOGL", name: "Alphabet Inc.",     assetType: "stock" as const,     currentPrice: "173.61",    change24h: "0.81",    changePercent24h: "0.47",  high24h: "175.00", low24h: "172.00", volume24h: "24000000",    marketCap: "2230000000000", description: "Multinational technology conglomerate and parent company of Google.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/google.com" },
    { symbol: "AMZN",  name: "Amazon.com Inc.",   assetType: "stock" as const,     currentPrice: "192.93",    change24h: "-2.47",   changePercent24h: "-1.26", high24h: "196.00", low24h: "191.00", volume24h: "38000000",    marketCap: "2050000000000", description: "E-commerce and cloud computing giant.",                         exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/amazon.com" },
    { symbol: "TSLA",  name: "Tesla Inc.",        assetType: "stock" as const,     currentPrice: "250.48",    change24h: "1.58",    changePercent24h: "0.63",  high24h: "254.00", low24h: "248.00", volume24h: "98000000",    marketCap: "790000000000",  description: "Electric vehicles, energy storage, and solar energy company.",  exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/tesla.com" },
    { symbol: "NVDA",  name: "NVIDIA Corp.",      assetType: "stock" as const,     currentPrice: "877.18",    change24h: "1.78",    changePercent24h: "0.20",  high24h: "885.00", low24h: "870.00", volume24h: "42000000",    marketCap: "2160000000000", description: "Technology company designing GPUs and system-on-chip units.",   exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/nvidia.com" },
    { symbol: "META",  name: "Meta Platforms",    assetType: "stock" as const,     currentPrice: "506.74",    change24h: "-3.46",   changePercent24h: "-0.68", high24h: "512.00", low24h: "503.00", volume24h: "18000000",    marketCap: "1340000000000", description: "Social technology company owning Facebook, Instagram, and WhatsApp.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/meta.com" },
    { symbol: "JPM",   name: "JPMorgan Chase",    assetType: "stock" as const,     currentPrice: "212.58",    change24h: "1.23",    changePercent24h: "0.58",  high24h: "214.00", low24h: "211.00", volume24h: "9000000",     marketCap: "614000000000",  description: "Largest US bank by assets and a global financial services leader.", exchange: "NYSE",   logoUrl: "https://logo.clearbit.com/jpmorgan.com" },

    { symbol: "GOLD",   name: "Gold",             assetType: "commodity" as const, currentPrice: "2386.48",   change24h: "5.98",    changePercent24h: "0.25",  high24h: "2395.00", low24h: "2376.00", volume24h: "38000000000", marketCap: null,  description: "Precious metal used as a store of value and hedge against inflation.", exchange: "COMEX", logoUrl: null },
    { symbol: "SILVER", name: "Silver",            assetType: "commodity" as const, currentPrice: "29.20",     change24h: "-0.20",   changePercent24h: "-0.69", high24h: "29.60",  low24h: "28.90",  volume24h: "5200000000",  marketCap: null,  description: "Precious metal used in jewelry, electronics, and as a store of value.", exchange: "COMEX", logoUrl: null },
    { symbol: "OIL",    name: "Crude Oil (WTI)",   assetType: "commodity" as const, currentPrice: "77.96",     change24h: "-0.34",   changePercent24h: "-0.43", high24h: "78.80",  low24h: "77.40",  volume24h: "62000000000", marketCap: null,  description: "West Texas Intermediate crude oil, a global benchmark for oil prices.", exchange: "NYMEX", logoUrl: null },
    { symbol: "NATGAS", name: "Natural Gas",       assetType: "commodity" as const, currentPrice: "2.143",     change24h: "0.043",   changePercent24h: "2.05",  high24h: "2.18",   low24h: "2.09",   volume24h: "12000000000", marketCap: null,  description: "Natural gas futures, used for energy and heating.", exchange: "NYMEX", logoUrl: null },
    { symbol: "WHEAT",  name: "Wheat",             assetType: "commodity" as const, currentPrice: "580.13",    change24h: "-1.87",   changePercent24h: "-0.32", high24h: "584.00", low24h: "578.00", volume24h: "2800000000",  marketCap: null,  description: "Agricultural commodity used as a staple food crop globally.", exchange: "CBOT",  logoUrl: null },
    { symbol: "COPPER", name: "Copper",            assetType: "commodity" as const, currentPrice: "4.58",      change24h: "0.06",    changePercent24h: "1.32",  high24h: "4.63",   low24h: "4.52",   volume24h: "1800000000",  marketCap: null,  description: "Industrial metal widely used in construction and electronics.", exchange: "COMEX", logoUrl: null },
  ];

  for (const asset of assets) {
    const row = await db.select({ s: assetsTable.symbol }).from(assetsTable).where(eq(assetsTable.symbol, asset.symbol)).limit(1);
    if (row.length === 0) {
      await db.insert(assetsTable).values(asset);
    }
  }

  logger.info({ count: assets.length }, "Assets seeded successfully");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  seedAssetsIfEmpty().catch(e => logger.error({ e }, "Asset seed failed"));
  startPriceService().catch(e => logger.error({ e }, "Price service failed to start"));
});
