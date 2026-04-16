import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { Monitor, Smartphone, Globe2, Code2, Zap, BarChart2, ShieldCheck, Sliders, Clock, RefreshCw, Lock, Activity } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1518432031310-db1e13219d51?w=1400&auto=format&fit=crop";

const PLATFORMS = [
  {
    icon: Monitor,
    name: "Vault Desktop",
    tagline: "Professional Desktop Platform",
    desc: "The industry's most advanced desktop trading platform. Real-time streaming data, 100+ order types, multi-monitor support, and fully customisable layouts for serious traders.",
    bullets: ["Advanced options analytics (OptionTrader)", "Probability Lab for strategy modelling", "PortfolioAnalyst performance reporting", "Risk Navigator for live risk management", "Global Analyst — compare stocks across 47 countries"],
  },
  {
    icon: Globe2,
    name: "Client Portal",
    tagline: "Web-Based Trading",
    desc: "Full-featured browser trading platform. No software to install. Access your account, manage positions, fund, and execute from any device with a modern browser.",
    bullets: ["Account management & reporting", "Tax centre & document vault", "Order entry and monitoring", "Research, news & market data", "Mobile-responsive and fully accessible"],
  },
  {
    icon: Smartphone,
    name: "Vault Mobile",
    tagline: "iOS & Android App",
    desc: "Award-winning mobile trading. Full institutional functionality in the palm of your hand. Alerts, watchlists, live charts, and order entry — wherever you are.",
    bullets: ["Face ID & Touch ID login", "Biometric authentication", "Real-time push notifications", "Option chains and strategy builder", "4.9/5 on App Store — 50,000+ ratings"],
  },
  {
    icon: Code2,
    name: "Vault API",
    tagline: "For Algorithmic Traders",
    desc: "Programmatic trading with institutional-grade execution. Multiple API protocols: REST, WebSocket, FIX, and our proprietary TWS API for advanced strategies.",
    bullets: ["REST API for account & orders", "WebSocket for real-time market data", "FIX protocol for institutional connectivity", "Python, Java, C++, C# SDKs", "Paper trading for backtesting strategies"],
  },
];

const TECH_FEATURES = [
  { icon: Zap, title: "Sub-millisecond Execution", desc: "Orders are routed to the best available venue in under 1 millisecond via our SmartRouting technology." },
  { icon: BarChart2, title: "100+ Order Types", desc: "Adaptive algorithms, conditional orders, bracket orders, trailing stops, and institutional-grade algo orders." },
  { icon: ShieldCheck, title: "99.98% Platform Uptime", desc: "Redundant infrastructure across multiple data centres ensures your platform is available when the market is open." },
  { icon: Sliders, title: "SmartRouting", desc: "Our proprietary order routing algorithm scans 70+ execution venues simultaneously to get you the best fill price." },
  { icon: Clock, title: "Real-Time Risk Engine", desc: "Automated risk controls calculate your real-time margin requirements and portfolio risk every second." },
  { icon: Activity, title: "Advanced Charting", desc: "100+ technical indicators, 60+ chart types, drawing tools, and multi-timeframe analysis built into every platform." },
];

const ORDER_TYPES = [
  "Market Order", "Limit Order", "Stop Order", "Stop-Limit", "Trailing Stop", "Trailing Stop-Limit",
  "Pegged-to-Market", "Pegged-to-Midpoint", "Relative / Pegged-to-Primary", "Sweep-to-Fill",
  "Adaptive Algo", "VWAP / TWAP", "Bracket Orders", "One-Cancels-All (OCA)", "If/Then Conditional",
  "Iceberg / Reserve", "Volatility Orders", "Price Management Algo", "Dark Ice", "Accumulate/Distribute",
];

export default function Technology() {
  return (
    <MarketingPage
      eyebrow="Premier Technology"
      title={<>Award-Winning Platforms<br /><span style={{ color: "#fff" }}>Built for Every Investor</span></>}
      subtitle="From ultra-low latency desktop trading to seamless mobile apps and algorithmic APIs — INT Brokers technology has been recognised as the best in the industry for six consecutive years."
      heroImage={IMG}
      stats={[
        { value: "<1ms", label: "Order Execution" },
        { value: "100+", label: "Order Types" },
        { value: "99.98%", label: "Platform Uptime" },
        { value: "4.9/5", label: "App Store Rating" },
        { value: "70+", label: "Execution Venues" },
      ]}
      ctaTitle="Experience the Platform"
      ctaText="Open a free account and explore award-winning platforms — desktop, web, mobile, and API."
    >
      {/* Platforms */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Trading Platforms</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Four ways to access your account</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(480px,1fr))", gap: 24 }}>
            {PLATFORMS.map(({ icon: Icon, name, tagline, desc, bullets }) => (
              <div key={name} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "28px 32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <Icon size={24} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                    <div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{tagline}</p>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{name}</h3>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{desc}</p>
                </div>
                <div style={{ padding: "24px 32px" }}>
                  {bullets.map(b => (
                    <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#374151", flexShrink: 0, marginTop: 7 }} />
                      <span style={{ fontSize: 13.5, color: "#374151" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <div style={{ height: 360, backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(8,10,15,0.9) 50%,rgba(8,10,15,0.5))" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", padding: "0 64px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 480 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>SmartRouting™</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>We scan 70+ venues to find your best fill — in under a millisecond.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>Our SmartRouting technology continuously scans competing market venues for the best price and executes your order — typically saving clients more than the cost of commissions on their own.</p>
          </div>
        </div>
      </div>

      {/* Tech features */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Under the Hood</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Technology that works as hard as you do</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {TECH_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ border: "1px solid #E6E8EB", borderRadius: 14, padding: "24px" }}>
                <Icon size={20} color="#374151" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order types */}
      <section style={{ background: "#F5F6F7", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 10 }}>100+ order types — from simple to institutional</h2>
            <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 560, margin: "0 auto" }}>Whether you need a plain market order or a complex conditional algo, our platforms support it all.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {ORDER_TYPES.map(o => (
              <span key={o} style={{ fontSize: 12.5, background: "#fff", border: "1px solid #E6E8EB", borderRadius: 8, padding: "6px 14px", color: "#374151", fontWeight: 500 }}>{o}</span>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
