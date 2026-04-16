import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Briefcase, DollarSign, TrendingUp, Shield, Check, Users } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&auto=format&fit=crop";

const FEATURES = [
  { icon: DollarSign, title: "Contribute Up to $69,000", desc: "For 2024, self-employed individuals can contribute up to 25% of net self-employment income, up to $69,000." },
  { icon: TrendingUp, title: "Fully Tax-Deductible", desc: "All SEP-IRA contributions are fully deductible from your business income, reducing your tax liability dollar for dollar." },
  { icon: Briefcase, title: "Simple to Set Up", desc: "No complex filings or annual reports. Complete IRS Form 5305-SEP — it takes under 10 minutes to establish." },
  { icon: Shield, title: "Flexible Contributions", desc: "Contribute only in profitable years. There's no requirement to contribute each year, making it perfect for variable income." },
  { icon: Users, title: "Employees Included", desc: "If you have employees, you must contribute the same percentage for eligible employees as you do for yourself." },
  { icon: Check, title: "Same Investment Access", desc: "Invest your SEP-IRA in the same global securities as any INT Brokers account — stocks, ETFs, bonds, options, crypto." },
];

const LIMITS = [
  { year: "2024", limit: "$69,000", pct: "25%", deadline: "Tax filing deadline + extensions" },
  { year: "2023", limit: "$66,000", pct: "25%", deadline: "Tax filing deadline + extensions" },
  { year: "2022", limit: "$61,000", pct: "25%", deadline: "Tax filing deadline + extensions" },
  { year: "2021", limit: "$58,000", pct: "25%", deadline: "Tax filing deadline + extensions" },
];

export default function SEPIRA() {
  return (
    <MarketingPage
      eyebrow="Self-Employed Retirement"
      title={<>Maximum Savings for<br /><span style={{ color: "#fff" }}>Self-Employed Professionals</span></>}
      subtitle="The SEP-IRA is the most powerful retirement account for freelancers, consultants, and small business owners. Contribute up to $69,000 annually — fully tax-deductible — with zero annual fees at INT Brokers."
      heroImage={IMG}
      stats={[
        { value: "$69,000", label: "2024 Max Contribution" },
        { value: "25%", label: "Of Net Self-Employment Income" },
        { value: "100%", label: "Tax Deductible" },
        { value: "$0", label: "Annual Account Fees" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Why choose a SEP-IRA?</h2>
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
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Historical SEP-IRA contribution limits</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "13px 20px" }}>
              {["Year", "Max Contribution", "Max %", "Contribution Deadline"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
              ))}
            </div>
            {LIMITS.map((r, i) => (
              <div key={r.year} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", padding: "12px 20px", borderBottom: i < LIMITS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{r.year}</span>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{r.limit}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.pct}</span>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{r.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
