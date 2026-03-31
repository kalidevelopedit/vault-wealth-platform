import { useState } from "react";
import { useGetHoldings, useSearchAssets } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRightLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Invest() {
  const [search, setSearch] = useState("");
  const { data: searchResults, isLoading: searchLoading } = useSearchAssets({ q: search }, { query: { enabled: search.length > 1 } });
  
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Invest</h1>
          <p className="text-muted-foreground">Trade across all asset classes.</p>
        </div>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          className="w-full pl-10 h-14 text-lg rounded-xl shadow-sm border-border bg-card" 
          placeholder="Search for symbols, companies, or assets..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {search.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 overflow-hidden">
            {searchLoading ? (
              <div className="p-4 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
            ) : searchResults?.length ? (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map(asset => (
                  <Link key={asset.symbol} href={`/assets/${asset.symbol}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary">
                        {asset.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol} • <span className="capitalize">{asset.assetType}</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">${asset.currentPrice.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{search}"</div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/assets/stocks" className="block group">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-primary font-serif font-bold">Eq</span>
              </div>
              <CardTitle className="text-xl">Equities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Trade US and international stocks, ETFs, and indices.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/assets/crypto" className="block group">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-primary font-serif font-bold">Cr</span>
              </div>
              <CardTitle className="text-xl">Crypto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access 50+ vetted digital assets with deep liquidity.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assets/commodities" className="block group">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-primary font-serif font-bold">Co</span>
              </div>
              <CardTitle className="text-xl">Commodities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Diversify with precious metals, energy, and agriculture.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <Card className="shadow-sm border-border mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Quick Convert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/30 p-6 rounded-xl">
            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
              <div className="flex gap-2">
                <Select defaultValue="USD">
                  <SelectTrigger className="w-24 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
                <Input type="number" placeholder="0.00" className="flex-1 bg-card" />
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center shrink-0 z-10 my-2 md:my-0">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex-1 w-full">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
              <div className="flex gap-2">
                <Select defaultValue="BTC">
                  <SelectTrigger className="w-28 bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="AAPL">AAPL</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="0.00" className="flex-1 bg-card" readOnly />
              </div>
            </div>
            
            <Button size="lg" className="w-full md:w-auto mt-6 md:mt-0">Preview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
