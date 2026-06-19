import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ArrowUpRight, ChevronRight, Shield, TrendingUp, Phone, Clock } from "lucide-react";
import { JsonLd, organizationSchema, breadcrumbSchema } from "@/components/seo/JsonLd";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

const ACCOUNT_TYPES = [
  { name: "Traditional IRA", tag: "Tax-Deferred", desc: "Contribute pre-tax dollars. Pay taxes only when you withdraw in retirement. Ideal for those expecting a lower tax bracket in retirement.", limit: "$7,000/year ($8,000 if 50+)", benefit: "Immediate tax deduction", color: "#60a5fa" },
  { name: "Roth IRA", tag: "Tax-Free Growth", desc: "Contribute after-tax dollars. All qualified withdrawals — including growth — are completely tax-free. Best for those expecting higher taxes in retirement.", limit: "$7,000/year ($8,000 if 50+)", benefit: "Tax-free in retirement", color: "#4ade80" },
  { name: "SEP-IRA", tag: "For Self-Employed", desc: "Simplified Employee Pension for self-employed individuals and small business owners. Contribute up to 25% of net income or $66,000, whichever is less.", limit: "Up to $66,000/year", benefit: "High contribution limit", color: "#fbbf24" },
  { name: "401(k) Rollover", tag: "Transfer & Consolidate", desc: "Roll your old 401(k) into a Vault IRA with no penalties. Keep your savings working with lower fees and more investment options.", limit: "No limit on rollover amount", benefit: "More investment choices", color: "#f87171" },
];

const FEATURES = [
  { icon: Shield, title: "SIPC & FDIC Protected", desc: "Up to $500K SIPC protection plus FDIC-insured cash up to $2.5M through bank sweeps." },
  { icon: TrendingUp, title: "Inflation-Beating Returns", desc: "Dividend stocks, Treasury bonds, REITs and diversified funds to preserve and grow purchasing power." },
  { icon: Phone, title: "Dedicated Senior Support", desc: "Speak to real retirement specialists Monday–Friday. No bots. No hold music. Real human guidance." },
  { icon: Clock, title: "Automatic Rebalancing", desc: "Set your target allocation once. Our system automatically rebalances your portfolio as markets move." },
];

const RELATED_RETIREMENT = [
  { title: "IRA Accounts", href: "/accounts/ira", desc: "Traditional and Roth IRAs with no annual fees and 401(k) rollover support." },
  { title: "SEP-IRA", href: "/accounts/sep-ira", desc: "Contribute up to $69,000 annually if you're self-employed or own a small business." },
  { title: "401(k) Rollover", href: "/accounts/401k", desc: "Roll your old 401(k) to an INT Brokers IRA — tax-free, in 3–7 days." },
  { title: "No Hidden Fees", href: "/pricing/no-hidden-fees", desc: "Zero account maintenance fees, inactivity charges, or platform costs." },
  { title: "Why Vault", href: "/why-vault", desc: "50+ years of financial innovation behind every investment decision." },
  { title: "Security", href: "/security", desc: "SIPC + FDIC protection and institutional-grade security for your retirement savings." },
];

export default function RetirementPage() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Retirement", item: "/retirement" }])} />
      <HomeNavbar />

      {/* Hero */}
      <section style={{ background: "#080a0f", padding: "96px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(74,222,128,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4ade80", marginBottom: 12 }}>Retirement Planning</p>
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
            Your Retirement Deserves<br />
            <span style={{ color: "#fff" }}>More Than 0.01% APY</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 36px" }}>
            Millions of retirees are losing money to inflation in savings accounts. Vault Wealth gives seniors and pre-retirees access to institutional investment tools with dedicated support — no minimums, no jargon, no nonsense.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 40px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 16px rgba(13,21,32,0.2)" }}>
              Open Retirement Account <ArrowUpRight size={16} />
            </Link>
            <a href="https://wa.me/18886555555" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              Speak to an Advisor <ChevronRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Why retirees love us */}
      <section style={{ background: "#F5F6F7", padding: "80px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Built for Retirees</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Everything a Retiree Needs</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "linear-gradient(135deg,#080a0f,#0f1320)", borderRadius: 18, padding: "28px 26px", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, backdropFilter: "blur(8px)" }}>
                  <Icon size={22} color="#4ade80" strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account Types */}
      <section style={{ background: "#fff", padding: "80px 24px", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Account Types</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Choose Your Retirement Account</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {ACCOUNT_TYPES.map(({ name, tag, desc, limit, benefit, color }) => (
              <div key={name} style={{ background: "#fff", borderRadius: 20, border: "1px solid #E6E8EB", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ background: "linear-gradient(135deg,#080a0f,#0f1320)", padding: "24px 26px 20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color}60,transparent)` }} />
                  <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{tag}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{name}</div>
                </div>
                <div style={{ padding: "20px 26px 24px" }}>
                  <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.75, marginBottom: 18 }}>{desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Check size={13} color="#2b6b4e" />
                      <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{limit}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Check size={13} color="#2b6b4e" />
                      <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{benefit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats dark */}
      <section style={{ background: "#080a0f", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 52 }}>The Numbers That Matter for Retirement</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {[
              { v: "3.14%", l: "Cash Yield APY" },
              { v: "$0", l: "Account Minimum" },
              { v: "$7,000", l: "Annual IRA Limit" },
              { v: "$8,000", l: "If Age 50+" },
              { v: "$2.5M", l: "FDIC Insurance" },
              { v: "14.7%", l: "Avg Annual Return (5yr)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ fontSize: 26, fontWeight: 900, color: "#4ade80", letterSpacing: "-0.025em", marginBottom: 6 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#0f2d52,#0a1e3a,#0f1320)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>It's Never Too Late to Invest Smarter</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>Whether you're 55 or 80 — open a retirement account today and start earning more on your savings.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "#0d1520", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 16px rgba(13,21,32,0.2)" }}>
            Open Retirement Account <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Related Resources */}
      <section style={{ background: "#F5F6F7", padding: "72px 24px", borderTop: "1px solid #E6E8EB" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 8 }}>Related Resources</p>
            <h2 style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Explore more from INT Brokers</h2>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {RELATED_RETIREMENT.map(l => (
              <li key={l.href}>
                <Link href={l.href} style={{ display: "block", background: "#fff", border: "1px solid #E6E8EB", borderRadius: 12, padding: "18px 20px", textDecoration: "none" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", display: "block", marginBottom: 4 }}>{l.title}</span>
                  <span style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.6 }}>{l.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
