import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  LineChart, 
  Wallet, 
  User, 
  LogOut,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LineChart, label: "Invest", href: "/invest" },
    { icon: ArrowRightLeft, label: "Markets", href: "/assets/crypto" },
    { icon: Wallet, label: "Wallet", href: "/wallet" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-lg tracking-tighter">
              V
            </div>
            <span className="font-semibold text-lg tracking-tight">Vault Wealth</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href) && (item.href !== "/assets/crypto" || location.startsWith("/assets"));
            return (
              <Link key={item.href} href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-lg tracking-tighter">
              V
            </div>
            <span className="font-semibold text-lg tracking-tight">Vault</span>
          </Link>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden border-t bg-card flex items-center justify-around px-2 py-2 sticky bottom-0 z-10 pb-safe">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.startsWith(item.href) && (item.href !== "/assets/crypto" || location.startsWith("/assets"));
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
          <Link href="/profile" className={`flex flex-col items-center p-2 rounded-lg ${location.startsWith('/profile') ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
