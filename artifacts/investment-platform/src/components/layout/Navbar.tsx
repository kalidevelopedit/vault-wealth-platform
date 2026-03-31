import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-lg tracking-tighter">
              V
            </div>
            <span className="font-semibold text-lg tracking-tight">Vault Wealth</span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#assets" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Assets</Link>
            <Link href="#security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            <Link href="#insights" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Insights</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild variant="default" className="rounded-full px-6">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="default" className="rounded-full px-6">
                <Link href="/register">Open Account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
