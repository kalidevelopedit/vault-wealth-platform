import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  User,
  LogOut,
  BarChart2,
  Bell,
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

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

  return (
    <div style={{ minHeight: "100vh", background: "#0c0f1a", display: "flex" }}>
      {/* ── Sidebar (desktop) ── */}
      <aside style={{
        width: 210, background: "#0d1020", borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0,
        flexShrink: 0,
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers"
              style={{ width: 155, height: "auto", display: "block", mixBlendMode: "screen" }} />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.35)",
                background: active ? "rgba(59,130,246,0.12)" : "transparent",
                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
                transition: "all 0.14s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
              >
                <item.icon
                  style={{ width: 15, height: 15, opacity: active ? 0.9 : 0.5, flexShrink: 0, color: active ? "#3b82f6" : undefined }}
                  strokeWidth={active ? 2 : 1.5}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Sign out */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            marginBottom: 6,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                {user?.fullName || "User"}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {uid}
              </p>
            </div>
          </div>
          <button onClick={logout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", background: "none", border: "none",
            cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 12, fontWeight: 500,
            borderRadius: 8, transition: "color 0.14s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
          >
            <LogOut style={{ width: 14, height: 14, opacity: 0.6 }} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        {/* Mobile top bar */}
        <header className="md:hidden" style={{
          height: 52, background: "#0d1020", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", position: "sticky", top: 0, zIndex: 50,
        }}>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers"
              style={{ height: 40, width: "auto", objectFit: "contain", display: "block", mixBlendMode: "screen" }} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} strokeWidth={1.5} />
            </button>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              {initials}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden" style={{
          background: "#0d1020", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          padding: "8px 4px 10px", position: "sticky", bottom: 0, zIndex: 50,
        }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "6px 12px", textDecoration: "none",
                color: active ? "#3b82f6" : "rgba(255,255,255,0.28)",
                transition: "color 0.14s",
              }}>
                <item.icon style={{ width: 18, height: 18 }} strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
