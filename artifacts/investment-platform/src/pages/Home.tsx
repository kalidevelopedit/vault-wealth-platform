import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, TrendingUp, Globe, LineChart, Building2, Lock } from "lucide-react";

const stats = [
  { value: "$2.4B+", label: "Assets Under Custody" },
  { value: "17", label: "Asset Classes" },
  { value: "99.98%", label: "Platform Uptime" },
  { value: "SOC 2", label: "Type II Certified" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Institutional Execution",
    desc: "Direct market access with institutional-grade pricing, minimal slippage, and real-time order routing across 40+ venues.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Level Security",
    desc: "Multi-sig cold storage, hardware security modules, and 24/7 security operations monitoring your portfolio.",
  },
  {
    icon: LineChart,
    title: "Professional Analytics",
    desc: "Advanced portfolio analytics, risk attribution, and real-time P&L across all asset classes in one unified view.",
  },
  {
    icon: Globe,
    title: "Global Market Access",
    desc: "Trade equities, digital assets, and commodities across multiple jurisdictions from a single account.",
  },
  {
    icon: Building2,
    title: "Private Client Services",
    desc: "Dedicated relationship managers and bespoke advisory for high-net-worth individuals and family offices.",
  },
  {
    icon: Lock,
    title: "Regulatory Compliance",
    desc: "Fully regulated, KYC/AML compliant infrastructure built to the highest institutional standards.",
  },
];

const assetRows = [
  { name: "Bitcoin", sym: "BTC", type: "Digital Asset", price: "$67,234", chg: "+2.79%", pos: true },
  { name: "Apple Inc.", sym: "AAPL", type: "Equity", price: "$185.42", chg: "+1.28%", pos: true },
  { name: "Gold", sym: "XAU/USD", type: "Commodity", price: "$2,342.5", chg: "+0.79%", pos: true },
  { name: "Ethereum", sym: "ETH", type: "Digital Asset", price: "$3,542.8", chg: "+2.53%", pos: true },
  { name: "Microsoft", sym: "MSFT", type: "Equity", price: "$415.80", chg: "+1.57%", pos: true },
  { name: "Crude Oil", sym: "WTI", type: "Commodity", price: "$78.43", chg: "−1.54%", pos: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#0a1628] text-white relative overflow-hidden">
        {/* Grid texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px w-8 bg-white/30" />
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.2em]">Institutional Wealth Platform</span>
            </div>
            <h1 className="text-[52px] leading-[1.08] font-semibold tracking-[-0.03em] text-white mb-6">
              Sophisticated capital<br />markets access.<br />
              <span className="text-white/40">For serious investors.</span>
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-xl mb-10">
              Institutional-grade tools, deep liquidity, and bank-level security across crypto, equities, and commodities — managed from one unified platform.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-white text-[#0a1628] text-xs font-bold uppercase tracking-[0.1em] px-6 py-3 hover:bg-white/92 transition-colors">
                Open an Account <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center gap-2 border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.1em] px-6 py-3 hover:border-white/40 hover:bg-white/5 transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          {/* Live market strip */}
          <div className="mt-16 border-t border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left py-2 text-white/30 font-semibold uppercase tracking-widest text-[9px] pr-8">Instrument</th>
                    <th className="text-left py-2 text-white/30 font-semibold uppercase tracking-widest text-[9px] pr-8">Type</th>
                    <th className="text-right py-2 text-white/30 font-semibold uppercase tracking-widest text-[9px] pr-8">Last Price</th>
                    <th className="text-right py-2 text-white/30 font-semibold uppercase tracking-widest text-[9px]">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {assetRows.map((a) => (
                    <tr key={a.sym} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="py-2.5 pr-8">
                        <span className="text-white font-medium">{a.name}</span>
                        <span className="text-white/30 ml-2 font-mono">{a.sym}</span>
                      </td>
                      <td className="py-2.5 pr-8 text-white/40 font-mono text-[10px]">{a.type}</td>
                      <td className="py-2.5 pr-8 text-right text-white font-mono">{a.price}</td>
                      <td className={`py-2.5 text-right font-mono font-semibold ${a.pos ? "text-emerald-400" : "text-red-400"}`}>{a.chg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="bg-[#0d1e36] border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/8">
          {stats.map((s) => (
            <div key={s.label} className="px-8 first:pl-0 last:pr-0">
              <div className="text-2xl font-semibold text-white tracking-tight tabular-nums">{s.value}</div>
              <div className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Platform Features ─────────────────────────────────── */}
      <section id="solutions" className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-6 bg-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Platform</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-foreground mb-4">
                Built for institutional standards.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every component of our platform is engineered to meet the requirements of professional investors, family offices, and wealth managers.
              </p>
              <Link href="/register"
                className="inline-flex items-center gap-2 mt-8 border border-foreground text-foreground text-xs font-bold uppercase tracking-[0.1em] px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors">
                Start Today <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-0 border border-border">
              {features.map((f, i) => (
                <div key={i}
                  className={`p-7 border-border bg-card hover:bg-muted/30 transition-colors
                    ${i % 2 === 0 && i < features.length - 1 ? "border-r" : ""}
                    ${i < features.length - 2 ? "border-b" : ""}
                  `}>
                  <f.icon className="w-5 h-5 text-primary mb-5 opacity-80" />
                  <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Asset Classes ─────────────────────────────────────── */}
      <section id="markets" className="py-24 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-px w-6 bg-foreground/30" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Asset Classes</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-foreground mb-5">
                One platform. Every market.
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-10">
                Move seamlessly between traditional and digital markets without managing multiple brokers, custodians, or wallets. Vault Wealth consolidates your entire portfolio under one institutional roof.
              </p>
              <div className="space-y-0 border border-border">
                {[
                  { cat: "Digital Assets", items: "BTC, ETH, SOL, BNB + 46 more vetted assets", count: "50+" },
                  { cat: "Equities & ETFs", items: "US & international stocks, major indices", count: "5,000+" },
                  { cat: "Commodities", items: "Precious metals, energy, agriculture", count: "25+" },
                ].map((a, i) => (
                  <div key={i} className={`flex items-center gap-6 p-5 hover:bg-muted/30 transition-colors ${i < 2 ? "border-b border-border" : ""}`}>
                    <div className="text-2xl font-semibold text-primary tracking-tight tabular-nums w-14 shrink-0">{a.count}</div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{a.cat}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.items}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-border bg-background p-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sample Portfolio Allocation</div>
                <div className="space-y-2">
                  {[
                    { label: "Equities", pct: 45, color: "bg-[#0a1628]" },
                    { label: "Digital Assets", pct: 30, color: "bg-[#1e3a5f]" },
                    { label: "Commodities", pct: 15, color: "bg-[#3d6b9e]" },
                    { label: "Cash", pct: 10, color: "bg-[#8ba9c9]" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <span className="text-foreground font-semibold tabular-nums">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted">
                        <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Return", value: "+24.6%", sub: "YTD", pos: true },
                  { label: "Risk Score", value: "Medium", sub: "Portfolio risk" },
                  { label: "Volatility", value: "12.4%", sub: "Annualized" },
                  { label: "Sharpe Ratio", value: "1.84", sub: "Risk-adjusted" },
                ].map((m) => (
                  <div key={m.label} className="border border-border bg-card p-4">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">{m.label}</div>
                    <div className={`text-xl font-semibold tracking-tight tabular-nums ${m.pos ? "text-emerald-700" : "text-foreground"}`}>{m.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ──────────────────────────────────────────── */}
      <section id="security" className="py-24 border-b border-border bg-[#0a1628] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-px w-6 bg-white/30" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Security & Trust</span>
              </div>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-white mb-5">
                Your capital, protected by institutional-grade infrastructure.
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-10">
                We operate under strict regulatory frameworks across multiple jurisdictions. Our custody solutions employ industry-leading cryptography, multi-signature authorization, and continuous security monitoring.
              </p>
              <div className="grid grid-cols-2 gap-0 border border-white/10">
                {[
                  { val: "$500M+", label: "Insurance Coverage" },
                  { val: "SOC 2", label: "Type II Certified" },
                  { val: "256-bit", label: "AES Encryption" },
                  { val: "24/7", label: "Security Operations" },
                ].map((s, i) => (
                  <div key={i}
                    className={`p-5 border-white/10
                      ${i % 2 === 0 ? "border-r" : ""}
                      ${i < 2 ? "border-b" : ""}
                    `}>
                    <div className="text-2xl font-semibold text-white tracking-tight">{s.val}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 p-8 space-y-5">
              {[
                { title: "Cold Storage Custody", desc: "98% of assets held in offline, multi-sig cold storage with geographically distributed keys." },
                { title: "Real-Time Monitoring", desc: "Continuous fraud detection and anomaly analysis across all account activity." },
                { title: "Regulatory Compliance", desc: "Fully KYC/AML compliant with automated reporting and audit trail." },
                { title: "Data Encryption", desc: "End-to-end encryption for all data in transit and at rest using AES-256." },
              ].map((item, i) => (
                <div key={i} className={`pb-5 ${i < 3 ? "border-b border-white/8" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white/40 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                      <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
              Ready to elevate your portfolio?
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg">
              Join thousands of high-net-worth individuals and institutions who trust Vault Wealth with their capital.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-[#0a1628] text-white text-xs font-bold uppercase tracking-[0.1em] px-7 py-3.5 hover:bg-[#0d1f38] transition-colors">
              Open an Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 border border-border text-foreground text-xs font-semibold uppercase tracking-[0.1em] px-7 py-3.5 hover:bg-muted/50 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
