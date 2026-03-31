import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Search, ChevronDown, X, Menu } from "lucide-react";

const NAV_ITEMS = [
  { label: "Why Vault", href: "#why" },
  { label: "Products", href: "#products" },
  { label: "Platforms", href: "#platforms" },
  { label: "Accounts", href: "#accounts" },
  { label: "Pricing", href: "#pricing" },
  { label: "Education", href: "#learn" },
  { label: "Support", href: "#support" },
];

export function HomeNavbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#1a3a6b] text-white text-center py-2 px-4">
        <p className="text-xs">
          <span className="font-medium">New:</span> Earn up to <strong>USD 3.14%</strong> on uninvested cash automatically.{" "}
          <a href="#" className="underline hover:no-underline">Learn more →</a>
        </p>
      </div>

      {/* Main navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <div className="w-8 h-8 bg-[#c8102e] flex items-center justify-center">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-bold text-[#1a1a1a] text-lg tracking-tight">Vault</span>
            <span className="font-light text-[#1a1a1a] text-lg">Wealth</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href}
                className="flex items-center gap-0.5 px-3 py-5 text-sm text-[#333] hover:text-[#c8102e] font-medium transition-colors group">
                {item.label}
                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#c8102e] transition-colors" />
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex w-8 h-8 items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <Link href="/dashboard"
                className="bg-[#c8102e] text-white text-xs font-bold px-5 py-2 hover:bg-[#a50d25] transition-colors">
                Go to Platform
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:block text-sm font-semibold text-[#333] hover:text-[#c8102e] transition-colors px-2">
                  Log In
                </Link>
                <Link href="/register"
                  className="bg-[#c8102e] text-white text-sm font-bold px-5 py-2 hover:bg-[#a50d25] transition-colors">
                  Open Account
                </Link>
              </>
            )}

            <button className="lg:hidden w-8 h-8 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-0">
              {NAV_ITEMS.map((item) => (
                <a key={item.label} href={item.href}
                  className="flex items-center justify-between py-3 border-b border-gray-100 text-sm font-medium text-[#333] hover:text-[#c8102e]"
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </a>
              ))}
              <div className="pt-3 pb-2 space-y-2">
                <Link href="/login" className="block w-full text-center border border-gray-300 py-2.5 text-sm font-semibold">Log In</Link>
                <Link href="/register" className="block w-full text-center bg-[#c8102e] text-white py-2.5 text-sm font-bold">Open Account</Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
