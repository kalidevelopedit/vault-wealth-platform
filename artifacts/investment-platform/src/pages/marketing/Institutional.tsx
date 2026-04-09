import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Building2, Globe2, BarChart2, Shield, Code2, Users, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&auto=format&fit=crop";

const WHO = [
  { name: "Registered Investment Advisors (RIAs)", desc: "Multi-client management under a single advisor login. Allocate trades across client accounts and generate consolidated reporting." },
  { name: "Hedge Funds", desc: "Prime brokerage capabilities including securities lending, short selling, margin financing, and institutional-grade risk reporting." },
  { name: "Family Offices", desc: "Manage complex multi-generational wealth across multiple entities, trusts, and individuals from a single integrated platform." },
  { name: "Proprietary Trading Firms", desc: "Institutional connectivity via FIX API, co-location options, and access to all major electronic trading venues globally." },
  { name: "Fund Administrators", desc: "Third-party fund administration with full portfolio transparency, automated reporting, and customisable access controls." },
  { name: "Introducing Brokers", desc: "Build your brokerage business on INT Brokers' infrastructure. White-label options available. Global reach from day one." },
];

const FEATURES = [
  { icon: Globe2, title: "Global Prime Brokerage", desc: "Access prime brokerage services including securities lending, short selling, and cross-margining across 170+ markets." },
  { icon: BarChart2, title: "Consolidated Reporting", desc: "Multi-account reporting, consolidated P&L, risk analytics, and regulatory reporting — all automated." },
  { icon: Code2, title: "API & FIX Connectivity", desc: "Institutional-grade FIX 4.2 and FIX 4.4 connectivity, REST API, and WebSocket feeds for algorithmic strategies." },
  { icon: Shield, title: "$19.5B Equity Capital", desc: "Your institutional counterparty has one of the largest equity capital bases of any broker globally. Systemic strength." },
  { icon: Building2, title: "Dedicated Support", desc: "Dedicated institutional coverage teams with direct phone and email access — not a general support queue." },
  { icon: Users, title: "Sub-Account Management", desc: "Manage hundreds of sub-accounts under a master account. Allocate trades, permissions, and reporting independently." },
];

export default function Institutional() {
  return (
    <MarketingPage
      eyebrow="Institutional Solutions"
      title={<>Institutional-Grade<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Investment Solutions</span></>}
      subtitle="INT Brokers serves over 1,000 institutional clients globally — from RIAs and family offices to hedge funds and proprietary trading groups. Our platform scales from one client account to tens of thousands."
      heroImage={IMG}
      stats={[
        { value: "1,000+", label: "Institutional Clients" },
        { value: "$19.5B", label: "Equity Capital" },
        { value: "170+", label: "Global Markets" },
        { value: "FIX 4.4", label: "API Protocol" },
      ]}
      ctaTitle="Speak with Our Institutional Team"
      ctaText="Our dedicated institutional coverage team will help you evaluate INT Brokers for your firm's specific needs."
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Who we serve</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {WHO.map(w => (
              <div key={w.name} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{w.name}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Institutional capabilities</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
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
