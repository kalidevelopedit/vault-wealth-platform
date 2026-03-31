import { useState } from "react";
import { useGetAdminStats, useGetAdminUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Search, Users, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading: sl } = useGetAdminStats();
  const { data: users, isLoading: ul } = useGetAdminUsers({ limit: 50 });
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  const filtered = users?.users?.filter((u) => {
    const matchSearch = !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    return matchSearch && matchKyc;
  });

  const kycBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: "text-emerald-700 border-emerald-200 bg-emerald-50",
      pending: "text-amber-700 border-amber-200 bg-amber-50",
      rejected: "text-red-700 border-red-200 bg-red-50",
      flagged: "text-orange-700 border-orange-200 bg-orange-50",
      not_started: "text-muted-foreground border-border bg-muted/30",
    };
    return map[status] || "text-muted-foreground border-border bg-muted/30";
  };

  return (
    <div className="max-w-[1300px] mx-auto px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Administration</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Platform Dashboard</h1>
        </div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
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
          { icon: Clock, label: "Pending KYC", value: stats?.pendingKyc, sub: "Awaiting review" },
          { icon: XCircle, label: "Rejected", value: stats?.rejectedKyc, sub: "KYC rejected" },
          { icon: TrendingUp, label: "Platform AUM", value: `$${(stats?.totalPlatformAssets || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, sub: "Total assets" },
        ].map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className={`p-5 ${i < 4 ? "border-r border-border" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
            <div className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">{value ?? "—"}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="border border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 pt-4 pb-4 border-b border-border">
          <div className="flex-1">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Registry</div>
            <div className="text-sm font-semibold text-foreground">User Directory</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                className="h-8 bg-background border border-border pl-7 pr-3 text-xs focus:outline-none focus:border-foreground transition-colors w-52 placeholder:text-muted-foreground"
                placeholder="Search users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                <tr className="border-b border-border bg-muted/30">
                  {["User", "Email", "Country", "Joined", "KYC Status", "Onboarding", "Action"].map((h, i) => (
                    <th key={h} className={`py-2.5 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground
                      ${i === 0 ? "text-left pl-5" : i === 6 ? "text-right pr-5" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered?.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 pl-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#0a1628] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
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
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border capitalize
                        ${u.onboardingComplete
                          ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                          : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                        {u.onboardingComplete ? "Complete" : `Step ${u.onboardingStep || 0}/8`}
                      </span>
                    </td>
                    <td className="py-3 pl-4 pr-5 text-right">
                      <Link href={`/admin/users/${u.id}`}
                        className="text-[9px] font-bold uppercase tracking-wide border border-border px-3 py-1 hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] transition-colors">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {!filtered?.length && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">No users match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
