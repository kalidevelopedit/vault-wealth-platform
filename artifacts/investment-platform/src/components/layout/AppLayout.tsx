import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, BarChart2, Wallet, User, LogOut, Search, Menu, X, Shield, Settings,
  ArrowDownToLine, Bell
} from "lucide-react";

interface AppLayoutProps { children: ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const topNavLinks = [
    { label: "Markets", href: "/markets" },
    { label: "Portfolio", href: "/dashboard" },
    { label: "Wallet", href: "/wallet" },
    { label: "Trade", href: "/invest" },
    { label: "Account", href: "/profile" },
  ];

  const sideNavLinks = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: BarChart2, label: "Markets", href: "/markets" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Shield, label: "Security", href: "/account/security" },
    { icon: Settings, label: "Settings", href: "/profile" }, // maps to profile for now
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

  const BG   = "#050505";
  const SIDE = "#050505";
  const BORD = "rgba(255,255,255,0.08)";
  const MUTED= "rgba(255,255,255,0.45)";
  const TEXT = "rgba(255,255,255,0.96)";
  const BLUE = "#2563FF";

  const SidebarContent = () => (
    <>
      <nav style={{ flex: 1, padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {sideNavLinks.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.label} href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "0 14px", height: 48, borderRadius: 14, textDecoration: "none",
                fontSize: 14, fontWeight: 500,
                color: active ? TEXT : MUTED,
                background: active ? "#191F28" : "transparent",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}}
            >
              <item.icon style={{ width: 18, height: 18, flexShrink: 0, color: active ? TEXT : MUTED }} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ padding: "16px", borderTop: `1px solid ${BORD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "0 8px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "#191F28", border: `1px solid ${BORD}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: TEXT,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.fullName || "User"}
            </div>
            <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{uid}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "0 14px", height: 40, background: "none", border: "none",
          cursor: "pointer", color: MUTED, fontSize: 13, fontWeight: 500,
          borderRadius: 12, transition: "color 0.12s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}
        >
          <LogOut style={{ width: 16, height: 16 }} strokeWidth={1.5} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* ── Top Navigation Bar ── */}
      <header style={{
        height: 64, background: "#0A0A0A", borderBottom: `1px solid ${BORD}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        {/* Left side */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <img src="/logo-white.png" alt="Vault Wealth" style={{ height: 20, width: "auto", objectFit: "contain" }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {topNavLinks.map(link => {
              const active = isActive(link.href);
              return (
                <Link key={link.label} href={link.href} style={{
                  fontSize: 14, fontWeight: 500, textDecoration: "none",
                  color: active ? TEXT : MUTED,
                  transition: "color 0.12s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = TEXT}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = MUTED; }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className="hidden lg:flex" style={{
            height: 36, width: 200, background: "#11141A", borderRadius: 999, border: `1px solid ${BORD}`,
            display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
          }}>
            <Search style={{ width: 14, height: 14, color: MUTED }} strokeWidth={1.5} />
            <input type="text" placeholder="Coin, Stock, etc" style={{
              background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, width: "100%",
            }} />
          </div>
          <Link href="/wallet" style={{
            height: 36, padding: "0 16px", background: BLUE, color: "#fff",
            borderRadius: 999, fontSize: 13, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s",
          }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Deposit
          </Link>
          <Link href="/wallet" className="hidden sm:block" style={{ fontSize: 14, fontWeight: 500, color: MUTED, textDecoration: "none" }}>Wallets</Link>
          <Link href="/profile" style={{
            width: 32, height: 32, borderRadius: "50%", background: "#11141A", border: `1px solid ${BORD}`,
            display: "flex", alignItems: "center", justifyContent: "center", color: TEXT, textDecoration: "none",
          }}>
            <User style={{ width: 16, height: 16 }} strokeWidth={1.5} />
          </Link>
          <button className="md:hidden" onClick={() => setMobileOpen(true)} style={{
            background: "none", border: "none", color: TEXT, cursor: "pointer", padding: 4, display: "flex"
          }}>
            <Menu style={{ width: 24, height: 24 }} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, marginTop: 64 }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex" style={{
          width: 240, background: SIDE, borderRight: `1px solid ${BORD}`,
          flexDirection: "column", height: "calc(100vh - 64px)", position: "fixed", left: 0, top: 64,
        }}>
          <SidebarContent />
        </aside>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div className="md:hidden" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)" }} onClick={() => setMobileOpen(false)} />
            <aside style={{
              position: "relative", width: 260, background: "#0A0A0A", borderRight: `1px solid ${BORD}`,
              display: "flex", flexDirection: "column", height: "100%", zIndex: 1,
            }}>
              <div style={{ height: 64, borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
                <img src="/logo-white.png" alt="Vault" style={{ height: 16 }} />
                <button onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}>
                  <X style={{ width: 20, height: 20 }} strokeWidth={1.5} />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 md:ml-[240px]" style={{ background: BG, minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
