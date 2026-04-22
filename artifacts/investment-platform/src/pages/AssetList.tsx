import { useState } from "react";
import { Link } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, Search, Star } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";

const TABS = [
  { id: "crypto", label: "Crypto" },
  { id: "stock", label: "Stocks" },
  { id: "commodity", label: "Commodities" },
];

export default function AssetList() {
  const [activeTab, setActiveTab] = useState("crypto");
  const [search, setSearch] = useState("");
  const { colors } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg, active: ACTIVE } = colors;

  const { data: assets, isLoading } = useListAssets(
    { type: activeTab as any },
    { query: { refetchInterval: 30_000 } }
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
    </div>
  );
}
