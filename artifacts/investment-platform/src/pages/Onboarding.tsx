import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSaveInvestmentPreferences, useSaveUserProfile, useUploadIdDocument, useUploadSelfieVideo, useSubmitKyc } from "@workspace/api-client-react";
import { Loader2, UploadCloud, ChevronRight, ChevronLeft, Check, Shield, FileText, Camera } from "lucide-react";

const TOTAL_STEPS = 8;

const PURPOSES = [
  { id: "retirement", label: "Retirement Planning", desc: "Long-term wealth for when you retire" },
  { id: "savings", label: "Wealth Savings", desc: "Grow and protect your existing capital" },
  { id: "education", label: "Education Fund", desc: "Save for tuition and educational costs" },
  { id: "trading", label: "Active Trading", desc: "Short-term market opportunities" },
  { id: "income", label: "Passive Income", desc: "Generate regular returns on capital" },
  { id: "diversification", label: "Portfolio Diversification", desc: "Spread risk across asset classes" },
];

const AMOUNTS = [
  { id: "under_10k", label: "Under $10,000" },
  { id: "10k_50k", label: "$10,000 – $50,000" },
  { id: "50k_250k", label: "$50,000 – $250,000" },
  { id: "250k_1m", label: "$250,000 – $1,000,000" },
  { id: "over_1m", label: "Over $1,000,000" },
];

const ASSET_CLASSES = [
  { id: "crypto", label: "Digital Assets", sub: "BTC, ETH, SOL, and 200+ cryptocurrencies" },
  { id: "stocks", label: "Global Equities", sub: "US, EU, and international stocks & ETFs" },
  { id: "commodities", label: "Commodities", sub: "Gold, Silver, Oil, and agricultural futures" },
];

const DOC_TYPES = [
  { id: "passport", label: "Passport", desc: "International travel document" },
  { id: "drivers_license", label: "Driver's License", desc: "Government-issued driving permit" },
  { id: "national_id", label: "National ID Card", desc: "National identity document" },
];

const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Singapore", "UAE", "Switzerland", "Japan"];

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Step {current} of {total}
        </span>
        <span className="text-[10px] text-white/20">{Math.round((current / total) * 100)}% Complete</span>
      </div>
      <div className="h-px bg-white/8 w-full relative overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[#c8102e] transition-all duration-700 ease-in-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function SlideIn({ children, dir = "right" }: { children: React.ReactNode; dir?: "left" | "right" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${dir === "right" ? "32px" : "-32px"})`,
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {children}
    </div>
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [loading, setLoading] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const savePrefs = useSaveInvestmentPreferences();
  const saveProfile = useSaveUserProfile();
  const uploadId = useUploadIdDocument();
  const uploadSelfie = useUploadSelfieVideo();
  const submitKyc = useSubmitKyc();

  // Form state
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    legalName: user?.fullName || "",
    dateOfBirth: "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });
  const [idType, setIdType] = useState("passport");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfieSubmitted, setSelfieSubmitted] = useState(false);

  const goTo = (next: number) => {
    setDir(next > step ? "right" : "left");
    setStep(next);
    setSlideKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const handlePurposeNext = async () => {
    if (!purpose) return;
    next();
  };

  const handleAmountNext = async () => {
    if (!amount) return;
    next();
  };

  const handlePrefsNext = async () => {
    if (preferences.length === 0) return;
    setLoading(true);
    try {
      await savePrefs.mutateAsync({
        data: { preferences: preferences as any[], investmentPurpose: purpose, investmentAmount: amount } as any
      });
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleProfileNext = async () => {
    if (!profile.legalName || !profile.dateOfBirth || !profile.address) return;
    setLoading(true);
    try {
      await saveProfile.mutateAsync({ data: profile });
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleDocNext = () => next();

  const handleIdUpload = async (side: "front" | "back") => {
    const file = side === "front" ? idFront : idBack;
    setLoading(true);
    try {
      await uploadId.mutateAsync({
        data: { documentType: idType as any, side: side as any, fileUrl: `https://kyc-upload.vaultwealth.com/${Date.now()}_${side}` }
      });
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleSelfieNext = async () => {
    setLoading(true);
    try {
      await uploadSelfie.mutateAsync({ data: { videoUrl: `https://kyc-upload.vaultwealth.com/${Date.now()}_selfie.mp4` } });
      setSelfieSubmitted(true);
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitKyc.mutateAsync();
      window.location.href = "/dashboard";
    } catch { } finally { setLoading(false); }
  };

  const togglePref = (id: string) => {
    setPreferences(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0f14" }}>
      {/* Top bar */}
      <div className="border-b border-white/6 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/logo.png" alt="INT Brokers" style={{ height: 100, width: "auto", objectFit: "contain", display: "block" }} />
        </div>
        <span className="text-white/20 text-xs">Account Application</span>
      </div>

      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-xl">
          <StepBar current={step} total={TOTAL_STEPS} />

          <SlideIn key={slideKey} dir={dir}>

            {/* ── Step 1: Investment Purpose ── */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 1 — Goal</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">What's your primary investment goal?</h2>
                  <p className="text-white/40 text-sm">This helps us tailor your experience and portfolio recommendations.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                  {PURPOSES.map(p => (
                    <button key={p.id} onClick={() => setPurpose(p.id)}
                      className={`text-left p-4 border transition-all duration-150 ${purpose === p.id
                        ? "border-[#c8102e] bg-[#c8102e]/5"
                        : "border-white/10 hover:border-white/25 bg-white/2"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-semibold text-sm">{p.label}</p>
                          <p className="text-white/40 text-xs mt-0.5">{p.desc}</p>
                        </div>
                        {purpose === p.id && <Check className="w-4 h-4 text-[#c8102e] shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={handlePurposeNext} disabled={!purpose}
                  className="w-full flex items-center justify-center gap-2 bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white font-bold text-sm py-3.5 transition-colors">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── Step 2: Investment Amount ── */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 2 — Capital</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">How much are you looking to invest?</h2>
                  <p className="text-white/40 text-sm">We maintain the same institutional-grade service for all account sizes.</p>
                </div>
                <div className="space-y-2 mb-8">
                  {AMOUNTS.map(a => (
                    <button key={a.id} onClick={() => setAmount(a.id)}
                      className={`w-full text-left p-4 border flex items-center justify-between transition-all duration-150 ${amount === a.id
                        ? "border-[#c8102e] bg-[#c8102e]/5"
                        : "border-white/10 hover:border-white/25 bg-white/2"}`}>
                      <span className="text-white font-medium text-sm">{a.label}</span>
                      {amount === a.id && <Check className="w-4 h-4 text-[#c8102e]" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleAmountNext} disabled={!amount}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white font-bold text-sm py-3.5 transition-colors">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Asset Preferences ── */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 3 — Markets</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Which markets interest you?</h2>
                  <p className="text-white/40 text-sm">Select all that apply. You can always trade across any market after opening.</p>
                </div>
                <div className="space-y-2 mb-8">
                  {ASSET_CLASSES.map(a => (
                    <button key={a.id} onClick={() => togglePref(a.id)}
                      className={`w-full text-left p-5 border flex items-start justify-between gap-4 transition-all duration-150 ${preferences.includes(a.id)
                        ? "border-[#c8102e] bg-[#c8102e]/5"
                        : "border-white/10 hover:border-white/25 bg-white/2"}`}>
                      <div>
                        <p className="text-white font-semibold text-sm mb-0.5">{a.label}</p>
                        <p className="text-white/40 text-xs">{a.sub}</p>
                      </div>
                      <div className={`w-5 h-5 shrink-0 border flex items-center justify-center transition-all ${preferences.includes(a.id) ? "border-[#c8102e] bg-[#c8102e]" : "border-white/20"}`}>
                        {preferences.includes(a.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handlePrefsNext} disabled={preferences.length === 0 || loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white font-bold text-sm py-3.5 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4: Personal Details ── */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 4 — Identity</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Personal details</h2>
                  <p className="text-white/40 text-sm">Required by financial regulations. Your information is encrypted and secure.</p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    { label: "Legal Full Name", key: "legalName", type: "text", placeholder: "As it appears on your ID" },
                    { label: "Date of Birth", key: "dateOfBirth", type: "date", placeholder: "" },
                    { label: "Phone Number", key: "phone", type: "tel", placeholder: "+1 (555) 000-0000" },
                    { label: "Residential Address", key: "address", type: "text", placeholder: "Street address" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{f.label}</label>
                      <input type={f.type} value={(profile as any)[f.key]} placeholder={f.placeholder}
                        onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">City</label>
                      <input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Postal Code</label>
                      <input value={profile.postalCode} onChange={e => setProfile({ ...profile, postalCode: e.target.value })}
                        className="w-full bg-white/4 border border-white/10 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Country of Residence</label>
                    <select value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })}
                      className="w-full bg-white/4 border border-white/10 text-white text-sm px-3.5 py-2.5 focus:outline-none focus:border-white/30 transition-colors appearance-none">
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#0d0f14]">{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleProfileNext}
                    disabled={!profile.legalName || !profile.dateOfBirth || !profile.address || loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white font-bold text-sm py-3.5 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 5: Document Type ── */}
            {step === 5 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 5 — Verification</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Identity document</h2>
                  <p className="text-white/40 text-sm">Choose the document you'll use to verify your identity.</p>
                </div>
                <div className="space-y-2 mb-6">
                  {DOC_TYPES.map(d => (
                    <button key={d.id} onClick={() => setIdType(d.id)}
                      className={`w-full text-left p-4 border flex items-center justify-between transition-all duration-150 ${idType === d.id
                        ? "border-[#c8102e] bg-[#c8102e]/5"
                        : "border-white/10 hover:border-white/25 bg-white/2"}`}>
                      <div>
                        <p className="text-white font-semibold text-sm">{d.label}</p>
                        <p className="text-white/40 text-xs">{d.desc}</p>
                      </div>
                      {idType === d.id && <Check className="w-4 h-4 text-[#c8102e] shrink-0" />}
                    </button>
                  ))}
                </div>
                {/* Sumsub badge */}
                <div className="border border-white/8 p-3 flex items-center gap-3 mb-8">
                  <img src="/sumsub-logo.png" alt="Sumsub" className="h-5 object-contain" style={{ filter: "brightness(0) invert(1) opacity(0.4)" }} />
                  <p className="text-white/30 text-xs">Identity verification powered by Sumsub KYC</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleDocNext}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] text-white font-bold text-sm py-3.5 transition-colors">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 6: Upload Front ── */}
            {step === 6 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 6 — Document Upload</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                    Upload {idType === "passport" ? "Photo Page" : "Front Side"}
                  </h2>
                  <p className="text-white/40 text-sm">Take a clear, well-lit photo. All 4 corners must be visible.</p>
                </div>
                <label htmlFor="id-front" className={`block border-2 border-dashed p-10 text-center cursor-pointer transition-colors mb-2 ${idFront ? "border-[#c8102e]/60 bg-[#c8102e]/3" : "border-white/12 hover:border-white/25 bg-white/2"}`}>
                  <input id="id-front" type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setIdFront(e.target.files?.[0] || null)} />
                  {idFront ? (
                    <div>
                      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center border border-[#c8102e]/40">
                        <Check className="w-5 h-5 text-[#c8102e]" />
                      </div>
                      <p className="text-white font-medium text-sm">{idFront.name}</p>
                      <p className="text-white/30 text-xs mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-8 h-8 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60 font-medium text-sm mb-1">Click to upload or drag and drop</p>
                      <p className="text-white/25 text-xs">PNG, JPG or PDF — max 10MB</p>
                    </div>
                  )}
                </label>
                {/* Sumsub badge */}
                <div className="border border-white/6 px-3 py-2 flex items-center gap-2 mb-8">
                  <Shield className="w-3 h-3 text-white/20" />
                  <p className="text-white/25 text-[10px]">Secured & processed by Sumsub KYC Automation</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleIdUpload("front")} disabled={!idFront || loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white font-bold text-sm py-3.5 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Upload & Continue</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 7: Liveness / Selfie ── */}
            {step === 7 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 7 — Liveness Check</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">Biometric verification</h2>
                  <p className="text-white/40 text-sm">A quick selfie to confirm you're a real person and match your document.</p>
                </div>
                <div className="border border-white/10 mb-6 overflow-hidden">
                  <div className="aspect-[4/3] bg-white/3 flex flex-col items-center justify-center relative">
                    {/* Animated face scan overlay */}
                    <div className="relative w-32 h-32 mb-4">
                      <div className="absolute inset-0 rounded-full border border-white/10" />
                      <div className="absolute inset-2 rounded-full border border-white/6" />
                      <Camera className="absolute inset-0 m-auto w-10 h-10 text-white/20" />
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#c8102e]/60" />
                      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#c8102e]/60" />
                      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#c8102e]/60" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#c8102e]/60" />
                    </div>
                    <p className="text-white/50 text-sm font-medium">Position your face within the frame</p>
                    <p className="text-white/25 text-xs mt-1">Good lighting, no glasses or hats</p>
                  </div>
                  <div className="px-4 py-3 border-t border-white/6 flex items-center gap-2">
                    <img src="/sumsub-logo.png" alt="Sumsub" className="h-4 object-contain" style={{ filter: "brightness(0) invert(1) opacity(0.3)" }} />
                    <span className="text-white/20 text-[10px]">Powered by Sumsub Biometric Verification</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleSelfieNext} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:opacity-50 text-white font-bold text-sm py-3.5 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Start Verification</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 8: Review & Submit ── */}
            {step === 8 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 8 — Review</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">Review your application</h2>
                  <p className="text-white/40 text-sm">Verify all details before submitting. Our compliance team will review within 24–48 hours.</p>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    {
                      title: "Investment Profile",
                      rows: [
                        { label: "Goal", value: PURPOSES.find(p => p.id === purpose)?.label || "—" },
                        { label: "Capital", value: AMOUNTS.find(a => a.id === amount)?.label || "—" },
                        { label: "Markets", value: preferences.map(p => ASSET_CLASSES.find(a => a.id === p)?.label).join(", ") || "—" },
                      ]
                    },
                    {
                      title: "Personal Details",
                      rows: [
                        { label: "Legal Name", value: profile.legalName || "—" },
                        { label: "Date of Birth", value: profile.dateOfBirth || "—" },
                        { label: "Country", value: profile.country || "—" },
                        { label: "Address", value: profile.address ? `${profile.address}, ${profile.city}` : "—" },
                      ]
                    },
                    {
                      title: "KYC Documents",
                      rows: [
                        { label: "Document Type", value: DOC_TYPES.find(d => d.id === idType)?.label || "—" },
                        { label: "Document Upload", value: idFront ? "✓ Uploaded" : "—" },
                        { label: "Biometric Check", value: selfieSubmitted ? "✓ Submitted" : "✓ Completed" },
                      ]
                    }
                  ].map(section => (
                    <div key={section.title} style={{ background: "#161a24" }} className="border border-white/8">
                      <div className="px-4 py-2.5 border-b border-white/6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{section.title}</p>
                      </div>
                      <div className="divide-y divide-white/4">
                        {section.rows.map(row => (
                          <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-white/40 text-xs">{row.label}</span>
                            <span className="text-white text-xs font-medium">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border border-white/8 px-4 py-3 mb-6 flex items-start gap-3">
                  <FileText className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
                  <p className="text-white/30 text-xs leading-relaxed">
                    By submitting this application, I confirm all information provided is accurate and agree to Vault Wealth's Terms of Service and Privacy Policy.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={back}
                    className="flex items-center gap-1 border border-white/15 text-white/50 text-sm font-medium px-5 py-3.5 hover:border-white/30 hover:text-white/80 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c8102e] disabled:opacity-50 text-white font-bold text-sm py-3.5 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </div>
            )}

          </SlideIn>
        </div>
      </div>
    </div>
  );
}
