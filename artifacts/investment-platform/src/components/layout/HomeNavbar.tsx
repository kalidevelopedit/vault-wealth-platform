import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Search, X, ChevronDown } from "lucide-react";

const NAV = [
  {
    label: "Why Vault",
    sections: [
      {
        items: [
          { label: "Why Vault Wealth", sub: "Overview of our advantages", href: "/why-vault" },
          { label: "Lower Costs", sub: "Professional pricing for everyone", href: "/why-vault/lower-costs" },
          { label: "Global Access", sub: "170+ markets worldwide", href: "/why-vault/global-access" },
          { label: "Premier Technology", sub: "Award-winning platforms", href: "/why-vault/technology" },
          { label: "Strength & Security", sub: "$19.5B equity capital", href: "/security" },
          { label: "Awards", sub: "Industry recognition", href: "/why-vault/awards" },
        ],
      },
    ],
  },
  {
    label: "Products",
    sections: [
      {
        items: [
          { label: "Stocks & ETFs", sub: "170+ global markets, $0 commission", href: "/products/stocks" },
          { label: "Cryptocurrency", sub: "60+ coins, 24/7, cold storage", href: "/crypto" },
          { label: "Retirement Accounts", sub: "IRA, Roth IRA, SEP-IRA", href: "/retirement" },
          { label: "Options", sub: "$0.65/contract, 100+ strategies", href: "/products/options" },
          { label: "Futures", sub: "$0.85/contract, 30+ exchanges", href: "/products/futures" },
          { label: "Forex / Currencies", sub: "100+ pairs, 0.1 pip spreads", href: "/products/forex" },
          { label: "Bonds", sub: "1M+ bonds, 30+ countries", href: "/products/bonds" },
          { label: "Precious Metals", sub: "Gold, Silver, Platinum & more", href: "/products/precious-metals" },
        ],
      },
    ],
  },
  {
    label: "Accounts",
    sections: [
      {
        title: "FOR INDIVIDUALS",
        items: [
          { label: "Individual Accounts", href: "/accounts/individual" },
          { label: "IRA / Roth IRA", href: "/accounts/ira" },
          { label: "SEP-IRA", href: "/accounts/sep-ira" },
          { label: "401(k) Rollover", href: "/accounts/401k" },
          { label: "Joint Accounts", href: "/accounts/joint" },
          { label: "Trust Accounts", href: "/accounts/trust" },
        ],
      },
      {
        title: "FOR INSTITUTIONS",
        items: [
          { label: "Institutional", href: "/accounts/institutional" },
          { label: "Registered Investment Advisors", href: "/accounts/institutional" },
          { label: "Family Offices", href: "/accounts/institutional" },
          { label: "Hedge Funds", href: "/accounts/institutional" },
          { label: "Introducing Brokers", href: "/accounts/institutional" },
          { label: "Small Businesses", href: "/accounts/institutional" },
        ],
      },
    ],
    wide: true,
  },
  {
    label: "Pricing",
    sections: [
      {
        items: [
          { label: "Commission Rates", sub: "Starting at $0 on US stocks & ETFs", href: "/pricing/commissions" },
          { label: "Margin Rates", sub: "As low as USD 4.14%", href: "/pricing/margin-rates" },
          { label: "Interest on Cash", sub: "Earn up to USD 3.14% on cash", href: "/pricing/interest-on-cash" },
          { label: "Crypto Spreads", sub: "0.12–0.18% on notional", href: "/pricing/crypto-spreads" },
          { label: "No Hidden Fees", sub: "Full transparency guaranteed", href: "/pricing/no-hidden-fees" },
        ],
      },
    ],
  },
  {
    label: "Company",
    sections: [
      {
        items: [
          { label: "About Us", sub: "Our story, mission & leadership", href: "/about" },
          { label: "Security", sub: "How we protect your assets", href: "/security" },
          { label: "Careers", sub: "Join our global team", href: "/careers" },
          { label: "Press", sub: "Media resources & announcements", href: "/press" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Risk Disclosures", href: "/risk-disclosures" },
        ],
      },
    ],
  },
];

function NavDropdown({ nav, onClose }: { nav: typeof NAV[0]; onClose: () => void }) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: "absolute",
        top: "100%",
        left: nav.wide ? "-120px" : "0",
        background: "#fff",
        boxShadow: "0 12px 48px rgba(0,0,0,0.13)",
        border: "1px solid #e5e7eb",
        borderTop: "2px solid #c8102e",
        minWidth: nav.wide ? "640px" : "300px",
        zIndex: 200,
        padding: "28px 28px 24px",
        display: "flex",
        gap: "36px",
      }}>
      {nav.sections.map((sec, si) => (
        <div key={si} style={{ flex: 1, minWidth: 0 }}>
          {sec.title && (
            <div style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
              color: "#9ca3af", marginBottom: "14px", textTransform: "uppercase",
              paddingBottom: "10px", borderBottom: "1px solid #f3f4f6",
            }}>
              {sec.title}
            </div>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
            {sec.items.map((item, ii) => (
              <li key={ii}>
                <Link href={(item as any).href || "/"} onClick={onClose} style={{
                  display: "block", padding: "6px 0",
                  textDecoration: "none", color: "#1f2937",
                  fontSize: "13.5px", fontWeight: 500,
                  transition: "color 0.12s",
                  lineHeight: 1.4,
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#c8102e")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#1f2937")}>
                  {item.label}
                  {(item as any).sub && (
                    <span style={{ display: "block", fontSize: "11.5px", color: "#9ca3af", fontWeight: 400, marginTop: "1px" }}>
                      {(item as any).sub}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function HomeNavbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header ref={navRef} style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff" }}>
      {/* Announcement bar */}
      <div style={{
        background: "#0f2d52", color: "#fff", padding: "8px 24px",
        fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "12px", flexWrap: "wrap",
      }}>
        <span style={{ lineHeight: 1.4 }}>
          Will the highest price of Bitcoin exceed <strong>$130,000</strong> in 2026?&nbsp;
          <strong style={{ color: "#93c5fd" }}>Yes 11%</strong>,&nbsp;
          <strong style={{ color: "#fca5a5" }}>No 83%</strong>
        </span>
        <a href="/crypto" style={{
          background: "#1d6fc4", color: "#fff", fontSize: "12px", fontWeight: 700,
          padding: "3px 14px", textDecoration: "none", whiteSpace: "nowrap",
        }}>View Crypto Markets</a>
        <a href="/risk-disclosures" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", textDecoration: "underline" }}>Disclosure</a>
      </div>

      {/* Top row: Logo + actions */}
      <div style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 200, height: "auto", display: "block", mixBlendMode: "multiply" }} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {searchOpen ? (
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", padding: "7px 12px", gap: "8px", background: "#fafafa" }}>
                <Search size={15} color="#6b7280" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..." style={{ border: "none", outline: "none", fontSize: "13px", color: "#111", width: "180px", background: "transparent" }} />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                  <X size={14} color="#6b7280" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" }}>
                <Search size={19} color="#374151" />
              </button>
            )}
            <Link href="/login" style={{
              fontSize: "14px", fontWeight: 600, color: "#111",
              textDecoration: "none", padding: "8px 18px",
              transition: "color 0.12s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c8102e")}
              onMouseLeave={e => (e.currentTarget.style.color = "#111")}>
              Log In
            </Link>
            <Link href="/register" style={{
              fontSize: "14px", fontWeight: 700, color: "#fff",
              background: "#c8102e", textDecoration: "none", padding: "9px 22px",
              transition: "background 0.12s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#a50d25")}
              onMouseLeave={e => (e.currentTarget.style.background = "#c8102e")}>
              Open Account
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row: Nav links */}
      <div style={{ borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "stretch", height: "44px" }}>
          {NAV.map(nav => (
            <div key={nav.label} style={{ position: "relative" }}>
              <button
                onMouseEnter={() => setOpenMenu(nav.label)}
                onClick={() => setOpenMenu(openMenu === nav.label ? null : nav.label)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "3px",
                  padding: "0 14px", height: "44px",
                  fontSize: "13.5px", fontWeight: 500,
                  color: openMenu === nav.label ? "#c8102e" : "#374151",
                  transition: "color 0.12s",
                  whiteSpace: "nowrap",
                  borderBottom: openMenu === nav.label ? "2px solid #c8102e" : "2px solid transparent",
                  marginBottom: "-1px",
                }}>
                {nav.label}
                <ChevronDown size={13} style={{ transform: openMenu === nav.label ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#9ca3af" }} />
              </button>
              {openMenu === nav.label && (
                <NavDropdown nav={nav} onClose={() => setOpenMenu(null)} />
              )}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* Language selector */}
          <button style={{
            background: "none", border: "1px solid #d1d5db", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "30px", height: "30px", alignSelf: "center",
            fontSize: "11px", fontWeight: 600, color: "#6b7280",
          }}>
            文A
          </button>
        </div>
      </div>
    </header>
  );
}
