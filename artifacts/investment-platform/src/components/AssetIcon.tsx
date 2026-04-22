import { ReactNode } from "react";

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
};

const STOCK_LOGOS: Record<string, string> = {
  AAPL: "https://logo.clearbit.com/apple.com",
  MSFT: "https://logo.clearbit.com/microsoft.com",
  GOOGL: "https://logo.clearbit.com/google.com",
  AMZN: "https://logo.clearbit.com/amazon.com",
  TSLA: "https://logo.clearbit.com/tesla.com",
  META: "https://logo.clearbit.com/meta.com",
  NVDA: "https://logo.clearbit.com/nvidia.com",
  JPM: "https://logo.clearbit.com/jpmorganchase.com",
  V: "https://logo.clearbit.com/visa.com",
  BAC: "https://logo.clearbit.com/bankofamerica.com",
};

const COMMODITY_MAP: Record<string, string> = {
  XAU: "AU",
  XAG: "AG",
  WTI: "OIL",
  CRUDE: "OIL",
  COPPER: "CU",
};

interface AssetIconProps {
  symbol: string;
  size?: number;
  borderRadius?: string | number;
  className?: string;
}

export function AssetIcon({ symbol, size = 32, borderRadius = "50%", className }: AssetIconProps) {
  const sym = symbol?.toUpperCase() || "";
  const isCrypto = !!CRYPTO_LOGOS[sym];
  const isStock = !!STOCK_LOGOS[sym];

  if (isCrypto) {
    return <img src={CRYPTO_LOGOS[sym]} alt={symbol} className={className} style={{ width: size, height: size, borderRadius, objectFit: "cover" }} />;
  }
  if (isStock) {
    return <img src={STOCK_LOGOS[sym]} alt={symbol} className={className} style={{ width: size, height: size, borderRadius, background: "white", padding: 2, objectFit: "contain" }} />;
  }
  
  const text = COMMODITY_MAP[sym] || sym.substring(0, 2);
  
  return (
    <div className={className} style={{
      width: size, height: size, borderRadius,
      background: "#11141A", border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.96)", fontSize: size * 0.4, fontWeight: 600, fontFamily: "monospace"
    }}>
      {text}
    </div>
  );
}
