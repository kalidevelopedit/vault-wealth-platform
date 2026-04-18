import { useState } from "react";

// Commodity / Futures fallback colors and labels
const COMMODITY_MAP: Record<string, { bg: string; color: string; label: string }> = {
  XAU:   { bg: "#b8860b", color: "#fff8e1", label: "Au" },
  XAG:   { bg: "#9e9e9e", color: "#ffffff", label: "Ag" },
  CRUDE: { bg: "#4a3728", color: "#f5deb3", label: "OIL" },
  OIL:   { bg: "#4a3728", color: "#f5deb3", label: "OIL" },
  GAS:   { bg: "#2a4a5e", color: "#cce5ff", label: "GAS" },
  WHEAT: { bg: "#c8a96e", color: "#fff", label: "WHT" },
  CORN:  { bg: "#d4a017", color: "#fff", label: "CRN" },
  ES:    { bg: "#1a3a5e", color: "#90c8ff", label: "ES" },
  NQ:    { bg: "#1a3a5e", color: "#90c8ff", label: "NQ" },
  YM:    { bg: "#1a3a5e", color: "#90c8ff", label: "YM" },
  RTY:   { bg: "#1a3a5e", color: "#90c8ff", label: "RTY" },
  GC:    { bg: "#b8860b", color: "#fff8e1", label: "GC" },
  SI:    { bg: "#9e9e9e", color: "#ffffff", label: "SI" },
  CL:    { bg: "#4a3728", color: "#f5deb3", label: "CL" },
};

interface AssetIconProps {
  symbol: string;
  size?: number;
  borderRadius?: number;
  className?: string;
}

export function AssetIcon({ symbol, size = 36, borderRadius = 10, className = "" }: AssetIconProps) {
  const [cryptoFailed, setCryptoFailed] = useState(false);
  const [stockFailed, setStockFailed] = useState(false);

  const sym = symbol?.toUpperCase() ?? "";
  const symLower = symbol?.toLowerCase() ?? "";

  // Check commodity/futures first
  if (COMMODITY_MAP[sym]) {
    const c = COMMODITY_MAP[sym];
    return (
      <div
        className={className}
        style={{
          width: size, height: size, borderRadius,
          background: `linear-gradient(135deg, ${c.bg}, ${c.bg}cc)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.28, fontWeight: 800, color: c.color,
          letterSpacing: "0.03em", flexShrink: 0,
          boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        }}
      >
        {c.label}
      </div>
    );
  }

  // Try crypto icon
  if (!cryptoFailed) {
    return (
      <img
        src={`/icons/crypto/${symLower}.png`}
        alt={symbol}
        className={className}
        style={{ width: size, height: size, borderRadius, objectFit: "contain", flexShrink: 0, background: "#fff" }}
        onError={() => setCryptoFailed(true)}
      />
    );
  }

  // Try stock icon
  if (!stockFailed) {
    return (
      <img
        src={`/icons/stocks/${sym}.png`}
        alt={symbol}
        className={className}
        style={{ width: size, height: size, borderRadius, objectFit: "contain", flexShrink: 0, background: "#fff" }}
        onError={() => setStockFailed(true)}
      />
    );
  }

  // Generic fallback — styled dark badge
  const initials = sym.slice(0, 3);
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius,
        background: "linear-gradient(135deg, #1a2a3a, #0d1520)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.27, fontWeight: 800, color: "#f59e0b",
        letterSpacing: "0.04em", flexShrink: 0,
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}
    >
      {initials}
    </div>
  );
}
