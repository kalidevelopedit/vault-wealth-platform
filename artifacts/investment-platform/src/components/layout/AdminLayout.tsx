import { ReactNode, useEffect, useState, Component } from "react";
import { Link, useLocation } from "wouter";
import { Users, LogOut, LayoutDashboard, Menu, X, Shield, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users",      icon: Users,           label: "Users & KYC" },
  { href: "/admin/settings",   icon: Settings,        label: "Settings" },
];

const SB_BG   = "#0f1221";
const SB_BORD = "rgba(255,255,255,0.06)";
const MUTED   = "rgba(255,255,255,0.38)";
const TEXT    = "rgba(255,255,255,0.92)";
const BLUE    = "#3b82f6";

function NavItem({ href, icon: Icon, label, active, onClick }: {
  href: string; icon: any; label: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
        borderRadius: 12, fontSize: 13.5, fontWeight: active ? 600 : 500,
        textDecoration: "none", transition: "all 0.15s",
        background: active ? `rgba(59,130,246,0.14)` : "transparent",
        color: active ? "#fff" : MUTED,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? `rgba(59,130,246,0.2)` : "rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}>
        <Icon size={15} strokeWidth={active ? 2 : 1.6} color={active ? BLUE : MUTED} />
      </div>
      {label}
    </Link>
  );
}

function Sidebar({ location, onClose, onLogout }: { location: string; onClose?: () => void; onLogout: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <aside style={{
      width: 260, background: SB_BG, borderRight: `1px solid ${SB_BORD}`,
      display: "flex", flexDirection: "column", height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${SB_BORD}` }}>
        <Logo variant="white" height={30} />
      </div>

      {/* Admin greeting */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12,
        }}>
          <Shield size={20} color={BLUE} strokeWidth={1.5} />
        </div>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", marginBottom: 4 }}>{dateStr}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, lineHeight: 1.25 }}>Admin Portal</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>INT Brokers Platform</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {NAV.map(({ href, icon, label }) => {
          const active = href === "/admin/dashboard"
            ? location === href
            : location.startsWith(href);
          return <NavItem key={href} href={href} icon={icon} label={label} active={active} onClick={onClose} />;
        })}
      </nav>

      {/* Exit */}
      <div style={{ padding: "16px 12px 24px", borderTop: `1px solid ${SB_BORD}` }}>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 16px",
          borderRadius: 12, background: "transparent", border: "none", cursor: "pointer",
          fontSize: 13.5, fontWeight: 500, color: MUTED,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)", flexShrink: 0,
          }}>
            <LogOut size={15} strokeWidth={1.6} color={MUTED} />
          </div>
          Exit Admin
        </button>
      </div>
    </aside>
  );
}

class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(err: any) {
    return { hasError: true, message: err?.message || "Unknown error" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "60px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Something went wrong loading this page.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginBottom: 24, wordBreak: "break-all", maxWidth: 480, margin: "0 auto 24px" }}>{this.state.message}</div>
          <button onClick={() => this.setState({ hasError: false, message: "" })}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuthenticated");
    if (!isAuth && location !== "/admin") setLocation("/admin");
  }, [location, setLocation]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setLocation("/admin");
  };

  if (location === "/admin") return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col" style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <Sidebar location={location} onLogout={handleLogout} />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ background: "rgba(0,0,0,0.7)", position: "absolute", inset: 0, backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column" }}>
            <Sidebar location={location} onClose={() => setMobileOpen(false)} onLogout={handleLogout} />
            <button onClick={() => setMobileOpen(false)} style={{
              position: "absolute", top: 18, right: -44, background: "rgba(255,255,255,0.1)",
              border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#fff",
            }}>
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minWidth: 0 }}>
        {/* Mobile top bar */}
        <header className="flex lg:hidden items-center gap-3 px-4"
          style={{ height: 60, background: SB_BG, borderBottom: `1px solid ${SB_BORD}`, flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setMobileOpen(true)}
            style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
            <Menu size={18} />
          </button>
          <Logo variant="white" height={26} />
        </header>

        <main style={{ flex: 1, padding: "32px 28px 64px" }} className="sm:px-6 lg:px-10">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
