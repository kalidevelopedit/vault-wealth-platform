import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, LogOut, LayoutDashboard, Menu } from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users & KYC" },
];

function Sidebar({ location, onClose, onLogout }: { location: string; onClose?: () => void; onLogout: () => void }) {
  return (
    <aside style={{ width: 240, background: "#0d1520", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <img src="/logo-white.png" alt="INT Brokers" style={{ width: 160, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "screen" }} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 6 }}>Admin Portal</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/admin/dashboard" ? location === href : location.startsWith(href);
          return (
            <Link key={href} href={href}
              onClick={onClose}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
            borderRadius: 10, fontSize: 13, fontWeight: 600, background: "transparent",
            color: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer",
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Exit Admin
        </button>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuthenticated");
    if (!isAuth && location !== "/admin") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setLocation("/admin");
  };

  if (location === "/admin") return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#080c14", fontFamily: "'Inter',system-ui,sans-serif" }} className="flex">

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col" style={{ position: "sticky", top: 0, height: "100vh" }}>
        <Sidebar location={location} onLogout={handleLogout} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ background: "rgba(0,0,0,0.65)", position: "absolute", inset: 0 }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Sidebar location={location} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Mobile top bar */}
        <header className="flex md:hidden items-center gap-3 px-4 sticky top-0 z-20"
          style={{ height: 56, background: "#0d1520", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: 4 }}>
            <Menu size={20} />
          </button>
          <img src="/logo-white.png" alt="INT Brokers" style={{ width: 130, height: "auto", mixBlendMode: "screen" }} />
        </header>

        <div style={{ flex: 1, padding: "28px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
