import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { Check, X, DollarSign, Shield } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop";

const COMPARISON = [
  { fee: "Account Maintenance Fee", ibkr: "$0", competitors: "$0–$35/mo" },
  { fee: "Inactivity Fee", ibkr: "$0", competitors: "$10–$20/mo" },
  { fee: "Platform Access Fee", ibkr: "$0", competitors: "$0–$99/mo" },
  { fee: "US Stock Commission", ibkr: "$0", competitors: "$0–$6.95" },
  { fee: "Options Commission", ibkr: "$0.65/contract", competitors: "$0.50–$0.95/contract" },
  { fee: "Margin Rate (median)", ibkr: "4.83%", competitors: "9.15–12.5%" },
  { fee: "Wire Transfer (outgoing)", ibkr: "$10/first per month, then $1", competitors: "$15–$50" },
  { fee: "Paper Statement Fee", ibkr: "$0", competitors: "$0–$2/mo" },
  { fee: "Exercise / Assignment", ibkr: "$0", competitors: "$5–$20" },
  { fee: "Crypto Custody", ibkr: "$0", competitors: "0.5–2.5%/yr" },
  { fee: "DTC Transfer (incoming)", ibkr: "$0", competitors: "$0–$75" },
  { fee: "ACAT Transfer (outgoing)", ibkr: "$0", competitors: "$50–$150" },
];

const NEVER = [
  "No PFOF — we always route to the best venue for you",
  "No bid-ask spread markup on stocks, ETFs, or options",
  "No data feed subscriptions for standard market data",
  "No advisory fee on self-directed accounts",
  "No fee to open an account",
  "No fee to close an account",
  "No fee to change account type",
  "No minimum deposit or balance requirement",
  "No fee for paper trading / simulated accounts",
];

export default function NoHiddenFees() {
  return (
    <MarketingPage
      eyebrow="Transparent Pricing"
      title={<>What You See Is<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>What You Pay</span></>}
      subtitle="INT Brokers was built on a simple premise: your broker should make money from your trading activity — not from hidden fees, inflated spreads, or platform charges. Here's our complete, transparent fee disclosure."
      heroImage={IMG}
      stats={[
        { value: "$0", label: "Account Maintenance" },
        { value: "$0", label: "Inactivity Fees" },
        { value: "$0", label: "Platform Fees" },
        { value: "$0", label: "Exercise Fees" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Fee comparison: INT Brokers vs industry</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2.5fr 1fr 1.5fr", padding: "13px 24px" }}>
              {["Fee Type", "INT Brokers", "Competitors"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {COMPARISON.map((r, i) => (
              <div key={r.fee} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1.5fr", padding: "12px 24px", borderBottom: i < COMPARISON.length - 1 ? "1px solid #F5F6F7" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.fee}</span>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 800 }}>{r.ibkr}</span>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{r.competitors}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <DollarSign size={28} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
            <h2 style={{ fontSize: "clamp(20px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Nine things you never pay for</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, maxWidth: 900, margin: "0 auto" }}>
            {NEVER.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", border: "1px solid #E6E8EB", borderRadius: 10 }}>
                <Check size={15} color="#374151" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
