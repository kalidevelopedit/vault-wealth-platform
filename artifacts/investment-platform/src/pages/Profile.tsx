import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile, useGetUserBalance } from "@workspace/api-client-react";
import { Loader2, Copy, Shield, Settings } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: pl } = useGetUserProfile();
  const { data: balance } = useGetUserBalance();

  const initials = user?.fullName?.split(" ").map(n => n[0]).slice(0,2).join("") || "U";
  const uid = user?.id ? `VW-${String(user.id).padStart(6, "0")}` : "VW-000000";

  const copyLink = () => {
    navigator.clipboard.writeText(`https://vaultwealth.com/ref/${uid}`);
    toast.success("Referral link copied");
  };

  if (pl) return <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar Nav equivalent */}
        <div className="space-y-2">
          <Link href="/profile" style={{ display: "block", padding: "16px", background: "#191F28", borderRadius: 12, color: TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Profile</Link>
          <Link href="/security" style={{ display: "block", padding: "16px", background: "transparent", borderRadius: 12, color: MUTED, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <div style={{ display: "block", padding: "16px", background: "transparent", borderRadius: 12, color: MUTED, fontSize: 14, fontWeight: 500 }}>Settings</div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Main Profile Card */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "32px", display: "flex", alignItems: "center", gap: 24, borderBottom: `1px solid ${BORD}` }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#191F28", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: TEXT }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, marginBottom: 8 }}>{user?.fullName}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ padding: "4px 8px", background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.2)", color: "#16a34a", fontSize: 11, fontWeight: 600, borderRadius: 4 }}>Verified</span>
                  <span style={{ padding: "4px 8px", background: "#11141A", border: `1px solid ${BORD}`, color: MUTED, fontSize: 11, fontWeight: 500, borderRadius: 4, fontFamily: "monospace" }}>UID: {uid}</span>
                </div>
              </div>
            </div>
            <div>
              {[
                { label: "Email", value: user?.email },
                { label: "Phone", value: profile?.phone || "—" },
                { label: "Country", value: profile?.country || "—" },
                { label: "Sign-up Date", value: new Date(user?.createdAt || "").toLocaleDateString() },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "16px 32px", borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none" }}>
                  <span style={{ fontSize: 13, color: MUTED }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Card */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "24px 32px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Referral Program</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Invite friends and earn trading fee discounts.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, height: 44, background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px", color: MUTED, fontSize: 13, fontFamily: "monospace" }}>
                https://vaultwealth.com/ref/{uid}
              </div>
              <button onClick={copyLink} style={{ height: 44, padding: "0 20px", background: "#191F28", border: `1px solid ${BORD}`, borderRadius: 8, color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Copy style={{ width: 14, height: 14 }} strokeWidth={2} /> Copy
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
