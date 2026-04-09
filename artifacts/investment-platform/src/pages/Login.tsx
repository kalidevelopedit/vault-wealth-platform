import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const INPUT = "w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex" style={{ background: "#F5F6F7" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-[#0d1520] p-12 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.035)'/%3E%3C/svg%3E")`, zIndex: 0, pointerEvents: "none" }} />
        {/* Red glow */}
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 400, height: 300, background: "radial-gradient(ellipse,rgba(200,16,46,0.07) 0%,transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers" style={{ width: 340, height: "auto", display: "block", mixBlendMode: "screen" }} />
          </Link>
          <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.06)", width: "100%" }} />
          <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.06em" }}>Institutional Investment Platform</p>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="text-white/30 text-[13px] leading-relaxed font-light max-w-xs mb-8">
            "Vault Wealth has transformed how we manage our multi-asset portfolio. The institutional tools and reporting are unmatched."
          </p>
          <div>
            <div className="text-white/70 text-[12px] font-semibold">Sarah M.</div>
            <div className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">Chief Investment Officer</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3" style={{ position: "relative", zIndex: 1 }}>
          {[
            { val: "$2.4B+", label: "Assets Under Management" },
            { val: "50K+", label: "Institutional Investors" },
            { val: "99.98%", label: "Platform Uptime" },
            { val: "SOC 2", label: "Type II Certified" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.05]" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-white/80 text-[17px] font-bold tabular-nums tracking-tight">{s.val}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden flex justify-center">
            <Link href="/">
              <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 220, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />
            </Link>
          </div>

          <div className="mb-9">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af] mb-3">INT Brokers · Secure Login</div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] leading-snug">Welcome back</h1>
            <p className="text-[13px] text-[#6B7280] mt-2">Sign in to your INT Brokers brokerage account to access your portfolio, markets, and account tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className={INPUT}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] text-[#6B7280] hover:text-[#0F172A] transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={INPUT + " pr-10"}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6B7280] transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 rounded-xl hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-7 border-t border-[#E6E8EB]">
            <p className="text-[12px] text-[#6B7280]">
              No account?{" "}
              <Link href="/register" className="text-[#0F172A] font-semibold hover:underline">
                Open an account
              </Link>
            </p>
          </div>

          <div className="mt-5 p-4 rounded-xl border border-[#E6E8EB] bg-white">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Demo Access</div>
            <div className="text-[11px] text-[#6B7280] font-mono">demo@vestplatform.com / demo1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
