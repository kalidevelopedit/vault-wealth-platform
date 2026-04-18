import { useState } from "react";
import { useGetAdminStats, useGetAdminUsers, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Search, Users, CheckCircle, Clock, XCircle, TrendingUp, Snowflake } from "lucide-react";

const BG = "#080c14";
const CARD = "#0f1523";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED = "rgba(255,255,255,0.36)";
const BLUE = "#3b82f6";

const KYC_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  approved:    { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", dot: "#22c55e" },
  pending:     { bg: "rgba(245,158,11,0.1)",  text: "#f59e0b", dot: "#f59e0b" },
  rejected:    { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", dot: "#ef4444" },
  flagged:     { bg: "rgba(249,115,22,0.1)",  text: "#f97316", dot: "#f97316" },
  not_started: { bg: "rgba(107,114,128,0.1)", text: "#6b7280", dot: "#6b7280" },
};

export default function AdminDashboard() {
  const { data: stats, isLoading: sl } = useGetAdminStats();
  const { data: users, isLoading: ul, refetch } = useGetAdminUsers({ limit: 100 });
  const updateKyc = useUpdateUserKycStatus();
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [tab, setTab] = useState<"users" | "applications">("users");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const allUsers = users?.users ?? [];
  const filtered = allUsers.filter((u) => {
    const matchSearch = !search
      || u.fullName.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase());
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    const matchFrozen = kycFilter === "frozen" ? (u as any).isFrozen : !((u as any).isFrozen && kycFilter !== "all");
    if (kycFilter === "frozen") return (u as any).isFrozen && matchSearch;
    return matchSearch && matchKyc;
  });

  const pendingApplications = allUsers.filter(u => u.kycStatus === "pending" && u.onboardingComplete);

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      await updateKyc.mutateAsync({ userId, data: { status: "approved", notes: "Approved via admin dashboard" } });
      refetch();
    } catch { } finally { setActionLoading(null); }
  };

  const handleDecline = async (userId: number) => {
    setActionLoading(userId);
    try {
      await updateKyc.mutateAsync({ userId, data: { status: "rejected", notes: "Declined via admin dashboard" } });
      refetch();
    } catch { } finally { setActionLoading(null); }
  };

  const statCards = [
    { icon: Users,       label: "Total Users",      value: stats?.totalUsers,     color: BLUE },
    { icon: CheckCircle, label: "KYC Verified",      value: stats?.verifiedUsers,  color: "#22c55e" },
    { icon: Clock,       label: "Pending Review",    value: stats?.pendingKyc,     color: "#f59e0b" },
    { icon: XCircle,     label: "Rejected",          value: stats?.rejectedKyc,    color: "#ef4444" },
    { icon: Snowflake,   label: "Frozen Accounts",   value: (stats as any)?.frozenUsers ?? 0, color: "#a78bfa" },
    { icon: TrendingUp,  label: "Platform AUM",
      value: `$${((stats?.totalPlatformAssets || 0) / 1000).toFixed(1)}K`,
      color: "#3b82f6" },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 24px 60px", fontFamily: "Inter,system-ui,sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Administration</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em", margin: 0 }}>Platform Dashboard</h1>
        </div>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 28 }}>
        {sl ? (
          <div style={{ gridColumn: "1/-1", padding: 32, display: "flex", justifyContent: "center" }}>
            <Loader2 size={18} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
          </div>
        ) : statCards.map(({ icon: Icon, label, value, color }, i) => (
          <div key={i} style={{
            background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "18px 20px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={13} style={{ color }} strokeWidth={1.5} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{value ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", padding: 4, borderRadius: 99, width: "fit-content", marginBottom: 20 }}>
        {[
          { id: "users", label: "User Directory" },
          { id: "applications", label: "Applications", badge: pendingApplications.length },
        ].map(({ id, label, badge }) => (
          <button key={id} onClick={() => setTab(id as any)}
            style={{
              padding: "8px 20px", borderRadius: 99, border: "none", cursor: "pointer",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              background: tab === id ? BLUE : "transparent",
              color: tab === id ? "#fff" : MUTED,
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.15s",
            }}>
            {label}
            {badge && badge > 0 && (
              <span style={{ background: "#f59e0b", color: "#000", borderRadius: 99, fontSize: 8, fontWeight: 800, padding: "2px 6px" }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── USER DIRECTORY TAB ── */}
      {tab === "users" && (
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: `1px solid ${BORD}`, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>Registry</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>All Users</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED }} />
                <input
                  style={{
                    height: 36, background: "rgba(255,255,255,0.04)", border: `1px solid ${BORD}`, borderRadius: 10,
                    paddingLeft: 34, paddingRight: 12, fontSize: 12, color: TEXT, outline: "none", width: 200,
                  }}
                  placeholder="Search users…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Filter pills */}
              <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 99 }}>
                {["all", "approved", "pending", "rejected", "frozen"].map(s => (
                  <button key={s} onClick={() => setKycFilter(s)}
                    style={{
                      padding: "5px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "capitalize",
                      background: kycFilter === s ? "rgba(255,255,255,0.08)" : "transparent",
                      color: kycFilter === s ? TEXT : MUTED,
                      transition: "all 0.14s",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {ul ? (
            <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
              <Loader2 size={18} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}`, background: "rgba(255,255,255,0.02)" }}>
                    {["User", "Email", "Country", "Portfolio", "Joined", "KYC Status", "Onboarding", "Actions"].map((h, i) => (
                      <th key={h} style={{
                        padding: "10px 16px", fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.14em", color: MUTED,
                        textAlign: i === 0 ? "left" : i === 7 ? "right" : "left",
                        paddingLeft: i === 0 ? 24 : 16,
                        paddingRight: i === 7 ? 24 : 16,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(kycFilter === "frozen"
                    ? allUsers.filter(u => (u as any).isFrozen && (!search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())))
                    : filtered
                  ).map(u => {
                    const kyc = KYC_COLOR[u.kycStatus] ?? KYC_COLOR.not_started;
                    const frozen = (u as any).isFrozen;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: "background 0.12s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 16px 14px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: "50%",
                              background: frozen ? "rgba(167,139,250,0.15)" : "rgba(59,130,246,0.15)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700, color: frozen ? "#a78bfa" : BLUE, flexShrink: 0,
                            }}>
                              {u.fullName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{u.fullName}</div>
                              {frozen && <div style={{ fontSize: 9, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Frozen</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>{u.email}</td>
                        <td style={{ padding: "14px 16px", color: MUTED }}>{u.country || "—"}</td>
                        <td style={{ padding: "14px 16px", color: TEXT, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          ${((u as any).totalAssets || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td style={{ padding: "14px 16px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>
                          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 99,
                            background: kyc.bg, color: kyc.text,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: kyc.dot, flexShrink: 0 }} />
                            {u.kycStatus?.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: MUTED }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: u.onboardingComplete ? "#22c55e" : "#f59e0b", flexShrink: 0 }} />
                            {u.onboardingComplete ? "Complete" : `Step ${u.onboardingStep || 0}/8`}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px 14px 16px", textAlign: "right" }}>
                          <Link href={`/admin/users/${u.id}`}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                              padding: "6px 14px", borderRadius: 8,
                              background: "rgba(59,130,246,0.1)", color: BLUE,
                              border: "1px solid rgba(59,130,246,0.2)", textDecoration: "none",
                              transition: "all 0.14s",
                            }}>
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 40, textAlign: "center", color: MUTED, fontSize: 13 }}>
                        No users match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {tab === "applications" && (
        <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}` }}>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2 }}>KYC Review Queue</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Pending Applications</div>
          </div>

          {ul ? (
            <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
              <Loader2 size={18} style={{ color: MUTED, animation: "spin 1s linear infinite" }} />
            </div>
          ) : pendingApplications.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <CheckCircle size={32} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 14, color: MUTED }}>No pending applications.</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>All applications have been reviewed.</div>
            </div>
          ) : (
            <div>
              {pendingApplications.map(u => (
                <div key={u.id} style={{
                  padding: "20px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: BLUE, flexShrink: 0 }}>
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{u.fullName}</div>
                      <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{u.email}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                    {[
                      { label: "Country", value: u.country || "—" },
                      { label: "Submitted", value: new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) },
                      { label: "Balance", value: `$${(u.availableBalance || 0).toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Link href={`/admin/users/${u.id}`}
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "8px 14px", borderRadius: 8, border: `1px solid ${BORD}`, color: MUTED,
                        textDecoration: "none", transition: "all 0.14s",
                      }}>
                      Details
                    </Link>
                    <button onClick={() => handleDecline(u.id)} disabled={actionLoading === u.id}
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer",
                        opacity: actionLoading === u.id ? 0.5 : 1,
                      }}>
                      {actionLoading === u.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : "Decline"}
                    </button>
                    <button onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}
                      style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "8px 16px", borderRadius: 8, border: "none",
                        background: "#22c55e", color: "#fff", cursor: "pointer",
                        opacity: actionLoading === u.id ? 0.5 : 1,
                      }}>
                      {actionLoading === u.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
