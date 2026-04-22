import { useAuth } from "@/hooks/use-auth";
import { Shield, Mail, Smartphone, KeyRound, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const BLUE = "#2563FF";

export default function UserSecurity() {
  const { user } = useAuth();

  const rows = [
    {
      id: "pin",
      icon: KeyRound,
      title: "PIN / Passcode",
      desc: "6-digit passcode protects your account",
      status: user?.hasPin ? "On" : "Off",
      action: "Manage"
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Verification",
      desc: user?.email,
      status: "Linked",
      action: "Change"
    },
    {
      id: "2fa",
      icon: Smartphone,
      title: "Two-Factor Authentication",
      desc: "Use an authenticator app for extra security",
      status: "Off",
      action: "Set Up"
    },
    {
      id: "password",
      icon: Shield,
      title: "Login Password",
      desc: "Used for login and critical actions",
      status: "",
      action: "Change"
    }
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Security</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar Nav */}
        <div className="space-y-2">
          <Link href="/profile" style={{ display: "block", padding: "16px", background: "transparent", borderRadius: 12, color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Profile</Link>
          <Link href="/security" style={{ display: "block", padding: "16px", background: "#191F28", borderRadius: 12, color: TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <div style={{ display: "block", padding: "16px", background: "transparent", borderRadius: 12, color: MUTED, fontSize: 14, fontWeight: 500 }}>Settings</div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: `1px solid ${BORD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Security Level</div>
                <div style={{ fontSize: 13, color: MUTED }}>Increase your security level by enabling 2FA.</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Medium</div>
            </div>

            <div>
              {rows.map((r, i, arr) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", padding: "24px 32px", borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#11141A", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                    <r.icon style={{ width: 18, height: 18, color: TEXT }} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: MUTED }}>{r.desc}</div>
                  </div>
                  {r.status && (
                    <div style={{ fontSize: 13, color: TEXT, fontWeight: 500, marginRight: 24 }}>{r.status}</div>
                  )}
                  <button style={{ height: 36, padding: "0 16px", background: "transparent", border: `1px solid ${BORD}`, borderRadius: 999, color: TEXT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {r.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
