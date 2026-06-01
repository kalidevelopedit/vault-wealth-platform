import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { AssetIcon } from "@/components/AssetIcon";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/use-auth";
import { makeFmt } from "@/lib/currency";
import {
  useGetPortfolioSummary, useGetHoldings, useGetTransactions,
  useListAssets, useGetWatchlist, useGetMarketNews,
  ListAssetsType,
} from "@workspace/api-client-react";
import {
  TrendingUp, TrendingDown, Star, Flame, ArrowDownToLine,
  ArrowUpFromLine, Clock, ExternalLink, ChevronRight,
  Loader2, Search, Repeat2, BarChart2, Calculator, Wifi,
} from "lucide-react";

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmt2 = (n: number) =>
  isNaN(n) ? "0.00" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtUSD = (n: number) => "$" + fmt2(n);

const fmtCompact = (n: number) => {
  if (!n || isNaN(n)) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2)  + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2)  + "M";
  if (n >= 1e3)  return "$" + (n / 1e3).toFixed(2)  + "K";
  return fmtUSD(n);
};

const fmtPrice = (n: number) => {
  if (!n || isNaN(n)) return "$0.00";
  if (n < 0.0001) return "$" + n.toFixed(8);
  if (n < 0.01)   return "$" + n.toFixed(6);
  if (n < 1)      return "$" + n.toFixed(4);
  return fmtUSD(n);
};

const timeAgo = (d: string) => {
  try {
    const ms = Date.now() - new Date(d).getTime();
    const h = Math.floor(ms / 3_600_000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    return days < 7 ? `${days}d ago` : new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

// ── Sparkline bar ──────────────────────────────────────────────────────────────
function SparkBar({ pct }: { pct: number }) {
  const { colors, mode } = useTheme();
  const isPos = pct >= 0;
  const BARS = 10;
  const lit = Math.min(BARS, Math.round((Math.abs(pct) / 8) * BARS));
  // stable heights per instance (seeded from pct to avoid hydration mismatch)
  const heights = useMemo(() => {
    const seed = Math.abs(pct * 1000);
    return Array.from({ length: BARS }, (_, i) => 30 + ((seed * (i + 1) * 7919) % 65));
  }, [pct]);
  const dim = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, height: `${h}%`, borderRadius: 1,
          background: i < lit ? (isPos ? colors.green : colors.red) : dim,
          opacity: i < lit ? 0.9 : 0.35,
        }} />
      ))}
    </div>
  );
}

// ── Portfolio Hero ─────────────────────────────────────────────────────────────
function PortfolioHeroInner() {
  const { mode } = useTheme();
  const { user } = useAuth();
  const { fmt: fmtLocal } = makeFmt(user?.country);
  const { data: summary, isLoading } = useGetPortfolioSummary();
  const s = summary as any;
  const total    = Number(s?.totalAssets)          || 0;
  const dayPnl   = Number(s?.dayChange)            || 0;
  const dayPct   = Number(s?.dayChangePercentage)  || 0;
  const cash     = Number(s?.availableCash)        || 0;
  const invested = Math.max(0, total - cash);
  const isGain   = dayPnl >= 0;

  const heroBg = mode === "dark"
    ? "linear-gradient(135deg, #0f1733 0%, #111827 55%, #0a0d18 100%)"
    : "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 55%, #2563eb 100%)";
  const heroBord  = mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.15)";
  const heroText  = "rgba(255,255,255,0.95)";
  const heroMuted = "rgba(255,255,255,0.55)";
  const heroDim   = "rgba(255,255,255,0.15)";
  const green = "#22c55e";
  const red   = "#ef4444";

  return (
    <div style={{
      background: heroBg, border: `1px solid ${heroBord}`,
      borderRadius: 16, padding: "28px 28px 24px",
      marginBottom: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -80, right: 80, width: 260, height: 260, borderRadius: "50%", background: "rgba(99,102,241,0.08)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -40, left: 40, width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.06)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "16px 40px", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10.5, color: heroMuted, letterSpacing: "0.13em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Total Portfolio Value</p>
          {isLoading ? (
            <div style={{ height: 52, display: "flex", alignItems: "center" }}>
              <Loader2 size={20} style={{ color: heroMuted, animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 38, fontWeight: 700, color: heroText, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{fmtLocal(total)}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: isGain ? green : red }}>
                  {isGain ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
                  {isGain ? "+" : ""}{fmtLocal(dayPnl)} ({isGain ? "+" : ""}{fmt2(dayPct)}%)
                </span>
                <span style={{ fontSize: 12, color: heroMuted }}>24h</span>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "24px 36px", flexWrap: "wrap" }}>
          {[["Available Cash", fmtLocal(cash)], ["Invested", fmtLocal(invested)]].map(([lbl, val]) => (
            <div key={lbl}>
              <p style={{ fontSize: 10.5, color: heroMuted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>{lbl}</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: heroText, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {([
            { label: "Deposit",  href: "/wallet",  Icon: ArrowDownToLine, primary: true  },
            { label: "Withdraw", href: "/wallet",  Icon: ArrowUpFromLine, primary: false },
            { label: "Trade",    href: "/markets", Icon: BarChart2,       primary: false },
            { label: "Convert",  href: "/convert", Icon: Repeat2,         primary: false },
          ] as const).map(({ label, href, Icon, primary }) => (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              background: primary ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.10)",
              border: `1px solid ${primary ? "transparent" : heroDim}`,
              color: primary ? "#111" : heroText,
              fontSize: 13, fontWeight: 600, textDecoration: "none",
              backdropFilter: "blur(8px)",
            }}>
              <Icon size={14} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioHero() {
  return (
    <ErrorBoundary section="Portfolio Summary">
      <PortfolioHeroInner />
    </ErrorBoundary>
  );
}

// ── ROI Calculator ─────────────────────────────────────────────────────────────
const ROI_SCENARIOS = [
  { label: "Conservative", rate: 0.08, desc: "Bonds & Fixed Income",  color: "#6366f1" },
  { label: "Balanced",     rate: 0.15, desc: "Diversified Portfolio", color: "#3b82f6" },
  { label: "Aggressive",   rate: 0.32, desc: "Growth & Crypto Focus", color: "#22c55e" },
] as const;
const PRESETS = [1000, 5000, 10000, 50000] as const;

function ROICalculatorInner() {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE } = colors;
  const [amount, setAmount]   = useState(10000);
  const [customVal, setCustomVal] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const invest  = useCustom ? (parseFloat(customVal.replace(/,/g, "")) || 10000) : amount;
  const project = (rate: number, yrs: number) => invest * Math.pow(1 + rate, yrs);
  const dim     = mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";

  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <Calculator size={15} style={{ color: BLUE }} strokeWidth={1.5} />
        <h2 style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: 0 }}>Investment Return Calculator</h2>
        <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>Illustrative estimates · past returns don't guarantee future results</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: MUTED }}>If you invest:</span>
        {PRESETS.map(p => {
          const active = !useCustom && amount === p;
          return (
            <button key={p}
              onClick={() => { setAmount(p); setUseCustom(false); setCustomVal(""); }}
              style={{
                padding: "5px 13px", borderRadius: 8, cursor: "pointer",
                background: active ? BLUE : "transparent",
                border: `1px solid ${active ? BLUE : BORD}`,
                color: active ? "#fff" : TEXT,
                fontSize: 12.5, fontWeight: 600,
              }}
            >{p >= 1000 ? `$${p / 1000}K` : `$${p}`}</button>
          );
        })}
        <input
          type="text" inputMode="numeric" placeholder="Custom amount..."
          value={customVal}
          onChange={e => { setCustomVal(e.target.value); setUseCustom(true); }}
          onFocus={() => setUseCustom(true)}
          style={{
            width: 120, padding: "5px 10px", borderRadius: 8, outline: "none",
            background: "transparent",
            border: `1px solid ${useCustom ? BLUE : BORD}`,
            color: TEXT, fontSize: 12.5,
          }}
        />
      </div>

      <div className="roi-grid">
        {ROI_SCENARIOS.map(s => (
          <div key={s.label} style={{ background: dim, border: `1px solid ${BORD}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>{s.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginTop: 4 }}>{(s.rate * 100).toFixed(0)}% avg / year</div>
            </div>
            {([1, 3, 5, 10] as const).map(yrs => {
              const val  = project(s.rate, yrs);
              const gain = val - invest;
              return (
                <div key={yrs} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>{yrs}Y</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>{fmtUSD(val)}</div>
                    <div style={{ fontSize: 10.5, color: s.color }}>+{fmtUSD(gain)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ROICalculator() {
  return (
    <ErrorBoundary section="ROI Calculator">
      <ROICalculatorInner />
    </ErrorBoundary>
  );
}

// ── Market Overview ────────────────────────────────────────────────────────────
type AssetRow = {
  symbol: string; name: string; assetType?: string;
  currentPrice: number; change24h?: number; changePercent24h: number;
  marketCap?: number | null; logoUrl?: string | null;
};
type TabId = "hot" | "favorites" | "all" | "crypto" | "stocks" | "metals" | "futures";

const MARKET_TABS: { id: TabId; label: string; icon?: React.ReactNode }[] = [
  { id: "hot",       label: "Hot",        icon: <Flame size={12} /> },
  { id: "favorites", label: "Favorites",  icon: <Star size={12} /> },
  { id: "all",       label: "All Markets" },
  { id: "crypto",    label: "Crypto" },
  { id: "stocks",    label: "Stocks" },
  { id: "metals",    label: "Metals" },
  { id: "futures",   label: "Futures" },
];

function MarketOverviewInner() {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED } = colors;

  const [tab, setTab]       = useState<TabId>("hot");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "change" | "cap">("change");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [, navigate]         = useLocation();

  const OPTS = { query: { refetchInterval: 30_000 } as any };
  const { data: allRaw,    isLoading: lAll    } = useListAssets(undefined,                                  OPTS);
  const { data: cryptoRaw, isLoading: lCrypto } = useListAssets({ type: ListAssetsType.crypto },            OPTS);
  const { data: stockRaw,  isLoading: lStock  } = useListAssets({ type: ListAssetsType.stock },             OPTS);
  const { data: metalRaw,  isLoading: lMetal  } = useListAssets({ type: ListAssetsType.commodity },        OPTS);
  const { data: watchRaw }                       = useGetWatchlist({ query: {} as any });

  const isLoading = lAll || lCrypto || lStock || lMetal;

  const watchSet = useMemo(() =>
    new Set(Array.isArray(watchRaw) ? (watchRaw as any[]).map((w: any) => w?.symbol).filter(Boolean) : []),
    [watchRaw]
  );

  const all    = Array.isArray(allRaw)    ? (allRaw    as any[]) as AssetRow[] : [];
  const crypto = Array.isArray(cryptoRaw) ? (cryptoRaw as any[]) as AssetRow[] : [];
  const stocks = Array.isArray(stockRaw)  ? (stockRaw  as any[]) as AssetRow[] : [];
  const metals = Array.isArray(metalRaw)  ? (metalRaw  as any[]) as AssetRow[] : [];

  const base = useMemo((): AssetRow[] => {
    switch (tab) {
      case "hot":       return [...all].sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0)).slice(0, 15);
      case "favorites": return all.filter(a => watchSet.has(a.symbol));
      case "crypto":    return crypto;
      case "stocks":    return stocks;
      case "metals":    return metals;
      case "futures":   return [];
      default:          return all;
    }
  }, [tab, all, crypto, stocks, metals, watchSet]);

  const rows = useMemo(() => {
    let list = base;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const d = sortBy === "price"  ? (a.currentPrice     ?? 0) - (b.currentPrice     ?? 0)
              : sortBy === "change" ? (a.changePercent24h ?? 0) - (b.changePercent24h ?? 0)
              :                       (a.marketCap        ?? 0) - (b.marketCap        ?? 0);
      return sortDir === "desc" ? -d : d;
    });
  }, [base, search, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const COL     = "36px 1fr 110px 80px 110px 56px 60px";
  const shimmer = mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const shimmerD = mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORD}`, padding: "0 14px", overflowX: "auto" }}>
        {MARKET_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "12px 11px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? TEXT : MUTED,
            borderBottom: tab === t.id ? `2px solid ${BLUE}` : "2px solid transparent",
            marginBottom: -1, whiteSpace: "nowrap",
          }}>
            {t.icon && <span style={{ color: tab === t.id ? (t.id === "hot" ? "#f97316" : BLUE) : MUTED }}>{t.icon}</span>}
            {t.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "0 0 0 10px", flexShrink: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: GREEN, fontWeight: 600 }}>
            <Wifi size={9} strokeWidth={2} /> LIVE
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${BORD}`, borderRadius: 8, padding: "5px 9px" }}>
            <Search size={11} style={{ color: MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..."
              style={{ background: "none", border: "none", outline: "none", color: TEXT, fontSize: 12.5, width: 68 }} />
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: COL, padding: "7px 14px", borderBottom: `1px solid ${BORD}`, gap: 8 }}>
        {(["#", "Name", "Price", "24h %", "Market Cap", "7d", ""] as const).map((lbl, i) => (
          <div key={i}
            onClick={() => {
              if (lbl === "Price") toggleSort("price");
              else if (lbl === "24h %") toggleSort("change");
              else if (lbl === "Market Cap") toggleSort("cap");
            }}
            style={{
              fontSize: 10.5, fontWeight: 600, color: MUTED, letterSpacing: "0.07em",
              textTransform: "uppercase", cursor: ["Price", "24h %", "Market Cap"].includes(lbl) ? "pointer" : "default",
              display: "flex", alignItems: "center", gap: 2,
              justifyContent: i >= 2 ? "flex-end" : "flex-start",
            }}>
            {lbl}
            {(lbl === "Price"      && sortBy === "price")  && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
            {(lbl === "24h %"      && sortBy === "change") && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
            {(lbl === "Market Cap" && sortBy === "cap")    && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 390, overflowY: "auto" }}>
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: COL, padding: "10px 14px", borderBottom: `1px solid ${BORD}`, gap: 8, alignItems: "center" }}>
              <div style={{ height: 12, width: 16, borderRadius: 4, background: shimmer }} />
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 27, height: 27, borderRadius: "50%", background: shimmer, flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ height: 11, width: 50, borderRadius: 4, background: shimmerD }} />
                  <div style={{ height: 9,  width: 80, borderRadius: 4, background: shimmer }} />
                </div>
              </div>
              <div style={{ height: 12, width: 70, borderRadius: 4, background: shimmer, marginLeft: "auto" }} />
              <div style={{ height: 12, width: 50, borderRadius: 4, background: shimmer, marginLeft: "auto" }} />
              <div style={{ height: 12, width: 60, borderRadius: 4, background: shimmer, marginLeft: "auto" }} />
              <div style={{ height: 20, width: 40, borderRadius: 4, background: shimmer, margin: "0 auto" }} />
              <div style={{ height: 26, width: 50, borderRadius: 6, background: shimmer, marginLeft: "auto" }} />
            </div>
          ))
        ) : tab === "futures" ? (
          <div style={{ padding: "30px", textAlign: "center", color: MUTED, fontSize: 13 }}>
            Futures trading coming soon
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: MUTED, fontSize: 13 }}>
            {tab === "favorites"
              ? <><span>No watchlist items. </span><Link href="/markets" style={{ color: BLUE, textDecoration: "none" }}>Browse markets →</Link></>
              : "No assets match your filter"}
          </div>
        ) : rows.map((a, rowIdx) => {
          const pos = (a.changePercent24h ?? 0) >= 0;
          return (
            <div key={a.symbol}
              onClick={() => navigate(`/assets/${a.symbol}`)}
              style={{ display: "grid", gridTemplateColumns: COL, padding: "9px 14px", borderBottom: `1px solid ${BORD}`, gap: 8, alignItems: "center", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.022)" : "rgba(0,0,0,0.022)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 11.5, color: MUTED }}>{rowIdx + 1}</span>

              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                <AssetIcon symbol={a.symbol} size={27} borderRadius="50%" />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: 0 }}>{a.symbol}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: 13.5, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>{fmtPrice(a.currentPrice ?? 0)}</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                {pos ? <TrendingUp size={11} style={{ color: GREEN }} strokeWidth={2.5} /> : <TrendingDown size={11} style={{ color: RED }} strokeWidth={2.5} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: pos ? GREEN : RED }}>{pos ? "+" : ""}{fmt2(a.changePercent24h ?? 0)}%</span>
              </div>

              <div style={{ textAlign: "right", fontSize: 12, color: MUTED }}>{fmtCompact(a.marketCap ?? 0)}</div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <SparkBar pct={a.changePercent24h ?? 0} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href={`/assets/${a.symbol}`} onClick={e => e.stopPropagation()} style={{
                  padding: "5px 10px", borderRadius: 6,
                  background: mode === "dark" ? "rgba(37,99,255,0.12)" : "rgba(37,99,255,0.08)",
                  border: "1px solid rgba(37,99,255,0.28)",
                  color: BLUE, fontSize: 11.5, fontWeight: 600, textDecoration: "none",
                }}>Buy</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: MUTED }}>Prices refresh every 30s</span>
        <Link href="/markets" style={{ fontSize: 12.5, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          View all markets <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

function MarketOverview() {
  return (
    <ErrorBoundary section="Market Overview">
      <MarketOverviewInner />
    </ErrorBoundary>
  );
}

// ── Portfolio Panel ────────────────────────────────────────────────────────────
const TX_LABEL: Record<string, string> = {
  buy: "BUY", sell: "SELL", deposit: "DEPOSIT", withdraw: "WITHDRAW",
  bank_transfer: "BANK TRANSFER", crypto_deposit: "CRYPTO DEPOSIT",
  crypto_withdraw: "CRYPTO WITHDRAW",
};

function PortfolioPanelInner() {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED } = colors;

  const { data: holdings, isLoading: hLoad } = useGetHoldings({ query: {} as any });
  const { data: txRaw,    isLoading: tLoad } = useGetTransactions({ limit: 8 });

  const holdList = Array.isArray(holdings) ? (holdings as any[]) : [];
  const txList   = Array.isArray(txRaw)    ? (txRaw    as any[]).slice(0, 8) : [];

  const dim = mode === "dark" ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Holdings */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: 0 }}>My Holdings</h3>
          <Link href="/markets" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>All <ChevronRight size={12} /></Link>
        </div>

        {hLoad ? (
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
            <Loader2 size={18} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : holdList.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", background: dim }}>
              <BarChart2 size={18} style={{ color: MUTED }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: "0 0 5px" }}>No positions yet</p>
            <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px", lineHeight: 1.55 }}>Deposit funds and browse markets<br/>to make your first trade</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Link href="/wallet"  style={{ padding: "7px 14px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>Deposit</Link>
              <Link href="/markets" style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${BORD}`, color: TEXT, fontSize: 12.5, fontWeight: 500, textDecoration: "none" }}>Browse Markets</Link>
            </div>
          </div>
        ) : holdList.slice(0, 7).map((h: any) => {
          const price = Number(h?.currentPrice ?? h?.avgCost) || 0;
          const qty   = Number(h?.quantity) || 0;
          const avg   = Number(h?.avgCost)  || 0;
          const value = qty * price;
          const pnl   = value - qty * avg;
          const pos   = pnl >= 0;
          return (
            <Link key={h?.symbol ?? Math.random()} href={`/assets/${h?.symbol}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: `1px solid ${BORD}`, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <AssetIcon symbol={h?.symbol ?? ""} size={28} borderRadius="50%" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0 }}>{h?.symbol ?? "—"}</p>
                  <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{qty.toFixed(4)} units</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0 }}>{fmtUSD(value)}</p>
                <p style={{ fontSize: 11, color: pos ? GREEN : RED, margin: 0 }}>{pos ? "+" : ""}{fmtUSD(pnl)}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: 0 }}>Recent Activity</h3>
          <Link href="/wallet" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>All <ChevronRight size={12} /></Link>
        </div>

        {tLoad ? (
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
            <Loader2 size={18} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : txList.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", background: dim }}>
              <Clock size={18} style={{ color: MUTED }} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: "0 0 5px" }}>No activity yet</p>
            <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px", lineHeight: 1.55 }}>Your transaction history<br/>will appear here</p>
            <Link href="/wallet" style={{ padding: "7px 14px", borderRadius: 8, background: BLUE, color: "#fff", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>Make a Deposit</Link>
          </div>
        ) : txList.map((tx: any, i: number) => {
          const type     = String(tx?.type ?? "");
          const isCredit = ["buy", "deposit", "bank_transfer", "crypto_deposit"].includes(type);
          const label    = TX_LABEL[type] ?? type.toUpperCase();
          const amount   = Number(tx?.total ?? tx?.amount) || 0;
          const sym      = tx?.symbol as string | undefined;
          return (
            <div key={tx?.id ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: `1px solid ${BORD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: dim, border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {sym ? <AssetIcon symbol={sym} size={20} borderRadius="50%" /> : <Clock size={13} style={{ color: MUTED }} strokeWidth={1.5} />}
                </div>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, margin: 0 }}>
                    {sym ?? (type === "deposit" || type === "bank_transfer" ? "Deposit" : type === "withdraw" ? "Withdraw" : label)}
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{tx?.createdAt ? timeAgo(String(tx.createdAt)) : ""}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: isCredit ? GREEN : RED, margin: 0 }}>{isCredit ? "+" : "-"}{fmtUSD(amount)}</p>
                <p style={{ fontSize: 10, color: MUTED, margin: 0, letterSpacing: "0.07em" }}>{label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortfolioPanel() {
  return (
    <ErrorBoundary section="Portfolio Panel">
      <PortfolioPanelInner />
    </ErrorBoundary>
  );
}

// ── News Section ───────────────────────────────────────────────────────────────
const NEWS_CATS = ["All", "Crypto", "Stocks", "Macro", "Commodities", "ETF"] as const;

type NewsItem = {
  id: number; title: string; summary?: string | null;
  source: string; url?: string | null; imageUrl?: string | null;
  category?: string | null; publishedAt: string;
};

const FALLBACK_NEWS: NewsItem[] = [
  { id: 1, title: "Bitcoin consolidates above $107K as institutional demand grows",   summary: "Major asset managers continue accumulating BTC positions as macro uncertainty persists.",           source: "CryptoDesk",       url: "#", category: "crypto",      publishedAt: new Date().toISOString() },
  { id: 2, title: "Ethereum network upgrade set to reduce gas fees by up to 80%",     summary: "The upcoming network upgrade promises significant improvements to transaction throughput.",            source: "ETH Daily",        url: "#", category: "crypto",      publishedAt: new Date().toISOString() },
  { id: 3, title: "NVDA surges 4.2% after record AI chip revenue beats expectations", summary: "Nvidia's data center division posts record quarterly earnings on surging AI compute demand.",        source: "MarketWatch",       url: "#", category: "stocks",      publishedAt: new Date().toISOString() },
  { id: 4, title: "S&P 500 closes at all-time high for third consecutive week",       summary: "Strong earnings season fuels continued equity market momentum across all major sectors.",             source: "Reuters",           url: "#", category: "stocks",      publishedAt: new Date().toISOString() },
  { id: 5, title: "Gold hits 6-month high at $3,320/oz amid geopolitical tensions",   summary: "Safe-haven demand drives precious metals to multi-month highs as uncertainty mounts.",              source: "Commodities Today", url: "#", category: "commodities", publishedAt: new Date().toISOString() },
  { id: 6, title: "Federal Reserve signals potential rate pause amid inflation data",  summary: "Markets rally on expectations the Fed may hold rates steady at the next policy meeting.",           source: "Bloomberg",         url: "#", category: "macro",       publishedAt: new Date().toISOString() },
];

function timeAgoNews(s: string) {
  try {
    const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
    if (m < 2)    return "Just now";
    if (m < 60)   return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  } catch { return ""; }
}

function NewsSectionInner() {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE } = colors;
  const [cat, setCat] = useState<typeof NEWS_CATS[number]>("All");

  // API only supports limit — filter by category client-side
  const { data: newsRaw } = useGetMarketNews({ limit: 20 }, { query: {} as any });
  const apiNews: NewsItem[] = Array.isArray(newsRaw) ? (newsRaw as any[]) : [];
  const allNews             = apiNews.length > 0 ? apiNews : FALLBACK_NEWS;

  const shown = cat === "All"
    ? allNews
    : allNews.filter((n: NewsItem) => (n.category ?? "").toLowerCase().includes(cat.toLowerCase()));

  const displayed = shown.length > 0 ? shown : allNews;

  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
      <div style={{ padding: "13px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: 0 }}>Market News</h3>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {NEWS_CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
              background: cat === c ? BLUE : mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              color: cat === c ? "#fff" : MUTED, fontSize: 11.5, fontWeight: cat === c ? 600 : 400, whiteSpace: "nowrap",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div className="news-grid">
        {displayed.slice(0, 6).map((a: NewsItem) => (
          <a key={a.id} href={a.url && a.url !== "#" ? a.url : undefined}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", flexDirection: "column", padding: 20, textDecoration: "none", borderRight: `1px solid ${BORD}`, borderBottom: `1px solid ${BORD}`, cursor: a.url && a.url !== "#" ? "pointer" : "default" }}
            onMouseEnter={e => (e.currentTarget.style.background = mode === "dark" ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {a.imageUrl && (
              <img src={a.imageUrl} alt="" style={{ width: "100%", height: 118, objectFit: "cover", borderRadius: 8, marginBottom: 12 }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              {a.category && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: BLUE, textTransform: "uppercase" }}>{a.category}</span>}
              <span style={{ fontSize: 11, color: MUTED }}>{timeAgoNews(a.publishedAt)}</span>
            </div>
            <h4 style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, margin: "0 0 6px", lineHeight: 1.45 }}>{a.title}</h4>
            {a.summary && <p style={{ fontSize: 12, color: MUTED, margin: "0 0 10px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{a.summary}</p>}
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, color: MUTED }}>{a.source}</span>
              {a.url && a.url !== "#" && <ExternalLink size={10} style={{ color: MUTED }} />}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function NewsSection() {
  return (
    <ErrorBoundary section="Market News">
      <NewsSectionInner />
    </ErrorBoundary>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <>
      <style>{`
        .dash-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .roi-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .news-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1100px) {
          .dash-grid { grid-template-columns: 1fr; }
          .news-grid { grid-template-columns: repeat(2, 1fr); }
          .roi-grid  { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .news-grid { grid-template-columns: 1fr; }
          .roi-grid  { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ padding: "20px 20px 48px" }}>
        <PortfolioHero />
        <ROICalculator />
        <div className="dash-grid">
          <MarketOverview />
          <PortfolioPanel />
        </div>
        <NewsSection />
      </div>
    </>
  );
}
