import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ChevronRight, ExternalLink, Info, User, Users, Landmark, Briefcase, Building2, DollarSign, Globe2, Zap, ShieldCheck } from "lucide-react";

const css = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .hero-text-1 { animation: fadeInUp 0.65s ease both; }
  .hero-text-2 { animation: fadeInUp 0.65s 0.12s ease both; }
  .hero-text-3 { animation: fadeInUp 0.65s 0.24s ease both; }
  .hero-mockup { animation: fadeIn 1.1s 0.35s ease both; }
  .feature-card:hover { background: #f9fafb !important; }
  .acct-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; border-color: #9ca3af !important; }
  .rate-card:hover { box-shadow: 0 8px 36px rgba(0,0,0,0.38) !important; transform: translateY(-2px); }
`;

export default function Home() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', system-ui, -apple-system, sans-serif", overflowX: "hidden" }}>
      <style>{css}</style>
      <HomeNavbar />

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section style={{ background: "#0d0d10", paddingTop: "72px", paddingBottom: "0", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Subtle ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "700px", height: "300px", background: "radial-gradient(ellipse, rgba(200,16,46,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "860px", margin: "0 auto", padding: "0 24px 28px" }}>
          <p className="hero-text-1" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "22px" }}>
            Institutional-Grade Trading
          </p>
          <h1 className="hero-text-2" style={{ fontSize: "clamp(44px, 7vw, 76px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "24px" }}>
            Lower Costs.<br />Better Returns.
          </h1>
          <p className="hero-text-3" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: "580px", margin: "0 auto 36px" }}>
            Earn <strong style={{ color: "rgba(255,255,255,0.87)", fontWeight: 600 }}>up to USD&nbsp;3.14%</strong> on uninvested cash, pay{" "}
            <strong style={{ color: "rgba(255,255,255,0.87)", fontWeight: 600 }}>up to 55%&nbsp;less</strong> on margin, and trade with{" "}
            <strong style={{ color: "rgba(255,255,255,0.87)", fontWeight: 600 }}>commissions starting at&nbsp;$0</strong> across{" "}
            <strong style={{ color: "rgba(255,255,255,0.87)", fontWeight: 600 }}>170+&nbsp;markets</strong> worldwide.
          </p>
          <div className="hero-text-3" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "10px" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center",
              background: "#c8102e", color: "#fff", fontWeight: 700, fontSize: "15px",
              padding: "13px 40px", textDecoration: "none", transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
              Get Started
            </Link>
          </div>
          <div className="hero-text-3" style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "center", color: "rgba(255,255,255,0.22)", fontSize: "12px" }}>
            <Info size={12} />
            <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>Lower Cost Disclosure</a>
          </div>
        </div>

        {/* Speed lines + Platform mockup */}
        <div className="hero-mockup" style={{ position: "relative", width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
          {/* Speed lines image as background layer */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <img src="/speed-lines.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            {/* Fade top of speed lines */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, #0d0d10 0%, transparent 100%)" }} />
            {/* Fade bottom */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", background: "linear-gradient(to top, #0d0d10 0%, transparent 100%)" }} />
          </div>
          {/* Platform mockup on top */}
          <div style={{ position: "relative", zIndex: 2, padding: "0 60px 0" }}>
            <img src="/ibkr-platform-mockup.png" alt="Vault Wealth trading platform on laptop and mobile" style={{ width: "100%", maxWidth: "960px", display: "block", margin: "0 auto", objectFit: "contain" }} />
            {/* Bottom fade to merge with next section */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to bottom, transparent 0%, #0d0d10 100%)", pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      {/* ═══ YOUR MONEY WORKS HARDER ═════════════════════════════ */}
      <section style={{ background: "#0d0d10", padding: "0 0 80px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: "8px", letterSpacing: "-0.025em" }}>
            Your Money Works Harder at Vault!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px", textAlign: "center", marginBottom: "36px" }}>Earn more on cash. Pay less to borrow.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              {
                head: "Earn up to",
                currency: "USD", rate: "3.14%",
                note: "on instantly available cash balances",
                supNote: "4",
                cta: "View Interest Rates",
              },
              {
                head: "Borrow at margin rates as low as",
                currency: "USD", rate: "4.14%",
                note: "Among the lowest margin rates globally",
                supNote: "5",
                cta: "View Margin Rates",
              },
            ].map(r => (
              <div key={r.head} className="rate-card" style={{
                background: "linear-gradient(140deg, #161b2a 0%, #0f1320 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "40px",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                cursor: "default",
              }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "10px" }}>{r.head}</p>
                <div style={{ marginBottom: "14px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "18px", fontWeight: 500, lineHeight: 1, paddingBottom: "8px" }}>{r.currency}</span>
                  <span style={{ color: "#fff", fontSize: "clamp(48px, 8vw, 64px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{r.rate}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", paddingBottom: "12px" }}>{r.supNote}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>{r.note}</p>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "2px" }}>
                  {r.cta} <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4 FEATURE CARDS ═════════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "72px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            {[
              {
                Icon: DollarSign, title: "Professional Pricing",
                desc: "Commissions starting at $0, low margin rates, high interest paid, and Stock Yield Enhancement.",
              },
              {
                Icon: Globe2, title: "Global Access",
                desc: "Invest globally in stocks, options, futures, currencies, bonds and funds from a single unified platform.",
              },
              {
                Icon: Zap, title: "Premier Technology",
                desc: "Vault's powerful suite of technology helps you optimize trading speed, efficiency and portfolio analysis.",
              },
              {
                Icon: ShieldCheck, title: "Strength & Security",
                desc: "$19.5 billion in equity capital, automated risk controls, all assets marked to market daily.",
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="feature-card" style={{
                border: "1px solid #e5e7eb", padding: "28px 24px",
                cursor: "pointer", transition: "background 0.15s",
              }}>
                <div style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", marginBottom: "18px" }}>
                  <Icon size={18} color="#374151" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "10px" }}>{title}</h3>
                <p style={{ fontSize: "13.5px", color: "#6b7280", lineHeight: 1.7, marginBottom: "16px" }}>{desc}</p>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
                  Learn More <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AWARD-WINNING PLATFORM ══════════════════════════════ */}
      <section style={{ background: "#f9fafb", padding: "64px 0", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "#111", marginBottom: "8px", letterSpacing: "-0.02em" }}>
            Award-Winning Platform &amp; Services
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "40px" }}>Recognized by the world's leading financial publications</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center", alignItems: "center" }}>
            {[
              { rank: "#1", label: "Professional Trading", src: "StockBrokers.com 2026" },
              { rank: "#1", label: "International Trading", src: "StockBrokers.com 2026" },
              { rank: "Best", label: "Online Broker for Advanced Traders", src: "NerdWallet 2026" },
              { rank: "Best", label: "For Advanced Traders", src: "Investopedia 2026" },
              { rank: "Best", label: "Online Broker", src: "BrokerChooser 2026" },
            ].map((a, i) => (
              <div key={i} style={{ textAlign: "center", padding: "20px 24px", background: "#fff", border: "1px solid #e5e7eb", minWidth: "160px" }}>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#c8102e", letterSpacing: "-0.02em", lineHeight: 1 }}>{a.rank}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginTop: "6px", marginBottom: "4px", lineHeight: 1.4 }}>{a.label}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>{a.src}</div>
              </div>
            ))}
          </div>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "32px", fontSize: "13px", fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
            See All Awards <ChevronRight size={14} />
          </a>
        </div>
      </section>

      {/* ═══ EXPERIENCE PROFESSIONAL PRICING ════════════════════ */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "64px", alignItems: "center" }}>
            <div style={{ borderRadius: "2px", overflow: "hidden", background: "#f9fafb", aspectRatio: "16/10", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/platform-mockup.png" alt="Professional pricing dashboard" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: "12px" }}>Professional Pricing</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "20px", lineHeight: 1.15 }}>
                Experience Professional Pricing
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { bold: "Low commissions starting at $0", rest: " with no added spreads, ticket charges, platform fees, or account minimums." },
                  { bold: "Best execution", rest: " — a powerful suite of advanced trading technologies designed to maximize price improvement." },
                  { bold: "Margin rates up to 55% lower", rest: " than the industry average." },
                  { bold: "Earn up to USD 3.14%", rest: " on instantly available cash balances." },
                  { bold: "Earn extra income", rest: " on your lendable shares through Stock Yield Enhancement." },
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <Check size={16} style={{ color: "#c8102e", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "14px", color: "#374151", lineHeight: 1.65 }}>
                      <strong style={{ color: "#111", fontWeight: 700 }}>{item.bold}</strong>{item.rest}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
                Learn More About Vault <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DISCOVER A WORLD OF OPPORTUNITIES ══════════════════ */}
      <section style={{ background: "#f9fafb", padding: "80px 0", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "64px", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: "12px" }}>Global Access</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "20px", lineHeight: 1.15 }}>
                Discover a World of Opportunities
              </h2>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.75, marginBottom: "32px" }}>
                Invest globally in stocks, options, futures, currencies, bonds and funds from a single unified platform. Fund your account in multiple currencies and trade assets denominated in multiple currencies. Access market data 24 hours a day, six days a week.
              </p>
              <div style={{ display: "flex", gap: "40px", marginBottom: "32px" }}>
                {[
                  { val: "170+", label: "Markets" },
                  { val: "33+", label: "Countries" },
                  { val: "27", label: "Currencies" },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "#c8102e", letterSpacing: "-0.025em", lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
                Global Markets <ChevronRight size={16} />
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <img src="/platform-globe.png" alt="World map showing global market access" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
              {/* Market status bar */}
              <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", padding: "6px 16px", fontSize: "12px", color: "#374151", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>● NYSE: Open</span>
                &nbsp;|&nbsp;<span style={{ color: "#6b7280" }}>LSE: Closed</span>
                &nbsp;|&nbsp;<span style={{ color: "#6b7280" }}>HKSE: Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ POWERFUL TRADING PLATFORMS ══════════════════════════ */}
      <section style={{ background: "#fff", padding: "80px 0", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "64px", alignItems: "center" }}>
            <div style={{ overflow: "hidden", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <img src="/platform-devices.png" alt="Vault Wealth platform on all devices" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: "12px" }}>Premier Technology</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "20px", lineHeight: 1.15 }}>
                Powerful Trading Platforms to Help You Succeed
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {[
                  { title: "Trading Platforms", desc: "Award-winning platforms for every investor — from beginner to advanced — on mobile, web and desktop.", link: "Trading Platforms" },
                  { title: "Research & News", desc: "Discover new investment opportunities with over 200 free and premium research and news providers.", link: "Research and News" },
                  { title: "Free Trading Tools", desc: "Spot opportunities, analyze results, manage your account and make better decisions with our free tools.", link: "Free Trading Tools" },
                  { title: "100+ Order Types", desc: "From limit orders to complex algorithmic trading — execute any trading strategy with precision.", link: "Order Types and Algos" },
                  { title: "Comprehensive Reporting", desc: "Real-time trade confirmations, margin specifics, transaction cost analysis and advanced portfolio assessment.", link: "Reporting" },
                ].map((item, i) => (
                  <div key={i} style={{ paddingBottom: "20px", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none" }}>
                    <a href="#" style={{ fontSize: "14.5px", fontWeight: 700, color: "#c8102e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
                      {item.link} <ExternalLink size={12} />
                    </a>
                    <p style={{ fontSize: "13.5px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ A BROKER YOU CAN TRUST ══════════════════════════════ */}
      <section style={{ background: "#f9fafb", padding: "80px 0", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "64px", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: "12px" }}>Strength &amp; Security</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "20px", lineHeight: 1.15 }}>
                A Broker You Can Trust
              </h2>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.75, marginBottom: "36px" }}>
                When placing your money with a broker, you need to make sure your broker is secure and can endure through good and bad times in the broader financial markets. Our strong capital position, conservative balance sheet and automated risk controls are designed to protect Vault from major market events.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#e5e7eb", marginBottom: "28px" }}>
                {[
                  { label: "Member of the", val: "S&P 500" },
                  { label: "Nasdaq Listed:", val: "VWT" },
                  { label: "Equity Capital", val: "$19.5B" },
                  { label: "Privately Held", val: "74%" },
                  { label: "Excess Regulatory Capital", val: "$13.3B" },
                  { label: "Client Accounts", val: "4.40M" },
                  { label: "Daily Avg Revenue Trades", val: "4.04M" },
                  { label: "Years of Innovation", val: "50+" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#f9fafb", padding: "16px 20px" }}>
                    <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px", lineHeight: 1.3 }}>{s.label}</div>
                    <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 900, color: "#111", letterSpacing: "-0.02em" }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
                Vault Financial Protection <ChevronRight size={16} />
              </a>
            </div>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <img src="/feature-security.png" alt="Vault door representing security" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CHOOSE THE BEST ACCOUNT TYPE ════════════════════════ */}
      <section style={{ background: "#fff", padding: "80px 0", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#111", letterSpacing: "-0.025em", marginBottom: "8px" }}>
            Choose the Best Account Type for You
          </h2>
          <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "48px" }}>From individual to institutional — we have an account for every investor</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginBottom: "56px" }}>
            {[
              { Icon: User,      label: "Individual Accounts",        sub: "Personal investing accounts" },
              { Icon: Users,     label: "Joint or Trust Accounts",    sub: "Shared and fiduciary accounts" },
              { Icon: Landmark,  label: "Retirement Accounts",        sub: "IRA, Roth, SEP and SIMPLE" },
              { Icon: Briefcase, label: "Non-Professional Advisors",  sub: "Manage friends & family portfolios" },
              { Icon: Building2, label: "Institutional Accounts",     sub: "Advisors, hedge funds & brokers" },
            ].map(({ Icon, label, sub }) => (
              <a key={label} href="#" className="acct-card" style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "28px 24px", border: "1px solid #e5e7eb", textDecoration: "none",
                width: "175px", transition: "box-shadow 0.18s, border-color 0.18s",
              }}>
                <div style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e5e7eb", marginBottom: "14px" }}>
                  <Icon size={20} color="#374151" strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#111", marginBottom: "4px", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                <span style={{ fontSize: "11.5px", color: "#9ca3af", textAlign: "center", lineHeight: 1.4 }}>{sub}</span>
              </a>
            ))}
          </div>

          {/* 3-step process */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0", background: "#f9fafb", border: "1px solid #e5e7eb", marginBottom: "36px" }}>
            {[
              { step: "Step 1", title: "Complete the Application", desc: "It only takes a few minutes" },
              { step: "Step 2", title: "Fund Your Account", desc: "Connect your bank or transfer an account" },
              { step: "Step 3", title: "Get Started Trading", desc: "Take your investing to the next level" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "32px 28px", borderRight: i < 2 ? "1px solid #e5e7eb" : "none", textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#c8102e", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase" }}>{s.step}</div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>{s.title}</h4>
                <p style={{ fontSize: "13.5px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "#c8102e", color: "#fff", fontWeight: 700, fontSize: "15px",
            padding: "13px 48px", textDecoration: "none", transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
            onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
            Open Account
          </Link>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
            No account minimums. No hidden fees.
          </p>
        </div>
      </section>

      {/* ═══ OVERNIGHT TRADING BANNER ════════════════════════════ */}
      <section style={{ background: "#0f2d52", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "740px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Trade US Stocks and ETFs Around the Clock
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
            React immediately to market-moving news. Trade over 10,000 US Stocks and ETFs, Index Futures and Options, US Treasuries, and global bonds when it's convenient for you.
          </p>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(255,255,255,0.3)", color: "#fff",
            fontSize: "14px", fontWeight: 600, padding: "10px 28px", textDecoration: "none",
            transition: "border-color 0.15s, background 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Learn More <ChevronRight size={15} />
          </a>
        </div>
      </section>

      {/* ═══ FOOTER DISCLAIMER ═══════════════════════════════════ */}
      <section style={{ background: "#f9fafb", padding: "32px 24px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1.8 }}>
            <sup>1</sup> Vault ForecastTrader is offered through Vault's affiliated exchange. <sup>2</sup> Political contracts are not available for US persons. <sup>3</sup> Annualized rate based on coupon formula for forecast contracts. <sup>4</sup> Vault pays interest on USD cash balances in IBKR Pro accounts with $100K or more in equity at the stated benchmark rate minus a spread. Rates subject to change without notice. <sup>5</sup> For accounts with up to USD 100,000 in borrowings. Rates subject to change. <sup>6</sup> $0 commissions on US listed stock and ETF trades for VAULT LITE accounts. Other fees, margin rates, and exchange and regulatory fees may apply. <sup>7</sup> As of latest quarterly earnings release. <sup>8</sup> Standard & Poor's rating is not a guarantee of the company's financial stability or creditworthiness. Past performance is not indicative of future results.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
