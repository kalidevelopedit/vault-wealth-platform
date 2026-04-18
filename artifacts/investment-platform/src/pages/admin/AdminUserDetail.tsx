import { useRoute, Link } from "wouter";
import { useGetAdminUserDetail, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Shield, Snowflake, Flame, Trash2, Plus, DollarSign, TrendingUp, Clock } from "lucide-react";

const BG = "#080c14";
const CARD = "#0f1523";
const CARD2 = "#0a0e1a";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.36)";
const BLUE = "#3b82f6";
const GAIN = "#22c55e";
const LOSS = "#ef4444";
const WHATSAPP_LINK = "https://wa.me/18886555555";

const API_BASE = "/api";

async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const KYC_COLOR: Record<string, string> = {
  approved: GAIN, pending: "#f59e0b", rejected: LOSS, flagged: "#f97316", not_started: "#6b7280",
};

const TX_TYPES = [
  { value: "deposit",          label: "Deposit" },
  { value: "withdraw",         label: "Withdrawal" },
  { value: "bank_withdrawal",  label: "Bank Withdrawal" },
  { value: "crypto_withdrawal",label: "Crypto Withdrawal" },
  { value: "buy",              label: "Buy Trade" },
  { value: "sell",             label: "Sell Trade" },
];

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${BORD}` }}>
        {sub && <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 2 }}>{sub}</div>}
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 22px", borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 16 }}>
      <span style={{ fontSize: 11, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: TEXT, fontFamily: mono ? "monospace" : undefined, wordBreak: "break-all", textAlign: "right" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function AdminUserDetail() {
  const [_, params] = useRoute("/admin/users/:id");
  const userId = Number(params?.id);

  const { data: detail, isLoading, refetch } = useGetAdminUserDetail(userId, { query: { enabled: !!userId } });
  const updateStatus = useUpdateUserKycStatus();

  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [tab, setTab] = useState<"overview" | "assets" | "transactions" | "kyc" | "activity">("overview");

  // Asset management state
  const [assetSymbol, setAssetSymbol] = useState("");
  const [assetQty, setAssetQty] = useState("");
  const [assetCost, setAssetCost] = useState("");
  const [assetLoading, setAssetLoading] = useState(false);

  // Cash management state
  const [cashAmount, setCashAmount] = useState("");
  const [cashLoading, setCashLoading] = useState(false);

  // Transaction state
  const [txType, setTxType] = useState("deposit");
  const [txAmount, setTxAmount] = useState("");
  const [txName, setTxName] = useState("");
  const [txSymbol, setTxSymbol] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  if (isLoading) return (
    <div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
      <Loader2 size={20} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!detail) return <div style={{ padding: 48, textAlign: "center", color: MUTED, fontSize: 13 }}>User not found</div>;

  const { user, balance, kycDocuments, selfieStatus, holdings, recentTransactions, activityTimeline } = detail as any;
  const isFrozen = user.isFrozen;
  const UID = `VW-${String(user.id).padStart(6, "0")}`;

  const handleStatusUpdate = async (status: "approved" | "rejected" | "flagged") => {
    setProcessing(true);
    try {
      await updateStatus.mutateAsync({ userId, data: { status, notes } });
      toast.success(`KYC status → ${status}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally { setProcessing(false); }
  };

  const handleFreeze = async () => {
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

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${user.fullName}? This cannot be undone.`)) return;
    setProcessing(true);
    try {
      await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      toast.success("User deleted");
      window.location.href = "/admin/dashboard";
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const handleAssetUpdate = async () => {
    if (!assetSymbol || !assetQty) { toast.error("Symbol and quantity required"); return; }
    setAssetLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/assets`, {
        method: "POST",
        body: JSON.stringify({ symbol: assetSymbol, quantity: assetQty, averageCost: assetCost || undefined }),
      });
      toast.success(`${assetSymbol} position updated`);
      setAssetSymbol(""); setAssetQty(""); setAssetCost("");
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setAssetLoading(false); }
  };

  const handleCashUpdate = async () => {
    if (!cashAmount) { toast.error("Enter an amount"); return; }
    setCashLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/cash`, {
        method: "PATCH",
        body: JSON.stringify({ amount: cashAmount }),
      });
      toast.success("Cash balance updated");
      setCashAmount("");
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setCashLoading(false); }
  };

  const handleAddTx = async () => {
    if (!txAmount) { toast.error("Amount required"); return; }
    setTxLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/transactions`, {
        method: "POST",
        body: JSON.stringify({ type: txType, amount: txAmount, name: txName || undefined, symbol: txSymbol || undefined }),
      });
      toast.success("Transaction added");
      setTxAmount(""); setTxName(""); setTxSymbol(""); setTxType("deposit");
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setTxLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10, boxSizing: "border-box",
    background: CARD2, border: `1px solid ${BORD}`, color: TEXT, fontSize: 12, outline: "none",
    fontFamily: "Inter,system-ui,sans-serif",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    background: BLUE, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "assets", label: "Assets" },
    { id: "transactions", label: "Activity" },
    { id: "kyc", label: "KYC Review" },
    { id: "activity", label: "Timeline" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Back */}
      <Link href="/admin/dashboard"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: MUTED, textDecoration: "none", marginBottom: 20 }}>
        <ArrowLeft size={13} /> Back to Dashboard
      </Link>

      {/* User header card */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: isFrozen ? "rgba(167,139,250,0.15)" : "rgba(59,130,246,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: isFrozen ? "#a78bfa" : BLUE,
          }}>
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: 0 }}>{user.fullName}</h1>
              {isFrozen && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 700, color: "#a78bfa", background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 99, padding: "2px 8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  <Snowflake size={9} /> Frozen
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{user.email} · {UID}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 99, background: `${KYC_COLOR[user.kycStatus] ?? "#6b7280"}18`, color: KYC_COLOR[user.kycStatus] ?? "#6b7280", border: `1px solid ${KYC_COLOR[user.kycStatus] ?? "#6b7280"}30` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: KYC_COLOR[user.kycStatus] ?? "#6b7280" }} />
            {user.kycStatus?.replace("_", " ")}
          </span>
          <div style={{ fontSize: 11, color: MUTED }}>
            Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>

          <button onClick={handleFreeze} disabled={processing}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 10,
              fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5, opacity: processing ? 0.5 : 1,
              background: isFrozen ? "rgba(34,197,94,0.1)" : "rgba(167,139,250,0.1)",
              color: isFrozen ? GAIN : "#a78bfa",
            }}>
            {isFrozen ? <><Flame size={11} /> Unfreeze</> : <><Snowflake size={11} /> Freeze</>}
          </button>

          <button onClick={handleDelete} disabled={processing}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(239,68,68,0.08)", color: LOSS, opacity: processing ? 0.5 : 1,
            }}>
            <Trash2 size={11} /> Delete User
          </button>
        </div>
      </div>

      {/* Quick stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Portfolio", value: `$${(balance?.totalPortfolioValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: BLUE },
          { label: "Available Cash", value: `$${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#22c55e" },
          { label: "Holdings", value: (holdings ?? []).length, color: "#a78bfa" },
          { label: "Transactions", value: (recentTransactions ?? []).length, color: "#f59e0b" },
        ].map(({ label, value, color }, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 12, width: "fit-content", marginBottom: 20 }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{
              padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              background: tab === id ? BLUE : "transparent",
              color: tab === id ? "#fff" : MUTED, transition: "all 0.14s",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <Section title="Personal Details" sub="Identity">
              {[
                { label: "Legal Name", value: user.legalName || user.fullName },
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phone || "—" },
                { label: "Date of Birth", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                { label: "Country", value: user.country || "—" },
                { label: "Address", value: [user.address, user.city, user.postalCode].filter(Boolean).join(", ") || "—" },
                { label: "User ID", value: UID, mono: true },
                { label: "Onboarding", value: user.onboardingComplete ? "Complete" : `Step ${user.onboardingStep || 0}/8` },
              ].map(({ label, value, mono }: any) => <Row key={label} label={label} value={value} mono={mono} />)}
              <div style={{ height: 1 }} />
            </Section>
          </div>

          <div>
            <Section title="Financial Summary" sub="Financials">
              {[
                { label: "Total Portfolio", value: `$${(balance?.totalPortfolioValue || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Available Cash", value: `$${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Crypto Assets", value: `$${(balance?.cryptoBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Equities", value: `$${(balance?.stockBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Commodities", value: `$${(balance?.commodityBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
              ].map(({ label, value }) => <Row key={label} label={label} value={value} />)}
              <div style={{ height: 1 }} />
            </Section>

            <Section title="Client Preferences" sub="Investment Profile">
              {[
                { label: "Purpose", value: user.investmentPurpose || "—" },
                { label: "Capital Range", value: user.investmentAmount || "—" },
                { label: "Preferences", value: user.investmentPreferences?.join(", ") || "—" },
              ].map(({ label, value }) => <Row key={label} label={label} value={value} />)}
              <div style={{ height: 1 }} />
            </Section>

            {isFrozen && (
              <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginTop: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>Account Frozen</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{user.frozenReason || "No reason provided."}</div>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, color: "#25D366", textDecoration: "none", marginTop: 10, fontWeight: 600 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contact via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ASSETS TAB ── */}
      {tab === "assets" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Current holdings */}
          <Section title="Current Holdings" sub="Portfolio">
            {!holdings || holdings.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No holdings found</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                      {["Asset", "Type", "Qty", "Avg Cost", "Current Price", "Value", "P&L"].map((h, i) => (
                        <th key={h} style={{ padding: "10px 16px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, textAlign: "left", paddingLeft: i === 0 ? 22 : 16 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h: any) => (
                      <tr key={h.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                        <td style={{ padding: "12px 16px 12px 22px" }}>
                          <div style={{ fontWeight: 700, color: TEXT }}>{h.symbol}</div>
                          <div style={{ fontSize: 10, color: MUTED }}>{h.name}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(59,130,246,0.1)", color: BLUE, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h.assetType}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: TEXT, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{h.quantity.toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                        <td style={{ padding: "12px 16px", color: MUTED, fontVariantNumeric: "tabular-nums" }}>${h.averageCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "12px 16px", color: TEXT, fontVariantNumeric: "tabular-nums" }}>${h.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "12px 16px", color: TEXT, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>${h.currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: h.gainLoss >= 0 ? GAIN : LOSS }}>
                          {h.gainLoss >= 0 ? "+" : ""}{h.gainLossPercentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Right panel */}
          <div>
            {/* Set asset position */}
            <Section title="Set Asset Position" sub="Asset Control">
              <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Symbol (e.g. BTC, AAPL)</label>
                  <input style={inputStyle} placeholder="BTC" value={assetSymbol} onChange={e => setAssetSymbol(e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Quantity (0 to remove)</label>
                  <input style={inputStyle} type="number" placeholder="0.00" value={assetQty} onChange={e => setAssetQty(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Avg Cost (optional)</label>
                  <input style={inputStyle} type="number" placeholder="Current price" value={assetCost} onChange={e => setAssetCost(e.target.value)} />
                </div>
                <button onClick={handleAssetUpdate} disabled={assetLoading} style={{ ...btnPrimary, marginTop: 4, opacity: assetLoading ? 0.6 : 1 }}>
                  {assetLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <TrendingUp size={13} />}
                  {assetLoading ? "Saving…" : "Update Position"}
                </button>
              </div>
            </Section>

            {/* Set cash balance */}
            <Section title="Set Cash Balance" sub="Cash Control">
              <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, color: MUTED }}>
                  Current: <strong style={{ color: TEXT }}>${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>New Amount ($)</label>
                  <input style={inputStyle} type="number" placeholder="10000.00" value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
                </div>
                <button onClick={handleCashUpdate} disabled={cashLoading} style={{ ...btnPrimary, background: GAIN, opacity: cashLoading ? 0.6 : 1 }}>
                  {cashLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <DollarSign size={13} />}
                  {cashLoading ? "Saving…" : "Set Cash Balance"}
                </button>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {tab === "transactions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Transaction history */}
          <Section title="Transaction History" sub="Activity">
            {!recentTransactions || recentTransactions.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No transactions yet</div>
            ) : (
              <div>
                {recentTransactions.map((t: any) => {
                  const isCredit = ["deposit", "sell"].includes(t.type);
                  const typeLabel = TX_TYPES.find(x => x.value === t.type)?.label ?? t.type;
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: isCredit ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 13 }}>{isCredit ? "↓" : "↑"}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{t.name || typeLabel}</div>
                          <div style={{ fontSize: 10, color: MUTED }}>{typeLabel} · {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isCredit ? GAIN : LOSS }}>
                          {isCredit ? "+" : "-"}${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: t.status === "completed" ? GAIN : "#f59e0b", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Add transaction */}
          <Section title="Add Transaction" sub="Manual Entry">
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Transaction Type</label>
                <select style={{ ...inputStyle, appearance: "none" }} value={txType} onChange={e => setTxType(e.target.value)}>
                  {TX_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Amount ($)</label>
                <input style={inputStyle} type="number" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Label (optional)</label>
                <input style={inputStyle} placeholder="e.g. Bank Transfer, USDT" value={txName} onChange={e => setTxName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 5 }}>Symbol (optional)</label>
                <input style={inputStyle} placeholder="e.g. USDT, ETH" value={txSymbol} onChange={e => setTxSymbol(e.target.value.toUpperCase())} />
              </div>
              <button onClick={handleAddTx} disabled={txLoading} style={{ ...btnPrimary, marginTop: 4, opacity: txLoading ? 0.6 : 1 }}>
                {txLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                {txLoading ? "Adding…" : "Add Transaction"}
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* ── KYC TAB ── */}
      {tab === "kyc" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Section title="KYC Documents" sub="Documents">
            <div style={{ padding: "16px 22px" }}>
              {kycDocuments?.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {kycDocuments.map((doc: any) => (
                    <div key={doc.id} style={{ border: `1px solid ${BORD}`, borderRadius: 12, overflow: "hidden" }}>
                      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${BORD}`, background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {doc.documentType?.replace("_", " ")} — {doc.side}
                        </div>
                      </div>
                      <div style={{ aspectRatio: "16/9", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {doc.fileUrl ? <img src={doc.fileUrl} alt="Document" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                          <div style={{ fontSize: 11, color: MUTED }}>No document</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>No documents uploaded</div>
              )}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORD}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>Selfie / Biometric</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selfieStatus === "approved" ? <CheckCircle2 size={15} style={{ color: GAIN }} /> :
                   selfieStatus === "submitted" ? <AlertTriangle size={15} style={{ color: "#f59e0b" }} /> :
                   <XCircle size={15} style={{ color: MUTED }} />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT, textTransform: "capitalize" }}>{selfieStatus?.replace("_", " ") || "Not submitted"}</span>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Compliance Decision" sub="Review">
            <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 6 }}>
                  Internal Review Notes
                </label>
                <textarea
                  placeholder="Add compliance review notes (not visible to user)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => handleStatusUpdate("approved")} disabled={processing}
                  style={{ ...btnPrimary, background: GAIN, opacity: processing ? 0.5 : 1 }}>
                  <CheckCircle2 size={13} /> Approve KYC
                </button>
                <button onClick={() => handleStatusUpdate("rejected")} disabled={processing}
                  style={{ ...btnPrimary, background: "rgba(239,68,68,0.1)", color: LOSS, border: "1px solid rgba(239,68,68,0.3)", opacity: processing ? 0.5 : 1 }}>
                  <XCircle size={13} /> Reject
                </button>
                <button onClick={() => handleStatusUpdate("flagged")} disabled={processing}
                  style={{ ...btnPrimary, background: "rgba(249,115,22,0.08)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)", opacity: processing ? 0.5 : 1 }}>
                  <AlertTriangle size={13} /> Flag for Review
                </button>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── ACTIVITY TIMELINE TAB ── */}
      {tab === "activity" && (
        <Section title="Activity Timeline" sub="Audit Log">
          {!activityTimeline || activityTimeline.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No activity recorded</div>
          ) : (
            <div>
              {activityTimeline.map((a: any, i: number) => (
                <div key={a.id} style={{ display: "flex", gap: 14, padding: "14px 22px", borderBottom: i < activityTimeline.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock size={12} style={{ color: BLUE }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{a.description}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>
                      {new Date(a.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · "}<span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{a.eventType}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
