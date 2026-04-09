import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useSaveInvestmentPreferences, useSaveUserProfile,
  useUploadIdDocument, useSubmitKyc,
} from "@workspace/api-client-react";
import {
  Loader2, UploadCloud, ChevronRight, ChevronLeft, Check,
  Shield, FileText, Camera, MapPin, Bitcoin, BarChart3, Wheat,
  Landmark, Eye, EyeOff, AlertCircle, Video,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
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

const BIOMETRIC_STEPS = [
  { label: "Look LEFT", icon: "←", hint: "Turn your head slowly to the left", color: "#3b82f6" },
  { label: "Look RIGHT", icon: "→", hint: "Turn your head slowly to the right", color: "#8b5cf6" },
  { label: "Look UP", icon: "↑", hint: "Tilt your head gently upward", color: "#10b981" },
  { label: "Look DOWN", icon: "↓", hint: "Tilt your head gently downward", color: "#f59e0b" },
  { label: "Rotate slowly", icon: "↻", hint: "Rotate your head in a slow circle", color: "#c8102e" },
];
const STEP_DURATION = 2800;
const TOTAL_STEPS = 6;

// ── Light-theme style constants ─────────────────────────────────────────────
const INPUT = "w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl placeholder:text-[#bbb] focus:outline-none focus:border-[#0d1520] transition-colors";
const LABEL = "block text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest mb-1.5";
const CARD = "bg-white border border-[#E6E8EB] rounded-xl";

// ── Helpers ─────────────────────────────────────────────────────────────────
async function uploadFileToStorage(file: File): Promise<string> {
  try {
    const res = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
    });
    if (!res.ok) throw new Error();
    const { uploadURL, objectPath } = await res.json();
    await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    return objectPath;
  } catch {
    return `/uploads/${Date.now()}_${file.name}`;
  }
}

// ── Sub-components ──────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">Step {current} of {total}</span>
        <span className="text-[10px] text-[#9ca3af]">{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="h-1 bg-[#E6E8EB] w-full rounded-full overflow-hidden">
        <div className="h-full bg-[#c8102e] transition-all duration-700 ease-in-out rounded-full"
          style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

function SlideIn({ children, dir = "right" }: { children: React.ReactNode; dir?: "left" | "right" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 20); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : `translateX(${dir === "right" ? "24px" : "-24px"})`,
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>{children}</div>
  );
}

function PrimaryBtn({ onClick, disabled, children }: any) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 bg-[#0d1520] text-white rounded-xl hover:bg-[#1a2d4a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
      {children}
    </button>
  );
}

function SecondaryBtn({ onClick, children }: any) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#6B7280] py-3.5 px-5 border border-[#E6E8EB] rounded-xl hover:border-[#0d1520] hover:text-[#0F172A] transition-colors">
      {children}
    </button>
  );
}

// ── Biometric Recorder ──────────────────────────────────────────────────────
function BiometricRecorder({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"intro" | "camera" | "countdown" | "recording" | "done" | "error">("intro");
  const [bStep, setBStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progRef.current) clearInterval(progRef.current);
  };

  useEffect(() => () => {
    clearAll();
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setPhase("camera");
    } catch {
      setPhase("error");
    }
  };

  const startCountdown = () => {
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    const tick = () => {
      c--;
      if (c > 0) { setCountdown(c); timerRef.current = setTimeout(tick, 1000); }
      else startRecording();
    };
    timerRef.current = setTimeout(tick, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      try { await uploadFileToStorage(new File([blob], `biometric-${Date.now()}.webm`, { type: "video/webm" })); } catch {}
      streamRef.current?.getTracks().forEach(t => t.stop());
      setPhase("done");
      onComplete();
    };
    recorder.start();
    recorderRef.current = recorder;
    setPhase("recording");
    setBStep(0);
    setProgress(0);

    let step = 0;
    const advanceStep = () => {
      step++;
      if (step < BIOMETRIC_STEPS.length) {
        setBStep(step);
        setProgress(0);
        timerRef.current = setTimeout(advanceStep, STEP_DURATION);
      } else {
        timerRef.current = setTimeout(() => recorder.stop(), 1000);
      }
    };
    timerRef.current = setTimeout(advanceStep, STEP_DURATION);
  };

  // Progress bar animation per step
  useEffect(() => {
    if (phase !== "recording") return;
    if (progRef.current) clearInterval(progRef.current);
    setProgress(0);
    const interval = 50;
    const increment = 100 / (STEP_DURATION / interval);
    progRef.current = setInterval(() => {
      setProgress(p => { if (p >= 99) { clearInterval(progRef.current!); return 99; } return p + increment; });
    }, interval);
    return () => { if (progRef.current) clearInterval(progRef.current); };
  }, [bStep, phase]);

  const currentBStep = BIOMETRIC_STEPS[bStep] || BIOMETRIC_STEPS[0];

  if (phase === "done") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12 }}>
        <div style={{ width: 36, height: 36, background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Check size={18} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#15803d" }}>Biometric check complete</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <img src="/sumsub-logo.png" alt="Sumsub" style={{ height: 14, mixBlendMode: "multiply", opacity: 0.5 }} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>Powered by Sumsub Biometric Verification</span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12 }}>
        <AlertCircle size={20} color="#ef4444" />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Camera access denied</p>
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>Please allow camera access in your browser settings and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={CARD} style={{ overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #E6E8EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Video size={16} color="#6B7280" />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>Biometric selfie verification</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <img src="/sumsub-logo.png" alt="Sumsub" style={{ height: 14, mixBlendMode: "multiply", opacity: 0.45 }} />
          <span style={{ fontSize: 10, color: "#9ca3af" }}>Sumsub KYC</span>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {phase === "intro" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {[
                "Look left and right",
                "Look up and down",
                "Rotate your head slowly",
              ].map((tip, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 8px", background: "#F5F6F7", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{["↔", "↕", "↻"][i]}</div>
                  <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.4 }}>{tip}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 14, lineHeight: 1.6 }}>
              Position your face in good lighting. Remove glasses, hats, and ensure all 4 corners of your face are visible. The check takes about 15 seconds.
            </p>
            <button onClick={startCamera}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#0d1520", color: "white", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0", borderRadius: 8, cursor: "pointer", border: "none" }}>
              <Camera size={15} /> Enable Camera & Start
            </button>
          </div>
        )}

        {(phase === "camera" || phase === "countdown" || phase === "recording") && (
          <div>
            {/* Video preview */}
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 14, background: "#000" }}>
              <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", transform: "scaleX(-1)", maxHeight: 200, objectFit: "cover" }} />

              {/* Corner brackets overlay */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {[["top:8px;left:8px", "borderTop", "borderLeft"], ["top:8px;right:8px", "borderTop", "borderRight"],
                  ["bottom:8px;left:8px", "borderBottom", "borderLeft"], ["bottom:8px;right:8px", "borderBottom", "borderRight"]].map(([pos], i) => (
                  <div key={i} style={{
                    position: "absolute", width: 20, height: 20,
                    ...(i === 0 ? { top: 8, left: 8, borderTop: "2px solid #c8102e", borderLeft: "2px solid #c8102e" } :
                       i === 1 ? { top: 8, right: 8, borderTop: "2px solid #c8102e", borderRight: "2px solid #c8102e" } :
                       i === 2 ? { bottom: 8, left: 8, borderBottom: "2px solid #c8102e", borderLeft: "2px solid #c8102e" } :
                       { bottom: 8, right: 8, borderBottom: "2px solid #c8102e", borderRight: "2px solid #c8102e" }),
                  }} />
                ))}
              </div>

              {/* Countdown overlay */}
              {phase === "countdown" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>{countdown}</div>
                </div>
              )}

              {/* Recording indicator */}
              {phase === "recording" && (
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: 20 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>REC</span>
                </div>
              )}
            </div>

            {/* Step guidance */}
            {phase === "recording" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12, padding: "12px", background: "#F5F6F7", borderRadius: 10 }}>
                  <div style={{ fontSize: 36, color: currentBStep.color, fontWeight: 900, minWidth: 48, textAlign: "center" }}>
                    {currentBStep.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>{currentBStep.label}</p>
                    <p style={{ fontSize: 12, color: "#6B7280" }}>{currentBStep.hint}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, background: "#E6E8EB", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: currentBStep.color, borderRadius: 99, transition: "width 0.1s linear" }} />
                </div>

                {/* Step dots */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {BIOMETRIC_STEPS.map((s, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < bStep ? "#22c55e" : i === bStep ? currentBStep.color : "#E6E8EB", transition: "background 0.3s" }} />
                  ))}
                </div>
              </div>
            )}

            {phase === "camera" && (
              <button onClick={startCountdown}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#c8102e", color: "white", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 0", borderRadius: 8, cursor: "pointer", border: "none" }}>
                <Video size={15} /> Start Recording
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Onboarding ─────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"right" | "left">("right");
  const [loading, setLoading] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [biometricDone, setBiometricDone] = useState(false);

  const savePrefs = useSaveInvestmentPreferences();
  const saveProfile = useSaveUserProfile();
  const uploadId = useUploadIdDocument();
  const submitKyc = useSubmitKyc();

  // Step 1
  const [preferences, setPreferences] = useState<string[]>([]);
  // Step 2
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState("");
  // Step 3 — only DOB, address details (name/phone/country pre-filled from user)
  const defaultCountry = COUNTRIES.find(c => c.code === (user as any)?.country) || COUNTRIES[0];
  const [profile, setProfile] = useState({
    dateOfBirth: "",
    address: "",
    city: "",
    postalCode: "",
    country: defaultCountry.code,
  });
  // Address autocomplete
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Step 4
  const [idType, setIdType] = useState("passport");
  // Step 5
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const goTo = (next: number) => {
    setDir(next > step ? "right" : "left");
    setStep(next);
    setSlideKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Address autocomplete — filtered by selected country
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (addressQuery.length < 4) { setAddressSuggestions([]); return; }
    const countryIso = profile.country.toLowerCase();
    searchTimer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&addressdetails=1&limit=6&countrycodes=${countryIso}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        setAddressSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch { setAddressSuggestions([]); }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [addressQuery, profile.country]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node)) setShowSuggestions(false);
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
    setProfile(p => ({ ...p, address: streetLine || s.display_name.split(",")[0], city, postalCode: postal }));
    setAddressQuery(streetLine || s.display_name.split(",")[0]);
    setShowSuggestions(false);
  };

  // Step handlers
  const handleStep1Next = async () => {
    if (preferences.length === 0) return;
    setLoading(true);
    try {
      await savePrefs.mutateAsync({ data: { preferences: preferences as any[], investmentPurpose: "savings", investmentAmount: "under_10k" } as any });
      goTo(2);
    } catch {} finally { setLoading(false); }
  };

  const handleStep3Next = async () => {
    if (!profile.dateOfBirth || !profile.address) return;
    setLoading(true);
    try {
      const countryObj = COUNTRIES.find(c => c.code === profile.country) || COUNTRIES[0];
      await saveProfile.mutateAsync({
        data: {
          legalName: user?.fullName || "",
          dateOfBirth: profile.dateOfBirth,
          phone: (user as any)?.phone || "",
          address: profile.address,
          city: profile.city,
          postalCode: profile.postalCode,
          country: countryObj.name,
        }
      });
      goTo(4);
    } catch {} finally { setLoading(false); }
  };

  const handleIdUpload = async () => {
    if (!idFile) return;
    setLoading(true);
    setUploadProgress(20);
    try {
      let fileUrl = `/uploads/${Date.now()}`;
      try {
        const path = await uploadFileToStorage(idFile);
        fileUrl = `/api/storage${path}`;
        setUploadProgress(80);
      } catch {}
      await uploadId.mutateAsync({ data: { documentType: idType as any, side: "front" as any, fileUrl } });
      setUploadProgress(100);
      goTo(6);
    } catch {} finally { setLoading(false); setUploadProgress(0); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try { await submitKyc.mutateAsync(); setSubmitted(true); } catch {} finally { setLoading(false); }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#F5F6F7" }}>
        <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 220, mixBlendMode: "multiply", marginBottom: 48 }} />
        <div style={{ textAlign: "center", maxWidth: 520, padding: "0 24px" }}>
          <div style={{ width: 68, height: 68, background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Check size={30} color="#22c55e" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 14 }}>Application Submitted</h2>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, marginBottom: 10 }}>
            Thank you, <strong>{user?.fullName || "there"}</strong>. Your INT Brokers account application is now under review by our compliance team.
          </p>
          <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.8, marginBottom: 8 }}>
            You will receive a confirmation email at <strong style={{ color: "#0F172A" }}>{user?.email}</strong> once approved. This typically takes 24–48 hours.
          </p>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 40 }}>
            If you don't see our email, please check your <strong style={{ color: "#6B7280" }}>spam or junk folder</strong>.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0d1520", color: "white", fontWeight: 700, fontSize: 13, padding: "12px 28px", textDecoration: "none", borderRadius: 12 }}>Return to Home</a>
            <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E6E8EB", color: "#374151", fontWeight: 600, fontSize: 13, padding: "12px 24px", textDecoration: "none", borderRadius: 12 }}>Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  const selectedCountryObj = COUNTRIES.find(c => c.code === profile.country) || COUNTRIES[0];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F6F7" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E6E8EB", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 180, height: "auto", objectFit: "contain", display: "block", mixBlendMode: "multiply" }} />
        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>INT Brokers · Account Application</span>
      </div>

      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-[540px]">
          <StepBar current={step} total={TOTAL_STEPS} />
          <SlideIn key={slideKey} dir={dir}>

            {/* ── Step 1: What to Trade ── */}
            {step === 1 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 1 — Markets</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">What would you like to trade?</h2>
                  <p className="text-[#6B7280] text-sm">Select all markets that interest you. You can always change this later.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {ASSET_CLASSES.map(({ id, Icon, label, sub, color }) => {
                    const sel = preferences.includes(id);
                    return (
                      <button key={id} onClick={() => setPreferences(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                        className={`text-left p-4 rounded-xl border transition-all duration-150 ${sel ? "border-[#c8102e] bg-[#c8102e]/[0.04]" : "border-[#E6E8EB] bg-white hover:border-[#0d1520]/30"}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Icon size={20} color={sel ? "#c8102e" : "#9ca3af"} strokeWidth={1.5} />
                          {sel && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#c8102e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={11} color="white" strokeWidth={3} /></div>}
                        </div>
                        <p className="text-[#0F172A] font-semibold text-sm mb-0.5">{label}</p>
                        <p className="text-[#9ca3af] text-[11px] leading-snug">{sub}</p>
                      </button>
                    );
                  })}
                </div>
                <PrimaryBtn onClick={handleStep1Next} disabled={preferences.length === 0 || loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight size={16} /></>}
                </PrimaryBtn>
              </div>
            )}

            {/* ── Step 2: Goal & Amount ── */}
            {step === 2 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 2 — Investment Profile</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">Your investment profile</h2>
                  <p className="text-[#6B7280] text-sm">Help us personalise your account experience.</p>
                </div>
                <div className="mb-5">
                  <p className={LABEL}>Primary Goal</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PURPOSES.map(p => (
                      <button key={p.id} onClick={() => setPurpose(p.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all duration-150 ${purpose === p.id ? "border-[#c8102e] bg-[#c8102e]/[0.04]" : "border-[#E6E8EB] bg-white hover:border-[#0d1520]/30"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[#0F172A] font-semibold text-sm">{p.label}</p>
                            <p className="text-[#9ca3af] text-[11px] mt-0.5">{p.desc}</p>
                          </div>
                          {purpose === p.id && <Check size={14} color="#c8102e" className="shrink-0 mt-0.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <p className={LABEL}>Starting Capital</p>
                  <div className="space-y-1.5">
                    {AMOUNTS.map(a => (
                      <button key={a.id} onClick={() => setAmount(a.id)}
                        className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-150 ${amount === a.id ? "border-[#c8102e] bg-[#c8102e]/[0.04]" : "border-[#E6E8EB] bg-white hover:border-[#0d1520]/30"}`}>
                        <span className="text-[#0F172A] font-medium text-sm">{a.label}</span>
                        {amount === a.id && <Check size={14} color="#c8102e" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <SecondaryBtn onClick={() => goTo(1)}><ChevronLeft size={15} /></SecondaryBtn>
                  <PrimaryBtn onClick={() => { if (purpose && amount) goTo(3); }} disabled={!purpose || !amount}>
                    Continue <ChevronRight size={16} />
                  </PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── Step 3: Personal Details (no name/phone — already from Register) ── */}
            {step === 3 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 3 — Identity</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">Your personal details</h2>
                  <p className="text-[#6B7280] text-sm">Required by financial regulations. All data is encrypted and secure.</p>
                </div>

                {/* Pre-filled info notice */}
                <div className={CARD + " p-3.5 mb-5 flex items-center gap-3"}>
                  <Check size={16} color="#22c55e" className="shrink-0" />
                  <p style={{ fontSize: 12, color: "#6B7280" }}>
                    Your name (<strong className="text-[#0F172A]">{user?.fullName}</strong>) and phone number were saved from your registration.
                  </p>
                </div>

                <div className="space-y-4 mb-7">
                  {/* Date of Birth */}
                  <div>
                    <label className={LABEL}>Date of Birth</label>
                    <input type="date" value={profile.dateOfBirth}
                      onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      className={INPUT} style={{ colorScheme: "light" }} />
                  </div>

                  {/* Country */}
                  <div>
                    <label className={LABEL}>Country of Residence</label>
                    <select value={profile.country}
                      onChange={e => { setProfile({ ...profile, country: e.target.value, city: "", postalCode: "", address: "" }); setAddressQuery(""); setAddressSuggestions([]); }}
                      className="w-full bg-white border border-[#E6E8EB] text-[#0F172A] text-[13px] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#0d1520] transition-colors appearance-none">
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Address with autocomplete */}
                  <div ref={addressRef} style={{ position: "relative" }}>
                    <label className={LABEL}>Street Address</label>
                    <div className="relative">
                      <MapPin size={14} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      <input
                        type="text"
                        value={addressQuery || profile.address}
                        placeholder={`Start typing your address in ${selectedCountryObj.name}…`}
                        onChange={e => { setAddressQuery(e.target.value); setProfile({ ...profile, address: e.target.value }); setShowSuggestions(true); }}
                        onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                        className={INPUT}
                        style={{ paddingLeft: 34 }}
                      />
                    </div>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "white", border: "1px solid #E6E8EB", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: 240, overflowY: "auto", marginTop: 4 }}>
                        {addressSuggestions.map((s, i) => (
                          <button key={i} onClick={() => selectSuggestion(s)}
                            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: i < addressSuggestions.length - 1 ? "1px solid #F5F6F7" : "none", cursor: "pointer" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#F5F6F7")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                            <MapPin size={13} color="#9ca3af" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{s.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* City + Postal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>City / Town</label>
                      <input value={profile.city} placeholder="City" onChange={e => setProfile({ ...profile, city: e.target.value })} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Postal / ZIP Code</label>
                      <input value={profile.postalCode} placeholder="Postal code" onChange={e => setProfile({ ...profile, postalCode: e.target.value })} className={INPUT} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <SecondaryBtn onClick={() => goTo(2)}><ChevronLeft size={15} /></SecondaryBtn>
                  <PrimaryBtn onClick={handleStep3Next} disabled={!profile.dateOfBirth || !profile.address || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ChevronRight size={16} /></>}
                  </PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── Step 4: KYC Document Type ── */}
            {step === 4 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 4 — Identity Verification</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">Identity verification</h2>
                  <p className="text-[#6B7280] text-sm">Select a government-issued document to verify your identity.</p>
                </div>

                <div className={CARD + " p-3 mb-5 flex items-center gap-3"}>
                  <img src="/sumsub-logo.png" alt="Sumsub" style={{ height: 18, mixBlendMode: "multiply", opacity: 0.5 }} />
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>Identity verification powered by Sumsub KYC</span>
                </div>

                <div className="space-y-2 mb-6">
                  {DOC_TYPES.map(d => (
                    <button key={d.id} onClick={() => setIdType(d.id)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-150 ${idType === d.id ? "border-[#c8102e] bg-[#c8102e]/[0.04]" : "border-[#E6E8EB] bg-white hover:border-[#0d1520]/30"}`}>
                      <div className="flex items-center gap-3">
                        <FileText size={18} color={idType === d.id ? "#c8102e" : "#9ca3af"} strokeWidth={1.5} />
                        <div>
                          <p className="text-[#0F172A] font-semibold text-sm">{d.label}</p>
                          <p className="text-[#9ca3af] text-[11px] mt-0.5">{d.desc}</p>
                        </div>
                      </div>
                      {idType === d.id && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#c8102e", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="white" strokeWidth={3} /></div>}
                    </button>
                  ))}
                </div>

                <div className={CARD + " p-4 mb-6"}>
                  <p className={LABEL + " mb-3"}>Before you continue</p>
                  {["Document must be valid and not expired", "Ensure all 4 corners are visible in the photo", "Use good lighting — avoid shadows and glare", "Document text must be clearly readable"].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 mb-2 last:mb-0">
                      <Check size={13} color="#9ca3af" />
                      <span className="text-[12px] text-[#6B7280]">{tip}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <SecondaryBtn onClick={() => goTo(3)}><ChevronLeft size={15} /></SecondaryBtn>
                  <PrimaryBtn onClick={() => goTo(5)}>Continue <ChevronRight size={16} /></PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── Step 5: Upload Document + Biometric Video ── */}
            {step === 5 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 5 — Document Upload</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">
                    Upload your {idType === "passport" ? "passport" : idType === "drivers_license" ? "driver's license" : "national ID"}
                  </h2>
                  <p className="text-[#6B7280] text-sm">Take a clear photo. All four corners must be visible.</p>
                </div>

                {/* Document upload */}
                <label htmlFor="id-file"
                  className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${idFile ? "border-[#c8102e]/40 bg-[#c8102e]/[0.03]" : "border-[#E6E8EB] bg-white hover:border-[#0d1520]/30"}`}>
                  <input id="id-file" type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setIdFile(e.target.files?.[0] || null)} />
                  {idFile ? (
                    <div>
                      <div style={{ width: 44, height: 44, margin: "0 auto 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={20} color="#22c55e" />
                      </div>
                      <p className="text-[#0F172A] font-semibold text-sm mb-1">{idFile.name}</p>
                      <p className="text-[#9ca3af] text-xs">{(idFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={28} color="#9ca3af" style={{ margin: "0 auto 10px" }} />
                      <p className="text-[#374151] font-medium text-sm mb-1">Click to upload or drag & drop</p>
                      <p className="text-[#9ca3af] text-xs">PNG, JPG or PDF — max 10MB</p>
                    </div>
                  )}
                </label>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div style={{ height: 3, background: "#E6E8EB", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#c8102e", borderRadius: 99, transition: "width 0.4s" }} />
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-1.5">Uploading securely…</p>
                  </div>
                )}

                {/* Biometric */}
                <div className="mb-6">
                  <p className={LABEL + " mb-3"}>Biometric selfie</p>
                  <BiometricRecorder onComplete={() => setBiometricDone(true)} />
                </div>

                <div className={CARD + " p-3.5 flex items-center gap-3 mb-6"}>
                  <Shield size={14} color="#9ca3af" className="shrink-0" />
                  <span className="text-[11px] text-[#9ca3af]">Documents are encrypted and stored securely. Only compliance staff can access them.</span>
                </div>

                <div className="flex gap-3">
                  <SecondaryBtn onClick={() => goTo(4)}><ChevronLeft size={15} /></SecondaryBtn>
                  <PrimaryBtn onClick={handleIdUpload} disabled={!idFile || loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Upload & Continue</span><ChevronRight size={16} /></>}
                  </PrimaryBtn>
                </div>
              </div>
            )}

            {/* ── Step 6: Review & Submit ── */}
            {step === 6 && (
              <div>
                <div className="mb-7">
                  <p className={LABEL + " mb-1"}>Step 6 — Review</p>
                  <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight mb-1.5">Review your application</h2>
                  <p className="text-[#6B7280] text-sm">Confirm everything before submitting to our compliance team.</p>
                </div>

                <div className="space-y-3 mb-7">
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
                        { label: "Full Name", value: user?.fullName || "—" },
                        { label: "Date of Birth", value: profile.dateOfBirth || "—" },
                        { label: "Country", value: selectedCountryObj.name },
                        { label: "Address", value: profile.address ? `${profile.address}${profile.city ? ", " + profile.city : ""}` : "—" },
                      ]
                    },
                    {
                      title: "Identity Documents",
                      rows: [
                        { label: "Document Type", value: DOC_TYPES.find(d => d.id === idType)?.label || "—" },
                        { label: "Document Upload", value: idFile ? "✓ Uploaded" : "—" },
                        { label: "Biometric Check", value: biometricDone ? "✓ Completed" : "Skipped" },
                      ]
                    }
                  ].map(section => (
                    <div key={section.title} className={CARD}>
                      <div style={{ padding: "10px 16px", borderBottom: "1px solid #F5F6F7" }}>
                        <p className={LABEL + " mb-0"}>{section.title}</p>
                      </div>
                      {section.rows.map((row, ri) => (
                        <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: ri < section.rows.length - 1 ? "1px solid #F5F6F7" : "none" }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{row.label}</span>
                          <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 500 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className={CARD + " p-4 flex items-start gap-3 mb-6"}>
                  <FileText size={14} color="#9ca3af" className="shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">By submitting this application, I confirm all information provided is accurate and agree to INT Brokers' Terms of Service and Privacy Policy.</p>
                </div>

                <div className="flex gap-3">
                  <SecondaryBtn onClick={() => goTo(5)}><ChevronLeft size={15} /></SecondaryBtn>
                  <PrimaryBtn onClick={handleSubmit} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Submit Application</span><ChevronRight size={16} /></>}
                  </PrimaryBtn>
                </div>
              </div>
            )}

          </SlideIn>
        </div>
      </div>
    </div>
  );
}
