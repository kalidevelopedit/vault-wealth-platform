import { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetAssetDetail, useGetUserBalance,
  getGetUserBalanceQueryKey, getGetPortfolioSummaryQueryKey,
  getGetHoldingsQueryKey, getGetTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2, ArrowLeft, TrendingUp, TrendingDown,
  ExternalLink, Newspaper, BarChart2,
} from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { TradeModal } from "@/components/TradeModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";

const fmtPrice = (p: number) =>
  p >= 1
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const fmtCompact = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const fmtSupply = (n: number) => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

function getTvSymbol(symbol: string, type: string): string {
  if (type === "stock") return symbol;
  if (type === "commodity") {
    const map: Record<string, string> = {
      GOLD: "COMEX:GC1!", SILVER: "COMEX:SI1!", PLATINUM: "COMEX:PL1!",
      OIL: "NYMEX:CL1!", GAS: "NYMEX:NG1!", WHEAT: "CBOT:ZW1!",
      CORN: "CBOT:ZC1!", COPPER: "COMEX:HG1!", NATGAS: "NYMEX:NG1!",
    };
    return map[symbol] || symbol;
  }
  if (symbol === "USDT" || symbol === "USDC" || symbol === "BUSD") return "BINANCE:USDTUSDT";
  return `BINANCE:${symbol}USDT`;
}

function TradingViewChart({ tvSymbol, theme }: { tvSymbol: string; theme: "dark" | "light" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`tv_${tvSymbol.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`);

  useEffect(() => {
    const id = idRef.current;
    let cancelled = false;

    function initWidget() {
      if (cancelled) return;
      const tv = (window as any).TradingView;
      if (!tv || !document.getElementById(id)) return;
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
      try {
        new tv.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme,
          style: "1",
          locale: "en",
          toolbar_bg: theme === "dark" ? "#0C0F14" : "#ffffff",
          enable_publishing: false,
          allow_symbol_change: false,
          withdateranges: true,
          hide_side_toolbar: false,
          container_id: id,
        });
      } catch (_) {}
    }

    if ((window as any).TradingView) {
      setTimeout(initWidget, 50);
    } else {
      const existing = document.getElementById("tv-script-main");
      if (!existing) {
        const s = document.createElement("script");
        s.id = "tv-script-main";
        s.src = "https://s3.tradingview.com/tv.js";
        s.async = true;
        s.onload = () => setTimeout(initWidget, 50);
        document.head.appendChild(s);
      } else {
        const poll = setInterval(() => {
          if ((window as any).TradingView) { clearInterval(poll); setTimeout(initWidget, 50); }
        }, 150);
        return () => { clearInterval(poll); cancelled = true; };
      }
    }
    return () => { cancelled = true; };
  }, [tvSymbol, theme]);

  return (
    <div id={idRef.current} ref={containerRef}
      style={{ height: "100%", width: "100%", minHeight: 420 }} />
  );
}

function OrderBook({ price, symbol, colors }: { price: number; symbol: string; colors: any }) {
  const [book, setBook] = useState<{ asks: any[]; bids: any[] }>({ asks: [], bids: [] });

  useEffect(() => {
    const gen = () => {
      const seed = (i: number, side: number) =>
        Math.abs(Math.sin(price * 0.001 + i * 1.7 + side * 13.3)) * 0.00015 +
        Math.abs(Math.sin(i * 0.43 + Date.now() * 0.0001)) * 0.00008;

      const asks = Array.from({ length: 10 }, (_, i) => {
        const p = price * (1 + (i + 1) * 0.00018 + seed(i, 1));
        const q = parseFloat((Math.abs(Math.sin(i * 2.3 + price)) * 4.5 + 0.12).toFixed(4));
        return { price: p, qty: q, total: p * q };
      }).sort((a, b) => b.price - a.price);

      const bids = Array.from({ length: 10 }, (_, i) => {
        const p = price * (1 - (i + 1) * 0.00018 - seed(i, 0));
        const q = parseFloat((Math.abs(Math.sin(i * 1.9 + price * 0.5)) * 4.5 + 0.12).toFixed(4));
        return { price: p, qty: q, total: p * q };
      }).sort((a, b) => b.price - a.price);

      setBook({ asks, bids });
    };
    gen();
    const iv = setInterval(gen, 2500);
    return () => clearInterval(iv);
  }, [price]);

  const maxTotal = Math.max(...[...book.asks, ...book.bids].map(r => r.total), 1);
  const { text: TEXT, muted: MUTED, bord: BORD, green: GREEN, red: RED } = colors;

  return (
    <div style={{ fontSize: 12, fontFamily: "monospace" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "0 0 6px", color: MUTED, fontSize: 10.5,
        borderBottom: `1px solid ${BORD}`, letterSpacing: "0.06em",
      }}>
        <span>PRICE (USD)</span>
        <span style={{ textAlign: "right" }}>SIZE</span>
        <span style={{ textAlign: "right" }}>TOTAL</span>
      </div>

      {book.asks.map((row, i) => (
        <div key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "2.5px 0" }}>
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: `${(row.total / maxTotal) * 100}%`,
            background: "rgba(246,70,93,0.06)", pointerEvents: "none",
          }} />
          <span style={{ color: RED, position: "relative" }}>{fmtPrice(row.price)}</span>
          <span style={{ textAlign: "right", color: TEXT, position: "relative" }}>{row.qty.toFixed(4)}</span>
          <span style={{ textAlign: "right", color: MUTED, position: "relative" }}>{fmtPrice(row.total)}</span>
        </div>
      ))}

      <div style={{
        borderTop: `1px solid ${BORD}`, borderBottom: `1px solid ${BORD}`,
        padding: "8px 0", textAlign: "center", margin: "4px 0",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: GREEN, fontFamily: "monospace" }}>
          {fmtPrice(price)}
        </span>
        <span style={{ fontSize: 10, color: MUTED, marginLeft: 8 }}>Mark</span>
      </div>

      {book.bids.map((row, i) => (
        <div key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "2.5px 0" }}>
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: `${(row.total / maxTotal) * 100}%`,
            background: "rgba(14,203,129,0.06)", pointerEvents: "none",
          }} />
          <span style={{ color: GREEN, position: "relative" }}>{fmtPrice(row.price)}</span>
          <span style={{ textAlign: "right", color: TEXT, position: "relative" }}>{row.qty.toFixed(4)}</span>
          <span style={{ textAlign: "right", color: MUTED, position: "relative" }}>{fmtPrice(row.total)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Fear & Greed Gauge ─────────────────────────────────────── */
function computeFearGreed(changePercent24h: number, symbol: string): number {
  const seed = symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 0);
  const noise = ((seed % 17) - 8) * 0.5;
  const base =
    changePercent24h >= 8  ? 82 + noise :
    changePercent24h >= 4  ? 68 + noise :
    changePercent24h >= 1  ? 56 + noise :
    changePercent24h >= -1 ? 48 + noise :
    changePercent24h >= -4 ? 36 + noise :
    changePercent24h >= -8 ? 22 + noise :
                              12 + noise;
  return Math.max(5, Math.min(95, Math.round(base)));
}

function FearGreedGauge({ value, colors }: { value: number; colors: any }) {
  const { text: TEXT, muted: MUTED, bord: BORD, card: CARD, inputBg } = colors;

  const label =
    value >= 75 ? "Extreme Greed" :
    value >= 55 ? "Greed" :
    value >= 45 ? "Neutral" :
    value >= 25 ? "Fear" :
                  "Extreme Fear";

  const gaugeColor =
    value >= 75 ? "#0ecb81" :
    value >= 55 ? "#84cc16" :
    value >= 45 ? "#f59e0b" :
    value >= 25 ? "#f97316" :
                  "#f6465d";

  const cx = 80, cy = 76, r = 58;
  const startAngle = -180;
  const angle = startAngle + (value / 100) * 180;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const arcPath = (from: number, to: number, radius: number, stroke: string, width: number) => {
    const a1 = toRad(from), a2 = toRad(to);
    const x1 = cx + radius * Math.cos(a1), y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2), y2 = cy + radius * Math.sin(a2);
    const large = to - from > 180 ? 1 : 0;
    return (
      <path
        d={`M${x1},${y1} A${radius},${radius} 0 ${large},1 ${x2},${y2}`}
        fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round"
      />
    );
  };

  const zones = [
    { from: -180, to: -144, color: "#f6465d" },
    { from: -144, to: -108, color: "#f97316" },
    { from: -108, to:  -72, color: "#f59e0b" },
    { from:  -72, to:  -36, color: "#84cc16" },
    { from:  -36, to:    0, color: "#0ecb81" },
  ];

  const nx = cx + (r - 10) * Math.cos(toRad(angle));
  const ny = cy + (r - 10) * Math.sin(toRad(angle));

  return (
    <div style={{
      background: inputBg, border: `1px solid ${BORD}`, borderRadius: 16,
      padding: "20px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{ fontSize: 11, color: MUTED, letterSpacing: "0.1em", marginBottom: 12, fontWeight: 500 }}>
        FEAR & GREED INDEX
      </div>
      <svg width="160" height="90" viewBox="0 0 160 90">
        {zones.map((z, i) =>
          arcPath(z.from, z.to, r, z.color + "50", 11)
        )}
        {arcPath(-180, angle, r, gaugeColor, 11)}
        <circle cx={cx} cy={cy} r={5} fill={gaugeColor} />
        <line
          x1={cx} y1={cy} x2={nx} y2={ny}
          stroke={gaugeColor} strokeWidth={2.5} strokeLinecap="round"
        />
        <text x={cx} y={cy - 16} textAnchor="middle" fill={TEXT}
          fontSize="22" fontWeight="700" fontFamily="monospace">
          {value}
        </text>
      </svg>

      <div style={{ fontSize: 14, fontWeight: 700, color: gaugeColor, marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Based on 24h market signals</div>

      <div style={{
        display: "flex", justifyContent: "space-between", width: "100%",
        marginTop: 14, padding: "0 4px",
      }}>
        {["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"].map(l => (
          <span key={l} style={{ fontSize: 9, color: MUTED, letterSpacing: "0.03em" }}>
            {l.split(" ")[l.split(" ").length - 1]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── News Item ─────────────────────────────────────────────── */
type NewsItem = {
  id: number; title: string; summary?: string | null;
  source: string; url?: string | null; imageUrl?: string | null;
  category?: string | null; publishedAt: string;
};

function timeAgo(s: string): string {
  const d = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (d < 2)    return "Just now";
  if (d < 60)   return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

function NewsSection({
  symbol, name, assetType, colors,
}: { symbol: string; name: string; assetType: string; colors: any }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const keywords = useMemo(() => {
    const base = [symbol.toLowerCase(), name.toLowerCase()];
    if (assetType === "crypto") base.push("crypto", "blockchain", "defi");
    if (assetType === "stock")  base.push("stocks", "equities", "earnings");
    if (assetType === "commodity") base.push("commodities", "metals", "energy");
    return base;
  }, [symbol, name, assetType]);

  useEffect(() => {
    fetch("/api/market/news?limit=60")
      .then(r => r.json())
      .then((all: NewsItem[]) => {
        const filtered = Array.isArray(all)
          ? all.filter(n => {
              const text = `${n.title} ${n.category ?? ""} ${n.summary ?? ""}`.toLowerCase();
              return keywords.some(k => text.includes(k));
            })
          : [];
        setNews(filtered.length >= 3 ? filtered : (Array.isArray(all) ? all.slice(0, 6) : []));
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  const { text: TEXT, muted: MUTED, bord: BORD, blue: BLUE, inputBg } = colors;

  if (loading) return (
    <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
      <Loader2 size={20} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!news.length) return (
    <div style={{ padding: "32px 0", color: MUTED, fontSize: 13, textAlign: "center" }}>
      No news available for {name} right now.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {news.map((item, i) => (
        <div key={item.id ?? i} style={{
          padding: "16px 0", borderBottom: `1px solid ${BORD}`,
          display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          {item.imageUrl && (
            <img src={item.imageUrl} alt=""
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1px solid ${BORD}` }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, lineHeight: 1.45, marginBottom: 6 }}>
              {item.title}
            </div>
            {item.summary && (
              <div style={{
                fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 8,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              } as any}>{item.summary}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: MUTED }}>
                <span style={{ fontWeight: 600, color: BLUE }}>{item.source}</span>
                {" · "}{timeAgo(item.publishedAt)}
              </div>
              {item.url && item.url !== "#" && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: BLUE, textDecoration: "none" }}>
                  Read <ExternalLink size={10} strokeWidth={2} />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function AssetDetail() {
  const [_, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol?.toUpperCase() || "";
  const { colors, mode } = useTheme();
  const {
    bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED,
    blue: BLUE, green: GREEN, red: RED, inputBg,
  } = colors;
  const isMobile = useIsMobile(768);

  const [side, setSide]       = useState<"buy" | "sell">("buy");
  const [amount, setAmount]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [infoTab, setInfoTab] = useState<"stats" | "about" | "news">("stats");
  const [tradeOpen, setTradeOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: asset, isLoading } = useGetAssetDetail(
    symbol, { query: { enabled: !!symbol, refetchInterval: 15_000 } as any }
  );
  const { data: balance } = useGetUserBalance();

  const tvSymbol = useMemo(
    () => asset ? getTvSymbol(asset.symbol, (asset as any).assetType || "crypto") : "",
    [asset?.symbol, (asset as any)?.assetType]
  );

  const availableCash   = Number(balance?.availableCash) || 0;
  const amtNum          = parseFloat(amount) || 0;
  const isInsufficient  = side === "buy" && amtNum > availableCash && amtNum > 0;

  const handleTrade = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!asset) return;
    if (!amtNum || amtNum <= 0) return;
    if (side === "buy" && amtNum > availableCash) return;
    setSubmitting(true);
    try {
      const { useCreateTransaction } = await import("@workspace/api-client-react");
      void e;
    } catch {}
    finally { setSubmitting(false); }
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 28, height: 28, color: MUTED, animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!asset) return (
    <div style={{ minHeight: "100vh", background: BG, padding: 40, color: MUTED, textAlign: "center", paddingTop: 80 }}>
      Asset not found — <Link href="/markets" style={{ color: BLUE }}>Back to Markets</Link>
    </div>
  );

  const pos              = asset.changePercent24h >= 0;
  const assetType        = (asset as any).assetType as string || "crypto";
  const circulatingSupply = asset.marketCap && asset.currentPrice > 0
    ? asset.marketCap / asset.currentPrice : null;

  const athMultiplier = assetType === "crypto" ? 1.48 : 1.22;
  const atlMultiplier = assetType === "crypto" ? 0.38 : 0.62;
  const ath = asset.currentPrice * athMultiplier;
  const atl = asset.currentPrice * atlMultiplier;
  const athPct = ((asset.currentPrice - ath) / ath * 100).toFixed(1);
  const atlPct = ((asset.currentPrice - atl) / atl * 100).toFixed(1);

  const fearGreedValue = computeFearGreed(asset.changePercent24h, asset.symbol);

  const stats = [
    { label: "Market Cap",        value: asset.marketCap ? fmtCompact(asset.marketCap) : "—" },
    { label: "24h Volume",        value: asset.volume24h  ? fmtCompact(asset.volume24h)  : "—" },
    { label: "Circulating Supply",value: circulatingSupply ? `${fmtSupply(circulatingSupply)} ${asset.symbol}` : "—" },
    { label: "24h High",          value: `$${fmtPrice(asset.high24h)}`, color: GREEN },
    { label: "24h Low",           value: `$${fmtPrice(asset.low24h)}`,  color: RED },
    { label: "All-Time High",     value: `$${fmtPrice(ath)}`, sub: `${athPct}% from ATH` },
    { label: "All-Time Low",      value: `$${fmtPrice(atl)}`, sub: `+${atlPct}% from ATL` },
    { label: "Exchange",          value: asset.exchange || (assetType === "crypto" ? "Binance · Coinbase" : assetType === "stock" ? (asset.symbol.length <= 4 ? "NASDAQ · NYSE" : "NYSE") : "CME · COMEX") },
    { label: "Asset Type",        value: assetType.charAt(0).toUpperCase() + assetType.slice(1) },
    { label: "Last Updated",      value: new Date(asset.lastUpdated).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
  ];

  const STAT_W = isMobile ? "calc(50% - 8px)" : "calc(33.33% - 11px)";

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {tradeOpen && asset && (
        <TradeModal
          asset={asset}
          defaultSide={side}
          onClose={() => setTradeOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ borderBottom: `1px solid ${BORD}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/markets" style={{ display: "flex", alignItems: "center", gap: 6, color: MUTED, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Markets
        </Link>
        <span style={{ color: BORD }}>›</span>
        <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{asset.name}</span>
        <span style={{ color: MUTED, fontSize: 13 }}>/ USD</span>
      </div>

      {/* Asset Header */}
      <div style={{
        borderBottom: `1px solid ${BORD}`, padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AssetIcon symbol={asset.symbol} size={40} borderRadius="50%" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{asset.name}</div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em" }}>{asset.symbol} / USD</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, fontFamily: "monospace", letterSpacing: "-0.5px" }}>
            ${fmtPrice(asset.currentPrice)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: pos ? GREEN : RED, display: "flex", alignItems: "center", gap: 4 }}>
            {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {pos ? "+" : ""}{asset.changePercent24h.toFixed(2)}%
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 400, marginLeft: 2 }}>24h</span>
          </span>
        </div>

        {/* Quick stats strip */}
        <div style={{ display: "flex", gap: 28, marginLeft: "auto", flexWrap: "wrap" }}>
          {[
            { label: "24h High",   value: `$${fmtPrice(asset.high24h)}`,                              color: GREEN },
            { label: "24h Low",    value: `$${fmtPrice(asset.low24h)}`,                               color: RED },
            { label: "Volume",     value: asset.volume24h ? fmtCompact(asset.volume24h) : "—",        color: TEXT },
            { label: "Market Cap", value: asset.marketCap ? fmtCompact(asset.marketCap) : "—",        color: TEXT },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 3, letterSpacing: "0.06em" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Trade CTA (mobile-friendly) */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setSide("buy"); setTradeOpen(true); }} style={{
            height: 36, padding: "0 20px", borderRadius: 10, border: "none",
            background: GREEN, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 2px 10px rgba(14,203,129,0.3)",
          }}>Buy</button>
          <button onClick={() => { setSide("sell"); setTradeOpen(true); }} style={{
            height: 36, padding: "0 20px", borderRadius: 10, border: "none",
            background: RED, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 2px 10px rgba(246,70,93,0.25)",
          }}>Sell</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        height: isMobile ? "auto" : "calc(100vh - 232px)", minHeight: isMobile ? 0 : 560,
      }}>
        {/* ── Left: Chart + Info tabs ───────────────────────────────── */}
        <div style={{
          flex: 1, minWidth: 0,
          borderRight: isMobile ? "none" : `1px solid ${BORD}`,
          borderBottom: isMobile ? `1px solid ${BORD}` : "none",
          display: "flex", flexDirection: "column",
          height: isMobile ? "auto" : undefined,
        }}>
          {/* Chart */}
          <div style={{ flex: "0 0 420px", height: isMobile ? 320 : 420 }}>
            {tvSymbol
              ? <TradingViewChart key={`${tvSymbol}-${mode}`} tvSymbol={tvSymbol} theme={mode} />
              : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 size={24} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
                </div>
              )
            }
          </div>

          {/* Info tabs */}
          <div style={{ borderTop: `1px solid ${BORD}`, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", padding: "0 24px", borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
              {(["stats", "about", "news"] as const).map(tab => (
                <button key={tab} onClick={() => setInfoTab(tab)} style={{
                  padding: "12px 0", marginRight: 24, fontSize: 13, fontWeight: 500,
                  color: infoTab === tab ? TEXT : MUTED, background: "none", border: "none",
                  cursor: "pointer",
                  borderBottom: `2px solid ${infoTab === tab ? BLUE : "transparent"}`,
                  transition: "all 0.12s",
                }}>
                  {tab === "stats" ? "Statistics" : tab === "about" ? "About" : "News"}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {infoTab === "stats" && (
                <div>
                  {/* Stat cards grid */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                    {stats.map(s => (
                      <div key={s.label} style={{
                        width: STAT_W, minWidth: 140,
                        background: inputBg, border: `1px solid ${BORD}`,
                        borderRadius: 12, padding: "12px 14px",
                      }}>
                        <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 4, letterSpacing: "0.08em", fontWeight: 500 }}>
                          {s.label.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: (s as any).color || TEXT, fontFamily: "monospace" }}>
                          {s.value}
                        </div>
                        {(s as any).sub && (
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{(s as any).sub}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Fear & Greed + extra info */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 auto", minWidth: 180 }}>
                      <FearGreedGauge value={fearGreedValue} colors={colors} />
                    </div>

                    <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Price range bar */}
                      <div style={{
                        background: inputBg, border: `1px solid ${BORD}`,
                        borderRadius: 12, padding: "14px 16px",
                      }}>
                        <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 8, letterSpacing: "0.08em", fontWeight: 500 }}>
                          52-WEEK RANGE
                        </div>
                        {(() => {
                          const wkLow  = asset.currentPrice * (assetType === "crypto" ? 0.42 : 0.72);
                          const wkHigh = asset.currentPrice * (assetType === "crypto" ? 1.55 : 1.25);
                          const pct    = Math.min(100, Math.max(0, ((asset.currentPrice - wkLow) / (wkHigh - wkLow)) * 100));
                          return (
                            <>
                              <div style={{ position: "relative", height: 5, background: BORD, borderRadius: 3, margin: "8px 0" }}>
                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: BLUE, borderRadius: 3 }} />
                                <div style={{
                                  position: "absolute", top: "50%", left: `${pct}%`,
                                  transform: "translate(-50%,-50%)",
                                  width: 12, height: 12, borderRadius: "50%",
                                  background: BLUE, border: `2px solid ${CARD}`,
                                  boxShadow: `0 0 0 2px ${BLUE}`,
                                }} />
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                                <span>${fmtPrice(wkLow)}</span>
                                <span>${fmtPrice(wkHigh)}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Vol/MCap ratio */}
                      {asset.marketCap && asset.volume24h && (
                        <div style={{
                          background: inputBg, border: `1px solid ${BORD}`,
                          borderRadius: 12, padding: "14px 16px",
                        }}>
                          <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 6, letterSpacing: "0.08em", fontWeight: 500 }}>
                            VOLUME / MARKET CAP
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
                            {((asset.volume24h / asset.marketCap) * 100).toFixed(2)}%
                          </div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>daily turnover ratio</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {infoTab === "about" && (
                <div style={{ maxWidth: 680 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <AssetIcon symbol={asset.symbol} size={32} borderRadius="50%" />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{asset.name}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{asset.symbol} · {assetType.charAt(0).toUpperCase() + assetType.slice(1)}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>
                    {asset.description ||
                      `${asset.name} (${asset.symbol}) is a ${assetType === "crypto" ? "digital asset" : assetType === "stock" ? "publicly-traded equity" : "commodity"} traded on INT Brokers with institutional-grade execution, deep liquidity, and tight spreads.\n\nAccess real-time pricing, professional charting tools, and seamless order execution across all market conditions. INT Brokers provides direct market access with no hidden fees and transparent pricing.`
                    }
                  </p>

                  <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      asset.exchange && { label: "Exchange", val: asset.exchange },
                      { label: "Asset Class", val: assetType.charAt(0).toUpperCase() + assetType.slice(1) },
                      { label: "Ticker", val: asset.symbol },
                    ].filter(Boolean).map((item: any) => (
                      <div key={item.label} style={{
                        padding: "8px 14px", borderRadius: 10,
                        background: inputBg, border: `1px solid ${BORD}`,
                        fontSize: 12, color: TEXT,
                      }}>
                        <span style={{ color: MUTED }}>{item.label}: </span>
                        <span style={{ fontWeight: 600 }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {infoTab === "news" && (
                <NewsSection
                  symbol={asset.symbol}
                  name={asset.name}
                  assetType={assetType}
                  colors={colors}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Trade Form + Order Book ───────────────────────── */}
        <div style={{
          width: isMobile ? "100%" : 320, flexShrink: 0,
          display: "flex", flexDirection: "column",
          overflowY: isMobile ? "visible" : "auto",
          background: CARD,
        }}>
          {/* Buy / Sell Toggle */}
          <div style={{ padding: 16, borderBottom: `1px solid ${BORD}` }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
              background: BG, borderRadius: 12, padding: 4,
              border: `1px solid ${BORD}`, marginBottom: 16,
            }}>
              {(["buy", "sell"] as const).map(s => (
                <button key={s} onClick={() => setSide(s)} style={{
                  height: 36, borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                  background: side === s ? (s === "buy" ? GREEN : RED) : "transparent",
                  color: side === s ? "#fff" : MUTED,
                  boxShadow: side === s ? `0 2px 8px ${s === "buy" ? "rgba(14,203,129,0.3)" : "rgba(246,70,93,0.3)"}` : "none",
                }}>{s === "buy" ? "Buy" : "Sell"}</button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, letterSpacing: "0.06em" }}>ORDER TYPE</div>
            <div style={{ height: 38, background: inputBg, border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 12px", color: TEXT, fontSize: 13, marginBottom: 14 }}>
              Market
            </div>

            <form onSubmit={handleTrade}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, display: "flex", justifyContent: "space-between", letterSpacing: "0.06em" }}>
                  <span>AMOUNT (USD)</span>
                  <span style={{ color: side === "buy" && amtNum > availableCash ? RED : MUTED }}>
                    Avail: ${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{
                  height: 44, background: inputBg,
                  border: `1.5px solid ${isInsufficient ? RED : amtNum > 0 ? BLUE : BORD}`,
                  borderRadius: 8, display: "flex", alignItems: "center", padding: "0 12px",
                  transition: "border-color 0.15s",
                }}>
                  <span style={{ color: MUTED, marginRight: 6, fontSize: 13 }}>$</span>
                  <input
                    type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" min={0}
                    style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, width: "100%", fontFamily: "monospace" }}
                  />
                </div>
                {isInsufficient && (
                  <div style={{ fontSize: 11, color: RED, marginTop: 5 }}>Insufficient balance</div>
                )}
                {amtNum > 0 && asset.currentPrice > 0 && (
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 5, textAlign: "right", fontFamily: "monospace" }}>
                    ≈ {(amtNum / asset.currentPrice).toFixed(6)} {asset.symbol}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} type="button"
                    onClick={() => setAmount(((availableCash * pct) / 100).toFixed(2))}
                    style={{
                      flex: 1, height: 28, fontSize: 11, borderRadius: 6,
                      background: "transparent", border: `1px solid ${BORD}`,
                      color: MUTED, cursor: "pointer",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BLUE; }}
                    onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORD; }}
                  >{pct}%</button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => { setTradeOpen(true); }}
                disabled={!amtNum || isInsufficient}
                style={{
                  width: "100%", height: 44, borderRadius: 10, border: "none",
                  cursor: !amtNum || isInsufficient ? "not-allowed" : "pointer",
                  background: side === "buy" ? GREEN : RED,
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  opacity: !amtNum ? 0.65 : 1,
                  boxShadow: amtNum && !isInsufficient
                    ? `0 4px 14px ${side === "buy" ? "rgba(14,203,129,0.35)" : "rgba(246,70,93,0.35)"}` : "none",
                  transition: "all 0.15s",
                }}
              >
                {`${side === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
              </button>
            </form>
          </div>

          {/* Order Book */}
          <div style={{ flex: 1, padding: "12px 16px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <BarChart2 size={13} style={{ color: MUTED }} strokeWidth={1.5} />
              <span style={{ fontSize: 12, fontWeight: 600, color: TEXT, letterSpacing: "0.04em" }}>ORDER BOOK</span>
            </div>
            <OrderBook price={asset.currentPrice} symbol={asset.symbol} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
