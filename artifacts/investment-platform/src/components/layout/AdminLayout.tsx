import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Users, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

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
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-900 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Admin Ops</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location === '/admin/dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${location.startsWith('/admin/users') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <Users className="w-4 h-4" /> Users & KYC
          </Link>
        </nav>
        
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Exit Admin
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b bg-card flex items-center px-8 sticky top-0 z-10">
          <h2 className="font-medium">Ops Center</h2>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
