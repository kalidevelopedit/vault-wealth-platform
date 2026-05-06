import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import { useMarketPreferences, MarketCategory } from "@/contexts/MarketPreferencesContext";
import { AssetIcon } from "@/components/AssetIcon";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useGetPortfolioSummary, useGetHoldings, useGetTransactions,
} from "@workspace/api-client-react";
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  ArrowLeftRight, BarChart2, Loader2, Check, ChevronRight,
  Activity, Users, Zap, Settings2, Newspaper, ExternalLink,
  ChevronLeft, Sparkles, RefreshCw,
} from "lucide-react";

const fmtUSD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Market Onboarding ─────────────────────────────────────────────────────────
const CATEGORIES: { id: MarketCategory; title: string; subtitle: string; icon: React.ReactNode; assets: string }[] = [
  {
    id: "stocks", title: "Stocks & ETFs", subtitle: "NYSE, NASDAQ, LSE and 170+ global markets",
    assets: "AAPL • TSLA • NVDA • SPY",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "crypto", title: "Cryptocurrency", subtitle: "Bitcoin, Ethereum, Solana and 60+ coins",
    assets: "BTC • ETH • SOL • BNB",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9 8h4.5a2 2 0 0 1 0 4H9v4h5" />
        <line x1="11" y1="6" x2="11" y2="8" /><line x1="13" y1="6" x2="13" y2="8" />
        <line x1="11" y1="16" x2="11" y2="18" /><line x1="13" y1="16" x2="13" y2="18" />
      </svg>
    ),
  },
  {
    id: "commodities", title: "Commodities", subtitle: "Gold, silver, crude oil and agricultural futures",
    assets: "XAU • XAG • WTI • WHEAT",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        <path d="M8.5 8.5l1.5 1.5M14 14l1.5 1.5M14 8.5l-1.5 1.5M9 14l-1.5 1.5" />
      </svg>
    ),
  },
  {
    id: "retirement", title: "Retirement Accounts", subtitle: "IRA, Roth IRA, SEP and pension accounts",
    assets: "IRA • ROTH • SEP • 401k",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

function MarketOnboarding({ onComplete, onCancel, initialSelected = [], isEdit = false }: {
  onComplete: (prefs: MarketCategory[]) => void;
  onCancel?: () => void;
  initialSelected?: MarketCategory[];
  isEdit?: boolean;
}) {
  const [selected, setSelected] = useState<Set<MarketCategory>>(new Set(initialSelected));
  const { colors, mode } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE } = colors;
  const toggle = (id: MarketCategory) => {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: isEdit ? "rgba(0,0,0,0.7)" : BG, backdropFilter: isEdit ? "blur(6px)" : "none", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px 32px", overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 560, paddingTop: isEdit ? 40 : 48, background: isEdit ? CARD : "transparent", borderRadius: isEdit ? 24 : 0, border: isEdit ? `1px solid ${BORD}` : "none", padding: isEdit ? "32px 28px" : "48px 0 32px", marginTop: isEdit ? 40 : 0 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {isEdit && onCancel && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 22, lineHeight: 1, padding: "0 4px" }}>×</button>
            </div>
          )}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: MUTED, textTransform: "uppercase", marginBottom: 14 }}>
            {isEdit ? "UPDATE YOUR MARKETS" : "PERSONALISE YOUR EXPERIENCE"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>
            {isEdit ? "Which markets do you trade?" : "What would you like to trade?"}
          </h1>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
            {isEdit ? "Update your selection — your dashboard will reflect the change immediately." : "Select all markets that interest you. You can always change this later."}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {CATEGORIES.map(cat => {
            const active = selected.has(cat.id);
            return (
              <button key={cat.id} onClick={() => toggle(cat.id)} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 14, cursor: "pointer",
                background: active ? (mode === "dark" ? "rgba(37,99,255,0.1)" : "rgba(37,99,255,0.06)") : (isEdit ? "transparent" : CARD),
                border: `1px solid ${active ? BLUE : BORD}`, textAlign: "left", width: "100%", transition: "all 0.15s",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: active ? (mode === "dark" ? "rgba(37,99,255,0.18)" : "rgba(37,99,255,0.1)") : (mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), display: "flex", alignItems: "center", justifyContent: "center", color: active ? BLUE : MUTED }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{cat.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{cat.subtitle}</div>
                  <div style={{ fontSize: 10, color: active ? BLUE : MUTED, fontFamily: "monospace", marginTop: 3 }}>{cat.assets}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: `1.5px solid ${active ? BLUE : BORD}`, background: active ? BLUE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <Check style={{ width: 12, height: 12, color: "#fff" }} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
        <button disabled={selected.size === 0} onClick={() => onComplete(Array.from(selected))} style={{
          width: "100%", height: 50, borderRadius: 12,
          background: selected.size > 0 ? BLUE : (mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
          color: selected.size > 0 ? "#fff" : MUTED, fontSize: 15, fontWeight: 700, border: "none",
          cursor: selected.size > 0 ? "pointer" : "not-allowed",
        }}>
          {isEdit
            ? (selected.size > 0 ? `Save ${selected.size} Market${selected.size > 1 ? "s" : ""}` : "Select at least one")
            : (selected.size > 0 ? `Continue with ${selected.size} market${selected.size > 1 ? "s" : ""}` : "Select at least one market")}
        </button>
        {isEdit && onCancel && (
          <button onClick={onCancel} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", padding: "8px 0" }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ── News Carousel ─────────────────────────────────────────────────────────────
type NewsItem = { id: number; title: string; summary?: string; source: string; url: string; imageUrl?: string; category?: string; publishedAt: string };

const PREF_KEYWORDS: Record<MarketCategory, string[]> = {
  crypto: ["bitcoin","btc","ethereum","eth","crypto","blockchain","solana","bnb","defi","nft","web3","coinbase","binance","altcoin","digital asset","token"],
  stocks: ["stock","equit","nasdaq","nyse","s&p","dow","aapl","apple","nvidia","nvda","tesla","tsla","ipo","earnings","wall street","share","portfolio","dividend","etf","fed","rate"],
  commodities: ["gold","silver","oil","crude","commodity","wheat","gas","copper","platinum","xau","wti","brent","futures","metals"],
  retirement: ["ira","401k","pension","retirement","roth","annuit","social security","retiree"],
};

function newsMatchesPref(news: NewsItem, prefs: MarketCategory[]): boolean {
  if (prefs.length === 0) return true;
  const haystack = `${news.title} ${news.summary || ""} ${news.category || ""}`.toLowerCase();
  return prefs.some(pref => PREF_KEYWORDS[pref].some(kw => haystack.includes(kw)));
}

function NewsCarousel({ preferences, colors }: { preferences: MarketCategory[]; colors: any }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/market/news?limit=50");
      const data = await res.json();
      const all = Array.isArray(data) ? data : [];
      const filtered = all.filter((n: NewsItem) => newsMatchesPref(n, preferences));
      setNews(filtered.length > 0 ? filtered : all.slice(0, 10));
      setIdx(0);
      setLastRefresh(Date.now());
    } catch {
      // fallback static news
      const fallback: NewsItem[] = [
        { id: 1, title: "Bitcoin consolidates above $107K as institutional demand grows", summary: "Major asset managers continue accumulating BTC positions as macro uncertainty persists.", source: "CryptoDesk", url: "#", category: "crypto", publishedAt: new Date().toISOString() },
        { id: 2, title: "Gold hits 6-month high at $3,320/oz amid geopolitical tensions", summary: "Safe-haven demand drives precious metals to multi-month highs.", source: "Commodities Today", url: "#", category: "commodities", publishedAt: new Date().toISOString() },
        { id: 3, title: "NVDA surges 4.2% after record AI chip revenue beat expectations", summary: "Nvidia's data center division posts record quarterly earnings on surging AI compute demand.", source: "MarketWatch", url: "#", category: "stocks", publishedAt: new Date().toISOString() },
        { id: 4, title: "Ethereum upgrade set to reduce gas fees by up to 80%", summary: "The upcoming network upgrade promises significant improvements to transaction throughput.", source: "ETH Daily", url: "#", category: "crypto", publishedAt: new Date().toISOString() },
        { id: 5, title: "S&P 500 closes at all-time high for third consecutive week", summary: "Strong earnings season fuels continued equity market momentum.", source: "Reuters", url: "#", category: "stocks", publishedAt: new Date().toISOString() },
      ];
      setNews(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh every 10 minutes
    const refreshInterval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [preferences.join(",")]);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (news.length === 0) return;
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % news.length), 6000);
    return () => clearInterval(intervalRef.current);
  }, [news.length]);

  const go = (dir: 1 | -1) => {
    clearInterval(intervalRef.current);
    setIdx(i => (i + dir + news.length) % news.length);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 2) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <Loader2 style={{ width: 16, height: 16, color: colors.muted, animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, color: colors.muted }}>Loading latest news…</span>
      </div>
    );
  }

  if (news.length === 0) return null;

  const current = news[idx];

  return (
    <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.bord}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Newspaper style={{ width: 14, height: 14, color: colors.blue }} strokeWidth={1.8} />
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Market News</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, boxShadow: `0 0 6px ${colors.green}` }} />
            <span style={{ fontSize: 10, color: colors.muted, fontWeight: 500 }}>Live</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => fetchNews()} title="Refresh" style={{ background: "none", border: "none", cursor: "pointer", color: colors.muted, display: "flex", padding: 4 }}>
            <RefreshCw style={{ width: 12, height: 12 }} strokeWidth={2} />
          </button>
          <span style={{ fontSize: 11, color: colors.muted }}>{idx + 1}/{news.length}</span>
        </div>
      </div>

      {/* Card */}
      <div style={{ padding: "20px 20px 16px", minHeight: 140 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {current.imageUrl && (
            <img src={current.imageUrl} alt="" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1px solid ${colors.bord}` }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, lineHeight: 1.45, marginBottom: 8 }}>
              {current.title}
            </div>
            {current.summary && (
              <div style={{ fontSize: 12, color: colors.muted, lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {current.summary}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: colors.muted }}>
                <span style={{ fontWeight: 500, color: colors.blue }}>{current.source}</span>
                {" · "}{timeAgo(current.publishedAt)}
              </div>
              {current.url && current.url !== "#" && (
                <a href={current.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: colors.blue, textDecoration: "none" }}>
                  Read <ExternalLink style={{ width: 10, height: 10 }} strokeWidth={2} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls + Dots */}
      <div style={{ padding: "10px 20px 14px", borderTop: `1px solid ${colors.bord}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {news.slice(0, Math.min(news.length, 8)).map((_, i) => (
            <button key={i} onClick={() => { clearInterval(intervalRef.current); setIdx(i); }} style={{
              width: i === idx ? 16 : 6, height: 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0,
              background: i === idx ? colors.blue : colors.bord, transition: "all 0.2s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => go(-1)} style={{ width: 28, height: 28, borderRadius: 8, background: colors.inputBg, border: `1px solid ${colors.bord}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted }}>
            <ChevronLeft style={{ width: 14, height: 14 }} strokeWidth={2} />
          </button>
          <button onClick={() => go(1)} style={{ width: 28, height: 28, borderRadius: 8, background: colors.inputBg, border: `1px solid ${colors.bord}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted }}>
            <ChevronRight style={{ width: 14, height: 14 }} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AI Financial Insight Widget ───────────────────────────────────────────────
const AI_INSIGHTS: Record<MarketCategory | "default", string[]> = {
  crypto: [
    "Bitcoin's realized volatility has compressed significantly — historically this precedes a directional breakout. Watch for a volume surge above $109K as a confirmation signal.",
    "On-chain data shows BTC exchange outflows at 3-month highs, a historically bullish signal. Accumulation by long-term holders (LTH) is accelerating.",
    "Ethereum's staking yield sits at 4.2% annualized. With increasing validator counts and EIP activity, ETH's deflationary mechanics are strengthening.",
    "DeFi TVL has recovered to $92B+. Protocol revenues are up 34% QoQ — consider diversified exposure across established DeFi blue-chips.",
    "Crypto market dominance: BTC at 52.4%, ETH at 17.1%. Altcoin season metrics suggest early-stage rotation — selective altcoin exposure may be timely.",
  ],
  stocks: [
    "S&P 500 forward P/E is at 21.4x — above the 10-year average of 18.1x. Quality growth stocks with expanding margins offer the best risk/reward in this environment.",
    "Mega-cap tech earnings beat consensus by 12% on average this quarter. AI infrastructure capex signals a multi-year secular growth runway for semiconductor leaders.",
    "Sector rotation analysis: Healthcare and Industrials outperforming cyclicals YTD. Defensive positioning may be warranted ahead of the next FOMC meeting.",
    "Dividend aristocrats are underperforming growth by 6.4% YTD. Rate sensitivity is compressing valuations — a potential tactical opportunity for income-oriented investors.",
    "Options market implied volatility (VIX) is at 16.2 — below the long-term average. Low-cost hedges via put spreads may be worth considering at current premiums.",
  ],
  commodities: [
    "Gold's 200-day moving average is sloping upward with increasing conviction. Central bank purchases (particularly from BRICS nations) remain a powerful structural tailwind.",
    "WTI crude inventory builds have stalled. OPEC+ supply discipline and recovering demand from Asia suggest oil may re-test the $85–88 range in the medium term.",
    "Silver's gold-to-silver ratio at 88:1 is historically elevated. Industrial demand from solar panel manufacturing is accelerating — silver could outperform gold this cycle.",
    "Agricultural futures are showing strength on El Niño-related supply concerns. Soft commodity exposure (wheat, corn) may offer uncorrelated returns this quarter.",
    "Copper is the key barometer for global growth — futures are pricing in a China stimulus-driven demand recovery. Current levels may represent a 6–12 month entry opportunity.",
  ],
  retirement: [
    "Target-date fund rebalancing is automatic but not always optimal. Consider reviewing your glide path allocation annually — especially in volatile macro environments.",
    "Roth IRA conversion windows are historically attractive in low-income years. With potential tax bracket changes on the horizon, early conversion may save significantly.",
    "Dollar-cost averaging into broad index funds continues to be the highest-probability long-term strategy. Time in market consistently outperforms timing the market.",
    "Social Security optimization: delaying benefits from 62 to 70 increases monthly payments by ~76%. This break-even analysis is critical for retirement income planning.",
    "Sequence-of-returns risk is the #1 threat to retirement portfolios. A 2-year cash buffer (bucket strategy) protects against withdrawing during down markets.",
  ],
  default: [
    "Diversification across uncorrelated asset classes remains the most reliable risk-adjusted return strategy. Review your allocation against your investment horizon.",
    "Markets are pricing in 2 Fed rate cuts in 2025. Shorter-duration bonds and dividend stocks tend to outperform during early rate-cut cycles.",
    "Geopolitical risk premium is elevated in energy and defense sectors. Tactical exposure to these sectors may provide portfolio hedging.",
    "The 60/40 portfolio correlation turned positive in 2022 for the first time in decades. Alternative assets (commodities, REITs) can restore diversification benefits.",
  ],
};

function AIInsightWidget({ preferences, colors, mode }: { preferences: MarketCategory[]; colors: any; mode: string }) {
  const [insightIdx, setInsightIdx] = useState(0);
  const [category, setCategory] = useState<MarketCategory | "default">("default");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (preferences.length > 0) {
      setCategory(preferences[Math.floor(Math.random() * preferences.length)] as MarketCategory);
    } else {
      setCategory("default");
    }
  }, [preferences.join(",")]);

  const insights = AI_INSIGHTS[category] || AI_INSIGHTS.default;

  const rotate = () => {
    setAnimating(true);
    setTimeout(() => {
      setInsightIdx(i => (i + 1) % insights.length);
      const cats = preferences.length > 0 ? preferences : (["default"] as any[]);
      setCategory(cats[Math.floor(Math.random() * cats.length)] as any);
      setAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const t = setInterval(rotate, 30000);
    return () => clearInterval(t);
  }, [preferences.join(","), category]);

  const categoryLabel = category === "default" ? "General Markets" : CATEGORIES.find(c => c.id === category)?.title?.split(" ")[0] || "Markets";

  return (
    <div style={{
      background: mode === "dark"
        ? "linear-gradient(135deg, rgba(37,99,255,0.08) 0%, rgba(124,58,237,0.06) 100%)"
        : "linear-gradient(135deg, rgba(37,99,255,0.05) 0%, rgba(124,58,237,0.04) 100%)",
      border: `1px solid rgba(37,99,255,0.2)`, borderRadius: 16, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid rgba(37,99,255,0.12)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#2563FF,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 13, height: 13, color: "#fff" }} strokeWidth={2} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>AI Market Insight</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(37,99,255,0.12)", color: colors.blue, fontWeight: 600 }}>
            {categoryLabel}
          </span>
          <button onClick={rotate} style={{ background: "none", border: "none", cursor: "pointer", color: colors.muted, display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: 0 }}>
            <RefreshCw style={{ width: 11, height: 11 }} strokeWidth={2} /> Refresh
          </button>
        </div>
      </div>
      <div style={{ padding: "18px 20px", minHeight: 100 }}>
        <div style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s", fontSize: 13, color: colors.text, lineHeight: 1.7, fontStyle: "italic" }}>
          "{insights[insightIdx % insights.length]}"
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "linear-gradient(135deg,#2563FF,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 10, height: 10, color: "#fff" }} strokeWidth={2} />
          </div>
          <span style={{ fontSize: 11, color: colors.muted }}>Generated by INT Brokers AI · Updates every 30s</span>
        </div>
      </div>
    </div>
  );
}

// ── Community Feed ────────────────────────────────────────────────────────────
function getCommunityFeed(prefs: MarketCategory[]): { label: string; sub: string; delta?: string; positive?: boolean }[] {
  const seed = Date.now() % 10000;
  const rand = (min: number, max: number, offset = 0) => Math.floor(((seed + offset) % (max - min)) + min);
  const feed: { label: string; sub: string; delta?: string; positive?: boolean }[] = [];
  if (prefs.includes("crypto")) {
    feed.push(
      { label: `${rand(1200, 4800, 1).toLocaleString()} members bought BTC`, sub: "in the last hour", delta: `+${(rand(18, 42, 2) / 10).toFixed(1)}%`, positive: true },
      { label: `ETH/USD leading crypto gainers`, sub: `${rand(800, 2400, 3).toLocaleString()} new positions`, delta: `+${(rand(10, 38, 4) / 10).toFixed(1)}%`, positive: true },
      { label: "Trending: SOL, BNB, LINK, DOT", sub: "most-watched digital assets today" },
    );
  }
  if (prefs.includes("stocks")) {
    feed.push(
      { label: `NVDA leading equity gainers`, sub: `${rand(600, 2200, 5).toLocaleString()} new buys today`, delta: `+${(rand(8, 52, 6) / 10).toFixed(1)}%`, positive: true },
      { label: `S&P 500 ETFs up week-to-date`, sub: `${rand(300, 1600, 7).toLocaleString()} members tracking SPY`, delta: `+${(rand(4, 18, 8) / 10).toFixed(1)}%`, positive: true },
      { label: "Most watched: AAPL, MSFT, GOOGL", sub: "high institutional interest" },
    );
  }
  if (prefs.includes("commodities")) {
    feed.push(
      { label: `Gold at new ${rand(3, 6, 9)}-month high`, sub: `${rand(400, 1400, 10).toLocaleString()} new positions`, delta: `+${(rand(4, 16, 11) / 10).toFixed(1)}%`, positive: true },
      { label: "WTI Crude holding key support", sub: `${rand(200, 900, 12).toLocaleString()} members tracking oil` },
      { label: "Silver outperforming gold YTD", sub: "commodities rotation in progress" },
    );
  }
  if (prefs.includes("retirement")) {
    feed.push(
      { label: "IRA contributions up this quarter", sub: "tax-advantaged accounts growing 8% YoY", delta: "+8.4%", positive: true },
      { label: "Balanced portfolio strategy trending", sub: `${rand(300, 1100, 15).toLocaleString()} members enrolled` },
      { label: "Roth IRA conversion window open", sub: "optimal tax conditions for conversion" },
    );
  }
  return feed.slice(0, 6);
}

// ── Market Tiles ──────────────────────────────────────────────────────────────
const ALL_MARKET_TILES = [
  { symbol: "BTC",  name: "Bitcoin",       price: "$107,840", change: "+2.41%", pos: true,  cat: "crypto" as MarketCategory },
  { symbol: "ETH",  name: "Ethereum",      price: "$3,880",   change: "+1.87%", pos: true,  cat: "crypto" as MarketCategory },
  { symbol: "SOL",  name: "Solana",        price: "$184.30",  change: "-0.62%", pos: false, cat: "crypto" as MarketCategory },
  { symbol: "BNB",  name: "BNB",           price: "$618.40",  change: "+1.12%", pos: true,  cat: "crypto" as MarketCategory },
  { symbol: "AAPL", name: "Apple Inc.",    price: "$213.40",  change: "+0.94%", pos: true,  cat: "stocks" as MarketCategory },
  { symbol: "NVDA", name: "Nvidia Corp",   price: "$891.20",  change: "+4.22%", pos: true,  cat: "stocks" as MarketCategory },
  { symbol: "SPY",  name: "S&P 500 ETF",  price: "$524.80",  change: "+0.72%", pos: true,  cat: "stocks" as MarketCategory },
  { symbol: "TSLA", name: "Tesla Inc.",    price: "$179.20",  change: "-1.34%", pos: false, cat: "stocks" as MarketCategory },
  { symbol: "XAU",  name: "Gold Spot",     price: "$3,324.5", change: "+0.61%", pos: true,  cat: "commodities" as MarketCategory },
  { symbol: "WTI",  name: "Crude Oil",     price: "$82.40",   change: "-1.14%", pos: false, cat: "commodities" as MarketCategory },
  { symbol: "XAG",  name: "Silver Spot",   price: "$28.70",   change: "+1.32%", pos: true,  cat: "commodities" as MarketCategory },
  { symbol: "VTI",  name: "Vanguard Total",price: "$248.90",  change: "+0.55%", pos: true,  cat: "retirement" as MarketCategory },
];

type FilterTab = "all" | MarketCategory;

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function PromoModal({ colors, mode, onClose }: { colors: any; mode: string; onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460, borderRadius: 24,
          background: mode === "dark" ? "#0C0F14" : "#fff",
          border: `1px solid ${colors.bord}`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        {/* Banner image */}
        <div style={{ position: "relative" }}>
          <img src="/promo-banner.png" alt="Promo" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 12, right: 12,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>
              Limited Time Offer
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
              Deposit $2,000+ &amp; Get $500 Free
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 24px 28px" }}>
          <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7, marginBottom: 20 }}>
            Fund your INT Brokers account with a minimum of <strong style={{ color: colors.text }}>$2,000</strong> and receive a <strong style={{ color: colors.text }}>$500 welcome bonus</strong> credited instantly — no withdrawal restrictions, no lock-in period.
          </p>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[
              { label: "No withdrawal limit", icon: "✓" },
              { label: "Instant credit",       icon: "✓" },
              { label: "All assets eligible",  icon: "✓" },
            ].map(f => (
              <div key={f.label} style={{
                flex: 1, textAlign: "center", padding: "10px 6px",
                background: `rgba(37,99,255,0.06)`, border: `1px solid rgba(37,99,255,0.12)`,
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 14, color: "#2563FF", fontWeight: 700, marginBottom: 2 }}>{f.icon}</div>
                <div style={{ fontSize: 10, color: colors.muted, fontWeight: 500 }}>{f.label}</div>
              </div>
            ))}
          </div>

          <a href="/wallet" onClick={onClose} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 48, borderRadius: 12,
            background: "linear-gradient(135deg, #1d4ed8, #2563FF)",
            color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 16px rgba(37,99,255,0.4)",
          }}>
            Claim My $500 Bonus
          </a>
          <button onClick={onClose} style={{
            display: "block", width: "100%", marginTop: 10,
            background: "none", border: "none", color: colors.muted,
            fontSize: 13, cursor: "pointer", padding: "8px 0",
          }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { colors, mode } = useTheme();
  const { preferences, hasSetPreferences, setPreferences, resetPreferences } = useMarketPreferences();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg } = colors;
  const isMobile = useIsMobile();

  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: txData, isLoading: txl } = useGetTransactions({ limit: 5 });

  const totalValue = summary?.totalAssets || 0;
  const firstName = user?.fullName?.split(" ")[0] || "there";

  // Promo popup — show once per session
  const [showPromo, setShowPromo] = useState(() => {
    try { return !sessionStorage.getItem("promo_seen"); } catch { return false; }
  });
  const closePromo = () => {
    try { sessionStorage.setItem("promo_seen", "1"); } catch {}
    setShowPromo(false);
  };

  // Edit preferences overlay
  const [showEditPrefs, setShowEditPrefs] = useState(false);

  // Market filter tab state
  const [marketFilter, setMarketFilter] = useState<FilterTab>("all");

  const actions = [
    { label: "Deposit",  icon: ArrowDownToLine,  href: "/wallet",   primary: true },
    { label: "Withdraw", icon: ArrowUpFromLine,   href: "/wallet",   primary: false },
    { label: "Buy",      icon: TrendingUp,        href: "/invest",   primary: false },
    { label: "Sell",     icon: TrendingDown,      href: "/invest",   primary: false },
    { label: "Convert",  icon: ArrowLeftRight,    href: "/convert",  primary: false },
    { label: "Markets",  icon: BarChart2,         href: "/markets",  primary: false },
  ];

  // Platform Activity — refreshes on a random 3 / 6 / 9 s cycle
  const [communityFeed, setCommunityFeed] = useState<ReturnType<typeof getCommunityFeed>>(
    () => hasSetPreferences ? getCommunityFeed(preferences) : []
  );
  useEffect(() => {
    if (!hasSetPreferences) return;
    const DELAYS = [3000, 6000, 9000];
    let tid: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = DELAYS[Math.floor(Math.random() * DELAYS.length)];
      tid = setTimeout(() => {
        setCommunityFeed(getCommunityFeed(preferences));
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(tid);
  }, [hasSetPreferences, preferences.join(",")]);

  const labelForPrefs = preferences.map(p => CATEGORIES.find(c => c.id === p)?.title?.split(" ")[0]).filter(Boolean).join(", ");

  // Market tiles filtered by both preferences AND the current tab
  const filteredTiles = ALL_MARKET_TILES.filter(t => {
    const inPrefs = preferences.length === 0 || preferences.includes(t.cat);
    const inFilter = marketFilter === "all" || t.cat === marketFilter;
    return inPrefs && inFilter;
  });

  // Tab options (only show prefs the user has selected)
  const tabOptions: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All Markets" },
    ...(preferences.includes("crypto")      ? [{ id: "crypto"      as FilterTab, label: "Crypto" }]      : []),
    ...(preferences.includes("stocks")      ? [{ id: "stocks"      as FilterTab, label: "Stocks" }]      : []),
    ...(preferences.includes("commodities") ? [{ id: "commodities" as FilterTab, label: "Commodities" }] : []),
    ...(preferences.includes("retirement")  ? [{ id: "retirement"  as FilterTab, label: "Retirement" }]  : []),
  ];

  return (
    <div style={{ padding: "20px 16px 0", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* Edit preferences overlay */}
      {showEditPrefs && (
        <MarketOnboarding
          isEdit
          initialSelected={preferences}
          onComplete={prefs => { setPreferences(prefs); setShowEditPrefs(false); }}
          onCancel={() => setShowEditPrefs(false)}
        />
      )}

      {/* Promo popup — once per session */}
      {showPromo && hasSetPreferences && <PromoModal colors={colors} mode={mode} onClose={closePromo} />}

      {/* ── Welcome ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>
          Welcome back, {firstName}
        </div>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          {" "}·{" "}
          <span style={{ color: BLUE }}>{labelForPrefs || "All Markets"}</span>
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
      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 24, paddingBottom: 2 }}>
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

          {/* Market Overview tiles + filter tabs */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Your Markets</div>
              {/* Filter Tabs */}
              <div className="hide-scrollbar" style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                {tabOptions.map(tab => (
                  <button key={tab.id} onClick={() => setMarketFilter(tab.id)} style={{
                    height: 28, padding: "0 12px", borderRadius: 999, border: "none",
                    background: marketFilter === tab.id ? BLUE : inputBg,
                    color: marketFilter === tab.id ? "#fff" : MUTED,
                    fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.12s",
                  }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <Link href="/markets" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                View all <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            {filteredTiles.length > 0 ? (
              <div className="hide-scrollbar" style={{ display: "flex", gap: 0, overflowX: "auto" }}>
                {filteredTiles.map((t, i) => (
                  <div key={t.symbol} style={{
                    padding: "14px 18px", flexShrink: 0, minWidth: 130,
                    borderRight: i < filteredTiles.length - 1 ? `1px solid ${BORD}` : "none",
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
            ) : (
              <div style={{ padding: "20px 20px", color: MUTED, fontSize: 13 }}>
                No assets for this filter. <button onClick={() => setMarketFilter("all")} style={{ color: BLUE, background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }}>Show all</button>
              </div>
            )}
          </div>

          {/* News Carousel */}
          {hasSetPreferences && <NewsCarousel preferences={preferences} colors={colors} />}

          {/* AI Insight */}
          {hasSetPreferences && <AIInsightWidget preferences={preferences} colors={colors} mode={mode} />}

          {/* Holdings */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Holdings</div>
              <Link href="/wallet" style={{ fontSize: 12, color: BLUE, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                Details <ChevronRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>
            {lh ? (
              <div style={{ padding: 36, textAlign: "center" }}>
                <Loader2 style={{ width: 20, height: 20, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : !holdings?.length ? (
              <div style={{ padding: 36, textAlign: "center", color: MUTED, fontSize: 13 }}>
                No holdings yet.{" "}
                <Link href="/wallet" style={{ color: BLUE, textDecoration: "none" }}>Deposit to get started →</Link>
              </div>
            ) : isMobile ? (
              /* Mobile card list */
              <div>
                {holdings.map((h, i) => {
                  const pos = h.gainLossPercentage >= 0;
                  return (
                    <div key={h.symbol} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < holdings.length - 1 ? `1px solid ${BORD}` : "none" }}>
                      <AssetIcon symbol={h.symbol} size={32} borderRadius="50%" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{h.symbol}</div>
                        <div style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>${fmtUSD(h.currentValue)}</div>
                        <div style={{ fontSize: 11, color: pos ? GREEN : RED, fontFamily: "monospace" }}>{pos ? "+" : ""}{h.gainLossPercentage.toFixed(2)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop table */
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
                    {holdings.map(h => {
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
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
            <button onClick={() => setShowEditPrefs(true)} style={{
              marginTop: 12, height: 34, padding: "0 14px",
              background: mode === "dark" ? "rgba(37,99,255,0.1)" : "rgba(37,99,255,0.08)",
              border: `1px solid rgba(37,99,255,0.25)`, borderRadius: 8,
              cursor: "pointer", color: BLUE, fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Settings2 style={{ width: 12, height: 12 }} strokeWidth={2} />
              Change market preferences
            </button>
          </div>
        </div>

      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
