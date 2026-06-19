import { MarketingPage, INNER, DOTL } from "@/components/marketing/MarketingPage";
import { Building2, Globe2, Users, TrendingUp, Award, Shield } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop";

const TIMELINE = [
  { year: "1977", event: "Thomas Peterffy founds Timber Hill Group, pioneering the use of computers in market-making on the American Stock Exchange." },
  { year: "1993", event: "Interactive Brokers launched as a retail brokerage, bringing institutional-grade technology to individual investors for the first time." },
  { year: "2001", event: "Introduction of the Universal Account — one integrated account for stocks, options, futures, forex, and bonds worldwide." },
  { year: "2007", event: "Interactive Brokers lists on NASDAQ (IBKR). Client assets exceed $25 billion." },
  { year: "2014", event: "Platform rated #1 by Barron's for the 14th consecutive year. Global client base reaches 300,000 accounts." },
  { year: "2020", event: "Client accounts pass 1 million. Zero-commission trading launched for US stocks and ETFs." },
  { year: "2023", event: "Client accounts exceed 4.4 million. Assets under custody surpass $420 billion. Equity capital at $19.5 billion." },
  { year: "2026", event: "Ranked #1 online broker by StockBrokers.com, NerdWallet, Investopedia, Forbes Advisor, and BrokerChooser simultaneously." },
];

const VALUES = [
  { icon: Shield, title: "Integrity First", desc: "We operate with complete transparency. No payment for order flow. No hidden fees. No conflicts of interest with our clients." },
  { icon: TrendingUp, title: "Innovation Never Stops", desc: "Since 1977, we have led the industry in technology — from the first electronic order systems to AI-powered risk management." },
  { icon: Globe2, title: "Global by Design", desc: "We built global market access from day one — not as an afterthought. Today, clients in 200+ countries invest through INT Brokers." },
  { icon: Users, title: "Clients Come First", desc: "Our business model is built on client activity — not fee extraction. When our clients succeed, INT Brokers succeeds." },
];

const LEADERSHIP = [
  { name: "Thomas Peterffy", role: "Founder & Chairman", desc: "Hungarian-born self-made billionaire. Pioneered electronic trading starting in 1977. Forbes ranks him among America's richest. Still involved in the firm's technology strategy." },
  { name: "Milan Galik", role: "Chief Executive Officer", desc: "30-year veteran of Interactive Brokers. Previously served as President. Oversees global operations, technology, and regulatory affairs." },
  { name: "Paul J. Brody", role: "Chief Financial Officer", desc: "Joined Interactive Brokers in 1987. Oversees all financial reporting, treasury, and balance sheet management. CPA, former Deloitte & Touche." },
];

export default function About() {
  return (
    <MarketingPage
      eyebrow="Our Story"
      title={<>Built for Investors<br /><span style={{ color: "#fff" }}>Since 1977</span></>}
      subtitle="INT Brokers (Vault Wealth Management LLC) is a registered broker-dealer with over 50 years of innovation, $19.5 billion in equity capital, and 4.4 million clients in 200+ countries. We exist to give every investor access to the best tools and lowest costs on the planet."
      heroImage={IMG}
      heroImageAlt="Modern corporate headquarters of INT Brokers — a global financial services firm"
      stats={[
        { value: "50+", label: "Years of Innovation" },
        { value: "4.4M+", label: "Client Accounts" },
        { value: "$2.4T+", label: "Assets Under Custody" },
        { value: "$19.5B", label: "Equity Capital" },
        { value: "200+", label: "Countries Served" },
      ]}
      ctaTitle="Join the INT Brokers Community"
      ctaText="4.4 million investors worldwide have chosen INT Brokers for lower costs, global access, and institutional-grade tools."
      relatedLinks={[
        { title: "Security & Trust", href: "/security", desc: "SIPC-protected, FDIC-insured, 256-bit encryption, and six layers of institutional security." },
        { title: "Press Centre", href: "/press", desc: "Latest news, announcements, and media resources from INT Brokers." },
        { title: "Careers", href: "/careers", desc: "Join our team and help shape the future of investing." },
        { title: "Why Vault", href: "/why-vault", desc: "Four reasons investors choose INT Brokers over every competitor." },
        { title: "Industry Awards", href: "/why-vault/awards", desc: "Ranked #1 by StockBrokers.com, NerdWallet, Investopedia, and more." },
        { title: "Lower Costs", href: "/why-vault/lower-costs", desc: "Commission schedules, margin rates, and our fee-free promise." },
      ]}
    >
      {/* Values */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Our Values</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>What guides every decision we make</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <Icon size={22} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip — semantic img */}
      <div style={{ height: 340, position: "relative", overflow: "hidden" }}>
        <img
          src={IMG}
          alt="INT Brokers headquarters — a landmark of global financial innovation since 1977"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Our Mission</p>
            <h2 style={{ fontSize: "clamp(22px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, maxWidth: 680, margin: "0 auto" }}>"Create technology to provide liquidity on better terms. Compete on price and innovation, not on marketing."</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 16 }}>— Thomas Peterffy, Founder</p>
          </div>
        </div>
      </div>

      {/* History timeline */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER, maxWidth: 780 }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Our History</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>50 years of industry firsts</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {TIMELINE.map((h, i) => (
              <div key={h.year} style={{ display: "flex", gap: 24, paddingBottom: i < TIMELINE.length - 1 ? 28 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1.5px solid #0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#0F172A" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{h.year.slice(2)}</span>
                  </div>
                  {i < TIMELINE.length - 1 && <div style={{ width: 1, flex: 1, background: "#E6E8EB", marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 8, paddingBottom: i < TIMELINE.length - 1 ? 4 : 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>{h.year}</p>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Leadership</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Experienced, principled leadership</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
            {LEADERSHIP.map(l => (
              <div key={l.name} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{l.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{l.name}</h3>
                <p style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{l.role}</p>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
