import { useRoute, Link } from "wouter";
import { useGetAssetDetail, useGetAssetChart, useCreateTransaction } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AssetDetail() {
  const [_, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol || "";

  const [period, setPeriod] = useState<"1d" | "1w" | "1m" | "1y" | "all">("1m");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: asset, isLoading } = useGetAssetDetail(symbol, { query: { enabled: !!symbol } });
  const { data: chart, isLoading: chartLoading } = useGetAssetChart(symbol, { period }, { query: { enabled: !!symbol } });
  const createTx = useCreateTransaction();

  if (isLoading) return (
    <div className="p-12 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!asset) return <div className="p-12 text-center text-muted-foreground">Asset not found</div>;

  const pos = asset.changePercent24h >= 0;
  const fmtP = (p: number) => p >= 1
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: side, symbol: asset.symbol, amount: amt } });
      toast.success(`${side === "buy" ? "Purchase" : "Sale"} executed for $${amt.toFixed(2)}`);
      setAmount("");
    } catch (e: any) {
      toast.error(e.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { label: "Market Cap", value: asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : "—" },
    { label: "Vol. 24h", value: asset.volume24h ? `$${(asset.volume24h / 1e6).toFixed(0)}M` : "—" },
    { label: "24h High", value: `$${fmtP(asset.high24h)}` },
    { label: "24h Low", value: `$${fmtP(asset.low24h)}` },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-border">
        <Link href="/invest" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="w-8 h-8 border border-border bg-muted/20 flex items-center justify-center text-foreground text-xs font-semibold shrink-0">
            {asset.symbol.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
              {asset.assetType} · {asset.symbol}
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{asset.name}</h1>
          </div>
          <div className="ml-6">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">${fmtP(asset.currentPrice)}</div>
            <div className="flex items-center gap-1 text-[12px] font-medium" style={{ color: pos ? "#2b6b4e" : "#943636" }}>
              {pos ? "+" : ""}{asset.changePercent24h?.toFixed(2)}% (24h)
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden lg:flex gap-0 border border-border">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-4 py-2 ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{s.label}</div>
              <div className="text-xs font-semibold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart + info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Price Chart</div>
              <div className="flex gap-0 border border-border">
                {(["1d", "1w", "1m", "1y", "all"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wide border-r last:border-0 border-border transition-colors
                      ${period === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-2 py-4 h-[360px]">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : chart?.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={pos ? "#2b6b4e" : "#943636"} stopOpacity={0.08} />
                        <stop offset="100%" stopColor={pos ? "#2b6b4e" : "#943636"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(2)}`} width={44} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 0, boxShadow: "none", padding: "8px 12px" }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "Price"]}
                      labelStyle={{ color: "#6b7280", fontSize: 10 }}
                    />
                    <Area type="monotone" dataKey="value"
                      stroke={pos ? "#2b6b4e" : "#943636"} strokeWidth={1.5}
                      fill="url(#chartColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No chart data</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Overview</div>
              <div className="text-sm font-semibold text-foreground">About {asset.name}</div>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                {asset.description || `${asset.name} (${asset.symbol}) is a ${asset.assetType} instrument available for institutional trading on Vault Wealth. Real-time pricing, deep liquidity, and instant settlement are provided across all market conditions.`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border">
                {stats.map((s, i) => (
                  <div key={s.label} className={`p-4 ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{s.label}</div>
                    <div className="text-sm font-semibold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trade widget */}
        <div>
          <div className="border border-border bg-card sticky top-6">
            {/* Buy/Sell toggle */}
            <div className="flex border-b border-border">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)}
                  className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-wider transition-colors border-r last:border-0 border-border
                    ${side === s ? "bg-[#0d1520] text-white" : "text-muted-foreground hover:bg-muted/20"}`}>
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleTrade} className="p-5 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Order Type</label>
                <select className="w-full border border-border bg-background text-foreground text-xs px-3 py-2 focus:outline-none focus:border-foreground transition-colors">
                  <option>Market Order</option>
                  <option>Limit Order</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Amount (USD)</label>
                </div>
                <div className="flex">
                  <span className="bg-muted border border-border border-r-0 px-3 flex items-center text-xs font-semibold text-muted-foreground">$</span>
                  <input type="number" min="1" step="0.01" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 border border-border bg-background text-foreground text-sm px-3 py-2 focus:outline-none focus:border-foreground transition-colors font-mono"
                  />
                </div>
                {amount && (
                  <div className="text-[10px] text-muted-foreground mt-1.5 text-right font-mono">
                    ≈ {(Number(amount) / asset.currentPrice).toFixed(6)} {asset.symbol}
                  </div>
                )}
              </div>

              <div className="border border-border">
                {[
                  { label: "Market Price", value: `$${fmtP(asset.currentPrice)}` },
                  { label: "Platform Fee", value: "$0.00" },
                  { label: "Total", value: amount ? `$${parseFloat(amount).toFixed(2)}` : "$0.00", bold: true },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex justify-between px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-border" : "bg-muted/30"}`}>
                    <span className="text-[10px] text-muted-foreground font-medium">{row.label}</span>
                    <span className={`text-[10px] tabular-nums font-mono ${row.bold ? "font-bold text-foreground" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={submitting}
                className="w-full text-white text-[11px] font-semibold uppercase tracking-wider py-3 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-[#0d1520] hover:bg-[#1a2d4a]">
                {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</> : `${side === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
              </button>

              <p className="text-[9px] text-muted-foreground text-center leading-relaxed">
                Orders are executed at market price. By proceeding you agree to our trading terms.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
