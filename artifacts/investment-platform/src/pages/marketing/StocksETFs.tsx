import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { BarChart2, Globe2, Clock, DollarSign, TrendingUp, Layers, Check, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop";

const FEATURES = [
  { icon: DollarSign, title: "$0 Commission on US Stocks", desc: "Trade any US-listed stock or ETF commission-free, with no minimum and no payment for order flow." },
  { icon: Globe2, title: "170+ Global Markets", desc: "Access equities on the NYSE, NASDAQ, LSE, TSX, ASX, Euronext, Deutsche Boerse, HKEX, and 160+ more." },
  { icon: Clock, title: "Extended Hours Trading", desc: "Pre-market trading from 4:00am ET and after-hours until 8:00pm ET, 5 days a week." },
  { icon: Layers, title: "Fractional Shares from $1", desc: "Build a diversified portfolio with fractional shares in any S&P 500 stock or major ETF from as little as $1." },
  { icon: TrendingUp, title: "Professional Stock Screener", desc: "Filter 10,000+ stocks by fundamentals, technicals, ESG ratings, dividend yield, and 50+ more criteria." },
  { icon: BarChart2, title: "Advanced Charting", desc: "100+ technical indicators, pattern recognition, and multi-timeframe analysis directly in the platform." },
];

const MARKETS = [
  { region: "United States", exchanges: "NYSE · NASDAQ · AMEX · BATS · IEX", count: "5,800+" },
  { region: "United Kingdom", exchanges: "London Stock Exchange · AIM", count: "2,100+" },
  { region: "Europe", exchanges: "Euronext · Deutsche Boerse · SIX · Borsa Italiana · +10", count: "6,300+" },
  { region: "Asia-Pacific", exchanges: "HKEX · TSE · ASX · SGX · NSE · +8", count: "5,400+" },
  { region: "Canada", exchanges: "TSX · TSX Venture · NEO", count: "2,800+" },
  { region: "Emerging Markets", exchanges: "B3 · MXN · KSE · TWSE · +12", count: "3,200+" },
];

const ETFS = [
  { name: "Vanguard Total Stock Market ETF", ticker: "VTI", expense: "0.03%", assets: "$1.6T" },
  { name: "iShares Core S&P 500 ETF", ticker: "IVV", expense: "0.03%", assets: "$880B" },
  { name: "SPDR S&P 500 ETF Trust", ticker: "SPY", expense: "0.09%", assets: "$875B" },
  { name: "Invesco QQQ Trust", ticker: "QQQ", expense: "0.20%", assets: "$290B" },
  { name: "Vanguard FTSE Developed Markets ETF", ticker: "VEA", expense: "0.05%", assets: "$185B" },
  { name: "iShares Core MSCI Emerging Markets", ticker: "IEMG", expense: "0.09%", assets: "$88B" },
];

export default function StocksETFs() {
  return (
    <MarketingPage
      eyebrow="Stocks & ETFs"
      title={<>Access 170+ Global<br /><span style={{ color: "#fff" }}>Stock Markets</span></>}
      subtitle="Trade equities and ETFs across every major exchange worldwide — commission-free on US stocks, with fractional shares from $1 and pre/post-market access every trading day."
      heroImage={IMG}
      stats={[
        { value: "$0", label: "US Stock Commissions" },
        { value: "170+", label: "Market Centres" },
        { value: "25,000+", label: "Stocks & ETFs" },
        { value: "$1", label: "Min Fractional Trade" },
        { value: "4:00am", label: "Pre-Market Start" },
      ]}
      ctaTitle="Start Building Your Portfolio"
      ctaText="Commission-free US stocks, global market access, and fractional shares — all in one account."
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Why Choose INT Brokers for Stocks</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Everything you need to invest in global equities</h2>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Global Exchanges</p>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 16 }}>Trade on the world's most important exchanges</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8, marginBottom: 24 }}>INT Brokers has direct market access to 170+ exchanges. No middlemen, no routing delays — your order goes straight to the venue with the best price.</p>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0F172A", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", textDecoration: "none", borderRadius: 10 }}>
                Open Account <ArrowUpRight size={15} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MARKETS.map(m => (
                <div key={m.region} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", border: "1px solid #E6E8EB", borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{m.region}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>{m.exchanges}</p>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{m.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 340, backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Zero-Fee ETFs</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", marginBottom: 14 }}>Trade 500+ ETFs with zero commission</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 540, margin: "0 auto" }}>Including all major index ETFs from Vanguard, BlackRock iShares, State Street SPDR, and more — with no commission and no restrictions.</p>
          </div>
        </div>
      </div>

      <section style={{ background: "#F5F6F7", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Popular ETFs available on INT Brokers</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 800, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", padding: "12px 20px", gap: 8 }}>
              {["Fund Name", "Ticker", "Expense", "AUM"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
              ))}
            </div>
            {ETFS.map((e, i) => (
              <div key={e.ticker} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr", padding: "11px 20px", borderBottom: i < ETFS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{e.name}</span>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{e.ticker}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{e.expense}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{e.assets}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
