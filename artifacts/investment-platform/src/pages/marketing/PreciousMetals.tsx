import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Shield, TrendingUp, Globe2, DollarSign, BarChart2, Clock } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1610375461369-4a81c6e8d91c?w=1400&auto=format&fit=crop";

const METALS = [
  { name: "Gold", symbol: "XAU/USD", price: "$3,324.50/oz", change: "+0.61%", desc: "The ultimate store of value. Gold is the world's reserve asset and a proven hedge against inflation and currency debasement." },
  { name: "Silver", symbol: "XAG/USD", price: "$38.20/oz", change: "+1.14%", desc: "Industrial demand meets monetary role. Silver has both precious metal properties and extensive industrial applications in electronics and solar." },
  { name: "Platinum", symbol: "XPT/USD", price: "$1,082.10/oz", change: "-0.22%", desc: "Rarer than gold. Used extensively in catalytic converters, jewellery, and hydrogen fuel cells. High industrial demand drives price." },
  { name: "Palladium", symbol: "XPD/USD", price: "$1,180.40/oz", change: "+0.85%", desc: "Critical for emissions control in gasoline engines. Significant supply constraints from Russia and South Africa drive volatility." },
  { name: "Copper", symbol: "HG", price: "$4.42/lb", change: "+1.32%", desc: "The 'PhD in economics'. Copper demand tracks global economic activity, infrastructure spending, and the energy transition." },
  { name: "Aluminium", symbol: "ALI", price: "$2.62/lb", change: "-0.18%", desc: "The most widely used industrial metal. Demand driven by automotive, aerospace, construction, and packaging sectors." },
  { name: "Rhodium", symbol: "XRH/USD", price: "$4,850/oz", change: "+0.55%", desc: "One of the rarest and most valuable metals. Primary use in three-way catalytic converters for automotive emission control." },
];

const FEATURES = [
  { icon: Shield, title: "Secure Vaulted Storage", desc: "Physical precious metals you purchase are held in professional-grade secure vaults — no personal storage risk." },
  { icon: TrendingUp, title: "Spot and Futures", desc: "Trade precious metals at spot prices or via futures contracts — both available from a single account." },
  { icon: DollarSign, title: "0.15% Commission", desc: "Low, transparent commissions at 0.15% of notional value — with a $2 minimum per order." },
  { icon: Globe2, title: "24/7 Price Monitoring", desc: "Precious metal prices update around the clock — track gold, silver, and platinum in real time." },
  { icon: BarChart2, title: "ETF Alternatives", desc: "Prefer ETF exposure? Trade GLD, SLV, IAU, PPLT, and other metals ETFs commission-free on US exchanges." },
  { icon: Clock, title: "Extended Market Hours", desc: "Precious metal futures trade nearly 24 hours a day on COMEX, giving you access to global price moves overnight." },
];

export default function PreciousMetals() {
  return (
    <MarketingPage
      eyebrow="Precious Metals"
      title={<>Invest in Gold, Silver,<br /><span style={{ color: "#fff" }}>and Beyond</span></>}
      subtitle="Trade 7 precious and industrial metals at spot prices or via futures — with 0.15% commissions, secure custody, and 24/7 price monitoring. One of the widest metals selections of any online broker."
      heroImage={IMG}
      stats={[
        { value: "7", label: "Metals Available" },
        { value: "0.15%", label: "Commission Rate" },
        { value: "24/7", label: "Price Monitoring" },
        { value: "$3,324", label: "Gold Spot /oz" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>A complete metals investment toolkit</h2>
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
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Live Metals Prices</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Seven metals to trade and invest in</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {METALS.map(m => (
              <div key={m.name} style={{ border: "1px solid #E6E8EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{m.name}</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{m.symbol}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{m.price}</p>
                    <p style={{ fontSize: 12, color: m.change.startsWith("+") ? "#22c55e" : "#ef4444" }}>{m.change}</p>
                  </div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 320, backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 14 }}>Gold has returned +28% in the last 12 months.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>Diversify with precious metals — a time-tested hedge against inflation, geopolitical risk, and currency debasement.</p>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
