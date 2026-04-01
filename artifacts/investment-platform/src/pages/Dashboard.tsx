import { useGetPortfolioSummary, useGetPortfolioPerformance, useGetHoldings, useGetAssetMix, useGetMarketNews } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { Link } from "wouter";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown } from "lucide-react";

const PIE_COLORS = ["#162d4a", "#3a5e88", "#7ba3c8", "#bbd0e5"];
const GAIN = "#2b6b4e";
const LOSS = "#943636";
const CARD = "bg-white rounded-2xl border border-[#E6E8EB]";
const CARD_SHADOW = "shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

export default function Dashboard() {
  const [period, setPeriod] = useState<"ytd" | "1y" | "3y" | "all">("1y");

  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: performance } = useGetPortfolioPerformance({ period });
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: assetMix } = useGetAssetMix();
  const { data: news } = useGetMarketNews({ limit: 4 });

  if (ls || lh) return (
    <div className="h-full flex items-center justify-center py-32">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    </div>
  );

  const positive = (summary?.totalReturn ?? 0) >= 0;
  const fmtUSD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 pb-16">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">Portfolio</div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "Buy", icon: TrendingUp, href: "/invest" },
            { label: "Sell", icon: TrendingDown, href: "/invest" },
            { label: "Deposit", icon: ArrowDownToLine, href: "/wallet" },
            { label: "Withdraw", icon: ArrowUpFromLine, href: "/wallet" },
          ].map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href}
              className="inline-flex items-center gap-1.5 border border-[#E6E8EB] bg-white text-foreground text-[10px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-muted/40 transition-all hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
              <Icon className="w-3 h-3" strokeWidth={1.5} />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI strip — individual floating cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Portfolio Value",
            value: `$${fmtUSD(summary?.totalAssets || 0)}`,
            sub: <span style={{ color: positive ? GAIN : LOSS }} className="text-[11px]">
              {positive ? "+" : "−"}{Math.abs(summary?.returnPercentage || 0).toFixed(2)}% total return
            </span>
          },
          {
            label: "Available Cash",
            value: `$${fmtUSD(summary?.availableCash || 0)}`,
            sub: <span className="text-[11px] text-muted-foreground">Uninvested balance</span>
          },
          {
            label: "Total Return",
            value: `${positive ? "+" : "−"}$${fmtUSD(Math.abs(summary?.totalReturn || 0))}`,
            sub: <span style={{ color: positive ? GAIN : LOSS }} className="text-[11px] font-medium">
              {positive ? "+" : ""}{summary?.returnPercentage?.toFixed(2)}%
            </span>
          },
          {
            label: "Today's Change",
            value: `${(summary?.dayChange || 0) >= 0 ? "+" : "−"}$${fmtUSD(Math.abs(summary?.dayChange || 0))}`,
            sub: <span style={{ color: (summary?.dayChange || 0) >= 0 ? GAIN : LOSS }} className="text-[11px]">
              {(summary?.dayChange || 0) >= 0 ? "+" : "−"}{Math.abs(summary?.dayChangePercentage || 0).toFixed(2)}%
            </span>
          },
        ].map((kpi, i) => (
          <div key={i} className={`p-6 ${CARD} ${CARD_SHADOW}`}>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">{kpi.label}</div>
            <div className="text-[22px] font-semibold text-foreground tracking-tight tabular-nums mb-1">{kpi.value}</div>
            <div>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: chart + holdings */}
        <div className="xl:col-span-2 space-y-5">

          {/* Performance chart */}
          <div className={`${CARD} ${CARD_SHADOW} overflow-hidden`}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Performance</div>
                <div className="text-[13px] font-semibold text-foreground">Portfolio Value Over Time</div>
              </div>
              {/* Pill period toggle */}
              <div className="flex items-center gap-1 bg-[#F2F3F5] p-1 rounded-full">
                {(["ytd", "1y", "3y", "all"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-medium uppercase tracking-wide rounded-full transition-all
                      ${period === p
                        ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                        : "text-muted-foreground hover:text-foreground"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 py-5 h-[240px]">
              {performance?.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performance.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="perf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={positive ? GAIN : LOSS} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={positive ? GAIN : LOSS} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={42} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #E6E8EB", borderRadius: 10, boxShadow: "0 4px 10px rgba(16,24,40,0.06)", padding: "8px 12px", background: "#fff" }}
                      itemStyle={{ color: "#0F172A", fontWeight: 600 }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                      labelStyle={{ color: "#9ca3af", fontSize: 10 }}
                    />
                    <Area type="monotone" dataKey="value"
                      stroke={positive ? GAIN : LOSS} strokeWidth={1.5}
                      fill="url(#perf)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No data</div>
              )}
            </div>
          </div>

          {/* Holdings table */}
          <div className={`${CARD} ${CARD_SHADOW} overflow-hidden`}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Positions</div>
                <div className="text-[13px] font-semibold text-foreground">Current Holdings</div>
              </div>
              <Link href="/invest" className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                Trade →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E8EB] bg-[#F5F6F7]">
                    <th className="text-left py-3 px-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Instrument</th>
                    <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Last Price</th>
                    <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">24h</th>
                    <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Qty</th>
                    <th className="text-right py-3 px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Value</th>
                    <th className="text-right py-3 px-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Alloc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EB]">
                  {holdings?.map((h) => {
                    const gain = h.gainLossPercentage >= 0;
                    const alloc = ((h.currentValue / (summary?.totalAssets || 1)) * 100).toFixed(1);
                    return (
                      <tr key={h.id} className="hover:bg-[#F5F6F7] transition-colors cursor-pointer">
                        <td className="py-3.5 px-6">
                          <Link href={`/assets/${h.symbol}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#F2F3F5] flex items-center justify-center text-foreground text-[9px] font-bold shrink-0">
                              {h.symbol.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-[12px]">{h.name}</div>
                              <div className="text-muted-foreground text-[10px] font-mono uppercase">{h.symbol}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-foreground text-[12px]">
                          ${h.currentPrice.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[12px] font-medium" style={{ color: gain ? GAIN : LOSS }}>
                          {gain ? "+" : ""}{h.gainLossPercentage}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-muted-foreground text-[12px]">
                          {h.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-foreground text-[12px]">
                          ${h.currentValue.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-12 h-1 rounded-full bg-[#E6E8EB]">
                              <div className="h-full rounded-full bg-[#162d4a]" style={{ width: `${alloc}%` }} />
                            </div>
                            <span className="font-mono text-muted-foreground text-[10px] w-8 text-right">{alloc}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: allocation + news */}
        <div className="space-y-5">

          {/* Asset Mix */}
          <div className={`${CARD} ${CARD_SHADOW} overflow-hidden`}>
            <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Allocation</div>
              <div className="text-[13px] font-semibold text-foreground">Asset Distribution</div>
            </div>
            <div className="px-6 py-5">
              {assetMix?.allocations && (
                <div className="h-[150px] flex justify-center mb-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={assetMix.allocations} cx="50%" cy="50%"
                        innerRadius={48} outerRadius={66} paddingAngle={3} dataKey="value">
                        {assetMix.allocations.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                        contentStyle={{ fontSize: 10, border: "1px solid #E6E8EB", borderRadius: 10, padding: "6px 10px", background: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-3">
                {assetMix?.allocations.map((a, i) => (
                  <div key={a.assetType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[12px] text-foreground capitalize">{a.assetType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[12px] font-semibold font-mono tabular-nums">{a.percentage}%</span>
                      <div className="text-[10px] text-muted-foreground font-mono">${a.value?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className={`${CARD} ${CARD_SHADOW} overflow-hidden`}>
            <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Intelligence</div>
              <div className="text-[13px] font-semibold text-foreground">Market Insights</div>
            </div>
            <div className="divide-y divide-[#E6E8EB]">
              {news?.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="block px-6 py-4 hover:bg-[#F5F6F7] transition-colors group">
                  <div className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <span>{item.source}</span>
                    <span className="opacity-30">·</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <h4 className="text-[12px] font-medium text-foreground leading-relaxed line-clamp-2 group-hover:text-muted-foreground transition-colors">
                    {item.title}
                  </h4>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
