import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { TrendingUp, Clock, Globe2, Zap, BarChart2, Layers } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&auto=format&fit=crop";

const CATEGORIES = [
  { name: "Equity Index Futures", examples: "E-mini S&P 500 (ES), Nasdaq-100 (NQ), Dow Jones (YM), Russell 2000 (RTY), Euro Stoxx 50, FTSE 100", margin: "From $500" },
  { name: "Energy Futures", examples: "Crude Oil (CL), Natural Gas (NG), Brent Crude (BZ), Gasoline (RB), Heating Oil (HO), WTI", margin: "From $1,500" },
  { name: "Metal Futures", examples: "Gold (GC), Silver (SI), Copper (HG), Platinum (PL), Palladium (PA)", margin: "From $1,000" },
  { name: "Agricultural Futures", examples: "Corn (ZC), Soybeans (ZS), Wheat (ZW), Sugar (SB), Coffee (KC), Cotton (CT), Cocoa (CC)", margin: "From $800" },
  { name: "Interest Rate Futures", examples: "US 10-Year Treasury (ZN), 30-Year Bond (ZB), 5-Year Note (ZF), Fed Funds (ZQ), Eurodollar", margin: "From $500" },
  { name: "Currency Futures", examples: "EUR/USD (6E), GBP/USD (6B), JPY/USD (6J), AUD/USD (6A), CAD/USD (6C), CHF/USD (6S)", margin: "From $1,200" },
];

const FEATURES = [
  { icon: TrendingUp, title: "$0.85 Per Contract", desc: "Industry-competitive futures commissions on all US and international futures contracts." },
  { icon: Clock, title: "Nearly 24-Hour Trading", desc: "Futures markets are open nearly 24 hours a day, 5 days a week — ideal for overnight and global event trading." },
  { icon: Globe2, title: "30+ Futures Exchanges", desc: "CME, CBOT, NYMEX, COMEX, Eurex, ICE, SGX, OSE, HKFE, and more — all from one account." },
  { icon: Zap, title: "Direct Market Access", desc: "Your orders go directly to exchange — no middlemen, no re-quotes, no dealing desk interference." },
  { icon: BarChart2, title: "Micro & Mini Contracts", desc: "Micro E-mini futures let you trade with 1/10th the standard contract size — from $50 notional." },
  { icon: Layers, title: "Full Portfolio Margin", desc: "Portfolio margin accounts can hold futures alongside stocks, options, and crypto in one risk-calculated account." },
];

export default function Futures() {
  return (
    <MarketingPage
      eyebrow="Futures Trading"
      title={<>Global Futures Markets,<br /><span style={{ color: "#fff" }}>One Account</span></>}
      subtitle="Trade equity index, energy, metal, agricultural, interest rate, and currency futures from a single INT Brokers account. $0.85 per contract, direct market access to 30+ futures exchanges globally."
      heroImage={IMG}
      heroImageAlt="Trading floor activity showing futures contracts being executed across global commodity and index markets"
      stats={[
        { value: "$0.85", label: "Per Contract" },
        { value: "30+", label: "Futures Exchanges" },
        { value: "24h", label: "Nearly 24-Hour Trading" },
        { value: "$50", label: "Min Micro Contract" },
      ]}
      breadcrumbs={[
        { name: "Products", item: "/products" },
        { name: "Futures", item: "/products/futures" },
      ]}
      relatedLinks={[
        { title: "Stocks & ETFs", href: "/products/stocks", desc: "Trade the equities underlying your equity index futures strategies." },
        { title: "Options Trading", href: "/products/options", desc: "Options on futures provide additional ways to manage risk." },
        { title: "Commission Schedule", href: "/pricing/commissions", desc: "Detailed futures commission rates for every exchange." },
        { title: "Global Access", href: "/why-vault/global-access", desc: "30+ futures exchanges across Americas, Europe, and Asia-Pacific." },
        { title: "Precious Metals", href: "/products/precious-metals", desc: "Trade gold, silver, and other metals via COMEX futures." },
        { title: "Margin Rates", href: "/pricing/margin-rates", desc: "Futures portfolio margin and intraday margin requirements." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Institutional futures access for every trader</h2>
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
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Product Coverage</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Six categories, hundreds of contracts</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {CATEGORIES.map(c => (
              <div key={c.name} style={{ border: "1px solid #E6E8EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "16px 20px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{c.name}</h3>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Min margin: {c.margin}</p>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7 }}>{c.examples}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip — semantic img */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        <img
          src={IMG}
          alt="Futures market data showing E-mini S&P 500 contracts with real-time price movement"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 14 }}>Trade the Micro E-mini S&P 500 for as little as $500 in margin.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 540, margin: "0 auto" }}>Micro contracts give you access to futures markets with a fraction of the capital — ideal for traders starting out with futures.</p>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
