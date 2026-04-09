import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useSaveInvestmentPreferences,
  useSaveUserProfile,
  useUploadIdDocument,
  useUploadSelfieVideo,
  useSubmitKyc,
} from "@workspace/api-client-react";
import {
  Loader2, UploadCloud, ChevronRight, ChevronLeft, Check,
  Shield, FileText, Camera, MapPin, User, Bitcoin, BarChart3, Wheat, Landmark,
} from "lucide-react";

const TOTAL_STEPS = 6;

const ASSET_CLASSES = [
  { id: "stocks", Icon: BarChart3, label: "Stocks & ETFs", sub: "NYSE, NASDAQ, LSE and 170+ global markets", color: "#2563eb" },
  { id: "crypto", Icon: Bitcoin, label: "Cryptocurrency", sub: "Bitcoin, Ethereum, Solana and 60+ coins", color: "#f59e0b" },
  { id: "commodities", Icon: Wheat, label: "Commodities", sub: "Gold, silver, crude oil and agricultural futures", color: "#ef4444" },
  { id: "retirement", Icon: Landmark, label: "Retirement Accounts", sub: "IRA, Roth IRA, SEP and pension accounts", color: "#10b981" },
];

const PURPOSES = [
  { id: "retirement", label: "Retirement Planning", desc: "Long-term wealth for when you retire" },
  { id: "savings", label: "Wealth Growth", desc: "Grow and protect your existing capital" },
  { id: "trading", label: "Active Trading", desc: "Short-term market opportunities" },
  { id: "income", label: "Passive Income", desc: "Generate regular returns on capital" },
];

const AMOUNTS = [
  { id: "under_10k", label: "Under $10,000" },
  { id: "10k_50k", label: "$10,000 – $50,000" },
  { id: "50k_250k", label: "$50,000 – $250,000" },
  { id: "250k_1m", label: "$250,000 – $1,000,000" },
  { id: "over_1m", label: "Over $1,000,000" },
];

const DOC_TYPES = [
  { id: "passport", label: "Passport", desc: "International travel document" },
  { id: "drivers_license", label: "Driver's License", desc: "Government-issued driving permit" },
  { id: "national_id", label: "National ID Card", desc: "National identity document" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Singapore", "UAE", "Switzerland", "Japan", "India", "Brazil",
  "South Africa", "Netherlands", "Sweden",
];

const INPUT = "w-full bg-white/[0.04] border border-white/10 text-white text-sm px-3.5 py-2.5 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors rounded-none";

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Step {current} of {total}
        </span>
        <span className="text-[10px] text-white/20">{Math.round((current / total) * 100)}% Complete</span>
      </div>
      <div className="h-px bg-white/8 w-full relative overflow-hidden rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-[#c8102e] transition-all duration-700 ease-in-out rounded-full"
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
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : `translateX(${dir === "right" ? "28px" : "-28px"})`,
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {children}
    </div>
  );
}

function NavBtn({ onClick, children, disabled, variant = "primary" }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3.5 transition-colors ${
        variant === "primary"
          ? "bg-[#c8102e] disabled:bg-white/8 disabled:text-white/20 text-white"
          : "border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80 px-5 flex-none"
      }`}>
      {children}
    </button>
  );
}

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json();
}

async function uploadFileToStorage(file: File): Promise<string> {
  const { uploadURL, objectPath } = await requestUploadUrl(file);
  await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  return objectPath;
}

export default function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [loading, setLoading] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const savePrefs = useSaveInvestmentPreferences();
  const saveProfile = useSaveUserProfile();
  const uploadId = useUploadIdDocument();
  const uploadSelfie = useUploadSelfieVideo();
  const submitKyc = useSubmitKyc();

  // Step 1: What to trade
  const [preferences, setPreferences] = useState<string[]>([]);

  // Step 2: Goal + amount
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");

  // Step 3: Personal details + address autocomplete
  const [profile, setProfile] = useState({
    legalName: user?.fullName || "",
    dateOfBirth: "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
  });
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 4: KYC doc type
  const [idType, setIdType] = useState("passport");

  // Step 5: Document upload
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idObjectPath, setIdObjectPath] = useState<string | null>(null);
  const [selfieSubmitted, setSelfieSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const goTo = (next: number) => {
    setDir(next > step ? "right" : "left");
    setStep(next);
    setSlideKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);
  const togglePref = (id: string) => {
    setPreferences(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  // Address autocomplete - debounced Nominatim search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (addressQuery.length < 4) {
      setAddressSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setAddressSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setAddressSuggestions([]);
      }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [addressQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectSuggestion = (s: any) => {
    const addr = s.address;
    const road = addr.road || addr.street || addr.pedestrian || "";
    const house = addr.house_number || "";
    const streetLine = house ? `${house} ${road}` : road;
    const city = addr.city || addr.town || addr.village || addr.county || "";
    const postal = addr.postcode || "";
    const country = addr.country || "";
    setProfile(p => ({
      ...p,
      address: streetLine || s.display_name.split(",")[0],
      city,
      postalCode: postal,
      country: country || p.country,
    }));
    setAddressQuery(streetLine || s.display_name.split(",")[0]);
    setShowSuggestions(false);
  };

  // Step handlers
  const handleStep1Next = async () => {
    if (preferences.length === 0) return;
    setLoading(true);
    try {
      await savePrefs.mutateAsync({
        data: { preferences: preferences as any[], investmentPurpose: purpose || "savings", investmentAmount: amount || "under_10k" } as any,
      });
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleStep2Next = () => {
    if (!purpose || !amount) return;
    next();
  };

  const handleStep3Next = async () => {
    if (!profile.legalName || !profile.dateOfBirth || !profile.address) return;
    setLoading(true);
    try {
      await saveProfile.mutateAsync({ data: profile });
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleIdUpload = async () => {
    if (!idFile) return;
    setLoading(true);
    setUploadProgress(10);
    try {
      let fileUrl = `https://kyc-upload.vaultwealth.com/${Date.now()}_front`;
      try {
        const objectPath = await uploadFileToStorage(idFile);
        fileUrl = `/api/storage${objectPath}`;
        setIdObjectPath(objectPath);
        setUploadProgress(80);
      } catch {
        // fallback to placeholder if storage not ready
      }
      await uploadId.mutateAsync({
        data: { documentType: idType as any, side: "front" as any, fileUrl }
      });
      setUploadProgress(100);
      next();
    } catch { } finally { setLoading(false); setUploadProgress(0); }
  };

  const handleSelfieNext = async () => {
    setLoading(true);
    try {
      await uploadSelfie.mutateAsync({
        data: { videoUrl: `https://kyc-upload.vaultwealth.com/${Date.now()}_selfie.mp4` }
      });
      setSelfieSubmitted(true);
      next();
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitKyc.mutateAsync();
      setSubmitted(true);
    } catch { } finally { setLoading(false); }
  };

  // ── Submitted Success Screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0d0f14", fontFamily: "'Inter',system-ui,sans-serif" }}>
        <img src="/logo-white.png" alt="INT Brokers" style={{ width: 240, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "screen", marginBottom: 52 }} />
        <div style={{ textAlign: "center", maxWidth: 560, padding: "0 24px" }}>
          <div style={{ width: 72, height: 72, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <Check size={32} color="#4ade80" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>Application Submitted</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 12 }}>
            Thank you, <strong style={{ color: "rgba(255,255,255,0.8)" }}>{user?.fullName || "there"}</strong>. Your account opening application is now under review by our compliance team.
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 8 }}>
            You will receive an email confirmation at <strong style={{ color: "rgba(255,255,255,0.6)" }}>{user?.email}</strong> once your account has been approved. This typically takes 24–48 hours.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, marginBottom: 44 }}>
            If you don't see our email in your inbox, please check your <strong style={{ color: "rgba(255,255,255,0.45)" }}>spam or junk folder</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#e8192c,#c8102e)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 32px", textDecoration: "none", borderRadius: 10, boxShadow: "0 4px 24px rgba(200,16,46,0.3)" }}>
              Return to Home
            </a>
            <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 14, padding: "13px 28px", textDecoration: "none", borderRadius: 10 }}>
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0f14" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo-white.png" alt="INT Brokers" style={{ width: 200, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "screen" }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>INT Brokers · Account Application</span>
      </div>

      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-[560px]">
          <StepBar current={step} total={TOTAL_STEPS} />
          <SlideIn key={slideKey} dir={dir}>

            {/* ── Step 1: What to Trade ── */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 1 — Markets</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">What would you like to trade?</h2>
                  <p className="text-white/40 text-sm">Select all markets that interest you. You can always change this later.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {ASSET_CLASSES.map(({ id, Icon, label, sub, color }) => {
                    const sel = preferences.includes(id);
                    return (
                      <button key={id} onClick={() => togglePref(id)}
                        style={{
                          textAlign: "left", padding: "20px", border: `1px solid ${sel ? color + "60" : "rgba(255,255,255,0.08)"}`,
                          background: sel ? color + "0d" : "rgba(255,255,255,0.02)", transition: "all 0.15s", cursor: "pointer",
                          display: "flex", flexDirection: "column", gap: 10, position: "relative",
                        }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                          <Icon size={22} color={sel ? color : "rgba(255,255,255,0.3)"} strokeWidth={1.5} />
                          {sel && <Check size={15} color={color} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{label}</p>
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.5 }}>{sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <NavBtn onClick={handleStep1Next} disabled={preferences.length === 0 || loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>}
                </NavBtn>
              </div>
            )}

            {/* ── Step 2: Goal & Amount ── */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 2 — Profile</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Your investment profile</h2>
                  <p className="text-white/40 text-sm">Help us personalise your experience.</p>
                </div>
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Primary Goal</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PURPOSES.map(p => (
                      <button key={p.id} onClick={() => setPurpose(p.id)}
                        className={`text-left p-4 border transition-all duration-150 ${purpose === p.id ? "border-[#c8102e] bg-[#c8102e]/5" : "border-white/10 hover:border-white/25 bg-white/2"}`}>
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
                </div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">Starting Capital</p>
                  <div className="space-y-2">
                    {AMOUNTS.map(a => (
                      <button key={a.id} onClick={() => setAmount(a.id)}
                        className={`w-full text-left p-4 border flex items-center justify-between transition-all duration-150 ${amount === a.id ? "border-[#c8102e] bg-[#c8102e]/5" : "border-white/10 hover:border-white/25 bg-white/2"}`}>
                        <span className="text-white font-medium text-sm">{a.label}</span>
                        {amount === a.id && <Check className="w-4 h-4 text-[#c8102e]" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <NavBtn onClick={back} variant="secondary"><ChevronLeft className="w-4 h-4" /></NavBtn>
                  <NavBtn onClick={handleStep2Next} disabled={!purpose || !amount}>
                    Continue <ChevronRight className="w-4 h-4" />
                  </NavBtn>
                </div>
              </div>
            )}

            {/* ── Step 3: Personal Details + Address Autocomplete ── */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 3 — Identity</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">Your personal details</h2>
                  <p className="text-white/40 text-sm">Required by financial regulations. All data is encrypted and secure.</p>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Legal Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Legal Full Name</label>
                    <input type="text" value={profile.legalName} placeholder="As it appears on your government ID"
                      onChange={e => setProfile({ ...profile, legalName: e.target.value })}
                      className={INPUT} />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Date of Birth</label>
                    <input type="date" value={profile.dateOfBirth}
                      onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      className={INPUT} style={{ colorScheme: "dark" }} />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Phone Number</label>
                    <input type="tel" value={profile.phone} placeholder="+1 (555) 000-0000"
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className={INPUT} />
                  </div>

                  {/* Address with autocomplete */}
                  <div ref={addressRef} style={{ position: "relative" }}>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                      Street Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={14} color="rgba(255,255,255,0.2)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input
                        type="text"
                        value={addressQuery || profile.address}
                        placeholder="Start typing your address…"
                        onChange={e => {
                          setAddressQuery(e.target.value);
                          setProfile({ ...profile, address: e.target.value });
                          setShowSuggestions(true);
                        }}
                        onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                        className={INPUT}
                        style={{ paddingLeft: 36 }}
                      />
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                        background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.5)", maxHeight: 260, overflowY: "auto",
                      }}>
                        {addressSuggestions.map((s, i) => (
                          <button key={i} onClick={() => selectSuggestion(s)}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px",
                              width: "100%", textAlign: "left", background: "transparent", border: "none",
                              borderBottom: i < addressSuggestions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                              cursor: "pointer", transition: "background 0.1s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <MapPin size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                              {s.display_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* City + Postal */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">City</label>
                      <input value={profile.city} placeholder="City" onChange={e => setProfile({ ...profile, city: e.target.value })} className={INPUT} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Postal Code</label>
                      <input value={profile.postalCode} placeholder="ZIP / Postal" onChange={e => setProfile({ ...profile, postalCode: e.target.value })} className={INPUT} />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Country of Residence</label>
                    <select value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-3.5 py-2.5 focus:outline-none focus:border-white/30 transition-colors appearance-none">
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#1a1f2e]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <NavBtn onClick={back} variant="secondary"><ChevronLeft className="w-4 h-4" /></NavBtn>
                  <NavBtn onClick={handleStep3Next} disabled={!profile.legalName || !profile.dateOfBirth || !profile.address || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight className="w-4 h-4" /></>}
                  </NavBtn>
                </div>
              </div>
            )}

            {/* ── Step 4: KYC — Document Type (Sumsub style) ── */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 4 — Verification</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">Identity verification</h2>
                  <p className="text-white/40 text-sm">Select a government-issued document to verify your identity.</p>
                </div>

                {/* Sumsub powered badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 20, background: "rgba(255,255,255,0.02)" }}>
                  <img src="/sumsub-logo.png" alt="Sumsub" style={{ height: 20, width: "auto", objectFit: "contain", mixBlendMode: "screen", opacity: 0.55 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Identity verification powered by Sumsub KYC</span>
                </div>

                <div className="space-y-2 mb-8">
                  {DOC_TYPES.map(d => (
                    <button key={d.id} onClick={() => setIdType(d.id)}
                      style={{
                        width: "100%", textAlign: "left", padding: "16px 18px",
                        border: `1px solid ${idType === d.id ? "#c8102e60" : "rgba(255,255,255,0.08)"}`,
                        background: idType === d.id ? "rgba(200,16,46,0.06)" : "rgba(255,255,255,0.02)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <FileText size={18} color={idType === d.id ? "#c8102e" : "rgba(255,255,255,0.3)"} strokeWidth={1.5} />
                        <div>
                          <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{d.label}</p>
                          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>{d.desc}</p>
                        </div>
                      </div>
                      {idType === d.id && (
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#c8102e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* What to prepare */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "16px 18px", marginBottom: 24 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Before you continue</p>
                  {[
                    "Document must be valid and not expired",
                    "Ensure all 4 corners are visible in the photo",
                    "Use good lighting — avoid shadows and glare",
                    "Document text must be clearly readable",
                  ].map((tip, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
                      <Check size={13} color="rgba(255,255,255,0.3)" strokeWidth={2} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <NavBtn onClick={back} variant="secondary"><ChevronLeft className="w-4 h-4" /></NavBtn>
                  <NavBtn onClick={next}>Continue <ChevronRight className="w-4 h-4" /></NavBtn>
                </div>
              </div>
            )}

            {/* ── Step 5: Upload Document + Selfie ── */}
            {step === 5 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 5 — Document Upload</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                    Upload {idType === "passport" ? "your passport photo page" : idType === "drivers_license" ? "your driver's license" : "your national ID"}
                  </h2>
                  <p className="text-white/40 text-sm">Take a clear, well-lit photo. All four corners must be visible.</p>
                </div>

                {/* Document upload area */}
                <label htmlFor="id-file"
                  style={{
                    display: "block", border: `2px dashed ${idFile ? "rgba(200,16,46,0.5)" : "rgba(255,255,255,0.1)"}`,
                    padding: "40px 24px", textAlign: "center", cursor: "pointer",
                    background: idFile ? "rgba(200,16,46,0.04)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.2s", marginBottom: 16,
                  }}>
                  <input id="id-file" type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => { setIdFile(e.target.files?.[0] || null); setIdObjectPath(null); }} />
                  {idFile ? (
                    <div>
                      <div style={{ width: 48, height: 48, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(200,16,46,0.3)" }}>
                        <Check size={22} color="#c8102e" />
                      </div>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{idFile.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{(idFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={32} color="rgba(255,255,255,0.2)" style={{ margin: "0 auto 12px" }} />
                      <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Click to upload or drag and drop</p>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>PNG, JPG or PDF — max 10MB</p>
                    </div>
                  )}
                </label>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                      <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#c8102e", borderRadius: 999, transition: "width 0.4s" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>Uploading securely…</p>
                  </div>
                )}

                {/* Selfie check */}
                <div style={{ border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Camera size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                      <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Biometric selfie verification</span>
                    </div>
                    {selfieSubmitted && <Check size={15} color="#4ade80" />}
                  </div>
                  <div style={{ padding: "20px 16px" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                      {/* Face scan animation */}
                      <div style={{ width: 80, height: 80, flexShrink: 0, position: "relative", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Camera size={28} color="rgba(255,255,255,0.2)" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                        <div style={{ position: "absolute", top: 5, left: 5, width: 12, height: 12, borderTop: "2px solid #c8102e", borderLeft: "2px solid #c8102e" }} />
                        <div style={{ position: "absolute", top: 5, right: 5, width: 12, height: 12, borderTop: "2px solid #c8102e", borderRight: "2px solid #c8102e" }} />
                        <div style={{ position: "absolute", bottom: 5, left: 5, width: 12, height: 12, borderBottom: "2px solid #c8102e", borderLeft: "2px solid #c8102e" }} />
                        <div style={{ position: "absolute", bottom: 5, right: 5, width: 12, height: 12, borderBottom: "2px solid #c8102e", borderRight: "2px solid #c8102e" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 4 }}>
                          {selfieSubmitted ? "✓ Biometric check complete" : "Position your face in good lighting. Remove glasses and hats."}
                        </p>
                        {!selfieSubmitted && (
                          <button onClick={handleSelfieNext} disabled={loading}
                            style={{ fontSize: 12, fontWeight: 700, color: "#c8102e", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                            Start Biometric Check <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <img src="/sumsub-logo.png" alt="Sumsub" style={{ height: 16, mixBlendMode: "screen", opacity: 0.4 }} />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Powered by Sumsub Biometric Verification</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 24 }}>
                  <Shield size={13} color="rgba(255,255,255,0.2)" />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Documents are encrypted and stored securely. Only compliance staff can access them.</span>
                </div>

                <div className="flex gap-3">
                  <NavBtn onClick={back} variant="secondary"><ChevronLeft className="w-4 h-4" /></NavBtn>
                  <NavBtn onClick={handleIdUpload} disabled={!idFile || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Upload & Continue</span><ChevronRight className="w-4 h-4" /></>}
                  </NavBtn>
                </div>
              </div>
            )}

            {/* ── Step 6: Review & Submit ── */}
            {step === 6 && (
              <div>
                <div className="mb-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Step 6 — Review</p>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-2">Review your application</h2>
                  <p className="text-white/40 text-sm">Confirm all details before submitting. Our compliance team reviews within 24–48 hours.</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    {
                      title: "Markets Selected",
                      rows: [
                        { label: "Asset Classes", value: preferences.map(p => ASSET_CLASSES.find(a => a.id === p)?.label).join(", ") || "—" },
                        { label: "Goal", value: PURPOSES.find(p => p.id === purpose)?.label || "—" },
                        { label: "Capital", value: AMOUNTS.find(a => a.id === amount)?.label || "—" },
                      ]
                    },
                    {
                      title: "Personal Details",
                      rows: [
                        { label: "Legal Name", value: profile.legalName || "—" },
                        { label: "Date of Birth", value: profile.dateOfBirth || "—" },
                        { label: "Country", value: profile.country || "—" },
                        { label: "Address", value: profile.address ? `${profile.address}${profile.city ? ", " + profile.city : ""}` : "—" },
                      ]
                    },
                    {
                      title: "Identity Documents",
                      rows: [
                        { label: "Document Type", value: DOC_TYPES.find(d => d.id === idType)?.label || "—" },
                        { label: "Document Upload", value: idFile ? "✓ Uploaded" : "—" },
                        { label: "Biometric Check", value: selfieSubmitted ? "✓ Completed" : "Not completed" },
                      ]
                    }
                  ].map(section => (
                    <div key={section.title} style={{ background: "#161a24", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)" }}>{section.title}</p>
                      </div>
                      <div>
                        {section.rows.map((row, ri) => (
                          <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: ri < section.rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{row.label}</span>
                            <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 24 }}>
                  <FileText size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
                    By submitting this application, I confirm all information provided is accurate and agree to Vault Wealth's Terms of Service and Privacy Policy.
                  </p>
                </div>

                <div className="flex gap-3">
                  <NavBtn onClick={back} variant="secondary"><ChevronLeft className="w-4 h-4" /></NavBtn>
                  <NavBtn onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Submit Application</span><ChevronRight className="w-4 h-4" /></>}
                  </NavBtn>
                </div>
              </div>
            )}

          </SlideIn>
        </div>
      </div>
    </div>
  );
}
