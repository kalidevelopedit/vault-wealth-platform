import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { RefreshCw, Shield, TrendingUp, DollarSign, Clock, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400&auto=format&fit=crop";

const STEPS = [
  { num: 1, title: "Open your INT Brokers IRA", desc: "Choose a Traditional or Roth IRA — matching the type of your existing 401(k) or retirement plan." },
  { num: 2, title: "Request a distribution from your plan", desc: "Contact your current plan administrator. Request a 'direct rollover' — funds go from plan to INT Brokers directly without tax withholding." },
  { num: 3, title: "Funds arrive at INT Brokers", desc: "Your retirement savings land in your new IRA, typically within 3–7 business days of the transfer request." },
  { num: 4, title: "Invest your rolled-over assets", desc: "Once funds clear, invest in stocks, ETFs, bonds, crypto, or any other security available on our platform." },
];

const BENEFITS = [
  { icon: TrendingUp, title: "More Investment Choices", desc: "401(k) plans typically offer 10–30 funds. An IRA at INT Brokers gives you access to 25,000+ securities globally." },
  { icon: DollarSign, title: "Potentially Lower Fees", desc: "Many employer plans charge high expense ratios. At INT Brokers, you invest commission-free in low-cost index ETFs." },
  { icon: Shield, title: "Keep Your Tax Advantages", desc: "A direct rollover has no tax consequences. Your savings continue growing tax-deferred (or tax-free in a Roth)." },
  { icon: RefreshCw, title: "Consolidate Accounts", desc: "Roll multiple old 401(k)s and IRAs into one account for simplified management and reporting." },
  { icon: Clock, title: "No Deadlines to Panic About", desc: "With a direct rollover, there's no 60-day limit. Funds flow directly from institution to institution." },
  { icon: Check, title: "No Limit on Rollover Amount", desc: "You can roll over the full balance of your 401(k) or IRA with no annual limit or cap." },
];

export default function Rollover401k() {
  return (
    <MarketingPage
      eyebrow="401(k) Rollover"
      title={<>Roll Over Your 401(k) —<br /><span style={{ color: "#fff" }}>Keep Your Savings Working</span></>}
      subtitle="Left a job and have an old 401(k) sitting idle? Rolling it over to an INT Brokers IRA is quick, tax-free, and gives you more investment choices, lower fees, and better tools."
      heroImage={IMG}
      stats={[
        { value: "0%", label: "Tax on Direct Rollover" },
        { value: "$0", label: "Rollover Fee" },
        { value: "3–7 Days", label: "Transfer Time" },
        { value: "25,000+", label: "Investments Available" },
      ]}
      heroImageAlt="Retirement account rollover transfer documents and investment planning tools"
      breadcrumbs={[
        { name: "Accounts", item: "/accounts/individual" },
        { name: "401(k) Rollover", item: "/accounts/401k" },
      ]}
      relatedLinks={[
        { title: "IRA", href: "/accounts/ira", desc: "Traditional and Roth IRAs with no annual fees." },
        { title: "SEP-IRA", href: "/accounts/sep-ira", desc: "High-limit retirement for self-employed professionals." },
        { title: "Retirement Planning", href: "/retirement", desc: "Retirement-focused tools and dedicated advisor support." },
        { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "Zero account fees, no inactivity charges — ever." },
        { title: "Security", href: "/security", desc: "SIPC + FDIC protection and institutional account security." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>How It Works</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Four simple steps to roll over your 401(k)</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {STEPS.map(s => (
              <div key={s.num} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #0F172A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Why roll over to INT Brokers?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
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
