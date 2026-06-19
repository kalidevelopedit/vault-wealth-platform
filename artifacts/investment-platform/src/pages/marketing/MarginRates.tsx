import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { TrendingDown, Shield, BarChart2, AlertTriangle } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop";

const TIERS = [
  { balance: "$0 – $100,000", ibkr: "5.83%", competitor: "10.24%", savings: "44%" },
  { balance: "$100,001 – $1,000,000", ibkr: "4.83%", competitor: "9.15%", savings: "47%" },
  { balance: "$1,000,001 – $3,000,000", ibkr: "4.33%", competitor: "8.64%", savings: "50%" },
  { balance: "$3,000,001 – $50,000,000", ibkr: "4.14%", competitor: "8.25%", savings: "50%" },
  { balance: "$50,000,001 – $200,000,000", ibkr: "3.83%", competitor: "Contact", savings: "—" },
  { balance: "$200,000,001+", ibkr: "Negotiable", competitor: "Contact", savings: "—" },
];

const FACTS = [
  { icon: TrendingDown, title: "Up to 55% Below Average", desc: "INT Brokers margin rates are consistently 40–55% lower than the industry average across all balance tiers." },
  { icon: BarChart2, title: "No Minimums to Access Margin", desc: "Margin accounts require a minimum of $2,000 to open — after that, no minimum balance to maintain margin access." },
  { icon: Shield, title: "Real-Time Risk Controls", desc: "Automated margin monitoring protects both you and INT Brokers. Positions are liquidated only when necessary — never prematurely." },
  { icon: AlertTriangle, title: "Understand the Risks", desc: "Margin amplifies gains and losses. Interest accrues daily. Only use margin if you understand how it works and can absorb potential losses." },
];

export default function MarginRates() {
  return (
    <MarketingPage
      eyebrow="Margin Rates"
      title={<>The Industry's Lowest<br /><span style={{ color: "#fff" }}>Margin Rates</span></>}
      subtitle="Borrow against your securities at rates up to 55% lower than the industry average — starting from 4.14% on balances above $3M. Interest accrues daily and is charged monthly."
      heroImage={IMG}
      heroImageAlt="Financial market data screen showing borrowing rates and margin rate comparisons"
      stats={[
        { value: "4.14%", label: "Blended Rate ($3M+)" },
        { value: "55%", label: "Below Industry Average" },
        { value: "Daily", label: "Interest Accrual" },
        { value: "$2,000", label: "Min Margin Account" },
      ]}
      breadcrumbs={[
        { name: "Pricing", item: "/pricing" },
        { name: "Margin Rates", item: "/pricing/margin-rates" },
      ]}
      relatedLinks={[
        { title: "Pricing Overview", href: "/pricing", desc: "All rates — commissions, margin, and cash yield — at a glance." },
        { title: "Commission Schedule", href: "/pricing/commissions", desc: "Detailed commissions for every asset class and market." },
        { title: "Interest on Cash", href: "/pricing/interest-on-cash", desc: "Earn up to 3.14% APY on uninvested cash balances." },
        { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "No platform fees, no inactivity fees, no transfer-in fees." },
        { title: "Lower Costs", href: "/why-vault/lower-costs", desc: "How our cost structure compares to every major competitor." },
        { title: "Options Trading", href: "/products/options", desc: "Use portfolio margin to hold options alongside your other positions." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Tiered Rates</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Margin rates by balance tier (USD)</h2>
            <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.8 }}>The more you borrow, the lower your rate. INT Brokers rates are blended across tiers.</p>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 760, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "13px 24px" }}>
              {["Balance Tier", "INT Brokers", "Industry Avg", "Your Savings"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : i === 1 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)" }}>{h}</span>
              ))}
            </div>
            {TIERS.map((r, i) => (
              <div key={r.balance} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "13px 24px", borderBottom: i < TIERS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.balance}</span>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 800 }}>{r.ibkr}</span>
                <span style={{ fontSize: 13, color: "#9ca3af", textDecoration: "line-through" }}>{r.competitor}</span>
                <span style={{ fontSize: 13, color: r.savings !== "—" ? "#16a34a" : "#9ca3af", fontWeight: 600 }}>{r.savings}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Key facts about margin at INT Brokers</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FACTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <Icon size={22} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
