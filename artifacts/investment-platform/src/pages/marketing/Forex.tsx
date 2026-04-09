import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Globe2, Clock, Zap, TrendingUp, DollarSign, BarChart2 } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&auto=format&fit=crop";

const PAIRS = [
  { pair: "EUR/USD", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "GBP/USD", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "USD/JPY", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "USD/CHF", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "AUD/USD", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "USD/CAD", spread: "0.1 pip", minSize: "$25,000" },
  { pair: "NZD/USD", spread: "0.2 pip", minSize: "$25,000" },
  { pair: "EUR/GBP", spread: "0.3 pip", minSize: "$25,000" },
];

const FEATURES = [
  { icon: DollarSign, title: "From 0.1 Pip Spread", desc: "Near-interbank spreads on major pairs — EUR/USD from 0.1 pip with no dealing desk markup." },
  { icon: Globe2, title: "100+ Currency Pairs", desc: "Majors, minors, exotics, and EM currencies — all with competitive pricing and deep liquidity." },
  { icon: Clock, title: "24/5 Trading", desc: "Forex markets are open 24 hours a day, Sunday evening through Friday evening — trade on any major time zone." },
  { icon: Zap, title: "Best Execution", desc: "Your forex orders are routed to the best available liquidity provider from a pool of 17+ top-tier banks." },
  { icon: TrendingUp, title: "No Commissions on Spot Forex", desc: "INT Brokers earns on the spread only. No separate commission per trade — transparent and simple." },
  { icon: BarChart2, title: "27-Currency Account", desc: "Hold multiple currency balances in your account and convert at near-interbank rates with 0.2 pip markup." },
];

export default function Forex() {
  return (
    <MarketingPage
      eyebrow="Forex / Currencies"
      title={<>Trade Currencies<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>24 Hours a Day</span></>}
      subtitle="Access 100+ currency pairs with near-interbank spreads starting from 0.1 pip. No dealing desk, no re-quotes, 24/5 trading access, and the ability to hold 27 currency balances in one account."
      heroImage={IMG}
      stats={[
        { value: "100+", label: "Currency Pairs" },
        { value: "0.1 pip", label: "Min Spread" },
        { value: "24/5", label: "Trading Hours" },
        { value: "17+", label: "Liquidity Providers" },
        { value: "27", label: "Currency Balances" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Why trade forex at INT Brokers?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
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
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(20px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Major pair spreads</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 20px" }}>
              {["Pair", "Typical Spread", "Min Trade Size"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {PAIRS.map((p, i) => (
              <div key={p.pair} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "11px 20px", borderBottom: i < PAIRS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{p.pair}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{p.spread}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{p.minSize}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
