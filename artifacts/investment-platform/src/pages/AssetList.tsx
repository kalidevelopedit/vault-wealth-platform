import { useRoute, Link } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { Loader2, ArrowLeft } from "lucide-react";

const TYPE_MAP: Record<string, string> = {
  crypto: "Digital Assets",
  stocks: "Equities",
  commodities: "Commodities",
};

const API_TYPE_MAP: Record<string, string> = {
  crypto: "crypto",
  stocks: "stock",
  commodities: "commodity",
};

const CARD = "bg-white rounded-2xl border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

export default function AssetList() {
  const [match, params] = useRoute("/assets/:type");
  const type = params?.type || "crypto";
  const apiType = API_TYPE_MAP[type] || type;

  const { data: assets, isLoading } = useListAssets({ type: apiType });

  const fmtPrice = (p: number) => p >= 1
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <Link href="/invest" className="w-8 h-8 rounded-full bg-white border border-[#E6E8EB] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Markets</div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{TYPE_MAP[type] || "Assets"}</h1>
        </div>
        {/* Pill type toggle */}
        <div className="ml-auto flex gap-1 bg-[#F2F3F5] p-1 rounded-full">
          {Object.entries(TYPE_MAP).map(([key, label]) => (
            <Link key={key} href={`/assets/${key}`}
              className={`px-4 py-1.5 text-[10px] font-medium rounded-full transition-all
                ${type === key
                  ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                  : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6E8EB] bg-[#F5F6F7]">
                <th className="text-left py-3 pl-5 pr-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Instrument</th>
                <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Last Price</th>
                <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">24h Change</th>
                <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">24h Abs.</th>
                <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Market Cap</th>
                <th className="text-right py-3 pr-5 pl-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8EB]">
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></td></tr>
              ) : assets?.map((a, idx) => {
                const pos = a.changePercent24h >= 0;
                return (
                  <tr key={a.symbol} className="hover:bg-[#F5F6F7] transition-colors cursor-pointer group">
                    <td className="py-3.5 pl-5 pr-4 text-muted-foreground font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F2F3F5] flex items-center justify-center text-foreground text-[9px] font-bold shrink-0">
                          {a.symbol.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{a.name}</div>
                          <div className="text-muted-foreground font-mono text-[10px]">{a.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground">
                      ${fmtPrice(a.currentPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[12px]" style={{ color: pos ? "#2b6b4e" : "#943636" }}>
                      {pos ? "+" : ""}{a.changePercent24h?.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[11px]" style={{ color: pos ? "#2b6b4e" : "#943636" }}>
                      {pos ? "+" : ""}${Math.abs(a.change24h).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[10px]">
                      {a.marketCap ? `$${(a.marketCap / 1e9).toFixed(1)}B` : "—"}
                    </td>
                    <td className="py-3.5 pl-4 pr-5 text-right">
                      <Link href={`/assets/${a.symbol}`}
                        className="text-[10px] font-semibold uppercase tracking-wider border border-[#E6E8EB] rounded-xl px-3 py-1.5 hover:bg-[#0d1520] hover:text-white hover:border-[#0d1520] transition-all">
                        Trade
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
