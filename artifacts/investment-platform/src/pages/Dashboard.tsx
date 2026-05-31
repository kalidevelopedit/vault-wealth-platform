import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetPortfolioSummary,
  useGetHoldings,
  useGetTransactions,
  useListAssets,
  useGetWatchlist,
  useGetMarketNews,
} from "@workspace/api-client-react";
import {
  TrendingUp, TrendingDown, Star, Flame, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, Clock, ExternalLink,
  ChevronRight, Loader2, Search, Repeat2, BarChart2,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg: "#0c0f1a",
  card: "#131827",
  bord: "rgba(255,255,255,0.07)",
  bord2: "rgba(255,255,255,0.04)",
  text: "rgba(255,255,255,0.92)",
  muted: "rgba(255,255,255,0.38)",
  dim: "rgba(255,255,255,0.14)",
  blue: "#3b82f6",
  gain: "#22c55e",
  loss: "#ef4444",
};

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt2 = (n: number) => (isNaN(n) ? "0.00" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const fmtUSD = (n: number) => "$" + fmt2(n);

const fmtCompact = (n: number) => {
  if (!n || isNaN(n)) return "—";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";
  return fmtUSD(n);
};

const fmtPrice = (n: number) => {
  if (!n || isNaN(n)) return "$0.00";
  if (n < 0.0001) return "$" + n.toFixed(8);
  if (n < 0.01) return "$" + n.toFixed(6);
  if (n < 1) return "$" + n.toFixed(4);
  return fmtUSD(n);
};

const timeAgo = (d: string) => {
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days < 7 ? `${days}d ago` : new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ── Sparkline bar ─────────────────────────────────────────────────────────────
function SparkBar({ pct }: { pct: number }) {
  const isPos = pct >= 0;
  const BARS = 10;
  const lit = Math.min(BARS, Math.round((Math.abs(pct) / 8) * BARS));
  const heights = useMemo(() => Array.from({ length: BARS }, () => 30 + Math.floor(Math.random() * 65)), []);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 26 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, height: `${h}%`, borderRadius: 1,
          background: i < lit ? (isPos ? T.gain : T.loss) : T.dim,
          opacity: i < lit ? 0.85 : 0.3,
        }} />
      ))}
    </div>
  );
}

// ── Portfolio Hero ────────────────────────────────────────────────────────────
function PortfolioHero() {
  const { data: summary, isLoading } = useGetPortfolioSummary();
  const s = summary as any;
  const total = s?.totalValue ?? 0;
  const dayPnl = s?.dayPnl ?? 0;
  const dayPct = s?.dayPnlPercent ?? 0;
  const cash = s?.availableCash ?? 0;
  const invested = Math.max(0, total - cash);
  const isGain = dayPnl >= 0;

  return (
    <div style={{
      background: "linear-gradient(135deg, #151b3a 0%, #0f1424 55%, #0c0f1a 100%)",
      border: `1px solid ${T.bord}`,
      borderRadius: 16, padding: "28px 28px 24px",
      marginBottom: 20, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -80, right: 80, width: 260, height: 260, borderRadius: "50%", background: "rgba(59,130,246,0.05)", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "16px 40px", alignItems: "flex-start", justifyContent: "space-between" }}>

        {/* Balance */}
        <div>
          <p style={{ fontSize: 11, color: T.muted, letterSpacing: "0.13em", fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Total Portfolio Value</p>
          {isLoading ? (
            <div style={{ height: 52 }}><Loader2 size={20} style={{ color: T.muted }} className="animate-spin" /></div>
          ) : (
            <>
              <h1 style={{ fontSize: 36, fontWeight: 700, color: T.text, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{fmtUSD(total)}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: isGain ? T.gain : T.loss }}>
                  {isGain ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
                  {isGain ? "+" : ""}{fmtUSD(dayPnl)} ({isGain ? "+" : ""}{fmt2(dayPct)}%)
                </span>
                <span style={{ fontSize: 12, color: T.muted }}>24h</span>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "24px 36px", flexWrap: "wrap" }}>
          {[["Available Cash", fmtUSD(cash)], ["Invested", fmtUSD(invested)]].map(([lbl, val]) => (
            <div key={lbl}>
              <p style={{ fontSize: 10.5, color: T.muted, letterSpacing: "0.1em", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>{lbl}</p>
              <p style={{ fontSize: 19, fontWeight: 600, color: T.text, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { label: "Deposit",  href: "/wallet",  Icon: ArrowDownToLine, primary: true },
            { label: "Withdraw", href: "/wallet",  Icon: ArrowUpFromLine },
            { label: "Trade",    href: "/markets", Icon: BarChart2 },
            { label: "Convert",  href: "/convert", Icon: Repeat2 },
          ].map(({ label, href, Icon, primary }) => (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9,
              background: primary ? T.blue : "rgba(255,255,255,0.05)",
              border: `1px solid ${primary ? "transparent" : T.bord}`,
              color: T.text, fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              <Icon size={13} strokeWidth={1.75} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Market Overview ───────────────────────────────────────────────────────────
type AssetRow = {
  symbol: string; name: string; assetType: string;
  currentPrice: number; change24h: number; changePercent24h: number;
  marketCap?: number; logoUrl?: string;
};
type TabId = "hot" | "favorites" | "all" | "crypto" | "stocks" | "metals" | "futures";

const MARKET_TABS: { id: TabId; label: string; icon?: React.ReactNode }[] = [
  { id: "hot",       label: "Hot",         icon: <Flame size={12} /> },
  { id: "favorites", label: "Favorites",   icon: <Star size={12} /> },
  { id: "all",       label: "All Markets" },
  { id: "crypto",    label: "Crypto" },
  { id: "stocks",    label: "Stocks" },
  { id: "metals",    label: "Metals" },
  { id: "futures",   label: "Futures" },
];

function MarketOverview() {
  const [tab, setTab] = useState<TabId>("hot");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "change" | "cap">("change");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [, navigate] = useLocation();

  const { data: allRaw }   = useListAssets();
  const { data: cryptoRaw } = useListAssets({ type: "crypto" as any });
  const { data: stockRaw }  = useListAssets({ type: "stock" as any });
  const { data: metalRaw }  = useListAssets({ type: "commodity" as any });
  const { data: watchRaw }  = useGetWatchlist();

  const watchSet = useMemo(() => new Set(((watchRaw as any[]) ?? []).map((w: any) => w.symbol)), [watchRaw]);

  const all    = (allRaw    as any[] ?? []) as AssetRow[];
  const crypto = (cryptoRaw as any[] ?? []) as AssetRow[];
  const stocks = (stockRaw  as any[] ?? []) as AssetRow[];
  const metals = (metalRaw  as any[] ?? []) as AssetRow[];

  const base = useMemo((): AssetRow[] => {
    switch (tab) {
      case "hot":       return [...all].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 15);
      case "favorites": return all.filter(a => watchSet.has(a.symbol));
      case "crypto":    return crypto;
      case "stocks":    return stocks;
      case "metals":    return metals;
      case "futures":   return all.filter(a => a.assetType === "futures");
      default:          return all;
    }
  }, [tab, all, crypto, stocks, metals, watchSet]);

  const rows = useMemo(() => {
    let list = base;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let d = sortBy === "price" ? a.currentPrice - b.currentPrice
            : sortBy === "change" ? a.changePercent24h - b.changePercent24h
            : (a.marketCap ?? 0) - (b.marketCap ?? 0);
      return sortDir === "desc" ? -d : d;
    });
  }, [base, search, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const COL = "36px 1fr 110px 80px 110px 56px 60px";

  return (
    <div style={{ background: T.card, border: `1px solid ${T.bord}`, borderRadius: 16, overflow: "hidden" }}>
      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${T.bord}`, padding: "0 14px", overflowX: "auto" }}>
        {MARKET_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "12px 11px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? T.text : T.muted,
            borderBottom: tab === t.id ? `2px solid ${T.blue}` : "2px solid transparent",
            marginBottom: -1, whiteSpace: "nowrap",
          }}>
            {t.icon && <span style={{ color: tab === t.id ? (t.id === "hot" ? "#f97316" : T.blue) : T.muted }}>{t.icon}</span>}
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", padding: "0 0 0 10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: T.bord2, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "5px 9px" }}>
            <Search size={11} style={{ color: T.muted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter..." style={{ background: "none", border: "none", outline: "none", color: T.text, fontSize: 12.5, width: 68 }} />
          </div>
        </div>
      </div>

      {/* Header row */}
      <div style={{ display: "grid", gridTemplateColumns: COL, padding: "7px 14px", borderBottom: `1px solid ${T.bord}`, gap: 8 }}>
        {(["#", "Name", "Price", "24h %", "Market Cap", "7d", ""] as const).map((lbl, i) => (
          <div key={i}
            onClick={() => {
              if (lbl === "Price") toggleSort("price");
              else if (lbl === "24h %") toggleSort("change");
              else if (lbl === "Market Cap") toggleSort("cap");
            }}
            style={{
              fontSize: 10.5, fontWeight: 600, color: T.muted, letterSpacing: "0.07em",
              textTransform: "uppercase", cursor: ["Price","24h %","Market Cap"].includes(lbl) ? "pointer" : "default",
              display: "flex", alignItems: "center", gap: 2,
              justifyContent: i >= 2 ? "flex-end" : i === 5 ? "center" : "flex-start",
            }}>
            {lbl}
            {(lbl === "Price" && sortBy === "price") && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
            {(lbl === "24h %" && sortBy === "change") && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
            {(lbl === "Market Cap" && sortBy === "cap") && <span style={{ fontSize: 8 }}>{sortDir === "desc" ? "▼" : "▲"}</span>}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 390, overflowY: "auto" }}>
        {rows.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: T.muted, fontSize: 13 }}>
            {tab === "favorites"
              ? <><span>Add assets to your watchlist. </span><Link href="/markets" style={{ color: T.blue, textDecoration: "none" }}>Browse markets →</Link></>
              : tab === "futures" ? "Futures trading coming soon" : "No assets found"}
          </div>
        ) : rows.map((a, idx) => {
          const pos = a.changePercent24h >= 0;
          return (
            <div key={a.symbol}
              onClick={() => navigate(`/assets/${a.symbol}`)}
              style={{ display: "grid", gridTemplateColumns: COL, padding: "8px 14px", borderBottom: `1px solid ${T.bord}`, gap: 8, alignItems: "center", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.022)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 11.5, color: T.muted }}>{idx + 1}</span>

              <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                {a.logoUrl
                  ? <img src={a.logoUrl} alt="" style={{ width: 27, height: 27, borderRadius: "50%", objectFit: "contain", flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <div style={{ width: 27, height: 27, borderRadius: "50%", border: `1px solid ${T.bord}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: T.muted, flexShrink: 0 }}>{a.symbol.slice(0, 2)}</div>}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: T.text, margin: 0 }}>{a.symbol}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                </div>
              </div>

              <div style={{ textAlign: "right", fontSize: 13.5, fontWeight: 600, color: T.text }}>{fmtPrice(a.currentPrice)}</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                {pos ? <TrendingUp size={11} style={{ color: T.gain }} strokeWidth={2.5} /> : <TrendingDown size={11} style={{ color: T.loss }} strokeWidth={2.5} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: pos ? T.gain : T.loss }}>{pos ? "+" : ""}{fmt2(a.changePercent24h)}%</span>
              </div>

              <div style={{ textAlign: "right", fontSize: 12, color: T.muted }}>{fmtCompact(a.marketCap ?? 0)}</div>

              <div style={{ display: "flex", justifyContent: "center" }}><SparkBar pct={a.changePercent24h} /></div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href={`/assets/${a.symbol}`} onClick={e => e.stopPropagation()} style={{
                  padding: "5px 10px", borderRadius: 6,
                  border: `1px solid rgba(59,130,246,0.28)`,
                  color: T.blue, fontSize: 11.5, fontWeight: 600, textDecoration: "none",
                }}>Trade</Link>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${T.bord}` }}>
        <Link href="/markets" style={{ fontSize: 12.5, color: T.blue, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          View all markets <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  );
}

// ── Portfolio Panel ───────────────────────────────────────────────────────────
function PortfolioPanel() {
  const { data: holdings, isLoading: hLoad } = useGetHoldings();
  const { data: txRaw,    isLoading: tLoad } = useGetTransactions();

  const holdList = (holdings as any[] ?? []);
  const rawArr = txRaw as any;
  const txList = (Array.isArray(rawArr) ? rawArr : rawArr?.transactions ?? []).slice(0, 5);

  const TX_LABEL: Record<string, string> = {
    buy: "BUY", sell: "SELL", deposit: "DEPOSIT", withdraw: "WITHDRAW",
    bank_transfer: "BANK", crypto_deposit: "CRYPTO IN",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Holdings */}
      <div style={{ background: T.card, border: `1px solid ${T.bord}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.bord}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: T.text, margin: 0 }}>My Holdings</h3>
          <Link href="/profile" style={{ fontSize: 12, color: T.blue, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>All <ChevronRight size={12} /></Link>
        </div>
        {hLoad ? (
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}><Loader2 size={18} style={{ color: T.muted }} className="animate-spin" /></div>
        ) : holdList.length === 0 ? (
          <div style={{ padding: "18px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>No positions yet</p>
            <Link href="/markets" style={{ fontSize: 12.5, color: T.blue, textDecoration: "none", fontWeight: 600 }}>Start trading →</Link>
          </div>
        ) : holdList.slice(0, 7).map((h: any) => {
          const price = h.currentPrice ?? h.avgCost ?? 0;
          const value = (h.quantity ?? 0) * price;
          const pnl   = value - (h.quantity ?? 0) * (h.avgCost ?? 0);
          const pos   = pnl >= 0;
          return (
            <div key={h.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: `1px solid ${T.bord}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {h.logoUrl
                  ? <img src={h.logoUrl} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <div style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${T.bord}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: T.muted }}>{(h.symbol ?? "").slice(0, 2)}</div>}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{h.symbol}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{fmt2(h.quantity ?? 0)} units</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: 0 }}>{fmtUSD(value)}</p>
                <p style={{ fontSize: 11, color: pos ? T.gain : T.loss, margin: 0 }}>{pos ? "+" : ""}{fmtUSD(pnl)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div style={{ background: T.card, border: `1px solid ${T.bord}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.bord}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: T.text, margin: 0 }}>Recent Activity</h3>
          <Link href="/wallet" style={{ fontSize: 12, color: T.blue, textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>All <ChevronRight size={12} /></Link>
        </div>
        {tLoad ? (
          <div style={{ padding: 24, display: "flex", justifyContent: "center" }}><Loader2 size={18} style={{ color: T.muted }} className="animate-spin" /></div>
        ) : txList.length === 0 ? (
          <div style={{ padding: "18px 16px", textAlign: "center", color: T.muted, fontSize: 13 }}>No transactions yet</div>
        ) : txList.map((tx: any, i: number) => {
          const type = tx.type ?? "";
          const isCredit = ["buy","deposit","bank_transfer","crypto_deposit"].includes(type);
          const label = TX_LABEL[type] ?? type.toUpperCase();
          const amount = tx.total ?? tx.amount ?? 0;
          return (
            <div key={tx.id ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", borderBottom: `1px solid ${T.bord}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.bord}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={13} style={{ color: T.muted }} strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: T.text, margin: 0 }}>
                    {tx.symbol ?? (type === "deposit" || type === "bank_transfer" ? "Deposit" : type === "withdraw" ? "Withdraw" : label)}
                  </p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{tx.createdAt ? timeAgo(tx.createdAt) : ""}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: isCredit ? T.gain : T.loss, margin: 0 }}>{isCredit ? "+" : "-"}{fmtUSD(amount)}</p>
                <p style={{ fontSize: 10, color: T.muted, margin: 0, letterSpacing: "0.07em" }}>{label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── News Section ──────────────────────────────────────────────────────────────
const NEWS_CATS = ["All", "Crypto", "Stocks", "Macro", "Commodities", "ETF"];

function NewsSection() {
  const [cat, setCat] = useState("All");
  const { data: rawNews, isLoading } = useGetMarketNews();
  const allNews = (rawNews as any[] ?? []);
  const shown = cat === "All" ? allNews : allNews.filter((n: any) => (n.category ?? "").toLowerCase() === cat.toLowerCase());

  return (
    <div style={{ background: T.card, border: `1px solid ${T.bord}`, borderRadius: 16, overflow: "hidden", marginTop: 20 }}>
      <div style={{ padding: "0 14px", borderBottom: `1px solid ${T.bord}`, display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, flexShrink: 0, padding: "13px 14px 13px 0", borderRight: `1px solid ${T.bord}`, marginRight: 4 }}>
          Market News
        </span>
        {NEWS_CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: "13px 10px", background: "none", border: "none", cursor: "pointer",
            fontSize: 12.5, fontWeight: cat === c ? 600 : 400,
            color: cat === c ? T.text : T.muted,
            borderBottom: cat === c ? `2px solid ${T.blue}` : "2px solid transparent",
            marginBottom: -1, whiteSpace: "nowrap",
          }}>{c}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ padding: 32, display: "flex", justifyContent: "center" }}><Loader2 size={20} style={{ color: T.muted }} className="animate-spin" /></div>
      ) : shown.length === 0 ? (
        <div style={{ padding: "28px", textAlign: "center", color: T.muted, fontSize: 13 }}>No news in this category</div>
      ) : (
        <div className="news-grid">
          {shown.slice(0, 6).map((a: any) => (
            <a key={a.id} href={a.url ?? "#"} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", flexDirection: "column", padding: 20, textDecoration: "none", borderRight: `1px solid ${T.bord}`, borderBottom: `1px solid ${T.bord}` }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: "100%", height: 118, objectFit: "cover", borderRadius: 8, marginBottom: 12 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                {a.category && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.blue, textTransform: "uppercase" }}>{a.category}</span>}
                <span style={{ fontSize: 11, color: T.muted }}>{a.publishedAt ? timeAgo(a.publishedAt) : ""}</span>
              </div>
              <h4 style={{ fontSize: 13.5, fontWeight: 600, color: T.text, margin: "0 0 6px", lineHeight: 1.45 }}>{a.title}</h4>
              {a.summary && <p style={{ fontSize: 12, color: T.muted, margin: "0 0 10px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.summary}</p>}
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, color: T.muted }}>{a.source}</span>
                <ExternalLink size={10} style={{ color: T.muted }} />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <>
      <style>{`
        .dash-grid  { display: grid; grid-template-columns: 1fr 330px; gap: 20px; }
        .news-grid  { display: grid; grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 1080px) { .dash-grid { grid-template-columns: 1fr; } .news-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px)  { .news-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ paddingBottom: 48 }}>
        <PortfolioHero />
        <div className="dash-grid">
          <MarketOverview />
          <PortfolioPanel />
        </div>
        <NewsSection />
      </div>
    </>
  );
}
