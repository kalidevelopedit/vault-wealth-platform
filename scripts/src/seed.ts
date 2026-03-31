import { db } from "@workspace/db";
import {
  usersTable,
  assetsTable,
  holdingsTable,
  transactionsTable,
  newsTable,
  watchlistTable,
  activityLogTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "salt_investment_platform").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Seed assets - crypto
  const cryptoAssets = [
    { symbol: "BTC", name: "Bitcoin", assetType: "crypto" as const, currentPrice: "67234.50", change24h: "1823.40", changePercent24h: "2.79", high24h: "68100.00", low24h: "65200.00", volume24h: "38500000000", marketCap: "1320000000000", description: "The original cryptocurrency and largest by market capitalization.", exchange: "Crypto", logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png" },
    { symbol: "ETH", name: "Ethereum", assetType: "crypto" as const, currentPrice: "3542.80", change24h: "87.30", changePercent24h: "2.53", high24h: "3620.00", low24h: "3460.00", volume24h: "18200000000", marketCap: "425000000000", description: "A decentralized platform enabling smart contracts and DApps.", exchange: "Crypto", logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { symbol: "SOL", name: "Solana", assetType: "crypto" as const, currentPrice: "178.42", change24h: "6.23", changePercent24h: "3.62", high24h: "182.00", low24h: "171.00", volume24h: "4300000000", marketCap: "82000000000", description: "A high-performance blockchain supporting fast transactions.", exchange: "Crypto", logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png" },
    { symbol: "BNB", name: "BNB", assetType: "crypto" as const, currentPrice: "598.20", change24h: "-12.40", changePercent24h: "-2.03", high24h: "615.00", low24h: "590.00", volume24h: "2100000000", marketCap: "88000000000", description: "Native token of the Binance ecosystem.", exchange: "Crypto", logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
    { symbol: "ADA", name: "Cardano", assetType: "crypto" as const, currentPrice: "0.4823", change24h: "0.0145", changePercent24h: "3.10", high24h: "0.4950", low24h: "0.4620", volume24h: "520000000", marketCap: "17000000000", description: "A proof-of-stake blockchain platform.", exchange: "Crypto", logoUrl: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
  ];

  // Seed assets - stocks
  const stockAssets = [
    { symbol: "AAPL", name: "Apple Inc.", assetType: "stock" as const, currentPrice: "185.42", change24h: "2.34", changePercent24h: "1.28", high24h: "186.90", low24h: "183.10", volume24h: "65000000", marketCap: "2850000000000", description: "Technology company designing consumer electronics, software, and services.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/apple.com" },
    { symbol: "TSLA", name: "Tesla Inc.", assetType: "stock" as const, currentPrice: "248.75", change24h: "-5.23", changePercent24h: "-2.06", high24h: "254.00", low24h: "246.00", volume24h: "98000000", marketCap: "790000000000", description: "Electric vehicles, energy storage, and solar energy company.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/tesla.com" },
    { symbol: "MSFT", name: "Microsoft Corp.", assetType: "stock" as const, currentPrice: "415.80", change24h: "6.42", changePercent24h: "1.57", high24h: "418.20", low24h: "409.50", volume24h: "22000000", marketCap: "3090000000000", description: "Multinational technology corporation producing software and cloud services.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/microsoft.com" },
    { symbol: "GOOGL", name: "Alphabet Inc.", assetType: "stock" as const, currentPrice: "178.65", change24h: "3.21", changePercent24h: "1.83", high24h: "179.90", low24h: "175.40", volume24h: "24000000", marketCap: "2230000000000", description: "Multinational technology conglomerate and Google's parent company.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/google.com" },
    { symbol: "AMZN", name: "Amazon.com Inc.", assetType: "stock" as const, currentPrice: "195.34", change24h: "4.56", changePercent24h: "2.39", high24h: "196.80", low24h: "190.50", volume24h: "32000000", marketCap: "2050000000000", description: "Multinational technology company focused on e-commerce and cloud computing.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/amazon.com" },
    { symbol: "NVDA", name: "NVIDIA Corp.", assetType: "stock" as const, currentPrice: "875.23", change24h: "23.45", changePercent24h: "2.75", high24h: "882.00", low24h: "852.00", volume24h: "42000000", marketCap: "2160000000000", description: "Technology company designing GPUs and system-on-chip units.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/nvidia.com" },
    { symbol: "META", name: "Meta Platforms", assetType: "stock" as const, currentPrice: "524.61", change24h: "8.93", changePercent24h: "1.73", high24h: "527.20", low24h: "515.70", volume24h: "18000000", marketCap: "1340000000000", description: "Social technology company owning Facebook, Instagram, and WhatsApp.", exchange: "NASDAQ", logoUrl: "https://logo.clearbit.com/meta.com" },
  ];

  // Seed assets - commodities
  const commodityAssets = [
    { symbol: "GOLD", name: "Gold", assetType: "commodity" as const, currentPrice: "2342.50", change24h: "18.30", changePercent24h: "0.79", high24h: "2351.00", low24h: "2324.00", volume24h: "38000000000", marketCap: null, description: "Precious metal used as a store of value and hedge against inflation.", exchange: "COMEX", logoUrl: null },
    { symbol: "SILVER", name: "Silver", assetType: "commodity" as const, currentPrice: "27.82", change24h: "0.34", changePercent24h: "1.24", high24h: "28.10", low24h: "27.48", volume24h: "5200000000", marketCap: null, description: "Precious metal used in jewelry, electronics, and as a store of value.", exchange: "COMEX", logoUrl: null },
    { symbol: "OIL", name: "Crude Oil (WTI)", assetType: "commodity" as const, currentPrice: "78.43", change24h: "-1.23", changePercent24h: "-1.54", high24h: "79.85", low24h: "77.90", volume24h: "62000000000", marketCap: null, description: "West Texas Intermediate crude oil, a global benchmark for oil prices.", exchange: "NYMEX", logoUrl: null },
    { symbol: "NATGAS", name: "Natural Gas", assetType: "commodity" as const, currentPrice: "2.143", change24h: "0.043", changePercent24h: "2.05", high24h: "2.18", low24h: "2.09", volume24h: "12000000000", marketCap: null, description: "Natural gas futures, used for energy and heating.", exchange: "NYMEX", logoUrl: null },
    { symbol: "WHEAT", name: "Wheat", assetType: "commodity" as const, currentPrice: "584.75", change24h: "-8.25", changePercent24h: "-1.39", high24h: "593.00", low24h: "582.00", volume24h: "2800000000", marketCap: null, description: "Agricultural commodity used as a staple food crop globally.", exchange: "CBOT", logoUrl: null },
  ];

  // Insert assets
  for (const asset of [...cryptoAssets, ...stockAssets, ...commodityAssets]) {
    const existing = await db.select().from(assetsTable).where(eq(assetsTable.symbol, asset.symbol)).limit(1);
    if (existing.length === 0) {
      await db.insert(assetsTable).values(asset);
    }
  }
  console.log("Assets seeded");

  // Create demo user
  const demoEmail = "demo@vestplatform.com";
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, demoEmail)).limit(1);
  let demoUserId: number;

  if (existing.length === 0) {
    const [demoUser] = await db.insert(usersTable).values({
      fullName: "John Hartwell",
      legalName: "John Edward Hartwell",
      email: demoEmail,
      passwordHash: hashPassword("demo1234"),
      phone: "+1 (555) 382-4910",
      country: "United States",
      dateOfBirth: "1985-04-12",
      address: "842 Park Avenue, Apt 14B",
      city: "New York",
      postalCode: "10021",
      role: "user",
      kycStatus: "approved",
      onboardingStep: 8,
      onboardingComplete: true,
      availableCash: "16345.04",
      investmentPreferences: ["crypto", "stocks"],
      selfieStatus: "submitted",
      lastActive: new Date(),
    }).returning();
    demoUserId = demoUser.id;
    console.log("Demo user created:", demoUserId);
  } else {
    demoUserId = existing[0].id;
    console.log("Demo user already exists:", demoUserId);
  }

  // Seed holdings for demo user
  const allAssets = await db.select().from(assetsTable);
  const assetMap = Object.fromEntries(allAssets.map(a => [a.symbol, a]));

  const demoHoldings = [
    { symbol: "BTC", quantity: "0.19234", avgCost: "52140.00" },
    { symbol: "ETH", quantity: "4.50000", avgCost: "2840.00" },
    { symbol: "AAPL", quantity: "25.00000", avgCost: "168.20" },
    { symbol: "TSLA", quantity: "12.00000", avgCost: "218.50" },
    { symbol: "NVDA", quantity: "5.00000", avgCost: "740.00" },
    { symbol: "GOLD", quantity: "3.00000", avgCost: "2180.00" },
  ];

  for (const h of demoHoldings) {
    const asset = assetMap[h.symbol];
    if (!asset) continue;
    const existing = await db.select().from(holdingsTable)
      .where(eq(holdingsTable.userId, demoUserId)).limit(1);
    const alreadyHas = existing.some ? false : true;

    const existingHolding = await db.select().from(holdingsTable)
      .where(eq(holdingsTable.assetId, asset.id)).limit(1);
    if (existingHolding.some(eh => eh.userId === demoUserId)) continue;

    await db.insert(holdingsTable).values({
      userId: demoUserId,
      assetId: asset.id,
      symbol: h.symbol,
      quantity: h.quantity,
      averageCost: h.avgCost,
    });
  }
  console.log("Demo holdings seeded");

  // Seed transactions for demo user
  const existingTx = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, demoUserId)).limit(1);
  if (existingTx.length === 0) {
    const txData = [
      { type: "deposit" as const, amount: "25000.00", status: "completed" as const, createdAt: new Date("2024-11-01") },
      { type: "buy" as const, symbol: "BTC", name: "Bitcoin", quantity: "0.19234", price: "52140.00", amount: "10027.64", status: "completed" as const, logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png", createdAt: new Date("2024-11-02") },
      { type: "buy" as const, symbol: "ETH", name: "Ethereum", quantity: "4.50000", price: "2840.00", amount: "12780.00", status: "completed" as const, logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png", createdAt: new Date("2024-11-05") },
      { type: "buy" as const, symbol: "AAPL", name: "Apple Inc.", quantity: "25.00000", price: "168.20", amount: "4205.00", status: "completed" as const, logoUrl: "https://logo.clearbit.com/apple.com", createdAt: new Date("2024-11-10") },
      { type: "buy" as const, symbol: "GOLD", name: "Gold", quantity: "3.00000", price: "2180.00", amount: "6540.00", status: "completed" as const, createdAt: new Date("2024-11-15") },
      { type: "deposit" as const, amount: "15000.00", status: "completed" as const, createdAt: new Date("2024-12-01") },
      { type: "buy" as const, symbol: "NVDA", name: "NVIDIA Corp.", quantity: "5.00000", price: "740.00", amount: "3700.00", status: "completed" as const, logoUrl: "https://logo.clearbit.com/nvidia.com", createdAt: new Date("2024-12-05") },
      { type: "buy" as const, symbol: "TSLA", name: "Tesla Inc.", quantity: "12.00000", price: "218.50", amount: "2622.00", status: "completed" as const, logoUrl: "https://logo.clearbit.com/tesla.com", createdAt: new Date("2024-12-12") },
      { type: "sell" as const, symbol: "SOL", name: "Solana", quantity: "10.00000", price: "165.00", amount: "1650.00", status: "completed" as const, createdAt: new Date("2025-01-08") },
    ];

    for (const tx of txData) {
      await db.insert(transactionsTable).values({
        userId: demoUserId,
        ...tx,
      });
    }
    console.log("Demo transactions seeded");
  }

  // Seed watchlist
  const existingWatchlist = await db.select().from(watchlistTable).where(eq(watchlistTable.userId, demoUserId)).limit(1);
  if (existingWatchlist.length === 0) {
    const watchlistItems = [
      { symbol: "SOL", assetType: "crypto" as const },
      { symbol: "MSFT", assetType: "stock" as const },
      { symbol: "GOOGL", assetType: "stock" as const },
      { symbol: "SILVER", assetType: "commodity" as const },
    ];
    for (const item of watchlistItems) {
      await db.insert(watchlistTable).values({ userId: demoUserId, ...item });
    }
    console.log("Watchlist seeded");
  }

  // Seed news
  const existingNews = await db.select().from(newsTable).limit(1);
  if (existingNews.length === 0) {
    const newsItems = [
      {
        title: "Federal Reserve Holds Rates Steady as Inflation Eases",
        summary: "The Federal Reserve kept its benchmark interest rate unchanged, citing progress on inflation while emphasizing a data-dependent approach to future decisions.",
        source: "Financial Times",
        url: "https://ft.com",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
        category: "Macro",
        publishedAt: new Date("2025-03-28"),
      },
      {
        title: "NVIDIA Posts Record Revenue Driven by AI Chip Demand",
        summary: "NVIDIA reported quarterly revenues exceeding analyst expectations, driven by unprecedented demand for its H100 GPU chips used in AI training.",
        source: "Wall Street Journal",
        url: "https://wsj.com",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
        category: "Equities",
        publishedAt: new Date("2025-03-27"),
      },
      {
        title: "Bitcoin Tests $70,000 Resistance Amid ETF Inflows",
        summary: "Bitcoin approached the $70,000 level as institutional buying through spot ETFs continued at a record pace, with analysts divided on near-term direction.",
        source: "CoinDesk",
        url: "https://coindesk.com",
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop",
        category: "Crypto",
        publishedAt: new Date("2025-03-26"),
      },
      {
        title: "Gold Reaches Multi-Year High on Safe Haven Demand",
        summary: "Gold prices climbed to their highest level in three years as geopolitical tensions and dollar weakness drove investors toward traditional safe haven assets.",
        source: "Bloomberg",
        url: "https://bloomberg.com",
        imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=250&fit=crop",
        category: "Commodities",
        publishedAt: new Date("2025-03-25"),
      },
      {
        title: "Apple Unveils Advanced Silicon Roadmap for 2025",
        summary: "Apple outlined its next-generation chip architecture at a developer event, promising significant performance improvements for its M-series products.",
        source: "Reuters",
        url: "https://reuters.com",
        imageUrl: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=250&fit=crop",
        category: "Technology",
        publishedAt: new Date("2025-03-24"),
      },
      {
        title: "Ethereum Upgrade Improves Transaction Speed and Reduces Costs",
        summary: "The latest Ethereum network upgrade has dramatically reduced average transaction fees while improving throughput capacity by nearly 40 percent.",
        source: "The Block",
        url: "https://theblock.co",
        imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=250&fit=crop",
        category: "Crypto",
        publishedAt: new Date("2025-03-23"),
      },
      {
        title: "Oil Prices Rise on Supply Concerns and OPEC Production Cuts",
        summary: "Crude oil benchmarks advanced as OPEC maintained production discipline and geopolitical tensions in major producing regions heightened supply uncertainty.",
        source: "S&P Global",
        url: "https://spglobal.com",
        imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=250&fit=crop",
        category: "Commodities",
        publishedAt: new Date("2025-03-22"),
      },
      {
        title: "Global Equity Markets Post Strongest Q1 Gains Since 2019",
        summary: "Major equity indices closed the first quarter with substantial gains as corporate earnings exceeded expectations and central banks signaled a pivot to rate cuts.",
        source: "Financial Times",
        url: "https://ft.com",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
        category: "Markets",
        publishedAt: new Date("2025-03-21"),
      },
    ];

    for (const item of newsItems) {
      await db.insert(newsTable).values(item);
    }
    console.log("News seeded");
  }

  // Seed activity log for demo user
  const existingActivity = await db.select().from(activityLogTable).where(eq(activityLogTable.userId, demoUserId)).limit(1);
  if (existingActivity.length === 0) {
    await db.insert(activityLogTable).values([
      { userId: demoUserId, eventType: "account_created", description: "Account registered", timestamp: new Date("2024-11-01") },
      { userId: demoUserId, eventType: "kyc_submitted", description: "KYC verification submitted", timestamp: new Date("2024-11-01") },
      { userId: demoUserId, eventType: "kyc_status_changed", description: "KYC status changed to approved", timestamp: new Date("2024-11-02") },
      { userId: demoUserId, eventType: "deposit", description: "Deposited $25,000.00", timestamp: new Date("2024-11-01") },
      { userId: demoUserId, eventType: "login", description: "User logged in", timestamp: new Date() },
    ]);
    console.log("Activity log seeded");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
