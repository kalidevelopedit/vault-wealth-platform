import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { FileText, ExternalLink } from "lucide-react";
import { JsonLd, pressReleasesSchema } from "@/components/seo/JsonLd";

const IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&auto=format&fit=crop";

const RELEASES = [
  { date: "March 28, 2026", headline: "INT Brokers Reports Record Q1 2026 Client Accounts: 4.4 Million Globally", category: "Earnings" },
  { date: "February 14, 2026", headline: "INT Brokers Ranked #1 Online Broker by StockBrokers.com, NerdWallet, and Investopedia Simultaneously", category: "Awards" },
  { date: "January 22, 2026", headline: "INT Brokers Expands Crypto Offering to 60+ Cryptocurrencies, Including Solana Staking", category: "Product" },
  { date: "December 10, 2025", headline: "INT Brokers Launches Enhanced Biometric KYC for Faster Account Onboarding", category: "Product" },
  { date: "November 8, 2025", headline: "INT Brokers Equity Capital Reaches Record $19.5 Billion, Providing Industry-Leading Stability", category: "Financial" },
  { date: "October 3, 2025", headline: "INT Brokers Opens Office in Dubai, Expands Middle East Client Services", category: "Expansion" },
  { date: "September 15, 2025", headline: "INT Brokers Announces Integration with Major Tax Preparation Platforms for Seamless 1099 Imports", category: "Product" },
  { date: "August 1, 2025", headline: "INT Brokers Achieves ISO 27001 Certification for Information Security Management", category: "Security" },
];

const COVERAGE = [
  { pub: "Financial Times", headline: "Interactive Brokers widens lead as the platform of choice for sophisticated retail investors", date: "March 2026" },
  { pub: "Wall Street Journal", headline: "How the Discount Broker Built for Computers Is Now Winning the Battle for Active Traders", date: "January 2026" },
  { pub: "Bloomberg", headline: "Interactive Brokers eclipses Schwab and Fidelity in active trader market share for first time", date: "November 2025" },
  { pub: "CNBC", headline: "Peterffy's Interactive Brokers: 50 years of disrupting Wall Street's status quo", date: "October 2025" },
];

export default function Press() {
  return (
    <MarketingPage
      eyebrow="Media & Press"
      title={<>INT Brokers<br /><span style={{ color: "#fff" }}>Press Centre</span></>}
      subtitle="News, announcements, and media resources for journalists, analysts, and partners. For urgent press inquiries, contact our media relations team at press@intbrokers.com."
      heroImage={IMG}
      heroImageAlt="Financial data screens in a modern newsroom — representing INT Brokers press and media coverage"
      stats={[
        { value: "4.4M+", label: "Client Accounts" },
        { value: "$19.5B", label: "Equity Capital" },
        { value: "$2.4T+", label: "Assets Under Custody" },
        { value: "50+", label: "Years in Business" },
      ]}
      relatedLinks={[
        { title: "About INT Brokers", href: "/about", desc: "Our history, leadership team, and company values since 1977." },
        { title: "Security & Trust", href: "/security", desc: "SIPC, FDIC, SEC-registered — how we protect client assets." },
        { title: "Careers", href: "/careers", desc: "Join the team behind the world's top-rated brokerage." },
        { title: "Why Vault", href: "/why-vault", desc: "Four pillars that make INT Brokers the industry benchmark." },
        { title: "Industry Awards", href: "/why-vault/awards", desc: "Every award earned across six consecutive years at #1." },
        { title: "Global Access", href: "/why-vault/global-access", desc: "Our 170+ market footprint — the story behind the reach." },
      ]}
    >
      <JsonLd data={pressReleasesSchema(RELEASES)} />

      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Press Releases</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Recent announcements</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {RELEASES.map(r => (
              <div key={r.headline} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <FileText size={18} color="#374151" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "#F5F6F7", border: "1px solid #E6E8EB", padding: "2px 8px", borderRadius: 6, color: "#6B7280" }}>{r.category}</span>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.date}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", lineHeight: 1.5 }}>{r.headline}</h3>
                  </div>
                </div>
                <ExternalLink size={16} color="#9ca3af" strokeWidth={1.5} style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Recent media coverage</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
            {COVERAGE.map(c => (
              <div key={c.headline} style={{ border: "1px solid #E6E8EB", borderRadius: 14, padding: "24px" }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{c.pub}</p>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#374151", lineHeight: 1.55, marginBottom: 10 }}>"{c.headline}"</h3>
                <p style={{ fontSize: 12, color: "#9ca3af" }}>{c.date}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: "32px", border: "1px solid #E6E8EB", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Press Contact</h3>
              <p style={{ fontSize: 14, color: "#6B7280" }}>For media inquiries, interview requests, or embargo access:</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginTop: 6 }}>press@intbrokers.com · +1 (203) 618-5800</p>
            </div>
            <a href="mailto:press@intbrokers.com" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, background: "#0F172A", color: "#fff", fontWeight: 700, fontSize: 13, padding: "12px 24px", textDecoration: "none", borderRadius: 10 }}>
              Contact Press Team
            </a>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
