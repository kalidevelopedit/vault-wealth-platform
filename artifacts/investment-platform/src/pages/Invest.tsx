import { useState } from "react";
import { useListAssets, useSearchAssets } from "@workspace/api-client-react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { AssetIcon } from "@/components/AssetIcon";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, inputBg, green: GREEN, red: RED, blue: BLUE } = colors;

  const { data: assets, isLoading } = useListAssets(filter !== "all" ? { type: filter as any } : undefined);
  const { data: searchResults, isLoading: sl } = useSearchAssets(
    { q: search, ...(filter !== "all" ? { type: filter as any } : {}) },
    { query: { enabled: search.length > 1 } }
  );

  const displayed = search.length > 1 ? searchResults : assets;
  const loading = search.length > 1 ? sl : isLoading;

  const fmtPrice = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: p >= 1 ? 2 : 4, maximumFractionDigits: p >= 1 ? 2 : 6 });

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Trade</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {ASSET_TYPES.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              background: filter === key ? (mode === "dark" ? "#191F28" : colors.active) : "transparent",
              color: filter === key ? TEXT : MUTED,
              border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer",
              transition: "all 0.1s"
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{
          height: 40, background: inputBg, borderRadius: 999, border: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 8, width: "100%", maxWidth: 320
        }}>
          <Search style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
          <input
            style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, width: "100%" }}
            placeholder="Search instruments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" } as any}>
          <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                {["Instrument", "Type", "Last Price", "24h Change", "Action"].map((h, i) => (
                  <th key={h} style={{ padding: "16px 24px", textAlign: i === 0 ? "left" : i === 4 ? "right" : "right", fontSize: 13, fontWeight: 500, color: MUTED, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 60, textAlign: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} /></td></tr>
              ) : displayed?.length ? displayed.map(a => {
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
                      <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, background: mode === "dark" ? "#191F28" : colors.active, padding: "4px 8px", borderRadius: 4, textTransform: "capitalize" }}>
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
                        height: 36, padding: "0 20px", borderRadius: 999, border: `1px solid ${BORD}`,
                        color: TEXT, fontSize: 13, fontWeight: 600, textDecoration: "none", background: "transparent",
                        transition: "all 0.15s"
                      }}>Trade</Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} style={{ padding: 60, textAlign: "center", color: MUTED, fontSize: 14 }}>No instruments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
