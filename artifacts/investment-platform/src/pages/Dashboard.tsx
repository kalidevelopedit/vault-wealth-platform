import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AssetIcon } from "@/components/AssetIcon";
import {
  useGetPortfolioSummary, useGetPortfolioPerformance,
  useGetHoldings, useGetAssetMix, useGetMarketNews,
} from "@workspace/api-client-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, Zap, Loader2, ArrowRight,
  Eye, EyeOff, Star, RefreshCw,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG    = "#0b0e17";
const CARD  = "#141820";
const CARD2 = "#0f1320";
const BORD  = "rgba(255,255,255,0.06)";
const BORD2 = "rgba(255,255,255,0.04)";
const TEXT  = "rgba(255,255,255,0.9)";
const TEXT2 = "rgba(255,255,255,0.55)";
const MUTED = "rgba(255,255,255,0.3)";
const BLUE  = "#3b82f6";
const GAIN  = "#26a17b";
const LOSS  = "#ef4444";
const WARN  = "#f0b90b";
const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#26a17b"];

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}k`
  : `$${fmtUSD(n)}`;
function genUID(id: number) { return `VW-${String(id).padStart(6, "0")}`; }

// ─── Cat colors ───────────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  CRYPTO: "#3b82f6", STOCK: "#26a17b", COMMOD: "#f0b90b", FUTURE: "#8b5cf6",
};

// ─── Live Feed Data ──────────────────────────────────────────────────────────
const USERNAMES = [
  "phantom_x82","silk.trader","nova_vlt","xero.fin","blaze_q","frost.cap",
  "axon_fx","dusk_algo","apex.trd","zephyr88","meridian","cipher_v",
  "delta.arc","prime.edg","vantage_k","echo_xbt","lyric.cap","storm_q",
  "pulse_fx","orbit.ve","solstice","vaulter9","nebula_x","crane.fi",
  "synth_q","mirage.v","haven_99","stratos","cobalt.x","trident8",
  "iron.cap","velvet.q","mosaic_x","glacier","raptor_v","zenith.fi",
  "ember_q","cascade.x","horizon8","luminary","prism.cap","vertex_q",
  "neon.arb","spectra_x","tungsten","cascade_q","aurora.fi","ironwood",
];
const FEED_ASSETS = [
  { symbol: "BTC",  name: "Bitcoin",    cat: "CRYPTO" },
  { symbol: "ETH",  name: "Ethereum",   cat: "CRYPTO" },
  { symbol: "SOL",  name: "Solana",     cat: "CRYPTO" },
  { symbol: "BNB",  name: "BNB",        cat: "CRYPTO" },
  { symbol: "AAPL", name: "Apple",      cat: "STOCK"  },
  { symbol: "TSLA", name: "Tesla",      cat: "STOCK"  },
  { symbol: "NVDA", name: "NVIDIA",     cat: "STOCK"  },
  { symbol: "MSFT", name: "Microsoft",  cat: "STOCK"  },
  { symbol: "META", name: "Meta",       cat: "STOCK"  },
  { symbol: "XAU",  name: "Gold Spot",  cat: "COMMOD" },
  { symbol: "XAG",  name: "Silver",     cat: "COMMOD" },
  { symbol: "ES",   name: "S&P Futures",cat: "FUTURE" },
  { symbol: "NQ",   name: "Nasdaq Fut.",cat: "FUTURE" },
];
const SIDES = ["Bought","Sold","Opened Long","Closed Short","Opened Short"] as const;
function rndItem<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function genTrade(id: number) {
  const asset = rndItem(FEED_ASSETS);
  const side  = rndItem(SIDES);
  const val   = Math.random() * 9800 + 200;
  const pos   = side === "Bought" || side === "Opened Long"
    ? Math.random() > 0.45 : Math.random() > 0.55;
  const pct   = (Math.random() * 8.4 + 0.2).toFixed(2);
  const change = val * parseFloat(pct) / 100;
  return { id, user: rndItem(USERNAMES), asset, side, value: val, pct, change, positive: pos, ago: Math.floor(Math.random() * 59) + 1 };
}
function buildFeed() { return Array.from({ length: 20 }, (_, i) => genTrade(i)); }

// ─── Recommendations ─────────────────────────────────────────────────────────
const RECS: Record<string, { symbol: string; name: string; cat: string; why: string; target: string; conf: number }[]> = {
  crypto: [
    { symbol: "BTC",   name: "Bitcoin",   cat: "CRYPTO", why: "Most held asset on platform",          target: "+18%", conf: 87 },
    { symbol: "ETH",   name: "Ethereum",  cat: "CRYPTO", why: "High conviction institutional holders", target: "+24%", conf: 81 },
    { symbol: "SOL",   name: "Solana",    cat: "CRYPTO", why: "Strong DeFi momentum",                 target: "+31%", conf: 74 },
  ],
  stock: [
    { symbol: "NVDA",  name: "NVIDIA",    cat: "STOCK",  why: "AI sector aligns with growth goals",   target: "+22%", conf: 89 },
    { symbol: "AAPL",  name: "Apple",     cat: "STOCK",  why: "Stable dividend + growth profile",     target: "+14%", conf: 83 },
    { symbol: "MSFT",  name: "Microsoft", cat: "STOCK",  why: "Cloud revenue growth, low volatility", target: "+17%", conf: 80 },
  ],
  commodity: [
    { symbol: "XAU",   name: "Gold Spot", cat: "COMMOD", why: "Inflation hedge, conservative goals",  target: "+11%", conf: 79 },
    { symbol: "XAG",   name: "Silver",    cat: "COMMOD", why: "Industrial demand surge expected",     target: "+19%", conf: 72 },
    { symbol: "CRUDE", name: "Crude Oil", cat: "COMMOD", why: "OPEC+ cuts support price floor",       target: "+13%", conf: 70 },
  ],
  default: [
    { symbol: "BTC",   name: "Bitcoin",   cat: "CRYPTO", why: "Most held asset on this platform",    target: "+18%", conf: 85 },
    { symbol: "NVDA",  name: "NVIDIA",    cat: "STOCK",  why: "AI sector outperforming benchmark",   target: "+22%", conf: 82 },
    { symbol: "XAU",   name: "Gold Spot", cat: "COMMOD", why: "Global safe-haven demand",            target: "+11%", conf: 77 },
  ],
};
function getRecs(prefs?: string[] | null) {
  if (!prefs?.length) return RECS.default;
  const p = prefs.join(" ").toLowerCase();
  if (p.includes("crypto")) return RECS.crypto;
  if (p.includes("stock") || p.includes("equit")) return RECS.stock;
  if (p.includes("commod") || p.includes("gold")) return RECS.commodity;
  return RECS.default;
}

// ─── Convert assets ──────────────────────────────────────────────────────────
const CONVERT_ASSETS = [
  { symbol: "USD",  label: "US Dollar",  rate: 1 },
  { symbol: "BTC",  label: "Bitcoin",    rate: 0.0000095 },
  { symbol: "ETH",  label: "Ethereum",   rate: 0.000285 },
  { symbol: "SOL",  label: "Solana",     rate: 0.00637 },
  { symbol: "AAPL", label: "Apple Inc.", rate: 0.00471 },
  { symbol: "XAU",  label: "Gold (oz)",  rate: 0.000299 },
];

// ─── Market watch static data ─────────────────────────────────────────────────
const MARKET_WATCH = [
  { symbol: "BTC",  name: "Bitcoin",   price: "104,820.00", chg: "+2.34",  cat: "CRYPTO" },
  { symbol: "ETH",  name: "Ethereum",  price: "3,421.50",   chg: "+1.12",  cat: "CRYPTO" },
  { symbol: "SOL",  name: "Solana",    price: "182.40",     chg: "+5.67",  cat: "CRYPTO" },
  { symbol: "NVDA", name: "NVIDIA",    price: "875.40",     chg: "+3.21",  cat: "STOCK"  },
  { symbol: "AAPL", name: "Apple",     price: "189.30",     chg: "+0.88",  cat: "STOCK"  },
  { symbol: "XAU",  name: "Gold",      price: "2,348.80",   chg: "+0.52",  cat: "COMMOD" },
  { symbol: "TSLA", name: "Tesla",     price: "178.50",     chg: "-1.34",  cat: "STOCK"  },
  { symbol: "BNB",  name: "BNB",       price: "608.20",     chg: "-0.43",  cat: "CRYPTO" },
];

// ─── Shared card style ────────────────────────────────────────────────────────
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: CARD, border: `1px solid ${BORD}`, borderRadius: 8,
  ...extra,
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"home" | "portfolio" | "convert">("home");
  const [period, setPeriod] = useState<"ytd" | "1y" | "3y" | "all">("1y");
  const [feed, setFeed] = useState(() => buildFeed());
  const [activeUsers, setActiveUsers] = useState(647_821);
  const [hideBalance, setHideBalance] = useState(false);
  const feedIdRef = useRef(100);
  const [fromAsset, setFromAsset] = useState("USD");
  const [toAsset, setToAsset] = useState("BTC");
  const [fromAmt, setFromAmt] = useState("1000");
  const [converting, setConverting] = useState(false);
  const [convertDone, setConvertDone] = useState(false);

  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: performance } = useGetPortfolioPerformance({ period });
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: assetMix } = useGetAssetMix();
  const { data: news } = useGetMarketNews({ limit: 4 });

  useEffect(() => {
    const t = setInterval(() => setActiveUsers(n => n + Math.floor(Math.random() * 13) - 6), 2200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => { const id = feedIdRef.current++; return [genTrade(id), ...prev.slice(0, 19)]; });
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const positive   = (summary?.totalReturn ?? 0) >= 0;
  const dayPos     = (summary?.dayChange ?? 0) >= 0;
  const uid        = user?.id ? genUID(user.id) : "VW-000000";
  const firstName  = user?.fullName?.split(" ")[0] ?? "Investor";
  const hour       = new Date().getHours();
  const greeting   = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const recs       = getRecs((user as any)?.investmentPreferences);

  const fromData   = CONVERT_ASSETS.find(a => a.symbol === fromAsset)!;
  const toData     = CONVERT_ASSETS.find(a => a.symbol === toAsset)!;
  const fromNum    = parseFloat(fromAmt) || 0;
  const toNum      = fromNum * (fromData?.rate ?? 1) / (toData?.rate ?? 1);
  const handleConvert = () => {
    setConverting(true);
    setTimeout(() => { setConverting(false); setConvertDone(true); setTimeout(() => setConvertDone(false), 3000); }, 1800);
  };

  const mask = (val: string) => hideBalance ? "••••••" : val;

  // ─── Balance KPI cards ────────────────────────────────────────────────────
  const kpis = ls ? null : [
    {
      label: "Total Balance",
      value: `$${fmtUSD(summary?.totalAssets || 0)}`,
      sub:   `${positive ? "+" : "−"}${Math.abs(summary?.returnPercentage || 0).toFixed(2)}% all-time`,
      subColor: positive ? GAIN : LOSS,
      detail: "Portfolio value",
    },
    {
      label: "Available Cash",
      value: `$${fmtUSD(summary?.availableCash || 0)}`,
      sub:   "Ready to deploy",
      subColor: TEXT2,
      detail: "Unallocated funds",
    },
    {
      label: "Total P&L",
      value: `${positive ? "+" : "−"}$${fmtUSD(Math.abs(summary?.totalReturn || 0))}`,
      sub:   `${positive ? "+" : ""}${summary?.returnPercentage?.toFixed(2)}%`,
      subColor: positive ? GAIN : LOSS,
      detail: "Unrealised + realised",
    },
    {
      label: "Today's Change",
      value: `${dayPos ? "+" : "−"}$${fmtUSD(Math.abs(summary?.dayChange || 0))}`,
      sub:   `${dayPos ? "+" : "−"}${Math.abs(summary?.dayChangePercentage || 0).toFixed(2)}% today`,
      subColor: dayPos ? GAIN : LOSS,
      detail: "24h performance",
    },
  ];

  // ─── Action buttons ───────────────────────────────────────────────────────
  const actions = [
    { label: "Deposit",   icon: ArrowDownToLine, href: "/wallet",        primary: true },
    { label: "Withdraw",  icon: ArrowUpFromLine,  href: "/wallet",        primary: false },
    { label: "Buy",       icon: TrendingUp,       href: "/invest",        primary: false },
    { label: "Sell",      icon: TrendingDown,     href: "/invest",        primary: false },
    { label: "Convert",   icon: ArrowLeftRight,   onClick: () => setTab("convert"), primary: false },
    { label: "Markets",   icon: Zap,              href: "/assets/crypto", primary: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes slide-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:.5; transform:scale(1.4); } }
        .exc-row:hover { background: rgba(255,255,255,0.025) !important; }
        .exc-action:hover { background: rgba(255,255,255,0.06) !important; }
        .exc-tab-active { border-bottom: 2px solid #3b82f6 !important; color: #fff !important; }
      `}</style>

      {/* ── Page wrapper ── */}
      <div style={{ padding: "0 20px", maxWidth: 1440, margin: "0 auto" }}>

        {/* ── Top identity bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0 10px", borderBottom: `1px solid ${BORD2}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 2 }}>
                {uid}
              </div>
              <h1 style={{ fontSize: 14, fontWeight: 600, color: TEXT, letterSpacing: "-0.01em", margin: 0 }}>
                {greeting}, {firstName}
              </h1>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(38,161,123,0.08)", border: "1px solid rgba(38,161,123,0.18)",
              borderRadius: 4, padding: "4px 10px",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GAIN, display: "block", animation: "pulse-dot 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: GAIN, fontFamily: "monospace" }}>
                {activeUsers.toLocaleString()}
              </span>
              <span style={{ fontSize: 9, color: TEXT2 }}>active now</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setHideBalance(v => !v)} style={{
              display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${BORD}`,
              borderRadius: 4, padding: "5px 10px", cursor: "pointer", color: TEXT2, fontSize: 11, fontWeight: 500,
            }}>
              {hideBalance ? <EyeOff size={11} /> : <Eye size={11} />}
              {hideBalance ? "Show" : "Hide"} Balance
            </button>
            <div style={{ fontSize: 10, color: MUTED }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* ── KPI balance strip ── */}
        {ls ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
            <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-px" style={{ background: BORD, margin: "12px 0", borderRadius: 8, overflow: "hidden" }}>
            {kpis?.map((k, i) => (
              <div key={i} style={{ background: CARD, padding: "18px 20px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", fontFamily: "monospace", marginBottom: 4 }}>
                  {mask(k.value)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: k.subColor, fontFamily: "monospace" }}>{mask(k.sub)}</span>
                  <span style={{ fontSize: 9, color: MUTED }}>{k.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Action row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0 14px", borderBottom: `1px solid ${BORD2}` }}>
          {actions.map(({ label, icon: Icon, href, onClick, primary }) =>
            href ? (
              <Link key={label} href={href} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 5, fontSize: 12, fontWeight: 600,
                textDecoration: "none", transition: "background 0.12s", cursor: "pointer",
                background: primary ? BLUE : "rgba(255,255,255,0.04)",
                border: `1px solid ${primary ? BLUE : BORD}`,
                color: primary ? "#fff" : TEXT2,
              }} className={!primary ? "exc-action" : ""}>
                <Icon size={12} strokeWidth={1.8} />
                {label}
              </Link>
            ) : (
              <button key={label} onClick={onClick} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 5, fontSize: 12, fontWeight: 600,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${BORD}`,
                color: TEXT2, cursor: "pointer", transition: "background 0.12s",
              }} className="exc-action">
                <Icon size={12} strokeWidth={1.8} />
                {label}
              </button>
            )
          )}
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORD2}`, marginBottom: 16 }}>
          {([["home","Overview"],["portfolio","Portfolio"],["convert","Convert"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "10px 18px", fontSize: 12, fontWeight: 600, border: "none",
              background: "transparent", cursor: "pointer", letterSpacing: "0.02em",
              color: tab === key ? TEXT : TEXT2,
              borderBottom: tab === key ? `2px solid ${BLUE}` : "2px solid transparent",
              transition: "all 0.15s", marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {/* ════════════════════ HOME TAB ════════════════════ */}
        {tab === "home" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pb-8">

            {/* ── Left 2/3 ── */}
            <div className="xl:col-span-2 space-y-4">

              {/* ── Watchlist / Market snapshot ── */}
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Market Watch</span>
                  <span style={{ fontSize: 9, color: MUTED }}>Live prices</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: CARD2 }}>
                        {["Instrument","Last Price","24h Change","Category","Action"].map(h => (
                          <th key={h} style={{ padding: "8px 14px", textAlign: h === "Instrument" ? "left" : h === "Action" ? "right" : "right", fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MARKET_WATCH.map((m, mi) => {
                        const pos = !m.chg.startsWith("-");
                        return (
                          <tr key={m.symbol} className="exc-row" style={{ borderTop: `1px solid ${BORD2}`, transition: "background 0.1s" }}>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                <AssetIcon symbol={m.symbol} size={26} borderRadius={6} />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{m.symbol}</div>
                                  <div style={{ fontSize: 10, color: MUTED }}>{m.name}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, fontWeight: 600, color: TEXT, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                              ${m.price}
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 12, fontWeight: 700, color: pos ? GAIN : LOSS, fontFamily: "monospace" }}>
                              {m.chg}%
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right" }}>
                              <span style={{
                                fontSize: 9, fontWeight: 700, color: CAT_COLOR[m.cat],
                                border: `1px solid ${CAT_COLOR[m.cat]}40`,
                                padding: "2px 7px", borderRadius: 3, letterSpacing: "0.06em",
                              }}>{m.cat}</span>
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "right" }}>
                              <Link href={`/assets/${m.symbol}`} style={{
                                fontSize: 10, fontWeight: 600, color: BLUE,
                                textDecoration: "none", padding: "4px 10px",
                                border: `1px solid ${BLUE}40`, borderRadius: 3,
                              }}>Trade</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Recommended assets ── */}
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Star size={11} color={WARN} fill={WARN} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Curated For You</span>
                  </div>
                  <span style={{ fontSize: 9, color: MUTED }}>Based on your profile</span>
                </div>
                <div>
                  {recs.map((r, ri) => (
                    <Link key={r.symbol} href={`/assets/${r.symbol}`}
                      className="exc-row"
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", textDecoration: "none",
                        borderTop: ri > 0 ? `1px solid ${BORD2}` : "none",
                        transition: "background 0.1s",
                      }}>
                      <AssetIcon symbol={r.symbol} size={32} borderRadius={7} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{r.name}</span>
                          <span style={{
                            fontSize: 8, fontWeight: 700, color: CAT_COLOR[r.cat],
                            border: `1px solid ${CAT_COLOR[r.cat]}40`,
                            padding: "1px 5px", borderRadius: 2, letterSpacing: "0.06em",
                          }}>{r.cat}</span>
                        </div>
                        <div style={{ fontSize: 10, color: MUTED }}>{r.why}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: GAIN, fontFamily: "monospace", marginBottom: 1 }}>{r.target}</div>
                        <div style={{ fontSize: 9, color: MUTED }}>{r.conf}% confidence</div>
                      </div>
                      <ArrowRight size={12} color={MUTED} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Holdings mini-table ── */}
              {!lh && holdings && holdings.length > 0 && (
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORD}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>My Positions</span>
                    <button onClick={() => setTab("portfolio")} style={{
                      fontSize: 10, fontWeight: 600, color: BLUE, background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}>
                      View All <ArrowRight size={10} />
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: CARD2 }}>
                          {["Asset","Price","24h","Value","P&L"].map(h => (
                            <th key={h} style={{ padding: "8px 14px", textAlign: h === "Asset" ? "left" : "right", fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.slice(0, 6).map((h) => {
                          const g = h.gainLossPercentage >= 0;
                          return (
                            <tr key={h.id} className="exc-row" style={{ borderTop: `1px solid ${BORD2}`, transition: "background 0.1s" }}>
                              <td style={{ padding: "10px 14px" }}>
                                <Link href={`/assets/${h.symbol}`} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                                  <AssetIcon symbol={h.symbol} size={26} borderRadius={6} />
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{h.name}</div>
                                    <div style={{ fontSize: 9, color: MUTED, fontFamily: "monospace" }}>{h.symbol}</div>
                                  </div>
                                </Link>
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontFamily: "monospace", color: TEXT }}>${h.currentPrice.toLocaleString()}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: g ? GAIN : LOSS }}>{g ? "+" : ""}{h.gainLossPercentage}%</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, fontFamily: "monospace", color: TEXT }}>{mask(`$${h.currentValue.toLocaleString()}`)}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontFamily: "monospace", color: g ? GAIN : LOSS }}>
                                {g ? "+" : "−"}{mask(`$${Math.abs(h.gainLoss ?? 0).toLocaleString()}`)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right 1/3 ── */}
            <div className="space-y-4">

              {/* Live platform activity */}
              <div style={card({ overflow: "hidden", display: "flex", flexDirection: "column", height: 480 })}>
                <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: GAIN, animation: "pulse-dot 1.6s ease-in-out infinite", display: "block" }} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: GAIN, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</span>
                    </div>
                    <RefreshCw size={11} color={MUTED} style={{ animation: "spin-slow 5s linear infinite" }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 3 }}>Platform Activity</div>
                </div>
                <div style={{ flex: 1, overflowY: "hidden" }}>
                  {feed.map((trade, idx) => (
                    <div key={trade.id} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                      borderBottom: `1px solid ${BORD2}`,
                      opacity: idx === 0 ? 1 : Math.max(0.28, 1 - idx * 0.044),
                      animation: idx === 0 ? "slide-in 0.3s ease" : undefined,
                      background: idx === 0 ? "rgba(59,130,246,0.04)" : "transparent",
                    }}>
                      <AssetIcon symbol={trade.asset.symbol} size={24} borderRadius={5} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 1 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{trade.user}</span>
                          <span style={{
                            fontSize: 7, fontWeight: 700,
                            color: trade.side.includes("Long") || trade.side === "Bought" ? GAIN : LOSS,
                            border: `1px solid ${(trade.side.includes("Long") || trade.side === "Bought") ? GAIN : LOSS}40`,
                            padding: "0px 4px", borderRadius: 2,
                          }}>{trade.side}</span>
                        </div>
                        <div style={{ fontSize: 9, color: MUTED }}>{trade.asset.name} · {trade.asset.cat}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: trade.positive ? GAIN : LOSS, fontFamily: "monospace" }}>
                          {trade.positive ? "+" : "−"}${fmtUSD(trade.change)}
                        </div>
                        <div style={{ fontSize: 8, color: MUTED }}>{trade.ago}s ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market news */}
              {news && news.length > 0 && (
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${BORD}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Market Intelligence</span>
                  </div>
                  {news.slice(0, 3).map((item, ni) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                      className="exc-row"
                      style={{ display: "block", padding: "10px 14px", borderTop: ni > 0 ? `1px solid ${BORD2}` : "none", textDecoration: "none", transition: "background 0.1s" }}>
                      <div style={{ fontSize: 8, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>
                        {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT, fontWeight: 500, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.title}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ PORTFOLIO TAB ════════════════════ */}
        {tab === "portfolio" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pb-8">
            <div className="xl:col-span-2 space-y-4">

              {/* Performance chart */}
              <div style={card({ overflow: "hidden" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Performance</span>
                  <div style={{ display: "flex", gap: 1, background: CARD2, padding: 2, borderRadius: 4, border: `1px solid ${BORD}` }}>
                    {(["ytd","1y","3y","all"] as const).map(p => (
                      <button key={p} onClick={() => setPeriod(p)} style={{
                        padding: "4px 10px", borderRadius: 3, fontSize: 9, fontWeight: 700,
                        border: "none", cursor: "pointer", textTransform: "uppercase",
                        background: period === p ? BLUE : "transparent",
                        color: period === p ? "#fff" : MUTED,
                        transition: "all 0.15s",
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "12px 4px", height: 220 }}>
                  {performance?.data ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performance.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="perfG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={positive ? GAIN : LOSS} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={positive ? GAIN : LOSS} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 8, fill: MUTED }} tickLine={false} axisLine={false} />
                        <YAxis domain={["auto","auto"]} tick={{ fontSize: 8, fill: MUTED }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={40} />
                        <Tooltip
                          contentStyle={{ fontSize: 10, border: `1px solid ${BORD}`, borderRadius: 6, padding: "6px 12px", background: CARD2 }}
                          itemStyle={{ color: TEXT, fontWeight: 600 }}
                          formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                          labelStyle={{ color: MUTED, fontSize: 9 }}
                        />
                        <Area type="monotone" dataKey="value" stroke={positive ? GAIN : LOSS} strokeWidth={1.5} fill="url(#perfG)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12 }}>No data available</div>
                  )}
                </div>
              </div>

              {/* Full holdings table */}
              <div style={card({ overflow: "hidden" })}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>All Holdings</span>
                </div>
                {lh ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                    <Loader2 style={{ width: 15, height: 15, color: MUTED, animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: CARD2 }}>
                          {["Instrument","Last Price","24h","Qty","Value","Alloc."].map(h => (
                            <th key={h} style={{ padding: "8px 14px", textAlign: h === "Instrument" ? "left" : "right", fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holdings?.map((h) => {
                          const gain  = h.gainLossPercentage >= 0;
                          const alloc = ((h.currentValue / (summary?.totalAssets || 1)) * 100).toFixed(1);
                          return (
                            <tr key={h.id} className="exc-row" style={{ borderTop: `1px solid ${BORD2}`, transition: "background 0.1s" }}>
                              <td style={{ padding: "10px 14px" }}>
                                <Link href={`/assets/${h.symbol}`} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                                  <AssetIcon symbol={h.symbol} size={28} borderRadius={6} />
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{h.name}</div>
                                    <div style={{ fontSize: 9, color: MUTED, fontFamily: "monospace" }}>{h.symbol}</div>
                                  </div>
                                </Link>
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontFamily: "monospace", color: TEXT }}>${h.currentPrice.toLocaleString()}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: gain ? GAIN : LOSS }}>{gain ? "+" : ""}{h.gainLossPercentage}%</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontFamily: "monospace", color: MUTED }}>{h.quantity}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, fontFamily: "monospace", color: TEXT }}>{mask(`$${h.currentValue.toLocaleString()}`)}</td>
                              <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                  <div style={{ width: 40, height: 2, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                                    <div style={{ width: `${alloc}%`, height: "100%", borderRadius: 99, background: BLUE }} />
                                  </div>
                                  <span style={{ fontSize: 9, fontFamily: "monospace", color: MUTED }}>{alloc}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Allocation pie + news */}
            <div className="space-y-4">
              <div style={card({ overflow: "hidden" })}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORD}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Asset Distribution</span>
                </div>
                <div style={{ padding: "16px 14px" }}>
                  {assetMix?.allocations && (
                    <div style={{ height: 140, marginBottom: 16 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={assetMix.allocations} cx="50%" cy="50%" innerRadius={44} outerRadius={60} paddingAngle={3} dataKey="value">
                            {assetMix.allocations.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                            contentStyle={{ fontSize: 9, border: `1px solid ${BORD}`, borderRadius: 5, padding: "4px 8px", background: CARD2 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {assetMix?.allocations.map((a, i) => (
                      <div key={a.assetType} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: TEXT, textTransform: "capitalize" }}>{a.assetType}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, fontFamily: "monospace", color: TEXT }}>{a.percentage}%</div>
                          <div style={{ fontSize: 9, color: MUTED, fontFamily: "monospace" }}>{mask(`$${a.value?.toLocaleString()}`)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {news && news.length > 0 && (
                <div style={card({ overflow: "hidden" })}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORD}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Market Intelligence</span>
                  </div>
                  {news.map((item, ni) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                      className="exc-row"
                      style={{ display: "block", padding: "10px 14px", borderTop: ni > 0 ? `1px solid ${BORD2}` : "none", textDecoration: "none", transition: "background 0.1s" }}>
                      <div style={{ fontSize: 8, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
                        {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: TEXT, fontWeight: 500, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.title}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════ CONVERT TAB ════════════════════ */}
        {tab === "convert" && (
          <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 48 }}>
            <div style={card({ overflow: "hidden" })}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>Swap</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Convert Assets</div>
                <div style={{ fontSize: 11, color: TEXT2, marginTop: 3 }}>Instantly exchange between assets at live rates</div>
              </div>

              <div style={{ padding: "20px" }}>
                {/* From */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 7 }}>You Pay</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", background: CARD2, border: `1px solid ${BORD}`, borderRadius: 7, padding: "12px 14px" }}>
                    <select value={fromAsset} onChange={e => setFromAsset(e.target.value)} style={{
                      background: "#16202e", border: `1px solid ${BORD}`, borderRadius: 5,
                      padding: "5px 8px", fontSize: 11, fontWeight: 700, color: TEXT, outline: "none", cursor: "pointer",
                    }}>
                      {CONVERT_ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                    </select>
                    <input
                      type="number" value={fromAmt} onChange={e => setFromAmt(e.target.value)}
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        fontSize: 18, fontWeight: 700, color: TEXT, textAlign: "right", fontFamily: "monospace",
                      }}
                    />
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                  <button
                    onClick={() => { setFromAsset(toAsset); setToAsset(fromAsset); }}
                    style={{ width: 32, height: 32, borderRadius: 6, background: CARD2, border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <ArrowLeftRight size={13} color={TEXT2} />
                  </button>
                </div>

                {/* To */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 7 }}>You Receive</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", background: CARD2, border: `1px solid ${BORD}`, borderRadius: 7, padding: "12px 14px" }}>
                    <select value={toAsset} onChange={e => setToAsset(e.target.value)} style={{
                      background: "#16202e", border: `1px solid ${BORD}`, borderRadius: 5,
                      padding: "5px 8px", fontSize: 11, fontWeight: 700, color: TEXT, outline: "none", cursor: "pointer",
                    }}>
                      {CONVERT_ASSETS.filter(a => a.symbol !== fromAsset).map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                    </select>
                    <div style={{ flex: 1, fontSize: 18, fontWeight: 700, color: TEXT2, textAlign: "right", fontFamily: "monospace" }}>
                      {isNaN(toNum) ? "—" : toNum.toFixed(6)}
                    </div>
                  </div>
                </div>

                {/* Rate info */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${BORD}`, borderBottom: `1px solid ${BORD}`, marginBottom: 16 }}>
                  <span style={{ fontSize: 10, color: MUTED }}>Exchange Rate</span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: TEXT2 }}>
                    1 {fromAsset} = {((fromData?.rate ?? 1) / (toData?.rate ?? 1)).toFixed(6)} {toAsset}
                  </span>
                </div>

                <button onClick={handleConvert} disabled={converting} style={{
                  width: "100%", padding: "13px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                  background: convertDone ? GAIN : BLUE, border: "none", color: "#fff", cursor: "pointer",
                  opacity: converting ? 0.7 : 1, transition: "all 0.2s",
                }}>
                  {converting ? "Converting..." : convertDone ? "✓ Converted Successfully" : `Convert ${fromAsset} → ${toAsset}`}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
