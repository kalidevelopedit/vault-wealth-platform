import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, TrendingUp, Wallet, User, LogOut, BarChart2, Bell, ChevronDown, Menu, X,
} from "lucide-react";

const TICKER_ITEMS = [
  { sym: "BTC/USD", price: "104,820.00", chg: "+2.34%", pos: true },
  { sym: "ETH/USD", price: "3,421.50",   chg: "+1.12%", pos: true },
  { sym: "SOL/USD", price: "182.40",     chg: "+5.67%", pos: true },
  { sym: "BNB/USD", price: "608.20",     chg: "-0.43%", pos: false },
  { sym: "AAPL",    price: "189.30",     chg: "+0.88%", pos: true },
  { sym: "NVDA",    price: "875.40",     chg: "+3.21%", pos: true },
  { sym: "XAU/USD", price: "2,348.80",   chg: "+0.52%", pos: true },
  { sym: "TSLA",    price: "178.50",     chg: "-1.34%", pos: false },
  { sym: "MSFT",    price: "415.20",     chg: "+0.67%", pos: true },
  { sym: "META",    price: "512.40",     chg: "+2.11%", pos: true },
];

function Ticker() {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const step = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts;
      const dt = ts - lastRef.current;
      lastRef.current = ts;
      setOffset(o => (o + dt * 0.04) % (TICKER_ITEMS.length * 160));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{
      height: 36, background: "#0a0d14", borderBottom: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden", display: "flex", alignItems: "center",
    }}>
      <div style={{ display: "flex", transform: `translateX(-${offset}px)`, willChange: "transform" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "0 24px",
            whiteSpace: "nowrap", width: 160, flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>{item.sym}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "monospace" }}>{item.price}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: item.pos ? "#26a17b" : "#ef4444" }}>{item.chg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AppLayoutProps { children: ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Overview",  href: "/dashboard" },
    { icon: TrendingUp,       label: "Trade",     href: "/invest" },
    { icon: BarChart2,        label: "Markets",   href: "/assets/crypto" },
    { icon: Wallet,           label: "Wallet",    href: "/wallet" },
    { icon: User,             label: "Profile",   href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/assets/crypto") return location.startsWith("/assets");
    return location.startsWith(href);
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
    : "U";
  const uid = user?.id ? `VW-${String(user.id).padStart(6, "0")}` : "VW-000000";

  const BG   = "#0b0e17";
  const SIDE = "#0d1020";
  const BORD = "rgba(255,255,255,0.06)";
  const MUTED= "rgba(255,255,255,0.3)";
  const TEXT = "rgba(255,255,255,0.88)";
  const BLUE = "#3b82f6";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${BORD}` }}>
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <img src="/logo-white.png" alt="INT Brokers"
            style={{ width: 140, height: "auto", display: "block", mixBlendMode: "screen" }} />
        </Link>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 6, textDecoration: "none",
                fontSize: 12, fontWeight: active ? 600 : 500,
                color: active ? "#fff" : MUTED,
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                borderLeft: `2px solid ${active ? BLUE : "transparent"}`,
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = "transparent"; }}}
            >
              <item.icon style={{ width: 14, height: 14, flexShrink: 0, color: active ? BLUE : undefined, opacity: active ? 1 : 0.5 }} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User row + sign out */}
      <div style={{ padding: "10px 8px", borderTop: `1px solid ${BORD}` }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 9, padding: "9px 10px",
          borderRadius: 6, background: "rgba(255,255,255,0.03)", marginBottom: 4,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff",
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.fullName || "User"}
            </div>
            <div style={{ fontSize: 9, color: MUTED, fontFamily: "monospace" }}>{uid}</div>
          </div>
          <ChevronDown size={11} color={MUTED} style={{ flexShrink: 0, marginLeft: "auto" }} />
        </div>
        <button onClick={logout} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 9,
          padding: "7px 10px", background: "none", border: "none",
          cursor: "pointer", color: MUTED, fontSize: 11, fontWeight: 500,
          borderRadius: 6, transition: "color 0.12s", letterSpacing: "0.01em",
        }}
          onMouseEnter={e => e.currentTarget.style.color = TEXT}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}
        >
          <LogOut style={{ width: 13, height: 13, opacity: 0.6 }} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex" }}>
      {/* ── Desktop Sidebar ── */}
      <aside style={{
        width: 190, background: SIDE, borderRight: `1px solid ${BORD}`,
        display: "flex", flexDirection: "column", height: "100vh",
        position: "sticky", top: 0, flexShrink: 0,
      }} className="hidden md:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, display: "flex",
        }} className="md:hidden">
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{
            position: "relative", width: 200, background: SIDE,
            borderRight: `1px solid ${BORD}`, display: "flex", flexDirection: "column",
            height: "100%", zIndex: 1,
          }}>
            <button onClick={() => setMobileOpen(false)} style={{
              position: "absolute", top: 12, right: 12,
              background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer",
              borderRadius: 6, padding: 5, color: MUTED,
            }}>
              <X size={14} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        {/* Mobile topbar */}
        <header className="md:hidden" style={{
          height: 48, background: SIDE, borderBottom: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 14px", position: "sticky", top: 0, zIndex: 100,
        }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <Menu size={18} />
          </button>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers"
              style={{ height: 36, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORD}`, borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell style={{ width: 13, height: 13, color: MUTED }} strokeWidth={1.5} />
            </button>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",
            }}>{initials}</div>
          </div>
        </header>

        {/* Ticker strip */}
        <Ticker />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden" style={{
          background: SIDE, borderTop: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "6px 4px 8px", position: "sticky", bottom: 0, zIndex: 50,
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "5px 10px", textDecoration: "none",
                color: active ? BLUE : "rgba(255,255,255,0.24)",
                transition: "color 0.12s",
              }}>
                <item.icon style={{ width: 17, height: 17 }} strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
