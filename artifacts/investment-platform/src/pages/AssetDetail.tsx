import { useRoute, Link } from "wouter";
import { useGetAssetDetail, useGetAssetChart, useCreateTransaction } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";

const CARD = "bg-white rounded-2xl border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

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
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-7">
        <Link href="/invest" className="w-8 h-8 rounded-full bg-white border border-[#E6E8EB] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <AssetIcon symbol={asset.symbol} size={42} borderRadius={12} />
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {asset.assetType} · {asset.symbol}
            </div>
            <h1 className="text-[20px] font-bold tracking-tight text-foreground">{asset.name}</h1>
          </div>
          <div className="ml-6">
            <div className="text-[26px] font-bold tracking-tight tabular-nums text-foreground">${fmtP(asset.currentPrice)}</div>
            <div className="text-[12px] font-semibold" style={{ color: pos ? "#2b6b4e" : "#943636" }}>
              {pos ? "+" : ""}{asset.changePercent24h?.toFixed(2)}% (24h)
            </div>
          </div>
        </div>

        {/* Quick stats — pill chips */}
        <div className="hidden lg:flex gap-2">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-2 rounded-xl bg-white border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{s.label}</div>
              <div className="text-[11px] font-bold tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart + info */}
        <div className="lg:col-span-2 space-y-5">
          <div className={`${CARD} overflow-hidden`}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div className="text-[13px] font-semibold text-foreground">Price Chart</div>
              {/* Pill period toggle */}
              <div className="flex gap-1 bg-[#F2F3F5] p-1 rounded-full">
                {(["1d", "1w", "1m", "1y", "all"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-medium rounded-full transition-all
                      ${period === p
                        ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                        : "text-muted-foreground hover:text-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 py-4 h-[320px]">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : chart?.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={pos ? "#2b6b4e" : "#943636"} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={pos ? "#2b6b4e" : "#943636"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(2)}`} width={44} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #E6E8EB", borderRadius: 10, boxShadow: "0 4px 10px rgba(16,24,40,0.06)", padding: "8px 12px", background: "#fff" }}
                      formatter={(v: number) => [`$${v.toLocaleString()}`, "Price"]}
                      labelStyle={{ color: "#6B7280", fontSize: 10 }}
                    />
                    <Area type="monotone" dataKey="value"
                      stroke={pos ? "#2b6b4e" : "#943636"} strokeWidth={1.5}
                      fill="url(#chartColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[12px] text-muted-foreground">No chart data</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Overview</div>
              <div className="text-[13px] font-semibold text-foreground">About {asset.name}</div>
            </div>
            <div className="p-6">
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-6">
                {asset.description || `${asset.name} (${asset.symbol}) is a ${asset.assetType} instrument available for institutional trading on Vault Wealth. Real-time pricing, deep liquidity, and instant settlement are provided across all market conditions.`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="p-4 rounded-xl bg-[#F5F6F7]">
                    <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">{s.label}</div>
                    <div className="text-[13px] font-bold tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trade widget */}
        <div>
          <div className={`${CARD} sticky top-6 overflow-hidden`}>
            {/* Buy/Sell pill toggle */}
            <div className="p-4 pb-0">
              <div className="flex gap-1 bg-[#F2F3F5] p-1 rounded-full">
                {(["buy", "sell"] as const).map((s) => (
                  <button key={s} onClick={() => setSide(s)}
                    className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-full transition-all
                      ${side === s
                        ? s === "buy"
                          ? "bg-[#0d1520] text-white shadow-[0_1px_2px_rgba(16,24,40,0.12)]"
                          : "bg-[#943636] text-white shadow-[0_1px_2px_rgba(16,24,40,0.12)]"
                        : "text-muted-foreground hover:text-foreground"}`}>
                    {s === "buy" ? "Buy" : "Sell"}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleTrade} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Order Type</label>
                <select className="w-full border border-[#E6E8EB] bg-white text-foreground text-[12px] px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#0d1520] transition-colors appearance-none">
                  <option>Market Order</option>
                  <option>Limit Order</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Amount (USD)</label>
                <div className="flex rounded-xl overflow-hidden border border-[#E6E8EB] focus-within:border-[#0d1520] transition-colors">
                  <span className="bg-[#F5F6F7] px-3 flex items-center text-[12px] font-medium text-muted-foreground border-r border-[#E6E8EB]">$</span>
                  <input type="number" min="1" step="0.01" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-white text-foreground text-[13px] px-3 py-2.5 focus:outline-none font-mono"
                  />
                </div>
                {amount && (
                  <div className="text-[10px] text-muted-foreground mt-1.5 text-right font-mono">
                    ≈ {(Number(amount) / asset.currentPrice).toFixed(6)} {asset.symbol}
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="rounded-xl overflow-hidden border border-[#E6E8EB]">
                {[
                  { label: "Market Price", value: `$${fmtP(asset.currentPrice)}` },
                  { label: "Platform Fee", value: "$0.00" },
                  { label: "Total", value: amount ? `$${parseFloat(amount).toFixed(2)}` : "$0.00", bold: true },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex justify-between px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-[#E6E8EB]" : "bg-[#F5F6F7]"}`}>
                    <span className="text-[11px] text-muted-foreground">{row.label}</span>
                    <span className={`text-[11px] tabular-nums font-mono ${row.bold ? "font-bold text-foreground" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={submitting}
                className="w-full text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: side === "buy" ? "#0d1520" : "#943636" }}>
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
