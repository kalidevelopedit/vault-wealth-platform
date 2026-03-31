import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Check } from "lucide-react";

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

  const field = (id: keyof typeof formData, label: string, type = "text", placeholder = "") => (
    <div>
      <label htmlFor={id} className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">{label}</label>
      <input
        id={id} type={type} placeholder={placeholder}
        value={formData[id] as string}
        onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
        required
        className="w-full bg-white/5 border border-white/12 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[380px] shrink-0 border-r border-white/8 p-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <span className="text-[#0a1628] font-bold text-[10px] tracking-tighter">VW</span>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide uppercase">Vault Wealth</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="text-white/30 text-xs leading-relaxed">
            Your account opening takes 5 minutes. Identity verification (KYC) is completed in a separate guided step.
          </div>
          <div className="space-y-3">
            {[
              "Institutional-grade portfolio tools",
              "Real-time market data & analytics",
              "Multi-asset class access",
              "Bank-level security & custody",
              "Dedicated support team",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white/60" />
                </div>
                <span className="text-white/50 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/20 text-[10px] leading-relaxed">
          By opening an account you agree to our Terms of Service and Privacy Policy. Vault Wealth is a regulated financial services platform.
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 text-xs hover:text-white/70 transition-colors mb-8 lg:hidden">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="mb-8">
            <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">New Account</div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Open your account</h1>
            <p className="text-white/40 text-xs mt-2">Start with institutional-grade investment tools</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field("fullName", "Legal Full Name", "text", "As it appears on government ID")}
            {field("email", "Email Address", "email", "name@example.com")}
            {field("password", "Password", "password")}
            {field("phone", "Phone Number", "tel", "+1 (555) 000-0000")}

            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">Country of Residence</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white/5 border border-white/12 text-white text-sm px-3.5 py-2.5 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors appearance-none cursor-pointer">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0a1628] text-white">{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <button type="button"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                className={`w-4 h-4 border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${formData.agreedToTerms ? "bg-white border-white" : "bg-transparent border-white/25 hover:border-white/50"}`}>
                {formData.agreedToTerms && <Check className="w-2.5 h-2.5 text-[#0a1628]" />}
              </button>
              <label className="text-[11px] text-white/40 leading-relaxed cursor-pointer"
                onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}>
                I agree to the{" "}
                <a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-white text-[#0a1628] text-xs font-bold uppercase tracking-[0.12em] py-3 hover:bg-white/92 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <p className="text-white/30 text-xs">
              Already have an account?{" "}
              <Link href="/login" className="text-white/60 font-semibold hover:text-white transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
