import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@workspace/api-client-react";
import { Loader2, Copy, CheckCircle, Clock, AlertCircle, Upload, ChevronRight, Camera, Headphones } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

function KYCStatusBadge({ status }: { status: string }) {
  const cfg = status === "approved"
    ? { bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)", color: "#4ade80", icon: CheckCircle, label: "Verified" }
    : status === "pending"
    ? { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", icon: Clock, label: "Pending Review" }
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
  { step: 1, title: "Personal Information", desc: "Full name, date of birth, and address", done: true },
  { step: 2, title: "Government ID", desc: "Passport, national ID, or driver's license", done: false, docType: "government_id" },
  { step: 3, title: "Proof of Address", desc: "Utility bill or bank statement (< 3 months)", done: false, docType: "proof_of_address" },
  { step: 4, title: "Selfie Verification", desc: "Photo with your ID document", done: false, docType: "selfie" },
];

// Real brand SVG icons for contact channels
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.975-1.412A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
      <path d="M8.93 7.5c-.2 0-.52.074-.8.375-.276.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.1 3.225 5.1 4.5.712.3 1.265.48 1.7.612.712.225 1.362.194 1.875.118.575-.088 1.762-.72 2.012-1.413.25-.694.25-1.287.175-1.412-.075-.125-.275-.2-.575-.35-.3-.15-1.775-.875-2.05-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.262-.464-2.4-1.475-.888-.788-1.488-1.76-1.663-2.06-.175-.3-.018-.462.131-.612.134-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.49-.506-.675-.516-.175-.01-.375-.013-.575-.013z" fill="white"/>
    </svg>
  );
}

function MailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.09 6.09l1.97-1.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.42z"/>
    </svg>
  );
}

const CONTACT_INFO = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+1 (888) 655-5555",
    href: "https://wa.me/18886555555",
    iconColor: "#25D366",
    textColor: "#25D366",
  },
  {
    id: "email",
    label: "Business Email",
    value: "support@intbrokers.app",
    href: "mailto:support@intbrokers.app",
    iconColor: "#6b7280",
    textColor: "#2563FF",
  },
  {
    id: "phone",
    label: "Phone Support",
    value: "+1 (888) 655-5555",
    href: "tel:+18886555555",
    iconColor: "#6b7280",
    textColor: undefined,
  },
];

export default function Profile() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { data: profile, isLoading: pl } = useGetUserProfile();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ text: string; from: "user" | "support"; time: string }[]>([
    { text: "Hello! How can we help you today?", from: "support", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = user?.fullName?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "U";
  const uid = user?.id ? `VW-${String(user.id).padStart(6, "0")}` : "VW-000000";
  const kycStatus = profile?.kycStatus || "not_submitted";
  const currentPhoto = photoUrl || profile?.profilePhotoUrl || user?.profilePhotoUrl;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://intbrokers.com/ref/${uid}`);
    toast.success("Referral link copied");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploadingPhoto(true);
    try {
      // Request upload URL
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await urlRes.json();

      // Upload to object storage
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      const publicUrl = `/api/storage/public-objects/${objectPath}`;

      // Update profile
      const token = localStorage.getItem("vault_auth_token");
      await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ profilePhotoUrl: publicUrl }),
      });

      setPhotoUrl(publicUrl);
      toast.success("Profile photo updated");
    } catch {
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    const text = chatMessage.trim();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages(m => [...m, { text, from: "user", time }]);
    setChatMessage("");

    try {
      const token = localStorage.getItem("vault_auth_token");
      await fetch("/api/support/message", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      setTimeout(() => {
        setChatMessages(m => [...m, {
          text: "Thank you for your message. A support agent will respond shortly. Average response time: 15 minutes.",
          from: "support",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      }, 1000);
    } catch { /* silent */ }
  };

  if (pl) return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 24, height: 24, color: colors.muted, animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: colors.bg, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 32 }}>Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            {[
              { label: "Profile", href: "/profile", active: true },
              { label: "Security", href: "/account/security", active: false },
              { label: "Settings", href: "/settings", active: false },
            ].map((item, i, arr) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none",
                background: item.active ? "rgba(37,99,255,0.08)" : "transparent",
                color: item.active ? colors.text : colors.muted,
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
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "32px", display: "flex", alignItems: "center", gap: 24, borderBottom: `1px solid ${colors.bord}`, flexWrap: "wrap" }}>
              {/* Avatar with upload */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: currentPhoto ? "transparent" : "linear-gradient(135deg,#1d4ed8,#2563FF)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, color: "#fff", overflow: "hidden",
                }}>
                  {currentPhoto ? (
                    <img src={currentPhoto} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : initials}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: "50%",
                    background: colors.blue, border: "2px solid " + colors.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {uploadingPhoto
                    ? <Loader2 style={{ width: 12, height: 12, color: "#fff", animation: "spin 1s linear infinite" }} />
                    : <Camera style={{ width: 12, height: 12, color: "#fff" }} strokeWidth={2.5} />
                  }
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />
              </div>

              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>{user?.fullName}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <KYCStatusBadge status={kycStatus} />
                  <span style={{ padding: "4px 10px", background: colors.inputBg, border: `1px solid ${colors.bord}`, color: colors.muted, fontSize: 11, fontWeight: 500, borderRadius: 999, fontFamily: "monospace" }}>
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
                  borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none"
                }}>
                  <span style={{ fontSize: 13, color: colors.muted, minWidth: 140 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: colors.text, fontWeight: 500, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Verification */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${colors.bord}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Identity Verification (KYC)</div>
                <div style={{ fontSize: 13, color: colors.muted }}>Complete verification to unlock full trading limits.</div>
              </div>
              <KYCStatusBadge status={kycStatus} />
            </div>

            {kycStatus === "approved" ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <CheckCircle style={{ width: 40, height: 40, color: "#4ade80", margin: "0 auto 12px" }} strokeWidth={1.5} />
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Verification Complete</div>
                <div style={{ fontSize: 13, color: colors.muted }}>Your identity has been fully verified. Full trading limits are active.</div>
              </div>
            ) : (
              <div>
                {KYC_STEPS.map((step, i, arr) => (
                  <div key={step.step} style={{
                    display: "flex", alignItems: "center", padding: "20px 32px", gap: 16,
                    borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none",
                    opacity: i > 0 && !KYC_STEPS[i - 1].done ? 0.45 : 1,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: step.done ? "rgba(74,222,128,0.12)" : colors.inputBg,
                      border: step.done ? "1px solid rgba(74,222,128,0.3)" : `1px solid ${colors.bord}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                      color: step.done ? "#4ade80" : colors.muted,
                    }}>
                      {step.done ? <CheckCircle style={{ width: 16, height: 16 }} strokeWidth={2} /> : step.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 12, color: colors.muted }}>{step.desc}</div>
                    </div>
                    {!step.done && (
                      <button style={{
                        height: 34, padding: "0 16px", background: colors.blue, border: "none",
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

          {/* Contact & Support */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${colors.bord}` }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Contact & Support</div>
              <div style={{ fontSize: 13, color: colors.muted }}>Reach our team through any of these channels.</div>
            </div>

            <div style={{ padding: "8px 0" }}>
              {/* WhatsApp */}
              <a href={CONTACT_INFO[0].href} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 32px", textDecoration: "none", borderBottom: `1px solid ${colors.bord}` }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.inputBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <WhatsAppIcon size={22} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>WhatsApp</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{CONTACT_INFO[0].value}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#25D366", background: "rgba(37,211,102,0.1)", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(37,211,102,0.2)" }}>Online</span>
              </a>

              {/* Email */}
              <a href={CONTACT_INFO[1].href}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 32px", textDecoration: "none", borderBottom: `1px solid ${colors.bord}`, color: colors.muted }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.inputBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <MailIcon size={22} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Business Email</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{CONTACT_INFO[1].value}</div>
                </div>
                <span style={{ fontSize: 11, color: colors.muted }}>support@intbrokers.app</span>
              </a>

              {/* Phone */}
              <a href={CONTACT_INFO[2].href}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 32px", textDecoration: "none", borderBottom: `1px solid ${colors.bord}`, color: colors.muted }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.inputBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <PhoneIcon size={22} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Phone Support</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{CONTACT_INFO[2].value}</div>
                </div>
                <span style={{ fontSize: 11, color: colors.muted }}>Mon–Fri 9am–6pm</span>
              </a>

              {/* Live Support Chat */}
              <button onClick={() => setShowChat(true)} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 32px",
                background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                borderBottom: `1px solid ${colors.bord}`,
              }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.inputBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Headphones style={{ width: 22, height: 22, color: colors.muted }} strokeWidth={1.6} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Live Support Chat</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>Avg. 15 min response time</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                  <span style={{ fontSize: 11, color: colors.muted }}>Live</span>
                </div>
              </button>

              {/* FAQ */}
              <a href="https://wa.me/18886555555" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 32px", textDecoration: "none", color: colors.muted }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.inputBg)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Help Center & FAQ</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>Browse answers to common questions</div>
                </div>
              </a>
            </div>
          </div>

          {/* Referral */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "24px 32px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Referral Program</div>
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Invite friends and earn trading fee discounts on their first 90 days.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                flex: 1, height: 44, background: colors.inputBg, border: `1px solid ${colors.bord}`,
                borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px",
                color: colors.muted, fontSize: 12, fontFamily: "monospace", overflow: "hidden",
              }}>
                https://intbrokers.com/ref/{uid}
              </div>
              <button onClick={copyLink} style={{
                height: 44, padding: "0 20px", background: colors.active || colors.inputBg, border: `1px solid ${colors.bord}`,
                borderRadius: 8, color: colors.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
              }}>
                <Copy style={{ width: 14, height: 14 }} strokeWidth={2} /> Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat Widget */}
      {showChat && (
        <div style={{ position: "fixed", bottom: 80, right: 20, width: 340, zIndex: 1000, borderRadius: 20, overflow: "hidden", boxShadow: "0 16px 64px rgba(0,0,0,0.5)", border: `1px solid ${colors.bord}` }}>
          <div style={{ background: colors.blue, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>INT Brokers Support</span>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>

          <div style={{ background: colors.card, height: 280, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "75%", padding: "10px 14px", borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.from === "user" ? colors.blue : colors.inputBg,
                  color: m.from === "user" ? "#fff" : colors.text,
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.text}
                  <div style={{ fontSize: 10, color: m.from === "user" ? "rgba(255,255,255,0.6)" : colors.muted, marginTop: 4, textAlign: "right" }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: colors.card, borderTop: `1px solid ${colors.bord}`, padding: "12px 16px", display: "flex", gap: 10 }}>
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChatMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1, height: 38, background: colors.inputBg, border: `1px solid ${colors.bord}`,
                borderRadius: 20, padding: "0 14px", color: colors.text, fontSize: 13, outline: "none",
              }}
            />
            <button onClick={sendChatMessage} style={{
              width: 38, height: 38, borderRadius: "50%", background: colors.blue, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
