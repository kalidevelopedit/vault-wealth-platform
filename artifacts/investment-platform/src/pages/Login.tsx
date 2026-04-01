import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back");
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f8f7f4" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#0d1520] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-white flex items-center justify-center shrink-0">
            <span className="text-[#0d1520] font-bold text-[9px] tracking-tighter">V</span>
          </div>
          <span className="text-white/90 font-medium text-[13px] tracking-tight">Vault Wealth</span>
        </Link>

        <div>
          <p className="text-white/30 text-[13px] leading-relaxed font-light max-w-xs mb-8">
            "Vault Wealth has transformed how we manage our multi-asset portfolio. The institutional tools and reporting are unmatched."
          </p>
          <div>
            <div className="text-white/70 text-[12px] font-medium">Sarah M.</div>
            <div className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">Chief Investment Officer</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
          {[
            { val: "$2.4B+", label: "Assets Under Management" },
            { val: "50K+", label: "Institutional Investors" },
            { val: "99.98%", label: "Platform Uptime" },
            { val: "SOC 2", label: "Type II Certified" },
          ].map((s, i) => (
            <div key={i} className="p-5 bg-[#0d1520]">
              <div className="text-white/80 text-lg font-semibold tabular-nums tracking-tight">{s.val}</div>
              <div className="text-white/25 text-[9px] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#0d1520] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[9px] tracking-tighter">V</span>
              </div>
              <span className="text-[#111] font-medium text-[13px] tracking-tight">Vault Wealth</span>
            </Link>
          </div>

          <div className="mb-9">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">Client Portal</div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#111] leading-snug">Sign in to your account</h1>
            <p className="text-[13px] text-[#888] mt-2">Enter your credentials to access your portfolio.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold text-[#999] uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-white border border-[#e6e3dc] text-[#111] text-[13px] px-3.5 py-2.5 placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[10px] font-semibold text-[#999] uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] text-[#999] hover:text-[#111] transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-[#e6e3dc] text-[#111] text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-[#0d1520] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-7 border-t border-[#e6e3dc]">
            <p className="text-[12px] text-[#999]">
              No account?{" "}
              <Link href="/register" className="text-[#111] font-medium hover:underline">
                Open an account
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 border border-[#e6e3dc] bg-white">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-[#bbb] mb-1.5">Demo Access</div>
            <div className="text-[11px] text-[#999] font-mono">demo@vestplatform.com / demo1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
