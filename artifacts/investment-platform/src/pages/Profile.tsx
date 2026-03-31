import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@workspace/api-client-react";
import { Loader2, User, Shield, CheckCircle2, Clock, XCircle } from "lucide-react";

const KYC_STATUS = {
  approved: { label: "Verified", icon: CheckCircle2, cls: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  pending: { label: "Pending Review", icon: Clock, cls: "text-amber-700 border-amber-200 bg-amber-50" },
  rejected: { label: "Rejected", icon: XCircle, cls: "text-red-700 border-red-200 bg-red-50" },
  not_started: { label: "Not Started", icon: Shield, cls: "text-muted-foreground border-border bg-muted/30" },
};

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile();

  if (isLoading) return (
    <div className="h-full flex items-center justify-center py-32">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );

  const kycKey = (profile?.kycStatus || "not_started") as keyof typeof KYC_STATUS;
  const kycInfo = KYC_STATUS[kycKey] || KYC_STATUS.not_started;
  const KycIcon = kycInfo.icon;

  const infoRows = [
    { label: "Legal Name", value: profile?.fullName || profile?.legalName || user?.fullName },
    { label: "Email Address", value: profile?.email || user?.email },
    { label: "Phone Number", value: profile?.phone || user?.phone || "—" },
    { label: "Country", value: profile?.country || user?.country || "—" },
    { label: "Date of Birth", value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
    { label: "Address", value: profile?.address ? `${profile.address}, ${profile.city || ""} ${profile.postalCode || ""}`.trim() : "—" },
    { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—" },
  ];

  const onboardingSteps = [
    "Investment Preferences",
    "Personal Profile",
    "Document Upload",
    "Selfie Verification",
    "Review & Submit",
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-border">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Account</div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: avatar + KYC */}
        <div className="space-y-6">
          {/* Identity card */}
          <div className="border border-border bg-card">
            <div className="bg-[#0a1628] p-6 flex flex-col items-center text-white">
              <div className="w-14 h-14 bg-white/10 border border-white/15 flex items-center justify-center text-2xl font-semibold mb-3">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="text-sm font-semibold tracking-tight">{user?.fullName}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{user?.email}</div>
            </div>
            <div className="p-4">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Identity Status</div>
              <div className={`flex items-center gap-2 text-xs font-semibold px-2.5 py-1.5 border ${kycInfo.cls}`}>
                <KycIcon className="w-3.5 h-3.5" />
                {kycInfo.label}
              </div>
            </div>
          </div>

          {/* Onboarding progress */}
          <div className="border border-border bg-card">
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">KYC</div>
              <div className="text-sm font-semibold text-foreground">Verification Progress</div>
            </div>
            <div className="p-4 space-y-2">
              {onboardingSteps.map((step, i) => {
                const done = (user?.onboardingStep || 0) > i + 1 || user?.onboardingComplete;
                const current = (user?.onboardingStep || 0) === i + 1 && !user?.onboardingComplete;
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-5 h-5 border flex items-center justify-center text-[9px] font-bold shrink-0
                      ${done ? "bg-[#0a1628] border-[#0a1628] text-white" :
                        current ? "border-amber-400 text-amber-600" :
                        "border-border text-muted-foreground"}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs ${done ? "text-foreground font-medium" : current ? "text-amber-600" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2 space-y-6">
          <div className="border border-border bg-card">
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Details</div>
                <div className="text-sm font-semibold text-foreground">Personal Information</div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {infoRows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-5 py-3.5">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground pt-0.5 w-36 shrink-0">{label}</div>
                  <div className="text-xs text-foreground font-medium text-right">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment profile */}
          {profile?.investmentExperience && (
            <div className="border border-border bg-card">
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Investment Profile</div>
                <div className="text-sm font-semibold text-foreground">Preferences & Risk</div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Experience Level", value: profile.investmentExperience },
                  { label: "Risk Tolerance", value: profile.riskTolerance },
                  { label: "Investment Goals", value: Array.isArray(profile.investmentGoals) ? profile.investmentGoals.join(", ") : profile.investmentGoals },
                  { label: "Annual Income", value: profile.annualIncome },
                  { label: "Net Worth", value: profile.netWorth },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between px-5 py-3.5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground pt-0.5 w-36 shrink-0">{label}</div>
                    <div className="text-xs text-foreground font-medium text-right capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border border-border bg-card p-5">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Security</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-xs text-foreground font-medium">Two-Factor Authentication</span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground border border-border px-2 py-0.5">Not Enabled</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-foreground font-medium">Change Password</span>
                <button className="text-[9px] font-bold uppercase tracking-wide border border-border px-3 py-1 text-muted-foreground hover:bg-muted/30 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
