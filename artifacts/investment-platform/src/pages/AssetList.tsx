import { useRoute, Link } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { Loader2, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

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

export default function AssetList() {
  const [match, params] = useRoute("/assets/:type");
  const type = params?.type || "crypto";
  const apiType = API_TYPE_MAP[type] || type;

  const { data: assets, isLoading } = useListAssets({ type: apiType });

  const fmtPrice = (p: number) => p >= 1
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-border">
        <Link href="/invest" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Markets</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{TYPE_MAP[type] || "Assets"}</h1>
        </div>
        <div className="ml-auto flex gap-0 border border-border">
          {Object.entries(TYPE_MAP).map(([key, label]) => (
            <Link key={key} href={`/assets/${key}`}
              className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-wide border-r last:border-0 border-border transition-colors
                ${type === key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-2.5 pl-5 pr-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">#</th>
                <th className="text-left py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Instrument</th>
                <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Last Price</th>
                <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">24h Change</th>
                <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">24h Abs.</th>
                <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Market Cap</th>
                <th className="text-right py-2.5 pr-5 pl-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" /></td></tr>
              ) : assets?.map((a, idx) => {
                const pos = a.changePercent24h >= 0;
                return (
                  <tr key={a.symbol} className="hover:bg-muted/20 transition-colors cursor-pointer group">
                    <td className="py-3.5 pl-5 pr-4 text-muted-foreground font-mono text-[10px]">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#0a1628] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {a.symbol.substring(0, 2)}
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
                    <td className={`py-3.5 px-4 text-right font-mono font-semibold ${pos ? "text-emerald-700" : "text-red-700"}`}>
                      <div className="flex items-center justify-end gap-1">
                        {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos ? "+" : ""}{a.changePercent24h?.toFixed(2)}%
                      </div>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono text-[10px] ${pos ? "text-emerald-700" : "text-red-700"}`}>
                      {pos ? "+" : ""}${Math.abs(a.change24h).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[10px]">
                      {a.marketCap ? `$${(a.marketCap / 1e9).toFixed(1)}B` : "—"}
                    </td>
                    <td className="py-3.5 pl-4 pr-5 text-right">
                      <Link href={`/assets/${a.symbol}`}
                        className="text-[9px] font-bold uppercase tracking-wide border border-border px-3 py-1 hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] transition-colors">
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
