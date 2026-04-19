import { useRoute, Link } from "wouter";
import { useGetAdminUserDetail, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Loader2, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Snowflake, Flame, Trash2, Plus, DollarSign, TrendingUp, Clock,
} from "lucide-react";

const CARD  = "#111827";
const CARD2 = "#0d1120";
const BORD  = "rgba(255,255,255,0.07)";
const TEXT  = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.38)";
const BLUE  = "#3b82f6";
const GAIN  = "#22c55e";
const LOSS  = "#ef4444";
const AMB   = "#f59e0b";
const WHATSAPP_LINK = "https://wa.me/18886555555";
const API_BASE = "/api";

async function adminFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts, credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const KYC_FG: Record<string, string> = {
  approved: GAIN, pending: AMB, rejected: LOSS, flagged: "#f97316", not_started: "#6b7280",
};

const TX_TYPES = [
  { value: "deposit",           label: "Deposit" },
  { value: "withdraw",          label: "Withdrawal" },
  { value: "bank_withdrawal",   label: "Bank Withdrawal" },
  { value: "crypto_withdrawal", label: "Crypto Withdrawal" },
  { value: "buy",               label: "Buy Trade" },
  { value: "sell",              label: "Sell Trade" },
];

const TABS = [
  { id: "overview",      label: "Overview" },
  { id: "assets",        label: "Assets" },
  { id: "transactions",  label: "Activity" },
  { id: "kyc",           label: "KYC Review" },
  { id: "timeline",      label: "Timeline" },
];

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}` }}>
        {sub && <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{sub}</div>}
        <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 16, alignItems: "flex-start" }}>
      <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: mono ? "monospace" : undefined, wordBreak: "break-all", textAlign: "right" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

const inputSx: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 11, boxSizing: "border-box",
  background: CARD2, border: `1px solid ${BORD}`, color: TEXT, fontSize: 13,
  outline: "none", fontFamily: "Inter,system-ui,sans-serif",
};

const labelSx: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, color: MUTED,
  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
};

export default function AdminUserDetail() {
  const [_, params] = useRoute("/admin/users/:id");
  const userId = Number(params?.id);

  const { data: detail, isLoading, refetch } = useGetAdminUserDetail(userId, { query: { enabled: !!userId } });
  const updateStatus = useUpdateUserKycStatus();

  const [notes,      setNotes]      = useState("");
  const [processing, setProcessing] = useState(false);
  const [tab,        setTab]        = useState<string>("overview");

  const [assetSymbol, setAssetSymbol] = useState("");
  const [assetQty,    setAssetQty]    = useState("");
  const [assetCost,   setAssetCost]   = useState("");
  const [assetLoading, setAssetLoading] = useState(false);

  const [cashAmount,  setCashAmount]  = useState("");
  const [cashLoading, setCashLoading] = useState(false);

  const [txType,    setTxType]    = useState("deposit");
  const [txAmount,  setTxAmount]  = useState("");
  const [txName,    setTxName]    = useState("");
  const [txSymbol,  setTxSymbol]  = useState("");
  const [txLoading, setTxLoading] = useState(false);

  if (isLoading) return (
    <div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
      <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!detail) return <div style={{ padding: 48, textAlign: "center", color: MUTED }}>User not found</div>;

  const { user, balance, kycDocuments, selfieStatus, holdings, recentTransactions, activityTimeline } = detail as any;
  const isFrozen = user.isFrozen;
  const UID = `VW-${String(user.id).padStart(6, "0")}`;
  const kycColor = KYC_FG[user.kycStatus] ?? "#6b7280";
  const initials = user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const doKyc = async (status: "approved" | "rejected" | "flagged") => {
    setProcessing(true);
    try {
      await updateStatus.mutateAsync({ userId, data: { status, notes } });
      toast.success(`KYC → ${status}`);
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const doFreeze = async () => {
    setProcessing(true);
    try {
      await adminFetch(`/admin/users/${userId}/freeze`, {
        method: "PATCH",
        body: JSON.stringify({ freeze: !isFrozen, reason: isFrozen ? undefined : "Account suspended by admin" }),
      });
      toast.success(isFrozen ? "Account unfrozen" : "Account frozen");
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const doDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.fullName}? This cannot be undone.`)) return;
    setProcessing(true);
    try {
      await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      toast.success("User deleted");
      window.location.href = "/admin/dashboard";
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const doAsset = async () => {
    if (!assetSymbol || !assetQty) { toast.error("Symbol and quantity required"); return; }
    setAssetLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/assets`, { method: "POST", body: JSON.stringify({ symbol: assetSymbol, quantity: assetQty, averageCost: assetCost || undefined }) });
      toast.success(`${assetSymbol} position updated`);
      setAssetSymbol(""); setAssetQty(""); setAssetCost(""); refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setAssetLoading(false); }
  };

  const doCash = async () => {
    if (!cashAmount) { toast.error("Enter an amount"); return; }
    setCashLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/cash`, { method: "PATCH", body: JSON.stringify({ amount: cashAmount }) });
      toast.success("Cash balance updated");
      setCashAmount(""); refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setCashLoading(false); }
  };

  const doTx = async () => {
    if (!txAmount) { toast.error("Amount required"); return; }
    setTxLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/transactions`, { method: "POST", body: JSON.stringify({ type: txType, amount: txAmount, name: txName || undefined, symbol: txSymbol || undefined }) });
      toast.success("Transaction added");
      setTxAmount(""); setTxName(""); setTxSymbol(""); setTxType("deposit"); refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setTxLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .ud-header{flex-direction:column !important;align-items:flex-start !important;}
          .ud-actions{flex-wrap:wrap !important;}
          .ud-stats{grid-template-columns:1fr 1fr !important;}
          .ud-cols{grid-template-columns:1fr !important;}
          .ud-asset-grid{grid-template-columns:1fr !important;}
        }
      `}</style>

      {/* Back */}
      <Link href="/admin/dashboard" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, color: MUTED, textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* ─── User header ─── */}
      <div className="ud-header" style={{
        background: CARD, border: `1px solid ${BORD}`, borderRadius: 18,
        padding: "22px 26px", marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
      }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: isFrozen ? "rgba(167,139,250,0.15)" : "rgba(59,130,246,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: isFrozen ? "#a78bfa" : BLUE,
          }}>{initials}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: 0 }}>{user.fullName}</h1>
              {isFrozen && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 9, fontWeight: 700, color: "#a78bfa",
                  background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 99, padding: "3px 9px", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  <Snowflake size={9} /> Frozen
                </span>
              )}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                background: `${kycColor}18`, color: kycColor, border: `1px solid ${kycColor}30`,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: kycColor }} />
                {user.kycStatus?.replace("_", " ")}
              </span>
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
              {user.email} · {UID} · Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="ud-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={doFreeze} disabled={processing} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11, border: "none",
            cursor: "pointer", fontSize: 12, fontWeight: 600, opacity: processing ? 0.5 : 1,
            background: isFrozen ? "rgba(34,197,94,0.1)" : "rgba(167,139,250,0.1)",
            color: isFrozen ? GAIN : "#a78bfa",
          }}>
            {isFrozen ? <><Flame size={13} /> Unfreeze</> : <><Snowflake size={13} /> Freeze</>}
          </button>
          <button onClick={doDelete} disabled={processing} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 11,
            border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer",
            fontSize: 12, fontWeight: 600, background: "rgba(239,68,68,0.08)", color: LOSS,
            opacity: processing ? 0.5 : 1,
          }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* ─── Stats strip ─── */}
      <div className="ud-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Portfolio", value: `$${(balance?.totalPortfolioValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: BLUE },
          { label: "Available Cash",  value: `$${(balance?.availableCash     || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: GAIN },
          { label: "Holdings",        value: (holdings ?? []).length,               color: "#a78bfa" },
          { label: "Transactions",    value: (recentTransactions ?? []).length,     color: AMB },
        ].map(({ label, value, color }, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "18px 22px" }}>
            <div style={{ fontSize: 11, color: MUTED, fontWeight: 500, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ─── Tab bar ─── */}
      <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 14, width: "fit-content", marginBottom: 26, overflowX: "auto" }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "9px 20px", borderRadius: 11, border: "none", cursor: "pointer", whiteSpace: "nowrap",
            fontSize: 12, fontWeight: 600, transition: "all 0.14s",
            background: tab === id ? BLUE : "transparent",
            color: tab === id ? "#fff" : MUTED,
          }}>{label}</button>
        ))}
      </div>

      {/* ═══════════════ OVERVIEW ═══════════════ */}
      {tab === "overview" && (
        <div className="ud-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card title="Personal Details" sub="Identity">
            {[
              { label: "Legal Name",  value: user.legalName || user.fullName },
              { label: "Email",       value: user.email, mono: true },
              { label: "Phone",       value: user.phone },
              { label: "Date of Birth", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null },
              { label: "Country",     value: user.country },
              { label: "Address",     value: [user.address, user.city, user.postalCode].filter(Boolean).join(", ") || null },
              { label: "User ID",     value: UID, mono: true },
              { label: "Onboarding", value: user.onboardingComplete ? "Complete" : `Step ${user.onboardingStep || 0}/8` },
            ].map(({ label, value, mono }: any) => <InfoRow key={label} label={label} value={value} mono={mono} />)}
            <div style={{ height: 4 }} />
          </Card>

          <div>
            <Card title="Financial Summary" sub="Financials">
              {[
                { label: "Total Portfolio", value: `$${(balance?.totalPortfolioValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Available Cash",  value: `$${(balance?.availableCash     || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Crypto Assets",   value: `$${(balance?.cryptoBalance     || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Equities",        value: `$${(balance?.stockBalance      || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Commodities",     value: `$${(balance?.commodityBalance  || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
              ].map(({ label, value }) => <InfoRow key={label} label={label} value={value} />)}
              <div style={{ height: 4 }} />
            </Card>

            <Card title="Investment Profile" sub="Preferences">
              {[
                { label: "Purpose",       value: user.investmentPurpose },
                { label: "Capital Range", value: user.investmentAmount },
                { label: "Preferences",   value: user.investmentPreferences?.join(", ") },
              ].map(({ label, value }) => <InfoRow key={label} label={label} value={value} />)}
              <div style={{ height: 4 }} />
            </Card>

            {isFrozen && (
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, padding: "18px 22px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: LOSS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Account Frozen</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{user.frozenReason || "No reason provided."}</div>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#25D366",
                  textDecoration: "none", marginTop: 12, fontWeight: 600,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contact via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ ASSETS ═══════════════ */}
      {tab === "assets" && (
        <div className="ud-asset-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Holdings table */}
          <Card title="Current Holdings" sub="Portfolio">
            {!holdings?.length ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No holdings found</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                      {["Asset", "Qty", "Avg Cost", "Price", "Value", "P&L"].map((h, i) => (
                        <th key={h} style={{
                          padding: "12px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.1em", color: MUTED, textAlign: "left",
                          paddingLeft: i === 0 ? 24 : 16,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h: any) => (
                      <tr key={h.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                        <td style={{ padding: "13px 16px 13px 24px" }}>
                          <div style={{ fontWeight: 700, color: TEXT }}>{h.symbol}</div>
                          <div style={{ fontSize: 11, color: MUTED }}>{h.name}</div>
                        </td>
                        <td style={{ padding: "13px 16px", color: TEXT, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {h.quantity.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                        </td>
                        <td style={{ padding: "13px 16px", color: MUTED, fontVariantNumeric: "tabular-nums" }}>
                          ${h.averageCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "13px 16px", color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                          ${h.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "13px 16px", color: TEXT, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          ${h.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "13px 16px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: h.gainLoss >= 0 ? GAIN : LOSS }}>
                          {h.gainLoss >= 0 ? "+" : ""}{h.gainLossPercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Controls */}
          <div>
            <Card title="Set Asset Position" sub="Asset Control">
              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Symbol (e.g. BTC, AAPL)", placeholder: "BTC", value: assetSymbol, onChange: (v: string) => setAssetSymbol(v.toUpperCase()) },
                  { label: "Quantity (0 to remove)",  placeholder: "0.00", value: assetQty,    onChange: setAssetQty, type: "number" },
                  { label: "Avg Cost (optional)",     placeholder: "Current price", value: assetCost, onChange: setAssetCost, type: "number" },
                ].map(({ label, placeholder, value, onChange, type }) => (
                  <div key={label}>
                    <label style={labelSx}>{label}</label>
                    <input style={inputSx} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
                  </div>
                ))}
                <button onClick={doAsset} disabled={assetLoading} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
                  background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
                  opacity: assetLoading ? 0.6 : 1, marginTop: 4,
                }}>
                  {assetLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <TrendingUp size={13} />}
                  {assetLoading ? "Saving…" : "Update Position"}
                </button>
              </div>
            </Card>

            <Card title="Set Cash Balance" sub="Cash Control">
              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 13, color: MUTED }}>
                  Current: <strong style={{ color: TEXT }}>${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  <label style={labelSx}>New Amount ($)</label>
                  <input style={inputSx} type="number" placeholder="0.00" value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
                </div>
                <button onClick={doCash} disabled={cashLoading} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
                  background: GAIN, color: "#fff", fontSize: 12, fontWeight: 700,
                  opacity: cashLoading ? 0.6 : 1,
                }}>
                  {cashLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <DollarSign size={13} />}
                  {cashLoading ? "Saving…" : "Set Cash Balance"}
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════ TRANSACTIONS ═══════════════ */}
      {tab === "transactions" && (
        <div className="ud-asset-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          <Card title="Transaction History" sub="Activity">
            {!recentTransactions?.length ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No transactions yet</div>
            ) : recentTransactions.map((t: any) => {
              const isCredit = ["deposit", "sell"].includes(t.type);
              const label = TX_TYPES.find(x => x.value === t.type)?.label ?? t.type;
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "15px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: isCredit ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: isCredit ? GAIN : LOSS,
                    }}>{isCredit ? "↓" : "↑"}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{t.name || label}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {label} · {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isCredit ? GAIN : LOSS }}>
                      {isCredit ? "+" : "-"}${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: t.status === "completed" ? GAIN : AMB, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          <Card title="Add Transaction" sub="Manual Entry">
            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelSx}>Transaction Type</label>
                <select style={{ ...inputSx, appearance: "none" }} value={txType} onChange={e => setTxType(e.target.value)}>
                  {TX_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSx}>Amount ($)</label>
                <input style={inputSx} type="number" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
              </div>
              <div>
                <label style={labelSx}>Label (optional)</label>
                <input style={inputSx} placeholder="e.g. Bank Transfer" value={txName} onChange={e => setTxName(e.target.value)} />
              </div>
              <div>
                <label style={labelSx}>Symbol (optional)</label>
                <input style={inputSx} placeholder="e.g. USDT, ETH" value={txSymbol} onChange={e => setTxSymbol(e.target.value.toUpperCase())} />
              </div>
              <button onClick={doTx} disabled={txLoading} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
                background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
                opacity: txLoading ? 0.6 : 1, marginTop: 4,
              }}>
                {txLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                {txLoading ? "Adding…" : "Add Transaction"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════ KYC ═══════════════ */}
      {tab === "kyc" && (
        <div className="ud-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card title="KYC Documents" sub="Documents">
            <div style={{ padding: "18px 24px" }}>
              {kycDocuments?.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {kycDocuments.map((doc: any) => {
                    const isVideo = doc.fileUrl && (doc.fileUrl.endsWith(".webm") || doc.fileUrl.endsWith(".mp4") || doc.fileUrl.endsWith(".mov"));
                    return (
                      <div key={doc.id} style={{ border: `1px solid ${BORD}`, borderRadius: 12, overflow: "hidden" }}>
                        <div style={{ padding: "9px 14px", borderBottom: `1px solid ${BORD}`, background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            {doc.documentType?.replace(/_/g, " ")} — {doc.side}
                          </div>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download
                              style={{ fontSize: 10, color: BLUE, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                              ↗ Open
                            </a>
                          )}
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                          {doc.fileUrl ? (
                            isVideo ? (
                              <video src={doc.fileUrl} controls style={{ width: "100%", maxHeight: 240, display: "block" }} />
                            ) : (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%" }}>
                                <img
                                  src={doc.fileUrl}
                                  alt={`${doc.documentType} ${doc.side}`}
                                  style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block" }}
                                  onError={e => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    const p = document.createElement("p");
                                    p.textContent = "Preview unavailable — click Open to view";
                                    p.style.cssText = "font-size:11px;color:#6b7280;padding:24px;text-align:center";
                                    (e.target as HTMLImageElement).parentElement?.appendChild(p);
                                  }}
                                />
                              </a>
                            )
                          ) : (
                            <span style={{ fontSize: 11, color: MUTED }}>No document uploaded</span>
                          )}
                        </div>
                        {doc.fileUrl && (
                          <div style={{ padding: "8px 14px", borderTop: `1px solid ${BORD}` }}>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download
                              style={{ fontSize: 11, color: MUTED, wordBreak: "break-all", fontFamily: "monospace", textDecoration: "none" }}>
                              {doc.fileUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 36, textAlign: "center", color: MUTED, fontSize: 13 }}>No documents uploaded</div>
              )}

              <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${BORD}` }}>
                <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Selfie / Biometric Video</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selfieStatus === "approved"  && <CheckCircle2   size={14} color={GAIN} />}
                  {selfieStatus === "submitted" && <AlertTriangle  size={14} color={AMB}  />}
                  {(!selfieStatus || (selfieStatus !== "approved" && selfieStatus !== "submitted")) && <XCircle size={14} color={MUTED} />}
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, textTransform: "capitalize" }}>
                    {selfieStatus === "submitted" ? "Video submitted — pending review" : selfieStatus?.replace("_", " ") || "Not submitted"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Compliance Decision" sub="Review">
            <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelSx}>Internal Review Notes</label>
                <textarea
                  placeholder="Add compliance notes (not visible to user)…"
                  value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  style={{ ...inputSx, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => doKyc("approved")} disabled={processing} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
                  background: GAIN, color: "#fff", fontSize: 12, fontWeight: 700, opacity: processing ? 0.5 : 1,
                }}>
                  <CheckCircle2 size={13} /> Approve KYC
                </button>
                <button onClick={() => doKyc("rejected")} disabled={processing} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, cursor: "pointer",
                  border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: LOSS,
                  fontSize: 12, fontWeight: 700, opacity: processing ? 0.5 : 1,
                }}>
                  <XCircle size={13} /> Reject
                </button>
                <button onClick={() => doKyc("flagged")} disabled={processing} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, cursor: "pointer",
                  border: "1px solid rgba(249,115,22,0.25)", background: "rgba(249,115,22,0.08)", color: "#f97316",
                  fontSize: 12, fontWeight: 700, opacity: processing ? 0.5 : 1,
                }}>
                  <AlertTriangle size={13} /> Flag for Review
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════ TIMELINE ═══════════════ */}
      {tab === "timeline" && (
        <Card title="Activity Timeline" sub="Audit Log">
          {!activityTimeline?.length ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No activity recorded</div>
          ) : activityTimeline.map((a: any, i: number) => (
            <div key={a.id} style={{
              display: "flex", gap: 16, padding: "16px 24px",
              borderBottom: i < activityTimeline.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, background: "rgba(59,130,246,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
              }}>
                <Clock size={13} color={BLUE} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{a.description}</div>
                <div style={{ fontSize: 11, color: MUTED }}>
                  {new Date(a.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" · "}<span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>{a.eventType}</span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
