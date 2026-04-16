import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ChevronRight, Shield, Zap, Globe2, DollarSign, TrendingUp, Award, Users, Lock, BarChart3, ArrowUpRight } from "lucide-react";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

const PILLARS = [
  { icon: DollarSign, color: "#60a5fa", title: "Lower Costs", sub: "Professional Pricing", desc: "Commissions starting at $0 on US stocks and ETFs. Margin rates up to 55% lower than the industry average. No added spreads, ticket charges, or platform fees.", stats: [{ v: "$0", l: "Min Commission" }, { v: "55%", l: "Less on Margin" }, { v: "3.14%", l: "Cash Yield" }] },
  { icon: Globe2, color: "#4ade80", title: "Global Access", sub: "170+ Markets Worldwide", desc: "Trade stocks, options, futures, currencies, bonds, funds and crypto across 170+ market centers in 33 countries from a single unified platform.", stats: [{ v: "170+", l: "Markets" }, { v: "33+", l: "Countries" }, { v: "27", l: "Currencies" }] },
  { icon: Zap, color: "#fbbf24", title: "Premier Technology", sub: "Award-Winning Platforms", desc: "Vault's powerful technology suite helps you optimize trading speed, efficiency and portfolio analysis. From mobile to desktop, our platforms work for every investor.", stats: [{ v: "100+", l: "Order Types" }, { v: "<1ms", l: "Execution" }, { v: "99.98%", l: "Uptime" }] },
  { icon: Shield, color: "#f87171", title: "Strength & Security", sub: "$19.5B Equity Capital", desc: "One of the largest and most financially secure brokerages in the world. Our conservative balance sheet and automated risk controls protect you through any market cycle.", stats: [{ v: "$19.5B", l: "Equity Capital" }, { v: "50+", l: "Years" }, { v: "SIPC", l: "Protected" }] },
];

const AWARDS = [
  { rank: "#1", label: "Professional Trading", src: "StockBrokers.com 2026" },
  { rank: "#1", label: "International Trading", src: "StockBrokers.com 2026" },
  { rank: "#1", label: "Options Trading", src: "StockBrokers.com 2026" },
  { rank: "Best", label: "Advanced Traders", src: "NerdWallet 2026" },
  { rank: "Best", label: "For Advanced Traders", src: "Investopedia 2026" },
  { rank: "Best", label: "Online Broker", src: "BrokerChooser 2026" },
];

export default function WhyVault() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <HomeNavbar />

      {/* Hero */}
      <section style={{ background: "#080a0f", padding: "96px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Why Vault Wealth</p>
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
            The Smarter Way<br />
            <span style={{ color: "#fff" }}>to Invest</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 36px" }}>
            Since 1977, Vault Wealth has been pushing the boundaries of financial technology to give every investor — from retirees to institutions — access to the best tools, lowest costs, and widest market access on the planet.
          </p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 40px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            Open an Account Free <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ background: "#0d1017", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "28px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "center" }}>
          {[{ v: "$2.4T+", l: "Assets Under Management" }, { v: "4.4M+", l: "Client Accounts" }, { v: "170+", l: "Global Markets" }, { v: "50+", l: "Years of Innovation" }, { v: "$19.5B", l: "Equity Capital" }].map(s => (
            <div key={s.v} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Four Pillars */}
      <section style={{ background: "#F5F6F7", padding: "96px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Our Advantages</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Four Reasons to Choose Vault</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(480px,1fr))", gap: 20 }}>
            {PILLARS.map(({ icon: Icon, color, title, sub, desc, stats }) => (
              <div key={title} style={{ background: "#fff", borderRadius: 20, border: "1px solid #E6E8EB", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg,#080a0f,#0f1320)", padding: "32px 36px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                      <Icon size={22} color={color} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>{sub}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{title}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{desc}</p>
                </div>
                <div style={{ padding: "20px 36px", display: "flex", gap: 32 }}>
                  {stats.map(s => (
                    <div key={s.l}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History / About */}
      <section style={{ background: "#080a0f", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, background: "radial-gradient(ellipse,rgba(37,99,235,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: 64, alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Our Story</p>
              <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 }}>50+ Years of Financial Innovation</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 20 }}>Founded in 1977, Vault Wealth was built on a simple belief: that every investor — regardless of account size — deserves access to the best prices, broadest range of products, and most powerful tools.</p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 36 }}>Today, Vault Wealth is one of the largest electronic brokerage firms in the world by volume, serving clients in over 200 countries with a platform used by professional traders, retirees, and institutions alike.</p>
              <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Get Started Today <ChevronRight size={15} />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Founded", val: "1977" },
                { label: "Nasdaq Listed", val: "VWT" },
                { label: "Countries Served", val: "200+" },
                { label: "S&P 500 Member", val: "Yes" },
                { label: "Regulatory Capital", val: "$13.3B" },
                { label: "Daily Avg Trades", val: "4.04M" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Industry Recognition</p>
          <h2 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em", marginBottom: 8 }}>Award-Winning, Year After Year</h2>
          <p style={{ color: "#6B7280", fontSize: 15, marginBottom: 52 }}>Recognized by the world's most respected financial publications</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {AWARDS.map((a, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E6E8EB", borderRadius: 16, padding: "28px 28px", minWidth: 160, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#6B7280", letterSpacing: "-0.03em", lineHeight: 1 }}>{a.rank}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginTop: 8, marginBottom: 4, lineHeight: 1.4 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{a.src}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#0f2d52,#0a1e3a,#0f1320)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>Ready to Experience the Difference?</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>Join 4.4 million investors who've already made the switch to Vault Wealth.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
            Open Account — No Minimums <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
