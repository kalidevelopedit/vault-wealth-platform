import { useState } from "react";
import { Link } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { Loader2, Search, Star } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const GREEN = "#16a34a";
const RED = "#dc2626";

const TABS = [
  { id: "favorites", label: "Favorites" },
  { id: "crypto", label: "Crypto" },
  { id: "stock", label: "Stocks" },
  { id: "commodity", label: "Commodities" },
];

export default function AssetList() {
  const [activeTab, setActiveTab] = useState("crypto");
  const [search, setSearch] = useState("");

  const { data: assets, isLoading } = useListAssets(
    activeTab !== "favorites" ? { type: activeTab as any } : undefined,
    { query: { refetchInterval: 30_000 } }
  );

  // In a real app, favorites would come from useGetWatchlist
  const displayed = assets?.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase()));

  const fmtPrice = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: p >= 1 ? 2 : 4, maximumFractionDigits: p >= 1 ? 2 : 6 });

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Markets</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${BORD}`, marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 32 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 15, fontWeight: activeTab === t.id ? 600 : 500,
              color: activeTab === t.id ? TEXT : MUTED,
              borderBottom: activeTab === t.id ? `2px solid ${TEXT}` : "2px solid transparent",
              paddingBottom: 12, transition: "all 0.1s"
            }}>
              {t.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div style={{
          height: 36, background: "#11141A", borderRadius: 999, border: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", padding: "0 12px", gap: 8, marginBottom: 8, width: 240
        }}>
          <Search style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />
          <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{
            background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, width: "100%"
          }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["All", "Gainers", "Losers", "New"].map(c => (
          <button key={c} style={{
            background: c === "All" ? "#191F28" : "transparent",
            color: c === "All" ? TEXT : MUTED,
            border: "none", borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer"
          }}>
            {c}
          </button>
        ))}
      </div>

      {/* Market Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORD}` }}>
              <th style={{ padding: "16px 8px", width: 40 }}></th>
              {["Asset", "Price", "24h Change", "24h High", "24h Low", "Volume", "Action"].map((h, i) => (
                <th key={h} style={{ padding: "16px", textAlign: i === 0 ? "left" : i === 6 ? "right" : "right", fontSize: 12, fontWeight: 500, color: MUTED, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} style={{ padding: 60, textAlign: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} /></td></tr>
            ) : displayed?.length ? displayed.map(a => {
              const pos = a.changePercent24h >= 0;
              return (
                <tr key={a.symbol} style={{ borderBottom: `1px solid ${BORD}` }} className="hover:bg-[#11141A] transition-colors">
                  <td style={{ padding: "16px 8px", textAlign: "center" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Star style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
                    </button>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <AssetIcon symbol={a.symbol} size={28} borderRadius="50%" />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{a.symbol}</div>
                        <div style={{ fontSize: 12, color: MUTED }}>{a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice)}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: 14, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>
                    {pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: 13, color: TEXT, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice * 1.02)} {/* mock high */}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: 13, color: TEXT, fontFamily: "monospace" }}>
                    ${fmtPrice(a.currentPrice * 0.98)} {/* mock low */}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right", fontSize: 13, color: TEXT, fontFamily: "monospace" }}>
                    {a.marketCap ? `$${(a.marketCap / 1e6).toFixed(1)}M` : "—"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <Link href={`/assets/${a.symbol}`} style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      height: 32, padding: "0 16px", borderRadius: 999, border: `1px solid ${BORD}`,
                      color: TEXT, fontSize: 12, fontWeight: 600, textDecoration: "none", background: "transparent"
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
    </div>
  );
}
