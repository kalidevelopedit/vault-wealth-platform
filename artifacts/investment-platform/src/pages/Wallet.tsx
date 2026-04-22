import { useState } from "react";
import { useGetUserBalance, useGetTransactions, useCreateTransaction } from "@workspace/api-client-react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const BLUE = "#2563FF";

const fmt = (n: number) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";

export default function Wallet() {
  const { data: balance, isLoading: bl, refetch: refetchBalance } = useGetUserBalance();
  const { data: txData, isLoading: txl, refetch: refetchTx } = useGetTransactions({ limit: 10 });
  const createTx = useCreateTransaction();

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter valid amount");
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: mode, amount: amt } });
      toast.success(mode === "deposit" ? "Deposit initiated" : "Withdrawal initiated");
      setAmount("");
      refetchBalance(); refetchTx();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Balance */}
        <div className="lg:col-span-2 space-y-6">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 14, color: MUTED, marginBottom: 8, fontWeight: 500 }}>Estimated Balance</div>
            {bl ? <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} /> : (
              <>
                <div style={{ fontSize: 48, fontWeight: 700, color: TEXT, fontFamily: "monospace", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 8 }}>
                  ${fmt(balance?.totalPortfolioValue || 0)}
                </div>
                <div style={{ fontSize: 14, color: MUTED, fontFamily: "monospace" }}>
                  ≈ {fmt(balance?.totalPortfolioValue || 0)} USD
                </div>
              </>
            )}
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Recent Transactions</div>
              <button onClick={() => { refetchTx(); refetchBalance(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <RefreshCw style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
              </button>
            </div>
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Date", "Type", "Asset", "Amount", "Status"].map((h, i) => (
                      <th key={h} style={{ padding: "16px 24px", textAlign: i === 0 ? "left" : "right", fontSize: 12, fontWeight: 500, color: MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txl ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} /></td></tr>
                  ) : txData?.transactions?.length ? txData.transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: `1px solid ${BORD}` }}>
                      <td style={{ padding: "16px 24px", fontSize: 13, color: MUTED, fontFamily: "monospace" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 13, fontWeight: 500, color: TEXT, textTransform: "capitalize" }}>{tx.type}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 13, color: TEXT }}>{tx.symbol || "USD"}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 13, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>${fmt(tx.amount)}</td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 13, color: MUTED, textTransform: "capitalize" }}>{tx.status}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: MUTED, fontSize: 14 }}>No transactions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Transfer Form */}
        <div>
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              <button onClick={() => setMode("deposit")} style={{
                flex: 1, height: 40, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: mode === "deposit" ? "#191F28" : "transparent", color: mode === "deposit" ? TEXT : MUTED
              }}>Deposit</button>
              <button onClick={() => setMode("withdraw")} style={{
                flex: 1, height: 40, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: mode === "withdraw" ? "#191F28" : "transparent", color: mode === "withdraw" ? TEXT : MUTED
              }}>Withdraw</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Currency</div>
                <div style={{ height: 48, background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px", color: TEXT, fontSize: 14 }}>USD</div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>Amount</span>
                  {mode === "withdraw" && <span>Avail: ${fmt(balance?.availableCash || 0)}</span>}
                </div>
                <div style={{ height: 48, background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <span style={{ color: MUTED, marginRight: 8 }}>$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{
                    background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 16, width: "100%", fontFamily: "monospace"
                  }} />
                </div>
              </div>
              <button type="submit" disabled={submitting} style={{
                width: "100%", height: 48, borderRadius: 999, border: "none", cursor: submitting ? "not-allowed" : "pointer",
                background: BLUE, color: "#fff", fontSize: 15, fontWeight: 600, opacity: submitting ? 0.7 : 1
              }}>
                {submitting ? "Processing..." : `${mode === "deposit" ? "Deposit" : "Withdraw"} USD`}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
