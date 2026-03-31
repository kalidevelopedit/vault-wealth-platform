import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 border-r border-white/8 p-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <span className="text-[#0a1628] font-bold text-[10px] tracking-tighter">VW</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide uppercase">Vault Wealth</span>
          </Link>
        </div>

        <div>
          <p className="text-white/30 text-xs leading-relaxed max-w-xs">
            "Vault Wealth has transformed how we manage our multi-asset portfolio. The institutional tools and reporting are unmatched."
          </p>
          <div className="mt-6">
            <div className="text-white text-xs font-semibold">Sarah M.</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Chief Investment Officer, Family Office</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 border border-white/10">
          {[
            { val: "$2.4B+", label: "AUM" },
            { val: "50K+", label: "Investors" },
            { val: "99.98%", label: "Uptime" },
            { val: "SOC 2", label: "Certified" },
          ].map((s, i) => (
            <div key={i} className={`p-4 border-white/8 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""}`}>
              <div className="text-white text-lg font-semibold tabular-nums">{s.val}</div>
              <div className="text-white/30 text-[9px] uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors mb-10 lg:hidden">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          <div className="mb-8">
            <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Client Portal</div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in to your account</h1>
            <p className="text-white/40 text-xs mt-2">Enter your credentials to access your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-white/5 border border-white/12 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] text-white/40 hover:text-white/70 transition-colors">Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/12 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-[#0a1628] text-xs font-bold uppercase tracking-[0.12em] py-3 hover:bg-white/92 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/30 text-xs">
              No account?{" "}
              <Link href="/register" className="text-white/60 font-semibold hover:text-white transition-colors">
                Open an account
              </Link>
            </p>
          </div>

          <div className="mt-8 p-3 border border-white/8 bg-white/3">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5">Demo Access</div>
            <div className="text-white/40 text-[10px]">demo@vestplatform.com / demo1234</div>
          </div>
        </div>
      </div>
    </div>
  );
}
