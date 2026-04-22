import { useState } from "react";

const CRYPTO_LOGOS: Record<string, string> = {
  BTC:   "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH:   "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB:   "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  SOL:   "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  XRP:   "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  USDT:  "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  USDC:  "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  ADA:   "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAX:  "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOGE:  "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOT:   "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINK:  "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
  UNI:   "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  LTC:   "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  ATOM:  "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  XLM:   "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
};

const STOCK_LOGOS: Record<string, string> = {
  AAPL:  "https://logo.clearbit.com/apple.com",
  MSFT:  "https://logo.clearbit.com/microsoft.com",
  GOOGL: "https://logo.clearbit.com/google.com",
  AMZN:  "https://logo.clearbit.com/amazon.com",
  TSLA:  "https://logo.clearbit.com/tesla.com",
  META:  "https://logo.clearbit.com/meta.com",
  NVDA:  "https://logo.clearbit.com/nvidia.com",
  JPM:   "https://logo.clearbit.com/jpmorganchase.com",
  V:     "https://logo.clearbit.com/visa.com",
  BAC:   "https://logo.clearbit.com/bankofamerica.com",
  NFLX:  "https://logo.clearbit.com/netflix.com",
  DIS:   "https://logo.clearbit.com/disney.com",
};

const COMMODITY_COLORS: Record<string, { bg: string; color: string; text: string }> = {
  GOLD:   { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", text: "Au" },
  XAU:    { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", text: "Au" },
  SILVER: { bg: "rgba(156,163,175,0.15)", color: "#9CA3AF", text: "Ag" },
  XAG:    { bg: "rgba(156,163,175,0.15)", color: "#9CA3AF", text: "Ag" },
  OIL:    { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", text: "OIL" },
  WTI:    { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", text: "OIL" },
  GAS:    { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", text: "GAS" },
  COPPER: { bg: "rgba(217,119,6,0.15)",  color: "#D97706", text: "Cu" },
  WHEAT:  { bg: "rgba(234,179,8,0.15)",  color: "#EAB308", text: "WHT" },
  CORN:   { bg: "rgba(234,179,8,0.12)",  color: "#CA8A04", text: "CRN" },
  PLAT:   { bg: "rgba(99,102,241,0.15)", color: "#818CF8", text: "Pt" },
};

interface AssetIconProps {
  symbol: string;
  size?: number;
  borderRadius?: string | number;
  className?: string;
}

export function AssetIcon({ symbol, size = 32, borderRadius = "50%", className }: AssetIconProps) {
  const sym = symbol?.toUpperCase() || "";
  const [imgError, setImgError] = useState(false);

  if (CRYPTO_LOGOS[sym] && !imgError) {
    return (
      <img
        src={CRYPTO_LOGOS[sym]}
        alt={symbol}
        className={className}
        style={{ width: size, height: size, borderRadius, objectFit: "cover" }}
        onError={() => setImgError(true)}
      />
    );
  }

  if (STOCK_LOGOS[sym] && !imgError) {
    return (
      <img
        src={STOCK_LOGOS[sym]}
        alt={symbol}
        className={className}
        style={{ width: size, height: size, borderRadius, background: "white", padding: Math.max(2, size * 0.06), objectFit: "contain" }}
        onError={() => setImgError(true)}
      />
    );
  }

  const comm = COMMODITY_COLORS[sym];
  if (comm) {
    return (
      <div className={className} style={{
        width: size, height: size, borderRadius,
        background: comm.bg, border: `1px solid ${comm.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: comm.color, fontSize: size * 0.32, fontWeight: 700, fontFamily: "monospace",
      }}>
        {comm.text}
      </div>
    );
  }

  const label = sym.substring(0, sym.length > 3 ? 2 : sym.length);

  return (
    <div className={className} style={{
      width: size, height: size, borderRadius,
      background: "rgba(37,99,255,0.12)", border: "1px solid rgba(37,99,255,0.2)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#60A5FA", fontSize: size * 0.36, fontWeight: 700, fontFamily: "monospace",
    }}>
      {label}
    </div>
  );
}
