import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Search, X, ChevronDown } from "lucide-react";

const NAV = [
  {
    label: "Why Vault",
    sections: [
      {
        items: [
          { label: "Why Vault Wealth", sub: "Overview of our advantages" },
          { label: "Lower Costs", sub: "Professional pricing for everyone" },
          { label: "Global Access", sub: "170+ markets worldwide" },
          { label: "Premier Technology", sub: "Award-winning platforms" },
          { label: "Strength & Security", sub: "$19.5B equity capital" },
          { label: "Awards", sub: "Industry recognition" },
          { label: "Free Trial" },
        ],
      },
    ],
  },
  {
    label: "Products",
    wide: true,
    sections: [
      {
        title: "SECURITIES",
        items: [
          { label: "Stocks" },
          { label: "ETFs" },
          { label: "Options" },
          { label: "Futures" },
          { label: "Currencies / Forex" },
          { label: "Bonds" },
          { label: "Mutual Funds" },
          { label: "Cryptocurrency" },
          { label: "Precious Metals" },
        ],
      },
      {
        title: "TRADING TOOLS",
        items: [
          { label: "Smart Order Routing" },
          { label: "Probability Lab" },
          { label: "PortfolioAnalyst" },
          { label: "GlobalAnalyst" },
          { label: "Algorithmic Trading" },
          { label: "100+ Order Types" },
          { label: "Stock Screener" },
          { label: "Options Screener" },
        ],
      },
      {
        title: "SERVICES",
        items: [
          { label: "Bonds Marketplace" },
          { label: "Mutual Funds Marketplace" },
          { label: "No-Fee ETFs" },
          { label: "Cash Management" },
          { label: "Stock Yield Enhancement" },
          { label: "Short Securities" },
          { label: "Securities Financing" },
        ],
      },
    ],
  },
  {
    label: "Platforms",
    sections: [
      {
        title: "TRADING PLATFORMS",
        items: [
          { label: "Vault Desktop", sub: "Advanced desktop trading" },
          { label: "Client Portal", sub: "Web-based trading & account mgmt" },
          { label: "Vault Mobile", sub: "Full-featured iOS & Android app" },
          { label: "Vault API", sub: "Algorithmic & automated trading" },
          { label: "ForecastTrader", sub: "Event contract trading" },
        ],
      },
      {
        title: "TOOLS & ANALYTICS",
        items: [
          { label: "GlobalAnalyst", sub: "Global stock comparison" },
          { label: "PortfolioAnalyst", sub: "Performance reporting" },
          { label: "Risk Navigator", sub: "Portfolio risk management" },
          { label: "Option Strategy Lab" },
          { label: "Research & News" },
          { label: "Free Trading Tools" },
        ],
      },
    ],
  },
  {
    label: "Accounts",
    wide: true,
    sections: [
      {
        title: "FOR INDIVIDUALS",
        items: [
          { label: "Individual, Joint or IRA" },
          { label: "Retirement (IRA, Roth)" },
          { label: "Non-Professional Advisors" },
          { label: "Trust Accounts" },
          { label: "UGMA / UTMA Accounts" },
        ],
      },
      {
        title: "FOR INSTITUTIONS",
        items: [
          { label: "Institutions Home" },
          { label: "Registered Investment Advisors" },
          { label: "Family Offices" },
          { label: "Proprietary Trading Groups" },
          { label: "Hedge Funds" },
          { label: "Introducing Brokers" },
          { label: "Small Businesses" },
          { label: "Money Managers" },
        ],
      },
      {
        title: "ADMINISTRATIVE",
        items: [
          { label: "Compliance Officers" },
          { label: "Employee Plan Administrator" },
          { label: "Fund Administrators" },
          { label: "Hedge Fund Allocators" },
          { label: "Educators" },
          { label: "A Guide to Account Types" },
        ],
      },
    ],
  },
  {
    label: "Pricing",
    sections: [
      {
        title: "PRICING",
        items: [
          { label: "Commissions", sub: "Starting at $0 on US stocks & ETFs" },
          { label: "Margin Rates", sub: "As low as USD 4.14%" },
          { label: "Interest Rates", sub: "Earn up to USD 3.14% on cash" },
          { label: "Short Sale Cost" },
          { label: "Market Data Pricing" },
          { label: "Stock Yield Enhancement" },
          { label: "Other Fees" },
        ],
      },
    ],
  },
  {
    label: "Education",
    wide: true,
    sections: [
      {
        title: "LEARN",
        items: [
          { label: "Vault Campus", sub: "Courses and learning center" },
          { label: "Traders' Academy", sub: "Structured curriculum" },
          { label: "Traders' Insight", sub: "News and analysis" },
          { label: "Webinars", sub: "Live and on-demand" },
          { label: "Quant Blog" },
          { label: "Podcasts" },
        ],
      },
      {
        title: "RESOURCES",
        items: [
          { label: "Student Trading Lab" },
          { label: "Vault Forum" },
          { label: "Traders' Glossary" },
          { label: "Traders' Calendar" },
          { label: "Investors' Marketplace" },
          { label: "Free Trial" },
        ],
      },
    ],
  },
  {
    label: "Support",
    sections: [
      {
        title: "SUPPORT",
        items: [
          { label: "FeatureExplorer" },
          { label: "Fund Your Account" },
          { label: "Support for Individuals" },
          { label: "Support for Institutions" },
          { label: "Institutional Sales Contacts" },
          { label: "Browse FAQs" },
          { label: "Tax Information" },
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
        minWidth: nav.wide ? "680px" : "280px",
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
                <a href="#" onClick={onClose} style={{
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
                </a>
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
        <a href="#" style={{
          background: "#1d6fc4", color: "#fff", fontSize: "12px", fontWeight: 700,
          padding: "3px 14px", textDecoration: "none", whiteSpace: "nowrap",
        }}>View Markets</a>
        <a href="#" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", textDecoration: "underline" }}>Disclosure</a>
      </div>

      {/* Top row: Logo + actions */}
      <div style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", background: "#c8102e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontSize: "17px", fontWeight: 900, lineHeight: 1 }}>V</span>
            </div>
            <span style={{ fontSize: "21px", color: "#111", lineHeight: 1, letterSpacing: "-0.02em" }}>
              <strong style={{ fontWeight: 900 }}>Vault</strong>
              <span style={{ fontWeight: 300 }}> Wealth</span>
            </span>
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
