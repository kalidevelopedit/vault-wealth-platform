import { useRoute } from "wouter";
import { useListAssets } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function AssetList() {
  const [match, params] = useRoute("/assets/:type");
  const assetType = (params?.type === "stocks" ? "stock" : params?.type) as "crypto" | "stock" | "commodity";
  
  const [search, setSearch] = useState("");
  const { data: assets, isLoading } = useListAssets({ type: assetType });

  const filteredAssets = assets?.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight capitalize">{params?.type}</h1>
          <p className="text-muted-foreground">Market overview and performance.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="w-full pl-9 h-10 rounded-full" 
            placeholder="Search assets..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">24h Change</th>
                  <th className="px-6 py-4 font-medium text-right hidden md:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredAssets?.map((asset) => {
                  const isPositive = asset.changePercent24h >= 0;
                  return (
                    <tr key={asset.symbol} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/assets/${asset.symbol}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium text-sm">
                            {asset.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">{asset.name}</div>
                            <div className="text-muted-foreground text-xs">{asset.symbol}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center justify-end font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                          {Math.abs(asset.changePercent24h).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground hidden md:table-cell">
                        {asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
