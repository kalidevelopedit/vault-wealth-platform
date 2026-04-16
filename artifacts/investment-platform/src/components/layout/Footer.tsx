import { Link } from "wouter";
import { Shield, Lock, TrendingUp, Star, Twitter, Linkedin, Youtube } from "lucide-react";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.05)'/%3E%3C/svg%3E")`;

const COLS = [
  {
    title: "Why Vault",
    links: [
      { label: "Why Vault Wealth", href: "/why-vault" },
      { label: "Lower Costs", href: "/why-vault/lower-costs" },
      { label: "Global Access", href: "/why-vault/global-access" },
      { label: "Premier Technology", href: "/why-vault/technology" },
      { label: "Strength & Security", href: "/security" },
      { label: "Awards", href: "/why-vault/awards" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Stocks & ETFs", href: "/products/stocks" },
      { label: "Cryptocurrency", href: "/crypto" },
      { label: "Retirement Accounts", href: "/retirement" },
      { label: "Options", href: "/products/options" },
      { label: "Futures", href: "/products/futures" },
      { label: "Forex / Currencies", href: "/products/forex" },
      { label: "Bonds", href: "/products/bonds" },
      { label: "Precious Metals", href: "/products/precious-metals" },
    ],
  },
  {
    title: "Accounts",
    links: [
      { label: "Individual Accounts", href: "/accounts/individual" },
      { label: "IRA / Roth IRA", href: "/accounts/ira" },
      { label: "SEP-IRA", href: "/accounts/sep-ira" },
      { label: "401(k) Rollover", href: "/accounts/401k" },
      { label: "Joint Accounts", href: "/accounts/joint" },
      { label: "Trust Accounts", href: "/accounts/trust" },
      { label: "Institutional", href: "/accounts/institutional" },
    ],
  },
  {
    title: "Pricing",
    links: [
      { label: "Commission Rates", href: "/pricing/commissions" },
      { label: "Margin Rates", href: "/pricing/margin-rates" },
      { label: "Interest on Cash", href: "/pricing/interest-on-cash" },
      { label: "Crypto Spreads", href: "/pricing/crypto-spreads" },
      { label: "No Hidden Fees", href: "/pricing/no-hidden-fees" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Security", href: "/security" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Risk Disclosures", href: "/risk-disclosures" },
    ],
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "SIPC Member", sub: "Up to $500K protected" },
  { icon: Lock, label: "Bank-Grade Security", sub: "256-bit AES encryption" },
  { icon: Star, label: "4.9/5 App Store", sub: "50,000+ ratings" },
  { icon: TrendingUp, label: "$2.4T+ AUM", sub: "Assets under management" },
];

export function Footer() {
  return (
    <footer style={{ background: "#080a0f", borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "'Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: DOT, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 700, height: 300, background: "radial-gradient(ellipse,rgba(255,255,255,0.02) 0%,transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      {/* Trust badges strip */}
      <div style={{ position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "24px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 20px", backdropFilter: "blur(8px)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(8px)" }}>
                <Icon size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>{label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "60px 48px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px repeat(5,1fr)", gap: 32, marginBottom: 56 }}>

          {/* Brand column */}
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: 16 }}>
              <img src="/logo-white.png" alt="INT Brokers" style={{ width: 260, height: "auto", display: "block", mixBlendMode: "screen" }} />
            </Link>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.75, marginBottom: 20, maxWidth: 200 }}>
              Institutional-grade investment platform. Regulated, secure, and built for serious investors since 1977.
            </p>
            {/* Social */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Youtube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" title={label} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                  <Icon size={14} color="rgba(255,255,255,0.5)" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", textDecoration: "none", transition: "color .15s", display: "block" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regulatory notice */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "20px 24px", marginBottom: 32 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.8, margin: 0 }}>
            <strong style={{ color: "rgba(255,255,255,0.35)" }}>Regulatory Notice:</strong> Vault Wealth Management LLC is a registered broker-dealer, member FINRA/SIPC. Securities and investment products: Not FDIC Insured · No Bank Guarantee · May Lose Value. Cryptocurrency trading involves substantial risk of loss. Past performance is not indicative of future results. Options involve risk and are not suitable for all investors. Interest rates and APY figures are variable and subject to change. Lower Cost Disclosure: Vault's rates may not be the lowest in all cases. See full disclosures at vaultwealth.com/disclosures.
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0 }}>
            © {new Date().getFullYear()} Vault Wealth Management LLC. All rights reserved. Member FINRA/SIPC.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Disclosures", href: "/risk-disclosures" },
              { label: "Accessibility", href: "#" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.1em", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.22)")}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
