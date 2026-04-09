import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Bitcoin, Shield, Clock, Globe2, Check, TrendingUp } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop";

const SPREADS = [
  { coin: "Bitcoin", ticker: "BTC", spread: "0.12%", volume: "$8.4B/day", custody: "Cold Storage" },
  { coin: "Ethereum", ticker: "ETH", spread: "0.12%", volume: "$4.1B/day", custody: "Cold Storage" },
  { coin: "Solana", ticker: "SOL", spread: "0.15%", volume: "$1.2B/day", custody: "Cold Storage" },
  { coin: "Ripple", ticker: "XRP", spread: "0.15%", volume: "$980M/day", custody: "Cold Storage" },
  { coin: "Cardano", ticker: "ADA", spread: "0.15%", volume: "$420M/day", custody: "Cold Storage" },
  { coin: "Avalanche", ticker: "AVAX", spread: "0.18%", volume: "$280M/day", custody: "Cold Storage" },
  { coin: "Chainlink", ticker: "LINK", spread: "0.18%", volume: "$220M/day", custody: "Cold Storage" },
  { coin: "Polkadot", ticker: "DOT", spread: "0.18%", volume: "$195M/day", custody: "Cold Storage" },
];

const FEATURES = [
  { icon: Bitcoin, title: "60+ Cryptocurrencies", desc: "Trade Bitcoin, Ethereum, Solana, and 57+ more cryptocurrencies — all from your main INT Brokers account." },
  { icon: Shield, title: "Institutional-Grade Custody", desc: "All crypto assets are held in cold storage with multi-signature security, insured against theft and hack." },
  { icon: Clock, title: "24/7/365 Trading", desc: "Unlike stocks, crypto markets never close. Trade at 3am on a Sunday if you want to — we're always available." },
  { icon: TrendingUp, title: "Crypto Staking Up to 8%", desc: "Earn staking rewards on eligible coins — up to 8% APY on Ethereum and 6% on Solana, paid weekly." },
  { icon: Globe2, title: "No Wallet Required", desc: "Invest in crypto without managing private keys or wallets. Your holdings are secured and managed for you." },
  { icon: Check, title: "Integrated Portfolio Reporting", desc: "Your crypto holdings appear alongside stocks, ETFs, and bonds in the same portfolio view and tax documents." },
];

export default function CryptoSpreads() {
  return (
    <MarketingPage
      eyebrow="Crypto Pricing"
      title={<>Transparent Crypto<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pricing</span></>}
      subtitle="INT Brokers charges 0.12–0.18% on the notional value of each crypto trade — with no hidden spread markups, no maker/taker complexity, and cold storage custody included."
      heroImage={IMG}
      stats={[
        { value: "0.12%", label: "Min Spread (BTC/ETH)" },
        { value: "60+", label: "Cryptocurrencies" },
        { value: "24/7", label: "Trading" },
        { value: "$0", label: "Wallet Required" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Institutional-grade crypto at retail simplicity</h2>
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
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Crypto spread schedule</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "13px 24px" }}>
              {["Cryptocurrency", "Ticker", "Spread", "24h Volume", "Custody"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {SPREADS.map((r, i) => (
              <div key={r.ticker} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 24px", borderBottom: i < SPREADS.length - 1 ? "1px solid #F5F6F7" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{r.coin}</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{r.ticker}</span>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 800 }}>{r.spread}</span>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{r.volume}</span>
                <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 500 }}>{r.custody}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
