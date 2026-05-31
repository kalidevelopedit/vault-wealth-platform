import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Loader2, Search, Star,
  Newspaper, ExternalLink, ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";

const TABS = [
  { id: "crypto",    label: "Crypto",      newsCategories: ["crypto", "bitcoin", "ethereum", "blockchain", "defi", "web3"] },
  { id: "stock",     label: "Stocks",      newsCategories: ["stocks", "equities", "markets", "earnings", "tech", "finance"] },
  { id: "commodity", label: "Commodities", newsCategories: ["commodities", "gold", "oil", "silver", "metals", "energy"] },
];

type NewsItem = {
  id: number;
  title: string;
  summary?: string | null;
  source: string;
  url?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  publishedAt: string;
};

const FALLBACK_NEWS: Record<string, NewsItem[]> = {
  crypto: [
    { id: 1, title: "Bitcoin consolidates above $107K as institutional demand grows", summary: "Major asset managers continue accumulating BTC positions as macro uncertainty persists.", source: "CryptoDesk", url: "#", category: "crypto", publishedAt: new Date().toISOString() },
    { id: 2, title: "Ethereum upgrade set to reduce gas fees by up to 80%", summary: "The upcoming network upgrade promises significant improvements to transaction throughput.", source: "ETH Daily", url: "#", category: "crypto", publishedAt: new Date().toISOString() },
    { id: 3, title: "DeFi TVL recovers to $92B on renewed market confidence", summary: "Total value locked in decentralized protocols rebounds as risk appetite returns.", source: "DeFi Pulse", url: "#", category: "crypto", publishedAt: new Date().toISOString() },
  ],
  stock: [
    { id: 4, title: "NVDA surges 4.2% after record AI chip revenue beat expectations", summary: "Nvidia's data center division posts record quarterly earnings on surging AI compute demand.", source: "MarketWatch", url: "#", category: "stocks", publishedAt: new Date().toISOString() },
    { id: 5, title: "S&P 500 closes at all-time high for third consecutive week", summary: "Strong earnings season fuels continued equity market momentum.", source: "Reuters", url: "#", category: "stocks", publishedAt: new Date().toISOString() },
    { id: 6, title: "Apple unveils next-gen AI features driving App Store revenue surge", summary: "Services revenue continues to outpace hardware in Apple's evolving business mix.", source: "Bloomberg", url: "#", category: "stocks", publishedAt: new Date().toISOString() },
  ],
  commodity: [
    { id: 7, title: "Gold hits 6-month high at $3,320/oz amid geopolitical tensions", summary: "Safe-haven demand drives precious metals to multi-month highs.", source: "Commodities Today", url: "#", category: "commodities", publishedAt: new Date().toISOString() },
    { id: 8, title: "WTI crude inventory builds stall as OPEC+ maintains supply discipline", summary: "Oil markets tighten as Asian demand recovery outpaces expectations.", source: "Energy Wire", url: "#", category: "commodities", publishedAt: new Date().toISOString() },
    { id: 9, title: "Silver outperforms gold on surging solar panel demand", summary: "Industrial silver consumption from the clean energy sector hits record highs.", source: "Metals Daily", url: "#", category: "commodities", publishedAt: new Date().toISOString() },
  ],
};

function newsMatchesTab(news: NewsItem, tabId: string, cats: string[]): boolean {
  const cat = (news.category ?? "").toLowerCase();
  const title = news.title.toLowerCase();
  return cats.some(c => cat.includes(c) || title.includes(c));
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 2) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function NewsCarousel({ tabId, cats, colors }: { tabId: string; cats: string[]; colors: any }) {
  const [allNews, setAllNews]   = useState<NewsItem[]>([]);
  const [news,    setNews]      = useState<NewsItem[]>([]);
  const [idx,     setIdx]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const applyFilter = (all: NewsItem[], tId: string, tCats: string[]) => {
    const filtered = all.filter(n => newsMatchesTab(n, tId, tCats));
    return filtered.length > 0 ? filtered : all.slice(0, 6);
  };

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/market/news?limit=60");
      const data = await res.json();
      const all: NewsItem[] = Array.isArray(data) ? data : [];
      setAllNews(all);
      setNews(all.length > 0 ? applyFilter(all, tabId, cats) : FALLBACK_NEWS[tabId] ?? []);
    } catch {
      setNews(FALLBACK_NEWS[tabId] ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchNews();
    const ri = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(ri);
  }, []);

  useEffect(() => {
    if (allNews.length > 0) {
      setNews(applyFilter(allNews, tabId, cats));
    } else {
      setNews(FALLBACK_NEWS[tabId] ?? []);
    }
    setIdx(0);
  }, [tabId]);

  useEffect(() => {
    if (news.length === 0) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % news.length), 6000);
    return () => clearInterval(intervalRef.current);
  }, [news.length]);

  const go = (dir: 1 | -1) => {
    clearInterval(intervalRef.current);
    setIdx(i => (i + dir + news.length) % news.length);
  };

  if (loading) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <Loader2 style={{ width: 16, height: 16, color: colors.muted, animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 13, color: colors.muted }}>Loading market news…</span>
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
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Latest News</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, boxShadow: `0 0 6px ${colors.green}` }} />
            <span style={{ fontSize: 10, color: colors.muted, fontWeight: 500 }}>Live</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={fetchNews} title="Refresh" style={{ background: "none", border: "none", cursor: "pointer", color: colors.muted, display: "flex", padding: 4 }}>
            <RefreshCw style={{ width: 12, height: 12 }} strokeWidth={2} />
          </button>
          <span style={{ fontSize: 11, color: colors.muted }}>{idx + 1}/{news.length}</span>
        </div>
      </div>

      {/* Card */}
      <div style={{ padding: "20px 20px 16px", minHeight: 130 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {current.imageUrl && (
            <img src={current.imageUrl} alt=""
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              style={{ width: 68, height: 68, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1px solid ${colors.bord}` }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, lineHeight: 1.45, marginBottom: 8 }}>
              {current.title}
            </div>
            {current.summary && (
              <div style={{
                fontSize: 12, color: colors.muted, lineHeight: 1.5, marginBottom: 10,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {current.summary}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: colors.muted }}>
                <span style={{ fontWeight: 600, color: colors.blue }}>{current.source}</span>
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

export default function AssetList() {
  const [activeTab, setActiveTab] = useState("crypto");
  const [search, setSearch] = useState("");
  const { colors } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg } = colors;

  const activeTabDef = TABS.find(t => t.id === activeTab) ?? TABS[0];

  const { data: assets, isLoading } = useListAssets(
    { type: activeTab as any },
    { query: { refetchInterval: 30_000 } as any }
  );

  const displayed = assets?.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const fmtPrice = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: p >= 1 ? 2 : 4, maximumFractionDigits: p >= 1 ? 2 : 6 });

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>Markets</h1>
      </div>

      {/* Tabs + Search row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${BORD}`, marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === t.id ? 600 : 500,
              color: activeTab === t.id ? TEXT : MUTED,
              borderBottom: activeTab === t.id ? `2px solid ${BLUE}` : "2px solid transparent",
              paddingBottom: 12, transition: "all 0.12s", padding: "0 0 12px",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{
          height: 36, background: inputBg, borderRadius: 999, border: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", padding: "0 12px", gap: 8, marginBottom: 8, minWidth: 200,
        }}>
          <Search style={{ width: 13, height: 13, color: MUTED }} strokeWidth={1.5} />
          <input type="text" placeholder="Search assets" value={search} onChange={e => setSearch(e.target.value)} style={{
            background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, width: "100%",
          }} />
        </div>
      </div>

      {/* Mobile list (< md) */}
      <div className="md:hidden" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {isLoading ? (
          <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
            <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : displayed?.map(a => {
          const pos = a.changePercent24h >= 0;
          return (
            <Link key={a.symbol} href={`/assets/${a.symbol}`} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 4px", borderBottom: `1px solid ${BORD}`, textDecoration: "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AssetIcon symbol={a.symbol} size={36} borderRadius="50%" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{a.symbol}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{a.name}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>${fmtPrice(a.currentPrice)}</div>
                <div style={{ fontSize: 12, color: pos ? GREEN : RED, fontFamily: "monospace" }}>{pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Desktop table (>= md) */}
      <div className="hidden md:block" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORD}` }}>
              <th style={{ padding: "14px 8px", width: 36 }}></th>
              {["Asset", "Price", "24h Change", "24h High", "24h Low", "Volume", ""].map((h, i) => (
                <th key={i} style={{
                  padding: "14px 16px", textAlign: i === 0 ? "left" : "right",
                  fontSize: 12, fontWeight: 500, color: MUTED, whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ padding: 60, textAlign: "center" }}>
                <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </td></tr>
            ) : displayed?.length ? displayed.map(a => {
              const pos = a.changePercent24h >= 0;
              return (
                <tr key={a.symbol} style={{ borderBottom: `1px solid ${BORD}`, transition: "background 0.1s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = inputBg}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 8px", textAlign: "center" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                      <Star style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <AssetIcon symbol={a.symbol} size={28} borderRadius="50%" />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{a.symbol}</div>
                        <div style={{ fontSize: 12, color: MUTED }}>{a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>
                    {pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, color: MUTED, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice * 1.02)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, color: MUTED, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice * 0.98)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 13, color: MUTED, fontFamily: "monospace" }}>
                    {a.marketCap ? `$${(a.marketCap / 1e6).toFixed(1)}M` : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <Link href={`/assets/${a.symbol}`} style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      height: 30, padding: "0 14px", borderRadius: 999, border: `1px solid ${BORD}`,
                      color: TEXT, fontSize: 12, fontWeight: 600, textDecoration: "none", background: "transparent",
                    }}>Trade</Link>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ padding: 60, textAlign: "center", color: MUTED, fontSize: 14 }}>No assets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Latest News Carousel ────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <NewsCarousel
          key={activeTab}
          tabId={activeTab}
          cats={activeTabDef.newsCategories}
          colors={colors}
        />
      </div>
    </div>
  );
}
