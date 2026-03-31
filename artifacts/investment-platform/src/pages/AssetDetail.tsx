import { useRoute } from "wouter";
import { useGetAssetDetail, useGetAssetChart } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import { useState } from "react";

export default function AssetDetail() {
  const [match, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol || "";
  
  const [period, setPeriod] = useState<"1d" | "1w" | "1m" | "1y" | "all">("1m");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");

  const { data: asset, isLoading: loadingAsset } = useGetAssetDetail(symbol, { query: { enabled: !!symbol } });
  const { data: chartData, isLoading: loadingChart } = useGetAssetChart(symbol, { period }, { query: { enabled: !!symbol } });

  if (loadingAsset) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!asset) return <div>Asset not found</div>;

  const isPositive = asset.changePercent24h >= 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center font-medium text-xl border">
            {asset.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
              <span className="text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md text-sm">{asset.symbol}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-3xl font-medium">${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
              <span className={`flex items-center font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                {isPositive ? <ArrowUpRight className="w-5 h-5 mr-1" /> : <ArrowDownRight className="w-5 h-5 mr-1" />}
                {Math.abs(asset.changePercent24h).toFixed(2)}% (1D)
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full">
          <Star className="w-4 h-4 mr-2" /> Add to Watchlist
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="p-4 pb-0 flex flex-row justify-end border-b border-border mb-4">
              <div className="bg-muted rounded-lg p-1 flex text-xs mb-4">
                {["1d", "1w", "1m", "1y", "all"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setPeriod(p as any)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${period === p ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[400px] w-full">
                {loadingChart ? (
                   <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : chartData?.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.data}>
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
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
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
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">About {asset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {asset.description || `${asset.name} is a ${asset.assetType} asset available for trading on Vault Wealth. Additional details about this asset's fundamentals and history are currently being updated.`}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                  <div className="font-medium">{asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Volume (24h)</div>
                  <div className="font-medium">${(asset.volume24h / 1e6).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24h High</div>
                  <div className="font-medium">${asset.high24h.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24h Low</div>
                  <div className="font-medium">${asset.low24h.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade Widget Column */}
        <div className="space-y-6">
          <Card className="shadow-lg border-border sticky top-24">
            <CardHeader className="pb-4">
              <Tabs value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Order Type</label>
                <select className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm">
                  <option>Market Order</option>
                  <option>Limit Order</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 flex justify-between">
                  Amount
                  <span>Available: $12,450.00</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="pl-7 h-12 text-lg"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                {amount && (
                  <div className="text-xs text-muted-foreground mt-2 text-right">
                    ~ {(Number(amount) / asset.currentPrice).toFixed(6)} {asset.symbol}
                  </div>
                )}
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Price</span>
                  <span className="font-medium">${asset.currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${amount || "0.00"}</span>
                </div>
              </div>

              <Button size="lg" className="w-full text-base h-12">
                {orderType === "buy" ? `Buy ${asset.symbol}` : `Sell ${asset.symbol}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
