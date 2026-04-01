import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@workspace/api-client-react";
import { Loader2, CheckCircle2, Clock, XCircle, Shield } from "lucide-react";

const KYC_STATUS = {
  approved: { label: "Identity Verified", dot: "#2b6b4e", Icon: CheckCircle2 },
  pending: { label: "Pending Review", dot: "#8a6e2f", Icon: Clock },
  rejected: { label: "Rejected", dot: "#943636", Icon: XCircle },
  not_started: { label: "Not Started", dot: "#aaa", Icon: Shield },
};

const CARD = "bg-white rounded-2xl border border-[#E6E8EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)]";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile();

  if (isLoading) return (
    <div className="h-full flex items-center justify-center py-32">
      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
    </div>
  );

  const kycKey = (profile?.kycStatus || "not_started") as keyof typeof KYC_STATUS;
  const kyc = KYC_STATUS[kycKey] || KYC_STATUS.not_started;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
    : "U";

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

  const kycComplete = profile?.kycStatus === "approved";
  const completedSteps = kycComplete ? onboardingSteps.length : Math.floor(onboardingSteps.length * 0.4);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1">Account</div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Identity card */}
          <div className={CARD}>
            <div className="p-6 border-b border-[#E6E8EB] flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#F2F3F5] border border-[#E6E8EB] flex items-center justify-center text-[18px] font-bold text-foreground mb-3">
                {initials}
              </div>
              <div className="text-[15px] font-semibold text-foreground tracking-tight">{user?.fullName || "—"}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{user?.email}</div>
            </div>
            <div className="p-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-2.5">Identity Status</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: kyc.dot }} />
                <span className="text-[12px] font-medium text-foreground">{kyc.label}</span>
              </div>
            </div>
          </div>

          {/* KYC progress */}
          <div className={CARD}>
            <div className="px-5 pt-5 pb-3 border-b border-[#E6E8EB]">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-0.5">Verification</div>
              <div className="text-[12px] font-semibold text-foreground">KYC Progress</div>
            </div>
            <div className="p-5 space-y-3">
              {onboardingSteps.map((step, i) => {
                const done = i < completedSteps;
                return (
                  <div key={step} className="flex items-center gap-2.5">
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#2b6b4e]" : "border border-[#E6E8EB] bg-white"}`}
                      style={{ width: 18, height: 18 }}>
                      {done && <span className="text-white text-[8px] font-bold">✓</span>}
                    </div>
                    <span className={`text-[11px] ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security */}
          <div className={`${CARD} p-5`}>
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">Security</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-[#E6E8EB]">
                <span className="text-[12px] text-foreground">Two-Factor Auth</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Disabled</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[12px] text-foreground">Password</span>
                <button className="text-[10px] font-medium uppercase tracking-wider border border-[#E6E8EB] px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-[#F5F6F7] transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right columns */}
        <div className="md:col-span-2 space-y-4">
          {/* Personal information */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Personal</div>
              <div className="text-[13px] font-semibold text-foreground">Account Information</div>
            </div>
            <div className="divide-y divide-[#E6E8EB]">
              {infoRows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between px-6 py-3.5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground pt-0.5 w-36 shrink-0">{label}</div>
                  <div className="text-[12px] text-foreground font-medium text-right">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment profile */}
          {profile?.investmentExperience && (
            <div className={`${CARD} overflow-hidden`}>
              <div className="px-6 pt-5 pb-4 border-b border-[#E6E8EB]">
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">Investment Profile</div>
                <div className="text-[13px] font-semibold text-foreground">Preferences & Risk</div>
              </div>
              <div className="divide-y divide-[#E6E8EB]">
                {[
                  { label: "Experience Level", value: profile.investmentExperience },
                  { label: "Risk Tolerance", value: profile.riskTolerance },
                  { label: "Investment Goals", value: Array.isArray(profile.investmentGoals) ? profile.investmentGoals.join(", ") : profile.investmentGoals },
                  { label: "Annual Income", value: profile.annualIncome },
                  { label: "Net Worth", value: profile.netWorth },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between px-6 py-3.5">
                    <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground pt-0.5 w-36 shrink-0">{label}</div>
                    <div className="text-[12px] text-foreground font-medium text-right capitalize">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
