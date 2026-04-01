import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Shield, Lock, Eye, Server, AlertTriangle, CheckCircle, ArrowUpRight } from "lucide-react";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

const LAYERS = [
  { icon: Shield, color: "#60a5fa", title: "SIPC & FDIC Protection", desc: "Your securities are protected up to $500,000 (including $250,000 for cash) under SIPC membership. Cash balances are FDIC-insured up to $2.5M through our bank sweep program." },
  { icon: Lock, color: "#4ade80", title: "256-Bit Encryption", desc: "All data transmitted between your device and our servers is encrypted using AES-256 — the same standard used by governments and the military. Your information is always protected." },
  { icon: Eye, color: "#fbbf24", title: "Two-Factor Authentication", desc: "Add an extra layer of security with time-based one-time passwords (TOTP), hardware security keys, or biometric authentication. Login alerts notify you of any new device access." },
  { icon: Server, color: "#f87171", title: "Cold Storage for Crypto", desc: "95%+ of all cryptocurrency assets are held in geographically distributed cold storage wallets with multi-signature authorization. No hot wallet exposure to exchange hacks." },
  { icon: AlertTriangle, color: "#a78bfa", title: "Real-Time Fraud Monitoring", desc: "24/7 transaction monitoring with AI-powered anomaly detection. Suspicious activity is flagged instantly and your account is protected before any unauthorized action can complete." },
  { icon: CheckCircle, color: "#34d399", title: "Regulatory Compliance", desc: "Vault Wealth is registered with the SEC, FINRA, and NFA, and is a member of SIPC. We operate under the full regulatory framework of US financial law." },
];

export default function Security() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <HomeNavbar />

      {/* Hero */}
      <section style={{ background: "#080a0f", padding: "96px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(37,99,235,0.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#60a5fa", marginBottom: 12 }}>Security & Trust</p>
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
            Your Money is<br />
            <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Always Protected</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 40px" }}>
            Multiple layers of institutional-grade security protect your assets, identity, and transactions — 24 hours a day, 7 days a week. Your peace of mind is our top priority.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ v: "SIPC", l: "Member — $500K Protected" }, { v: "FDIC", l: "Cash Insured up to $2.5M" }, { v: "SEC", l: "Registered Broker" }, { v: "FINRA", l: "Member Firm" }].map(s => (
              <div key={s.v} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "12px 20px", backdropFilter: "blur(8px)", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#60a5fa" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Layers */}
      <section style={{ background: "#F5F6F7", padding: "96px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Defense in Depth</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Six Layers of Security</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
            {LAYERS.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={{ background: "linear-gradient(135deg,#080a0f,#0f1320)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color}50,transparent)` }} />
                <div style={{ padding: "32px 32px 28px" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, backdropFilter: "blur(8px)" }}>
                    <Icon size={22} color={color} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Strength */}
      <section style={{ background: "#080a0f", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 10 }}>Financial Strength</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Built to Last Through Any Market Cycle</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, marginTop: 10 }}>Our conservative balance sheet and automated risk controls are designed to protect Vault — and you — from major market events.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {[
              { label: "Equity Capital", val: "$19.5B" },
              { label: "Excess Regulatory Capital", val: "$13.3B" },
              { label: "S&P 500 Member", val: "Yes" },
              { label: "Nasdaq Listed", val: "VWT" },
              { label: "Years in Operation", val: "50+" },
              { label: "Client Accounts", val: "4.4M+" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em" }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#0f2d52,#0a1e3a,#0f1320)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>Invest With Confidence</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>Join 4.4 million investors protected by institutional-grade security.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "linear-gradient(135deg,#e8192c,#c8102e)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(200,16,46,0.4)" }}>
            Open a Secure Account <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
