import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetUserBalance, getGetUserBalanceQueryKey } from "@workspace/api-client-react";
import { TrendingUp, Clock, DollarSign, Loader2, CheckCircle, AlertCircle, ChevronRight, Zap, X, TrendingDown, BarChart2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

const TIERS = [
  { level: "bronze",   label: "Bronze",   minAmount: 500,    maxAmount: 2500,   apy24h: 1,   apy7d: 3,  apy14d: 7,  color: "#cd7f32", glow: "rgba(205,127,50,0.2)",  icon: "🥉", desc: "Entry-level wealth building" },
  { level: "silver",   label: "Silver",   minAmount: 2500,   maxAmount: 10000,  apy24h: 1.5, apy7d: 5,  apy14d: 11, color: "#c0c0c0", glow: "rgba(192,192,192,0.2)", icon: "🥈", desc: "Accelerated growth tier" },
  { level: "gold",     label: "Gold",     minAmount: 10000,  maxAmount: 50000,  apy24h: 2,   apy7d: 7,  apy14d: 16, color: "#ffd700", glow: "rgba(255,215,0,0.2)",   icon: "🥇", desc: "Premium yield generation" },
  { level: "platinum", label: "Platinum", minAmount: 50000,  maxAmount: 250000, apy24h: 3,   apy7d: 10, apy14d: 22, color: "#e5e4e2", glow: "rgba(229,228,226,0.2)", icon: "💎", desc: "Institutional-grade returns" },
  { level: "titanium", label: "Titanium", minAmount: 250000, maxAmount: null,   apy24h: 4,   apy7d: 14, apy14d: 30, color: "#a8d8ea", glow: "rgba(168,216,234,0.2)", icon: "🚀", desc: "Elite performance tier" },
];

const durLabel = (d: number) => (d === 1 ? "24 Hours" : `${d} Days`);

const fmt2 = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

function Countdown({ maturesAt }: { maturesAt: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = new Date(maturesAt).getTime() - Date.now();
  if (diff <= 0) return <span style={{ color: "#22c55e", fontWeight: 700 }}>Ready to Claim</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
      {d > 0 ? `${d}d ` : ""}{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export default function WealthBuilder() {
  const { colors } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg } = colors;

  const qc = useQueryClient();
  const { data: balance } = useGetUserBalance();
  const availableCash = Number(balance?.availableCash) || 0;

  const [selectedTier, setSelectedTier]       = useState<string | null>(null);
  const [duration, setDuration]               = useState<1 | 7 | 14>(14);
  const [detailId, setDetailId]               = useState<number | null>(null);
  const [amount, setAmount]                   = useState("");
  const [showKraken, setShowKraken]           = useState(false);
  const [investing, setInvesting]             = useState(false);
  const [cashingOut, setCashingOut]           = useState<number | null>(null);

  const tier = TIERS.find(t => t.level === selectedTier);
  const amtNum = parseFloat(amount) || 0;
  const apy = tier ? (duration === 1 ? tier.apy24h : duration === 7 ? tier.apy7d : tier.apy14d) : 0;
  const expectedReturn = (amtNum * apy) / 100;
  const totalPayout = amtNum + expectedReturn;

  const investmentsQuery = useQuery({
    queryKey: ["wealth-builder", "investments"],
    queryFn: async () => {
      const res = await fetch("/api/wealth-builder/investments", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load investments");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const activeInvestments = (investmentsQuery.data || []).filter((i: any) => i.status !== "withdrawn");
  const pastInvestments   = (investmentsQuery.data || []).filter((i: any) => i.status === "withdrawn");

  async function handleInvest(e: React.FormEvent) {
    e.preventDefault();
    if (!tier) return;
    if (amtNum < tier.minAmount) {
      toast.error(`Minimum for ${tier.label} is $${fmt0(tier.minAmount)}`);
      return;
    }
    if (tier.maxAmount && amtNum > tier.maxAmount) {
      toast.error(`Maximum for ${tier.label} is $${fmt0(tier.maxAmount)}`);
      return;
    }
    if (amtNum > availableCash) {
      if (amtNum >= 10000) setShowKraken(true);
      else toast.error("Insufficient available balance");
      return;
    }
    setInvesting(true);
    try {
      const res = await fetch("/api/wealth-builder/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ level: tier.level, amount: amtNum, durationDays: duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Investment failed");
      toast.success(`${tier.label} plan activated! $${fmt0(amtNum)} invested for ${duration === 1 ? "24 hours" : `${duration} days`}.`);
      setAmount("");
      setSelectedTier(null);
      qc.invalidateQueries({ queryKey: ["wealth-builder", "investments"] });
      qc.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() });
    } catch (err: any) {
      toast.error(err.message || "Investment failed");
    } finally {
      setInvesting(false);
    }
  }

  async function handleCashout(invId: number) {
    setCashingOut(invId);
    try {
      const res = await fetch(`/api/wealth-builder/cashout/${invId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cashout failed");
      toast.success(`Cashed out! $${fmt2(data.total)} added to your balance.`);
      qc.invalidateQueries({ queryKey: ["wealth-builder", "investments"] });
      qc.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCashingOut(null);
    }
  }

  const inputSx: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 9,
    border: `1px solid ${BORD}`, background: inputBg, color: TEXT,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div className="app-page-inner" style={{ background: BG, minHeight: "100vh", padding: "28px 24px", maxWidth: 980, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{
        borderRadius: 20, overflow: "hidden", marginBottom: 32,
        background: "linear-gradient(135deg, #1a1040 0%, #0f1e3d 55%, #0d1520 100%)",
        border: `1px solid rgba(37,99,255,0.2)`,
        boxShadow: "0 8px 40px rgba(37,99,255,0.15)",
        padding: "40px 40px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: "40%", height: "100%",
          background: "radial-gradient(circle at 80% 50%, rgba(37,99,255,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(37,99,255,0.2)", border: "1px solid rgba(37,99,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={24} style={{ color: BLUE }} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 2 }}>
              Vault Wealth
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>
              Wealth Builder
            </h1>
          </div>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 520, lineHeight: 1.65, margin: "0 0 24px" }}>
          Grow your capital with structured yield plans. Choose a tier that matches your portfolio size and lock in returns for 24 hours, 7 or 14 days.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Available Balance</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>${fmt2(availableCash)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Active Plans</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{activeInvestments.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Max Returns</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>Up to 30%</div>
          </div>
        </div>
      </div>

      {/* Tiers grid */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Investment Tiers
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: 12, marginBottom: 32,
      }}>
        {TIERS.map(t => {
          const sel = selectedTier === t.level;
          const d14apy = t.apy14d;
          return (
            <button
              key={t.level}
              type="button"
              onClick={() => { setSelectedTier(sel ? null : t.level); setAmount(""); }}
              style={{
                padding: "18px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                background: sel ? `rgba(${t.color === "#ffd700" ? "255,215,0" : t.color === "#cd7f32" ? "205,127,50" : t.color === "#c0c0c0" ? "192,192,192" : t.color === "#e5e4e2" ? "229,228,226" : "168,216,234"},0.06)` : CARD,
                border: `1.5px solid ${sel ? t.color : BORD}`,
                boxShadow: sel ? `0 0 20px ${t.glow}` : "none",
                transition: "all 0.18s",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: sel ? t.color : TEXT, marginBottom: 4, letterSpacing: "-0.2px" }}>
                {t.label}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>
                ${t.minAmount >= 1000 ? `${t.minAmount / 1000}K` : t.minAmount}
                {t.maxAmount ? ` – $${t.maxAmount >= 1000 ? `${t.maxAmount / 1000}K` : t.maxAmount}` : "+"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1, padding: "6px 6px", borderRadius: 8, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>{t.apy24h}%</div>
                  <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>24H</div>
                </div>
                <div style={{ flex: 1, padding: "6px 6px", borderRadius: 8, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>{t.apy7d}%</div>
                  <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>7-Day</div>
                </div>
                <div style={{ flex: 1, padding: "6px 6px", borderRadius: 8, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>{d14apy}%</div>
                  <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>14-Day</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Investment form */}
      {selectedTier && tier && (
        <div style={{
          borderRadius: 18, border: `1.5px solid ${tier.color}`,
          background: CARD, marginBottom: 32, overflow: "hidden",
          boxShadow: `0 4px 30px ${tier.glow}`,
        }}>
          <div style={{
            padding: "16px 24px", borderBottom: `1px solid ${BORD}`,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{tier.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: tier.color }}>
                {tier.label} Plan
              </div>
              <div style={{ fontSize: 12, color: MUTED }}>{tier.desc}</div>
            </div>
          </div>

          <form onSubmit={handleInvest} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Duration toggle */}
            <div>
              <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Investment Period
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                {[1, 7, 14].map(d => {
                  const a = d === 1 ? tier.apy24h : d === 7 ? tier.apy7d : tier.apy14d;
                  const sel = duration === d;
                  return (
                    <button key={d} type="button" onClick={() => setDuration(d as 1 | 7 | 14)} style={{
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      background: sel ? `rgba(${tier.color === "#ffd700" ? "255,215,0" : "37,99,255"},0.07)` : inputBg,
                      border: `1.5px solid ${sel ? tier.color : BORD}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{durLabel(d)}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Fixed lock period</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: GREEN }}>{a}%</div>
                        <div style={{ fontSize: 10, color: MUTED }}>returns</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount</div>
                <div style={{ fontSize: 12, color: MUTED }}>
                  Range: <strong style={{ color: TEXT }}>${fmt0(tier.minAmount)} – {tier.maxAmount ? `$${fmt0(tier.maxAmount)}` : "unlimited"}</strong>
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, fontSize: 16, fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={`${fmt0(tier.minAmount)}`}
                  min={tier.minAmount}
                  max={tier.maxAmount ?? undefined}
                  style={{ ...inputSx, paddingLeft: 28, fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}
                />
              </div>
              {/* Quick amounts */}
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {[tier.minAmount, tier.minAmount * 2, tier.minAmount * 5, Math.min(availableCash, tier.maxAmount ?? availableCash)].filter((v, i, arr) => arr.indexOf(v) === i && v > 0 && v <= (tier.maxAmount ?? Infinity)).slice(0, 4).map(v => (
                  <button key={v} type="button" onClick={() => setAmount(v.toFixed(2))} style={{
                    padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    background: "transparent", border: `1px solid ${BORD}`, color: MUTED, cursor: "pointer",
                  }}>
                    ${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                  </button>
                ))}
                <button type="button" onClick={() => setAmount(Math.min(availableCash, tier.maxAmount ?? availableCash).toFixed(2))} style={{
                  padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                  background: "transparent", border: `1px solid ${BORD}`, color: MUTED, cursor: "pointer",
                }}>
                  Max
                </button>
              </div>
            </div>

            {/* Returns preview */}
            {amtNum >= tier.minAmount && amtNum > 0 && (
              <div style={{
                padding: "16px 18px", borderRadius: 12,
                background: `rgba(14,203,129,0.05)`, border: "1px solid rgba(14,203,129,0.15)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                  Returns Preview
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>Principal</span>
                  <span style={{ fontSize: 13, color: TEXT, fontFamily: "monospace", fontWeight: 600 }}>${fmt2(amtNum)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: MUTED }}>Yield ({apy}% over {duration === 1 ? "24h" : `${duration}d`})</span>
                  <span style={{ fontSize: 13, color: GREEN, fontFamily: "monospace", fontWeight: 700 }}>+${fmt2(expectedReturn)}</span>
                </div>
                <div style={{ height: 1, background: BORD, margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: TEXT, fontWeight: 700 }}>Total at maturity</span>
                  <span style={{ fontSize: 16, color: GREEN, fontFamily: "monospace", fontWeight: 800 }}>${fmt2(totalPayout)}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: MUTED }}>
                  Matures in <strong style={{ color: TEXT }}>{duration === 1 ? "24 hours" : `${duration} days`}</strong> from activation
                </div>
              </div>
            )}

            {amtNum > availableCash && amtNum > 0 && (
              <div style={{
                padding: "12px 14px", borderRadius: 10,
                background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.18)",
                fontSize: 12, color: "#eab308",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Insufficient balance</div>
                {amtNum >= 5000 ? (
                  <span>For large investments, consider using the Kraken app to send a wire transfer. <button type="button" onClick={() => setShowKraken(true)} style={{ background: "none", border: "none", color: BLUE, cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" }}>Learn how →</button></span>
                ) : (
                  <span>You need ${fmt2(amtNum - availableCash)} more. Deposit funds to continue.</span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={investing || amtNum < (tier?.minAmount || 0) || amtNum > availableCash}
              style={{
                height: 50, borderRadius: 12, border: "none",
                fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer",
                background: investing ? "rgba(14,203,129,0.5)" : GREEN,
                opacity: amtNum < (tier?.minAmount || 0) || amtNum > availableCash ? 0.55 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: amtNum >= (tier?.minAmount || 0) && amtNum <= availableCash ? "0 4px 20px rgba(14,203,129,0.35)" : "none",
              }}
            >
              {investing
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Activating Plan…</>
                : <><Zap size={16} /> Activate {tier.label} Plan — ${fmt2(amtNum || 0)}</>
              }
            </button>
          </form>
        </div>
      )}

      {/* Kraken modal */}
      {showKraken && (
        <div onClick={() => setShowKraken(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: CARD, border: `1px solid ${BORD}`, borderRadius: 20,
            maxWidth: 440, width: "100%", padding: 28,
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 30, marginBottom: 12, textAlign: "center" }}>⚡</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 8, textAlign: "center" }}>
              Fund with Kraken for Large Wires
            </h3>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 20, textAlign: "center" }}>
              For investments above $5,000, we recommend using the <strong style={{ color: TEXT }}>Kraken</strong> app to send a direct wire transfer to your Vault Wealth account.
            </p>
            <div style={{
              padding: "14px 18px", borderRadius: 12, background: BG,
              border: `1px solid ${BORD}`, marginBottom: 20,
              fontSize: 13, color: MUTED, lineHeight: 1.75,
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>1.</span>
                <span>Open the <strong style={{ color: TEXT }}>Kraken</strong> app on your device</span>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>2.</span>
                <span>Navigate to <strong style={{ color: TEXT }}>Funding → Wire Transfer</strong></span>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>3.</span>
                <span>Use your Vault Wealth account reference: <strong style={{ color: TEXT, fontFamily: "monospace" }}>VAULT-WIRE</strong></span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: BLUE, fontWeight: 700, flexShrink: 0 }}>4.</span>
                <span>Funds typically arrive within <strong style={{ color: TEXT }}>1–2 business days</strong></span>
              </div>
            </div>
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(37,99,255,0.06)", border: "1px solid rgba(37,99,255,0.15)",
              fontSize: 12, color: MUTED, marginBottom: 20, lineHeight: 1.6,
            }}>
              💡 After the wire arrives, your balance updates automatically and you can activate your Wealth Builder plan.
            </div>
            <button onClick={() => setShowKraken(false)} style={{
              width: "100%", height: 44, borderRadius: 11, border: `1px solid ${BORD}`,
              background: inputBg, color: TEXT, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Active investments */}
      {activeInvestments.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Active Plans ({activeInvestments.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activeInvestments.map((inv: any) => {
              const t = TIERS.find(x => x.level === inv.level)!;
              const isMatured = inv.status === "matured" || new Date(inv.maturesAt) <= new Date();
              return (
                <div key={inv.id}
                  onClick={() => setDetailId(inv.id)}
                  style={{
                    borderRadius: 16, background: CARD,
                    border: `1.5px solid ${isMatured ? GREEN : BORD}`,
                    padding: "18px 20px",
                    boxShadow: isMatured ? "0 0 20px rgba(14,203,129,0.12)" : "none",
                    display: "grid", gridTemplateColumns: "1fr auto",
                    gap: 16, alignItems: "center", cursor: "pointer",
                  }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{t?.icon}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: t?.color }}>{t?.label}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: isMatured ? "rgba(14,203,129,0.12)" : "rgba(234,179,8,0.1)",
                        color: isMatured ? GREEN : "#eab308",
                        border: `1px solid ${isMatured ? "rgba(14,203,129,0.25)" : "rgba(234,179,8,0.25)"}`,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        {isMatured ? "Matured" : "Active"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>INVESTED</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>${fmt2(inv.amount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>CURRENT VALUE</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>${fmt2(inv.currentValue ?? inv.amount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>LIVE P/L</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: (inv.pnl ?? 0) >= 0 ? GREEN : RED, fontFamily: "monospace" }}>
                          {(inv.pnl ?? 0) >= 0 ? "+" : ""}${fmt2(inv.pnl ?? 0)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>AT MATURITY</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: GREEN, fontFamily: "monospace" }}>${fmt2(inv.amount + inv.expectedReturn)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>{isMatured ? "MATURED" : "MATURES IN"}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isMatured ? GREEN : TEXT }}>
                          {isMatured ? "✅ Ready" : <Countdown maturesAt={inv.maturesAt} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isMatured ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCashout(inv.id); }}
                      disabled={cashingOut === inv.id}
                      style={{
                        padding: "12px 20px", borderRadius: 12, border: "none",
                        background: GREEN, color: "#fff", fontSize: 13, fontWeight: 700,
                        cursor: "pointer", whiteSpace: "nowrap",
                        display: "flex", alignItems: "center", gap: 6,
                        boxShadow: "0 4px 16px rgba(14,203,129,0.35)",
                        opacity: cashingOut === inv.id ? 0.6 : 1,
                      }}
                    >
                      {cashingOut === inv.id
                        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                        : <DollarSign size={13} />
                      }
                      {cashingOut === inv.id ? "Processing…" : "Cash Out"}
                    </button>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{inv.durationDays === 1 ? "24h" : `${inv.durationDays}d`} plan</div>
                      <ChevronRight size={20} style={{ color: MUTED }} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past investments */}
      {pastInvestments.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: MUTED, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Completed Plans
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pastInvestments.map((inv: any) => {
              const t = TIERS.find(x => x.level === inv.level)!;
              return (
                <div key={inv.id} style={{
                  borderRadius: 12, background: CARD, border: `1px solid ${BORD}`,
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, opacity: 0.7,
                }}>
                  <span style={{ fontSize: 16 }}>{t?.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>{t?.label}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{inv.durationDays}d · ${fmt2(inv.amount)} + ${fmt2(inv.expectedReturn)} return</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, fontFamily: "monospace" }}>
                    ${fmt2(inv.amount + inv.expectedReturn)}
                  </div>
                  <CheckCircle size={14} style={{ color: GREEN, opacity: 0.6 }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {investmentsQuery.isSuccess && activeInvestments.length === 0 && pastInvestments.length === 0 && !selectedTier && (
        <div style={{
          padding: "48px 24px", borderRadius: 18, border: `1px dashed ${BORD}`,
          background: CARD, textAlign: "center", marginTop: 8,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📈</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Start Building Wealth</div>
          <div style={{ fontSize: 13, color: MUTED, maxWidth: 340, margin: "0 auto" }}>
            Select a tier above to activate your first Wealth Builder plan and start earning returns in as little as 24 hours.
          </div>
        </div>
      )}

      {detailId !== null && (
        <PlanDetailModal invId={detailId} onClose={() => setDetailId(null)} />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Plan detail modal: growth chart + simulated trade log ────────────── */
function PlanDetailModal({ invId, onClose }: { invId: number; onClose: () => void }) {
  const { colors } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, green: GREEN, red: RED, bg: BG } = colors;

  const perfQuery = useQuery({
    queryKey: ["wealth-builder", "performance", invId],
    queryFn: async () => {
      const res = await fetch(`/api/wealth-builder/investments/${invId}/performance`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load plan performance");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const d = perfQuery.data;
  const t = d ? TIERS.find(x => x.level === d.level) : null;
  const pnlPos = (d?.pnl ?? 0) >= 0;

  const chartData = (d?.series ?? []).map((p: any) => ({
    time: new Date(p.time).getTime(),
    value: p.value,
  }));

  const fmtTick = (ts: number) => {
    const dt = new Date(ts);
    return d?.durationDays === 1
      ? dt.toLocaleTimeString("en-US", { hour: "numeric" })
      : dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: CARD, border: `1px solid ${BORD}`, borderRadius: 20,
        maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: CARD, zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{t?.icon ?? "📈"}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: t?.color ?? TEXT }}>
                {t?.label ?? "Plan"} Plan
              </div>
              {d && (
                <div style={{ fontSize: 11, color: MUTED }}>
                  {d.durationDays === 1 ? "24-hour" : `${d.durationDays}-day`} plan · {d.apyPercent}% target return
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${BORD}`, borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED }}>
            <X size={15} />
          </button>
        </div>

        {perfQuery.isLoading || !d ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <Loader2 size={22} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ padding: "18px 22px" }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
              {[
                ["Invested", `$${fmt2(d.amount)}`, TEXT],
                ["Current Value", `$${fmt2(d.currentValue)}`, TEXT],
                ["Live P/L", `${pnlPos ? "+" : ""}$${fmt2(d.pnl)} (${pnlPos ? "+" : ""}${fmt2(d.pnlPercent)}%)`, pnlPos ? GREEN : RED],
                ["At Maturity", `$${fmt2(d.amount + d.expectedReturn)}`, GREEN],
              ].map(([lbl, val, col]) => (
                <div key={lbl as string} style={{ padding: "10px 12px", borderRadius: 12, background: BG, border: `1px solid ${BORD}` }}>
                  <div style={{ fontSize: 9.5, color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 4 }}>{lbl}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: col as string, fontFamily: "monospace" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Growth chart */}
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Plan Growth
            </div>
            <div style={{ height: 220, marginBottom: 20, borderRadius: 12, border: `1px solid ${BORD}`, background: BG, padding: "12px 8px 4px 0" }}>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wbGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tickFormatter={fmtTick} tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} minTickGap={40} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={62} tickFormatter={(v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
                    <Tooltip
                      formatter={(v: any) => [`$${fmt2(Number(v))}`, "Value"]}
                      labelFormatter={(ts: any) => new Date(Number(ts)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      contentStyle={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="value" stroke={GREEN} strokeWidth={2} fill="url(#wbGrowth)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                  <BarChart2 size={20} style={{ color: MUTED }} />
                  <div style={{ fontSize: 12, color: MUTED }}>First trades execute within a few hours of activation</div>
                </div>
              )}
            </div>

            {/* Trades */}
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Automated Trades ({(d.trades ?? []).length})
            </div>
            {(d.trades ?? []).length === 0 ? (
              <div style={{ padding: "20px 16px", borderRadius: 12, border: `1px dashed ${BORD}`, textAlign: "center", fontSize: 12, color: MUTED }}>
                No trades executed yet — the strategy engine places its first trade within a few hours.
              </div>
            ) : (
              <div style={{ borderRadius: 12, border: `1px solid ${BORD}`, overflow: "hidden" }}>
                {(d.trades ?? []).slice(0, 40).map((tr: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < Math.min((d.trades ?? []).length, 40) - 1 ? `1px solid ${BORD}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: tr.win ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${tr.win ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                      }}>
                        {tr.win ? <TrendingUp size={12} style={{ color: GREEN }} /> : <TrendingDown size={12} style={{ color: RED }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{tr.symbol} <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase" }}>{tr.side}</span></div>
                        <div style={{ fontSize: 10.5, color: MUTED }}>{new Date(tr.time).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, fontFamily: "monospace", color: tr.win ? GREEN : RED }}>
                      {tr.win ? "+" : ""}${fmt2(tr.pnl)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 14, fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
              Trades are executed automatically by the strategy engine roughly every 3–4 hours. Individual trades may win or lose, but the plan is engineered to hit its daily growth target of {fmt2(d.apyPercent / d.durationDays)}% per day.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
