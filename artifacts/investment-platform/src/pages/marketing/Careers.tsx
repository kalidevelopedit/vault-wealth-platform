import { MarketingPage, INNER, DOTL } from "@/components/marketing/MarketingPage";
import { Code2, BarChart2, Shield, Globe2, Users, Building2 } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&auto=format&fit=crop";

const DEPTS = [
  { icon: Code2, name: "Software Engineering", count: 12, desc: "Build the trading systems that process millions of orders daily. Work on real-time data pipelines, execution engines, and client platforms." },
  { icon: BarChart2, name: "Quantitative Research", count: 5, desc: "Develop statistical models for market making, risk management, and portfolio analytics. Strong Python and C++ skills required." },
  { icon: Shield, name: "Compliance & Legal", count: 3, desc: "Navigate complex regulatory environments across 33+ countries. Support our global expansion with legal expertise." },
  { icon: Globe2, name: "International Markets", count: 4, desc: "Manage relationships with exchanges, clearing firms, and regulators in emerging markets. Extensive travel required." },
  { icon: Users, name: "Client Services", count: 8, desc: "Support 4.4 million clients across the globe. Specialised roles in institutional client management, onboarding, and technical support." },
  { icon: Building2, name: "Finance & Treasury", count: 3, desc: "Manage our $19.5B equity capital base, treasury operations, and global financial reporting across 28 countries." },
];

const BENEFITS = [
  "Competitive salary + annual bonus", "Comprehensive health, dental & vision",
  "401(k) with employer match", "Employee stock purchase plan",
  "Remote work flexibility", "Continuing education allowance ($5,000/yr)",
  "Professional certification support", "20 days PTO + holidays",
  "Parental leave (16 weeks)", "Global transfer opportunities",
];

export default function Careers() {
  return (
    <MarketingPage
      eyebrow="Join Our Team"
      title={<>Build the Future<br /><span style={{ color: "#fff" }}>of Investing</span></>}
      subtitle="INT Brokers is one of the world's most technologically advanced financial firms. We employ 3,000+ professionals across 28 countries, united by a mission to give every investor access to the best tools and lowest costs on the planet."
      heroImage={IMG}
      stats={[
        { value: "3,000+", label: "Employees Worldwide" },
        { value: "28", label: "Countries" },
        { value: "4.7/5", label: "Glassdoor Rating" },
        { value: "35+", label: "Open Positions" },
      ]}
      ctaTitle="See All Open Positions"
      ctaText="We're hiring engineers, quants, compliance professionals, and client-facing talent across all major offices."
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Open Roles</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>We're hiring across six departments</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {DEPTS.map(({ icon: Icon, name, count, desc }) => (
              <div key={name} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <Icon size={22} color="#374151" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, fontWeight: 700, background: "#F5F6F7", border: "1px solid #E6E8EB", padding: "3px 10px", borderRadius: 99, color: "#6B7280" }}>{count} openings</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{name}</h3>
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
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Benefits & Perks</p>
              <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 20 }}>We invest in our people</h2>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>INT Brokers is a meritocracy. We hire the best talent, give them responsibility, and reward performance. Our benefits reflect the long-term relationships we want to build with every team member.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {BENEFITS.map(b => (
                <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", border: "1px solid #E6E8EB", borderRadius: 10 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#374151", flexShrink: 0, marginTop: 7 }} />
                  <span style={{ fontSize: 12.5, color: "#374151" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
