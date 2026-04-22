import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useMarketPreferences, MarketCategory } from "@/contexts/MarketPreferencesContext";
import { AssetIcon } from "@/components/AssetIcon";
import {
  useGetPortfolioSummary, useGetHoldings, useGetTransactions, useGetMarketSummary
} from "@workspace/api-client-react";
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  ArrowLeftRight, BarChart2, Loader2, Check, ChevronRight,
  Activity, Users, Zap, Settings2,
} from "lucide-react";

const fmtUSD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Onboarding overlay ─────────────────────────────────────────────────────────
const CATEGORIES: {
  id: MarketCategory; title: string; subtitle: string;
  icon: React.ReactNode; assets: string;
}[] = [
  {
    id: "stocks",
    title: "Stocks & ETFs",
    subtitle: "NYSE, NASDAQ, LSE and 170+ global markets",
    assets: "AAPL • TSLA • NVDA • SPY",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "crypto",
    title: "Cryptocurrency",
    subtitle: "Bitcoin, Ethereum, Solana and 60+ coins",
    assets: "BTC • ETH • SOL • BNB",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9 8h4.5a2 2 0 0 1 0 4H9v4h5" />
        <line x1="11" y1="6" x2="11" y2="8" />
        <line x1="13" y1="6" x2="13" y2="8" />
        <line x1="11" y1="16" x2="11" y2="18" />
        <line x1="13" y1="16" x2="13" y2="18" />
      </svg>
    ),
  },
  {
    id: "commodities",
    title: "Commodities",
    subtitle: "Gold, silver, crude oil and agricultural futures",
    assets: "XAU • XAG • WTI • WHEAT",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        <path d="M8.5 8.5l1.5 1.5M14 14l1.5 1.5M14 8.5l-1.5 1.5M9 14l-1.5 1.5" />
      </svg>
    ),
  },
  {
    id: "retirement",
    title: "Retirement Accounts",
    subtitle: "IRA, Roth IRA, SEP and pension accounts",
    assets: "IRA • ROTH • SEP • 401k",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

function MarketOnboarding({ onComplete }: { onComplete: (prefs: MarketCategory[]) => void }) {
  const [selected, setSelected] = useState<Set<MarketCategory>>(new Set());
  const { colors, mode } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE } = colors;

  const toggle = (id: MarketCategory) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: BG,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "0 16px 32px",
      overflowY: "auto",
    }}>
      <div style={{ width: "100%", maxWidth: 560, paddingTop: 48 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase", marginBottom: 14 }}>
            PERSONALISE YOUR EXPERIENCE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>
            What would you like to trade?
          </h1>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            Select all markets that interest you. You can always change this later.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {CATEGORIES.map(cat => {
            const active = selected.has(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)} style={{
                display: "flex", alignItems: "center", gap: 18,
                padding: "18px 20px", borderRadius: 14, cursor: "pointer",
                background: active ? (mode === "dark" ? "rgba(37,99,255,0.1)" : "rgba(37,99,255,0.06)") : CARD,
                border: `1px solid ${active ? BLUE : BORD}`,
                textAlign: "left", width: "100%",
                transition: "all 0.15s",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: active ? (mode === "dark" ? "rgba(37,99,255,0.18)" : "rgba(37,99,255,0.1)") : (mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: active ? BLUE : MUTED,
                  transition: "all 0.15s",
                }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{cat.title}</div>
                  <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>{cat.subtitle}</div>
                  <div style={{ fontSize: 11, color: active ? BLUE : MUTED, fontFamily: "monospace", marginTop: 4, letterSpacing: "0.04em" }}>
                    {cat.assets}
                  </div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${active ? BLUE : BORD}`,
                  background: active ? BLUE : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {active && <Check style={{ width: 12, height: 12, color: "#fff" }} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          disabled={selected.size === 0}
          onClick={() => onComplete(Array.from(selected))}
          style={{
            width: "100%", height: 52, borderRadius: 12,
            background: selected.size > 0 ? BLUE : (mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
            color: selected.size > 0 ? "#fff" : MUTED,
            fontSize: 15, fontWeight: 700, border: "none",
            cursor: selected.size > 0 ? "pointer" : "not-allowed",
            letterSpacing: "0.02em",
            transition: "all 0.15s",
          }}
        >
          Continue{selected.size > 0 ? ` with ${selected.size} market${selected.size > 1 ? "s" : ""}` : ""}
        </button>

        {selected.size === 0 && (
          <p style={{ textAlign: "center", fontSize: 12, color: MUTED, marginTop: 12 }}>
            Select at least one market to continue
          </p>
        )}
      </div>
    </div>
  );
}

// ── Community activity (simulated, changes each session) ───────────────────────
function getCommunityFeed(prefs: MarketCategory[]): { label: string; sub: string; delta?: string; positive?: boolean }[] {
  const seed = Date.now() % 10000;
  const rand = (min: number, max: number, offset = 0) => Math.floor(((seed + offset) % (max - min)) + min);

  const feed: { label: string; sub: string; delta?: string; positive?: boolean }[] = [];

  if (prefs.includes("crypto")) {
    feed.push(
      { label: `${(rand(1200, 4800, 1)).toLocaleString()} members bought BTC`, sub: "in the last hour", delta: `+${(rand(18, 42, 2) / 10).toFixed(1)}%`, positive: true },
      { label: `ETH/USD leading crypto gainers`, sub: `${(rand(800, 2400, 3)).toLocaleString()} new positions opened`, delta: `+${(rand(10, 38, 4) / 10).toFixed(1)}%`, positive: true },
      { label: "Trending: SOL, BNB, LINK, DOT", sub: "most-watched digital assets today" },
    );
  }
  if (prefs.includes("stocks")) {
    feed.push(
      { label: `NVDA leading equity gainers`, sub: `${(rand(600, 2200, 5)).toLocaleString()} new buys today`, delta: `+${(rand(8, 52, 6) / 10).toFixed(1)}%`, positive: true },
      { label: `S&P 500 index funds up week-to-date`, sub: `${(rand(300, 1600, 7)).toLocaleString()} members tracking SPY`, delta: `+${(rand(4, 18, 8) / 10).toFixed(1)}%`, positive: true },
      { label: "Most watched: AAPL, MSFT, GOOGL", sub: "high institutional interest today" },
    );
  }
  if (prefs.includes("commodities")) {
    feed.push(
      { label: `Gold at new ${rand(3, 6, 9)}-month high`, sub: `${(rand(400, 1400, 10)).toLocaleString()} new positions`, delta: `+${(rand(4, 16, 11) / 10).toFixed(1)}%`, positive: true },
      { label: "WTI Crude holding key support", sub: `${(rand(200, 900, 12)).toLocaleString()} members tracking oil`, delta: `${rand(0, 1, 13) ? "+" : "-"}${(rand(3, 14, 14) / 10).toFixed(1)}%`, positive: rand(0, 1, 13) === 1 },
      { label: "Silver outperforming gold YTD", sub: "commodities rotation in progress" },
    );
  }
  if (prefs.includes("retirement")) {
    feed.push(
      { label: "IRA contributions up this quarter", sub: "tax-advantaged accounts growing 8% YoY", delta: "+8.4%", positive: true },
      { label: "Balanced portfolio strategy trending", sub: `${(rand(300, 1100, 15)).toLocaleString()} members enrolled this month` },
      { label: "Roth IRA conversion window open", sub: "optimal tax conditions for conversion" },
    );
  }

  return feed.slice(0, 6);
}

// ── Market summary tiles by preference ────────────────────────────────────────
function getMarketTiles(prefs: MarketCategory[]) {
  const tiles: { symbol: string; name: string; price: string; change: string; pos: boolean }[] = [];
  if (prefs.includes("crypto")) {
    tiles.push(
      { symbol: "BTC", name: "Bitcoin", price: "$107,840", change: "+2.41%", pos: true },
      { symbol: "ETH", name: "Ethereum", price: "$3,880", change: "+1.87%", pos: true },
      { symbol: "SOL", name: "Solana", price: "$184.30", change: "-0.62%", pos: false },
    );
  }
  if (prefs.includes("stocks")) {
    tiles.push(
      { symbol: "AAPL", name: "Apple Inc.", price: "$213.40", change: "+0.94%", pos: true },
      { symbol: "NVDA", name: "Nvidia Corp", price: "$891.20", change: "+4.22%", pos: true },
      { symbol: "SPY", name: "S&P 500 ETF", price: "$524.80", change: "+0.72%", pos: true },
    );
  }
  if (prefs.includes("commodities")) {
    tiles.push(
      { symbol: "XAU", name: "Gold Spot", price: "$2,380.50", change: "+0.61%", pos: true },
      { symbol: "WTI", name: "Crude Oil", price: "$82.40", change: "-1.14%", pos: false },
      { symbol: "XAG", name: "Silver Spot", price: "$28.70", change: "+1.32%", pos: true },
    );
  }
  if (prefs.includes("retirement")) {
    tiles.push(
      { symbol: "VTI", name: "Vanguard Total", price: "$248.90", change: "+0.55%", pos: true },
      { symbol: "BND", name: "Vanguard Bonds", price: "$72.30", change: "+0.12%", pos: true },
      { symbol: "SCHB", name: "Schwab US Broad", price: "$28.40", change: "+0.44%", pos: true },
    );
  }
  return tiles.slice(0, 6);
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { colors, mode } = useTheme();
  const { preferences, hasSetPreferences, setPreferences, resetPreferences } = useMarketPreferences();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg } = colors;

  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: txData, isLoading: txl } = useGetTransactions({ limit: 5 });

  const totalValue = summary?.totalAssets || 0;
  const firstName = user?.fullName?.split(" ")[0] || "there";

  const actions = [
    { label: "Deposit",  icon: ArrowDownToLine,  href: "/wallet",   primary: true },
    { label: "Withdraw", icon: ArrowUpFromLine,   href: "/wallet",   primary: false },
    { label: "Buy",      icon: TrendingUp,        href: "/invest",   primary: false },
    { label: "Sell",     icon: TrendingDown,      href: "/invest",   primary: false },
    { label: "Convert",  icon: ArrowLeftRight,    href: "/convert",  primary: false },
    { label: "Markets",  icon: BarChart2,         href: "/markets",  primary: false },
  ];

  const communityFeed = hasSetPreferences ? getCommunityFeed(preferences) : [];
  const marketTiles = hasSetPreferences ? getMarketTiles(preferences) : [];

  const labelForPrefs = preferences.map(p => CATEGORIES.find(c => c.id === p)?.title?.split(" ")[0]).filter(Boolean).join(", ");

  // Market preferences are set during onboarding — no blocking overlay on dashboard

  return (
    <div style={{ padding: "20px 16px 0", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>

      {/* ── Welcome greeting (mobile-first, visible all sizes) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
          Welcome back, {firstName}
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          {" "}·{" "}
          <span style={{ color: BLUE }}>
            {labelForPrefs || "All Markets"}
          </span>
          <button onClick={resetPreferences} style={{
            background: "none", border: "none", cursor: "pointer",
            color: MUTED, fontSize: 11, marginLeft: 8, padding: "2px 6px",
            borderRadius: 4, textDecoration: "underline",
          }}>Change</button>
        </div>
      </div>

      {/* ── Balance Hero ── */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Total Portfolio Value
        </div>
        {ls ? (
          <Loader2 style={{ width: 22, height: 22, color: MUTED, animation: "spin 1s linear infinite" }} />
        ) : (
          <div style={{ fontSize: 34, fontWeight: 700, color: TEXT, fontFamily: "monospace", letterSpacing: "-1px", lineHeight: 1 }}>
            ${fmtUSD(totalValue)}
          </div>
        )}
        {summary && (
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
            Available cash:{" "}
            <span style={{ color: TEXT, fontFamily: "monospace" }}>${fmtUSD(summary.cashBalance || 0)}</span>
          </div>
        )}
      </div>

      {/* ── Quick Actions (horizontal scroll) ── */}
      <div className="hide-scrollbar" style={{
        display: "flex", gap: 8, overflowX: "auto", marginBottom: 24,
        paddingBottom: 2, scrollbarWidth: "none",
      }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "0 16px", height: 38, flexShrink: 0,
            background: a.primary ? BLUE : inputBg,
            border: `1px solid ${a.primary ? BLUE : BORD}`,
            borderRadius: 999,
            color: a.primary ? "#fff" : TEXT,
            fontSize: 13, fontWeight: 500, textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            <a.icon style={{ width: 13, height: 13, flexShrink: 0, opacity: 0.75 }} strokeWidth={2} />
            {a.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left / Main column ── */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Market Overview tiles */}
          {marketTiles.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Your Markets</div>
                <Link href="/markets" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  View all <ChevronRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
              <div className="hide-scrollbar" style={{ display: "flex", gap: 0, overflowX: "auto" }}>
                {marketTiles.map((t, i) => (
                  <div key={t.symbol} style={{
                    padding: "14px 18px", flexShrink: 0, minWidth: 130,
                    borderRight: i < marketTiles.length - 1 ? `1px solid ${BORD}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <AssetIcon symbol={t.symbol} size={22} borderRadius="50%" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{t.symbol}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>{t.price}</div>
                    <div style={{ fontSize: 11, color: t.pos ? GREEN : RED, fontFamily: "monospace", marginTop: 2 }}>{t.change}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Holdings */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Holdings</div>
              <Link href="/wallet" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                Details <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Asset", "Quantity", "Value", "24h"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 500, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lh ? (
                    <tr><td colSpan={4} style={{ padding: 36, textAlign: "center" }}>
                      <Loader2 style={{ width: 20, height: 20, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    </td></tr>
                  ) : holdings?.length ? holdings.map(h => {
                    const pos = h.gainLossPercentage >= 0;
                    return (
                      <tr key={h.symbol} style={{ borderBottom: `1px solid ${BORD}` }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <AssetIcon symbol={h.symbol} size={30} borderRadius="50%" />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{h.symbol}</div>
                              <div style={{ fontSize: 11, color: MUTED }}>{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, color: TEXT, fontFamily: "monospace" }}>{h.quantity.toLocaleString()}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, color: TEXT, fontFamily: "monospace" }}>${fmtUSD(h.currentValue)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontFamily: "monospace", color: pos ? GREEN : RED }}>
                          {pos ? "+" : ""}{h.gainLossPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={4} style={{ padding: 36, textAlign: "center", color: MUTED, fontSize: 13 }}>
                      No holdings yet.{" "}
                      <Link href="/wallet" style={{ color: BLUE, textDecoration: "none" }}>Deposit to get started →</Link>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Community Activity */}
          {communityFeed.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 8 }}>
                <Users style={{ width: 15, height: 15, color: MUTED }} strokeWidth={1.5} />
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Platform Activity</div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
                  <span style={{ fontSize: 11, color: MUTED }}>Live</span>
                </div>
              </div>
              <div>
                {communityFeed.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "13px 20px",
                    borderBottom: i < communityFeed.length - 1 ? `1px solid ${BORD}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <Activity style={{ width: 13, height: 13, color: MUTED, flexShrink: 0 }} strokeWidth={1.5} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, lineHeight: 1.3 }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </div>
                    {item.delta && (
                      <div style={{ fontSize: 12, fontFamily: "monospace", color: item.positive ? GREEN : RED, flexShrink: 0, marginLeft: 12 }}>
                        {item.delta}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick deposit CTA */}
          <div style={{
            background: `linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(37,99,255,0.06) 100%)`,
            border: `1px solid rgba(37,99,255,0.25)`,
            borderRadius: 16, padding: "20px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Ready to invest?</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 16 }}>
              Fund your account to start trading {labelForPrefs || "across all markets"}.
            </div>
            <Link href="/wallet" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              height: 40, borderRadius: 10, background: BLUE, color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              <ArrowDownToLine style={{ width: 14, height: 14 }} strokeWidth={2} />
              Deposit Funds
            </Link>
          </div>

          {/* Recent Transactions */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, fontSize: 14, fontWeight: 600, color: TEXT }}>
              Recent Activity
            </div>
            <div>
              {txl ? (
                <div style={{ padding: 32, textAlign: "center" }}>
                  <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : txData?.transactions?.length ? txData.transactions.map((tx, i, arr) => (
                <div key={tx.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "13px 20px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, textTransform: "capitalize", marginBottom: 2 }}>
                      {tx.type} {tx.symbol || ""}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace", color: tx.type === "deposit" ? GREEN : TEXT }}>
                    {tx.type === "deposit" ? "+" : tx.type === "withdraw" ? "−" : ""}${fmtUSD(tx.amount)}
                  </div>
                </div>
              )) : (
                <div style={{ padding: "28px 20px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                  No transactions yet
                </div>
              )}
            </div>
            {txData?.transactions?.length ? (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORD}` }}>
                <Link href="/wallet" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  View all transactions <ChevronRight style={{ width: 12, height: 12 }} />
                </Link>
              </div>
            ) : null}
          </div>

          {/* Preferences card */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Settings2 style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Your Preferences</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {preferences.map(p => {
                const cat = CATEGORIES.find(c => c.id === p);
                return cat ? (
                  <span key={p} style={{
                    padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 500,
                    background: mode === "dark" ? "rgba(37,99,255,0.12)" : "rgba(37,99,255,0.08)",
                    color: BLUE, border: `1px solid rgba(37,99,255,0.25)`,
                  }}>
                    {cat.title.split(" ")[0]}
                  </span>
                ) : null;
              })}
            </div>
            <button onClick={resetPreferences} style={{
              marginTop: 12, background: "none", border: "none",
              cursor: "pointer", color: MUTED, fontSize: 12,
              display: "flex", alignItems: "center", gap: 4, padding: 0,
            }}>
              <Zap style={{ width: 11, height: 11 }} strokeWidth={2} />
              Change market preferences
            </button>
          </div>
        </div>

      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
