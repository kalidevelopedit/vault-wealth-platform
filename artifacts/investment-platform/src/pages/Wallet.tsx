import { useState } from "react";
import { useGetUserBalance, useGetTransactions, useCreateTransaction } from "@workspace/api-client-react";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TX_TYPE_LABELS: Record<string, string> = {
  buy: "Purchase", sell: "Sale", deposit: "Deposit", withdraw: "Withdrawal",
};

export default function Wallet() {
  const { data: balance, isLoading: bl, refetch: refetchBalance } = useGetUserBalance();
  const { data: txData, isLoading: txl, refetch: refetchTx } = useGetTransactions({ limit: 20 });
  const createTx = useCreateTransaction();

  const [mode, setMode] = useState<"idle" | "deposit" | "withdraw">("idle");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fmtUSD = (n: number) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: mode === "deposit" ? "deposit" : "withdraw", amount: amt } });
      toast.success(mode === "deposit" ? `$${fmtUSD(amt)} deposited` : `$${fmtUSD(amt)} withdrawal initiated`);
      setAmount(""); setMode("idle");
      refetchBalance(); refetchTx();
    } catch (e: any) {
      toast.error(e.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Funds</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Wallet & Transactions</h1>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card mb-6">
        {[
          { label: "Available Cash", value: `$${fmtUSD(balance?.availableCash || 0)}`, sub: "Uninvested USD balance" },
          { label: "Equity Value", value: `$${fmtUSD(balance?.stockBalance || 0)}`, sub: "Stocks & ETFs" },
          { label: "Crypto Value", value: `$${fmtUSD(balance?.cryptoBalance || 0)}`, sub: "Digital assets" },
          { label: "Commodities", value: `$${fmtUSD(balance?.commodityBalance || 0)}`, sub: "Metals & energy" },
        ].map((item, i) => (
          <div key={i} className={`p-5 ${i < 3 ? "border-r border-border" : ""}`}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{item.label}</div>
            {bl ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-xl font-semibold tracking-tight tabular-nums text-foreground mb-0.5">{item.value}</div>
                <div className="text-[10px] text-muted-foreground">{item.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fund action panel */}
        <div className="border border-border bg-card">
          <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Funds Transfer</div>
              <div className="text-sm font-semibold text-foreground">Deposit / Withdraw</div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex gap-0 border border-border mb-5">
              <button onClick={() => setMode(mode === "deposit" ? "idle" : "deposit")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors border-r border-border
                  ${mode === "deposit" ? "bg-[#0a1628] text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
              </button>
              <button onClick={() => setMode(mode === "withdraw" ? "idle" : "withdraw")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors
                  ${mode === "withdraw" ? "bg-[#0a1628] text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
              </button>
            </div>

            {mode !== "idle" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                    Amount (USD)
                  </label>
                  <div className="flex">
                    <span className="bg-muted border border-border border-r-0 px-3 flex items-center text-xs font-semibold text-muted-foreground">$</span>
                    <input type="number" min="1" step="0.01" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 border border-border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:border-foreground transition-colors font-mono"
                    />
                  </div>
                  {mode === "withdraw" && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Available: ${fmtUSD(balance?.availableCash || 0)}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#0a1628] text-white text-xs font-bold uppercase tracking-wide py-2.5 hover:bg-[#0d1f38] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</> : `Confirm ${mode === "deposit" ? "Deposit" : "Withdrawal"}`}
                </button>
                <button type="button" onClick={() => { setMode("idle"); setAmount(""); }}
                  className="w-full border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wide py-2 hover:bg-muted/30 transition-colors">
                  Cancel
                </button>
              </form>
            ) : (
              <div className="py-8 text-center">
                <div className="text-xs text-muted-foreground">Select an action above to transfer funds</div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio total */}
        <div className="border border-border bg-[#0a1628] text-white">
          <div className="px-5 pt-4 pb-3 border-b border-white/8">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-0.5">Summary</div>
            <div className="text-sm font-semibold text-white">Portfolio Overview</div>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Total Portfolio Value</div>
              <div className="text-3xl font-semibold tracking-tight tabular-nums text-white">
                ${fmtUSD(balance?.totalPortfolioValue || 0)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Invested", value: `$${fmtUSD((balance?.totalPortfolioValue || 0) - (balance?.availableCash || 0))}` },
                { label: "Cash", value: `$${fmtUSD(balance?.availableCash || 0)}` },
              ].map((m) => (
                <div key={m.label} className="border border-white/10 p-3">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">{m.label}</div>
                  <div className="text-base font-semibold text-white tabular-nums font-mono">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="border border-border bg-card">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">History</div>
            <div className="text-sm font-semibold text-foreground">Transaction Ledger</div>
          </div>
          <button onClick={() => { refetchTx(); refetchBalance(); }}
            className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {txl ? (
          <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Date", "Type", "Instrument", "Quantity", "Price", "Amount", "Status"].map((h) => (
                    <th key={h} className={`py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground ${h === "Date" ? "text-left pl-5" : h === "Status" ? "text-right pr-5" : h === "Amount" || h === "Price" || h === "Quantity" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txData?.transactions?.map((tx) => {
                  const isBuy = tx.type === "buy";
                  const isSell = tx.type === "sell";
                  const isDeposit = tx.type === "deposit";
                  return (
                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pl-5 pr-4 text-muted-foreground font-mono text-[10px]">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide
                          ${isBuy ? "text-emerald-700" : isSell ? "text-red-700" : isDeposit ? "text-primary" : "text-muted-foreground"}`}>
                          {isBuy && <TrendingUp className="w-3 h-3" />}
                          {isSell && <TrendingDown className="w-3 h-3" />}
                          {isDeposit && <ArrowDownToLine className="w-3 h-3" />}
                          {!isBuy && !isSell && !isDeposit && <ArrowUpFromLine className="w-3 h-3" />}
                          {TX_TYPE_LABELS[tx.type] || tx.type}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground font-mono">{tx.symbol || "USD"}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground font-mono">{tx.quantity || "—"}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground font-mono">
                        {tx.price ? `$${parseFloat(String(tx.price)).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono text-foreground">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 pl-4 pr-5 text-right">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border
                          ${tx.status === "completed" ? "text-emerald-700 border-emerald-200 bg-emerald-50" :
                            tx.status === "pending" ? "text-amber-700 border-amber-200 bg-amber-50" :
                            "text-red-700 border-red-200 bg-red-50"}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!txData?.transactions?.length && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">No transactions on record.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
