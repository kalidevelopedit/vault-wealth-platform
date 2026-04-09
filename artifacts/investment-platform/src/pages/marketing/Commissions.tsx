import { MarketingPage, INNER } from "@/components/marketing/MarketingPage";
import { DollarSign, Check, TrendingDown } from "lucide-react";

const IMG = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&auto=format&fit=crop";

const TABLE = [
  { asset: "US Stocks & ETFs", commission: "$0.00", min: "—", note: "Commission-free, no PFOF" },
  { asset: "US Options", commission: "$0.65/contract", min: "—", note: "Capped at $1.00/leg" },
  { asset: "US Futures", commission: "$0.85/contract", min: "—", note: "Exchange/clearing fees extra" },
  { asset: "Forex (Spot)", commission: "0.2 bps × notional", min: "$2.00", note: "No commission on spreads" },
  { asset: "UK Stocks (LSE)", commission: "0.05% × notional", min: "£3.00", note: "Per order" },
  { asset: "European Stocks", commission: "0.05% × notional", min: "€3.00", note: "Per order" },
  { asset: "Asian Stocks", commission: "0.06–0.08%", min: "Varies", note: "By exchange" },
  { asset: "Bonds (US)", commission: "$1.00/bond", min: "$5.00", note: "Max $250.00" },
  { asset: "Mutual Funds", commission: "$0–$14.95", min: "—", note: "Load or no-load" },
  { asset: "Crypto", commission: "0.12–0.18%", min: "$1.75", note: "On notional value" },
  { asset: "Precious Metals", commission: "0.15%", min: "$2.00", note: "On notional value" },
  { asset: "US CFDs", commission: "0.005/share", min: "$1.00", note: "Long & short" },
];

const NOFEES = [
  "No account maintenance fees", "No inactivity fees", "No platform access fees",
  "No data fees (standard market data)", "No statement fees", "No transfer-in fees",
  "No exercise or assignment fees (options)", "No confirmation fees", "No DTC transfer fees (incoming)",
];

export default function Commissions() {
  return (
    <MarketingPage
      eyebrow="Commission Schedule"
      title={<>Transparent, Competitive<br /><span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Commissions</span></>}
      subtitle="Our complete commission schedule for every asset class, every market. No hidden markups, no payment for order flow, no tricks. What you see is exactly what you pay."
      heroImage={IMG}
      stats={[
        { value: "$0", label: "US Stock Commissions" },
        { value: "$0.65", label: "Options Per Contract" },
        { value: "$0.85", label: "Futures Per Contract" },
        { value: "0.12%", label: "Min Crypto Spread" },
      ]}
    >
      <section style={{ background: "#F5F6F7", padding: "88px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Full Schedule</p>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Commission schedule for all asset classes</h2>
          </div>
          <div style={{ border: "1px solid #E6E8EB", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "#0F172A", display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 2fr", padding: "13px 24px" }}>
              {["Asset Class", "Commission", "Minimum", "Notes"].map((h, i) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: i === 0 ? "rgba(255,255,255,0.5)" : "#c8102e" }}>{h}</span>
              ))}
            </div>
            {TABLE.map((r, i) => (
              <div key={r.asset} style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 2fr", padding: "12px 24px", borderBottom: i < TABLE.length - 1 ? "1px solid #F5F6F7" : "none", background: i % 2 === 0 ? "#fff" : "#fafafa", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500 }}>{r.asset}</span>
                <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{r.commission}</span>
                <span style={{ fontSize: 13, color: "#374151" }}>{r.min}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{r.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ ...INNER }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <TrendingDown size={28} color="#374151" strokeWidth={1.5} style={{ marginBottom: 14 }} />
            <h2 style={{ fontSize: "clamp(20px,3.5vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>What you never pay at INT Brokers</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, maxWidth: 900, margin: "0 auto" }}>
            {NOFEES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "1px solid #E6E8EB", borderRadius: 10 }}>
                <Check size={15} color="#374151" strokeWidth={2.5} />
                <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
