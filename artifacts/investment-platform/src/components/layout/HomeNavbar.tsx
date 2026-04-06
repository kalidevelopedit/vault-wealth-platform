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
          { label: "Lower Costs", sub: "Professional pricing for everyone", href: "/pricing" },
          { label: "Global Access", sub: "170+ markets worldwide", href: "/why-vault" },
          { label: "Premier Technology", sub: "Award-winning platforms", href: "/why-vault" },
          { label: "Strength & Security", sub: "$19.5B equity capital", href: "/security" },
          { label: "Awards", sub: "Industry recognition", href: "/why-vault" },
          { label: "Free Trial", href: "/register" },
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
          { label: "Stocks", href: "/assets/stocks" },
          { label: "ETFs", href: "/assets/stocks" },
          { label: "Options", href: "/invest" },
          { label: "Futures", href: "/invest" },
          { label: "Currencies / Forex", href: "/invest" },
          { label: "Bonds", href: "/invest" },
          { label: "Mutual Funds", href: "/invest" },
          { label: "Cryptocurrency", href: "/crypto" },
          { label: "Precious Metals", href: "/assets/commodities" },
        ],
      },
      {
        title: "TRADING TOOLS",
        items: [
          { label: "Smart Order Routing", href: "/why-vault" },
          { label: "Probability Lab", href: "/why-vault" },
          { label: "PortfolioAnalyst", href: "/why-vault" },
          { label: "GlobalAnalyst", href: "/why-vault" },
          { label: "Algorithmic Trading", href: "/why-vault" },
          { label: "100+ Order Types", href: "/why-vault" },
          { label: "Stock Screener", href: "/assets/stocks" },
          { label: "Options Screener", href: "/invest" },
        ],
      },
      {
        title: "SERVICES",
        items: [
          { label: "Bonds Marketplace", href: "/invest" },
          { label: "Mutual Funds Marketplace", href: "/invest" },
          { label: "No-Fee ETFs", href: "/assets/stocks" },
          { label: "Cash Management", href: "/pricing" },
          { label: "Stock Yield Enhancement", href: "/pricing" },
          { label: "Short Securities", href: "/invest" },
          { label: "Securities Financing", href: "/invest" },
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
          { label: "Vault Desktop", sub: "Advanced desktop trading", href: "/why-vault" },
          { label: "Client Portal", sub: "Web-based trading & account mgmt", href: "/dashboard" },
          { label: "Vault Mobile", sub: "Full-featured iOS & Android app", href: "/why-vault" },
          { label: "Vault API", sub: "Algorithmic & automated trading", href: "/why-vault" },
          { label: "ForecastTrader", sub: "Event contract trading", href: "/invest" },
        ],
      },
      {
        title: "TOOLS & ANALYTICS",
        items: [
          { label: "GlobalAnalyst", sub: "Global stock comparison", href: "/why-vault" },
          { label: "PortfolioAnalyst", sub: "Performance reporting", href: "/dashboard" },
          { label: "Risk Navigator", sub: "Portfolio risk management", href: "/why-vault" },
          { label: "Option Strategy Lab", href: "/invest" },
          { label: "Research & News", href: "/why-vault" },
          { label: "Free Trading Tools", href: "/why-vault" },
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
          { label: "Individual, Joint or IRA", href: "/register" },
          { label: "Retirement (IRA, Roth)", href: "/retirement" },
          { label: "Non-Professional Advisors", href: "/register" },
          { label: "Trust Accounts", href: "/register" },
          { label: "UGMA / UTMA Accounts", href: "/register" },
        ],
      },
      {
        title: "FOR INSTITUTIONS",
        items: [
          { label: "Institutions Home", href: "/register" },
          { label: "Registered Investment Advisors", href: "/register" },
          { label: "Family Offices", href: "/register" },
          { label: "Proprietary Trading Groups", href: "/register" },
          { label: "Hedge Funds", href: "/register" },
          { label: "Introducing Brokers", href: "/register" },
          { label: "Small Businesses", href: "/register" },
          { label: "Money Managers", href: "/register" },
        ],
      },
      {
        title: "ADMINISTRATIVE",
        items: [
          { label: "Compliance Officers", href: "/register" },
          { label: "Employee Plan Administrator", href: "/register" },
          { label: "Fund Administrators", href: "/register" },
          { label: "Hedge Fund Allocators", href: "/register" },
          { label: "Educators", href: "/register" },
          { label: "A Guide to Account Types", href: "/why-vault" },
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
          { label: "Commissions", sub: "Starting at $0 on US stocks & ETFs", href: "/pricing" },
          { label: "Margin Rates", sub: "As low as USD 4.14%", href: "/pricing" },
          { label: "Interest Rates", sub: "Earn up to USD 3.14% on cash", href: "/pricing" },
          { label: "Short Sale Cost", href: "/pricing" },
          { label: "Market Data Pricing", href: "/pricing" },
          { label: "Stock Yield Enhancement", href: "/pricing" },
          { label: "Other Fees", href: "/pricing" },
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
          { label: "Vault Campus", sub: "Courses and learning center", href: "/why-vault" },
          { label: "Traders' Academy", sub: "Structured curriculum", href: "/why-vault" },
          { label: "Traders' Insight", sub: "News and analysis", href: "/why-vault" },
          { label: "Webinars", sub: "Live and on-demand", href: "/why-vault" },
          { label: "Quant Blog", href: "/why-vault" },
          { label: "Podcasts", href: "/why-vault" },
        ],
      },
      {
        title: "RESOURCES",
        items: [
          { label: "Student Trading Lab", href: "/why-vault" },
          { label: "Vault Forum", href: "/why-vault" },
          { label: "Traders' Glossary", href: "/why-vault" },
          { label: "Traders' Calendar", href: "/why-vault" },
          { label: "Investors' Marketplace", href: "/invest" },
          { label: "Free Trial", href: "/register" },
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
          { label: "FeatureExplorer", href: "/why-vault" },
          { label: "Fund Your Account", href: "/wallet" },
          { label: "Support for Individuals", href: "/security" },
          { label: "Support for Institutions", href: "/security" },
          { label: "Institutional Sales Contacts", href: "/security" },
          { label: "Browse FAQs", href: "/why-vault" },
          { label: "Tax Information", href: "/pricing" },
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
        <a href="#" style={{
          background: "#1d6fc4", color: "#fff", fontSize: "12px", fontWeight: 700,
          padding: "3px 14px", textDecoration: "none", whiteSpace: "nowrap",
        }}>View Markets</a>
        <a href="#" style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", textDecoration: "underline" }}>Disclosure</a>
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
