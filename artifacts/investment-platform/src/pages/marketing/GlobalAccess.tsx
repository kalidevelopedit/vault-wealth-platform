import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { Globe2, Clock, DollarSign, BarChart2, Landmark, ArrowUpRight, Check } from "lucide-react";
import { Link } from "wouter";

const IMG = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop";

const REGIONS = [
  { name: "Americas", countries: ["United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Colombia"], products: "Stocks, ETFs, Options, Futures, Forex, Bonds, Crypto" },
  { name: "Europe", countries: ["United Kingdom", "Germany", "France", "Switzerland", "Netherlands", "Spain", "Sweden", "Austria", "Belgium", "Denmark", "Finland", "Norway", "Portugal", "Italy"], products: "Stocks, ETFs, Futures, Forex, Bonds, CFDs" },
  { name: "Asia-Pacific", countries: ["Hong Kong", "Japan", "Australia", "Singapore", "India", "South Korea", "China (A-Shares)", "Taiwan", "New Zealand"], products: "Stocks, ETFs, Futures, Forex, Bonds" },
  { name: "Middle East & Africa", countries: ["Israel", "South Africa", "UAE (via IBKR)", "Saudi Arabia (via IBKR)"], products: "Stocks, ETFs, Bonds, Forex" },
];

const PRODUCTS = [
  { p: "Stocks", americas: "✓", europe: "✓", asia: "✓", mea: "✓" },
  { p: "ETFs", americas: "✓", europe: "✓", asia: "✓", mea: "✓" },
  { p: "Options", americas: "✓", europe: "✓", asia: "Partial", mea: "—" },
  { p: "Futures", americas: "✓", europe: "✓", asia: "✓", mea: "—" },
  { p: "Forex (27 ccy)", americas: "✓", europe: "✓", asia: "✓", mea: "✓" },
  { p: "Bonds", americas: "✓", europe: "✓", asia: "✓", mea: "Partial" },
  { p: "Crypto", americas: "✓", europe: "✓", asia: "✓", mea: "Partial" },
  { p: "Precious Metals", americas: "✓", europe: "✓", asia: "✓", mea: "—" },
];

const FEATURES = [
  { icon: Globe2, title: "Single Unified Account", desc: "Trade 170+ markets across 33+ countries from a single login. No need for multiple international brokerage accounts." },
  { icon: DollarSign, title: "27-Currency Support", desc: "Hold, deposit, withdraw, and trade in 27 currencies. Convert at near-interbank rates with no hidden markup." },
  { icon: Clock, title: "Extended Hours Trading", desc: "Trade US stocks pre-market from 4:00am and after-hours until 8:00pm ET. Crypto trades 24/7/365." },
  { icon: BarChart2, title: "Global Market Data", desc: "Real-time quotes, news, and analytics from every major exchange — included with your account." },
  { icon: Landmark, title: "SIPC + International Protections", desc: "US accounts are SIPC-protected. Accounts held internationally benefit from local regulatory protections." },
  { icon: ArrowUpRight, title: "Global IPO Access", desc: "Participate in IPOs across the US, Hong Kong, Germany, and other major markets directly from your account." },
];

export default function GlobalAccess() {
  return (
    <MarketingPage
      eyebrow="Global Markets"
      title={<>Trade Anywhere.<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>In Any Market.</span></>}
      subtitle="Access 170+ market centres across 33 countries — stocks, options, futures, forex, bonds, and crypto — all from a single INT Brokers account. No international brokerage accounts required."
      heroImage={IMG}
      stats={[
        { value: "170+", label: "Market Centres" },
        { value: "33+", label: "Countries" },
        { value: "27", label: "Currencies" },
        { value: "4.4M+", label: "Global Clients" },
        { value: "24/7", label: "Crypto Trading" },
      ]}
      ctaTitle="Access Every Market on Earth"
      ctaText="Open one account and trade stocks in Tokyo, bonds in London, and crypto around the clock — all under one roof."
    >
      {/* Features */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>One Account. Every Market.</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 14 }}>True global access in a single platform</h2>
            <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>Most brokers restrict you to a handful of markets. INT Brokers was built from day one to give every investor access to every major market on the planet.</p>
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

      {/* Regions */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Market Coverage</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Four regions. 33+ countries. Every major exchange.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {REGIONS.map(r => (
              <div key={r.name} style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "16px 20px" }}>
                  <Globe2 size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.5} style={{ marginBottom: 6 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{r.name}</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{r.countries.length} countries</p>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {r.countries.slice(0, 6).map(c => (
                      <span key={c} style={{ fontSize: 11, background: "#F5F6F7", border: "1px solid #E6E8EB", borderRadius: 6, padding: "3px 8px", color: "#374151" }}>{c}</span>
                    ))}
                    {r.countries.length > 6 && <span style={{ fontSize: 11, color: "#9ca3af" }}>+{r.countries.length - 6} more</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "#6B7280" }}><strong>Products:</strong> {r.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip */}
      <div style={{ height: 360, backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.82)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,16,46,0.85)", marginBottom: 12 }}>Market Hours</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>Somewhere in the world, a market is always open.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>With global coverage spanning Asia, Europe, and the Americas, combined with 24/7 crypto trading, INT Brokers gives you access to opportunities whenever they arise.</p>
          </div>
        </div>
      </div>

      {/* Product availability table */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Product availability by region</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", padding: "14px 24px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
              {["Product", "Americas", "Europe", "Asia-Pacific", "ME & Africa"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.6)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {PRODUCTS.map((r, i) => (
              <div key={r.p} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "11px 24px", borderBottom: i < PRODUCTS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{r.p}</span>
                {[r.americas, r.europe, r.asia, r.mea].map((v, j) => (
                  <span key={j} style={{ fontSize: 13, color: v === "✓" ? "#16a34a" : v === "—" ? "#d1d5db" : "#f59e0b", fontWeight: 600 }}>{v}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
