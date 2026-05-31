import { useState } from "react";
import { useListAssets, useSearchAssets } from "@workspace/api-client-react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { AssetIcon } from "@/components/AssetIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";

const ASSET_TYPES = [
  { key: "all", label: "All" },
  { key: "crypto", label: "Crypto" },
  { key: "stock", label: "Equities" },
  { key: "commodity", label: "Commodities" },
];

export default function Invest() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { colors, mode } = useTheme();
  const isMobile = useIsMobile();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, inputBg, green: GREEN, red: RED, blue: BLUE } = colors;

  const { data: assets, isLoading } = useListAssets(filter !== "all" ? { type: filter as any } : undefined, { query: {} as any });
  const { data: searchResults, isLoading: sl } = useSearchAssets(
    { q: search, ...(filter !== "all" ? { type: filter as any } : {}) },
    { query: { enabled: search.length > 1 } as any }
  );

  const displayed = search.length > 1 ? searchResults : assets;
  const loading = search.length > 1 ? sl : isLoading;

  const fmtPrice = (p: number) => p.toLocaleString("en-US", {
    minimumFractionDigits: p >= 1 ? 2 : 4,
    maximumFractionDigits: p >= 1 ? 2 : 6,
  });

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: TEXT, marginBottom: isMobile ? 16 : 32 }}>Trade</h1>

      {/* Filters + Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center" }}>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2, flexShrink: 0 }}>
          {ASSET_TYPES.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              background: filter === key ? (mode === "dark" ? "#191F28" : colors.active) : "transparent",
              color: filter === key ? TEXT : MUTED,
              border: "none", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.1s", whiteSpace: "nowrap",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{
          height: 40, background: inputBg, borderRadius: 999, border: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", padding: "0 14px", gap: 8,
          width: isMobile ? "100%" : 280,
        }}>
          <Search style={{ width: 15, height: 15, color: MUTED, flexShrink: 0 }} strokeWidth={1.5} />
          <input
            style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, width: "100%" }}
            placeholder="Search instruments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Asset List */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : !displayed?.length ? (
          <div style={{ padding: 48, textAlign: "center", color: MUTED, fontSize: 14 }}>No instruments found.</div>
        ) : isMobile ? (
          /* ── Mobile: Card List ── */
          <div>
            {displayed.map((a, i) => {
              const pos = a.changePercent24h >= 0;
              return (
                <div key={a.symbol} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 14px",
                  borderBottom: i < displayed.length - 1 ? `1px solid ${BORD}` : "none",
                }}>
                  <AssetIcon symbol={a.symbol} size={36} borderRadius="50%" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>{a.symbol}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>${fmtPrice(a.currentPrice)}</div>
                    <div style={{ fontSize: 11, color: pos ? GREEN : RED, fontFamily: "monospace", marginTop: 1 }}>{pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%</div>
                  </div>
                  <Link href={`/assets/${a.symbol}`} style={{
                    height: 32, padding: "0 12px", borderRadius: 999,
                    border: `1px solid ${BORD}`, color: TEXT,
                    fontSize: 12, fontWeight: 600, textDecoration: "none",
                    display: "flex", alignItems: "center", flexShrink: 0,
                  }}>Trade</Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Desktop: Table ── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                  {["Instrument", "Type", "Last Price", "24h Change", "Action"].map((h, i) => (
                    <th key={h} style={{
                      padding: "16px 24px", textAlign: i === 0 ? "left" : i === 4 ? "right" : "right",
                      fontSize: 13, fontWeight: 500, color: MUTED, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map(a => {
                  const pos = a.changePercent24h >= 0;
                  return (
                    <tr key={a.symbol} style={{ borderBottom: `1px solid ${BORD}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = colors.hover)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <AssetIcon symbol={a.symbol} size={32} borderRadius="50%" />
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{a.symbol}</div>
                            <div style={{ fontSize: 13, color: MUTED }}>{a.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: MUTED,
                          background: mode === "dark" ? "#191F28" : colors.active,
                          padding: "4px 8px", borderRadius: 4, textTransform: "capitalize",
                        }}>
                          {a.assetType}
                        </span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 15, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>
                        ${fmtPrice(a.currentPrice)}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 15, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>
                        {pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <Link href={`/assets/${a.symbol}`} style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          height: 36, padding: "0 20px", borderRadius: 999,
                          border: `1px solid ${BORD}`, color: TEXT,
                          fontSize: 13, fontWeight: 600, textDecoration: "none", background: "transparent",
                        }}>Trade</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
