import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Mail, KeyRound, Eye, EyeOff, ChevronRight, AlertTriangle, Monitor, Smartphone, Globe } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

function Input({ label, type, value, onChange, placeholder, show, onToggle, colors }: {
  label: string; type: string; value: string; onChange: (v: string) => void;
  placeholder?: string; show?: boolean; onToggle?: () => void; colors: any;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: colors.muted, letterSpacing: "0.04em" }}>{label.toUpperCase()}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", height: 44, background: colors.inputBg, border: `1px solid ${colors.bord}`,
            borderRadius: 8, padding: "0 40px 0 14px", color: colors.text, fontSize: 14,
            outline: "none", boxSizing: "border-box",
          }}
        />
        {type === "password" && onToggle && (
          <button type="button" onClick={onToggle} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: colors.muted, padding: 0, display: "flex",
          }}>
            {show ? <EyeOff style={{ width: 16, height: 16 }} strokeWidth={1.5} /> : <Eye style={{ width: 16, height: 16 }} strokeWidth={1.5} />}
          </button>
        )}
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, colors }: { onClose: () => void; colors: any }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = next.length === 0 ? 0 : next.length < 8 ? 1 : next.length < 12 ? 2 : /[A-Z]/.test(next) && /[0-9]/.test(next) && /[^A-Za-z0-9]/.test(next) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e", "#4ade80"][strength];

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!current || !next || !confirm) { toast.error("All fields are required"); return; }
    if (next.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("vault_auth_token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Password changed successfully");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 480, background: colors.card,
        border: `1px solid ${colors.bord}`, borderRadius: 20, padding: "32px", zIndex: 1,
        margin: "0 16px",
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>Change Password</div>
        <div style={{ fontSize: 13, color: colors.muted, marginBottom: 28 }}>Use a strong, unique password for your account.</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Input label="Current Password" type="password" value={current} onChange={setCurrent} show={showC} onToggle={() => setShowC(v => !v)} colors={colors} />
          <Input label="New Password" type="password" value={next} onChange={setNext} show={showN} onToggle={() => setShowN(v => !v)} colors={colors} />
          {next.length > 0 && (
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(s => (
                  <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= strength ? strengthColor : colors.bord, transition: "background 0.2s" }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strengthColor, fontWeight: 500 }}>{strengthLabel}</div>
            </div>
          )}
          <Input label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} show={showN} onToggle={() => setShowN(v => !v)} colors={colors} />
          {confirm && next !== confirm && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#f87171" }}>
              <AlertTriangle style={{ width: 14, height: 14 }} strokeWidth={2} /> Passwords do not match
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, height: 44, background: "transparent", border: `1px solid ${colors.bord}`,
              borderRadius: 10, color: colors.muted, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, height: 44, background: colors.blue, border: "none",
              borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeviceIcon({ deviceInfo }: { deviceInfo: string }) {
  const info = deviceInfo.toLowerCase();
  if (info.includes("iphone") || info.includes("android") || info.includes("mobile")) {
    return <Smartphone style={{ width: 16, height: 16 }} strokeWidth={1.5} />;
  }
  if (info.includes("safari") || info.includes("chrome") || info.includes("firefox")) {
    return <Globe style={{ width: 16, height: 16 }} strokeWidth={1.5} />;
  }
  return <Monitor style={{ width: 16, height: 16 }} strokeWidth={1.5} />;
}

function formatSessionTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UserSecurity() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vault_auth_token");
    fetch("/api/auth/login-sessions", {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, []);

  const removeSession = async (id: number) => {
    const token = localStorage.getItem("vault_auth_token");
    try {
      await fetch(`/api/auth/login-sessions/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSessions(s => s.filter(sess => sess.id !== id));
      toast.success("Session removed");
    } catch {
      toast.error("Failed to remove session");
    }
  };

  const securityScore = user?.hasPin ? 65 : 40;
  const scoreColor = securityScore >= 70 ? "#4ade80" : securityScore >= 45 ? "#FCD34D" : "#f87171";

  const rows = [
    {
      id: "password",
      icon: Shield,
      title: "Login Password",
      desc: "Used for login and critical operations",
      status: "Set",
      statusColor: "#4ade80",
      action: "Change",
      onClick: () => setShowPasswordModal(true),
      href: null,
    },
    {
      id: "pin",
      icon: KeyRound,
      title: "PIN / Passcode",
      desc: "6-digit passcode required every time you open the app",
      status: user?.hasPin ? "Active" : "Not Set",
      statusColor: user?.hasPin ? "#4ade80" : colors.muted,
      action: user?.hasPin ? "Manage" : "Set Up",
      onClick: null,
      href: "/pin-setup",
    },
    {
      id: "email",
      icon: Mail,
      title: "Email Verification",
      desc: user?.email || "Not linked",
      status: "Linked",
      statusColor: "#4ade80",
      action: "Change",
      onClick: () => toast.info("Email change requires identity verification"),
      href: null,
    },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: colors.bg, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 32 }}>Security</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            {[
              { label: "Profile", href: "/profile", active: false },
              { label: "Security", href: "/account/security", active: true },
              { label: "Settings", href: "/settings", active: false },
            ].map((item, i, arr) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none",
                background: item.active ? `rgba(37,99,255,0.08)` : "transparent",
                color: item.active ? colors.text : colors.muted,
                fontSize: 14, fontWeight: item.active ? 600 : 500, textDecoration: "none",
              }}>
                {item.label}
                <ChevronRight style={{ width: 14, height: 14, opacity: 0.4 }} strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Security Score */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "24px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Security Level</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{securityScore}% — {securityScore >= 70 ? "Strong" : securityScore >= 45 ? "Medium" : "Low"}</div>
            </div>
            <div style={{ height: 6, background: colors.bord, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${securityScore}%`, height: "100%", background: scoreColor, borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>Set a PIN to increase your security level. Keep your password strong and unique.</div>
          </div>

          {/* Security Items */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            {rows.map((r, i, arr) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", padding: "22px 32px",
                borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none",
                gap: 16,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: colors.inputBg,
                  border: `1px solid ${colors.bord}`, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <r.icon style={{ width: 18, height: 18, color: colors.text }} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: colors.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.desc}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: r.statusColor, marginRight: 8, flexShrink: 0 }}>{r.status}</div>
                {r.href ? (
                  <Link href={r.href} style={{
                    height: 34, padding: "0 16px", background: "transparent", border: `1px solid ${colors.bord}`,
                    borderRadius: 999, color: colors.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", textDecoration: "none", flexShrink: 0,
                  }}>
                    {r.action}
                  </Link>
                ) : (
                  <button onClick={r.onClick!} style={{
                    height: 34, padding: "0 16px", background: "transparent", border: `1px solid ${colors.bord}`,
                    borderRadius: 999, color: colors.text, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "border-color 0.12s", flexShrink: 0,
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = colors.blue}
                    onMouseLeave={e => e.currentTarget.style.borderColor = colors.bord}
                  >
                    {r.action}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Login Activity */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 32px", borderBottom: `1px solid ${colors.bord}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Recent Login Activity</div>
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Real-time device and location tracking for your account.</div>
            </div>

            {sessionsLoading ? (
              <div style={{ padding: "32px", textAlign: "center", color: colors.muted, fontSize: 14 }}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: colors.muted, fontSize: 14 }}>
                No login sessions recorded yet. Log in again to start tracking.
              </div>
            ) : (
              sessions.map((s, i) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", padding: "16px 32px", gap: 16,
                  borderBottom: i < sessions.length - 1 ? `1px solid ${colors.bord}` : "none",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: colors.inputBg,
                    border: `1px solid ${colors.bord}`, display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, color: colors.muted,
                  }}>
                    <DeviceIcon deviceInfo={s.deviceInfo} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 2 }}>{s.deviceInfo}</div>
                    <div style={{ fontSize: 12, color: colors.muted }}>
                      IP: {s.ipAddress} · {formatSessionTime(s.createdAt)}
                    </div>
                  </div>
                  {s.isCurrent ? (
                    <span style={{ padding: "3px 10px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80", fontSize: 11, fontWeight: 600, borderRadius: 999, flexShrink: 0 }}>Current</span>
                  ) : (
                    <button onClick={() => removeSession(s.id)} style={{ fontSize: 12, color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>Remove</button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} colors={colors} />}
    </div>
  );
}
