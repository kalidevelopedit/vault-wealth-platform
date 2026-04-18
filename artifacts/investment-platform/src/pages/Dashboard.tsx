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
  ArrowLeftRight, RefreshCw, Users, Zap, Star, Loader2,
  ArrowRight, ChevronRight,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const GAIN = "#22c55e";
const LOSS = "#ef4444";
const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa"];
const BG   = "#0c0f1a";
const CARD = "#131827";
const CARD2= "#0d1020";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED= "rgba(255,255,255,0.38)";
const BLUE = "#3b82f6";
const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}k`
  : `$${fmtUSD(n)}`;

function genUID(id: number) {
  return `VW-${String(id).padStart(6, "0")}`;
}

// Dark glass card helper (inline styles used below)
const G = "";

// ─── Live Feed ───────────────────────────────────────────────────────────────
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
const ASSETS = [
  { symbol: "BTC",  name: "Bitcoin",       cat: "CRYPTO" },
  { symbol: "ETH",  name: "Ethereum",      cat: "CRYPTO" },
  { symbol: "SOL",  name: "Solana",        cat: "CRYPTO" },
  { symbol: "BNB",  name: "BNB",           cat: "CRYPTO" },
  { symbol: "AVAX", name: "Avalanche",     cat: "CRYPTO" },
  { symbol: "AAPL", name: "Apple Inc.",    cat: "STOCK"  },
  { symbol: "TSLA", name: "Tesla",         cat: "STOCK"  },
  { symbol: "NVDA", name: "NVIDIA",        cat: "STOCK"  },
  { symbol: "MSFT", name: "Microsoft",     cat: "STOCK"  },
  { symbol: "META", name: "Meta",          cat: "STOCK"  },
  { symbol: "XAU",  name: "Gold Spot",     cat: "COMMOD" },
  { symbol: "XAG",  name: "Silver",        cat: "COMMOD" },
  { symbol: "CRUDE","name": "Crude Oil",   cat: "COMMOD" },
  { symbol: "ES",   name: "S&P Futures",   cat: "FUTURE" },
  { symbol: "NQ",   name: "Nasdaq Fut.",   cat: "FUTURE" },
];
const SIDES = ["Bought", "Sold", "Opened Long", "Closed Short", "Opened Short"] as const;

function rndItem<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function genTrade(id: number) {
  const asset = rndItem(ASSETS);
  const side = rndItem(SIDES);
  const val = Math.random() * 9800 + 200;
  const gain = side === "Bought" || side === "Opened Long"
    ? (Math.random() > 0.45 ? 1 : -1)
    : (Math.random() > 0.45 ? -1 : 1);
  const pct = (Math.random() * 8.4 + 0.2).toFixed(2);
  const change = val * parseFloat(pct) / 100;
  return {
    id,
    user: rndItem(USERNAMES),
    asset,
    side,
    value: val,
    pct,
    change,
    positive: gain > 0,
    ago: Math.floor(Math.random() * 59) + 1,
  };
}

function buildInitialFeed() {
  return Array.from({ length: 18 }, (_, i) => genTrade(i));
}

// ─── Recommendation engine ───────────────────────────────────────────────────
const RECS: Record<string, { symbol: string; name: string; cat: string; why: string; target: string; conf: number }[]> = {
  crypto: [
    { symbol: "BTC",  name: "Bitcoin",   cat: "CRYPTO", why: "Matches your crypto preference", target: "+18%", conf: 87 },
    { symbol: "ETH",  name: "Ethereum",  cat: "CRYPTO", why: "High conviction by institutional holders", target: "+24%", conf: 81 },
    { symbol: "SOL",  name: "Solana",    cat: "CRYPTO", why: "Strong DeFi momentum aligns with your goals", target: "+31%", conf: 74 },
  ],
  stock: [
    { symbol: "NVDA", name: "NVIDIA",    cat: "STOCK",  why: "AI sector aligns with your growth goals", target: "+22%", conf: 89 },
    { symbol: "AAPL", name: "Apple Inc.",cat: "STOCK",  why: "Stable dividend + growth, matches profile", target: "+14%", conf: 83 },
    { symbol: "MSFT", name: "Microsoft", cat: "STOCK",  why: "Cloud revenue growth, low volatility", target: "+17%", conf: 80 },
  ],
  commodity: [
    { symbol: "XAU",  name: "Gold Spot", cat: "COMMOD", why: "Inflation hedge, matches conservative goals", target: "+11%", conf: 79 },
    { symbol: "XAG",  name: "Silver",    cat: "COMMOD", why: "Industrial demand surge expected", target: "+19%", conf: 72 },
    { symbol: "CRUDE",name: "Crude Oil", cat: "COMMOD", why: "OPEC+ cuts support price floor", target: "+13%", conf: 70 },
  ],
  default: [
    { symbol: "BTC",  name: "Bitcoin",   cat: "CRYPTO", why: "Most held asset on this platform", target: "+18%", conf: 85 },
    { symbol: "NVDA", name: "NVIDIA",    cat: "STOCK",  why: "AI sector outperforming benchmark", target: "+22%", conf: 82 },
    { symbol: "XAU",  name: "Gold Spot", cat: "COMMOD", why: "Global safe-haven demand", target: "+11%", conf: 77 },
  ],
};

function getRecs(prefs?: string[] | null) {
  if (!prefs || !prefs.length) return RECS.default;
  const p = prefs.join(" ").toLowerCase();
  if (p.includes("crypto")) return RECS.crypto;
  if (p.includes("stock") || p.includes("equit")) return RECS.stock;
  if (p.includes("commod") || p.includes("gold")) return RECS.commodity;
  return RECS.default;
}

// ─── Convert assets ──────────────────────────────────────────────────────────
const CONVERT_ASSETS = [
  { symbol: "USD",  label: "US Dollar",     rate: 1 },
  { symbol: "BTC",  label: "Bitcoin",        rate: 0.0000095 },
  { symbol: "ETH",  label: "Ethereum",       rate: 0.000285 },
  { symbol: "SOL",  label: "Solana",         rate: 0.00637 },
  { symbol: "AAPL", label: "Apple Inc.",     rate: 0.00471 },
  { symbol: "XAU",  label: "Gold (oz)",      rate: 0.000299 },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"home" | "portfolio" | "convert">("home");
  const [period, setPeriod] = useState<"ytd" | "1y" | "3y" | "all">("1y");
  const [feed, setFeed] = useState(() => buildInitialFeed());
  const [activeUsers, setActiveUsers] = useState(647_821);
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

  // Animate active users
  useEffect(() => {
    const t = setInterval(() => {
      setActiveUsers(n => n + Math.floor(Math.random() * 13) - 6);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  // Animate feed
  useEffect(() => {
    const t = setInterval(() => {
      setFeed(prev => {
        const id = feedIdRef.current++;
        return [genTrade(id), ...prev.slice(0, 17)];
      });
    }, 1600);
    return () => clearInterval(t);
  }, []);

  const positive = (summary?.totalReturn ?? 0) >= 0;
  const uid = user?.id ? genUID(user.id) : "VW-000000";
  const firstName = user?.fullName?.split(" ")[0] ?? "Investor";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const recs = getRecs((user as any)?.investmentPreferences);

  // Convert calculation
  const fromData = CONVERT_ASSETS.find(a => a.symbol === fromAsset)!;
  const toData   = CONVERT_ASSETS.find(a => a.symbol === toAsset)!;
  const fromNum  = parseFloat(fromAmt) || 0;
  const toNum    = fromNum * (fromData?.rate ?? 1) / (toData?.rate ?? 1);

  const handleConvert = () => {
    setConverting(true);
    setTimeout(() => { setConverting(false); setConvertDone(true); setTimeout(() => setConvertDone(false), 3000); }, 1800);
  };

  const CAT_COLOR: Record<string, string> = { CRYPTO: "#3b82f6", STOCK: "#22c55e", COMMOD: "#f59e0b", FUTURE: "#8b5cf6" };

  return (
    <div style={{ minHeight: "100vh", background: BG }}>

      {/* ── Top header ── */}
      <div style={{ padding: "28px 28px 0", maxWidth: 1400, margin: "0 auto" }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
              {uid} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Here's your account overview.</p>
          </div>

          {/* Active users pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: CARD, border: `1px solid ${BORD}`, borderRadius: 99,
            padding: "9px 18px",
            boxShadow: "0 2px 14px rgba(0,0,0,0.2)",
          }}>
            <div style={{ position: "relative", width: 8, height: 8 }}>
              <span style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: GAIN, animation: "pulse-dot 1.8s ease-in-out infinite",
              }} />
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: GAIN }} />
            </div>
            <Users size={13} color={MUTED} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
              {activeUsers.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>active investors</span>
          </div>
        </div>

        {/* KPI strip */}
        {ls ? (
          <div className="flex items-center justify-center py-10"><Loader2 style={{ width: 18, height: 18, color: MUTED, animation: "spin 1s linear infinite" }} /></div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Portfolio Value",
                value: `$${fmtUSD(summary?.totalAssets || 0)}`,
                sub: `${positive ? "+" : "−"}${Math.abs(summary?.returnPercentage || 0).toFixed(2)}% all-time`,
                subColor: positive ? GAIN : LOSS,
              },
              {
                label: "Available Cash",
                value: `$${fmtUSD(summary?.availableCash || 0)}`,
                sub: "Ready to deploy",
                subColor: MUTED,
              },
              {
                label: "Total Return",
                value: `${positive ? "+" : "−"}$${fmtUSD(Math.abs(summary?.totalReturn || 0))}`,
                sub: `${positive ? "+" : ""}${summary?.returnPercentage?.toFixed(2)}%`,
                subColor: positive ? GAIN : LOSS,
              },
              {
                label: "Today's P&L",
                value: `${(summary?.dayChange || 0) >= 0 ? "+" : "−"}$${fmtUSD(Math.abs(summary?.dayChange || 0))}`,
                sub: `${(summary?.dayChange || 0) >= 0 ? "+" : "−"}${Math.abs(summary?.dayChangePercentage || 0).toFixed(2)}% today`,
                subColor: (summary?.dayChange || 0) >= 0 ? GAIN : LOSS,
              },
            ].map((k, i) => (
              <div key={i} style={{
                background: CARD, border: `1px solid ${BORD}`,
                borderRadius: 18, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginBottom: 4 }}>{k.value}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: k.subColor }}>{k.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div style={{
          display: "inline-flex", gap: 2,
          background: CARD2, border: `1px solid ${BORD}`, borderRadius: 14,
          padding: 4, marginBottom: 22,
        }}>
          {([["home","Overview"],["portfolio","Portfolio"],["convert","Convert"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "7px 20px", borderRadius: 11, fontSize: 12, fontWeight: 600,
              border: "none", cursor: "pointer", letterSpacing: "0.02em",
              background: tab === key ? CARD : "transparent",
              color: tab === key ? TEXT : MUTED,
              boxShadow: tab === key ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
              transition: "all 0.18s ease",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: "0 28px 48px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ════ HOME TAB ════ */}
        {tab === "home" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Left 2/3 */}
            <div className="xl:col-span-2 space-y-5">

              {/* Quick actions */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, padding: "18px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14 }}>Quick Actions</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Deposit",   icon: ArrowDownToLine,  href: "/wallet",       blue: true  },
                    { label: "Withdraw",  icon: ArrowUpFromLine,   href: "/wallet",       blue: false },
                    { label: "Buy Asset", icon: TrendingUp,        href: "/invest",       blue: false },
                    { label: "Sell",      icon: TrendingDown,      href: "/invest",       blue: false },
                    { label: "Convert",   icon: ArrowLeftRight,    onClick: () => setTab("convert"), blue: false },
                    { label: "Markets",   icon: Zap,               href: "/assets/crypto",blue: false },
                  ].map(({ label, icon: Icon, href, onClick, blue }) => (
                    href
                      ? <Link key={label} href={href} style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "8px 16px", borderRadius: 10,
                          background: blue ? BLUE : "rgba(255,255,255,0.05)", border: `1px solid ${blue ? BLUE : BORD}`,
                          fontSize: 12, fontWeight: 600, color: blue ? "#fff" : TEXT,
                          textDecoration: "none", transition: "all 0.14s",
                        }}>
                          <Icon size={13} strokeWidth={1.8} />
                          {label}
                        </Link>
                      : <button key={label} onClick={onClick} style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "8px 16px", borderRadius: 10,
                          background: "rgba(255,255,255,0.05)", border: `1px solid ${BORD}`,
                          fontSize: 12, fontWeight: 600, color: TEXT,
                          cursor: "pointer", transition: "all 0.14s",
                        }}>
                          <Icon size={13} strokeWidth={1.8} />
                          {label}
                        </button>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>
                      <Star size={9} style={{ display: "inline", marginRight: 4, marginBottom: 1 }} />
                      Curated for You
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Recommended Assets</div>
                  </div>
                  <span style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>Based on your profile</span>
                </div>
                <div>
                  {recs.map((r, ri) => (
                    <Link key={r.symbol} href={`/assets/${r.symbol}`}
                      style={{ display: "flex", alignItems: "center", padding: "15px 24px", textDecoration: "none", borderBottom: ri < recs.length - 1 ? `1px solid ${BORD}` : "none", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ flexShrink: 0, marginRight: 14 }}>
                        <AssetIcon symbol={r.symbol} size={36} borderRadius={10} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{r.name}</span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: CAT_COLOR[r.cat],
                            background: `${CAT_COLOR[r.cat]}20`,
                            padding: "2px 7px", borderRadius: 20, letterSpacing: "0.06em",
                          }}>{r.cat}</span>
                        </div>
                        <div style={{ fontSize: 11, color: MUTED }}>{r.why}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: GAIN, marginBottom: 2 }}>{r.target}</div>
                        <div style={{ fontSize: 10, color: MUTED }}>{r.conf}% confidence</div>
                      </div>
                      <ChevronRight size={14} color={MUTED} style={{ marginLeft: 10 }} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Holdings preview */}
              {!lh && holdings && holdings.length > 0 && (
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>Positions</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Current Holdings</div>
                    </div>
                    <button onClick={() => setTab("portfolio")} style={{
                      fontSize: 11, fontWeight: 600, color: BLUE, background: "none", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}>
                      View All <ArrowRight size={11} />
                    </button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORD}`, background: CARD2 }}>
                          {["Asset","Price","24h","Value","P&L"].map(h => (
                            <th key={h} style={{ padding: "10px 16px", textAlign: h === "Asset" ? "left" : "right", fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.slice(0, 5).map(h => {
                          const g = h.gainLossPercentage >= 0;
                          return (
                            <tr key={h.id} style={{ borderBottom: `1px solid ${BORD}`, transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <td style={{ padding: "12px 16px" }}>
                                <Link href={`/assets/${h.symbol}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                                  <AssetIcon symbol={h.symbol} size={30} borderRadius={8} />
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{h.name}</div>
                                    <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{h.symbol}</div>
                                  </div>
                                </Link>
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>
                                ${h.currentPrice.toLocaleString()}
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: g ? GAIN : LOSS, fontFamily: "monospace" }}>
                                {g ? "+" : ""}{h.gainLossPercentage}%
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>
                                ${h.currentValue.toLocaleString()}
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 500, color: g ? GAIN : LOSS, fontFamily: "monospace" }}>
                                {g ? "+" : "−"}${Math.abs(h.gainLoss ?? 0).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right 1/3 — Live Feed */}
            <div className="space-y-5">
              <div style={{
                background: CARD, border: `1px solid ${BORD}`, borderRadius: 18,
                overflow: "hidden", height: "calc(100vh - 280px)", minHeight: 520,
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORD}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%", background: GAIN,
                          display: "inline-block", animation: "pulse-dot 1.6s ease-in-out infinite",
                        }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: GAIN, textTransform: "uppercase", letterSpacing: "0.14em" }}>Live</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Platform Activity</div>
                    </div>
                    <RefreshCw size={13} color={MUTED} style={{ animation: "spin-slow 4s linear infinite" }} />
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "hidden", position: "relative" }}>
                  <div style={{ overflowY: "hidden", height: "100%" }}>
                    {feed.map((trade, idx) => (
                      <div key={trade.id} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 18px",
                        borderBottom: `1px solid ${BORD}`,
                        opacity: idx === 0 ? 1 : Math.max(0.3, 1 - idx * 0.048),
                        animation: idx === 0 ? "slide-in 0.35s ease" : undefined,
                        transition: "opacity 0.3s",
                        background: idx === 0 ? "rgba(59,130,246,0.05)" : "transparent",
                      }}>
                        <AssetIcon symbol={trade.asset.symbol} size={28} borderRadius={8} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{trade.user}</span>
                            <span style={{
                              fontSize: 8, fontWeight: 600,
                              color: trade.side.includes("Long") || trade.side === "Bought" ? GAIN : LOSS,
                              background: (trade.side.includes("Long") || trade.side === "Bought") ? `${GAIN}18` : `${LOSS}18`,
                              padding: "1px 6px", borderRadius: 20,
                            }}>{trade.side}</span>
                          </div>
                          <div style={{ fontSize: 10, color: MUTED }}>{trade.asset.name} · {trade.asset.cat}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: trade.positive ? GAIN : LOSS, fontFamily: "monospace" }}>
                            {trade.positive ? "+" : "−"}${fmtUSD(trade.change)}
                          </div>
                          <div style={{ fontSize: 9, color: MUTED }}>{trade.ago}s ago</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* News */}
              {news && news.length > 0 && (
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>Intelligence</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Market Insights</div>
                  </div>
                  <div>
                    {news.slice(0, 3).map((item, ni) => (
                      <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", padding: "13px 20px", borderBottom: ni < 2 ? `1px solid ${BORD}` : "none", textDecoration: "none", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ fontSize: 9, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                          {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div style={{ fontSize: 12, color: TEXT, fontWeight: 500, lineHeight: 1.5 }} className="line-clamp-2">{item.title}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PORTFOLIO TAB ════ */}
        {tab === "portfolio" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">

              {/* Chart */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>Performance</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Portfolio Value Over Time</div>
                  </div>
                  <div style={{ display: "flex", gap: 2, background: CARD2, padding: 3, borderRadius: 10, border: `1px solid ${BORD}` }}>
                    {(["ytd","1y","3y","all"] as const).map(p => (
                      <button key={p} onClick={() => setPeriod(p)} style={{
                        padding: "5px 13px", borderRadius: 8, fontSize: 10, fontWeight: 600,
                        border: "none", cursor: "pointer", textTransform: "uppercase",
                        background: period === p ? CARD : "transparent",
                        color: period === p ? TEXT : MUTED,
                        boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                        transition: "all 0.15s",
                      }}>{p}</button>
                    ))}
                  </div>
                </div>
                <div style={{ padding: "16px 8px", height: 260 }}>
                  {performance?.data ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performance.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="perfG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={positive ? GAIN : LOSS} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={positive ? GAIN : LOSS} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: MUTED }} tickLine={false} axisLine={false} />
                        <YAxis domain={["auto","auto"]} tick={{ fontSize: 9, fill: MUTED }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={44} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, border: `1px solid ${BORD}`, borderRadius: 12, padding: "8px 14px", background: CARD2 }}
                          itemStyle={{ color: TEXT, fontWeight: 600 }}
                          formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                          labelStyle={{ color: MUTED, fontSize: 10 }}
                        />
                        <Area type="monotone" dataKey="value" stroke={positive ? GAIN : LOSS} strokeWidth={1.5} fill="url(#perfG)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center" style={{ color: MUTED, fontSize: 12 }}>No data available</div>
                  )}
                </div>
              </div>

              {/* Holdings table */}
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>Positions</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>All Holdings</div>
                </div>
                {lh ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORD}`, background: CARD2 }}>
                          {["Instrument","Last Price","24h","Qty","Value","Allocation"].map(h => (
                            <th key={h} style={{ padding: "11px 16px", textAlign: h === "Instrument" ? "left" : "right", fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holdings?.map((h) => {
                          const gain = h.gainLossPercentage >= 0;
                          const alloc = ((h.currentValue / (summary?.totalAssets || 1)) * 100).toFixed(1);
                          return (
                            <tr key={h.id} style={{ borderBottom: `1px solid ${BORD}`, transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              <td style={{ padding: "13px 16px" }}>
                                <Link href={`/assets/${h.symbol}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                                  <AssetIcon symbol={h.symbol} size={32} borderRadius={9} />
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{h.name}</div>
                                    <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{h.symbol}</div>
                                  </div>
                                </Link>
                              </td>
                              <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 12, fontFamily: "monospace", color: TEXT }}>${h.currentPrice.toLocaleString()}</td>
                              <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: gain ? GAIN : LOSS }}>{gain ? "+" : ""}{h.gainLossPercentage}%</td>
                              <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 12, fontFamily: "monospace", color: MUTED }}>{h.quantity}</td>
                              <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: TEXT }}>${h.currentValue.toLocaleString()}</td>
                              <td style={{ padding: "13px 16px", textAlign: "right" }}>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 48, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)" }}>
                                    <div style={{ width: `${alloc}%`, height: "100%", borderRadius: 99, background: BLUE }} />
                                  </div>
                                  <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{alloc}%</span>
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

            {/* Right: allocation + news */}
            <div className="space-y-5">
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${BORD}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>Allocation</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Asset Distribution</div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  {assetMix?.allocations && (
                    <div style={{ height: 160, display: "flex", justifyContent: "center", marginBottom: 20 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={assetMix.allocations} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value">
                            {assetMix.allocations.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                            contentStyle={{ fontSize: 10, border: `1px solid ${BORD}`, borderRadius: 10, padding: "6px 10px", background: CARD2 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {assetMix?.allocations.map((a, i) => (
                      <div key={a.assetType} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: TEXT, textTransform: "capitalize" }}>{a.assetType}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: TEXT }}>{a.percentage}%</div>
                          <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>${a.value?.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {news && news.length > 0 && (
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden" }}>
                  <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>Intelligence</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Market Insights</div>
                  </div>
                  {news.map((item, ni) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", padding: "13px 20px", borderBottom: ni < news.length - 1 ? `1px solid ${BORD}` : "none", textDecoration: "none", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ fontSize: 9, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                        {item.source} · {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 12, color: TEXT, fontWeight: 500, lineHeight: 1.5 }} className="line-clamp-2">{item.title}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ CONVERT TAB ════ */}
        {tab === "convert" && (
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 22, overflow: "hidden" }}>
              <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${BORD}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 4 }}>Swap</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Convert Assets</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Instantly exchange between assets at live rates</div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                {/* From */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 8 }}>You Pay</label>
                  <div style={{
                    display: "flex", gap: 10, alignItems: "center",
                    background: CARD2, border: `1.5px solid ${BORD}`,
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <select value={fromAsset} onChange={e => setFromAsset(e.target.value)} style={{
                      background: "#16202e", border: `1px solid ${BORD}`, borderRadius: 9,
                      padding: "6px 10px", fontSize: 12, fontWeight: 700, color: TEXT,
                      outline: "none", cursor: "pointer",
                    }}>
                      {CONVERT_ASSETS.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                    </select>
                    <input
                      type="number"
                      value={fromAmt}
                      onChange={e => { setFromAmt(e.target.value); setConvertDone(false); }}
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        fontSize: 20, fontWeight: 700, color: TEXT, fontFamily: "monospace",
                        textAlign: "right",
                      }}
                    />
                  </div>
                </div>

                {/* Swap button */}
                <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
                  <button onClick={() => { const tmp = fromAsset; setFromAsset(toAsset); setToAsset(tmp); setConvertDone(false); }} style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: CARD2, border: `1.5px solid ${BORD}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "transform 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "rotate(180deg)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "rotate(0deg)")}>
                    <ArrowLeftRight size={14} color={MUTED} />
                  </button>
                </div>

                {/* To */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 8 }}>You Receive</label>
                  <div style={{
                    display: "flex", gap: 10, alignItems: "center",
                    background: CARD2, border: `1.5px solid rgba(59,130,246,0.25)`,
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <select value={toAsset} onChange={e => { setToAsset(e.target.value); setConvertDone(false); }} style={{
                      background: "#16202e", border: `1px solid ${BORD}`, borderRadius: 9,
                      padding: "6px 10px", fontSize: 12, fontWeight: 700, color: TEXT,
                      outline: "none", cursor: "pointer",
                    }}>
                      {CONVERT_ASSETS.filter(a => a.symbol !== fromAsset).map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                    </select>
                    <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: TEXT, fontFamily: "monospace", textAlign: "right" }}>
                      {isNaN(toNum) ? "—" : toNum < 0.001 ? toNum.toExponential(4) : toNum < 1 ? toNum.toFixed(6) : toNum.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* Rate info */}
                {[
                  { label: "Exchange Rate", value: `1 ${fromAsset} ≈ ${(fromData?.rate / toData?.rate).toFixed(6)} ${toAsset}` },
                  { label: "Network Fee",   value: "$0.00 (waived)" },
                ].map((row) => (
                  <div key={row.label} style={{ background: CARD2, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: MUTED }}>{row.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ marginBottom: 24 }} />
                <button onClick={handleConvert} disabled={converting || fromNum <= 0} style={{
                  width: "100%", padding: "15px", borderRadius: 14, fontSize: 13, fontWeight: 700,
                  background: convertDone ? GAIN : BLUE, color: "white", border: "none",
                  cursor: converting || fromNum <= 0 ? "not-allowed" : "pointer",
                  opacity: fromNum <= 0 ? 0.5 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  letterSpacing: "0.04em", transition: "background 0.3s",
                  boxShadow: `0 4px 16px rgba(59,130,246,0.25)`,
                }}>
                  {converting ? (
                    <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
                  ) : convertDone ? (
                    "✓ Conversion Complete"
                  ) : (
                    `Convert ${fromAmt} ${fromAsset} → ${toAsset}`
                  )}
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
              Rates are indicative only. Actual execution prices may vary.
              Conversions are subject to account verification and platform terms.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.3; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
