import { MarketingPage, DOTL, INNER } from "@/components/marketing/MarketingPage";
import { DollarSign, Check, TrendingDown, Percent, BadgePercent, PiggyBank, BarChart2, Minus } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&auto=format&fit=crop";

const COMMISSIONS = [
  { product: "US Stocks & ETFs", rate: "$0", note: "Commission-free" },
  { product: "Options (US)", rate: "$0.65/contract", note: "Capped at $1.00/leg" },
  { product: "Futures (US)", rate: "$0.85/contract", note: "Exchange fees extra" },
  { product: "Forex", rate: "0.2 basis points", note: "Min $2/order" },
  { product: "International Stocks", rate: "0.05%", note: "Min varies by market" },
  { product: "Bonds", rate: "$1/bond", note: "Min $5, max $250" },
  { product: "Mutual Funds", rate: "$0–$14.95", note: "Load/no-load options" },
  { product: "Cryptocurrency", rate: "0.12–0.18%", note: "On notional value" },
  { product: "Precious Metals", rate: "0.15%", note: "Min $2/order" },
];

const MARGIN = [
  { tier: "$0 – $100K", rate: "5.83%", avg: "10.24%" },
  { tier: "$100K – $1M", rate: "4.83%", avg: "9.15%" },
  { tier: "$1M – $3M", rate: "4.33%", avg: "8.64%" },
  { tier: "$3M – $200M", rate: "4.14%", avg: "8.25%" },
  { tier: "$200M+", rate: "3.83%", avg: "Contact us" },
];

const FEATURES = [
  { icon: DollarSign, title: "Zero Platform Fees", desc: "No monthly software subscriptions, platform access fees, or inactivity charges." },
  { icon: TrendingDown, title: "No Hidden Spreads", desc: "We don't add to the bid-ask spread on stocks, ETFs, or options." },
  { icon: Percent, title: "Low Margin Rates", desc: "Borrow at rates up to 55% lower than the industry average — from 4.14% on $3M+." },
  { icon: PiggyBank, title: "Earn on Cash", desc: "Earn up to 3.14% APY on uninvested cash balances through our IBKR Cash Yield program." },
  { icon: BadgePercent, title: "No Minimum Balance", desc: "Open an account with $0. No minimum balance requirements ever." },
  { icon: BarChart2, title: "Transparent Reporting", desc: "Full fee transparency in every statement — see exactly what you pay." },
];

export default function LowerCosts() {
  return (
    <MarketingPage
      eyebrow="Cost Advantage"
      title={<>Professional Pricing.<br /><span style={{ color: "#fff" }}>Zero Compromise.</span></>}
      subtitle="INT Brokers passes more of the savings of scale directly to you than any other broker. From $0 commissions on US stocks to the industry's lowest margin rates — your money works harder here."
      heroImage={IMG}
      heroImageAlt="Financial advisor reviewing portfolio cost and performance data"
      stats={[
        { value: "$0", label: "US Stock Commissions" },
        { value: "$0.65", label: "Per Options Contract" },
        { value: "4.14%", label: "Blended Margin Rate" },
        { value: "3.14%", label: "Cash Yield APY" },
        { value: "55%", label: "Less on Margin" },
      ]}
      ctaTitle="Start Saving Today"
      ctaText="Commission-free US stock trading, industry-low margin rates, and cash interest — all in one account."
      breadcrumbs={[
        { name: "Why Vault", item: "/why-vault" },
        { name: "Lower Costs", item: "/why-vault/lower-costs" },
      ]}
      relatedLinks={[
        { title: "Full Pricing Overview", href: "/pricing", desc: "All commissions, margin rates, and cash yields in one place." },
        { title: "Commission Schedule", href: "/pricing/commissions", desc: "Detailed commission rates for every asset class." },
        { title: "Margin Rates", href: "/pricing/margin-rates", desc: "Industry-low margin rates — up to 55% below average." },
        { title: "Interest on Cash", href: "/pricing/interest-on-cash", desc: "Earn up to 3.14% APY on uninvested cash balances." },
        { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "See every fee we don't charge." },
        { title: "Global Access", href: "/why-vault/global-access", desc: "Trade 170+ markets across 33 countries from one account." },
      ]}
    >
      {/* Why it matters */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Why It Matters</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 14 }}>Fees compound just like returns — only in reverse</h2>
            <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 640, margin: "0 auto", lineHeight: 1.8 }}>Every dollar spent on commissions, platform fees, and inflated spreads is a dollar that never compounds. Over 10–20 years of investing, fee drag costs the average investor tens of thousands of dollars.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px 28px 24px" }}>
                <Icon size={22} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission schedule */}
      <section style={{ background: "#fff", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Commission Schedule</p>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 16 }}>Competitive rates across every asset class</h2>
              <p style={{ fontSize: 14.5, color: "#6B7280", lineHeight: 1.8, marginBottom: 28 }}>INT Brokers does not add payment for order flow or hidden markups. Our commissions are the full price you pay — no surprises, no fine print.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["No PFOF — we route to the best venue", "No inactivity or account maintenance fees", "No data fees for standard market data", "No transfer-in fees when you move assets to INT"].map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={15} color="#22c55e" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontSize: 13.5, color: "#374151" }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: "#0F172A", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Product</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Our Rate</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Note</span>
              </div>
              {COMMISSIONS.map((r, i) => (
                <div key={r.product} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "11px 20px", borderBottom: i < COMMISSIONS.length - 1 ? "1px solid #F5F6F7" : "none", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{r.product}</span>
                  <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{r.rate}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Image strip — semantic img */}
      <div style={{ height: 380, position: "relative", overflow: "hidden" }}>
        <img
          src={IMG}
          alt="Professional investor working at a trading desk, reviewing cost analysis"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(8,10,15,0.88) 40%,rgba(8,10,15,0.55))" }} />
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", padding: "0 64px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ maxWidth: 500 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>The INT Brokers Advantage</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,44px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>We profit from your trades, not from you.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>Our business model is based on trading activity and scale — not inflated commissions. When you trade more, we benefit. That alignment means your interests are our interests.</p>
          </div>
        </div>
      </div>

      {/* Margin rates */}
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Margin Rates</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 12 }}>Up to 55% below the industry average</h2>
            <p style={{ fontSize: 14.5, color: "#6B7280", maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>Interest rates are tiered by balance. The larger your portfolio, the lower your margin rate.</p>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden", maxWidth: 760, margin: "0 auto" }}>
            <div style={{ background: "#0F172A", padding: "14px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
              {["Balance Tier", "INT Brokers Rate", "Industry Average"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 1 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>{h}</span>
              ))}
            </div>
            {MARGIN.map((r, i) => (
              <div key={r.tier} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "13px 24px", borderBottom: i < MARGIN.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.tier}</span>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{r.rate}</span>
                <span style={{ fontSize: 13, color: "#9ca3af", textDecoration: "line-through" }}>{r.avg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
