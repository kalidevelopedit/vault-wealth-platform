import { useState } from "react";
import { useGetAdminStats, useGetAdminUsers, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Search, Users, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

const CARD = "bg-white rounded-2xl border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

const KYC_DOT: Record<string, string> = {
  approved: "#2b6b4e",
  pending: "#8a6e2f",
  rejected: "#943636",
  flagged: "#b45309",
  not_started: "#9ca3af",
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
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter;
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

  return (
    <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">Administration</div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Platform Dashboard</h1>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest hidden md:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats — individual floating cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
        {sl ? (
          <div className="col-span-5 py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : [
          { icon: Users, label: "Total Users", value: stats?.totalUsers, sub: "Registered accounts" },
          { icon: CheckCircle, label: "KYC Verified", value: stats?.verifiedUsers, sub: "Approved identities" },
          { icon: Clock, label: "Pending Review", value: stats?.pendingKyc, sub: "Awaiting decision" },
          { icon: XCircle, label: "Rejected", value: stats?.rejectedKyc, sub: "KYC rejected" },
          { icon: TrendingUp, label: "Platform AUM", value: `$${(stats?.totalPlatformAssets || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, sub: "Total assets" },
        ].map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className={`p-5 ${CARD}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
            <div className="text-[22px] font-bold text-foreground tracking-tight tabular-nums">{value ?? "—"}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Pill Tab bar */}
      <div className="flex gap-1 bg-[#F2F3F5] p-1 rounded-full w-fit mb-5">
        <button onClick={() => setTab("users")}
          className={`px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all
            ${tab === "users" ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-muted-foreground hover:text-foreground"}`}>
          User Directory
        </button>
        <button onClick={() => setTab("applications")}
          className={`px-5 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-full transition-all flex items-center gap-2
            ${tab === "applications" ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-muted-foreground hover:text-foreground"}`}>
          Applications
          {pendingApplications.length > 0 && (
            <span className="text-[8px] font-black bg-[#8a6e2f] text-white rounded-full px-1.5 py-0.5">
              {pendingApplications.length}
            </span>
          )}
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className={`${CARD} overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
            <div className="flex-1">
              <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">Registry</div>
              <div className="text-[13px] font-semibold text-foreground">All Users</div>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                <input className="h-9 bg-white border border-[#E6E8EB] rounded-xl pl-9 pr-3 text-[12px] focus:outline-none focus:border-[#0d1520] transition-colors w-48 placeholder:text-muted-foreground"
                  placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-1 bg-[#F2F3F5] p-1 rounded-full">
                {["all", "approved", "pending", "rejected"].map((s) => (
                  <button key={s} onClick={() => setKycFilter(s)}
                    className={`px-3 py-1 text-[9px] font-semibold uppercase tracking-wide rounded-full transition-all capitalize
                      ${kycFilter === s ? "bg-white text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.08)]" : "text-muted-foreground hover:text-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {ul ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E6E8EB] bg-[#F5F6F7]">
                    {["User", "Email", "Country", "Joined", "KYC Status", "Onboarding", "Action"].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground ${i === 0 ? "text-left pl-6" : i === 6 ? "text-right pr-6" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E8EB]">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F5F6F7] transition-colors">
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#0d1520] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <span className="font-semibold text-foreground text-[12px]">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[12px]">{u.country || "—"}</td>
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: KYC_DOT[u.kycStatus] || "#9ca3af" }} />
                          {u.kycStatus?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: u.onboardingComplete ? "#2b6b4e" : "#8a6e2f" }} />
                          {u.onboardingComplete ? "Complete" : `Step ${u.onboardingStep || 0}/8`}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <Link href={`/admin/users/${u.id}`}
                          className="text-[10px] font-semibold uppercase tracking-wide border border-[#E6E8EB] rounded-xl px-3 py-1.5 hover:bg-[#0d1520] hover:text-white hover:border-[#0d1520] transition-all">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[12px] text-muted-foreground">No users match the current filters.</td>
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
        <div className={`${CARD} overflow-hidden`}>
          <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">KYC Review Queue</div>
            <div className="text-[13px] font-semibold text-foreground">Pending Applications</div>
          </div>
          {ul ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pendingApplications.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">No pending applications.</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">All submitted applications have been reviewed.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E8EB]">
              {pendingApplications.map((u) => (
                <div key={u.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#0d1520] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-[13px] truncate">{u.fullName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-[12px] text-muted-foreground shrink-0">
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-widest mb-0.5">Country</div>
                      <div className="text-foreground font-medium">{u.country || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-widest mb-0.5">Submitted</div>
                      <div className="text-foreground font-medium font-mono">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-widest mb-0.5">Balance</div>
                      <div className="text-foreground font-medium tabular-nums">
                        ${u.availableBalance?.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/users/${u.id}`}
                      className="text-[10px] font-semibold uppercase tracking-wide border border-[#E6E8EB] rounded-xl px-3 py-1.5 hover:bg-[#F5F6F7] transition-colors">
                      Full Details
                    </Link>
                    <button onClick={() => handleDecline(u.id)} disabled={actionLoading === u.id}
                      className="text-[10px] font-semibold uppercase tracking-wide border rounded-xl px-3 py-1.5 transition-colors disabled:opacity-50"
                      style={{ borderColor: "#943636", color: "#943636" }}>
                      {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                    </button>
                    <button onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}
                      className="text-[10px] font-semibold uppercase tracking-wide text-white rounded-xl px-4 py-1.5 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: "#2b6b4e" }}>
                      {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
