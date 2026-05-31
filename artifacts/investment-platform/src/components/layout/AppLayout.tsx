import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard, BarChart2, Wallet, User, ArrowLeftRight,
  LogOut, Search, Shield, Settings, TrendingUp, Sun, Moon, X,
  MessageCircle,
} from "lucide-react";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

const WHATSAPP = "https://wa.me/18886555555?text=Hello%2C%20I%20need%20support%20with%20my%20account.";

interface AppLayoutProps { children: ReactNode; }

const BLUE = "#2563FF";

function NewsTicker({ bord, muted }: { bord: string; muted: string }) {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/market/news?limit=20")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHeadlines(data.map((n: any) => n.title)); })
      .catch(() => setHeadlines([
        "BTC/USD +2.4% — Bitcoin holds support level",
        "ETH rallies 3.1% ahead of EIP upgrade announcement",
        "Gold hits 6-month high at $2,380/oz amid macro uncertainty",
        "NVDA +4.2% after record AI chip revenue beat",
        "S&P 500 closes at all-time high for third straight week",
        "Fed signals rate pause — dollar weakens vs major peers",
      ]));
  }, []);

  if (!headlines.length) return null;
  const text = headlines.join("   •   ");

  return (
    <div style={{ height: 32, background: "rgba(37,99,255,0.06)", borderBottom: `1px solid ${bord}`, overflow: "hidden", display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", flexShrink: 0, borderRight: `1px solid ${bord}` }}>
        <TrendingUp style={{ width: 11, height: 11, color: BLUE }} strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, letterSpacing: "0.09em" }}>LIVE</span>
      </div>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{ display: "inline-block", whiteSpace: "nowrap", animation: "ticker-scroll 70s linear infinite", fontSize: 11.5, color: muted, letterSpacing: "0.01em" }}>
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const { mode, colors, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (q) { navigate(`/markets?q=${encodeURIComponent(q)}`); setSearchVal(""); }
  };

  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, headerBg: HEADER, sidebarBg: SIDE, active: ACTIVE, hover: HOVER, inputBg: INPUTBG } = colors;

  const navLinks = [
    { icon: LayoutDashboard, label: "Overview",  href: "/dashboard" },
    { icon: BarChart2,       label: "Markets",   href: "/markets" },
    { icon: Wallet,          label: "Wallet",    href: "/wallet" },
    { icon: ArrowLeftRight,  label: "Convert",   href: "/convert" },
    { icon: User,            label: "Profile",   href: "/profile" },
    { icon: Shield,          label: "Security",  href: "/account/security" },
    { icon: Settings,        label: "Settings",  href: "/settings" },
  ];

  // Bottom nav shows 5 items (mobile)
  const bottomNav = [
    { icon: LayoutDashboard, label: "Home",     href: "/dashboard" },
    { icon: BarChart2,       label: "Markets",  href: "/markets" },
    { icon: Wallet,          label: "Wallet",   href: "/wallet" },
    { icon: ArrowLeftRight,  label: "Convert",  href: "/convert" },
    { icon: User,            label: "Profile",  href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/markets") return location.startsWith("/markets") || location.startsWith("/assets");
    if (href === "/dashboard") return location === "/dashboard";
    return location.startsWith(href);
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
    : "U";
  const uid = user?.id ? `VW-${String(user.id).padStart(6, "0")}` : "VW-000000";

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", overflowX: "hidden", maxWidth: "100vw" }}>
      {/* ── News Ticker (desktop only) ── */}
      <div className="hidden md:block" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 101 }}>
        <NewsTicker bord={BORD} muted={MUTED} />
      </div>

      {/* ── Header — Desktop ── */}
      <header className="app-header hidden md:flex" style={{
        height: 110, background: HEADER,
        borderBottom: `1px solid ${BORD}`,
        alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        position: "fixed", left: 0, right: 0, zIndex: 100,
        boxShadow: mode === "light" ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{ height: 52, width: 180, overflow: "hidden", position: "relative", flexShrink: 0 }}>
              <img
                src={mode === "light" ? "/logo-dark.png" : "/logo-white.png"}
                alt="INT Brokers"
                style={{ height: 220, width: "auto", position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", display: "block" }}
                onError={e => { (e.target as HTMLImageElement).src = "/logo-white.png"; }}
              />
            </div>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[
              { label: "Markets", href: "/markets" },
              { label: "Portfolio", href: "/dashboard" },
              { label: "Wallet", href: "/wallet" },
              { label: "Convert", href: "/convert" },
            ].map(link => {
              const active = isActive(link.href);
              return (
                <Link key={link.label} href={link.href} style={{
                  fontSize: 13.5, fontWeight: 500, textDecoration: "none",
                  color: active ? TEXT : MUTED, transition: "color 0.12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = TEXT}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = MUTED; }}
                >{link.label}</Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            height: 34, width: 200, background: INPUTBG, borderRadius: 999, border: `1px solid ${BORD}`,
            display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
          }}>
            <Search style={{ width: 13, height: 13, color: MUTED, flexShrink: 0 }} strokeWidth={1.5} />
            <input
              ref={searchRef}
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search assets..."
              style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, width: "100%" }}
            />
          </form>

          {/* Live Support */}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" style={{
            height: 34, padding: "0 12px", borderRadius: 999,
            background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)",
            color: "#25D366", fontSize: 12.5, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            <MessageCircle style={{ width: 14, height: 14 }} strokeWidth={1.5} />
            Live Support
          </a>

          <button onClick={toggle} style={{
            width: 34, height: 34, borderRadius: 999, background: INPUTBG,
            border: `1px solid ${BORD}`, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            {mode === "dark"
              ? <Sun style={{ width: 15, height: 15, color: MUTED }} strokeWidth={1.5} />
              : <Moon style={{ width: 15, height: 15, color: MUTED }} strokeWidth={1.5} />}
          </button>
          <Link href="/wallet" style={{
            height: 34, padding: "0 14px", background: BLUE, color: "#fff",
            borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>Deposit</Link>
          <Link href="/profile" style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg,#1d4ed8,#2563FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", textDecoration: "none", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>{initials}</Link>
        </div>
      </header>

      {/* ── Header — Mobile ── */}
      <header className="app-header md:hidden" style={{
        height: 90, background: HEADER,
        borderBottom: `1px solid ${BORD}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        position: "fixed", left: 0, right: 0, zIndex: 100,
      }}>
        {/* Left: theme toggle */}
        <button onClick={toggle} style={{
          width: 34, height: 34, borderRadius: 999, background: INPUTBG,
          border: `1px solid ${BORD}`, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {mode === "dark"
            ? <Sun style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />
            : <Moon style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />}
        </button>

        {/* Center: Logo */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", flex: 1 }}>
          <div style={{ height: 50, width: 180, overflow: "hidden", position: "relative" }}>
            <img
              src={mode === "light" ? "/logo-dark.png" : "/logo-white.png"}
              alt="INT Brokers"
              style={{ height: 200, width: "auto", position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)", display: "block" }}
              onError={e => { (e.target as HTMLImageElement).src = "/logo-white.png"; }}
            />
          </div>
        </Link>

        {/* Right: avatar */}
        <Link href="/profile" style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg,#1d4ed8,#2563FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>{initials}</Link>
      </header>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1 }} className="app-main-layout">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex app-sidebar" style={{
          width: 232, background: SIDE, borderRight: `1px solid ${BORD}`,
          flexDirection: "column", position: "fixed", left: 0, overflowY: "auto",
        }}>
          {/* Nav groups */}
          <nav style={{ flex: 1, padding: "16px 12px 12px", display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Main */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: MUTED, padding: "8px 10px 6px", textTransform: "uppercase" }}>Main</div>
            {navLinks.slice(0, 4).map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.label} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "0 10px", height: 42, borderRadius: 10, textDecoration: "none",
                  fontSize: 13.5, fontWeight: active ? 600 : 450,
                  color: active ? TEXT : MUTED,
                  background: active ? ACTIVE : "transparent",
                  position: "relative", transition: "all 0.12s",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = HOVER; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; } }}
                >
                  {active && <span style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 2, background: colors.blue }} />}
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? colors.blue : MUTED }} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}

            {/* Account */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: MUTED, padding: "16px 10px 6px", textTransform: "uppercase" }}>Account</div>
            {navLinks.slice(4).map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.label} href={item.href} style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "0 10px", height: 42, borderRadius: 10, textDecoration: "none",
                  fontSize: 13.5, fontWeight: active ? 600 : 450,
                  color: active ? TEXT : MUTED,
                  background: active ? ACTIVE : "transparent",
                  position: "relative", transition: "all 0.12s",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = HOVER; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; } }}
                >
                  {active && <span style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 2, background: colors.blue }} />}
                  <item.icon style={{ width: 16, height: 16, flexShrink: 0, color: active ? colors.blue : MUTED }} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User card + logout */}
          <div style={{ padding: "12px", borderTop: `1px solid ${BORD}` }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 10px", borderRadius: 12,
              background: HOVER, marginBottom: 6,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#1d4ed8,#2563FF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em",
              }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.fullName || "User"}
                </div>
                <div style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", letterSpacing: "0.04em" }}>{uid}</div>
              </div>
            </div>
            <button onClick={logout} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "0 10px", height: 36, background: "none", border: "none",
              cursor: "pointer", color: MUTED, fontSize: 13, fontWeight: 500,
              borderRadius: 10, transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut style={{ width: 14, height: 14 }} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }} onClick={() => setSidebarOpen(false)} />
            <aside style={{
              position: "relative", width: 272, background: SIDE, borderRight: `1px solid ${BORD}`,
              display: "flex", flexDirection: "column", height: "100%", zIndex: 1,
              boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
            }}>
              {/* Drawer header */}
              <div style={{ padding: "0 20px", height: 68, borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ height: 44, width: 150, overflow: "hidden", position: "relative" }}>
                  <img src={mode === "light" ? "/logo-dark.png" : "/logo-white.png"} alt="INT Brokers"
                    style={{ height: 150, width: "auto", position: "absolute", top: "50%", left: 0, transform: "translateY(-50%)" }}
                    onError={e => { (e.target as HTMLImageElement).src = "/logo-white.png"; }} />
                </div>
                <button onClick={() => setSidebarOpen(false)} style={{
                  background: HOVER, border: `1px solid ${BORD}`, color: MUTED, cursor: "pointer",
                  width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <X style={{ width: 16, height: 16 }} strokeWidth={1.5} />
                </button>
              </div>

              {/* Nav */}
              <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: MUTED, padding: "4px 10px 8px", textTransform: "uppercase" }}>Main</div>
                {navLinks.slice(0, 4).map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "0 12px", height: 48, borderRadius: 12, textDecoration: "none",
                      fontSize: 14, fontWeight: active ? 600 : 450,
                      color: active ? TEXT : MUTED,
                      background: active ? ACTIVE : "transparent",
                      position: "relative",
                    }}>
                      {active && <span style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 2, background: colors.blue }} />}
                      <item.icon style={{ width: 18, height: 18, color: active ? colors.blue : MUTED }} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: MUTED, padding: "14px 10px 8px", textTransform: "uppercase" }}>Account</div>
                {navLinks.slice(4).map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "0 12px", height: 48, borderRadius: 12, textDecoration: "none",
                      fontSize: 14, fontWeight: active ? 600 : 450,
                      color: active ? TEXT : MUTED,
                      background: active ? ACTIVE : "transparent",
                      position: "relative",
                    }}>
                      {active && <span style={{ position: "absolute", left: 0, top: "25%", bottom: "25%", width: 3, borderRadius: 2, background: colors.blue }} />}
                      <item.icon style={{ width: 18, height: 18, color: active ? colors.blue : MUTED }} strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* User card */}
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORD}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: HOVER, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#1d4ed8,#2563FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || "User"}</div>
                    <div style={{ fontSize: 10.5, color: MUTED, fontFamily: "monospace" }}>{uid}</div>
                  </div>
                </div>
                <button onClick={() => { setSidebarOpen(false); logout(); }} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "0 12px", height: 42, background: "none", border: "none",
                  cursor: "pointer", color: MUTED, fontSize: 14, borderRadius: 10, fontWeight: 500,
                  transition: "all 0.12s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
                >
                  <LogOut style={{ width: 16, height: 16 }} strokeWidth={1.5} /> Sign out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 md:ml-[232px]" style={{
          background: BG,
          minHeight: "calc(100vh - 60px)",
          paddingBottom: 72, // space for mobile bottom nav
          overflowX: "hidden",
          maxWidth: "100%",
        }}>
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        height: 64, background: HEADER,
        borderTop: `1px solid ${BORD}`,
        display: "flex", alignItems: "stretch",
        boxShadow: mode === "light" ? "0 -2px 12px rgba(0,0,0,0.06)" : "0 -1px 0 rgba(255,255,255,0.04)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {bottomNav.map(item => {
          const active = isActive(item.href);
          return (
            <Link key={item.label} href={item.href} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, textDecoration: "none",
              color: active ? colors.blue : MUTED,
              background: "transparent", transition: "color 0.1s",
            }}>
              <item.icon style={{ width: 21, height: 21 }} strokeWidth={active ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <PwaInstallBanner />

      <style>{`
        @keyframes ticker-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        /* Mobile: 90px header */
        .app-main-layout { margin-top: 90px; }
        .app-header { top: 0 !important; }
        .app-sidebar { top: 90px !important; height: calc(100vh - 90px) !important; }
        /* Desktop: 32px ticker + 110px header = 142px */
        @media (min-width: 768px) {
          .app-main-layout { margin-top: 142px; }
          .app-header { top: 32px !important; }
          .app-sidebar { top: 142px !important; height: calc(100vh - 142px) !important; width: 232px !important; }
        }
      `}</style>
    </div>
  );
}
