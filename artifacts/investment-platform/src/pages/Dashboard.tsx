import { useGetPortfolioSummary, useGetPortfolioPerformance, useGetHoldings, useGetAssetMix, useGetMarketNews } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Plus, Minus, Send, Download, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Link } from "wouter";

const COLORS = ['hsl(var(--primary))', 'hsl(215, 16%, 47%)', 'hsl(210, 40%, 85%)'];

export default function Dashboard() {
  const [period, setPeriod] = useState<"ytd" | "1y" | "3y" | "all">("1y");
  
  const { data: summary, isLoading: loadingSummary } = useGetPortfolioSummary();
  const { data: performance, isLoading: loadingPerf } = useGetPortfolioPerformance({ period });
  const { data: holdings, isLoading: loadingHoldings } = useGetHoldings();
  const { data: assetMix, isLoading: loadingMix } = useGetAssetMix();
  const { data: news, isLoading: loadingNews } = useGetMarketNews({ limit: 3 });

  if (loadingSummary || loadingPerf || loadingHoldings) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isPositive = (summary?.totalReturn ?? 0) >= 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Welcome back. Here is your portfolio summary.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <Button variant="outline" className="rounded-full shadow-xs"><Plus className="w-4 h-4 mr-2" /> Buy</Button>
          <Button variant="outline" className="rounded-full shadow-xs"><Minus className="w-4 h-4 mr-2" /> Sell</Button>
          <Button variant="outline" className="rounded-full shadow-xs"><Download className="w-4 h-4 mr-2" /> Deposit</Button>
          <Button variant="outline" className="rounded-full shadow-xs"><Send className="w-4 h-4 mr-2" /> Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <div className="text-4xl font-semibold tracking-tight">
                  ${summary?.totalAssets?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(summary?.returnPercentage || 0).toFixed(2)}%
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <div className="bg-muted rounded-lg p-1 flex text-xs">
                  {["1d", "1w", "1m", "ytd", "1y", "all"].map(p => (
                    <button 
                      key={p} 
                      onClick={() => setPeriod(p as any)}
                      className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${period === p ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                {performance?.data && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performance.data}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-sm)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <Tabs defaultValue="positions">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Holdings</CardTitle>
                  <TabsList>
                    <TabsTrigger value="positions">My Positions</TabsTrigger>
                    <TabsTrigger value="orders">Open Orders</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="positions" className="mt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-muted-foreground border-b border-border">
                        <tr>
                          <th className="pb-3 font-medium">Asset</th>
                          <th className="pb-3 font-medium text-right">Price</th>
                          <th className="pb-3 font-medium text-right">Balance</th>
                          <th className="pb-3 font-medium text-right">Allocation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {holdings?.map((holding) => (
                          <tr key={holding.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                            <td className="py-4">
                              <Link href={`/assets/${holding.symbol}`} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  {holding.symbol[0]}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{holding.name}</div>
                                  <div className="text-muted-foreground">{holding.symbol}</div>
                                </div>
                              </Link>
                            </td>
                            <td className="py-4 text-right">
                              <div className="font-medium">${holding.currentPrice.toLocaleString()}</div>
                              <div className={holding.gainLossPercentage >= 0 ? "text-success" : "text-destructive"}>
                                {holding.gainLossPercentage >= 0 ? "+" : ""}{holding.gainLossPercentage}%
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div className="font-medium">${holding.currentValue.toLocaleString()}</div>
                              <div className="text-muted-foreground">{holding.quantity} {holding.symbol}</div>
                            </td>
                            <td className="py-4 text-right text-muted-foreground">
                              {((holding.currentValue / (summary?.totalAssets || 1)) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                <TabsContent value="orders">
                  <div className="py-8 text-center text-muted-foreground">No open orders.</div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full flex justify-center mb-6">
                {assetMix?.allocations && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetMix.allocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetMix.allocations.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-3">
                {assetMix?.allocations.map((alloc, i) => (
                  <div key={alloc.assetType} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="capitalize">{alloc.assetType}</span>
                    </div>
                    <span className="font-medium">{alloc.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {news?.map((item) => (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
