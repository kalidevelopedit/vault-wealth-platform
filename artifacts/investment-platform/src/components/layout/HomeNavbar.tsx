import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, ChevronDown, Zap, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
        top: "calc(100% + 8px)",
        left: nav.wide ? "-120px" : "0",
        background: "#fff",
        boxShadow: "0 16px 56px rgba(0,0,0,0.14)",
        border: "1px solid #e5e7eb",
        borderTop: "2px solid #0d1520",
        borderRadius: "0 0 16px 16px",
        minWidth: nav.wide ? "640px" : "300px",
        zIndex: 200,
        padding: "24px 28px 20px",
        display: "flex",
        gap: "36px",
      }}>
      {nav.sections.map((sec, si) => (
        <div key={si} style={{ flex: 1, minWidth: 0 }}>
          {(sec as any).title && (
            <div style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
              color: "#9ca3af", marginBottom: "14px", textTransform: "uppercase",
              paddingBottom: "10px", borderBottom: "1px solid #f3f4f6",
            }}>
              {(sec as any).title}
            </div>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
            {sec.items.map((item, ii) => (
              <li key={ii}>
                <Link href={(item as any).href || "/"} onClick={onClose} style={{
                  display: "block", padding: "7px 10px",
                  textDecoration: "none", color: "#374151",
                  fontSize: "13.5px", fontWeight: 500,
                  borderRadius: 8,
                  transition: "color 0.12s, background 0.12s",
                  lineHeight: 1.4,
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#0d1520"; e.currentTarget.style.background = "#f9fafb"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}>
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
  const [demoLoading, setDemoLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await login({ email: "demo@vestplatform.com", password: "demo1234" });
      setLocation("/dashboard");
    } catch {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function handleScroll() { setScrolled(window.scrollY > 4); }
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { document.removeEventListener("mousedown", handleClick); window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <header ref={navRef} style={{
      position: "sticky", top: 0, zIndex: 100, background: "#fff",
      boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      transition: "box-shadow 0.2s",
    }}>
      {/* ── Announcement bar ── */}
      <div style={{
        background: "linear-gradient(90deg,#0a1e3a,#0f2d52,#0a1e3a)",
        color: "#fff", padding: "9px 24px",
        fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center",
        gap: "14px", flexWrap: "wrap",
      }}>
        <span style={{ lineHeight: 1.4, color: "rgba(255,255,255,0.85)" }}>
          Will the highest price of Bitcoin exceed <strong style={{ color: "#fff" }}>$130,000</strong> in 2026?&nbsp;
          <span style={{ color: "#86efac", fontWeight: 600 }}>Yes 11%</span>,&nbsp;
          <span style={{ color: "#fca5a5", fontWeight: 600 }}>No 83%</span>
        </span>
        <a href="/crypto" style={{
          background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "12px", fontWeight: 700,
          padding: "4px 14px", textDecoration: "none", whiteSpace: "nowrap",
          borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
        >View Crypto Markets</a>
        <a href="/risk-disclosures" style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>Disclosure</a>
      </div>

      {/* ── Top row: Logo + actions ── */}
      <div style={{ borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "66px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src="/logo-dark.png" alt="INT Brokers" style={{ height: 56, width: "auto", display: "block" }} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {searchOpen ? (
              <div style={{
                display: "flex", alignItems: "center", border: "1.5px solid #d1d5db",
                padding: "7px 14px", gap: "8px", background: "#fafafa",
                borderRadius: 10, boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
              }}>
                <Search size={14} color="#6b7280" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search markets, products…" style={{
                    border: "none", outline: "none", fontSize: "13px", color: "#111",
                    width: "200px", background: "transparent",
                  }} />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", borderRadius: 4 }}>
                  <X size={14} color="#6b7280" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "8px",
                display: "flex", alignItems: "center", borderRadius: 8,
                transition: "background 0.12s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <Search size={18} color="#374151" />
              </button>
            )}

            {/* DEMO button */}
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: "12px", fontWeight: 700,
                color: "#92400e",
                background: demoLoading
                  ? "rgba(245,158,11,0.06)"
                  : "linear-gradient(135deg,rgba(245,158,11,0.10),rgba(251,191,36,0.12))",
                border: "1.5px solid rgba(245,158,11,0.40)",
                padding: "7px 16px",
                borderRadius: 10,
                cursor: demoLoading ? "wait" : "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                transition: "all 0.14s",
                boxShadow: demoLoading ? "none" : "0 0 10px rgba(245,158,11,0.15)",
              }}
              onMouseEnter={e => !demoLoading && (e.currentTarget.style.boxShadow = "0 0 18px rgba(245,158,11,0.30)")}
              onMouseLeave={e => !demoLoading && (e.currentTarget.style.boxShadow = "0 0 10px rgba(245,158,11,0.15)")}
            >
              <Zap size={12} color="#d97706" strokeWidth={2.5} />
              {demoLoading ? "Loading…" : "Demo"}
            </button>

            <Link href="/login" style={{
              fontSize: "14px", fontWeight: 600, color: "#374151",
              textDecoration: "none", padding: "8px 16px", borderRadius: 10,
              transition: "color 0.12s, background 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#0d1520"; e.currentTarget.style.background = "#f3f4f6"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}>
              Log In
            </Link>

            <Link href="/register" style={{
              fontSize: "14px", fontWeight: 700, color: "#fff",
              background: "#0d1520", textDecoration: "none", padding: "10px 22px",
              borderRadius: 10, transition: "background 0.12s, transform 0.12s",
              whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(13,21,32,0.18)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a2d4a"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0d1520"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              Open Account
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom row: Nav links ── */}
      <div style={{ borderBottom: "1px solid #e9eaec" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "stretch", height: "44px" }}>
          {NAV.map(nav => (
            <div key={nav.label} style={{ position: "relative" }}>
              <button
                onMouseEnter={() => setOpenMenu(nav.label)}
                onClick={() => setOpenMenu(openMenu === nav.label ? null : nav.label)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "0 14px", height: "44px",
                  fontSize: "13px", fontWeight: 500,
                  color: openMenu === nav.label ? "#0d1520" : "#4b5563",
                  transition: "color 0.12s",
                  whiteSpace: "nowrap",
                  borderBottom: openMenu === nav.label ? "2px solid #0d1520" : "2px solid transparent",
                  marginBottom: "-1px",
                }}>
                {nav.label}
                <ChevronDown size={12} style={{ transform: openMenu === nav.label ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#9ca3af" }} />
              </button>
              {openMenu === nav.label && (
                <NavDropdown nav={nav} onClose={() => setOpenMenu(null)} />
              )}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* Language selector */}
          <button style={{
            background: "none", border: "1px solid #e5e7eb",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 5, alignSelf: "center", padding: "5px 10px", borderRadius: 8,
            fontSize: "11.5px", fontWeight: 600, color: "#6b7280",
            transition: "border-color 0.12s, background 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#f9fafb"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "none"; }}
          >
            <Globe size={13} color="#6b7280" />
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
