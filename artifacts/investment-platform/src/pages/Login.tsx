import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Zap } from "lucide-react";

const BG   = "#080c18";
const CARD = "#0f1624";
const BORD = "rgba(255,255,255,0.07)";
const TEXT = "rgba(255,255,255,0.92)";
const MUTED= "rgba(255,255,255,0.35)";
const BLUE = "#3b82f6";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const [frozenPopup, setFrozenPopup] = useState(false);

  // Redirect to dashboard once authenticated (fixes timing race)
  useEffect(() => {
    if (user && !(user as any).isFrozen) {
      setLocation("/dashboard");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back");
      // redirect happens via useEffect when user state updates
    } catch (error: any) {
      const errCode = error?.data?.error;
      const errMsg  = error?.data?.message || error?.message || "";
      if (errCode === "account_frozen" || errMsg.includes("suspended")) {
        setFrozenPopup(true);
      } else {
        toast.error(errMsg || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await login({ email: "demo@vestplatform.com", password: "demo1234" });
      toast.success("Welcome, Demo User!");
      // redirect via useEffect
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  const WHATSAPP_LINK = "https://wa.me/18886555555?text=My%20account%20has%20been%20frozen.%20Please%20help.";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: BG }}>

      {/* ── Frozen Account Popup ── */}
      {frozenPopup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        }}>
          <div style={{
            width: 400, background: "#0f1624", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20,
            padding: "40px 36px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Account Suspended</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 28px" }}>
              Your account has been temporarily suspended. Please contact our support team to resolve this issue and restore access to your account.
            </p>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
              padding: "14px", borderRadius: 12, background: "#25D366", color: "#fff",
              textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em",
              boxShadow: "0 4px 20px rgba(37,211,102,0.3)", marginBottom: 12,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact Support via WhatsApp
            </a>
            <button onClick={() => setFrozenPopup(false)} style={{
              width: "100%", padding: "12px", borderRadius: 12, background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Left branding panel ── */}
      <div style={{
        width: 480, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between",
        background: "linear-gradient(165deg,#0d1226 0%,#0a0f1e 50%,#060b18 100%)",
        padding: "48px 52px 52px", position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }} className="login-left">
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: -100, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='rgba(255,255,255,0.025)'/%3E%3C/svg%3E")`, pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative" }}>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers" style={{ width: 300, height: "auto", display: "block", mixBlendMode: "screen" }} />
          </Link>
          <div style={{ marginTop: 12, height: 1, background: BORD }} />
          <p style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>Institutional Investment Platform</p>
        </div>

        {/* Testimonial */}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 28, color: "rgba(59,130,246,0.3)", lineHeight: 1, marginBottom: 12, fontFamily: "Georgia,serif" }}>"</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, fontWeight: 400, maxWidth: 300, marginBottom: 20 }}>
            Vault Wealth has transformed how we manage our multi-asset portfolio. The institutional tools and reporting are unmatched.
          </p>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Sarah M.</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 3 }}>Chief Investment Officer</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, position: "relative" }}>
          {[
            { val: "$2.4B+",  label: "Assets Under Management" },
            { val: "50K+",    label: "Institutional Investors"  },
            { val: "99.98%",  label: "Platform Uptime"          },
            { val: "SOC 2",   label: "Type II Certified"        },
          ].map((s) => (
            <div key={s.val} style={{
              padding: "16px 18px", borderRadius: 14,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, fontVariantNumeric: "tabular-nums" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 32px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile logo */}
          <div style={{ marginBottom: 40, display: "none" }} className="login-mobile-logo">
            <Link href="/">
              <img src="/logo-white.png" alt="INT Brokers" style={{ width: 200, height: "auto", display: "block", mixBlendMode: "screen" }} />
            </Link>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
              INT Brokers · Secure Login
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, letterSpacing: "-0.03em", lineHeight: 1.2, margin: 0, marginBottom: 10 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>
              Sign in to your brokerage account to access your portfolio and markets.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box",
                  background: CARD, border: `1px solid rgba(255,255,255,0.09)`, color: TEXT, fontSize: 13,
                  outline: "none", transition: "border-color 0.14s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em" }}>Password</label>
                <a href="#" style={{ fontSize: 11, color: BLUE, textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, boxSizing: "border-box",
                    background: CARD, border: `1px solid rgba(255,255,255,0.09)`, color: TEXT, fontSize: 13,
                    outline: "none", transition: "border-color 0.14s",
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(59,130,246,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, marginTop: 4,
                background: BLUE, color: "#fff", border: "none",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.75 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(59,130,246,0.28)",
                transition: "opacity 0.14s, box-shadow 0.14s",
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = "0 6px 28px rgba(59,130,246,0.4)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.28)")}
            >
              {loading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: BORD }} />
            <span style={{ fontSize: 11, color: MUTED }}>or</span>
            <div style={{ flex: 1, height: 1, background: BORD }} />
          </div>

          {/* Demo button */}
          <button onClick={handleDemo} disabled={demoLoading} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            background: "rgba(245,158,11,0.1)", color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.25)",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
            cursor: demoLoading ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.14s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
          >
            {demoLoading
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
              : <><Zap size={14} /> Try Demo Account</>}
          </button>

          {/* Footer link + demo card */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BORD}` }}>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
              No account?{" "}
              <Link href="/register" style={{ color: TEXT, fontWeight: 700, textDecoration: "none" }}>
                Open an account
              </Link>
            </p>

            <div style={{
              padding: "14px 16px", borderRadius: 12,
              background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)",
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(59,130,246,0.6)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6 }}>Demo Access</div>
              <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>demo@vestplatform.com / demo1234</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .login-left { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
