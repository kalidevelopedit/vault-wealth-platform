import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile, useGetUserBalance } from "@workspace/api-client-react";
import { Loader2, Copy, CheckCircle, Clock, AlertCircle, Upload, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const BG   = "#050505";
const CARD  = "#0C0F14";
const BORD  = "rgba(255,255,255,0.08)";
const TEXT  = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const BLUE  = "#2563FF";

function KYCStatusBadge({ status }: { status: string }) {
  const cfg = status === "approved"
    ? { bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)", color: "#4ade80", icon: CheckCircle, label: "Verified" }
    : status === "pending"
    ? { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "#FCD34D", icon: Clock, label: "Pending Review" }
    : { bg: "rgba(220,38,38,0.1)", border: "rgba(220,38,38,0.25)", color: "#f87171", icon: AlertCircle, label: "Not Verified" };
  const Icon = cfg.icon;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 999 }}>
      <Icon style={{ width: 12, height: 12, color: cfg.color }} strokeWidth={2} />
      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

const KYC_STEPS = [
  {
    step: 1,
    title: "Personal Information",
    desc: "Full name, date of birth, and address",
    done: true,
  },
  {
    step: 2,
    title: "Government ID",
    desc: "Passport, national ID, or driver's license",
    done: false,
    docType: "government_id",
  },
  {
    step: 3,
    title: "Proof of Address",
    desc: "Utility bill or bank statement (< 3 months)",
    done: false,
    docType: "proof_of_address",
  },
  {
    step: 4,
    title: "Selfie Verification",
    desc: "Photo with your ID document",
    done: false,
    docType: "selfie",
  },
];

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: pl } = useGetUserProfile();
  const { data: balance } = useGetUserBalance();

  const initials = user?.fullName?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "U";
  const uid = user?.id ? `VW-${String(user.id).padStart(6, "0")}` : "VW-000000";
  const kycStatus = profile?.kycStatus || "not_submitted";

  const copyLink = () => {
    navigator.clipboard.writeText(`https://intbrokers.com/ref/${uid}`);
    toast.success("Referral link copied");
  };

  if (pl) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            {[
              { label: "Profile", href: "/profile", active: true },
              { label: "Security", href: "/account/security", active: false },
              { label: "Settings", href: "/settings", active: false },
            ].map((item, i, arr) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
                background: item.active ? "rgba(37,99,255,0.08)" : "transparent",
                color: item.active ? TEXT : MUTED,
                fontSize: 14, fontWeight: item.active ? 600 : 500, textDecoration: "none",
                transition: "background 0.12s",
              }}>
                {item.label}
                <ChevronRight style={{ width: 14, height: 14, opacity: 0.4 }} strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Profile Card */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "32px", display: "flex", alignItems: "center", gap: 24, borderBottom: `1px solid ${BORD}` }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#1d4ed8,#2563FF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "#fff",
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{user?.fullName}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <KYCStatusBadge status={kycStatus} />
                  <span style={{ padding: "4px 10px", background: "#11141A", border: `1px solid ${BORD}`, color: MUTED, fontSize: 11, fontWeight: 500, borderRadius: 999, fontFamily: "monospace" }}>
                    {uid}
                  </span>
                </div>
              </div>
            </div>

            {/* Account details */}
            <div>
              {[
                { label: "Email address", value: user?.email },
                { label: "Phone number", value: profile?.phone || "—" },
                { label: "Country", value: profile?.country || "—" },
                { label: "Date of Birth", value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                { label: "Address", value: [profile?.address, profile?.city, profile?.postalCode].filter(Boolean).join(", ") || "—" },
                { label: "Member since", value: new Date(user?.createdAt || "").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 32px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none"
                }}>
                  <span style={{ fontSize: 13, color: MUTED, minWidth: 140 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: TEXT, fontWeight: 500, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Verification */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Identity Verification (KYC)</div>
                <div style={{ fontSize: 13, color: MUTED }}>Complete verification to unlock full trading limits.</div>
              </div>
              <KYCStatusBadge status={kycStatus} />
            </div>

            {kycStatus === "approved" ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <CheckCircle style={{ width: 40, height: 40, color: "#4ade80", margin: "0 auto 12px" }} strokeWidth={1.5} />
                <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Verification Complete</div>
                <div style={{ fontSize: 13, color: MUTED }}>Your identity has been fully verified. Full trading limits are active.</div>
              </div>
            ) : (
              <div>
                {KYC_STEPS.map((step, i, arr) => (
                  <div key={step.step} style={{
                    display: "flex", alignItems: "center", padding: "20px 32px", gap: 16,
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
                    opacity: i > 0 && !KYC_STEPS[i - 1].done ? 0.45 : 1,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: step.done ? "rgba(74,222,128,0.12)" : "#11141A",
                      border: step.done ? "1px solid rgba(74,222,128,0.3)" : `1px solid ${BORD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                      color: step.done ? "#4ade80" : MUTED,
                    }}>
                      {step.done ? <CheckCircle style={{ width: 16, height: 16 }} strokeWidth={2} /> : step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: MUTED }}>{step.desc}</div>
                    </div>
                    {!step.done && (
                      <button style={{
                        height: 34, padding: "0 16px", background: BLUE, border: "none",
                        borderRadius: 999, color: "#fff", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        opacity: i > 0 && !KYC_STEPS[i - 1].done ? 0.4 : 1,
                      }} disabled={i > 0 && !KYC_STEPS[i - 1].done}
                        onClick={() => toast.info("Upload document to proceed with verification")}>
                        <Upload style={{ width: 12, height: 12 }} strokeWidth={2.5} />
                        Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "24px 32px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Referral Program</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Invite friends and earn trading fee discounts on their first 90 days.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                flex: 1, height: 44, background: "#11141A", border: `1px solid ${BORD}`,
                borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px",
                color: MUTED, fontSize: 12, fontFamily: "monospace", overflow: "hidden",
              }}>
                https://intbrokers.com/ref/{uid}
              </div>
              <button onClick={copyLink} style={{
                height: 44, padding: "0 20px", background: "#191F28", border: `1px solid ${BORD}`,
                borderRadius: 8, color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
              }}>
                <Copy style={{ width: 14, height: 14 }} strokeWidth={2} /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
