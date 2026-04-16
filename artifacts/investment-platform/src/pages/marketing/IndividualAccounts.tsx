import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { User, DollarSign, Globe2, Shield, BarChart2, Zap, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop";

const FEATURES = [
  { icon: DollarSign, title: "No Minimum Balance", desc: "Open a cash or margin account with $0. Start investing in stocks, ETFs, options, and more with any amount." },
  { icon: Globe2, title: "170+ Global Markets", desc: "Trade stocks, ETFs, options, futures, forex, bonds, and crypto worldwide from your individual account." },
  { icon: Shield, title: "SIPC Protection", desc: "Securities in your account are protected up to $500,000 (including $250K for cash) under SIPC." },
  { icon: BarChart2, title: "Margin Available", desc: "Upgrade to a margin account to leverage positions, sell short, and trade more advanced strategies." },
  { icon: Zap, title: "Instant Funding", desc: "ACH transfers and wire transfers accepted. Start trading with provisionally credited funds in minutes." },
  { icon: User, title: "Full Account Control", desc: "Full account statements, tax documents, customisable alerts, and watchlists — all in one dashboard." },
];

const COMPARE = [
  { feature: "Minimum Balance", cash: "$0", margin: "$2,000" },
  { feature: "Trading Stocks & ETFs", cash: "✓", margin: "✓" },
  { feature: "Trading Options", cash: "Level 1–2", margin: "Level 1–4" },
  { feature: "Short Selling", cash: "✗", margin: "✓" },
  { feature: "Margin Borrowing", cash: "✗", margin: "✓" },
  { feature: "Crypto Trading", cash: "✓", margin: "✓" },
  { feature: "Futures Trading", cash: "✗", margin: "✓" },
  { feature: "Forex Trading", cash: "✓", margin: "✓" },
];

export default function IndividualAccounts() {
  return (
    <MarketingPage
      eyebrow="Individual Accounts"
      title={<>Your Personal<br /><span style={{ color: "#fff" }}>Investment Account</span></>}
      subtitle="Individual brokerage accounts with no minimum balance, no platform fees, and access to 170+ global markets. Choose between a cash account or a full-featured margin account."
      heroImage={IMG}
      stats={[
        { value: "$0", label: "Minimum Balance" },
        { value: "$0", label: "Account Fees" },
        { value: "170+", label: "Markets" },
        { value: "SIPC", label: "Protected" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Everything you need in one account</h2>
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
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Cash account vs margin account</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "14px 20px" }}>
              {["Feature", "Cash Account", "Margin Account"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
              ))}
            </div>
            {COMPARE.map((r, i) => (
              <div key={r.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "12px 20px", borderBottom: i < COMPARE.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.feature}</span>
                <span style={{ fontSize: 13, color: r.cash === "✗" ? "#d1d5db" : "#16a34a", fontWeight: r.cash.length < 4 ? 700 : 400 }}>{r.cash}</span>
                <span style={{ fontSize: 13, color: r.margin === "✗" ? "#d1d5db" : "#16a34a", fontWeight: r.margin.length < 4 ? 700 : 400 }}>{r.margin}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
