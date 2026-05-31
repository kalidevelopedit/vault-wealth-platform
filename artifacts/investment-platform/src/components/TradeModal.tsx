import { useState } from "react";
import {
  useCreateTransaction, useGetUserBalance,
  getGetUserBalanceQueryKey, getGetPortfolioSummaryQueryKey,
  getGetHoldingsQueryKey, getGetTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { AssetIcon } from "@/components/AssetIcon";
import { X, TrendingUp, TrendingDown, AlertCircle, Clock, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface TradeAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent24h: number;
}

interface Props {
  asset: TradeAsset | null;
  defaultSide?: "buy" | "sell";
  onClose: () => void;
}

type FundingCurrency = "USD" | "USDT" | "USDC";

const FUNDING_OPTIONS: { id: FundingCurrency; label: string; fee: number; desc: string }[] = [
  { id: "USD",  label: "USD Balance",  fee: 0,    desc: "Your available fiat balance — no conversion fee" },
  { id: "USDT", label: "USDT",         fee: 0.001, desc: "Tether USD stablecoin — 0.1% swap fee" },
  { id: "USDC", label: "USDC",         fee: 0.001, desc: "USD Coin stablecoin — 0.1% swap fee" },
];

const fmt2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (n: number) =>
  n < 0.01 ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
           : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TradeModal({ asset, defaultSide = "buy", onClose }: Props) {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg, bg: BG } = colors;

  const [side, setSide]           = useState<"buy" | "sell">(defaultSide);
  const [step, setStep]           = useState<"funding" | "amount">(defaultSide === "buy" ? "funding" : "amount");
  const [funding, setFunding]     = useState<FundingCurrency>("USD");
  const [amount, setAmount]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);

  const queryClient   = useQueryClient();
  const { data: balance } = useGetUserBalance();
  const createTx      = useCreateTransaction();

  const availableCash = Number(balance?.availableCash) || 0;
  const amtNum        = parseFloat(amount) || 0;
  const feeOpt        = FUNDING_OPTIONS.find(f => f.id === funding)!;
  const feeAmount     = amtNum * feeOpt.fee;
  const netAmount     = amtNum - feeAmount;
  const estQty        = asset && asset.currentPrice > 0 ? netAmount / asset.currentPrice : 0;
  const insufficient  = side === "buy" && amtNum > availableCash && amtNum > 0;

  if (!asset) return null;

  const pos = asset.changePercent24h >= 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amtNum || amtNum <= 0) { toast.error("Enter a valid amount"); return; }
    if (side === "buy" && amtNum > availableCash) {
      toast.error(`Insufficient funds — available: $${fmt2(availableCash)}`);
      return;
    }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({
        data: {
          type: side,
          symbol: asset.symbol,
          amount: amtNum,
          ...(side === "buy" ? {
            fundingCurrency: funding,
            swapFee: feeAmount,
          } as any : {}),
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() }),
      ]);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setAmount(""); onClose(); }, 2400);
    } catch (err: any) {
      toast.error(err?.message || "Order failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: CARD, border: `1px solid ${BORD}`, borderRadius: 20,
          width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === "amount" && side === "buy" && (
              <button onClick={() => setStep("funding")} style={{
                width: 28, height: 28, borderRadius: 8, background: inputBg,
                border: `1px solid ${BORD}`, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: MUTED, marginRight: 2,
              }}>
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
            )}
            <AssetIcon symbol={asset.symbol} size={32} borderRadius="50%" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{asset.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                <span style={{ fontSize: 13, color: MUTED, fontFamily: "monospace" }}>${fmtPrice(asset.currentPrice)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pos ? GREEN : RED, display: "flex", alignItems: "center", gap: 2 }}>
                  {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {pos ? "+" : ""}{asset.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, background: inputBg,
            border: `1px solid ${BORD}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: MUTED,
          }}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
              background: side === "buy" ? "rgba(234,179,8,0.1)" : "rgba(14,203,129,0.1)",
              border: `2px solid ${side === "buy" ? "#eab308" : GREEN}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Clock size={28} style={{ color: side === "buy" ? "#eab308" : GREEN }} strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
              {side === "buy" ? "Order Pending Review" : "Sell Order Placed"}
            </div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
              {side === "buy"
                ? `Your order to buy ${asset.symbol} with ${funding} is under review. You will be notified once approved.`
                : `Sold $${fmt2(amtNum)} of ${asset.symbol} successfully.`}
            </div>
            {side === "buy" && (
              <div style={{
                marginTop: 16, padding: "10px 16px", borderRadius: 10,
                background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)",
                fontSize: 12, color: "#eab308",
              }}>
                ⏳ Orders are typically processed within 24 hours
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleTrade} style={{ padding: 20 }}>
            {/* Buy / Sell toggle */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
              background: BG, borderRadius: 12, padding: 4,
              border: `1px solid ${BORD}`, marginBottom: 18,
            }}>
              {(["buy", "sell"] as const).map(s => (
                <button key={s} type="button" onClick={() => {
                  setSide(s);
                  setStep(s === "buy" ? "funding" : "amount");
                  setAmount("");
                }} style={{
                  height: 38, borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13.5, fontWeight: 700, transition: "all 0.15s",
                  background: side === s ? (s === "buy" ? GREEN : RED) : "transparent",
                  color: side === s ? "#fff" : MUTED,
                  boxShadow: side === s ? `0 2px 10px ${s === "buy" ? "rgba(14,203,129,0.28)" : "rgba(246,70,93,0.28)"}` : "none",
                }}>{s === "buy" ? "Buy" : "Sell"}</button>
              ))}
            </div>

            {/* ── STEP 1: Funding currency (buy only) ── */}
            {side === "buy" && step === "funding" && (
              <div>
                <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }}>
                  Select Funding Source
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {FUNDING_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFunding(opt.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "13px 16px", borderRadius: 12, cursor: "pointer",
                        background: funding === opt.id ? "rgba(37,99,255,0.08)" : inputBg,
                        border: `1.5px solid ${funding === opt.id ? BLUE : BORD}`,
                        transition: "all 0.12s", textAlign: "left",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: funding === opt.id ? "rgba(37,99,255,0.15)" : "rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 800,
                            color: funding === opt.id ? BLUE : MUTED,
                          }}>
                            {opt.id === "USD" ? "$" : opt.id.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{opt.label}</div>
                            {opt.id === "USD" && (
                              <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                                Balance: <span style={{ color: TEXT, fontWeight: 600, fontFamily: "monospace" }}>${fmt2(availableCash)}</span>
                              </div>
                            )}
                            {opt.id !== "USD" && (
                              <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{opt.desc}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {opt.fee > 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: "#eab308",
                            background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)",
                            borderRadius: 6, padding: "3px 7px",
                          }}>
                            {(opt.fee * 100).toFixed(1)}% fee
                          </span>
                        )}
                        {opt.fee === 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: GREEN,
                            background: "rgba(14,203,129,0.08)", border: "1px solid rgba(14,203,129,0.2)",
                            borderRadius: 6, padding: "3px 7px",
                          }}>
                            No fee
                          </span>
                        )}
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2px solid ${funding === opt.id ? BLUE : BORD}`,
                          background: funding === opt.id ? BLUE : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {funding === opt.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{
                  padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                  background: "rgba(37,99,255,0.04)", border: `1px solid rgba(37,99,255,0.12)`,
                  fontSize: 12, color: MUTED, lineHeight: 1.6,
                }}>
                  💡 All buy orders are processed within 24 hours after submission. Your funds are reserved during review.
                </div>

                <button
                  type="button"
                  onClick={() => setStep("amount")}
                  style={{
                    width: "100%", height: 48, borderRadius: 12, border: "none",
                    fontSize: 14, fontWeight: 700, color: "#fff",
                    background: BLUE, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 4px 18px rgba(37,99,255,0.3)",
                  }}
                >
                  Continue with {funding} <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            )}

            {/* ── STEP 2: Amount ── */}
            {(step === "amount" || side === "sell") && (
              <>
                {/* Funding badge (buy only) */}
                {side === "buy" && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 10, background: BG,
                    border: `1px solid ${BORD}`, marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 12, color: MUTED }}>Funding with</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{funding}</span>
                      {feeOpt.fee > 0 && (
                        <span style={{ fontSize: 10, color: "#eab308" }}>0.1% swap fee</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Balance strip */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: 10, background: BG,
                  border: `1px solid ${BORD}`, marginBottom: 16,
                }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Available balance</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, fontFamily: "monospace",
                    color: insufficient ? RED : TEXT,
                  }}>
                    ${fmt2(availableCash)}
                  </span>
                </div>

                {/* Amount input */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 7, letterSpacing: "0.06em", fontWeight: 500 }}>
                    AMOUNT ({funding})
                  </div>
                  <div style={{
                    height: 50, borderRadius: 10, padding: "0 14px",
                    display: "flex", alignItems: "center", gap: 8,
                    border: `1.5px solid ${insufficient ? RED : amtNum > 0 ? BLUE : BORD}`,
                    background: inputBg, transition: "border-color 0.15s",
                  }}>
                    <span style={{ fontSize: 17, color: MUTED, flexShrink: 0 }}>$</span>
                    <input
                      autoFocus
                      type="number"
                      value={amount}
                      min={0}
                      step="any"
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        background: "transparent", border: "none", outline: "none",
                        color: TEXT, fontSize: 18, fontWeight: 600, width: "100%",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>

                  {/* Swap breakdown (buy with fee) */}
                  {side === "buy" && amtNum > 0 && feeOpt.fee > 0 && (
                    <div style={{
                      marginTop: 8, padding: "10px 12px", borderRadius: 9,
                      background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.15)",
                      fontSize: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, marginBottom: 4 }}>
                        <span>You send</span>
                        <span style={{ color: TEXT, fontFamily: "monospace" }}>${fmt2(amtNum)} {funding}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, marginBottom: 4 }}>
                        <span>Swap fee (0.1%)</span>
                        <span style={{ color: "#eab308", fontFamily: "monospace" }}>−${fmt2(feeAmount)}</span>
                      </div>
                      <div style={{ height: 1, background: BORD, margin: "6px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: MUTED }}>Net to invest</span>
                        <span style={{ color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>${fmt2(netAmount)} USD</span>
                      </div>
                    </div>
                  )}

                  {/* Estimated qty */}
                  {amtNum > 0 && estQty > 0 && (
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 6, textAlign: "right", fontFamily: "monospace" }}>
                      ≈ {estQty < 0.0001 ? estQty.toFixed(8) : estQty.toFixed(6)} {asset.symbol}
                    </div>
                  )}

                  {/* Insufficient error */}
                  {insufficient && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, color: RED, fontSize: 12 }}>
                      <AlertCircle size={12} strokeWidth={2} />
                      Insufficient funds — you need ${fmt2(amtNum - availableCash)} more
                    </div>
                  )}
                </div>

                {/* Preset buttons */}
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct} type="button"
                      onClick={() => setAmount(((availableCash * pct) / 100).toFixed(2))}
                      style={{
                        flex: 1, height: 30, fontSize: 12, borderRadius: 8,
                        background: "transparent", border: `1px solid ${BORD}`,
                        color: MUTED, cursor: "pointer", fontWeight: 500,
                        transition: "all 0.1s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = TEXT; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.color = MUTED; }}
                    >{pct}%</button>
                  ))}
                </div>

                {/* Summary */}
                {amtNum > 0 && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: side === "buy" ? "rgba(14,203,129,0.06)" : "rgba(246,70,93,0.06)",
                    border: `1px solid ${side === "buy" ? "rgba(14,203,129,0.18)" : "rgba(246,70,93,0.18)"}`,
                    marginBottom: 14,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{side === "buy" ? "Total cost" : "You receive"}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: side === "buy" ? GREEN : RED, fontFamily: "monospace" }}>
                        ${fmt2(amtNum)}
                      </span>
                    </div>
                    {side === "buy" && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: MUTED }}>Status after submission</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#eab308" }}>⏳ Pending Review</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || insufficient || !amtNum}
                  style={{
                    width: "100%", height: 48, borderRadius: 12, border: "none",
                    fontSize: 15, fontWeight: 700, color: "#fff",
                    background: side === "buy" ? GREEN : RED,
                    cursor: submitting || insufficient || !amtNum ? "not-allowed" : "pointer",
                    opacity: submitting || !amtNum ? 0.65 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: !submitting && amtNum && !insufficient
                      ? `0 4px 18px ${side === "buy" ? "rgba(14,203,129,0.35)" : "rgba(246,70,93,0.35)"}`
                      : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {submitting
                    ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing…</>
                    : side === "buy"
                      ? `Submit Buy Order — ${asset.symbol}`
                      : `Sell ${asset.symbol}`
                  }
                </button>

                {side === "buy" && (
                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: MUTED }}>
                    Orders are reviewed and processed within 24 hours
                  </div>
                )}
              </>
            )}
          </form>
        )}

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
