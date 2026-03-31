import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ArrowRight, Shield, ChevronRight } from "lucide-react";

const platformMockup = "/platform-mockup.png";
const platformGlobe = "/platform-globe.png";
const platformDevices = "/platform-devices.png";

const RATES = [
  {
    headline: "Earn interest up to",
    currency: "USD",
    rate: "3.14%",
    sub: "on uninvested cash.\nAutomatically.",
    cta: "Compare Interest Rates",
  },
  {
    headline: "Borrow for as low as",
    currency: "USD",
    rate: "4.14%",
    sub: "Among the lowest\nmargin rates globally.",
    cta: "Compare Margin Rates",
  },
];

const PLAN_LITE = {
  tag: "Occasional Traders",
  name: "VAULT LITE",
  features: [
    { bold: "$0", text: " Commissions on US stocks and ETFs" },
    { text: "Margin as low as USD 6.14%" },
    { text: "Interest up to USD 2.14%" },
  ],
};

const PLAN_PRO = {
  tag: "Active Traders",
  name: "VAULT PRO",
  features: [
    { bold: "$0.005", text: " per share on US Stocks and ETFs" },
    { text: "Margin as low as USD 4.14%" },
    { text: "Interest up to USD 3.14%" },
    { text: "Enhanced price execution" },
    { text: "Extra protection on uninvested cash" },
  ],
};

const PLATFORMS = [
  { label: "Vault Desktop", href: "#" },
  { label: "Client Portal", href: "#" },
  { label: "Vault Mobile", href: "#" },
  { label: "Trader Workstation", href: "#" },
];

const STATS = [
  { sup: "Trusted by over", val: "4 Million", sub: "clients worldwide" },
  { sup: "Executing more than", val: "4 Million", sub: "trades daily" },
  { sup: "Nasdaq-listed", val: "VWT", sub: "" },
  { sup: "Member of the", val: "S&P 500", sub: "" },
  { sup: "Client assets over", val: "$750 Billion", sub: "" },
  { sup: "Total Equity", val: "$19.5 Billion", sub: "" },
  { sup: "Over", val: "$5 Million", sub: "in account protection coverage for uninvested cash" },
  { sup: "Nearly", val: "50 Years", sub: "of Innovation" },
];

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ background: "#fff" }}>
      <HomeNavbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-0 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Lower Costs. Better Returns.
          </h1>
          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
            Earn <strong className="text-white font-semibold">up to USD 3.14%</strong> on uninvested cash,{" "}
            <strong className="text-white font-semibold">pay up to 55% less</strong> on margin, and trade with{" "}
            <strong className="text-white font-semibold">commissions starting at $0</strong> across{" "}
            <strong className="text-white font-semibold">170+ markets</strong> worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#c8102e] text-white font-bold text-base px-8 py-3.5 hover:bg-[#a50d25] transition-colors">
              Get Started
            </Link>
          </div>
          <p className="text-white/30 text-xs mb-12">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" /> Lower Cost Disclosure
            </span>
          </p>

          {/* Hero image */}
          <div className="relative max-w-4xl mx-auto">
            <img
              src={platformMockup}
              alt="Vault Wealth Trading Platform"
              className="w-full object-contain"
              style={{ maxHeight: 440 }}
            />
            {/* Fade bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24"
              style={{ background: "linear-gradient(to bottom, transparent, #111115)" }} />
          </div>
        </div>
      </section>

      {/* ── Your Money Works Harder Here ─────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Your Money Works Harder Here
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RATES.map((r) => (
              <div key={r.headline} style={{ background: "#1c2537" }} className="p-8">
                <p className="text-white/60 text-sm mb-2">{r.headline}</p>
                <p className="text-sm text-white/50 mb-1">
                  <span className="text-white/70 text-base font-medium">{r.currency} </span>
                  <span className="text-5xl font-bold text-white">{r.rate}</span>
                </p>
                <p className="text-white/60 text-sm mt-3 whitespace-pre-line">{r.sub}</p>
                <a href="#" className="flex items-center gap-2 mt-6 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                  {r.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pricing for Any Trading Style
          </h2>

          <div style={{ background: "#1c2537" }} className="p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* LITE */}
              <div>
                <div className="inline-block border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 mb-4">
                  {PLAN_LITE.tag}
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">{PLAN_LITE.name}</h3>
                <ul className="space-y-3">
                  {PLAN_LITE.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-[#c8102e] shrink-0 mt-0.5" />
                      <span>
                        {f.bold && <strong className="text-white">{f.bold}</strong>}
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PRO */}
              <div>
                <div className="inline-block border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 mb-4">
                  {PLAN_PRO.tag}
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white">{PLAN_PRO.name}</h3>
                <ul className="space-y-3">
                  {PLAN_PRO.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-[#c8102e] shrink-0 mt-0.5" />
                      <span>
                        {f.bold && <strong className="text-white">{f.bold}</strong>}
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 text-center">
              <a href="#" className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/70 transition-colors">
                See Pricing Details <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platforms ─────────────────────────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-white/50 text-sm font-medium">
            <span>↑↓</span>
            <span>Vault Platforms</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Institutional-Grade Tools.<br />Built for You.
          </h2>
          <p className="text-white/60 text-base max-w-lg mx-auto mb-8">
            Access lightning-fast, advanced trading platforms built for precision and insight — on any device.
          </p>

          <div className="flex items-center justify-center flex-wrap gap-2 mb-14">
            <p className="text-white font-semibold text-sm mr-2">View Our Award-Winning Trading Platforms</p>
            {PLATFORMS.map((p) => (
              <a key={p.label} href={p.href}
                className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1 border border-white/15 px-3 py-1.5 hover:border-white/30">
                {p.label} <ChevronRight className="w-3 h-3" />
              </a>
            ))}
          </div>

          <div className="relative">
            <img
              src={platformDevices}
              alt="Vault Wealth Platform on multiple devices"
              className="w-full max-w-4xl mx-auto object-contain"
              style={{ maxHeight: 480 }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-16"
              style={{ background: "linear-gradient(to bottom, transparent, #111115)" }} />
          </div>
        </div>
      </section>

      {/* ── Globe / Global Markets ───────────────────────────── */}
      <section className="text-white py-20 border-t border-white/5 relative overflow-hidden"
        style={{ background: "#0d0f14" }}>
        <div className="absolute inset-0 z-0">
          <img src={platformGlobe} alt="Global Markets" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,15,20,0.5) 0%, rgba(13,15,20,0.85) 100%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-4">Global Markets</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Trade Anywhere.<br />In Any Market.
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-10">
            Access 170+ global markets including stocks, options, futures, currencies, bonds, and funds from a single integrated account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#c8102e] text-white font-bold text-sm px-7 py-3 hover:bg-[#a50d25] transition-colors">
              Open Account
            </Link>
            <a href="#why"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-7 py-3 hover:border-white/60 hover:bg-white/5 transition-colors">
              Why Vault Wealth
            </a>
          </div>
        </div>
      </section>

      {/* ── Security / Trust ──────────────────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-4">
            <Shield className="w-4 h-4 text-[#3a6fd4]" /> Financial Strength
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Security You Can Trust</h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-4">
            Your assets are backed by strong capital, automated risk controls, and a commitment to transparency.
          </p>
          <a href="#"
            className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-5 py-2 hover:border-white/50 transition-colors mb-14">
            Vault at a Glance
          </a>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {STATS.slice(0, 4).map((s, i) => (
              <div key={i} className={`py-8 px-4 ${i < 3 ? "border-r border-white/8" : ""}`}>
                <p className="text-white/40 text-xs mb-2 leading-tight">{s.sup}</p>
                <p className="text-3xl md:text-4xl font-bold text-white leading-tight">{s.val}</p>
                {s.sub && <p className="text-white/40 text-xs mt-2">{s.sub}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-white/8">
            {STATS.slice(4).map((s, i) => (
              <div key={i} className={`py-8 px-4 ${i < 3 ? "border-r border-white/8" : ""}`}>
                <p className="text-white/40 text-xs mb-2 leading-tight">{s.sup}</p>
                <p className="text-3xl md:text-4xl font-bold text-white leading-tight">{s.val}</p>
                {s.sub && <p className="text-white/40 text-xs mt-2">{s.sub}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section style={{ background: "#111115" }} className="text-white py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
            Join millions of investors who trust Vault Wealth for institutional-grade access to global markets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#c8102e] text-white font-bold text-base px-10 py-3.5 hover:bg-[#a50d25] transition-colors">
              Open Account
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-base px-10 py-3.5 hover:border-white/60 hover:bg-white/5 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
