import { useState } from "react";
import { useGetUserBalance, useGetTransactions, useCreateTransaction } from "@workspace/api-client-react";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TX_TYPE_LABELS: Record<string, string> = {
  buy: "Purchase", sell: "Sale", deposit: "Deposit", withdraw: "Withdrawal",
};

const STATUS_DOT: Record<string, string> = {
  completed: "#2b6b4e",
  pending: "#8a6e2f",
  failed: "#943636",
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
    <div className="max-w-[1200px] mx-auto px-6 py-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Funds</div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">Wallet & Transactions</h1>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-8">
        {[
          { label: "Available Cash", value: `$${fmtUSD(balance?.availableCash || 0)}`, sub: "Uninvested USD balance" },
          { label: "Equity Value", value: `$${fmtUSD(balance?.stockBalance || 0)}`, sub: "Stocks & ETFs" },
          { label: "Crypto Value", value: `$${fmtUSD(balance?.cryptoBalance || 0)}`, sub: "Digital assets" },
          { label: "Commodities", value: `$${fmtUSD(balance?.commodityBalance || 0)}`, sub: "Metals & energy" },
        ].map((item, i) => (
          <div key={i} className="p-6 bg-card">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">{item.label}</div>
            {bl ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : (
              <>
                <div className="text-[22px] font-semibold tracking-tight tabular-nums text-foreground mb-1">{item.value}</div>
                <div className="text-[11px] text-muted-foreground">{item.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Fund action panel */}
        <div className="border border-border bg-card">
          <div className="px-6 pt-5 pb-4 border-b border-border">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Funds Transfer</div>
            <div className="text-[13px] font-semibold text-foreground">Deposit / Withdraw</div>
          </div>
          <div className="p-6">
            <div className="flex gap-px bg-border mb-6">
              <button onClick={() => setMode(mode === "deposit" ? "idle" : "deposit")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors
                  ${mode === "deposit" ? "bg-[#0d1520] text-white" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}>
                <ArrowDownToLine className="w-3.5 h-3.5" strokeWidth={1.5} /> Deposit
              </button>
              <button onClick={() => setMode(mode === "withdraw" ? "idle" : "withdraw")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors
                  ${mode === "withdraw" ? "bg-[#0d1520] text-white" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}>
                <ArrowUpFromLine className="w-3.5 h-3.5" strokeWidth={1.5} /> Withdraw
              </button>
            </div>

            {mode !== "idle" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                    Amount (USD)
                  </label>
                  <div className="flex">
                    <span className="bg-muted/30 border border-border border-r-0 px-3 flex items-center text-[12px] font-medium text-muted-foreground">$</span>
                    <input type="number" min="1" step="0.01" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 border border-border bg-white text-foreground text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-foreground transition-colors font-mono"
                    />
                  </div>
                  {mode === "withdraw" && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Available: ${fmtUSD(balance?.availableCash || 0)}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</> : `Confirm ${mode === "deposit" ? "Deposit" : "Withdrawal"}`}
                </button>
                <button type="button" onClick={() => { setMode("idle"); setAmount(""); }}
                  className="w-full border border-border text-muted-foreground text-[11px] font-medium uppercase tracking-wider py-2.5 hover:bg-muted/20 transition-colors">
                  Cancel
                </button>
              </form>
            ) : (
              <div className="py-10 text-center">
                <div className="text-[12px] text-muted-foreground">Select an action above to transfer funds</div>
              </div>
            )}
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="border border-border bg-card">
          <div className="px-6 pt-5 pb-4 border-b border-border">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Summary</div>
            <div className="text-[13px] font-semibold text-foreground">Portfolio Overview</div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-2">Total Portfolio Value</div>
              <div className="text-[30px] font-semibold tracking-tight tabular-nums text-foreground">
                ${fmtUSD(balance?.totalPortfolioValue || 0)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {[
                { label: "Invested", value: `$${fmtUSD((balance?.totalPortfolioValue || 0) - (balance?.availableCash || 0))}` },
                { label: "Cash", value: `$${fmtUSD(balance?.availableCash || 0)}` },
              ].map((m) => (
                <div key={m.label} className="p-4 bg-muted/20">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2">{m.label}</div>
                  <div className="text-[15px] font-semibold text-foreground tabular-nums font-mono">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="border border-border bg-card">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">History</div>
            <div className="text-[13px] font-semibold text-foreground">Transaction Ledger</div>
          </div>
          <button onClick={() => { refetchTx(); refetchBalance(); }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {txl ? (
          <div className="py-14 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/15">
                  {["Date", "Type", "Instrument", "Quantity", "Price", "Amount", "Status"].map((h) => (
                    <th key={h} className={`py-3 px-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground ${h === "Date" ? "text-left pl-6" : h === "Status" ? "text-right pr-6" : h === "Amount" || h === "Price" || h === "Quantity" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txData?.transactions?.map((tx) => {
                  const isBuy = tx.type === "buy";
                  const isSell = tx.type === "sell";
                  const isDeposit = tx.type === "deposit";
                  const statusColor = STATUS_DOT[tx.status] || "#999";
                  return (
                    <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 pl-6 pr-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                          {isBuy && <TrendingUp className="w-3 h-3 opacity-50" strokeWidth={1.5} />}
                          {isSell && <TrendingDown className="w-3 h-3 opacity-50" strokeWidth={1.5} />}
                          {isDeposit && <ArrowDownToLine className="w-3 h-3 opacity-50" strokeWidth={1.5} />}
                          {!isBuy && !isSell && !isDeposit && <ArrowUpFromLine className="w-3 h-3 opacity-50" strokeWidth={1.5} />}
                          {TX_TYPE_LABELS[tx.type] || tx.type}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground font-mono text-[11px]">{tx.symbol || "USD"}</td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[11px]">{tx.quantity || "—"}</td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[11px]">
                        {tx.price ? `$${parseFloat(String(tx.price)).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium font-mono text-foreground text-[11px]">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!txData?.transactions?.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[12px] text-muted-foreground">No transactions on record.</td>
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
