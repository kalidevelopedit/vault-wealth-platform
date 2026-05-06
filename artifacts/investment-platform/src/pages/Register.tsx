import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Loader2, Check, Eye, EyeOff } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "CH", name: "Switzerland", dial: "+41" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "NL", name: "Netherlands", dial: "+31" },
  { code: "SE", name: "Sweden", dial: "+46" },
];

const INPUT = "w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors";
const LABEL = "block text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest mb-1.5";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", phone: "", country: "US", agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [_, setLocation] = useLocation();

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country) || COUNTRIES[0];

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
    const currentPhone = formData.phone;
    const oldDial = selectedCountry.dial;
    let newPhone = currentPhone;
    if (!currentPhone || currentPhone === oldDial || currentPhone.startsWith(oldDial + " ")) {
      newPhone = country.dial + " ";
    }
    setFormData({ ...formData, country: code, phone: newPhone });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) { toast.error("Please agree to the Terms of Service to continue"); return; }
    setLoading(true);
    try {
      await register(formData);
      toast.success("Account created — let's complete your profile");
      setLocation("/onboarding");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F5F6F7" }}>
      {/* Left panel */}
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
                  <div className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                  <span className="text-white/40 text-[12px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/20 text-[10px] leading-relaxed mt-6">
            By opening an account you agree to our Terms of Service and Privacy Policy. INT Brokers is a regulated financial services platform.
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8 py-12">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden flex justify-center">
            <Link href="/">
              <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 200, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />
            </Link>
          </div>

          <div className="mb-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9ca3af] mb-3">INT Brokers · New Account</div>
            <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] leading-snug">Open a brokerage account</h1>
            <p className="text-[13px] text-[#6B7280] mt-2">Join 50,000+ investors on INT Brokers — trade stocks, crypto, commodities, and more.</p>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  placeholder="Min. 8 characters"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required className={INPUT + " pr-10"} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6B7280] transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className={LABEL}>Country of Residence</label>
              <select
                value={formData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0d1520] transition-colors appearance-none cursor-pointer">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Phone Number</label>
              <div className="flex gap-2">
                <div className="bg-white border border-[#E6E8EB] rounded-xl px-3 flex items-center shrink-0 text-[13px] text-[#0F172A] font-medium min-w-[60px] justify-center">
                  {selectedCountry.dial}
                </div>
                <input type="tel" placeholder="(555) 000-0000"
                  value={formData.phone.replace(selectedCountry.dial, "").trim()}
                  onChange={(e) => setFormData({ ...formData, phone: selectedCountry.dial + " " + e.target.value })}
                  required className={INPUT} />
              </div>
            </div>

            <div className={`flex items-start gap-3 pt-1 p-3 rounded-xl transition-colors ${!formData.agreedToTerms ? "bg-[#f9f9f9] border border-[#e5e7eb]" : ""}`}>
              <button type="button"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors border ${
                  formData.agreedToTerms ? "bg-[#0d1520] border-[#0d1520]" : "bg-white border-[#E6E8EB] hover:border-[#6B7280]"
                }`}>
                {formData.agreedToTerms && <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />}
              </button>
              <label className="text-[11px] text-[#6B7280] leading-relaxed cursor-pointer"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}>
                I agree to the{" "}
                <a href="#" className="text-[#0F172A] font-semibold hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-[#0F172A] font-semibold hover:underline">Privacy Policy</a>
                {!formData.agreedToTerms && <span className="block text-[#6b7280] font-medium mt-0.5">Required to proceed</span>}
              </label>
            </div>

            <button type="submit" disabled={loading || !formData.agreedToTerms}
              className="w-full bg-[#0d1520] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-3 rounded-xl hover:bg-[#1a2d4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
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
