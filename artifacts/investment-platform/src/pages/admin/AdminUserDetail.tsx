import { useRoute, Link } from "wouter";
import { useGetAdminUserDetail, useUpdateUserKycStatus } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Shield } from "lucide-react";

export default function AdminUserDetail() {
  const [_, params] = useRoute("/admin/users/:id");
  const userId = Number(params?.id);

  const { data: detail, isLoading, refetch } = useGetAdminUserDetail(userId, { query: { enabled: !!userId } });
  const updateStatus = useUpdateUserKycStatus();

  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  if (isLoading) return (
    <div className="p-20 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!detail) return <div className="p-12 text-center text-muted-foreground text-xs">User not found</div>;

  const { user, balance, kycDocuments, selfieStatus } = detail;

  const handleStatusUpdate = async (status: "approved" | "rejected" | "flagged") => {
    setProcessing(true);
    try {
      await updateStatus.mutateAsync({ userId, data: { status, notes } });
      toast.success(`Status updated to ${status}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const kycBadge = (s: string) => {
    const map: Record<string, string> = {
      approved: "text-emerald-700 border-emerald-200 bg-emerald-50",
      pending: "text-amber-700 border-amber-200 bg-amber-50",
      rejected: "text-red-700 border-red-200 bg-red-50",
      flagged: "text-orange-700 border-orange-200 bg-orange-50",
      not_started: "text-muted-foreground border-border bg-muted/30",
    };
    return map[s] || map.not_started;
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 pb-12">
      {/* Back */}
      <Link href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
      </Link>

      {/* User header */}
      <div className="border border-border bg-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0a1628] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">{user.fullName}</h1>
              <div className="text-xs text-muted-foreground mt-0.5">{user.email} · {user.phone || "No phone"}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 border ${kycBadge(user.kycStatus)} capitalize`}>
              {user.kycStatus?.replace("_", " ")}
            </span>
            <div className="text-[10px] text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: docs + compliance */}
        <div className="md:col-span-2 space-y-6">

          {/* KYC Documents */}
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Documents</div>
              <div className="text-sm font-semibold text-foreground">KYC Document Review</div>
            </div>
            <div className="p-5">
              {kycDocuments?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kycDocuments.map((doc) => (
                    <div key={doc.id} className="border border-border">
                      <div className="px-3 py-2 border-b border-border bg-muted/30">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          {doc.documentType?.replace("_", " ")} — {doc.side}
                        </div>
                      </div>
                      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden relative">
                        {doc.fileUrl ? (
                          <img src={doc.fileUrl} alt="Document" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-xs text-muted-foreground">No document uploaded</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">No documents uploaded yet.</div>
              )}

              <div className="mt-5 pt-5 border-t border-border">
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Selfie / Video Verification</div>
                <div className="flex items-center gap-2.5">
                  {selfieStatus === "approved" ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> :
                   selfieStatus === "submitted" ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> :
                   <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="text-xs font-medium capitalize">{selfieStatus?.replace("_", " ") || "Not submitted"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance decision */}
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Compliance</div>
                <div className="text-sm font-semibold text-foreground">Review Decision</div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Internal Review Notes (not visible to user)
                </label>
                <textarea
                  placeholder="Add compliance review notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-border bg-background text-foreground text-xs px-3 py-2.5 focus:outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleStatusUpdate("approved")} disabled={processing}
                  className="flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-bold uppercase tracking-wide px-4 py-2 hover:bg-emerald-800 transition-colors disabled:opacity-50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve KYC
                </button>
                <button onClick={() => handleStatusUpdate("rejected")} disabled={processing}
                  className="flex items-center gap-1.5 border border-red-700 text-red-700 text-xs font-bold uppercase tracking-wide px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50">
                  <XCircle className="w-3.5 h-3.5" />
                  Reject & Request Updates
                </button>
                <button onClick={() => handleStatusUpdate("flagged")} disabled={processing}
                  className="flex items-center gap-1.5 border border-border text-muted-foreground text-xs font-bold uppercase tracking-wide px-4 py-2 hover:bg-muted/30 transition-colors disabled:opacity-50">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flag for Review
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: account overview + personal */}
        <div className="space-y-6">
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Financials</div>
              <div className="text-sm font-semibold text-foreground">Account Overview</div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Portfolio Value</div>
                <div className="text-2xl font-semibold tabular-nums tracking-tight">
                  ${balance?.totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                {[
                  { label: "Available Cash", value: balance?.availableCash },
                  { label: "Crypto Assets", value: balance?.cryptoBalance },
                  { label: "Equities", value: balance?.stockBalance },
                  { label: "Commodities", value: balance?.commodityBalance },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{row.label}</span>
                    <span className="text-[10px] font-semibold font-mono tabular-nums">
                      ${(row.value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Identity</div>
              <div className="text-sm font-semibold text-foreground">Personal Details</div>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Legal Name", value: user.legalName || user.fullName },
                { label: "Date of Birth", value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                { label: "Country", value: user.country || "—" },
                { label: "Address", value: [user.address, user.city, user.postalCode].filter(Boolean).join(", ") || "—" },
                { label: "Onboarding Step", value: user.onboardingComplete ? "Complete" : `Step ${user.onboardingStep || 0}/8` },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col px-5 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
                  <div className="text-xs text-foreground font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
