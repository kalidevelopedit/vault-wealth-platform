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

  const inputClass = "w-full bg-white border border-[#e6e3dc] text-[#111] text-[13px] px-3.5 py-2.5 placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors";
  const labelClass = "block text-[10px] font-semibold text-[#999] uppercase tracking-widest mb-1.5";

  return (
    <div className="min-h-screen flex" style={{ background: "#f8f7f4" }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 bg-[#0d1520] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-white flex items-center justify-center shrink-0">
            <span className="text-[#0d1520] font-bold text-[9px] tracking-tighter">V</span>
          </div>
          <span className="text-white/90 font-medium text-[13px] tracking-tight">Vault Wealth</span>
        </Link>

        <div className="space-y-6">
          <div className="text-white/28 text-[13px] leading-relaxed font-light">
            Account opening takes 5 minutes. Identity verification is completed in a guided step after registration.
          </div>
          <div className="space-y-3.5">
            {[
              "Institutional-grade portfolio tools",
              "Real-time market data & analytics",
              "Multi-asset class access",
              "Bank-level security & custody",
              "Dedicated client support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-4 h-4 border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white/50" strokeWidth={2} />
                </div>
                <span className="text-white/40 text-[12px]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/18 text-[10px] leading-relaxed">
          By opening an account you agree to our Terms of Service and Privacy Policy. Vault Wealth is a regulated financial services platform.
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-[#0d1520] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[9px] tracking-tighter">V</span>
              </div>
              <span className="text-[#111] font-medium text-[13px] tracking-tight">Vault Wealth</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999] mb-3">New Account</div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#111] leading-snug">Open your account</h1>
            <p className="text-[13px] text-[#888] mt-2">Start with institutional-grade investment tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Legal Full Name</label>
              <input type="text" placeholder="As it appears on government ID"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Country of Residence</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white border border-[#e6e3dc] text-[#111] text-[13px] px-3.5 py-2.5 focus:outline-none focus:border-[#0d1520] transition-colors appearance-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <button type="button"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                className={`w-4 h-4 border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                  formData.agreedToTerms ? "bg-[#0d1520] border-[#0d1520]" : "bg-white border-[#e6e3dc] hover:border-[#999]"
                }`}>
                {formData.agreedToTerms && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
              </button>
              <label className="text-[11px] text-[#888] leading-relaxed cursor-pointer"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}>
                I agree to the{" "}
                <a href="#" className="text-[#111] hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#111] hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 hover:bg-[#1a2d4a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-[#e6e3dc]">
            <p className="text-[12px] text-[#999]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#111] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
