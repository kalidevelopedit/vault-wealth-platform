import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { DollarSign, TrendingUp, Shield, Clock, Check } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop";

const TIERS = [
  { balance: "First $10,000", rate: "3.14% APY", note: "On eligible USD balances" },
  { balance: "$10,001 – $100,000", rate: "3.14% APY", note: "Same rate applies" },
  { balance: "$100,001 – $1,000,000", rate: "3.14% APY", note: "Same rate applies" },
  { balance: "$1,000,001+", rate: "3.14% APY", note: "Institutional rate" },
];

const CURRENCIES = [
  { ccy: "USD", rate: "3.14%", benchmark: "Fed Funds Rate – 50bps" },
  { ccy: "EUR", rate: "2.18%", benchmark: "ECB Rate – 50bps" },
  { ccy: "GBP", rate: "3.42%", benchmark: "BoE Rate – 50bps" },
  { ccy: "CHF", rate: "0.15%", benchmark: "SNB Rate – 50bps" },
  { ccy: "CAD", rate: "2.85%", benchmark: "BoC Rate – 50bps" },
  { ccy: "AUD", rate: "3.10%", benchmark: "RBA Rate – 50bps" },
  { ccy: "JPY", rate: "0.00%", benchmark: "BoJ Rate – 50bps" },
  { ccy: "HKD", rate: "3.85%", benchmark: "HIBOR – 50bps" },
];

const FEATURES = [
  { icon: DollarSign, title: "Earn Up to 3.14% APY", desc: "Uninvested cash earns competitive interest rates — paid daily and compounded monthly in your account." },
  { icon: TrendingUp, title: "No Minimum Balance", desc: "Even small cash balances earn interest. No minimum threshold to start earning — every dollar works for you." },
  { icon: Shield, title: "FDIC & SIPC Protection", desc: "Cash balances benefit from SIPC protection and, where applicable, FDIC coverage through our bank sweep programs." },
  { icon: Clock, title: "Paid Daily, Compounded Monthly", desc: "Interest accrues every business day your cash is on account. Monthly compounding maximises your earnings." },
  { icon: Check, title: "8 Currencies Supported", desc: "Earn interest on balances in USD, EUR, GBP, CHF, CAD, AUD, JPY, and HKD — in each currency separately." },
];

export default function InterestOnCash() {
  return (
    <MarketingPage
      eyebrow="Cash Yield Program"
      title={<>Earn While You Wait —<br /><span style={{ color: "#fff" }}>Interest on Cash</span></>}
      subtitle="Your uninvested cash earns up to 3.14% APY at INT Brokers — paid daily, compounded monthly. Available on balances in 8 currencies. No minimum balance required."
      heroImage={IMG}
      stats={[
        { value: "3.14%", label: "USD Cash Yield APY" },
        { value: "8", label: "Currencies Earning" },
        { value: "Daily", label: "Interest Paid" },
        { value: "$0", label: "Minimum Balance" },
      ]}
      heroImageAlt="Cash savings earning interest in a brokerage account with growth indicators"
      breadcrumbs={[
        { name: "Pricing", item: "/pricing" },
        { name: "Interest on Cash", item: "/pricing/interest-on-cash" },
      ]}
      relatedLinks={[
        { title: "Pricing Overview", href: "/pricing", desc: "All rates across stocks, options, futures, and more." },
        { title: "Commissions", href: "/pricing/commissions", desc: "Full commission schedule across every asset class." },
        { title: "Margin Rates", href: "/pricing/margin-rates", desc: "Borrow at rates up to 55% below industry average." },
        { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "Zero account fees, no inactivity charges." },
        { title: "Individual Account", href: "/accounts/individual", desc: "Open a full-featured account with no minimum balance." },
        { title: "Lower Costs", href: "/why-vault/lower-costs", desc: "How INT Brokers keeps costs lower than any major broker." },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Your cash is always working</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 24 }}>USD interest rates by tier</h2>
              <div style={{ border: "1px solid #E6E8EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 18px" }}>
                  {["Balance", "Rate", "Note"].map((h, i) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
                  ))}
                </div>
                {TIERS.map((r, i) => (
                  <div key={r.balance} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "11px 18px", borderBottom: i < TIERS.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                    <span style={{ fontSize: 12, color: "#374151" }}>{r.balance}</span>
                    <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 800 }}>{r.rate}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.note}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: 24 }}>Interest rates by currency</h2>
              <div style={{ border: "1px solid #E6E8EB", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "12px 18px" }}>
                  {["Currency", "APY", "Benchmark"].map((h, i) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.75)" }}>{h}</span>
                  ))}
                </div>
                {CURRENCIES.map((c, i) => (
                  <div key={c.ccy} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", padding: "11px 18px", borderBottom: i < CURRENCIES.length - 1 ? "1px solid #F5F6F7" : "none", background: "#fff" }}>
                    <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{c.ccy}</span>
                    <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>{c.rate}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{c.benchmark}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
