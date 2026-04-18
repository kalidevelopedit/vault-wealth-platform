import { useState } from "react";
import { useListAssets, useSearchAssets } from "@workspace/api-client-react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { AssetIcon } from "@/components/AssetIcon";

const ASSET_TYPES = [
  { key: "all", label: "All" },
  { key: "crypto", label: "Crypto" },
  { key: "stock", label: "Equities" },
  { key: "commodity", label: "Commodities" },
];

const CARD = "bg-white rounded-2xl border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

export default function Invest() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: assets, isLoading } = useListAssets(filter !== "all" ? { type: filter } : undefined);
  const { data: searchResults, isLoading: sl } = useSearchAssets(
    { q: search, ...(filter !== "all" ? { type: filter } : {}) },
    { query: { enabled: search.length > 1 } }
  );

  const displayed = search.length > 1 ? searchResults : assets;
  const loading = search.length > 1 ? sl : isLoading;

  const fmtPrice = (p: number) => p >= 1000
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">Markets</div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Trade Instruments</h1>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Pill filter toggle */}
        <div className="flex gap-1 bg-[#F2F3F5] p-1 rounded-full shrink-0">
          {ASSET_TYPES.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 text-[10px] font-medium rounded-full transition-all
                ${filter === key
                  ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                  : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            className="w-full h-10 bg-white border border-[#E6E8EB] rounded-xl pl-10 pr-4 text-[13px] focus:outline-none focus:border-[#0d1520] transition-colors placeholder:text-muted-foreground"
            placeholder="Search instruments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 1 && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E8EB] z-50 shadow-[0_4px_10px_rgba(16,24,40,0.08)] rounded-2xl max-h-64 overflow-y-auto">
              {sl ? (
                <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
              ) : searchResults.length ? (
                searchResults.map((a) => (
                  <Link key={a.symbol} href={`/assets/${a.symbol}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#F5F6F7] transition-colors border-b last:border-0 border-[#E6E8EB]">
                    <div className="flex items-center gap-3">
                      <AssetIcon symbol={a.symbol} size={28} borderRadius={8} />
                      <div>
                        <div className="text-[12px] font-semibold text-foreground">{a.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{a.symbol} · <span className="capitalize">{a.assetType}</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-semibold font-mono">${fmtPrice(a.currentPrice)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-[12px] text-muted-foreground">No results for "{search}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Asset table */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6E8EB] bg-[#F5F6F7]">
                {["Instrument", "Type", "Last Price", "24h Change", "Market Cap", "Action"].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground
                    ${i === 0 ? "text-left pl-5" : i === 5 ? "text-right pr-5" : i >= 2 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB]">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></td></tr>
              ) : displayed?.map((a) => {
                const pos = a.changePercent24h >= 0;
                return (
                  <tr key={a.symbol} className="hover:bg-[#F5F6F7] transition-colors cursor-pointer">
                    <td className="py-3.5 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <AssetIcon symbol={a.symbol} size={32} borderRadius={10} />
                        <div>
                          <div className="font-semibold text-foreground text-[12px]">{a.name}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">{a.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground bg-[#F2F3F5] rounded-full px-2 py-0.5 capitalize">
                        {a.assetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground text-[12px]">
                      ${fmtPrice(a.currentPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[12px]" style={{ color: pos ? "#2b6b4e" : "#943636" }}>
                      {pos ? "+" : ""}{a.changePercent24h?.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[11px]">
                      {a.marketCap ? `$${(a.marketCap / 1e9).toFixed(1)}B` : "—"}
                    </td>
                    <td className="py-3.5 pl-4 pr-5 text-right">
                      <Link href={`/assets/${a.symbol}`}
                        className="inline-flex items-center gap-1 border border-[#E6E8EB] text-[10px] font-semibold uppercase tracking-wider rounded-xl px-3 py-1.5 hover:bg-[#0d1520] hover:text-white hover:border-[#0d1520] transition-all">
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!loading && !displayed?.length && (
                <tr><td colSpan={6} className="py-10 text-center text-[12px] text-muted-foreground">No instruments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
