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
  ChevronRight,
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a1628] hidden md:flex flex-col h-screen sticky top-0 shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center shrink-0">
              <span className="text-[#0a1628] font-bold text-[10px] tracking-tighter">VW</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide uppercase">Vault Wealth</span>
          </Link>
        </div>

        {/* User pill */}
        <div className="px-4 py-3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 border border-white/15 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
              <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-white/30 text-[9px] font-semibold uppercase tracking-widest px-2 mb-3">Navigation</p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-2 py-2 text-xs font-medium transition-colors group ${
                  active
                    ? "bg-white/10 text-white border-l-2 border-white pl-[6px]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent pl-[6px]"
                }`}>
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/8">
          <button onClick={logout}
            className="flex items-center gap-3 px-2 py-2 text-xs font-medium text-white/40 hover:text-white/70 transition-colors w-full border-l-2 border-transparent pl-[6px]">
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden h-12 bg-[#0a1628] border-b border-white/8 flex items-center justify-between px-4 sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white flex items-center justify-center">
              <span className="text-[#0a1628] font-bold text-[9px] tracking-tighter">VW</span>
            </div>
            <span className="text-white font-semibold text-xs tracking-wide uppercase">Vault Wealth</span>
          </Link>
          <div className="w-7 h-7 bg-white/10 border border-white/15 flex items-center justify-center text-white text-xs font-semibold">
            {user?.fullName?.charAt(0) || "U"}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-[#0a1628] border-t border-white/8 flex items-center justify-around px-2 py-2 sticky bottom-0 z-10">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-1 p-2 ${active ? "text-white" : "text-white/40"}`}>
                <item.icon className="w-4 h-4" />
                <span className="text-[9px] font-medium uppercase tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
