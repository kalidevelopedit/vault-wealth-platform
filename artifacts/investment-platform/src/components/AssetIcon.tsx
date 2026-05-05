import { useState } from "react";

/* ─── Crypto symbol set (determines which logos use CryptoIcon) ─── */
const CRYPTO_SYMBOLS_CDN = new Set([
  "BTC","ETH","BNB","SOL","XRP","USDT","USDC","ADA","AVAX","DOGE",
  "DOT","LINK","MATIC","UNI","LTC","ATOM","XLM","TRX","SHIB","APT",
  "NEAR","FTM","ALGO","VET","MANA","SAND","AXS","CRV","AAVE","MKR",
  "COMP","SNX","ENJ","BAT","ZRX","1INCH","GRT","LRC","THETA","FIL",
  "ETC","BCH","DASH","XMR","ZEC","DCR","ICX","IOTA","NEO","WAVES",
  "RUNE","LUNA","UST","BUSD","DAI","FRAX","TUSD","PAX","GUSD",
]);

/* CoinGecko transparent PNG URLs — image IDs for major coins */
const COINGECKO_URL: Record<string, string> = {
  BTC:  "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH:  "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL:  "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB:  "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRP:  "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  ADA:  "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOT:  "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  MATIC:"https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  UNI:  "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  LTC:  "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  ATOM: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  AAVE: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
};

/* Coin name for spothq fallback */
const CRYPTO_NAME_MAP: Record<string, string> = {
  BTC: "bitcoin",  ETH: "ethereum",  BNB: "bnb",     SOL: "solana",
  XRP: "xrp",      USDT: "usdt",     USDC: "usd-coin", ADA: "cardano",
  AVAX: "avalanche-2", DOGE: "dogecoin", DOT: "polkadot", LINK: "chainlink",
  MATIC: "matic-network", UNI: "uniswap", LTC: "litecoin", ATOM: "cosmos",
  XLM: "stellar",  TRX: "tron",      SHIB: "shiba-inu", APT: "aptos",
  NEAR: "near",    FTM: "fantom",    ALGO: "algorand", VET: "vechain",
  MANA: "decentraland", SAND: "the-sandbox", AXS: "axie-infinity",
};

/* ─── Stocks: Parqet logo API (replaces deprecated Clearbit) ─── */
const STOCK_DOMAINS: Record<string, string> = {
  AAPL:  "apple.com",   MSFT:  "microsoft.com",  GOOGL: "google.com",
  GOOG:  "google.com",  AMZN:  "amazon.com",      TSLA:  "tesla.com",
  META:  "meta.com",    NVDA:  "nvidia.com",       JPM:   "jpmorgan.com",
  V:     "visa.com",    BAC:   "bankofamerica.com",NFLX:  "netflix.com",
  DIS:   "disney.com",  WMT:   "walmart.com",      PYPL:  "paypal.com",
  INTC:  "intel.com",   AMD:   "amd.com",           CRM:   "salesforce.com",
  ORCL:  "oracle.com",  CSCO:  "cisco.com",         ADBE:  "adobe.com",
  UBER:  "uber.com",    ABNB:  "airbnb.com",        COIN:  "coinbase.com",
  SPOT:  "spotify.com", MA:    "mastercard.com",     GS:    "goldmansachs.com",
  MS:    "morganstanley.com", C: "citi.com",         WFC:   "wellsfargo.com",
  HOOD:  "robinhood.com", SQ:  "block.xyz",          SHOP:  "shopify.com",
  RBLX:  "roblox.com",  SNOW:  "snowflake.com",      PLTR:  "palantir.com",
  ZM:    "zoom.us",     DOCU:  "docusign.com",        TWLO:  "twilio.com",
  NET:   "cloudflare.com", DDOG: "datadoghq.com",    CRWD:  "crowdstrike.com",
  OKTA:  "okta.com",    ZS:    "zscaler.com",         PANW:  "paloaltonetworks.com",
};

/* ─── Commodity SVG icons ─── */
const CommodityIcon = ({ symbol, size, borderRadius }: { symbol: string; size: number; borderRadius: string | number }) => {
  const s = symbol.toUpperCase();

  if (s === "GOLD" || s === "XAU") {
    const rx = typeof borderRadius === 'number' ? borderRadius : 18;
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <linearGradient id="xau-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1200"/>
            <stop offset="100%" stopColor="#2d1f00"/>
          </linearGradient>
          <linearGradient id="xau-bar-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE87C"/>
            <stop offset="100%" stopColor="#D4A017"/>
          </linearGradient>
          <linearGradient id="xau-bar-face" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5C518"/>
            <stop offset="40%" stopColor="#E8A800"/>
            <stop offset="100%" stopColor="#B8860B"/>
          </linearGradient>
          <linearGradient id="xau-bar-side" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B"/>
            <stop offset="100%" stopColor="#8B6508"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx={rx} fill="url(#xau-bg)"/>
        {/* Gold bar 3D perspective */}
        {/* Top face */}
        <polygon points="8,13 28,13 25,10 11,10" fill="url(#xau-bar-top)"/>
        {/* Front face */}
        <rect x="8" y="13" width="20" height="12" rx="1" fill="url(#xau-bar-face)"/>
        {/* Right side */}
        <polygon points="28,13 28,25 25,22 25,10" fill="url(#xau-bar-side)"/>
        {/* XAU text on front */}
        <text x="18" y="22" textAnchor="middle" fill="rgba(120,70,0,0.85)" fontSize="6.5" fontWeight="900" fontFamily="monospace" letterSpacing="1">XAU</text>
        {/* Shine line */}
        <line x1="11" y1="16" x2="25" y2="16" stroke="rgba(255,240,130,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Bottom shine */}
        <rect x="8" y="25" width="20" height="2" rx="1" fill="rgba(0,0,0,0.25)"/>
      </svg>
    );
  }

  if (s === "SILVER" || s === "XAG") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <radialGradient id={`g-${s}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#F1F5F9"/>
            <stop offset="45%" stopColor="#94A3B8"/>
            <stop offset="100%" stopColor="#475569"/>
          </radialGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill={`url(#g-${s})`}/>
        <text x="18" y="23" textAnchor="middle" fill="rgba(30,41,59,0.85)" fontSize="11" fontWeight="800" fontFamily="serif">Ag</text>
      </svg>
    );
  }

  if (s === "PLAT" || s === "XPT" || s === "PLATINUM") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <radialGradient id={`g-${s}`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#E0E7FF"/>
            <stop offset="50%" stopColor="#818CF8"/>
            <stop offset="100%" stopColor="#3730A3"/>
          </radialGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill={`url(#g-${s})`}/>
        <text x="18" y="23" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11" fontWeight="800" fontFamily="serif">Pt</text>
      </svg>
    );
  }

  if (s === "OIL" || s === "WTI" || s === "CRUDE" || s === "BRENT") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <radialGradient id={`g-oil`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="60%" stopColor="#1F2937"/>
            <stop offset="100%" stopColor="#111827"/>
          </radialGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="url(#g-oil)"/>
        <path d="M18 8 C18 8, 10 18, 10 23 A8 8 0 0 0 26 23 C26 18 18 8 18 8Z" fill="#F59E0B" opacity="0.9"/>
        <path d="M18 14 C18 14, 13 21, 13 24 A5 5 0 0 0 18 28 A5 5 0 0 0 23 24 C23 21 18 14 18 14Z" fill="#FCD34D" opacity="0.6"/>
      </svg>
    );
  }

  if (s === "GAS" || s === "NATGAS" || s === "NG") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="#0C1A2E"/>
        <path d="M18 27 C12 27 9 22 11 16 C12.5 19 14 18 14 14 C15 17 17 16 16 10 C19 13 22 11 21 16 C22.5 14 24 15 23 18 C25 16 26 19 24 22 C23 25 21 27 18 27Z"
          fill="url(#flame-grad)"/>
        <defs>
          <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3B82F6"/>
            <stop offset="60%" stopColor="#60A5FA"/>
            <stop offset="100%" stopColor="#BFDBFE"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (s === "COPPER" || s === "CU" || s === "HG") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <radialGradient id={`g-cu`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FED7AA"/>
            <stop offset="50%" stopColor="#B45309"/>
            <stop offset="100%" stopColor="#78350F"/>
          </radialGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="url(#g-cu)"/>
        <text x="18" y="23" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="11" fontWeight="800" fontFamily="serif">Cu</text>
      </svg>
    );
  }

  if (s === "WHEAT" || s === "ZW" || s === "W") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <linearGradient id="g-wheat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE68A"/>
            <stop offset="100%" stopColor="#D97706"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="url(#g-wheat)"/>
        <line x1="18" y1="28" x2="18" y2="8" stroke="rgba(120,53,15,0.7)" strokeWidth="2"/>
        <ellipse cx="15" cy="15" rx="4" ry="2.5" fill="#92400E" opacity="0.8" transform="rotate(-30,15,15)"/>
        <ellipse cx="21" cy="18" rx="4" ry="2.5" fill="#92400E" opacity="0.8" transform="rotate(30,21,18)"/>
        <ellipse cx="15" cy="21" rx="4" ry="2.5" fill="#92400E" opacity="0.8" transform="rotate(-30,15,21)"/>
        <ellipse cx="21" cy="12" rx="4" ry="2.5" fill="#92400E" opacity="0.8" transform="rotate(30,21,12)"/>
      </svg>
    );
  }

  if (s === "CORN" || s === "ZC") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <linearGradient id="g-corn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A"/>
            <stop offset="100%" stopColor="#CA8A04"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="url(#g-corn)"/>
        <text x="18" y="23" textAnchor="middle" fill="rgba(113,63,18,0.85)" fontSize="10" fontWeight="800" fontFamily="monospace">ZC</text>
      </svg>
    );
  }

  if (s === "USD" || s === "USDFIAT") {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
        <defs>
          <radialGradient id="g-usd" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#86efac"/>
            <stop offset="50%" stopColor="#22c55e"/>
            <stop offset="100%" stopColor="#15803d"/>
          </radialGradient>
        </defs>
        <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="url(#g-usd)"/>
        <text x="18" y="24" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="16" fontWeight="800" fontFamily="serif">$</text>
      </svg>
    );
  }

  // Generic commodity fallback
  const firstTwo = s.substring(0, 2);
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ borderRadius, flexShrink: 0 }}>
      <rect width="36" height="36" rx={typeof borderRadius === 'number' ? borderRadius : 18} fill="rgba(245,158,11,0.15)"/>
      <text x="18" y="23" textAnchor="middle" fill="#F59E0B" fontSize="12" fontWeight="800" fontFamily="monospace">{firstTwo}</text>
    </svg>
  );
};

/* ─── Crypto icon — CoinGecko (transparent) → spothq → letter ─── */
function CryptoIcon({ symbol, size, borderRadius, className }: { symbol: string; size: number; borderRadius: string | number; className?: string }) {
  const SYM = symbol.toUpperCase();
  const sym = symbol.toLowerCase();
  const [srcIdx, setSrcIdx] = useState(0);

  const sources: (string | null)[] = [
    COINGECKO_URL[SYM] ?? null,
    `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${sym}.png`,
    null, // letter fallback
  ].filter((s, i, arr) => s !== null || i === arr.length - 1) as (string | null)[];

  if (srcIdx < sources.length - 1 && sources[srcIdx]) {
    const isCoingecko = srcIdx === 0 && !!COINGECKO_URL[SYM];
    return (
      <img
        src={sources[srcIdx]!}
        alt={symbol}
        className={className}
        style={{
          width: size, height: size, borderRadius, flexShrink: 0,
          objectFit: "contain",
          background: "transparent",
          ...(isCoingecko ? {} : { background: "rgba(0,0,0,0.15)" }),
        }}
        onError={() => setSrcIdx(i => i + 1)}
      />
    );
  }

  // Letter fallback with brand colors
  const letter = SYM.substring(0, 1).toUpperCase();
  const hue = [...SYM].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius, flexShrink: 0,
      background: `hsl(${hue}, 60%, 25%)`,
      border: `1px solid hsl(${hue}, 60%, 40%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: `hsl(${hue}, 80%, 75%)`,
      fontSize: size * 0.42, fontWeight: 700, fontFamily: "system-ui,sans-serif",
    }}>
      {letter}
    </div>
  );
}

/* ─── Stock logo: Parqet → company favicon → letter fallback ─── */
function StockLogo({ symbol, size, borderRadius, className }: { symbol: string; size: number; borderRadius: string | number; className?: string }) {
  const [srcIdx, setSrcIdx] = useState(0);
  const sym = symbol.toUpperCase();
  const domain = STOCK_DOMAINS[sym];

  const sources = [
    `https://assets.parqet.com/logos/symbol/${sym}?format=png`,
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null,
    null,
  ].filter(s => s !== undefined) as (string | null)[];

  if (srcIdx < sources.length - 1 && sources[srcIdx]) {
    return (
      <img
        src={sources[srcIdx]!}
        alt={symbol}
        className={className}
        style={{
          width: size, height: size, borderRadius, background: "#fff",
          padding: Math.max(2, size * 0.07), objectFit: "contain", flexShrink: 0,
        }}
        onError={() => setSrcIdx(i => i + 1)}
      />
    );
  }

  // Letter fallback
  const letter = sym.substring(0, 1).toUpperCase();
  const hue = [...sym].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius, flexShrink: 0,
      background: `hsl(${hue}, 50%, 20%)`,
      border: `1px solid hsl(${hue}, 50%, 35%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: `hsl(${hue}, 80%, 75%)`,
      fontSize: size * 0.42, fontWeight: 700, fontFamily: "system-ui,sans-serif",
    }}>
      {letter}
    </div>
  );
}

export interface AssetIconProps {
  symbol: string;
  size?: number;
  borderRadius?: string | number;
  className?: string;
}

const COMMODITY_SYMBOLS = new Set([
  "GOLD","XAU","SILVER","XAG","OIL","WTI","CRUDE","BRENT","GAS","NATGAS","NG",
  "COPPER","CU","HG","WHEAT","ZW","W","CORN","ZC","PLAT","XPT","PLATINUM",
  "PALLADIUM","XPD","SUGAR","COFFEE","COCOA","COTTON","LUMBER","NICKEL","ZINC","ALUMINUM",
  "USD","USDFIAT",
]);

export function AssetIcon({ symbol, size = 32, borderRadius = "50%", className }: AssetIconProps) {
  const sym = symbol?.toUpperCase() || "";

  if (COMMODITY_SYMBOLS.has(sym)) {
    return <CommodityIcon symbol={sym} size={size} borderRadius={borderRadius} />;
  }

  if (CRYPTO_SYMBOLS_CDN.has(sym)) {
    return <CryptoIcon symbol={sym} size={size} borderRadius={borderRadius} className={className} />;
  }

  // Default: stock logo
  return <StockLogo symbol={sym} size={size} borderRadius={borderRadius} className={className} />;
}
