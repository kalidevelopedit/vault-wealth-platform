import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { Star, Trophy, Award, TrendingUp, BarChart2 } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop";

const AWARDS = [
  { rank: "#1", category: "Professional Trading", source: "StockBrokers.com", year: "2026" },
  { rank: "#1", category: "International Trading", source: "StockBrokers.com", year: "2026" },
  { rank: "#1", category: "Options Trading", source: "StockBrokers.com", year: "2026" },
  { rank: "#1", category: "Futures Trading", source: "StockBrokers.com", year: "2026" },
  { rank: "#1", category: "Margin Rates", source: "StockBrokers.com", year: "2026" },
  { rank: "Best", category: "Online Broker for Advanced Traders", source: "NerdWallet", year: "2026" },
  { rank: "Best", category: "For Advanced Investors", source: "Investopedia", year: "2026" },
  { rank: "Best", category: "Online Broker Overall", source: "BrokerChooser", year: "2026" },
  { rank: "Best", category: "Broker for International Trading", source: "Forbes Advisor", year: "2025" },
  { rank: "Best", category: "for Frequent Traders", source: "Bankrate", year: "2026" },
  { rank: "Top 5", category: "Best Online Brokers", source: "Barron's", year: "2025" },
  { rank: "#1", category: "Algorithmic / API Trading", source: "StockBrokers.com", year: "2025" },
];

const QUOTES = [
  {
    text: "Interactive Brokers continues to stand out among online brokers for its commitment to low costs, sophisticated trading tools, and access to a massive range of investments worldwide.",
    source: "NerdWallet",
    year: "2026",
  },
  {
    text: "No other broker comes close to matching the sheer range of tradeable securities, global markets, and advanced order types available through Interactive Brokers.",
    source: "Investopedia",
    year: "2026",
  },
  {
    text: "For active traders and investors who demand institutional-grade tools at retail prices, Interactive Brokers remains the unrivaled leader.",
    source: "StockBrokers.com",
    year: "2026",
  },
  {
    text: "The breadth of investment products, global market access, and competitive pricing make this the top choice for sophisticated investors.",
    source: "Forbes Advisor",
    year: "2025",
  },
];

const HISTORY = [
  { year: "1977", event: "Thomas Peterffy founds Timber Hill, predecessor to Interactive Brokers, revolutionising market-making with computers." },
  { year: "1993", event: "Interactive Brokers launches retail brokerage service, bringing institutional-grade tools to individual investors for the first time." },
  { year: "1995", event: "First broker to offer online portfolio management and electronic order execution on a wide scale." },
  { year: "2001", event: "Introduction of Universal Account — one account for all global markets, all asset classes." },
  { year: "2007", event: "IPO on NASDAQ. Platform now serves over 100,000 clients in 50+ countries." },
  { year: "2016", event: "Recognised #1 by Barron's for 18th consecutive year. Over $100 billion in client assets." },
  { year: "2023", event: "Client assets exceed $420 billion. 4.4 million accounts. Equity capital surpasses $19.5 billion." },
  { year: "2026", event: "Ranked #1 broker by StockBrokers.com, NerdWallet, Investopedia, BrokerChooser, and Bankrate simultaneously." },
];

export default function AwardsPage() {
  return (
    <MarketingPage
      eyebrow="Industry Recognition"
      title={<>Ranked #1 by Every<br /><span style={{ color: "#fff" }}>Major Publication</span></>}
      subtitle="INT Brokers has been recognised by the world's leading financial publications as the best broker for professional trading, international access, options, futures, and margin rates — for six consecutive years."
      heroImage={IMG}
      heroImageAlt="INT Brokers corporate building — home of an award-winning global brokerage"
      stats={[
        { value: "25+", label: "Industry Awards" },
        { value: "6", label: "Consecutive Years #1" },
        { value: "4.9/5", label: "App Store Rating" },
        { value: "50+", label: "Years of Innovation" },
      ]}
      ctaTitle="Trade with the Best-Rated Broker"
      ctaText="Join 4.4 million investors who chose the platform that every major industry publication ranks #1."
      breadcrumbs={[
        { name: "Why Vault", item: "/why-vault" },
        { name: "Awards", item: "/why-vault/awards" },
      ]}
      relatedLinks={[
        { title: "Why Vault", href: "/why-vault", desc: "The four pillars that make INT Brokers the industry leader." },
        { title: "About INT Brokers", href: "/about", desc: "Our 50-year story, leadership team, and company values." },
        { title: "Lower Costs", href: "/why-vault/lower-costs", desc: "See exactly why our pricing wins #1 in every comparison." },
        { title: "Premier Technology", href: "/why-vault/technology", desc: "Award-winning platforms behind our six-year #1 ranking." },
        { title: "Global Access", href: "/why-vault/global-access", desc: "Trade 170+ markets — the breadth that earns top marks." },
        { title: "Press Centre", href: "/press", desc: "Latest company news and industry coverage." },
      ]}
    >
      {/* Awards grid */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>2025 – 2026 Awards</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Recognised across every category that matters</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
            {AWARDS.map(a => (
              <div key={a.category} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 14, padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Trophy size={18} color="#374151" strokeWidth={1.5} />
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#0F172A" }}>{a.rank}</span>
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0F172A", marginBottom: 6, lineHeight: 1.4 }}>{a.category}</h3>
                <p style={{ fontSize: 12, color: "#9ca3af" }}>{a.source} · {a.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What experts say */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Expert Opinions</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>What the industry's leading reviewers say</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(440px,1fr))", gap: 24 }}>
            {QUOTES.map(q => (
              <div key={q.source} style={{ border: "1px solid #E6E8EB", borderRadius: 16, padding: "32px" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, fontStyle: "italic", marginBottom: 20 }}>"{q.text}"</p>
                <div style={{ borderTop: "1px solid #F5F6F7", paddingTop: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{q.source}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Annual broker review, {q.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image strip — semantic img */}
      <div style={{ height: 320, position: "relative", overflow: "hidden" }}>
        <img
          src={IMG}
          alt="INT Brokers — 50 years of industry-leading financial innovation and award-winning service"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,15,0.85)" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>50+ Years of Leadership</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,48px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em" }}>We have been ranked #1 by Barron's 17 times.</h2>
          </div>
        </div>
      </div>

      {/* History */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER, maxWidth: 760 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>A history of industry firsts</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {HISTORY.map((h, i) => (
              <div key={h.year} style={{ display: "flex", gap: 24, paddingBottom: i < HISTORY.length - 1 ? 32 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#0F172A" }}>{h.year.slice(2)}</span>
                  </div>
                  {i < HISTORY.length - 1 && <div style={{ width: 1, flex: 1, background: "#E6E8EB", marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 6, paddingBottom: i < HISTORY.length - 1 ? 0 : 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>{h.year}</p>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{h.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
