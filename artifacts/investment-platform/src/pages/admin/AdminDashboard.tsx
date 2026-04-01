import { useState } from "react";
import { useGetAdminStats, useGetAdminUsers, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Search, Users, CheckCircle, Clock, XCircle, TrendingUp, Bell } from "lucide-react";

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

  const kycBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: "text-emerald-600 border-emerald-800/30 bg-emerald-900/20",
      pending: "text-amber-400 border-amber-600/30 bg-amber-900/20",
      rejected: "text-red-400 border-red-600/30 bg-red-900/20",
      flagged: "text-orange-400 border-orange-600/30 bg-orange-900/20",
      not_started: "text-white/30 border-white/10 bg-white/4",
    };
    return map[status] || "text-white/30 border-white/10 bg-white/4";
  };

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
    <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Administration</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Platform Dashboard</h1>
        </div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-widest hidden md:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-border bg-card mb-6">
        {sl ? (
          <div className="col-span-5 py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : [
          { icon: Users, label: "Total Users", value: stats?.totalUsers, sub: "Registered accounts" },
          { icon: CheckCircle, label: "KYC Verified", value: stats?.verifiedUsers, sub: "Approved identities" },
          { icon: Clock, label: "Pending Review", value: stats?.pendingKyc, sub: "Awaiting decision" },
          { icon: XCircle, label: "Rejected", value: stats?.rejectedKyc, sub: "KYC rejected" },
          { icon: TrendingUp, label: "Platform AUM", value: `$${(stats?.totalPlatformAssets || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, sub: "Total assets" },
        ].map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className={`p-5 ${i < 4 ? "md:border-r border-border" : ""} ${i > 0 ? "border-t md:border-t-0" : ""} border-border`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
            <div className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">{value ?? "—"}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border border-border h-9 mb-4 bg-card w-fit">
        <button onClick={() => setTab("users")}
          className={`px-5 text-[10px] font-bold uppercase tracking-widest border-r border-border transition-colors ${tab === "users" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          User Directory
        </button>
        <button onClick={() => setTab("applications")}
          className={`px-5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${tab === "applications" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          Applications
          {pendingApplications.length > 0 && (
            <span className={`text-[9px] font-black px-1.5 py-0.5 ${tab === "applications" ? "bg-background text-foreground" : "bg-amber-500 text-white"}`}>
              {pendingApplications.length}
            </span>
          )}
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {tab === "users" && (
        <div className="border border-border bg-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 pt-4 pb-4 border-b border-border">
            <div className="flex-1">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Registry</div>
              <div className="text-sm font-semibold text-foreground">All Users</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input className="h-8 bg-background border border-border pl-7 pr-3 text-xs focus:outline-none focus:border-foreground transition-colors w-48 placeholder:text-muted-foreground"
                  placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-0 border border-border h-8">
                {["all", "approved", "pending", "rejected"].map((s) => (
                  <button key={s} onClick={() => setKycFilter(s)}
                    className={`px-3 text-[9px] font-bold uppercase tracking-wide border-r last:border-0 border-border transition-colors capitalize
                      ${kycFilter === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
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
                  <tr className="border-b border-border bg-muted/20">
                    {["User", "Email", "Country", "Joined", "KYC Status", "Onboarding", "Action"].map((h, i) => (
                      <th key={h} className={`py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground ${i === 0 ? "text-left pl-5" : i === 6 ? "text-right pr-5" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 pl-5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#0d1520] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <span className="font-semibold text-foreground">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[10px]">{u.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.country || "—"}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[10px]">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border ${kycBadge(u.kycStatus)} capitalize`}>
                          {u.kycStatus?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border capitalize ${u.onboardingComplete ? "text-emerald-600 border-emerald-800/30 bg-emerald-900/20" : "text-amber-400 border-amber-600/30 bg-amber-900/20"}`}>
                          {u.onboardingComplete ? "Complete" : `Step ${u.onboardingStep || 0}/8`}
                        </span>
                      </td>
                      <td className="py-3 pl-4 pr-5 text-right">
                        <Link href={`/admin/users/${u.id}`}
                          className="text-[9px] font-bold uppercase tracking-wide border border-border px-3 py-1 hover:bg-[#0d1520] hover:text-white hover:border-[#0d1520] transition-colors">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">No users match the current filters.</td>
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
        <div className="border border-border bg-card">
          <div className="px-5 pt-4 pb-4 border-b border-border">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">KYC Review Queue</div>
            <div className="text-sm font-semibold text-foreground">Pending Applications</div>
          </div>
          {ul ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : pendingApplications.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No pending applications.</p>
              <p className="text-xs text-muted-foreground/50 mt-1">All submitted applications have been reviewed.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingApplications.map((u) => (
                <div key={u.id} className="px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-[#0d1520] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-sm truncate">{u.fullName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest mb-0.5">Country</div>
                      <div className="text-foreground font-medium">{u.country || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest mb-0.5">Submitted</div>
                      <div className="text-foreground font-medium font-mono">
                        {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest mb-0.5">Portfolio</div>
                      <div className="text-foreground font-medium tabular-nums">
                        ${u.availableBalance?.toLocaleString("en-US", { maximumFractionDigits: 0 }) || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/users/${u.id}`}
                      className="text-[9px] font-bold uppercase tracking-wide border border-border px-3 py-1.5 hover:bg-muted transition-colors">
                      Full Details
                    </Link>
                    <button onClick={() => handleDecline(u.id)} disabled={actionLoading === u.id}
                      className="text-[9px] font-bold uppercase tracking-wide border border-red-800/30 text-red-500 px-3 py-1.5 hover:bg-red-900/20 transition-colors disabled:opacity-50">
                      {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                    </button>
                    <button onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}
                      className="text-[9px] font-bold uppercase tracking-wide bg-[#0d1520] text-white px-4 py-1.5 hover:bg-[#0d1520]/80 transition-colors disabled:opacity-50">
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
