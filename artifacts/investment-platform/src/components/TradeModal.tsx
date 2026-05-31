import { useState } from "react";
import {
  useCreateTransaction, useGetUserBalance,
  getGetUserBalanceQueryKey, getGetPortfolioSummaryQueryKey,
  getGetHoldingsQueryKey, getGetTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { AssetIcon } from "@/components/AssetIcon";
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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

const fmt2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (n: number) =>
  n < 0.01 ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
           : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TradeModal({ asset, defaultSide = "buy", onClose }: Props) {
  const { colors, mode } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg, bg: BG } = colors;

  const [side, setSide]       = useState<"buy" | "sell">(defaultSide);
  const [amount, setAmount]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();
  const { data: balance }  = useGetUserBalance();
  const createTx           = useCreateTransaction();

  const availableCash = Number(balance?.availableCash) || 0;
  const amtNum        = parseFloat(amount) || 0;
  const estQty        = asset && asset.currentPrice > 0 ? amtNum / asset.currentPrice : 0;
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
      await createTx.mutateAsync({ data: { type: side, symbol: asset.symbol, amount: amtNum } });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() }),
      ]);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setAmount(""); onClose(); }, 1800);
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
          width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            display: "flex", alignItems: "center", justifyContent: "center",
            color: MUTED,
          }}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <CheckCircle2 size={44} style={{ color: GREEN, margin: "0 auto 16px", display: "block" }} strokeWidth={1.5} />
            <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Order Placed!</div>
            <div style={{ fontSize: 13, color: MUTED }}>
              {side === "buy" ? "Bought" : "Sold"} ${fmt2(amtNum)} of {asset.symbol}
            </div>
          </div>
        ) : (
          <form onSubmit={handleTrade} style={{ padding: 20 }}>
            {/* Buy / Sell toggle */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
              background: BG, borderRadius: 12, padding: 4,
              border: `1px solid ${BORD}`, marginBottom: 20,
            }}>
              {(["buy", "sell"] as const).map(s => (
                <button key={s} type="button" onClick={() => setSide(s)} style={{
                  height: 38, borderRadius: 9, border: "none", cursor: "pointer",
                  fontSize: 13.5, fontWeight: 700, transition: "all 0.15s",
                  background: side === s ? (s === "buy" ? GREEN : RED) : "transparent",
                  color: side === s ? "#fff" : MUTED,
                  boxShadow: side === s ? `0 2px 10px ${s === "buy" ? "rgba(14,203,129,0.28)" : "rgba(246,70,93,0.28)"}` : "none",
                }}>{s === "buy" ? "Buy" : "Sell"}</button>
              ))}
            </div>

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
                AMOUNT (USD)
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
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
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

            {/* Summary line */}
            {amtNum > 0 && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: side === "buy" ? "rgba(14,203,129,0.06)" : "rgba(246,70,93,0.06)",
                border: `1px solid ${side === "buy" ? "rgba(14,203,129,0.18)" : "rgba(246,70,93,0.18)"}`,
                marginBottom: 16,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: MUTED }}>
                  {side === "buy" ? "You pay" : "You receive"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: side === "buy" ? GREEN : RED, fontFamily: "monospace" }}>
                  ${fmt2(amtNum)}
                </span>
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
                : `${side === "buy" ? "Buy" : "Sell"} ${asset.symbol}`
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
