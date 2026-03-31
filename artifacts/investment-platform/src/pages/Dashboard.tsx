import { useGetPortfolioSummary, useGetPortfolioPerformance, useGetHoldings, useGetAssetMix, useGetMarketNews } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";
import { Link } from "wouter";
import { Loader2, ArrowUpRight, ArrowDownRight, Plus, Minus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

const PIE_COLORS = ["#0a1628", "#1e3a5f", "#3d6b9e", "#8ba9c9"];

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-4">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

export default function Dashboard() {
  const [period, setPeriod] = useState<"ytd" | "1y" | "3y" | "all">("1y");

  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: performance } = useGetPortfolioPerformance({ period });
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: assetMix } = useGetAssetMix();
  const { data: news } = useGetMarketNews({ limit: 4 });

  if (ls || lh) return (
    <div className="h-full flex items-center justify-center py-32">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );

  const positive = (summary?.totalReturn ?? 0) >= 0;
  const fmtUSD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 pb-12">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Portfolio</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "Buy", icon: Plus, href: "/invest" },
            { label: "Sell", icon: Minus, href: "/invest" },
            { label: "Deposit", icon: ArrowDownToLine, href: "/wallet" },
            { label: "Withdraw", icon: ArrowUpFromLine, href: "/wallet" },
          ].map(({ label, icon: Icon, href }) => (
            <Link key={label} href={href}
              className="inline-flex items-center gap-1.5 border border-border bg-card text-foreground text-[10px] font-semibold uppercase tracking-wide px-3 py-1.5 hover:bg-muted/50 transition-colors">
              <Icon className="w-3 h-3" />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border bg-card mb-6">
        {[
          {
            label: "Total Portfolio Value", value: `$${fmtUSD(summary?.totalAssets || 0)}`,
            sub: <span className={positive ? "text-emerald-700" : "text-red-700"}>{positive ? "▲" : "▼"} {Math.abs(summary?.returnPercentage || 0).toFixed(2)}% total return</span>
          },
          {
            label: "Available Cash", value: `$${fmtUSD(summary?.availableCash || 0)}`,
            sub: <span className="text-muted-foreground">Uninvested balance</span>
          },
          {
            label: "Total Return", value: `${positive ? "+" : "-"}$${fmtUSD(Math.abs(summary?.totalReturn || 0))}`,
            sub: <span className={positive ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>{positive ? "+" : ""}{summary?.returnPercentage?.toFixed(2)}%</span>
          },
          {
            label: "Today's Change", value: `${(summary?.dayChange || 0) >= 0 ? "+" : ""}$${fmtUSD(Math.abs(summary?.dayChange || 0))}`,
            sub: <span className={(summary?.dayChange || 0) >= 0 ? "text-emerald-700" : "text-red-700"}>{(summary?.dayChange || 0) >= 0 ? "▲" : "▼"} {Math.abs(summary?.dayChangePercentage || 0).toFixed(2)}%</span>
          },
        ].map((kpi, i) => (
          <div key={i} className={`p-5 ${i < 3 ? "border-r border-border" : ""}`}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{kpi.label}</div>
            <div className="text-xl font-semibold text-foreground tracking-tight tabular-nums mb-1">{kpi.value}</div>
            <div className="text-[11px]">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: chart + holdings */}
        <div className="xl:col-span-2 space-y-6">

          {/* Performance chart */}
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Performance</div>
                <div className="text-sm font-semibold text-foreground">Portfolio Value Over Time</div>
              </div>
              <div className="flex gap-0 border border-border">
                {(["ytd", "1y", "3y", "all"] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide border-r last:border-0 border-border transition-colors
                      ${period === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-2 py-4 h-[240px]">
              {performance?.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performance.data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="perf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={positive ? "#166534" : "#991b1b"} stopOpacity={0.12} />
                        <stop offset="100%" stopColor={positive ? "#166534" : "#991b1b"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 0, boxShadow: "none", padding: "8px 12px" }}
                      itemStyle={{ color: "#0a1628", fontWeight: 600 }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                      labelStyle={{ color: "#6b7280", fontSize: 10 }}
                    />
                    <Area type="monotone" dataKey="value"
                      stroke={positive ? "#166534" : "#991b1b"} strokeWidth={1.5}
                      fill="url(#perf)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No data</div>
              )}
            </div>
          </div>

          {/* Holdings table */}
          <div className="border border-border bg-card">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Positions</div>
                <div className="text-sm font-semibold text-foreground">Current Holdings</div>
              </div>
              <Link href="/invest" className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">
                Trade →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-2.5 px-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Instrument</th>
                    <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Last Price</th>
                    <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">24h</th>
                    <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Qty</th>
                    <th className="text-right py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Value</th>
                    <th className="text-right py-2.5 px-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Alloc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings?.map((h) => {
                    const gain = h.gainLossPercentage >= 0;
                    const alloc = ((h.currentValue / (summary?.totalAssets || 1)) * 100).toFixed(1);
                    return (
                      <tr key={h.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                        <td className="py-3 px-5">
                          <Link href={`/assets/${h.symbol}`} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-[#0a1628] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                              {h.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-xs">{h.name}</div>
                              <div className="text-muted-foreground text-[10px] font-mono capitalize">{h.symbol}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-foreground font-medium">
                          ${h.currentPrice.toLocaleString()}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-semibold ${gain ? "text-emerald-700" : "text-red-700"}`}>
                          {gain ? "+" : ""}{h.gainLossPercentage}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                          {h.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                          ${h.currentValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-12 h-1 bg-muted">
                              <div className="h-full bg-[#0a1628]" style={{ width: `${alloc}%` }} />
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
        <div className="space-y-6">

          {/* Asset Mix */}
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Allocation</div>
              <div className="text-sm font-semibold text-foreground">Asset Distribution</div>
            </div>
            <div className="px-5 py-4">
              {assetMix?.allocations && (
                <div className="h-[160px] flex justify-center mb-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={assetMix.allocations} cx="50%" cy="50%"
                        innerRadius={52} outerRadius={70} paddingAngle={2} dataKey="value">
                        {assetMix.allocations.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`}
                        contentStyle={{ fontSize: 10, border: "1px solid #e5e7eb", borderRadius: 0, padding: "6px 10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-2.5">
                {assetMix?.allocations.map((a, i) => (
                  <div key={a.assetType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-foreground capitalize font-medium">{a.assetType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold font-mono tabular-nums">{a.percentage}%</span>
                      <div className="text-[10px] text-muted-foreground font-mono">${a.value?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market News */}
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Intelligence</div>
              <div className="text-sm font-semibold text-foreground">Market Insights</div>
            </div>
            <div className="divide-y divide-border">
              {news?.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="block px-5 py-4 hover:bg-muted/20 transition-colors group">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
                    <span>{item.source}</span>
                    <span className="text-border">·</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  <h4 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
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
