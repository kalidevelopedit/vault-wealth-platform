import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@workspace/api-client-react";
import {
  Loader2, ChevronRight, User, CreditCard, Shield,
  HelpCircle, LogOut, CheckCircle2, Clock, XCircle,
  Settings, Camera,
} from "lucide-react";

const BG   = "#0c0f1a";
const CARD = "#131827";
const CARD2= "#101522";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED= "rgba(255,255,255,0.38)";
const BLUE = "#3b82f6";

const KYC_STATUS = {
  approved:    { label: "Verified",       color: "#22c55e", Icon: CheckCircle2 },
  pending:     { label: "Under Review",   color: "#f59e0b", Icon: Clock },
  rejected:    { label: "Rejected",       color: "#ef4444", Icon: XCircle },
  not_started: { label: "Not Verified",   color: "rgba(255,255,255,0.3)", Icon: Shield },
};

function genUID(id: number) {
  return `VW-${String(id).padStart(6, "0")}`;
}

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetUserProfile();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "payment">("profile");

  const uid      = user?.id ? genUID(user.id) : "VW-000000";
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
    : "U";

  const kycKey = (profile?.kycStatus || "not_started") as keyof typeof KYC_STATUS;
  const kyc    = KYC_STATUS[kycKey] || KYC_STATUS.not_started;

  const totalValue = (profile?.portfolioValue as number) || 106000;
  const invested   = (profile?.investedAmount as number) || 1000;

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: User,       label: "Profile Setting",  action: () => setActiveTab("profile")  },
        { icon: CreditCard, label: "Payment Method",   action: () => setActiveTab("payment")  },
        { icon: Shield,     label: "Security",         action: () => setActiveTab("security") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Support",   action: () => {}                       },
      ],
    },
  ];

  const infoRows = [
    { label: "Legal Name",    value: profile?.fullName || profile?.legalName || user?.fullName },
    { label: "Email",         value: profile?.email    || user?.email },
    { label: "Phone",         value: profile?.phone    || user?.phone || "—" },
    { label: "Country",       value: profile?.country  || user?.country || "—" },
    { label: "Date of Birth", value: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—" },
    { label: "Member Since",  value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—" },
    { label: "Account ID",   value: uid },
  ];

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 18, height: 18, color: MUTED, animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "28px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── Page label ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Account</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Profile</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }} className="profile-grid">

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Identity card */}
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
              {/* Avatar section */}
              <div style={{ padding: "28px 24px 20px", textAlign: "center", borderBottom: `1px solid ${BORD}` }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 700, color: "#fff",
                    boxShadow: "0 0 0 3px rgba(59,130,246,0.18)",
                  }}>
                    {initials}
                  </div>
                  <button style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 22, height: 22, borderRadius: "50%",
                    background: BLUE, border: `2px solid ${CARD}`,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}>
                    <Camera style={{ width: 10, height: 10, color: "#fff" }} strokeWidth={2.5} />
                  </button>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                  {user?.fullName || "—"}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{user?.email}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginBottom: 14 }}>
                  {uid}
                </div>
                <button style={{
                  background: BLUE, color: "#fff", border: "none", borderRadius: 99,
                  padding: "8px 22px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  letterSpacing: "0.02em",
                }}>
                  Profile Setting
                </button>
              </div>

              {/* KYC status */}
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                <kyc.Icon style={{ width: 14, height: 14, color: kyc.color, flexShrink: 0 }} strokeWidth={2} />
                <span style={{ fontSize: 12, color: kyc.color, fontWeight: 600 }}>{kyc.label}</span>
                <span style={{ fontSize: 10, color: MUTED, marginLeft: "auto" }}>KYC</span>
              </div>
            </div>

            {/* Portfolio card — gradient hero */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              background: "linear-gradient(135deg,#3b30a8 0%,#2563eb 55%,#1e40af 100%)",
              padding: "20px",
              boxShadow: "0 8px 32px rgba(59,130,246,0.22)",
              position: "relative",
            }}>
              <div style={{ position: "absolute", top: -30, right: -20, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -20, left: -10, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4, position: "relative" }}>Portfolio</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 14, position: "relative" }}>Holding value</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", marginBottom: 16, position: "relative", fontFamily: "monospace" }}>
                ${fmtUSD(totalValue)}
              </div>
              <div style={{ display: "flex", gap: 24, position: "relative" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>${fmtUSD(invested)}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Invested value</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginTop: 2 }}>Available</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>to withdraw</div>
                </div>
              </div>
            </div>

            {/* Settings list */}
            <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 8px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Settings</div>
              </div>
              {settingsGroups.map((group, gi) => (
                <div key={gi}>
                  {group.items.map((item, i) => {
                    const isLast = i === group.items.length - 1 && gi === settingsGroups.length - 1;
                    return (
                      <button key={item.label} onClick={item.action} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 20px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: !isLast ? `1px solid ${BORD}` : "none",
                        transition: "background 0.12s",
                        textAlign: "left",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <item.icon style={{ width: 16, height: 16, color: BLUE, flexShrink: 0 }} strokeWidth={1.8} />
                        <span style={{ flex: 1, fontSize: 13, color: TEXT, fontWeight: 500 }}>{item.label}</span>
                        <ChevronRight style={{ width: 14, height: 14, color: MUTED }} strokeWidth={2} />
                      </button>
                    );
                  })}
                </div>
              ))}
              {/* Log out */}
              <button onClick={logout} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                background: "none", border: "none", borderTop: `1px solid ${BORD}`,
                cursor: "pointer", transition: "background 0.12s", textAlign: "left",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <LogOut style={{ width: 16, height: 16, color: "#ef4444", flexShrink: 0 }} strokeWidth={1.8} />
                <span style={{ flex: 1, fontSize: 13, color: "#ef4444", fontWeight: 500 }}>Log Out</span>
                <ChevronRight style={{ width: 14, height: 14, color: "rgba(239,68,68,0.4)" }} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Tab nav */}
            <div style={{ display: "flex", gap: 4, background: CARD2, padding: 4, borderRadius: 12, border: `1px solid ${BORD}` }}>
              {(["profile", "security", "payment"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: "8px 14px",
                  background: activeTab === tab ? CARD : "transparent",
                  border: activeTab === tab ? `1px solid ${BORD}` : "1px solid transparent",
                  borderRadius: 9, cursor: "pointer",
                  fontSize: 11, fontWeight: 600, color: activeTab === tab ? TEXT : MUTED,
                  textTransform: "capitalize", letterSpacing: "0.03em",
                  transition: "all 0.14s",
                }}>
                  {tab === "payment" ? "Payment" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Profile tab */}
            {activeTab === "profile" && (
              <>
                {/* Account info */}
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Personal</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Account Information</div>
                  </div>
                  {infoRows.map(({ label, value }, i) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      padding: "13px 24px",
                      borderBottom: i < infoRows.length - 1 ? `1px solid ${BORD}` : "none",
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", paddingTop: 1 }}>{label}</div>
                      <div style={{ fontSize: 12, color: TEXT, fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{value || "—"}</div>
                    </div>
                  ))}
                </div>

                {/* Investment preferences */}
                {profile?.investmentExperience && (
                  <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
                      <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Investment Profile</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Preferences & Risk</div>
                    </div>
                    {[
                      { label: "Experience",  value: profile.investmentExperience },
                      { label: "Risk Level",  value: profile.riskTolerance },
                      { label: "Goals",       value: Array.isArray(profile.investmentGoals) ? profile.investmentGoals.join(", ") : profile.investmentGoals },
                      { label: "Income",      value: profile.annualIncome },
                      { label: "Net Worth",   value: profile.netWorth },
                    ].filter(r => r.value).map(({ label, value }, i, arr) => (
                      <div key={label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                        padding: "13px 24px",
                        borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</div>
                        <div style={{ fontSize: 12, color: TEXT, fontWeight: 500, textAlign: "right", textTransform: "capitalize" }}>{value as string}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* KYC steps */}
                <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Verification</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>KYC Progress</div>
                  </div>
                  <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      "Investment Preferences",
                      "Personal Profile",
                      "Document Upload",
                      "Selfie Verification",
                      "Review & Submit",
                    ].map((step, i) => {
                      const done = kycKey === "approved" || i < 2;
                      return (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            background: done ? "#22c55e" : "rgba(255,255,255,0.06)",
                            border: done ? "none" : `1px solid rgba(255,255,255,0.12)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {done && <span style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 12, color: done ? TEXT : MUTED, fontWeight: done ? 600 : 400 }}>{step}</span>
                          {!done && <span style={{ marginLeft: "auto", fontSize: 10, color: MUTED }}>Pending</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Security tab */}
            {activeTab === "security" && (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
                  <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Account Protection</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Security</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {[
                      { label: "Old Password",     placeholder: "Enter current password", type: "password" },
                      { label: "New Password",     placeholder: "Enter new password",     type: "password" },
                      { label: "Confirm Password", placeholder: "Confirm new password",   type: "password" },
                    ].map((f) => (
                      <div key={f.label}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} style={{
                          width: "100%", background: "#0d1020", border: `1px solid rgba(255,255,255,0.09)`,
                          borderRadius: 10, padding: "11px 14px", fontSize: 13, color: TEXT,
                          outline: "none", boxSizing: "border-box",
                        }}
                          onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                        />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <button style={{
                        flex: 1, background: BLUE, color: "#fff", border: "none", borderRadius: 99,
                        padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>Save</button>
                      <button style={{
                        flex: 1, background: "rgba(255,255,255,0.05)", color: TEXT, border: `1px solid ${BORD}`,
                        borderRadius: 99, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Cancel</button>
                    </div>

                    {/* 2FA row */}
                    <div style={{ marginTop: 8, paddingTop: 20, borderTop: `1px solid ${BORD}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, color: TEXT, fontWeight: 600, marginBottom: 3 }}>Two-Factor Authentication</div>
                          <div style={{ fontSize: 11, color: MUTED }}>Add an extra layer of security</div>
                        </div>
                        <div style={{
                          width: 40, height: 22, borderRadius: 99,
                          background: "rgba(255,255,255,0.08)", border: `1px solid ${BORD}`,
                          cursor: "pointer", display: "flex", alignItems: "center", padding: "0 2px",
                        }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment tab */}
            {activeTab === "payment" && (
              <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden" }}>
                <div style={{ padding: "18px 24px 14px", borderBottom: `1px solid ${BORD}` }}>
                  <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Funding</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Payment Methods</div>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  {[
                    { label: "PayPal", sub: "paypal@example.com", icon: "🦊", selected: true },
                    { label: "Bank Transfer", sub: "****4821 — Chase", icon: "🏦", selected: false },
                  ].map((m) => (
                    <div key={m.label} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 12, marginBottom: 8,
                      background: m.selected ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)",
                      border: m.selected ? "1px solid rgba(59,130,246,0.3)" : `1px solid ${BORD}`,
                    }}>
                      <div style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{m.sub}</div>
                      </div>
                      {m.selected && (
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: BLUE, background: "rgba(59,130,246,0.12)",
                          border: "1px solid rgba(59,130,246,0.25)", borderRadius: 99, padding: "3px 10px",
                        }}>Selected</div>
                      )}
                    </div>
                  ))}
                  <button style={{
                    width: "100%", marginTop: 8, padding: "12px",
                    background: "transparent", border: `1px dashed rgba(255,255,255,0.12)`,
                    borderRadius: 12, color: MUTED, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", letterSpacing: "0.04em",
                  }}>
                    + Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
