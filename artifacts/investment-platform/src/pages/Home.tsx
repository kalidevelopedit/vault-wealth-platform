import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, Shield, ChevronRight, TrendingUp, Globe, Lock, Award } from "lucide-react";

const platformMockup = "/platform-mockup.png";
const platformGlobe = "/platform-globe.png";
const platformDevices = "/platform-devices.png";

const css = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-1 { animation: fadeInUp 0.7s ease both; }
  .anim-2 { animation: fadeInUp 0.7s 0.15s ease both; }
  .anim-3 { animation: fadeInUp 0.7s 0.3s ease both; }
  .anim-4 { animation: fadeIn 1.2s 0.5s ease both; }
  .rate-card:hover { transform: translateY(-2px); transition: transform 0.25s ease; }
  .platform-btn:hover { background: rgba(255,255,255,0.06); }
`;

const RATES = [
  { head: "Earn interest up to", currency: "USD", rate: "3.14%", sub: "on uninvested cash.\nAutomatically.", cta: "Compare Interest Rates" },
  { head: "Borrow for as low as", currency: "USD", rate: "4.14%", sub: "Among the lowest\nmargin rates globally.", cta: "Compare Margin Rates" },
];

const PLAN_LITE = {
  tag: "Occasional Traders", name: "VAULT LITE",
  features: [
    { bold: "$0", text: " Commissions on US stocks and ETFs" },
    { text: "Margin as low as USD 6.14%" },
    { text: "Interest up to USD 2.14%" },
  ],
};

const PLAN_PRO = {
  tag: "Active Traders", name: "VAULT PRO",
  features: [
    { bold: "$0.005", text: " per share on US Stocks and ETFs" },
    { text: "Margin as low as USD 4.14%" },
    { text: "Interest up to USD 3.14%" },
    { text: "Enhanced price execution" },
    { text: "Extra protection on uninvested cash" },
  ],
};

const PLATFORMS = ["Vault Desktop", "Client Portal", "Vault Mobile", "Trader Workstation"];

const STATS = [
  { sup: "Trusted by over", val: "4 Million", sub: "clients worldwide" },
  { sup: "Executing more than", val: "4 Million", sub: "trades daily" },
  { sup: "Nasdaq-listed", val: "VWT", sub: "" },
  { sup: "Member of the", val: "S&P 500", sub: "" },
  { sup: "Client assets over", val: "$750 Billion", sub: "" },
  { sup: "Total Equity", val: "$19.5 Billion", sub: "" },
  { sup: "Over", val: "$5 Million", sub: "in account protection for uninvested cash" },
  { sup: "Nearly", val: "50 Years", sub: "of Innovation" },
];

const WHY = [
  { icon: TrendingUp, title: "170+ Global Markets", desc: "Trade stocks, crypto, futures, forex, bonds, and commodities from a single account." },
  { icon: Shield, title: "Institutional Security", desc: "SIPC-protected accounts, two-factor authentication, and automated risk controls." },
  { icon: Globe, title: "Worldwide Access", desc: "Access markets in 33+ countries with multi-currency accounts and real-time data." },
  { icon: Lock, title: "Lowest Margin Rates", desc: "Pay as little as 4.14% on margin — up to 55% less than competitors." },
  { icon: Award, title: "Award-Winning Platform", desc: "Industry-recognized trading tools trusted by professional investors worldwide." },
  { icon: Check, title: "$0 Commissions", desc: "Trade US stocks and ETFs commission-free with our VAULT LITE account." },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#0c0c0f", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{css}</style>
      <HomeNavbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "#0c0c0f", minHeight: "92vh", display: "flex", flexDirection: "column" }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "500px",
          background: "radial-gradient(ellipse at center, rgba(200,16,46,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "96px", paddingBottom: "0", textAlign: "center", maxWidth: "900px", margin: "0 auto", padding: "96px 24px 0" }}>
          <div className="anim-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "20px" }}>
            Institutional Trading Platform
          </div>

          <h1 className="anim-2" style={{ fontSize: "clamp(42px, 6vw, 68px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: "24px" }}>
            Lower Costs.<br />Better Returns.
          </h1>

          <p className="anim-3" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "580px", marginBottom: "40px" }}>
            Earn <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>up to USD 3.14%</strong> on uninvested cash,{" "}
            <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>pay up to 55% less</strong> on margin, and trade with{" "}
            <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>commissions starting at $0</strong> across{" "}
            <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>170+ markets</strong> worldwide.
          </p>

          <div className="anim-3" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#c8102e", color: "#fff", fontWeight: 700, fontSize: "15px",
              padding: "14px 36px", textDecoration: "none", transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
              Get Started
            </Link>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
              fontWeight: 600, fontSize: "15px", padding: "14px 36px", textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
              Log In
            </Link>
          </div>
          <div className="anim-3" style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.2)", fontSize: "11px", marginBottom: "0" }}>
            <Shield size={11} /> Lower Cost Disclosure
          </div>
        </div>

        {/* Platform image — bleeds into next section */}
        <div className="anim-4" style={{ position: "relative", marginTop: "40px", width: "100%", maxWidth: "1040px", marginLeft: "auto", marginRight: "auto", padding: "0 20px" }}>
          <img src={platformMockup} alt="Vault Wealth Platform" style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: "520px" }} />
          {/* Triple gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
            background: "linear-gradient(to bottom, transparent 0%, rgba(12,12,15,0.6) 50%, #0c0c0f 100%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
            background: "linear-gradient(to right, #0c0c0f, transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
            background: "linear-gradient(to left, #0c0c0f, transparent)",
            pointerEvents: "none",
          }} />
        </div>
      </section>

      {/* ── YOUR MONEY WORKS HARDER HERE ─────────────────────── */}
      <section style={{ background: "#0c0c0f", padding: "80px 0" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: "48px", letterSpacing: "-0.02em" }}>
            Your Money Works Harder Here
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
            {RATES.map(r => (
              <div key={r.head} className="rate-card" style={{
                background: "linear-gradient(135deg, #161b2a 0%, #111520 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                padding: "36px",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "default",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "8px" }}>{r.head}</p>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", fontWeight: 500 }}>{r.currency} </span>
                  <span style={{ color: "#fff", fontSize: "52px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{r.rate}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: "24px" }}>{r.sub}</p>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: "2px" }}>
                  {r.cta} <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section style={{ background: "#0c0c0f", padding: "60px 0 80px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: "48px", letterSpacing: "-0.02em" }}>
            Pricing for Any Trading Style
          </h2>
          <div style={{
            background: "linear-gradient(135deg, #161b2a 0%, #111520 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "clamp(24px, 5vw, 48px)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "40px" }}>
              {[PLAN_LITE, PLAN_PRO].map(plan => (
                <div key={plan.name}>
                  <div style={{
                    display: "inline-block", border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 12px", marginBottom: "16px"
                  }}>{plan.tag}</div>
                  <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#fff", marginBottom: "24px", letterSpacing: "-0.02em" }}>{plan.name}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <Check size={14} style={{ color: "#c8102e", flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.5 }}>
                          {(f as any).bold && <strong style={{ color: "#fff" }}>{(f as any).bold}</strong>}{f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#fff", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                See Pricing Details <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY VAULT ────────────────────────────────────────── */}
      <section style={{ background: "#0c0c0f", padding: "60px 0 80px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>Why Vault Wealth</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Everything a Serious Investor Needs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
            {WHY.map((item, i) => (
              <div key={i} style={{ background: "#0c0c0f", padding: "32px", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#111520")}
                onMouseLeave={e => (e.currentTarget.style.background = "#0c0c0f")}>
                <item.icon size={18} style={{ color: "rgba(255,255,255,0.25)", marginBottom: "16px" }} />
                <h4 style={{ color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{item.title}</h4>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ─────────────────────────────────────────── */}
      <section style={{ background: "#0c0c0f", padding: "60px 0 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
            ↑↓ Vault Platforms
          </p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", marginBottom: "16px", lineHeight: 1.1 }}>
            Institutional-Grade Tools.<br />Built for You.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", maxWidth: "480px", margin: "0 auto 36px", lineHeight: 1.6 }}>
            Access lightning-fast, advanced trading platforms built for precision and insight — on any device.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "8px", marginBottom: "56px" }}>
            <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginRight: "8px" }}>View Award-Winning Platforms</span>
            {PLATFORMS.map(p => (
              <a key={p} href="#" className="platform-btn" style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                fontSize: "12px", color: "rgba(255,255,255,0.5)", textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)", padding: "6px 14px",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}>
                {p} <ChevronRight size={12} />
              </a>
            ))}
          </div>
          {/* Platform image — full width, faded bottom */}
          <div style={{ position: "relative" }}>
            <img src={platformDevices} alt="Vault Wealth on all devices" style={{ width: "100%", maxWidth: "980px", objectFit: "contain", display: "block", margin: "0 auto", maxHeight: "500px" }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(to bottom, transparent, #0c0c0f)",
              pointerEvents: "none",
            }} />
          </div>
        </div>
      </section>

      {/* ── GLOBE / GLOBAL MARKETS ───────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 0", background: "#060608" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src={platformGlobe} alt="Global markets" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6,6,8,0.5) 0%, rgba(6,6,8,0.7) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(200,16,46,0.06) 0%, transparent 70%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Global Markets</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", marginBottom: "20px", lineHeight: 1.1 }}>
            Trade Anywhere.<br />In Any Market.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "16px", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 40px" }}>
            Access 170+ global markets including stocks, options, futures, currencies, bonds, and funds from a single integrated account.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", background: "#c8102e", color: "#fff",
              fontWeight: 700, fontSize: "14px", padding: "13px 32px", textDecoration: "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
              Open Account
            </Link>
            <a href="#" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)",
              fontWeight: 600, fontSize: "14px", padding: "13px 32px", textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.4)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"; }}>
              Why Vault Wealth
            </a>
          </div>
        </div>
      </section>

      {/* ── SECURITY / TRUST ─────────────────────────────────── */}
      <section style={{ background: "#0c0c0f", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
            <Shield size={16} style={{ color: "#3a6fd4" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em" }}>Financial Strength</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", marginBottom: "16px" }}>
            Security You Can Trust
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", maxWidth: "520px", margin: "0 auto 20px", lineHeight: 1.6 }}>
            Your assets are backed by strong capital, automated risk controls, and a commitment to transparency.
          </p>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", marginBottom: "56px",
            border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "13px",
            fontWeight: 600, padding: "8px 20px", textDecoration: "none", transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
            Vault at a Glance
          </a>

          {/* Stats grid */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[STATS.slice(0, 4), STATS.slice(4)].map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {row.map((s, i) => (
                  <div key={i} style={{
                    padding: "clamp(20px, 4vw, 36px) clamp(16px, 3vw, 24px)",
                    borderRight: i < row.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    textAlign: "center",
                  }}>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", lineHeight: 1.4, marginBottom: "6px" }}>{s.sup}</p>
                    <p style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.1 }}>{s.val}</p>
                    {s.sub && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", marginTop: "6px", lineHeight: 1.4 }}>{s.sub}</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section style={{ background: "linear-gradient(to bottom, #0c0c0f, #080808)", padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", marginBottom: "16px" }}>
            Ready to Start Trading?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", lineHeight: 1.6, marginBottom: "36px" }}>
            Join millions of investors who trust Vault Wealth for institutional-grade access to global markets.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", background: "#c8102e", color: "#fff",
              fontWeight: 700, fontSize: "15px", padding: "14px 40px", textDecoration: "none", transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
              Open Account
            </Link>
            <Link href="/login" style={{
              display: "inline-flex", alignItems: "center",
              border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
              fontWeight: 600, fontSize: "15px", padding: "14px 40px", textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
