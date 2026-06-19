import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Landmark, DollarSign, TrendingUp, Shield, Clock, BarChart2, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1400&auto=format&fit=crop";

const COMPARE = [
  { feature: "2024 Contribution Limit", traditional: "$7,000 / $8,000 (50+)", roth: "$7,000 / $8,000 (50+)" },
  { feature: "Income Limit (2024)", traditional: "None (but deductibility may phase out)", roth: "$161K single / $240K married" },
  { feature: "Tax on Contributions", traditional: "Pre-tax (deductible)", roth: "After-tax (non-deductible)" },
  { feature: "Tax on Growth", traditional: "Tax-deferred", roth: "Tax-free" },
  { feature: "Tax on Withdrawals", traditional: "Taxed as income", roth: "Tax-free after 59½" },
  { feature: "Required Min Distributions", traditional: "Yes — starting at age 73", roth: "No — none ever" },
  { feature: "Early Withdrawal Penalty", traditional: "10% before 59½", roth: "10% on earnings (not contributions)" },
  { feature: "Rollover from 401(k)", traditional: "✓ Yes", roth: "✓ Yes (taxable event)" },
];

const FEATURES = [
  { icon: TrendingUp, title: "Tax-Advantaged Growth", desc: "Earnings in an IRA or Roth IRA compound tax-deferred (Traditional) or completely tax-free (Roth)." },
  { icon: Landmark, title: "Wide Investment Choice", desc: "Invest your IRA funds in stocks, ETFs, options, bonds, crypto, and more — the same access as a standard account." },
  { icon: DollarSign, title: "Rollover from 401(k) or Other IRA", desc: "Transfer your existing retirement savings to INT Brokers with no taxes or penalties when done correctly." },
  { icon: Shield, title: "SIPC Protected", desc: "Your IRA assets are held in custody and SIPC-protected up to $500,000." },
  { icon: Clock, title: "No Annual Fees", desc: "Unlike many retirement platforms, INT Brokers charges no annual IRA fees and no inactivity charges." },
  { icon: BarChart2, title: "PortfolioAnalyst", desc: "Track your retirement portfolio performance versus benchmarks with our free PortfolioAnalyst reporting tool." },
];

export default function IRA() {
  return (
    <MarketingPage
      eyebrow="Retirement Accounts"
      title={<>Grow Your Retirement<br /><span style={{ color: "#fff" }}>Tax-Advantaged</span></>}
      subtitle="Traditional IRAs and Roth IRAs offer powerful tax advantages for long-term retirement savings. INT Brokers offers both — with the widest investment choice, no annual fees, and 401(k) rollover support."
      heroImage={IMG}
      stats={[
        { value: "$7,000", label: "2024 Contribution Limit" },
        { value: "$8,000", label: "Limit If Age 50+" },
        { value: "$0", label: "Annual Fees" },
        { value: "Tax-Free", label: "Roth IRA Growth" },
      ]}
      heroImageAlt="Retirement planning with IRA investment documents and financial growth charts"
      breadcrumbs={[
        { name: "Accounts", item: "/accounts/individual" },
        { name: "IRA", item: "/accounts/ira" },
      ]}
      relatedLinks={[
        { title: "SEP-IRA", href: "/accounts/sep-ira", desc: "High-limit retirement account for self-employed professionals." },
        { title: "401(k) Rollover", href: "/accounts/401k", desc: "Transfer your old 401(k) to INT Brokers — tax-free." },
        { title: "Individual Account", href: "/accounts/individual", desc: "Full-featured brokerage account with no minimum balance." },
        { title: "Retirement Planning", href: "/retirement", desc: "Retirement-focused tools, resources, and account types." },
        { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "Zero account fees, no inactivity charges — ever." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Why save for retirement with INT Brokers?</h2>
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
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Side-by-Side Comparison</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Traditional IRA vs Roth IRA</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 760, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", padding: "14px 24px" }}>
              {["Feature", "Traditional IRA", "Roth IRA"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
              ))}
            </div>
            {COMPARE.map((r, i) => (
              <div key={r.feature} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", padding: "13px 24px", borderBottom: i < COMPARE.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff", alignItems: "start" }}>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{r.feature}</span>
                <span style={{ fontSize: 12.5, color: "#0F172A" }}>{r.traditional}</span>
                <span style={{ fontSize: 12.5, color: "#0F172A" }}>{r.roth}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
