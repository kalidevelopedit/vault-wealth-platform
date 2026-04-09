import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const adminLogin = useAdminLogin();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin.mutateAsync({ data: { passcode } });
      localStorage.setItem("adminAuthenticated", "true");
      toast.success("Access granted");
      setLocation("/admin/dashboard");
    } catch {
      toast.error("Invalid passcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1520] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo-white.png" alt="INT Brokers" style={{ width: 200, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "screen", marginBottom: 24 }} />
          <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25 mb-2">INT Brokers · Restricted Access</div>
          <h1 className="text-lg font-semibold text-white tracking-tight text-center">Administration Portal</h1>
          <p className="text-white/35 text-xs mt-2 text-center">Authorised staff only — enter your secure passcode to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white/5 border border-white/12 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-center tracking-[0.3em] font-mono"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-white text-[#0a1628] text-xs font-bold uppercase tracking-[0.12em] py-3 hover:bg-white/92 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…</> : "Access Portal"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/20 text-[9px] hover:text-white/50 transition-colors uppercase tracking-widest">
            ← Return to Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
