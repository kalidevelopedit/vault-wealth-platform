import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

const INPUT = "w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors";
const LABEL = "block text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest mb-1.5";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", phone: "", country: "US", agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) { toast.error("You must agree to the terms"); return; }
    setLoading(true);
    try {
      await register(formData);
      toast.success("Account created");
      setLocation("/onboarding");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F6F7" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#0d1520] p-12 relative overflow-hidden">
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.035)'/%3E%3C/svg%3E")`, zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/">
            <img src="/logo-white.png" alt="INT Brokers" style={{ width: 300, height: "auto", display: "block", mixBlendMode: "screen" }} />
          </Link>
          <div style={{ marginTop: 10, height: 1, background: "rgba(255,255,255,0.06)", width: "100%" }} />
          <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 500, letterSpacing: "0.06em" }}>Open Your Account — Free</p>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="space-y-6">
            <div className="text-white/30 text-[13px] leading-relaxed font-light">
              Opening an INT Brokers account takes under 5 minutes. Complete your profile and identity verification in a guided step after registration.
            </div>
            <div className="space-y-3">
              {[
                "Institutional-grade portfolio tools",
                "Real-time market data & analytics",
                "Multi-asset class access",
                "Bank-level security & custody",
                "Dedicated client support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/[0.10] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white/60" strokeWidth={2.5} />
                  </div>
                  <span className="text-white/45 text-[12px]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/20 text-[10px] leading-relaxed">
            By opening an account you agree to our Terms of Service and Privacy Policy. Vault Wealth is a regulated financial services platform.
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 200, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />
            </Link>
          </div>

          <div className="mb-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af] mb-3">INT Brokers · New Account</div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] leading-snug">Open a brokerage account</h1>
            <p className="text-[13px] text-[#6B7280] mt-2">Join 50,000+ investors on INT Brokers — trade stocks, crypto, commodities, and more with institutional-grade tools and no hidden fees.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Legal Full Name</label>
              <input type="text" placeholder="As it appears on government ID"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required className={INPUT} />
            </div>

            <div>
              <label className={LABEL}>Email Address</label>
              <input type="email" placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required className={INPUT} />
            </div>

            <div>
              <label className={LABEL}>Password</label>
              <input type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required className={INPUT} />
            </div>

            <div>
              <label className={LABEL}>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required className={INPUT} />
            </div>

            <div>
              <label className={LABEL}>Country of Residence</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0d1520] transition-colors appearance-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <button type="button"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                  formData.agreedToTerms ? "bg-[#0d1520] border-[#0d1520]" : "bg-white border border-[#E6E8EB] hover:border-[#6B7280]"
                }`}>
                {formData.agreedToTerms && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
              </button>
              <label className="text-[11px] text-[#6B7280] leading-relaxed cursor-pointer"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}>
                I agree to the{" "}
                <a href="#" className="text-[#0F172A] font-semibold hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#0F172A] font-semibold hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 rounded-xl hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#E6E8EB]">
            <p className="text-[12px] text-[#6B7280]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0F172A] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
