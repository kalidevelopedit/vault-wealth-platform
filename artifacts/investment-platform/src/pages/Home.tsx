import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ChevronRight, ExternalLink, Info, User, Users, Landmark, Briefcase, Building2, DollarSign, Globe2, Zap, ShieldCheck, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

/* ─── Inline animation & global styles ─────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes ticker  {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }

  .hero-1 { animation: fadeInUp .7s ease both; }
  .hero-2 { animation: fadeInUp .7s .13s ease both; }
  .hero-3 { animation: fadeInUp .7s .26s ease both; }
  .hero-4 { animation: fadeInUp .7s .36s ease both; }
  .hero-mockup { animation: fadeIn 1.2s .4s ease both; }

  .ticker-track { display:flex; width:max-content; animation: ticker 28s linear infinite; }

  .stat-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.45) !important; }
  .feat-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.10) !important; }
  .rate-card:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important; }
  .acct-card:hover { border-color: #c8102e !important; background: #fef2f2 !important; }
  .award-card:hover { border-color: rgba(200,16,46,0.4) !important; background: rgba(200,16,46,0.05) !important; }
  .step-card:hover { background: #fff !important; box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important; }

  * { box-sizing: border-box; }
`;

/* ─── Data ──────────────────────────────────────────────────────────────── */
const TICKERS = [
  { sym: "BTC/USD", price: "107,842", chg: "+2.41%", up: true },
  { sym: "AAPL",    price: "211.84",  chg: "+1.24%", up: true },
  { sym: "SPY",     price: "589.12",  chg: "+0.83%", up: true },
  { sym: "TSLA",    price: "347.28",  chg: "-1.02%", up: false },
  { sym: "GC=F",    price: "3,324.5", chg: "+0.61%", up: true },
  { sym: "EUR/USD", price: "1.0874",  chg: "-0.18%", up: false },
  { sym: "ETH/USD", price: "2,941",   chg: "+3.14%", up: true },
  { sym: "NVDA",    price: "138.42",  chg: "+4.57%", up: true },
  { sym: "CL=F",    price: "71.63",   chg: "-0.44%", up: false },
  { sym: "QQQ",     price: "512.04",  chg: "+1.06%", up: true },
];

/* ─── SVG patterns ──────────────────────────────────────────────────────── */
const DOT_GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOT_GRID_LIGHT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;
const LINE_GRID = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M60 0L0 0 0 60' stroke='rgba(255,255,255,0.03)' stroke-width='1' fill='none'/%3E%3C/svg%3E")`;

export default function Home() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
      <style>{css}</style>
      <HomeNavbar />

      {/* ═══════════════ HERO ════════════════════════════════════════════ */}
      <section style={{ background: "#080a0f", paddingTop: 72, paddingBottom: 0, position: "relative", overflow: "hidden" }}>

        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID, zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: LINE_GRID, zIndex: 0 }} />

        {/* Radial glow meshes */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(200,16,46,0.12) 0%, transparent 65%)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 200, left: -200, width: 600, height: 600, background: "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 100, right: -100, width: 500, height: 500, background: "radial-gradient(ellipse, rgba(200,16,46,0.06) 0%, transparent 70%)", zIndex: 1, pointerEvents: "none" }} />

        {/* Floating market data chips */}
        <div className="hero-1" style={{ position: "absolute", top: 110, left: "8%", zIndex: 3, animation: "fadeInUp .8s ease both, float 4s 1s ease-in-out infinite" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#f7931a,#f5a623)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>₿</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>BTC/USD</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>$107,842</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginLeft: 4 }}>+2.41%</div>
          </div>
        </div>

        <div className="hero-2" style={{ position: "absolute", top: 200, right: "7%", zIndex: 3, animation: "fadeInUp 1s .2s ease both, float 5s 1.5s ease-in-out infinite" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#555,#222)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>AAPL</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Apple Inc.</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>$211.84</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>+1.24%</div>
          </div>
        </div>

        <div className="hero-3" style={{ position: "absolute", top: 350, left: "6%", zIndex: 3, animation: "fadeInUp 1s .35s ease both, float 6s 2s ease-in-out infinite" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#b45309,#92400e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>AU</div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Gold Spot</div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>$3,324.5</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>+0.61%</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 5, maxWidth: 860, margin: "0 auto", padding: "80px 24px 40px", textAlign: "center" }}>
          {/* Badge */}
          <div className="hero-1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,16,46,0.12)", border: "1px solid rgba(200,16,46,0.25)", borderRadius: 999, padding: "5px 14px 5px 8px", marginBottom: 28 }}>
            <span style={{ background: "#c8102e", color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 999, padding: "2px 8px" }}>New</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>24/7 US equity and ETF trading now live</span>
            <ArrowUpRight size={13} color="rgba(255,255,255,0.4)" />
          </div>

          <h1 className="hero-2" style={{ fontSize: "clamp(46px, 7.5vw, 82px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 28 }}>
            Lower Costs.<br />
            <span style={{ background: "linear-gradient(90deg, #e8394a 0%, #ff7b7b 50%, #e8394a 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Better Returns.</span>
          </h1>

          <p className="hero-3" style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.48)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 20px" }}>
            Earn <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>up to USD&nbsp;3.14%</strong> on uninvested cash, pay{" "}
            <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>up to 55%&nbsp;less</strong> on margin, and trade with{" "}
            <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>commissions from&nbsp;$0</strong> across{" "}
            <strong style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}>170+&nbsp;markets</strong>.
          </p>

          {/* Mini stats row */}
          <div className="hero-3" style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            {[
              { val: "$19.5B", label: "Equity Capital" },
              { val: "4.4M+", label: "Client Accounts" },
              { val: "170+", label: "Global Markets" },
              { val: "50+", label: "Years of Innovation" },
            ].map(s => (
              <div key={s.val} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="hero-4" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 12 }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #e8192c 0%, #c8102e 100%)",
              color: "#fff", fontWeight: 700, fontSize: 15,
              padding: "14px 42px", textDecoration: "none", borderRadius: 12,
              boxShadow: "0 4px 24px rgba(200,16,46,0.45), 0 1px 0 rgba(255,255,255,0.1) inset",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(200,16,46,0.55), 0 1px 0 rgba(255,255,255,0.1) inset"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,16,46,0.45), 0 1px 0 rgba(255,255,255,0.1) inset"; }}>
              Get Started Free
            </Link>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "14px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}>
              View Demo <ChevronRight size={14} />
            </a>
          </div>

          <div className="hero-4" style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
            <Info size={11} />&nbsp;
            <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>Lower Cost Disclosure</a>
          </div>
        </div>

        {/* Platform mockup */}
        <div className="hero-mockup" style={{ position: "relative", width: "100%", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <img src="/speed-lines.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, #080a0f, transparent)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, #080a0f, transparent)" }} />
          </div>
          <div style={{ position: "relative", zIndex: 2, padding: "0 60px" }}>
            <img src="/ibkr-platform-mockup.png" alt="Vault Wealth platform" style={{ width: "100%", maxWidth: 960, display: "block", margin: "0 auto", objectFit: "contain" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, #080a0f)", pointerEvents: "none" }} />
          </div>
        </div>
      </section>

      {/* ─── LIVE TICKER BAR ─────────────────────────────────────── */}
      <div style={{ background: "#0d1017", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "10px 0", overflow: "hidden" }}>
        <div className="ticker-track">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", borderRight: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em" }}>{t.sym}</span>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>${t.price}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.up ? "#4ade80" : "#f87171" }}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ RATE CARDS (dark) ══════════════════════════════ */}
      <section style={{ background: "#080a0f", padding: "80px 0 96px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID, zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 10 }}>Unbeatable Rates</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0 }}>
              Your Money Works Harder
            </h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 15, marginTop: 10 }}>Earn more on cash. Pay less to borrow.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {[
              { head: "Earn up to", currency: "USD", rate: "3.14%", note: "on instantly available cash balances", cta: "View Interest Rates", accent: "#4ade80" },
              { head: "Borrow at margin rates as low as", currency: "USD", rate: "4.14%", note: "Among the lowest margin rates globally", cta: "View Margin Rates", accent: "#60a5fa" },
            ].map(r => (
              <div key={r.rate} className="rate-card" style={{
                background: "linear-gradient(140deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "40px 40px 36px",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(12px)",
              }}>
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${r.accent}50, transparent)` }} />
                {/* Background glow */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(ellipse, ${r.accent}10, transparent 70%)`, pointerEvents: "none" }} />

                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>{r.head}</p>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18, fontWeight: 500, lineHeight: 1, paddingBottom: 8 }}>{r.currency}</span>
                  <span style={{ color: "#fff", fontSize: "clamp(52px, 8vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>{r.rate}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.6, marginBottom: 32 }}>{r.note}</p>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: r.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  {r.cta} <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 4 FEATURE CARDS (white) ════════════════════════ */}
      <section style={{ background: "#F5F6F7", padding: "88px 0", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID_LIGHT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Why Vault Wealth</p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Built for Serious Investors
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                Icon: DollarSign,
                title: "Professional Pricing",
                desc: "Commissions starting at $0, low margin rates, high interest paid, and Stock Yield Enhancement.",
                gradient: "linear-gradient(135deg, #1e3a5f, #0f2d52)",
                iconBg: "rgba(59,130,246,0.2)",
                iconColor: "#60a5fa",
              },
              {
                Icon: Globe2,
                title: "Global Access",
                desc: "Invest globally in stocks, options, futures, currencies, bonds and funds from a single unified platform.",
                gradient: "linear-gradient(135deg, #0a2920, #052015)",
                iconBg: "rgba(74,222,128,0.2)",
                iconColor: "#4ade80",
              },
              {
                Icon: Zap,
                title: "Premier Technology",
                desc: "Vault's powerful suite of technology helps you optimize trading speed, efficiency and portfolio analysis.",
                gradient: "linear-gradient(135deg, #2d1f0a, #1e1505)",
                iconBg: "rgba(251,191,36,0.2)",
                iconColor: "#fbbf24",
              },
              {
                Icon: ShieldCheck,
                title: "Strength & Security",
                desc: "$19.5 billion in equity capital, automated risk controls, all assets marked to market daily.",
                gradient: "linear-gradient(135deg, #1f0a0a, #150505)",
                iconBg: "rgba(248,113,113,0.2)",
                iconColor: "#f87171",
              },
            ].map(({ Icon, title, desc, gradient, iconBg, iconColor }) => (
              <div key={title} className="feat-card" style={{
                background: gradient,
                borderRadius: 20,
                padding: "32px 28px 28px",
                cursor: "pointer",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.04)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Top shimmer */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ width: 46, height: 46, borderRadius: 13, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} color={iconColor} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 20 }}>{desc}</p>
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: iconColor, textDecoration: "none" }}>
                  Learn More <ChevronRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ AWARDS ══════════════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "80px 0", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Recognition</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 900, color: "#0F172A", marginBottom: 8, letterSpacing: "-0.025em" }}>
            Award-Winning Platform
          </h2>
          <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 48 }}>Recognized by the world's leading financial publications</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", alignItems: "stretch" }}>
            {[
              { rank: "#1", label: "Professional Trading", src: "StockBrokers.com 2026" },
              { rank: "#1", label: "International Trading", src: "StockBrokers.com 2026" },
              { rank: "Best", label: "Advanced Traders", src: "NerdWallet 2026" },
              { rank: "Best", label: "For Advanced Traders", src: "Investopedia 2026" },
              { rank: "Best", label: "Online Broker", src: "BrokerChooser 2026" },
            ].map((a, i) => (
              <div key={i} className="award-card" style={{
                textAlign: "center", padding: "28px 28px",
                background: "#fff",
                border: "1px solid #E6E8EB",
                borderRadius: 16,
                minWidth: 155,
                transition: "border-color 0.2s, background 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                cursor: "default",
              }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#c8102e", letterSpacing: "-0.03em", lineHeight: 1 }}>{a.rank}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 8, marginBottom: 4, lineHeight: 1.4 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>{a.src}</div>
              </div>
            ))}
          </div>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 36, fontSize: 13, fontWeight: 600, color: "#c8102e", textDecoration: "none" }}>
            See All Awards <ChevronRight size={14} />
          </a>
        </div>
      </section>

      {/* ═══════════════ PROFESSIONAL PRICING SPLIT ══════════════════════ */}
      <section style={{ background: "#F5F6F7", padding: "96px 0", borderTop: "1px solid #E6E8EB", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID_LIGHT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 72, alignItems: "center" }}>
            {/* Image side */}
            <div style={{ borderRadius: 20, overflow: "hidden", background: "#e8eaed", aspectRatio: "16/10", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
              <img src="/platform-mockup.png" alt="Professional pricing dashboard" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* floating badge */}
              <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 12, padding: "10px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>Commission Saved (YTD)</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>$18,432.50</div>
                <div style={{ fontSize: 12, color: "#2b6b4e", fontWeight: 700 }}>↑ 23% vs last year</div>
              </div>
            </div>
            {/* Text side */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 12 }}>Professional Pricing</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 24, lineHeight: 1.1 }}>
                Experience Professional Pricing
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { bold: "Low commissions starting at $0", rest: " with no added spreads, ticket charges, platform fees, or account minimums." },
                  { bold: "Best execution", rest: " — advanced trading technologies designed to maximize price improvement." },
                  { bold: "Margin rates up to 55% lower", rest: " than the industry average." },
                  { bold: "Earn up to USD 3.14%", rest: " on instantly available cash balances." },
                  { bold: "Earn extra income", rest: " on your lendable shares through Stock Yield Enhancement." },
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(200,16,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Check size={12} color="#c8102e" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                      <strong style={{ color: "#0F172A", fontWeight: 700 }}>{item.bold}</strong>{item.rest}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#c8102e", textDecoration: "none" }}>
                Learn More <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ GLOBAL MARKETS ══════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "96px 0", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 72, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 12 }}>Global Access</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
                Discover a World of Opportunities
              </h2>
              <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.8, marginBottom: 36 }}>
                Invest globally in stocks, options, futures, currencies, bonds and funds from a single unified platform. Fund your account in multiple currencies and trade assets denominated in multiple currencies. Access market data 24 hours a day, six days a week.
              </p>
              <div style={{ display: "flex", gap: 32, marginBottom: 36 }}>
                {[
                  { val: "170+", label: "Markets" },
                  { val: "33+", label: "Countries" },
                  { val: "27", label: "Currencies" },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 900, color: "#c8102e", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#c8102e", textDecoration: "none" }}>
                Global Markets <ChevronRight size={16} />
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid #E6E8EB" }}>
                <img src="/platform-globe.png" alt="World map showing global market access" style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
              </div>
              {/* floating market status */}
              <div style={{ position: "absolute", bottom: -16, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #E6E8EB", borderRadius: 12, padding: "10px 20px", fontSize: 12, color: "#374151", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: "#2b6b4e", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2b6b4e", display: "inline-block" }} />NYSE Open</span>
                <span style={{ color: "#9CA3AF" }}>|</span>
                <span style={{ color: "#9CA3AF", fontWeight: 500 }}>LSE Closed</span>
                <span style={{ color: "#9CA3AF" }}>|</span>
                <span style={{ color: "#9CA3AF", fontWeight: 500 }}>HKSE Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRADING PLATFORMS ═══════════════════════════════ */}
      <section style={{ background: "#F5F6F7", padding: "96px 0", borderTop: "1px solid #E6E8EB", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID_LIGHT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 72, alignItems: "center" }}>
            <div style={{ borderRadius: 20, overflow: "hidden", background: "#e8eaed", display: "flex", alignItems: "center", justifyContent: "center", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.10)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <img src="/platform-devices.png" alt="Vault Wealth on all devices" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 12 }}>Premier Technology</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 28, lineHeight: 1.1 }}>
                Powerful Platforms to Help You Succeed
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { title: "Trading Platforms", desc: "Award-winning platforms for every investor — mobile, web and desktop.", link: "Trading Platforms" },
                  { title: "Research & News", desc: "200+ free and premium research providers to discover new opportunities.", link: "Research and News" },
                  { title: "Free Trading Tools", desc: "Spot opportunities, analyze results, and make better decisions.", link: "Free Trading Tools" },
                  { title: "100+ Order Types", desc: "From limit orders to complex algorithmic trading — full precision.", link: "Order Types and Algos" },
                  { title: "Comprehensive Reporting", desc: "Real-time confirmations, margin details, transaction cost analysis.", link: "Reporting" },
                ].map((item, i) => (
                  <div key={i} style={{ padding: "18px 0", borderBottom: i < 4 ? "1px solid #E6E8EB" : "none", display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", border: "1px solid #E6E8EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#c8102e" }}>{i + 1}</span>
                    </div>
                    <div>
                      <a href="#" style={{ fontSize: 14, fontWeight: 700, color: "#c8102e", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        {item.link} <ExternalLink size={11} />
                      </a>
                      <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST / STATS (dark) ═══════════════════════════ */}
      <section style={{ background: "#080a0f", padding: "96px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID, zIndex: 0 }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 500, height: 500, background: "radial-gradient(ellipse, rgba(200,16,46,0.05) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 72, alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 12 }}>Strength &amp; Security</p>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>
                A Broker You Can Trust
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 40 }}>
                When placing your money with a broker, you need to make sure your broker is secure and can endure through good and bad times in the broader financial markets. Our strong capital position, conservative balance sheet and automated risk controls are designed to protect Vault from major market events.
              </p>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#60a5fa", textDecoration: "none" }}>
                Vault Financial Protection <ChevronRight size={16} />
              </a>
            </div>
            {/* Stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Member of the", val: "S&P 500" },
                { label: "Nasdaq Listed", val: "VWT" },
                { label: "Equity Capital", val: "$19.5B" },
                { label: "Privately Held", val: "74%" },
                { label: "Excess Regulatory Capital", val: "$13.3B" },
                { label: "Client Accounts", val: "4.40M" },
                { label: "Daily Avg Revenue Trades", val: "4.04M" },
                { label: "Years of Innovation", val: "50+" },
              ].map((s, i) => (
                <div key={i} className="stat-chip" style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: "clamp(20px, 2.5vw, 26px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ACCOUNT TYPES ═══════════════════════════════════ */}
      <section style={{ background: "#fff", padding: "96px 0", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Account Types</p>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em", marginBottom: 8 }}>
            Choose the Best Account for You
          </h2>
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 52 }}>From individual to institutional — we have an account for every investor</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", marginBottom: 60 }}>
            {[
              { Icon: User,      label: "Individual Accounts",       sub: "Personal investing accounts" },
              { Icon: Users,     label: "Joint or Trust Accounts",   sub: "Shared and fiduciary accounts" },
              { Icon: Landmark,  label: "Retirement Accounts",       sub: "IRA, Roth, SEP and SIMPLE" },
              { Icon: Briefcase, label: "Non-Professional Advisors", sub: "Manage friends & family" },
              { Icon: Building2, label: "Institutional Accounts",    sub: "Advisors, hedge funds & brokers" },
            ].map(({ Icon, label, sub }) => (
              <a key={label} href="#" className="acct-card" style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "28px 24px", border: "1px solid #E6E8EB", textDecoration: "none",
                width: 175, borderRadius: 16, transition: "border-color 0.18s, background 0.18s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F5F6F7", border: "1px solid #E6E8EB", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={20} color="#374151" strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 4, textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", lineHeight: 1.4 }}>{sub}</span>
              </a>
            ))}
          </div>

          {/* 3-step process */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[
              { step: "01", title: "Complete the Application", desc: "It only takes a few minutes" },
              { step: "02", title: "Fund Your Account", desc: "Connect your bank or transfer an account" },
              { step: "03", title: "Get Started Trading", desc: "Take your investing to the next level" },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{ padding: "28px 28px", borderRadius: 16, border: "1px solid #E6E8EB", background: "#F5F6F7", textAlign: "center", transition: "background 0.18s, box-shadow 0.18s", cursor: "default" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "rgba(200,16,46,0.15)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{s.step}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/register" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #e8192c, #c8102e)",
            color: "#fff", fontWeight: 700, fontSize: 15,
            padding: "14px 52px", textDecoration: "none", borderRadius: 12,
            boxShadow: "0 4px 24px rgba(200,16,46,0.35)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(200,16,46,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(200,16,46,0.35)"; }}>
            Open Account — No Minimums
          </Link>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>No account minimums. No hidden fees.</p>
        </div>
      </section>

      {/* ═══════════════ 24/7 TRADING BANNER ════════════════════════════ */}
      <section style={{ background: "linear-gradient(135deg, #0f2d52 0%, #0a1e3a 50%, #0f1320 100%)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT_GRID, zIndex: 0 }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(200,16,46,0.08) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Markets open 24/7 for eligible instruments</span>
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16, lineHeight: 1.15 }}>
            Trade US Stocks and ETFs Around the Clock
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
            React immediately to market-moving news. Trade over 10,000 US Stocks and ETFs, Index Futures and Options, US Treasuries, and global bonds when it's convenient for you.
          </p>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            padding: "12px 32px", textDecoration: "none", borderRadius: 12,
            backdropFilter: "blur(8px)",
            transition: "background 0.15s, border-color 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.16)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}>
            Learn About 24/7 Trading <ChevronRight size={14} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
