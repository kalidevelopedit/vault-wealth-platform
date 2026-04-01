import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ArrowUpRight, ChevronRight } from "lucide-react";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

const COMMISSION_ROWS = [
  { asset: "US Stocks & ETFs", tiered: "Starting at $0", fixed: "$0.005/share", min: "$0", max: "1% of trade value" },
  { asset: "Options", tiered: "$0.15–0.65/contract", fixed: "$0.65/contract", min: "$0", max: "$0.65/contract" },
  { asset: "Futures", tiered: "$0.25–0.85/contract", fixed: "$0.85/contract", min: "$0.25", max: "0.1% of trade value" },
  { asset: "Forex / Currencies", tiered: "0.08–0.20 bps", fixed: "0.20 bps × trade value", min: "$2", max: "0.1% of trade value" },
  { asset: "Cryptocurrency", tiered: "0.12–0.18%", fixed: "0.18% of trade value", min: "$1.75", max: "—" },
  { asset: "Bonds (US Corp)", tiered: "$1–3/bond", fixed: "$3/bond", min: "$1", max: "0.5% of face value" },
  { asset: "Mutual Funds", tiered: "$0–14.95", fixed: "$14.95", min: "$0", max: "$14.95" },
  { asset: "Precious Metals", tiered: "0.15%", fixed: "0.15% of trade value", min: "$2", max: "—" },
];

const MARGIN_ROWS = [
  { currency: "USD", tier: "≥ $1,000,000", rate: "4.14%" },
  { currency: "USD", tier: "$100,000 – $999,999", rate: "5.14%" },
  { currency: "USD", tier: "$25,000 – $99,999", rate: "6.14%" },
  { currency: "USD", tier: "< $25,000", rate: "6.83%" },
  { currency: "EUR", tier: "≥ €100,000", rate: "3.14%" },
  { currency: "GBP", tier: "≥ £100,000", rate: "4.64%" },
];

const CASH_ROWS = [
  { currency: "USD", rate: "Up to 3.14%", note: "Above $10,000 balance" },
  { currency: "EUR", rate: "Up to 2.40%", note: "Above €10,000 balance" },
  { currency: "GBP", rate: "Up to 4.20%", note: "Above £10,000 balance" },
  { currency: "CHF", rate: "Up to 0.50%", note: "Above CHF 10,000 balance" },
  { currency: "CAD", rate: "Up to 2.75%", note: "Above CAD 10,000 balance" },
];

export default function Pricing() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <HomeNavbar />

      {/* Hero */}
      <section style={{ background: "#080a0f", padding: "96px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(200,16,46,0.1) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 12 }}>Transparent Pricing</p>
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
            Professional Pricing<br />
            <span style={{ background: "linear-gradient(90deg,#e8394a,#ff7b7b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>For Every Investor</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 36px" }}>
            No hidden fees. No surprises. Trade stocks for $0, earn up to 3.14% on cash, and borrow at the industry's lowest margin rates.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[{ v: "$0", l: "Min Commission" }, { v: "4.14%", l: "Margin From" }, { v: "3.14%", l: "Cash Yield" }, { v: "No", l: "Hidden Fees" }].map(s => (
              <div key={s.v} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 24px", backdropFilter: "blur(8px)", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.025em" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Table */}
      <section style={{ background: "#F5F6F7", padding: "80px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Commissions</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em" }}>Trade Every Asset Class</h2>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E6E8EB", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F5F6F7", borderBottom: "1px solid #E6E8EB" }}>
                    {["Asset Class", "Tiered Rate", "Fixed Rate", "Min Fee", "Max Fee"].map((h, i) => (
                      <th key={h} style={{ padding: "14px 20px", textAlign: i === 0 ? "left" : "center", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6B7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_ROWS.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < COMMISSION_ROWS.length - 1 ? "1px solid #E6E8EB" : "none" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: "#0F172A" }}>{r.asset}</td>
                      <td style={{ padding: "14px 20px", textAlign: "center", color: "#2b6b4e", fontWeight: 700 }}>{r.tiered}</td>
                      <td style={{ padding: "14px 20px", textAlign: "center", color: "#374151" }}>{r.fixed}</td>
                      <td style={{ padding: "14px 20px", textAlign: "center", color: "#374151" }}>{r.min}</td>
                      <td style={{ padding: "14px 20px", textAlign: "center", color: "#374151" }}>{r.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Margin Rates */}
      <section style={{ background: "#080a0f", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,16,46,0.8)", marginBottom: 10 }}>Margin Rates</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em" }}>Industry-Low Margin Rates</h2>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 8 }}>Up to 55% less than the industry average</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(8px)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                    {["Currency", "Balance Tier", "Annual Rate"].map(h => (
                      <th key={h} style={{ padding: "14px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MARGIN_ROWS.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < MARGIN_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <td style={{ padding: "14px 24px", fontWeight: 700, color: "#fff" }}>{r.currency}</td>
                      <td style={{ padding: "14px 24px", color: "rgba(255,255,255,0.5)" }}>{r.tier}</td>
                      <td style={{ padding: "14px 24px", fontWeight: 800, color: "#60a5fa", fontSize: 16 }}>{r.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Cash Yields */}
      <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c8102e", marginBottom: 10 }}>Interest on Cash</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em" }}>Earn More on Uninvested Cash</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginTop: 8 }}>Interest paid on instantly available cash balances — no lock-up</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
            {CASH_ROWS.map((r, i) => (
              <div key={i} style={{ background: "linear-gradient(135deg,#080a0f,#0f1320)", borderRadius: 18, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(74,222,128,0.4),transparent)" }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{r.currency}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#4ade80", letterSpacing: "-0.025em", marginBottom: 4 }}>{r.rate}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section style={{ background: "#F5F6F7", padding: "80px 24px", borderTop: "1px solid #E6E8EB", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em", marginBottom: 8 }}>Everything Included. No Hidden Fees.</h2>
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 48 }}>Your account includes all of this at no additional cost</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, textAlign: "left" }}>
            {["$0 account minimum", "Real-time market data", "Advanced charting tools", "Portfolio analytics", "Mobile & desktop platforms", "Fractional shares", "Dividend reinvestment", "Tax-loss harvesting", "24/7 crypto trading", "Customer support 24/5", "No inactivity fees", "No platform fees"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1px solid #E6E8EB", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg,rgba(43,107,78,0.15),rgba(43,107,78,0.08))", border: "1px solid rgba(43,107,78,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={12} color="#2b6b4e" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#0f2d52,#0a1e3a,#0f1320)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>Start Saving on Commissions Today</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>Open an account in minutes. No minimums. No hidden fees. Trade from $0.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "linear-gradient(135deg,#e8192c,#c8102e)", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(200,16,46,0.4)" }}>
            Open Account Free <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
