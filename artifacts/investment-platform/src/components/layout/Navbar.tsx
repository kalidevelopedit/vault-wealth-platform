import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d1520] border-b border-white/8">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <span className="text-[#0a1628] font-bold text-xs tracking-tighter">VW</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide uppercase">Vault Wealth</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            {["Solutions", "Markets", "Security", "Insights"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-xs font-medium text-white/50 hover:text-white/90 transition-colors tracking-wide uppercase">
                {item}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard"
              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 transition-colors tracking-wide uppercase">
              Go to Platform
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-xs font-medium text-white/70 hover:text-white transition-colors tracking-wide uppercase hidden sm:block">
                Sign In
              </Link>
              <Link href="/register"
                className="text-xs font-semibold text-[#0a1628] bg-white hover:bg-white/90 px-5 py-2 transition-colors tracking-wide uppercase">
                Open Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
