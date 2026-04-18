import { useState } from "react";
import { useGetUserBalance, useGetTransactions, useCreateTransaction } from "@workspace/api-client-react";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AssetIcon } from "@/components/AssetIcon";

const BG   = "#0c0f1a";
const CARD = "#131827";
const CARD2= "#0d1020";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED= "rgba(255,255,255,0.38)";
const BLUE = "#3b82f6";
const GREEN= "#22c55e";
const RED  = "#ef4444";

const TX_LABELS: Record<string, string> = {
  buy: "Purchase", sell: "Sale", deposit: "Deposit", withdraw: "Withdrawal",
};
const STATUS_COLOR: Record<string, string> = {
  completed: GREEN, pending: "#f59e0b", failed: RED,
};

const FEATURED_ASSETS = [
  { symbol: "GOOG", name: "Google",   pct: "+1.03",  gain: true  },
  { symbol: "AMZN", name: "Amazon",   pct: "+1.03",  gain: true  },
  { symbol: "TSLA", name: "Tesla",    pct: "-2.14",  gain: false },
  { symbol: "NVDA", name: "NVIDIA",   pct: "+3.82",  gain: true  },
];

function MiniSparkline({ gain }: { gain: boolean }) {
  const pts = gain
    ? "0,20 10,16 20,18 30,10 40,12 50,6 60,2"
    : "0,4 10,8 20,6 30,12 40,10 50,16 60,20";
  return (
    <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
      <polyline points={pts} stroke={gain ? GREEN : RED} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Wallet() {
  const { data: balance, isLoading: bl, refetch: refetchBalance } = useGetUserBalance();
  const { data: txData, isLoading: txl, refetch: refetchTx } = useGetTransactions({ limit: 20 });
  const createTx = useCreateTransaction();

  const [mode, setMode] = useState<"idle" | "deposit" | "withdraw">("idle");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fmt  = (n: number) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";
  const fmt0 = (n: number) => n?.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || "0";

  const totalValue  = balance?.totalPortfolioValue || 0;
  const invested    = totalValue - (balance?.availableCash || 0);
  const available   = balance?.availableCash || 0;

  const PRESETS = [100, 500, 5000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: mode === "deposit" ? "deposit" : "withdraw", amount: amt } });
      toast.success(mode === "deposit" ? `$${fmt(amt)} deposited` : `$${fmt(amt)} withdrawal initiated`);
      setAmount(""); setMode("idle");
      refetchBalance(); refetchTx();
    } catch (err: any) {
      toast.error(err.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "28px 24px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page label ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Funds</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Wallet</h1>
        </div>

        {/* ── Portfolio hero card ── */}
        <div style={{
          borderRadius: 24, overflow: "hidden", marginBottom: 24,
          background: "linear-gradient(135deg,#3b30a8 0%,#2563eb 55%,#1e40af 100%)",
          padding: "28px 32px",
          boxShadow: "0 8px 40px rgba(59,130,246,0.24)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Portfolio</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Holding value</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: "-1px", fontFamily: "monospace", marginBottom: 20 }}>
              ${bl ? "—" : fmt0(totalValue)}
            </div>
            <div style={{ display: "flex", gap: 40 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>${bl ? "—" : fmt0(invested)}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Invested value</div>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>${bl ? "—" : fmt0(available)}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Deposit / Withdraw toggles ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setMode(mode === "deposit" ? "idle" : "deposit")} style={{
            flex: 1, padding: "13px 0", borderRadius: 99, fontSize: 13, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: mode === "deposit" ? BLUE : "rgba(59,130,246,0.1)",
            color: mode === "deposit" ? "#fff" : BLUE,
            border: `1px solid ${mode === "deposit" ? BLUE : "rgba(59,130,246,0.25)"}`,
            transition: "all 0.14s",
          }}>
            <ArrowDownToLine style={{ width: 15, height: 15 }} strokeWidth={2} />
            Deposit
          </button>
          <button onClick={() => setMode(mode === "withdraw" ? "idle" : "withdraw")} style={{
            flex: 1, padding: "13px 0", borderRadius: 99, fontSize: 13, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: mode === "withdraw" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
            color: mode === "withdraw" ? TEXT : MUTED,
            border: `1px solid ${mode === "withdraw" ? "rgba(255,255,255,0.2)" : BORD}`,
            transition: "all 0.14s",
          }}>
            <ArrowUpFromLine style={{ width: 15, height: 15 }} strokeWidth={2} />
            Withdraw
          </button>
        </div>

        {/* ── Transaction form (when active) ── */}
        {mode !== "idle" && (
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, padding: "24px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              {mode === "deposit" ? "Fund your account" : "Withdraw funds"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 20 }}>
              Enter Amount in USD
            </div>

            <form onSubmit={handleSubmit}>
              {/* Large amount display */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span style={{ fontSize: 20, color: MUTED, fontWeight: 600 }}>$</span>
                  <input
                    type="number" min="1" step="0.01" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    style={{
                      fontSize: 48, fontWeight: 800, color: TEXT, fontFamily: "monospace",
                      background: "none", border: "none", outline: "none",
                      width: "200px", textAlign: "center",
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                  {mode === "withdraw" ? `Min $100 — Max $10,000` : `Min $10`}
                </div>
                {mode === "withdraw" && (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 600 }}>
                    Current Balance: ${fmt(available)}
                  </div>
                )}
              </div>

              {/* Preset chips */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                {PRESETS.map((p) => (
                  <button key={p} type="button" onClick={() => setAmount(String(p))} style={{
                    padding: "6px 18px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: parseFloat(amount) === p ? BLUE : "rgba(255,255,255,0.06)",
                    color: parseFloat(amount) === p ? "#fff" : MUTED,
                    border: `1px solid ${parseFloat(amount) === p ? BLUE : BORD}`,
                    transition: "all 0.12s",
                  }}>${p}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button type="submit" disabled={submitting} style={{
                  width: "100%", padding: "13px", background: BLUE, color: "#fff",
                  border: "none", borderRadius: 99, fontSize: 13, fontWeight: 700,
                  cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.14s",
                }}>
                  {submitting
                    ? <><Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Processing…</>
                    : `Confirm ${mode === "deposit" ? "Deposit" : "Withdrawal"}`}
                </button>
                <button type="button" onClick={() => { setMode("idle"); setAmount(""); }} style={{
                  width: "100%", padding: "13px",
                  background: "rgba(255,255,255,0.04)", color: MUTED,
                  border: `1px solid ${BORD}`, borderRadius: 99, fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ── Two column: featured + balance breakdown ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="wallet-grid">
          {/* Featured mini-charts */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, padding: "18px 0", overflow: "hidden" }}>
            <div style={{ padding: "0 20px 14px", borderBottom: `1px solid ${BORD}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase" }}>Watching</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {FEATURED_ASSETS.map((a, i) => (
                <div key={a.symbol} style={{
                  padding: "16px 20px",
                  borderRight: i % 2 === 0 ? `1px solid ${BORD}` : "none",
                  borderBottom: i < 2 ? `1px solid ${BORD}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <AssetIcon symbol={a.symbol} size={22} borderRadius={5} />
                    <span style={{ fontSize: 11, color: MUTED }}>{a.name}</span>
                  </div>
                  <MiniSparkline gain={a.gain} />
                  <div style={{ fontSize: 12, color: a.gain ? GREEN : RED, fontWeight: 700, marginTop: 4 }}>
                    {a.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balance breakdown */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${BORD}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase" }}>Allocation</div>
            </div>
            {[
              { label: "Available Cash",  value: balance?.availableCash || 0,     color: BLUE   },
              { label: "Equities",        value: balance?.stockBalance || 0,      color: GREEN  },
              { label: "Crypto",          value: balance?.cryptoBalance || 0,     color: "#a78bfa" },
              { label: "Commodities",     value: balance?.commodityBalance || 0,  color: "#f59e0b" },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 20px",
                borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: TEXT, fontWeight: 500 }}>{row.label}</span>
                {bl ? <Loader2 style={{ width: 12, height: 12, color: MUTED, animation: "spin 1s linear infinite" }} />
                  : <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>${fmt(row.value)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Transaction ledger ── */}
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 3 }}>History</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Transaction Ledger</div>
            </div>
            <button onClick={() => { refetchTx(); refetchBalance(); }} style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${BORD}`,
              borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <RefreshCw style={{ width: 13, height: 13, color: MUTED }} strokeWidth={1.5} />
            </button>
          </div>

          {txl ? (
            <div style={{ padding: "48px 0", display: "flex", justifyContent: "center" }}>
              <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}`, background: CARD2 }}>
                    {["Date", "Type", "Instrument", "Qty", "Price", "Amount", "Status"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 16px",
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED,
                        textAlign: h === "Date" || h === "Type" || h === "Instrument" ? "left" : h === "Status" ? "right" : "right",
                        paddingLeft: h === "Date" ? 24 : 16,
                        paddingRight: h === "Status" ? 24 : 16,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txData?.transactions?.map((tx) => {
                    const isBuy     = tx.type === "buy";
                    const isSell    = tx.type === "sell";
                    const isDeposit = tx.type === "deposit";
                    const sc        = STATUS_COLOR[tx.status] || MUTED;
                    return (
                      <tr key={tx.id} style={{ borderBottom: `1px solid ${BORD}`, transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "13px 16px 13px 24px", fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: TEXT }}>
                            {isBuy     && <TrendingUp   style={{ width: 12, height: 12, color: GREEN, opacity: 0.7 }} strokeWidth={1.5} />}
                            {isSell    && <TrendingDown  style={{ width: 12, height: 12, color: RED,   opacity: 0.7 }} strokeWidth={1.5} />}
                            {isDeposit && <ArrowDownToLine style={{ width: 12, height: 12, color: BLUE,  opacity: 0.7 }} strokeWidth={1.5} />}
                            {!isBuy && !isSell && !isDeposit && <ArrowUpFromLine style={{ width: 12, height: 12, color: MUTED }} strokeWidth={1.5} />}
                            {TX_LABELS[tx.type] || tx.type}
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: 11, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>{tx.symbol || "USD"}</td>
                        <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{tx.quantity || "—"}</td>
                        <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                          {tx.price ? `$${parseFloat(String(tx.price)).toLocaleString()}` : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
                          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "13px 24px 13px 16px", textAlign: "right" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: sc, fontWeight: 600 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc, flexShrink: 0, display: "inline-block" }} />
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!txData?.transactions?.length && (
                    <tr>
                      <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center", fontSize: 12, color: MUTED }}>
                        No transactions on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .wallet-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
