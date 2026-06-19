import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Landmark, DollarSign, Globe2, Shield, BarChart2, TrendingUp } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&auto=format&fit=crop";

const BOND_TYPES = [
  { name: "US Treasury Bonds & Notes", yield: "4.2–5.3%", risk: "Very Low", liquidity: "High", desc: "Full faith and credit of the US government. The safest fixed-income investment available." },
  { name: "Municipal Bonds", yield: "3.5–4.8%", risk: "Low", liquidity: "Medium", desc: "State and local government bonds often exempt from federal income tax — attractive for high-income investors." },
  { name: "Investment-Grade Corporate", yield: "4.8–6.5%", risk: "Low-Medium", liquidity: "High", desc: "Bonds from high-quality corporations (BBB+ or higher). Higher yield than Treasuries with manageable risk." },
  { name: "High-Yield Corporate", yield: "7.0–12%", risk: "Medium-High", liquidity: "Medium", desc: "Below investment grade bonds offering higher yields in exchange for greater credit risk." },
  { name: "Agency Bonds (GNMA, FNMA)", yield: "4.5–5.2%", risk: "Very Low", liquidity: "High", desc: "Backed by US government agencies. Near-Treasury safety with slightly higher yields." },
  { name: "International Sovereign", yield: "Varies", risk: "Low-High", liquidity: "Medium", desc: "Government bonds from 30+ countries — including Germany, UK, Japan, Australia, and emerging markets." },
];

const FEATURES = [
  { icon: Landmark, title: "1 Million+ Bond Inventory", desc: "Access to one of the largest bond inventories of any online broker — government, corporate, municipal, and agency." },
  { icon: DollarSign, title: "$1 Per Bond Commission", desc: "Trade bonds at $1 per bond, minimum $5, maximum $250. No markup on the bid-ask spread." },
  { icon: Globe2, title: "30+ Countries", desc: "US Treasuries, UK gilts, German bunds, Japanese JGBs, and bonds from 25+ other countries." },
  { icon: Shield, title: "SIPC-Protected", desc: "Your bonds held in custody at INT Brokers are protected up to $500,000 under SIPC." },
  { icon: BarChart2, title: "Bond Screener", desc: "Filter bonds by yield, maturity, credit rating, duration, sector, issuer, and more." },
  { icon: TrendingUp, title: "Yield Curve Analytics", desc: "View real-time yield curves and duration risk for every bond in your portfolio and watchlist." },
];

export default function Bonds() {
  return (
    <MarketingPage
      eyebrow="Fixed Income"
      title={<>Build Steady Income<br /><span style={{ color: "#fff" }}>with Bonds</span></>}
      subtitle="Access over 1 million bonds from 30+ countries — US Treasuries, municipal, investment-grade corporate, high-yield, and sovereign bonds — at $1 per bond with no spread markup."
      heroImage={IMG}
      stats={[
        { value: "1M+", label: "Bonds Available" },
        { value: "$1", label: "Per Bond Commission" },
        { value: "30+", label: "Countries" },
        { value: "6", label: "Bond Categories" },
        { value: "4.2%+", label: "Current Treasury Yield" },
      ]}
      heroImageAlt="Financial charts and bond certificates representing fixed-income investing"
      breadcrumbs={[
        { name: "Products", item: "/products/stocks" },
        { name: "Bonds", item: "/products/bonds" },
      ]}
      relatedLinks={[
        { title: "Stocks & ETFs", href: "/products/stocks", desc: "Commission-free US stock and ETF trading from $0." },
        { title: "Options", href: "/products/options", desc: "Low-cost options contracts at $0.65 per contract." },
        { title: "Futures", href: "/products/futures", desc: "Trade global futures from $0.85 per contract." },
        { title: "Forex", href: "/products/forex", desc: "100+ currency pairs with near-interbank spreads." },
        { title: "Precious Metals", href: "/products/precious-metals", desc: "Gold, silver, and platinum at institutional spreads." },
        { title: "Commissions", href: "/pricing/commissions", desc: "Full transparent rate schedule across all asset classes." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Why include bonds in your portfolio?</h2>
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
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Six bond categories to build your fixed-income allocation</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {BOND_TYPES.map(b => (
              <div key={b.name} style={{ border: "1px solid #E6E8EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", padding: "16px 20px" }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{b.name}</h3>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Yield Range</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: "#6B7280" }}>{b.yield}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Risk Level</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{b.risk}</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
