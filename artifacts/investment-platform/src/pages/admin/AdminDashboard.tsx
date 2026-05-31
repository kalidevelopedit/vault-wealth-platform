import { useState, useEffect } from "react";
import { useGetAdminStats, useGetAdminUsers, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import {
  Loader2, Search, Users, CheckCircle2, Clock, XCircle,
  TrendingUp, Snowflake, ChevronRight, CheckCircle, Mail,
  Bell, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Check, X,
} from "lucide-react";

const CARD  = "#111827";
const BORD  = "rgba(255,255,255,0.07)";
const TEXT  = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.38)";
const BLUE  = "#3b82f6";
const GAIN  = "#22c55e";
const LOSS  = "#ef4444";
const AMB   = "#f59e0b";

const KYC_COLOR: Record<string, { bg: string; fg: string }> = {
  approved:    { bg: "rgba(34,197,94,0.12)",  fg: "#22c55e" },
  pending:     { bg: "rgba(245,158,11,0.12)", fg: "#f59e0b" },
  rejected:    { bg: "rgba(239,68,68,0.12)",  fg: "#ef4444" },
  flagged:     { bg: "rgba(249,115,22,0.12)", fg: "#f97316" },
  not_started: { bg: "rgba(107,114,128,0.1)", fg: "#6b7280" },
};

const FILTERS = [
  { id: "all",      label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending",  label: "Pending" },
  { id: "rejected", label: "Rejected" },
  { id: "frozen",   label: "Frozen" },
];

async function adminFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts, credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

type PendingRequest = {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  type: "deposit" | "withdraw" | "buy" | "sell";
  symbol: string | null;
  name: string | null;
  amount: number;
  status: string;
  createdAt: string;
  notes: string | null;
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: sl, isError: se } = useGetAdminStats();
  const { data: users, isLoading: ul, isError: ue, refetch } = useGetAdminUsers({ limit: 100 });
  const updateKyc = useUpdateUserKycStatus();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [tab, setTab]           = useState<"users" | "applications" | "requests">("users");
  const [actioning, setActioning] = useState<number | null>(null);

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [pendingLoading, setPendingLoading]   = useState(false);
  const [processingTx, setProcessingTx]       = useState<number | null>(null);

  const fetchPending = async () => {
    setPendingLoading(true);
    try {
      const data = await adminFetch("/admin/pending-requests");
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch {}
    finally { setPendingLoading(false); }
  };

  useEffect(() => {
    if (tab === "requests") fetchPending();
  }, [tab]);

  // Detect admin session expiry
  useEffect(() => {
    if (se || ue) {
      localStorage.removeItem("adminAuthenticated");
      setLocation("/admin");
    }
  }, [se, ue]);

  const updateTxStatus = async (txId: number, status: "completed" | "failed" | "processing") => {
    setProcessingTx(txId);
    try {
      await adminFetch(`/admin/transactions/${txId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setPendingRequests(prev => prev.filter(r => r.id !== txId));
    } catch (e: any) { alert(e.message); }
    finally { setProcessingTx(null); }
  };

  const allUsers = users?.users ?? [];

  const displayed = allUsers.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    if (filter === "frozen") return (u as any).isFrozen && matchSearch;
    const matchKyc = filter === "all" || u.kycStatus === filter;
    return matchSearch && matchKyc;
  });

  const pending = allUsers.filter(u => u.kycStatus === "pending" && u.onboardingComplete);

  const doApprove = async (id: number) => {
    setActioning(id);
    try { await updateKyc.mutateAsync({ userId: id, data: { status: "approved", notes: "Approved via admin" } }); refetch(); }
    catch {} finally { setActioning(null); }
  };
  const doDecline = async (id: number) => {
    setActioning(id);
    try { await updateKyc.mutateAsync({ userId: id, data: { status: "rejected", notes: "Declined via admin" } }); refetch(); }
    catch {} finally { setActioning(null); }
  };

  const statCards = sl ? [] : [
    { icon: Users,        label: "Total Users",     value: stats?.totalUsers,      accent: BLUE,  bg: "rgba(59,130,246,0.1)"  },
    { icon: CheckCircle2, label: "KYC Verified",    value: stats?.verifiedUsers,   accent: GAIN,  bg: "rgba(34,197,94,0.1)"  },
    { icon: Clock,        label: "Pending Review",  value: stats?.pendingKyc,      accent: AMB,   bg: "rgba(245,158,11,0.1)" },
    { icon: Snowflake,    label: "Frozen",          value: (stats as any)?.frozenUsers ?? 0, accent: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 2) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .admin-row:hover { background: rgba(255,255,255,0.025) !important; }
        .pill-filter:hover { background: rgba(255,255,255,0.07) !important; color: rgba(255,255,255,0.75) !important; }
        .manage-btn:hover { background: rgba(59,130,246,0.2) !important; }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .table-wrap table { min-width: 640px; }
        }
      `}</style>

      {/* Page title */}
      <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Administration</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, letterSpacing: "-0.025em", margin: 0 }}>Platform Dashboard</h1>
        </div>
        <Link href="/admin/email-templates" style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px",
          background: CARD, border: `1px solid ${BORD}`, borderRadius: 12,
          color: TEXT, textDecoration: "none", fontSize: 13, fontWeight: 500,
        }}>
          <Mail size={14} color={MUTED} strokeWidth={1.5} />
          Email Templates
        </Link>
      </div>

      {/* Stat cards */}
      {sl ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0 32px" }}>
          <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 36 }}>
          {statCards.map(({ icon: Icon, label, value, accent, bg }, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, padding: "22px 24px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon size={18} color={accent} strokeWidth={1.6} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value ?? "—"}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 6, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: 4, background: "rgba(255,255,255,0.04)", borderRadius: 14, width: "fit-content", marginBottom: 24 }}>
        {[
          { id: "users",        label: "User Directory" },
          { id: "applications", label: "Applications", badge: pending.length },
          { id: "requests",     label: "Pending Requests", badge: pendingRequests.length || undefined },
        ].map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id as any)} style={{
            padding: "9px 22px", borderRadius: 11, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600,
            background: tab === id ? BLUE : "transparent",
            color: tab === id ? "#fff" : MUTED,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.14s",
          }}>
            {label}
            {badge != null && badge > 0 && (
              <span style={{ background: AMB, color: "#000", borderRadius: 99, fontSize: 9, fontWeight: 800, padding: "2px 7px" }}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── USER DIRECTORY ─── */}
      {tab === "users" && (
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>All Users</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                {ul ? "Loading…" : `${displayed.length} member${displayed.length !== 1 ? "s" : ""}`}
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED, pointerEvents: "none" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email…"
                style={{
                  height: 38, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORD}`,
                  borderRadius: 11, paddingLeft: 36, paddingRight: 14, fontSize: 13,
                  color: TEXT, outline: "none", width: 220,
                }}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 4 }}>
              {FILTERS.map(f => (
                <button key={f.id} className="pill-filter" onClick={() => setFilter(f.id)} style={{
                  padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, transition: "all 0.14s",
                  background: filter === f.id ? "rgba(255,255,255,0.1)" : "transparent",
                  color: filter === f.id ? TEXT : MUTED,
                }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          {ul ? (
            <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
              <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div className="table-wrap" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Member", "Email", "Country", "Portfolio", "KYC Status", "Onboarding", ""].map((h, i) => (
                      <th key={i} style={{
                        padding: "13px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.12em", color: MUTED,
                        textAlign: i >= 3 && i <= 5 ? "right" : "left",
                        paddingLeft: i === 0 ? 24 : 16,
                        paddingRight: i === 6 ? 24 : 16,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 56, textAlign: "center", color: MUTED, fontSize: 13 }}>
                        No users match this filter.
                      </td>
                    </tr>
                  ) : displayed.map(u => {
                    const kyc    = KYC_COLOR[u.kycStatus] ?? KYC_COLOR.not_started;
                    const frozen = (u as any).isFrozen;
                    const initials = u.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={u.id} className="admin-row" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: "background 0.12s" }}>
                        {/* Member */}
                        <td style={{ padding: "16px 16px 16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                              background: frozen ? "rgba(167,139,250,0.15)" : "rgba(59,130,246,0.12)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12, fontWeight: 700, color: frozen ? "#a78bfa" : BLUE,
                            }}>{initials}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: TEXT }}>{u.fullName}</div>
                              {frozen && (
                                <div style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
                                  ❄ Frozen
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td style={{ padding: "16px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>{u.email}</td>
                        {/* Country */}
                        <td style={{ padding: "16px", color: MUTED }}>{u.country || "—"}</td>
                        {/* Portfolio */}
                        <td style={{ padding: "16px", fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                          ${((u as any).totalAssets || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        {/* KYC */}
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 99,
                            background: kyc.bg, color: kyc.fg,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: kyc.fg, flexShrink: 0 }} />
                            {u.kycStatus?.replace("_", " ")}
                          </span>
                        </td>
                        {/* Onboarding */}
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: MUTED }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: u.onboardingComplete ? GAIN : AMB }} />
                            {u.onboardingComplete ? "Complete" : `Step ${u.onboardingStep || 0}/8`}
                          </span>
                        </td>
                        {/* Action */}
                        <td style={{ padding: "16px 24px 16px 16px", textAlign: "right" }}>
                          <Link href={`/admin/users/${u.id}`} className="manage-btn" style={{
                            display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 16px",
                            borderRadius: 10, background: "rgba(59,130,246,0.1)", color: BLUE,
                            border: "1px solid rgba(59,130,246,0.18)", textDecoration: "none",
                            fontSize: 11, fontWeight: 600, transition: "all 0.14s",
                          }}>
                            Manage <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── APPLICATIONS ─── */}
      {tab === "applications" && (
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORD}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Pending Applications</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>KYC review queue</div>
          </div>

          {ul ? (
            <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
              <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : pending.length === 0 ? (
            <div style={{ padding: 80, textAlign: "center" }}>
              <CheckCircle size={40} color="rgba(255,255,255,0.08)" style={{ margin: "0 auto 14px" }} />
              <div style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}>All caught up</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>No pending applications to review.</div>
            </div>
          ) : pending.map(u => (
            <div key={u.id} style={{
              padding: "20px 24px", borderBottom: `1px solid rgba(255,255,255,0.05)`,
              display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: BLUE, flexShrink: 0,
                }}>
                  {u.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{u.fullName}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{u.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 28, flexShrink: 0 }}>
                {[
                  { label: "Country",   value: u.country || "—" },
                  { label: "Submitted", value: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Link href={`/admin/users/${u.id}`} style={{
                  padding: "9px 16px", borderRadius: 10, border: `1px solid ${BORD}`, color: MUTED,
                  fontSize: 12, fontWeight: 600, textDecoration: "none",
                }}>
                  Review
                </Link>
                <button onClick={() => doDecline(u.id)} disabled={actioning === u.id} style={{
                  padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.08)", color: LOSS, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", opacity: actioning === u.id ? 0.5 : 1,
                }}>
                  {actioning === u.id ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : "Decline"}
                </button>
                <button onClick={() => doApprove(u.id)} disabled={actioning === u.id} style={{
                  padding: "9px 18px", borderRadius: 10, border: "none",
                  background: GAIN, color: "#fff", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", opacity: actioning === u.id ? 0.5 : 1,
                }}>
                  {actioning === u.id ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : "Approve"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── PENDING REQUESTS ─── */}
      {tab === "requests" && (
        <div>
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Pending Requests</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  Deposit and withdrawal requests awaiting review
                </div>
              </div>
              <button onClick={fetchPending} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED, background: "none", border: "none", cursor: "pointer" }}>
                <RefreshCw size={13} strokeWidth={2} style={pendingLoading ? { animation: "spin 1s linear infinite" } : undefined} />
                Refresh
              </button>
            </div>

            {pendingLoading ? (
              <div style={{ padding: 60, display: "flex", justifyContent: "center" }}>
                <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : pendingRequests.length === 0 ? (
              <div style={{ padding: 80, textAlign: "center" }}>
                <Bell size={40} color="rgba(255,255,255,0.08)" style={{ margin: "0 auto 14px" }} />
                <div style={{ fontSize: 15, color: MUTED, fontWeight: 600 }}>No pending requests</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
                  All deposit and withdrawal requests have been processed.
                </div>
              </div>
            ) : (
              <div>
                {pendingRequests.map((req, i) => {
                  const isDeposit  = req.type === "deposit";
                  const isSell     = req.type === "sell";
                  const isBuy      = req.type === "buy";
                  const isProcessing = processingTx === req.id;

                  // Parse payout info for sell orders
                  let payout: any = {};
                  if (isSell && req.notes) {
                    try { const n = JSON.parse(req.notes); payout = n.payout ?? {}; } catch {}
                  }

                  const typeLabel = isDeposit ? "DEPOSIT" : isSell ? "SELL" : isBuy ? "BUY" : "WITHDRAW";
                  const typeColor = isDeposit ? GAIN : isSell || !isDeposit ? LOSS : MUTED;

                  return (
                    <div key={req.id} style={{
                      padding: "18px 24px",
                      borderBottom: i < pendingRequests.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                      display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap",
                    }}>
                      {/* Icon */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: isDeposit ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${isDeposit ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: isSell ? 14 : undefined,
                      }}>
                        {isDeposit
                          ? <ArrowDownToLine size={18} color={GAIN} strokeWidth={1.8} />
                          : isSell
                            ? <span style={{ fontSize: 14, fontWeight: 800, color: LOSS }}>S</span>
                            : <ArrowUpFromLine size={18} color={LOSS} strokeWidth={1.8} />
                        }
                      </div>

                      {/* User + payout info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{req.userFullName}</span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600,
                            background: isDeposit ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                            color: typeColor,
                          }}>
                            {typeLabel}
                          </span>
                          {req.symbol && (
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600, background: "rgba(59,130,246,0.12)", color: "#60a5fa", fontFamily: "monospace" }}>
                              {req.symbol}
                            </span>
                          )}
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600, background: "rgba(245,158,11,0.12)", color: AMB }}>
                            {req.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>
                          {req.userEmail} · <span style={{ fontFamily: "monospace" }}>#{req.id}</span> · {timeAgo(req.createdAt)}
                        </div>
                        {req.name && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{req.name}</div>}
                        {/* Sell payout destination */}
                        {isSell && payout.payoutMethod && (
                          <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 11, color: MUTED, display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {payout.payoutMethod === "bank" && (
                              <>
                                <span>🏦 <strong style={{ color: TEXT }}>{payout.bankName}</strong></span>
                                {payout.iban && <span>IBAN: <span style={{ fontFamily: "monospace", color: TEXT }}>{payout.iban}</span></span>}
                                {payout.routingNumber && <span>Routing: <span style={{ fontFamily: "monospace", color: TEXT }}>{payout.routingNumber}</span></span>}
                                {payout.accountNumber && <span>Acct: <span style={{ fontFamily: "monospace", color: TEXT }}>{payout.accountNumber}</span></span>}
                                {payout.timeline && <span style={{ color: AMB }}>⏱ {payout.timeline}</span>}
                              </>
                            )}
                            {payout.payoutMethod === "crypto" && (
                              <>
                                <span>₿ <strong style={{ color: TEXT }}>{payout.walletType}</strong></span>
                                {payout.walletAddress && <span style={{ fontFamily: "monospace", color: TEXT, wordBreak: "break-all" }}>{payout.walletAddress.slice(0, 16)}…</span>}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: isDeposit ? GAIN : LOSS, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                          {isDeposit ? "+" : "-"}${req.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>USD</div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                        <Link href={`/admin/users/${req.userId}`} style={{
                          padding: "8px 14px", borderRadius: 10, border: `1px solid ${BORD}`, color: MUTED,
                          fontSize: 11, fontWeight: 600, textDecoration: "none",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          User <ChevronRight size={12} />
                        </Link>
                        {/* Sell: simple Approve / Reject */}
                        {isSell ? (
                          <>
                            <button
                              onClick={() => updateTxStatus(req.id, "completed")}
                              disabled={isProcessing}
                              style={{
                                padding: "8px 16px", borderRadius: 10, border: "none",
                                background: GAIN, color: "#fff", fontSize: 11, fontWeight: 600,
                                cursor: "pointer", opacity: isProcessing ? 0.5 : 1,
                                display: "flex", alignItems: "center", gap: 5,
                              }}
                            >
                              {isProcessing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} strokeWidth={3} />}
                              Approve
                            </button>
                            <button
                              onClick={() => updateTxStatus(req.id, "failed")}
                              disabled={isProcessing}
                              style={{
                                padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)",
                                background: "rgba(239,68,68,0.08)", color: LOSS, fontSize: 11, fontWeight: 600,
                                cursor: "pointer", opacity: isProcessing ? 0.5 : 1,
                              }}
                            >
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </>
                        ) : (
                          /* Deposit / Withdraw: existing flow */
                          <>
                            <button
                              onClick={() => updateTxStatus(req.id, "processing")}
                              disabled={isProcessing || req.status === "processing"}
                              style={{
                                padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(245,158,11,0.25)",
                                background: "rgba(245,158,11,0.1)", color: AMB, fontSize: 11, fontWeight: 600,
                                cursor: "pointer", opacity: isProcessing ? 0.5 : 1,
                              }}
                            >
                              Processing
                            </button>
                            {req.type === "deposit" && (
                              <button
                                onClick={() => updateTxStatus(req.id, "completed")}
                                disabled={isProcessing}
                                style={{
                                  padding: "8px 16px", borderRadius: 10, border: "none",
                                  background: GAIN, color: "#fff", fontSize: 11, fontWeight: 600,
                                  cursor: "pointer", opacity: isProcessing ? 0.5 : 1,
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                {isProcessing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={12} strokeWidth={3} />}
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => updateTxStatus(req.id, "failed")}
                              disabled={isProcessing}
                              style={{
                                padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)",
                                background: "rgba(239,68,68,0.08)", color: LOSS, fontSize: 11, fontWeight: 600,
                                cursor: "pointer", opacity: isProcessing ? 0.5 : 1,
                              }}
                            >
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
