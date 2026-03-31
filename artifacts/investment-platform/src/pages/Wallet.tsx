import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUserBalance, useGetTransactions } from "@workspace/api-client-react";
import { Download, Send, RefreshCcw, Loader2 } from "lucide-react";

export default function Wallet() {
  const { data: balance, isLoading: balanceLoading } = useGetUserBalance();
  const { data: transactionsData, isLoading: txLoading } = useGetTransactions({ limit: 10 });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm bg-primary text-primary-foreground border-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">Available Cash (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="text-5xl font-bold tracking-tight mb-8">
                ${balance?.availableCash?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || "0.00"}
              </div>
            )}
            <div className="flex gap-4">
              <Button variant="secondary" className="rounded-full px-6 bg-white text-primary hover:bg-white/90">
                <Download className="w-4 h-4 mr-2" /> Deposit
              </Button>
              <Button variant="outline" className="rounded-full px-6 border-white/20 text-white hover:bg-white/10">
                <Send className="w-4 h-4 mr-2" /> Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Asset Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-3xl font-semibold tracking-tight">
              ${((balance?.totalPortfolioValue || 0) - (balance?.availableCash || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Crypto</span>
                <span className="font-medium">${balance?.cryptoBalance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Equities</span>
                <span className="font-medium">${balance?.stockBalance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Commodities</span>
                <span className="font-medium">${balance?.commodityBalance?.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {txLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-muted-foreground border-b">
                      <tr>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactionsData?.transactions?.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 font-medium capitalize flex items-center gap-2">
                            {tx.type === 'deposit' && <Download className="w-4 h-4 text-success" />}
                            {tx.type === 'withdraw' && <Send className="w-4 h-4 text-muted-foreground" />}
                            {(tx.type === 'buy' || tx.type === 'sell') && <RefreshCcw className="w-4 h-4 text-primary" />}
                            {tx.type}
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            {tx.symbol ? (
                              <div>
                                <span className="font-medium">{tx.symbol}</span>
                                {tx.quantity && <span className="text-muted-foreground ml-2">{tx.quantity} units</span>}
                              </div>
                            ) : "USD"}
                          </td>
                          <td className="py-4 text-right font-medium">
                            ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 text-right">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                              ${tx.status === 'completed' ? 'bg-success/10 text-success' : 
                                tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 
                                'bg-destructive/10 text-destructive'}
                            `}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!transactionsData?.transactions || transactionsData.transactions.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            {/* Other tabs would filter the list, but for mockup we just show empty states or duplicate */}
            <TabsContent value="deposits"><div className="py-8 text-center text-muted-foreground">Filter applied: Deposits</div></TabsContent>
            <TabsContent value="withdrawals"><div className="py-8 text-center text-muted-foreground">Filter applied: Withdrawals</div></TabsContent>
            <TabsContent value="trades"><div className="py-8 text-center text-muted-foreground">Filter applied: Trades</div></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
