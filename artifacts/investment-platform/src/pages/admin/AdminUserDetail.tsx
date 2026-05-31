import { useRoute, Link } from "wouter";
import { useGetAdminUserDetail, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Snowflake, Flame, Trash2, Plus, DollarSign, TrendingUp, Clock, Eye, EyeOff, KeyRound,
  Search, Hash,
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

class AdminSessionExpiredError extends Error {
  code = "ADMIN_SESSION_EXPIRED";
  constructor() { super("Admin session expired"); }
}

async function adminFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts, credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) throw new AdminSessionExpiredError();
    throw new Error(data.message || "Request failed");
  }
  return data;
}

const KYC_FG: Record<string, string> = {
  approved: GAIN, pending: AMB, rejected: LOSS, flagged: "#f97316", not_started: "#6b7280",
};

const TX_TYPES = [
  { value: "deposit",             label: "Deposit",             group: "Cash" },
  { value: "withdraw",            label: "Cash Withdrawal",     group: "Cash" },
  { value: "bank_withdrawal",     label: "Bank Wire Transfer",  group: "Bank" },
  { value: "crypto_withdrawal",   label: "Crypto Withdrawal",   group: "Crypto" },
  { value: "buy",                 label: "Buy Trade",           group: "Trading" },
  { value: "sell",                label: "Sell Trade",          group: "Trading" },
  { value: "convert",             label: "Conversion",          group: "Trading" },
  { value: "fee",                 label: "Platform Fee",        group: "Other" },
  { value: "bonus",               label: "Bonus / Reward",      group: "Other" },
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

export default function AdminUserDetail({ urlUserId = 0 }: { urlUserId?: number } = {}) {
  const [_, params] = useRoute("/admin/users/:id");
  const userId = urlUserId || Number(params?.id);

  const { data: detail, isLoading, refetch } = useGetAdminUserDetail(userId, { query: { enabled: !!userId, refetchInterval: 30000 } as any });
  const updateStatus = useUpdateUserKycStatus();

  const [notes,      setNotes]      = useState("");
  const [processing, setProcessing] = useState(false);
  const [tab,        setTab]        = useState<string>("overview");

  // Smart asset search state
  const [assetQuery,    setAssetQuery]    = useState("");
  const [assetResults,  setAssetResults]  = useState<any[]>([]);
  const [assetSearching, setAssetSearching] = useState(false);
  const [showAssetDrop, setShowAssetDrop] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assetUsdMode,  setAssetUsdMode]  = useState(true);
  const [assetUsdAmt,   setAssetUsdAmt]   = useState("");
  const [assetQty,      setAssetQty]      = useState("");
  const [assetCost,     setAssetCost]     = useState("");
  const [assetLoading,  setAssetLoading]  = useState(false);
  const assetSearchTimer = useRef<any>(null);

  const [cashAmount,  setCashAmount]  = useState("");
  const [cashLoading, setCashLoading] = useState(false);

  const [txType,    setTxType]    = useState("deposit");
  const [txAmount,  setTxAmount]  = useState("");
  const [txName,    setTxName]    = useState("");
  const [txSymbol,  setTxSymbol]  = useState("");
  const [txStatus,  setTxStatus]  = useState("completed");
  const [txLoading, setTxLoading] = useState(false);

  // Bank withdrawal fields
  const [bankName,    setBankName]    = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankRouting, setBankRouting] = useState("");
  const [bankIban,    setBankIban]    = useState("");
  const [bankSwift,   setBankSwift]   = useState("");
  const [bankRef,     setBankRef]     = useState("");

  // Crypto withdrawal fields
  const [cryptoAddress,  setCryptoAddress]  = useState("");
  const [cryptoNetwork,  setCryptoNetwork]  = useState("ERC-20");
  const [cryptoTxHash,   setCryptoTxHash]   = useState("");

  // Cash increment
  const [cashDelta,     setCashDelta]     = useState("");
  const [cashDeltaSign, setCashDeltaSign] = useState<"add" | "sub">("add");
  const [cashDeltaLoading, setCashDeltaLoading] = useState(false);

  // Password reset
  const [newPassword,  setNewPassword]  = useState("");
  const [pwLoading,    setPwLoading]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Re-auth interceptor
  const [showReauth,    setShowReauth]    = useState(false);
  const [reauthCode,    setReauthCode]    = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const pendingFn = useRef<(() => Promise<void>) | null>(null);

  // Pending buy approvals
  const [approvingTx,  setApprovingTx]  = useState<number | null>(null);

  // Asset search — must be before early returns to satisfy Rules of Hooks
  const searchAssets = useCallback(async (q: string) => {
    if (!q.trim()) { setAssetResults([]); setShowAssetDrop(false); return; }
    setAssetSearching(true);
    try {
      const res = await adminFetch(`/admin/assets/search?q=${encodeURIComponent(q)}`);
      setAssetResults(Array.isArray(res) ? res : []);
      setShowAssetDrop(true);
    } catch {}
    finally { setAssetSearching(false); }
  }, []);

  if (isLoading) return (
    <div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
      <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!detail) return <div style={{ padding: 48, textAlign: "center", color: MUTED }}>User not found</div>;

  const { user, balance, kycDocuments, selfieStatus, holdings, recentTransactions, activityTimeline } = detail as any;
  const isFrozen = user?.isFrozen ?? false;
  const UID = `VW-${String(user?.id ?? userId).padStart(6, "0")}`;
  const kycColor = KYC_FG[user?.kycStatus] ?? "#6b7280";
  const safeName: string = user?.fullName || user?.email || "Unknown";
  const initials = safeName.split(" ").map((n: string) => n?.[0] ?? "").filter(Boolean).join("").slice(0, 2).toUpperCase() || "??";

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
    if (!window.confirm(`Permanently delete ${safeName}? This cannot be undone.`)) return;
    setProcessing(true);
    try {
      await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
      toast.success("User deleted");
      window.location.href = "/admin/dashboard";
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessing(false); }
  };

  const onAssetQueryChange = (v: string) => {
    setAssetQuery(v);
    setSelectedAsset(null);
    clearTimeout(assetSearchTimer.current);
    assetSearchTimer.current = setTimeout(() => searchAssets(v), 320);
  };

  const selectAsset = (a: any) => {
    setSelectedAsset(a);
    setAssetQuery(`${a.symbol} — ${a.name}`);
    setShowAssetDrop(false);
  };

  const doAsset = async () => {
    if (!selectedAsset) { toast.error("Select an asset from the search results"); return; }
    const hasAmt = assetUsdMode ? !!assetUsdAmt && parseFloat(assetUsdAmt) > 0 : !!assetQty;
    if (!hasAmt) { toast.error(assetUsdMode ? "Enter a USD amount" : "Enter a quantity (0 to remove)"); return; }
    setAssetLoading(true);
    try {
      const body: any = { symbol: selectedAsset.symbol };
      if (assetUsdMode) {
        body.usdAmount = parseFloat(assetUsdAmt);
        body.averageCost = selectedAsset.currentPrice;
      } else {
        body.quantity = parseFloat(assetQty);
        body.averageCost = assetCost || undefined;
      }
      await adminFetch(`/admin/users/${userId}/assets`, { method: "POST", body: JSON.stringify(body) });
      toast.success(`${selectedAsset.symbol} position updated`);
      setAssetQuery(""); setSelectedAsset(null); setAssetUsdAmt(""); setAssetQty(""); setAssetCost(""); refetch();
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

  const doCashDelta = async () => {
    if (!cashDelta) { toast.error("Enter an amount"); return; }
    const currentCash = balance?.availableCash || 0;
    const delta = parseFloat(cashDelta);
    const newAmount = cashDeltaSign === "add" ? currentCash + delta : Math.max(0, currentCash - delta);
    setCashDeltaLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/cash`, { method: "PATCH", body: JSON.stringify({ amount: newAmount }) });
      toast.success(`Cash balance ${cashDeltaSign === "add" ? "increased" : "decreased"} by $${delta.toFixed(2)}`);
      setCashDelta(""); refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setCashDeltaLoading(false); }
  };

  const doTx = async () => {
    if (!txAmount) { toast.error("Amount required"); return; }
    setTxLoading(true);
    try {
      const bankDetails = txType === "bank_withdrawal" ? {
        bankName: bankName || undefined,
        bankAccount: bankAccount || undefined,
        bankRouting: bankRouting || undefined,
        bankIban: bankIban || undefined,
        bankSwift: bankSwift || undefined,
        bankRef: bankRef || undefined,
      } : undefined;
      const cryptoDetails = txType === "crypto_withdrawal" ? {
        cryptoAddress: cryptoAddress || undefined,
        cryptoNetwork: cryptoNetwork || undefined,
        cryptoTxHash: cryptoTxHash || undefined,
      } : undefined;
      await adminFetch(`/admin/users/${userId}/transactions`, {
        method: "POST",
        body: JSON.stringify({
          type: txType, amount: txAmount, name: txName || undefined,
          symbol: txSymbol || undefined, status: txStatus,
          ...(bankDetails || {}), ...(cryptoDetails || {}),
          notes: bankDetails
            ? `Bank: ${bankName || "—"} | Acc: ${bankAccount || "—"} | Routing: ${bankRouting || "—"} | IBAN: ${bankIban || "—"} | SWIFT: ${bankSwift || "—"} | Ref: ${bankRef || "—"}`
            : cryptoDetails
            ? `Addr: ${cryptoAddress || "—"} | Network: ${cryptoNetwork} | TxHash: ${cryptoTxHash || "—"}`
            : undefined,
        }),
      });
      toast.success("Activity record added");
      setTxAmount(""); setTxName(""); setTxSymbol(""); setTxType("deposit");
      setBankName(""); setBankAccount(""); setBankRouting(""); setBankIban(""); setBankSwift(""); setBankRef("");
      setCryptoAddress(""); setCryptoTxHash("");
      refetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setTxLoading(false); }
  };

  const doSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Minimum 6 characters"); return; }
    setPwLoading(true);
    try {
      await adminFetch(`/admin/users/${userId}/password`, { method: "PATCH", body: JSON.stringify({ password: newPassword }) });
      toast.success("Password updated successfully");
      setNewPassword("");
      refetch();
    } catch (e: any) {
      if (e instanceof AdminSessionExpiredError) { pendingFn.current = doSetPassword; setShowReauth(true); }
      else toast.error(e.message);
    }
    finally { setPwLoading(false); }
  };

  const runSafe = async (fn: () => Promise<void>) => {
    try { await fn(); }
    catch (e: any) {
      if (e instanceof AdminSessionExpiredError) { pendingFn.current = fn; setShowReauth(true); }
      else toast.error(e.message);
    }
  };

  const submitReauth = async () => {
    if (!reauthCode.trim()) { toast.error("Enter the admin passcode"); return; }
    setReauthLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ passcode: reauthCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid passcode");
      setShowReauth(false);
      setReauthCode("");
      toast.success("Re-authenticated successfully");
      if (pendingFn.current) {
        const fn = pendingFn.current;
        pendingFn.current = null;
        await fn();
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setReauthLoading(false); }
  };

  const approveOrder = async (txId: number, mode: "cash" | "invest" | "both") => {
    setApprovingTx(txId);
    await runSafe(async () => {
      await adminFetch(`/admin/transactions/${txId}/status`, {
        method: "PATCH", body: JSON.stringify({ status: "completed", approvalMode: mode }),
      });
      toast.success(`Buy order approved (${mode})`);
      refetch();
    });
    setApprovingTx(null);
  };

  const rejectOrder = async (txId: number) => {
    if (!window.confirm("Reject this buy order? Funds will be returned to the user.")) return;
    setApprovingTx(txId);
    await runSafe(async () => {
      await adminFetch(`/admin/transactions/${txId}/status`, {
        method: "PATCH", body: JSON.stringify({ status: "failed" }),
      });
      toast.success("Buy order rejected — funds returned");
      refetch();
    });
    setApprovingTx(null);
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
              <h1 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: 0 }}>{safeName}</h1>
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
              {user?.email} · {UID} · Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
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

            {/* Password Reset */}
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 10 }}>
                <KeyRound size={14} color={MUTED} />
                <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>Account Security</div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {user.lastSetPassword && (
                  <div style={{
                    marginBottom: 14, padding: "10px 14px", borderRadius: 10,
                    background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Last Set Password</div>
                      <div style={{ fontSize: 14, fontFamily: "monospace", color: TEXT, fontWeight: 600 }}>{user.lastSetPassword}</div>
                    </div>
                    <KeyRound size={16} color={BLUE} />
                  </div>
                )}
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 14 }}>Set a new password for this user's account.</div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && doSetPassword()}
                    style={{ ...inputSx, paddingRight: 40 }}
                  />
                  <button onClick={() => setShowPassword(v => !v)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 0, display: "flex",
                  }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button onClick={doSetPassword} disabled={pwLoading} style={{
                  marginTop: 10, width: "100%", height: 40, background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.25)", borderRadius: 11,
                  color: BLUE, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  opacity: pwLoading ? 0.6 : 1,
                }}>
                  {pwLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={14} />}
                  Update Password
                </button>
              </div>
            </div>

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
              <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Smart search */}
                <div>
                  <label style={labelSx}>Search Asset (name, symbol, or alias)</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "relative" }}>
                      <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
                      {assetSearching && <Loader2 size={12} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, animation: "spin 1s linear infinite" }} />}
                      <input
                        style={{ ...inputSx, paddingLeft: 36 }}
                        value={assetQuery}
                        onChange={e => onAssetQueryChange(e.target.value)}
                        placeholder='e.g. "bitcoin", "AAPL", "gold", "nvidia"'
                        onFocus={() => assetResults.length > 0 && setShowAssetDrop(true)}
                        onBlur={() => setTimeout(() => setShowAssetDrop(false), 180)}
                      />
                    </div>
                    {showAssetDrop && assetResults.length > 0 && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 60,
                        background: CARD, border: `1px solid ${BORD}`, borderRadius: 12,
                        boxShadow: "0 12px 40px rgba(0,0,0,0.8)", maxHeight: 220, overflowY: "auto",
                      }}>
                        {assetResults.map(a => (
                          <button key={a.id} onMouseDown={() => selectAsset(a)} style={{
                            width: "100%", padding: "10px 14px", background: "transparent",
                            border: "none", display: "flex", alignItems: "center", gap: 12,
                            cursor: "pointer", textAlign: "left",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(59,130,246,0.08)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                              background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: 10, fontWeight: 800, color: BLUE,
                            }}>{a.symbol.slice(0, 3)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{a.symbol}</div>
                              <div style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums" }}>
                                ${a.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </div>
                              <div style={{ fontSize: 9, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>{a.assetType}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected asset preview */}
                {selectedAsset && (
                  <div style={{
                    background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 10, padding: "10px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{selectedAsset.symbol} <span style={{ fontWeight: 400, color: MUTED }}>— {selectedAsset.name}</span></div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        Current price: <span style={{ color: TEXT, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>${selectedAsset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                        {assetUsdMode && assetUsdAmt && parseFloat(assetUsdAmt) > 0 && (
                          <span style={{ color: BLUE, marginLeft: 8 }}>
                            = {(parseFloat(assetUsdAmt) / selectedAsset.currentPrice).toLocaleString("en-US", { maximumFractionDigits: 6 })} units
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => { setSelectedAsset(null); setAssetQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: 16, padding: 0 }}>✕</button>
                  </div>
                )}

                {/* Input mode toggle */}
                <div>
                  <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 8, width: "fit-content", marginBottom: 10 }}>
                    {[
                      { id: true,  label: "USD Amount" },
                      { id: false, label: "Quantity"   },
                    ].map(({ id, label }) => (
                      <button key={String(id)} onClick={() => setAssetUsdMode(id)} style={{
                        padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 600,
                        background: assetUsdMode === id ? BLUE : "transparent",
                        color: assetUsdMode === id ? "#fff" : MUTED,
                      }}>{label}</button>
                    ))}
                  </div>

                  {assetUsdMode ? (
                    <div>
                      <label style={labelSx}>USD Amount to Allocate</label>
                      <div style={{ display: "flex", alignItems: "center", height: 42, background: CARD2, border: `1px solid ${BORD}`, borderRadius: 11, padding: "0 14px", gap: 6 }}>
                        <span style={{ color: MUTED, fontSize: 14 }}>$</span>
                        <input type="number" placeholder="0.00" value={assetUsdAmt} onChange={e => setAssetUsdAmt(e.target.value)}
                          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, fontVariantNumeric: "tabular-nums" }} />
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                        {[1000, 5000, 10000, 25000, 50000].map(n => (
                          <button key={n} onClick={() => setAssetUsdAmt(String(n))} style={{
                            flex: 1, height: 26, fontSize: 10, borderRadius: 6, border: `1px solid ${BORD}`,
                            background: assetUsdAmt === String(n) ? "rgba(59,130,246,0.12)" : CARD2,
                            color: assetUsdAmt === String(n) ? BLUE : MUTED, cursor: "pointer",
                          }}>${(n / 1000).toFixed(0)}K</button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={labelSx}>Quantity (0 = remove holding)</label>
                        <input style={inputSx} type="number" placeholder="0.00000000" value={assetQty} onChange={e => setAssetQty(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelSx}>Avg Cost Override (optional)</label>
                        <input style={inputSx} type="number" placeholder="Defaults to current price" value={assetCost} onChange={e => setAssetCost(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={doAsset} disabled={assetLoading || !selectedAsset} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, border: "none", cursor: selectedAsset ? "pointer" : "not-allowed",
                  background: selectedAsset ? BLUE : "rgba(255,255,255,0.06)",
                  color: selectedAsset ? "#fff" : MUTED, fontSize: 12, fontWeight: 700,
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

      {/* ═══════════════ ACTIVITY ═══════════════ */}
      {tab === "transactions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }} className="ud-asset-grid">

          {/* ── Pending Buy Orders ── */}
          {(() => {
            const pendingBuys = (recentTransactions ?? []).filter((t: any) => t.type === "buy" && t.status === "pending");
            if (!pendingBuys.length) return null;
            return (
              <div style={{ gridColumn: "1 / -1", background: CARD, border: `1.5px solid ${AMB}`, borderRadius: 18, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ padding: "16px 24px", borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: AMB, boxShadow: "0 0 8px rgba(245,158,11,0.5)" }} />
                  <div style={{ fontSize: 10, fontWeight: 700, color: AMB, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Pending Buy Orders ({pendingBuys.length}) — Awaiting Approval
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {pendingBuys.map((t: any) => {
                    let fundingCurrency = "USD";
                    let swapFee = 0;
                    try { const n = JSON.parse(t.notes || "{}"); fundingCurrency = n.fundingCurrency || "USD"; swapFee = parseFloat(n.swapFee) || 0; } catch {}
                    return (
                      <div key={t.id} style={{
                        padding: "16px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                      }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: AMB,
                          }}>{t.symbol?.slice(0, 3) || "BUY"}</div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                              Buy {t.symbol} — ${parseFloat(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "flex", gap: 8 }}>
                              <span>{t.quantity ? `${parseFloat(t.quantity).toFixed(6)} units` : ""}</span>
                              <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
                              <span>via {fundingCurrency}</span>
                              {swapFee > 0 && <><span style={{ color: "rgba(255,255,255,0.12)" }}>·</span><span style={{ color: AMB }}>fee ${swapFee}</span></>}
                              <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
                              <span>{new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                          {[
                            { mode: "invest" as const,  label: "→ Invest",       bg: GAIN,                 tip: "Create holding position" },
                            { mode: "cash"   as const,  label: "→ Cash",          bg: BLUE,                 tip: "Credit to available cash" },
                            { mode: "both"   as const,  label: "→ Both",          bg: "#a78bfa",            tip: "Invest + credit cash" },
                          ].map(({ mode, label, bg }) => (
                            <button key={mode} onClick={() => approveOrder(t.id, mode)} disabled={approvingTx === t.id} style={{
                              padding: "7px 14px", borderRadius: 9, border: "none", cursor: "pointer",
                              background: bg, color: "#fff", fontSize: 11, fontWeight: 700,
                              opacity: approvingTx === t.id ? 0.5 : 1,
                              display: "flex", alignItems: "center", gap: 5,
                            }}>
                              {approvingTx === t.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : null}
                              {label}
                            </button>
                          ))}
                          <button onClick={() => rejectOrder(t.id)} disabled={approvingTx === t.id} style={{
                            padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)",
                            background: "rgba(239,68,68,0.08)", color: LOSS, fontSize: 11, fontWeight: 700,
                            cursor: "pointer", opacity: approvingTx === t.id ? 0.5 : 1,
                          }}>
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Activity Feed */}
          <Card title="Recent Activity" sub="Transaction History">
            {!recentTransactions?.length ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>No activity recorded yet</div>
            ) : recentTransactions.map((t: any) => {
              const isCredit = ["deposit", "sell", "bonus"].includes(t.type);
              const label = TX_TYPES.find(x => x.value === t.type)?.label ?? t.type;
              const statusColor = t.status === "completed" ? GAIN : t.status === "pending" ? AMB : LOSS;
              const typeIcon: Record<string, string> = {
                deposit: "↓", withdraw: "↑", bank_withdrawal: "🏦", crypto_withdrawal: "₿",
                buy: "B", sell: "S", convert: "⇄", fee: "F", bonus: "★",
              };
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "14px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`, gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isCredit ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                      border: `1px solid ${isCredit ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: t.type === "bank_withdrawal" || t.type === "crypto_withdrawal" ? 14 : 16,
                      color: isCredit ? GAIN : LOSS,
                    }}>{typeIcon[t.type] || (isCredit ? "↓" : "↑")}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{t.name || label}</div>
                      <div style={{ fontSize: 11, color: MUTED, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span>{label}</span>
                        <span style={{ color: "rgba(255,255,255,0.12)" }}>·</span>
                        <span>{new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {t.symbol && <><span style={{ color: "rgba(255,255,255,0.12)" }}>·</span><span style={{ fontFamily: "monospace", color: BLUE }}>{t.symbol}</span></>}
                      </div>
                      {/* Bank/Crypto details if present */}
                      {(t.notes) && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, fontFamily: "monospace", maxWidth: 360, wordBreak: "break-all" }}>
                          {t.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isCredit ? GAIN : LOSS, fontVariantNumeric: "tabular-nums" }}>
                      {isCredit ? "+" : "-"}${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: statusColor,
                      background: `${statusColor}18`, border: `1px solid ${statusColor}30`,
                      borderRadius: 99, padding: "2px 7px",
                      display: "inline-block", marginTop: 4,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>

          {/* Right control panel */}
          <div>
            {/* Quick Cash Adjustment */}
            <Card title="Quick Balance Adjustment" sub="Cash Control">
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  {(["add", "sub"] as const).map(sign => (
                    <button key={sign} onClick={() => setCashDeltaSign(sign)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700,
                      background: cashDeltaSign === sign ? (sign === "add" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)") : "rgba(255,255,255,0.04)",
                      color: cashDeltaSign === sign ? (sign === "add" ? GAIN : LOSS) : MUTED,
                    }}>
                      {sign === "add" ? "+ Add" : "− Deduct"}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>
                  Current: <strong style={{ color: TEXT }}>${(balance?.availableCash || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </div>
                <input style={inputSx} type="number" placeholder="Amount to add or deduct" value={cashDelta} onChange={e => setCashDelta(e.target.value)} />
                {cashDelta && parseFloat(cashDelta) > 0 && (
                  <div style={{ fontSize: 11, color: MUTED }}>
                    New balance: <strong style={{ color: cashDeltaSign === "add" ? GAIN : AMB }}>
                      ${(cashDeltaSign === "add" ? (balance?.availableCash || 0) + parseFloat(cashDelta) : Math.max(0, (balance?.availableCash || 0) - parseFloat(cashDelta))).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                )}
                <button onClick={doCashDelta} disabled={cashDeltaLoading} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  background: cashDeltaSign === "add" ? GAIN : LOSS,
                  color: "#fff", fontSize: 12, fontWeight: 700, opacity: cashDeltaLoading ? 0.6 : 1,
                }}>
                  {cashDeltaLoading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <DollarSign size={12} />}
                  {cashDeltaLoading ? "Updating…" : cashDeltaSign === "add" ? "Add to Balance" : "Deduct from Balance"}
                </button>
                <div style={{ height: 1, background: BORD, margin: "4px 0" }} />
                <label style={labelSx}>Or set exact balance</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...inputSx, flex: 1 }} type="number" placeholder="0.00" value={cashAmount} onChange={e => setCashAmount(e.target.value)} />
                  <button onClick={doCash} disabled={cashLoading} style={{
                    padding: "0 14px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700, opacity: cashLoading ? 0.6 : 1,
                    whiteSpace: "nowrap",
                  }}>
                    {cashLoading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : "Set"}
                  </button>
                </div>
              </div>
            </Card>

            {/* Add Activity */}
            <Card title="Add Activity Record" sub="Manual Entry">
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={labelSx}>Activity Type</label>
                  <select style={{ ...inputSx, appearance: "none" }} value={txType} onChange={e => setTxType(e.target.value)}>
                    {TX_TYPES.map(({ value, label, group }) => (
                      <option key={value} value={value}>[{group}] {label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelSx}>Amount ($)</label>
                    <input style={inputSx} type="number" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelSx}>Status</label>
                    <select style={{ ...inputSx, appearance: "none" }} value={txStatus} onChange={e => setTxStatus(e.target.value)}>
                      {["completed","pending","processing","failed"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelSx}>Label / Description</label>
                  <input style={inputSx} placeholder="e.g. Wire Transfer from Chase" value={txName} onChange={e => setTxName(e.target.value)} />
                </div>
                <div>
                  <label style={labelSx}>Asset Symbol (optional)</label>
                  <input style={inputSx} placeholder="e.g. BTC, AAPL" value={txSymbol} onChange={e => setTxSymbol(e.target.value.toUpperCase())} />
                </div>

                {/* Bank Withdrawal Fields */}
                {txType === "bank_withdrawal" && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, paddingTop: 8, borderTop: `1px solid ${BORD}` }}>
                      Bank Details
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={labelSx}>Bank Name</label>
                        <input style={inputSx} placeholder="Chase Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelSx}>Account Number</label>
                        <input style={inputSx} placeholder="****1234" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelSx}>Routing Number</label>
                        <input style={inputSx} placeholder="021000021" value={bankRouting} onChange={e => setBankRouting(e.target.value)} />
                      </div>
                      <div>
                        <label style={labelSx}>SWIFT / BIC</label>
                        <input style={inputSx} placeholder="CHASUS33" value={bankSwift} onChange={e => setBankSwift(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelSx}>IBAN (international)</label>
                      <input style={inputSx} placeholder="GB29 NWBK 6016 1331 9268 19" value={bankIban} onChange={e => setBankIban(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelSx}>Reference / Memo</label>
                      <input style={inputSx} placeholder="Wire ref or memo" value={bankRef} onChange={e => setBankRef(e.target.value)} />
                    </div>
                  </>
                )}

                {/* Crypto Withdrawal Fields */}
                {txType === "crypto_withdrawal" && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, paddingTop: 8, borderTop: `1px solid ${BORD}` }}>
                      Crypto Details
                    </div>
                    <div>
                      <label style={labelSx}>Wallet Address</label>
                      <input style={{ ...inputSx, fontFamily: "monospace", fontSize: 11 }} placeholder="0x1234…abcd" value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelSx}>Network / Chain</label>
                        <select style={{ ...inputSx, appearance: "none" }} value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)}>
                          {["ERC-20 (Ethereum)","BEP-20 (BSC)","TRC-20 (Tron)","SOL (Solana)","BTC (Bitcoin)","Polygon","Avalanche","Arbitrum","Optimism"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelSx}>TX Hash (optional)</label>
                      <input style={{ ...inputSx, fontFamily: "monospace", fontSize: 11 }} placeholder="0xabcd…" value={cryptoTxHash} onChange={e => setCryptoTxHash(e.target.value)} />
                    </div>
                  </>
                )}

                <button onClick={doTx} disabled={txLoading} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "11px 0", borderRadius: 11, border: "none", cursor: "pointer",
                  background: BLUE, color: "#fff", fontSize: 12, fontWeight: 700,
                  opacity: txLoading ? 0.6 : 1, marginTop: 4,
                }}>
                  {txLoading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />}
                  {txLoading ? "Adding…" : "Add Activity Record"}
                </button>
              </div>
            </Card>
          </div>
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

      {/* ── Re-auth Modal ── */}
      {showReauth && (
        <div onClick={() => setShowReauth(false)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: CARD, border: `1px solid ${BORD}`, borderRadius: 20,
            maxWidth: 380, width: "100%", padding: 28,
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
              }}>
                <KeyRound size={22} color={BLUE} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Session Expired</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Your admin session has expired. Enter the admin passcode to continue.
              </div>
            </div>
            <input
              type="password"
              autoFocus
              placeholder="Admin passcode"
              value={reauthCode}
              onChange={e => setReauthCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitReauth()}
              style={{ ...inputSx, fontSize: 15, textAlign: "center", letterSpacing: "0.15em", marginBottom: 12 }}
            />
            <button onClick={submitReauth} disabled={reauthLoading} style={{
              width: "100%", height: 44, borderRadius: 12, border: "none",
              background: BLUE, color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: reauthLoading ? 0.6 : 1,
            }}>
              {reauthLoading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Verifying…</> : "Verify & Continue"}
            </button>
            <button onClick={() => setShowReauth(false)} style={{
              marginTop: 8, width: "100%", height: 36, borderRadius: 10, border: `1px solid ${BORD}`,
              background: "transparent", color: MUTED, fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}
