import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { BarChart2, Layers, TrendingUp, Shield, Sliders, Activity, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&auto=format&fit=crop";

const STRATEGIES = [
  { name: "Covered Call", risk: "Low", desc: "Generate income on stocks you already own by selling call options against your position." },
  { name: "Cash-Secured Put", risk: "Low", desc: "Collect premium by selling puts on stocks you'd like to own at a lower price." },
  { name: "Long Call / Put", risk: "Medium", desc: "Directional bets with defined risk. Leverage upside with limited downside." },
  { name: "Bull Call Spread", risk: "Medium", desc: "Reduce cost of a long call by selling a higher-strike call. Defined risk and reward." },
  { name: "Iron Condor", risk: "Medium", desc: "Profit from low volatility. Sell both a call spread and a put spread around current price." },
  { name: "Straddle / Strangle", risk: "High", desc: "Profit from large moves in either direction. Ideal around earnings or major events." },
];

const TOOLS = [
  { icon: Activity, title: "OptionTrader", desc: "Full-featured options chains with Greeks, P&L graphs, and strategy builder built directly into the platform." },
  { icon: BarChart2, title: "Probability Lab", desc: "Model probability distributions based on market-implied expectations — not historical data." },
  { icon: Sliders, title: "Option Strategy Lab", desc: "Scan 10+ options strategies simultaneously. Find the best trade for your view and risk tolerance." },
  { icon: TrendingUp, title: "Risk Navigator", desc: "Visualise your entire options portfolio risk in real-time across delta, gamma, vega, and theta." },
  { icon: Shield, title: "Margin Calculator", desc: "See exact margin requirements for any options position before you enter the trade." },
  { icon: Layers, title: "Multi-Leg Orders", desc: "Execute complex spreads, straddles, condors, and butterflies as a single order — at one commission." },
];

const RATES = [
  { product: "US Equity Options", rate: "$0.65/contract", cap: "Capped at $1.00/leg" },
  { product: "US Index Options (SPX, NDX)", rate: "$0.85/contract", cap: "No cap" },
  { product: "European Options", rate: "0.10%–0.20%", cap: "Min $5/order" },
  { product: "Asian Options", rate: "0.08%–0.18%", cap: "Min varies" },
  { product: "Exercise / Assignment", rate: "$0", cap: "No fee" },
  { product: "FLEX Options", rate: "$0.65/contract", cap: "Exchange fees apply" },
];

export default function Options() {
  return (
    <MarketingPage
      eyebrow="Options Trading"
      title={<>Trade Options<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>with Precision</span></>}
      subtitle="Options are one of the most versatile investment tools available. INT Brokers gives you institutional-grade options analytics, the industry's widest strategy library, and $0.65/contract pricing."
      heroImage={IMG}
      stats={[
        { value: "$0.65", label: "Per Contract" },
        { value: "100+", label: "Strategy Types" },
        { value: "170+", label: "Options Markets" },
        { value: "$0", label: "Exercise / Assignment" },
      ]}
      ctaTitle="Start Trading Options"
      ctaText="The most advanced options platform available to retail investors — at $0.65 per contract."
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Professional Tools</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Institutional analytics for every options trader</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {TOOLS.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <Icon size={22} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Strategy Library</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Six core strategies to start with</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {STRATEGIES.map(s => (
              <div key={s.name} style={{ border: "1px solid #E6E8EB", borderRadius: 14, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{s.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#F5F6F7", border: "1px solid #E6E8EB", padding: "3px 10px", borderRadius: 99, color: "#6B7280" }}>Risk: {s.risk}</span>
                </div>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 320, backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 14 }}>Exercise and assignment are always free.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>No hidden fees when you exercise a call or get assigned on a put. Only $0.65 per contract when you enter the trade.</p>
          </div>
        </div>
      </div>

      <section style={{ background: "#F5F6F7", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Options commission schedule</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "12px 20px" }}>
              {["Product", "Rate", "Notes"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {RATES.map((r, i) => (
              <div key={r.product} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "11px 20px", borderBottom: i < RATES.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                <span style={{ fontSize: 13, color: "#0F172A" }}>{r.product}</span>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{r.rate}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.cap}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
