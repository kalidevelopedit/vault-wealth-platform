import { useState, useEffect } from "react";
import { useListAssets, useGetUserBalance, useCreateTransaction } from "@workspace/api-client-react";
import { ArrowUpDown, Loader2, ChevronDown } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";

const BG    = "#050505";
const CARD   = "#0C0F14";
const BORD   = "rgba(255,255,255,0.08)";
const TEXT   = "rgba(255,255,255,0.96)";
const MUTED  = "rgba(255,255,255,0.45)";
const BLUE   = "#2563FF";
const GREEN  = "#4ade80";

const fmt = (n: number, d = 6) =>
  n < 0.001 ? n.toExponential(2) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: d });

function AssetSelector({ value, onChange, assets, label }: {
  value: string; onChange: (v: string) => void;
  assets: any[]; label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = assets.find(a => a.symbol === value);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", height: 52, background: "#11141A", border: `1px solid ${BORD}`,
        borderRadius: 12, padding: "0 16px", display: "flex", alignItems: "center",
        gap: 10, cursor: "pointer", color: TEXT,
      }}>
        {selected ? (
          <>
            <AssetIcon symbol={selected.symbol} size={24} />
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: "left" }}>{selected.symbol}</span>
            <span style={{ fontSize: 12, color: MUTED }}>{selected.name}</span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: MUTED, flex: 1, textAlign: "left" }}>Select asset</span>
        )}
        <ChevronDown style={{ width: 16, height: 16, color: MUTED, flexShrink: 0 }} strokeWidth={1.5} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#111418", border: `1px solid ${BORD}`, borderRadius: 12,
          overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", maxHeight: 280, overflowY: "auto",
        }}>
          {assets.slice(0, 30).map(a => (
            <button key={a.symbol} onClick={() => { onChange(a.symbol); setOpen(false); }} style={{
              width: "100%", padding: "12px 16px", background: "transparent", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: TEXT,
              transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <AssetIcon symbol={a.symbol} size={28} />
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.symbol}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{a.name}</div>
              </div>
              <div style={{ fontSize: 13, fontFamily: "monospace", color: MUTED }}>${fmt(a.currentPrice, 2)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Convert() {
  const { data: allAssets } = useListAssets();
  const { data: balance } = useGetUserBalance();
  const createTx = useCreateTransaction();

  const [fromSym, setFromSym] = useState("BTC");
  const [toSym, setToSym] = useState("ETH");
  const [fromAmt, setFromAmt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ from: string; to: string; fromAmt: number; toAmt: number } | null>(null);

  const assets = allAssets || [];
  const fromAsset = assets.find(a => a.symbol === fromSym);
  const toAsset   = assets.find(a => a.symbol === toSym);

  const rate = fromAsset && toAsset ? fromAsset.currentPrice / toAsset.currentPrice : 0;
  const toAmt = parseFloat(fromAmt) > 0 && rate > 0 ? parseFloat(fromAmt) * rate : 0;
  const usdValue = parseFloat(fromAmt) > 0 && fromAsset ? parseFloat(fromAmt) * fromAsset.currentPrice : 0;

  const swap = () => { setFromSym(toSym); setToSym(fromSym); setFromAmt(""); };

  const handleConvert = async () => {
    const amt = parseFloat(fromAmt);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (!fromAsset || !toAsset) return toast.error("Select assets to convert");
    if (fromSym === toSym) return toast.error("Select different assets");
    const availableCash = balance?.availableCash || 0;
    if (usdValue > availableCash) {
      return toast.error(`Insufficient funds — available: $${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
    }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({
        data: {
          type: "convert" as any,
          amount: usdValue,
          assetSymbol: fromSym,
          notes: `Convert ${amt} ${fromSym} → ${toAmt.toFixed(6)} ${toSym}`,
        },
      });
      setSuccess({ from: fromSym, to: toSym, fromAmt: amt, toAmt });
      setFromAmt("");
      toast.success(`Converted ${amt} ${fromSym} → ${toAmt.toFixed(6)} ${toSym}`);
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const RECENT_PAIRS = [
    { from: "BTC", to: "ETH" },
    { from: "ETH", to: "USDT" },
    { from: "SOL", to: "BTC" },
    { from: "BNB", to: "USDC" },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Convert</h1>
      <p style={{ fontSize: 14, color: MUTED, marginBottom: 32 }}>Swap between any two assets instantly at market rate.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Card */}
        <div className="lg:col-span-2">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 24 }}>Swap Assets</div>

            {/* From */}
            <AssetSelector label="FROM" value={fromSym} onChange={setFromSym} assets={assets} />

            <div style={{ marginTop: 12, position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: "0.06em", marginBottom: 8 }}>AMOUNT</div>
              <input
                type="number"
                value={fromAmt}
                onChange={e => setFromAmt(e.target.value)}
                placeholder="0.00"
                min={0}
                style={{
                  width: "100%", height: 52, background: "#11141A", border: `1px solid ${BORD}`,
                  borderRadius: 12, padding: "0 16px", color: TEXT, fontSize: 18, fontWeight: 600,
                  outline: "none", boxSizing: "border-box", fontFamily: "monospace",
                }}
              />
              {fromAsset && parseFloat(fromAmt) > 0 && (
                <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>≈ ${fmt(usdValue, 2)} USD</div>
              )}
            </div>

            {/* Swap Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: BORD }} />
              <button onClick={swap} style={{
                width: 40, height: 40, borderRadius: "50%", background: "#191F28",
                border: `1px solid ${BORD}`, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: MUTED, transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = BLUE; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#191F28"; e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORD; }}
              >
                <ArrowUpDown style={{ width: 16, height: 16 }} strokeWidth={2} />
              </button>
              <div style={{ flex: 1, height: 1, background: BORD }} />
            </div>

            {/* To */}
            <AssetSelector label="TO" value={toSym} onChange={setToSym} assets={assets} />

            {rate > 0 && toAmt > 0 && (
              <div style={{
                marginTop: 16, padding: "14px 18px", background: "rgba(37,99,255,0.07)",
                border: "1px solid rgba(37,99,255,0.15)", borderRadius: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 13, color: MUTED }}>You will receive</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
                  {fmt(toAmt)} <span style={{ color: BLUE }}>{toSym}</span>
                </div>
              </div>
            )}

            {/* Rate info */}
            {fromAsset && toAsset && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: 8, borderTop: `1px solid ${BORD}` }}>
                <span style={{ fontSize: 12, color: MUTED }}>Exchange Rate</span>
                <span style={{ fontSize: 12, color: TEXT, fontFamily: "monospace" }}>
                  1 {fromSym} = {fmt(rate)} {toSym}
                </span>
              </div>
            )}

            {(() => {
              const avail = balance?.availableCash || 0;
              const insufficient = usdValue > avail && usdValue > 0;
              return (
                <>
                  {insufficient && (
                    <div style={{ fontSize: 12, color: "#f6465d", marginTop: 8, textAlign: "right" }}>
                      Insufficient funds — available: ${avail.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  )}
                  <button
                    onClick={handleConvert}
                    disabled={!fromAmt || submitting || insufficient}
                    style={{
                      width: "100%", height: 52, background: BLUE, border: "none", borderRadius: 12,
                      color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16,
                      opacity: !fromAmt || submitting || insufficient ? 0.5 : 1, transition: "opacity 0.15s",
                    }}
                  >
                    {submitting ? "Processing..." : "Convert Now"}
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Available Balance */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Available Cash</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>
              ${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Quick Pairs */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 16 }}>Popular Pairs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {RECENT_PAIRS.map(p => {
                const fa = assets.find(a => a.symbol === p.from);
                const ta = assets.find(a => a.symbol === p.to);
                const r = fa && ta ? fa.currentPrice / ta.currentPrice : null;
                return (
                  <button key={`${p.from}-${p.to}`}
                    onClick={() => { setFromSym(p.from); setToSym(p.to); }}
                    style={{
                      width: "100%", padding: "10px 14px", background: fromSym === p.from && toSym === p.to ? "rgba(37,99,255,0.1)" : "#11141A",
                      border: fromSym === p.from && toSym === p.to ? "1px solid rgba(37,99,255,0.3)" : `1px solid ${BORD}`,
                      borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                    }}>
                    <div style={{ display: "flex", gap: -6, alignItems: "center" }}>
                      <AssetIcon symbol={p.from} size={22} />
                      <AssetIcon symbol={p.to} size={22} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{p.from}/{p.to}</div>
                      {r && <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>1:{fmt(r, 4)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fee Info */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Conversion Details</div>
            {[
              { label: "Conversion Fee", value: "0.10%" },
              { label: "Processing Time", value: "Instant" },
              { label: "Min. Amount", value: "$10.00" },
              { label: "Daily Limit", value: "$250,000" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORD}` }}>
                <span style={{ fontSize: 12, color: MUTED }}>{item.label}</span>
                <span style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
