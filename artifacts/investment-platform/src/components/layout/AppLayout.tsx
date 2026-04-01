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
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: TrendingUp, label: "Trade", href: "/invest" },
    { icon: BarChart2, label: "Markets", href: "/assets/crypto" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/assets/crypto") return location.startsWith("/assets");
    return location.startsWith(href);
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")
    : "U";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-52 bg-[#0d1520] hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <Link href="/">
            <img src="/logo.png" alt="INT Brokers" style={{ height: 110, width: "auto", objectFit: "contain", display: "block" }} />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-[12.5px] font-medium transition-colors rounded-[2px] ${
                  active
                    ? "text-white bg-white/[0.08]"
                    : "text-white/38 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "opacity-90" : "opacity-50"}`} strokeWidth={active ? 2 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <div className="px-3 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/70 text-[10px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-[11px] font-medium truncate leading-none mb-0.5">{user?.fullName || "User"}</p>
              <p className="text-white/28 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-medium text-white/28 hover:text-white/55 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden h-12 bg-[#0d1520] border-b border-white/[0.06] flex items-center justify-between px-4 sticky top-0 z-10">
          <Link href="/">
            <img src="/logo.png" alt="INT Brokers" style={{ height: 80, width: "auto", objectFit: "contain", display: "block" }} />
          </Link>
          <div className="w-7 h-7 bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white/70 text-xs font-semibold">
            {initials}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-[#0d1520] border-t border-white/[0.06] flex items-center justify-around px-2 py-2 sticky bottom-0 z-10">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 ${active ? "text-white/90" : "text-white/30"}`}
              >
                <item.icon className="w-4 h-4" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
