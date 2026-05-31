import { useState } from "react";
import { useGetUserBalance, useGetTransactions } from "@workspace/api-client-react";
import { Loader2, RefreshCw, ChevronDown, ChevronRight, Check, Building2, ArrowLeft, Bitcoin, Landmark, TrendingUp, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { AssetIcon } from "@/components/AssetIcon";
import { useIsMobile } from "@/hooks/use-mobile";

const fmt = (n: number) =>
  n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";

const US_BANKS = [
  { name: "Chase",           routing: "021000021", logo: "https://assets.parqet.com/logos/symbol/JPM?format=png" },
  { name: "Bank of America", routing: "026009593", logo: "https://assets.parqet.com/logos/symbol/BAC?format=png" },
  { name: "Wells Fargo",     routing: "121042882", logo: "https://assets.parqet.com/logos/symbol/WFC?format=png" },
  { name: "Citibank",        routing: "021000089", logo: "https://assets.parqet.com/logos/symbol/C?format=png" },
  { name: "US Bank",         routing: "091000022", logo: "https://www.google.com/s2/favicons?domain=usbank.com&sz=64" },
  { name: "PNC Bank",        routing: "031000053", logo: "https://www.google.com/s2/favicons?domain=pnc.com&sz=64" },
  { name: "Capital One",     routing: "051405515", logo: "https://www.google.com/s2/favicons?domain=capitalone.com&sz=64" },
  { name: "TD Bank",         routing: "031101266", logo: "https://www.google.com/s2/favicons?domain=td.com&sz=64" },
  { name: "Goldman Sachs",   routing: "124085066", logo: "https://assets.parqet.com/logos/symbol/GS?format=png" },
  { name: "Morgan Stanley",  routing: "021272723", logo: "https://assets.parqet.com/logos/symbol/MS?format=png" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Saudi Arabia", "Other",
];

const CRYPTO_NETWORKS = [
  { symbol: "BTC",  name: "Bitcoin",  network: "Bitcoin Network" },
  { symbol: "ETH",  name: "Ethereum", network: "ERC-20" },
  { symbol: "USDT", name: "Tether",   network: "TRC-20 / ERC-20" },
  { symbol: "USDC", name: "USD Coin", network: "ERC-20" },
  { symbol: "BNB",  name: "BNB",      network: "BEP-20" },
  { symbol: "SOL",  name: "Solana",   network: "Solana" },
];

function BankLogo({ bank, colors }: { bank: typeof US_BANKS[0]; colors: any }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!err ? (
        <img src={bank.logo} onError={() => setErr(true)} alt={bank.name}
          style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <Building2 style={{ width: 18, height: 18, color: "#555" }} />
      )}
    </div>
  );
}

function StepIndicator({ current, total, colors }: { current: number; total: number; colors: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            background: i < current ? colors.blue : i === current ? `rgba(37,99,255,0.15)` : `rgba(255,255,255,0.06)`,
            border: i === current ? `1.5px solid ${colors.blue}` : "1.5px solid transparent",
            color: i < current ? "#fff" : i === current ? colors.blue : colors.muted,
          }}>
            {i < current ? <Check style={{ width: 12, height: 12 }} strokeWidth={3} /> : i + 1}
          </div>
          {i < total - 1 && <div style={{ width: 28, height: 1, background: i < current ? colors.blue : colors.bord }} />}
        </div>
      ))}
    </div>
  );
}

const KRAKEN_PURPLE = "#5741d9";
const WHATSAPP_URL = "https://wa.me/18886555555?text=Hello%2C%20I%20need%20help%20with%20my%20wire%20deposit.";

function SupportOptions({ onBack, amount, colors }: { onBack: () => void; amount: string; colors: any }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiChat, setAiChat] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm your INT Brokers financial AI assistant. I can help guide you through the wire transfer process, answer questions about Kraken, or explain next steps. How can I help?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const sendAiMsg = async () => {
    const msg = aiMsg.trim();
    if (!msg) return;
    setAiChat(c => [...c, { role: "user", text: msg }]);
    setAiMsg("");
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const responses: Record<string, string> = {
      default: "Great question! For your wire transfer, once you've registered and verified your Kraken account, our team will send you the exact wire instructions to the email on file. Need anything else?",
    };
    const q = msg.toLowerCase();
    let reply = responses.default;
    if (q.includes("kraken")) reply = "Kraken is our official liquidity partner and financial manager. All wire deposits are routed through Kraken's regulated platform for maximum security and compliance. Register at kraken.com and complete Level 2 (Intermediate) verification.";
    else if (q.includes("how long") || q.includes("time")) reply = "Wire transfers typically take 1–3 business days to settle once Kraken confirms the deposit. Our team will update your account as soon as funds are received.";
    else if (q.includes("fee") || q.includes("cost")) reply = "Wire deposits have a standard bank wire fee charged by your financial institution. INT Brokers does not charge additional deposit fees.";
    else if (q.includes("verify") || q.includes("kyc") || q.includes("identity")) reply = "For Kraken, you'll need to complete Intermediate (Level 2) verification: provide your government-issued ID, proof of address, and a selfie. This usually takes 1–2 business days.";
    else if (q.includes("minimum") || q.includes("min")) reply = "The minimum wire transfer deposit is $1,000 USD. There is no maximum limit.";
    setAiChat(c => [...c, { role: "bot", text: reply }]);
    setAiLoading(false);
  };

  if (aiOpen) {
    return (
      <div>
        <button onClick={() => setAiOpen(false)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to support options
        </button>
        <div style={{ background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.bord}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: `rgba(37,99,255,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>INT Brokers AI Assistant</div>
              <div style={{ fontSize: 11, color: colors.blue }}>● Online</div>
            </div>
          </div>
          <div style={{ height: 240, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {aiChat.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "85%", padding: "10px 14px", borderRadius: 12,
                  fontSize: 13, lineHeight: 1.55,
                  background: m.role === "user" ? colors.blue : "rgba(255,255,255,0.06)",
                  color: m.role === "user" ? "#fff" : colors.text,
                }}>{m.text}</div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ display: "flex" }}>
                <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", fontSize: 13, color: colors.muted }}>
                  <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite", display: "inline" }} /> Typing…
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${colors.bord}`, display: "flex", gap: 8 }}>
            <input
              value={aiMsg} onChange={e => setAiMsg(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendAiMsg()}
              placeholder="Ask about wire transfers, Kraken setup…"
              style={{ flex: 1, height: 38, background: "rgba(255,255,255,0.05)", border: `1px solid ${colors.bord}`, borderRadius: 8, padding: "0 12px", color: colors.text, fontSize: 13, outline: "none" }}
            />
            <button onClick={sendAiMsg} disabled={!aiMsg.trim() || aiLoading} style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: colors.blue, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(14,203,129,0.12)", border: "1.5px solid #0ecb81", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Check style={{ width: 26, height: 26, color: "#0ecb81" }} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Request Submitted!</div>
        <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7 }}>
          Your deposit of <strong style={{ color: colors.text }}>${fmt(parseFloat(amount || "0"))}</strong> is being processed.<br />
          Need help? We're here for you 24/7.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{
          padding: "14px 18px", background: "#25d36618", border: "1px solid #25d36630",
          borderRadius: 12, display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#25d36620", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>WhatsApp Support</div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Chat with a team member · Instant reply</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.muted }} strokeWidth={1.5} />
        </a>

        <button onClick={() => setAiOpen(true)} style={{
          padding: "14px 18px", background: "rgba(37,99,255,0.08)", border: `1px solid rgba(37,99,255,0.2)`,
          borderRadius: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(37,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Financial AI Assistant</div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Instant answers · Available 24/7</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.muted }} strokeWidth={1.5} />
        </button>

        <a href={WHATSAPP_URL + "%20I%20want%20to%20speak%20to%20a%20real%20advisor."} target="_blank" rel="noopener noreferrer" style={{
          padding: "14px 18px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 12, display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(167,139,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Speak to a Real Advisor</div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Personal guidance from our team</div>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: colors.muted }} strokeWidth={1.5} />
        </a>
      </div>

      <button onClick={onBack} style={{
        width: "100%", height: 42, borderRadius: 999, border: "none",
        background: "rgba(255,255,255,0.05)", color: colors.muted, fontSize: 14, fontWeight: 500, cursor: "pointer",
      }}>← Back to Wallet</button>
    </div>
  );
}

function KrakenLogo({ size = 40 }: { size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div style={{ width: size, height: size, borderRadius: size * 0.22, background: KRAKEN_PURPLE, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * 0.44 }}>K</div>
  );
  return (
    <img src="https://www.google.com/s2/favicons?domain=kraken.com&sz=128" alt="Kraken" onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: size * 0.22, objectFit: "contain" }} />
  );
}

function WireDepositFlow({ onBack, colors }: { onBack: () => void; colors: any }) {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [bank, setBank] = useState<typeof US_BANKS[0] | null>(null);
  const [form, setForm] = useState({ name: "", account: "", routing: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [krakenConfirmed, setKrakenConfirmed] = useState(false);

  const isUSA = country === "United States";
  const totalSteps = 4;

  const canProceed0 = !!country;
  const canProceedBank = isUSA ? !!bank : (!!form.name && !!form.account);

  const handleSubmit = async (): Promise<void> => {
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      const details = bank
        ? `Bank: ${bank.name}, Account: ${form.account}, Routing: ${form.routing || bank.routing}`
        : `${form.name}, Account: ${form.account}`;
      const res = await fetch("/api/transactions/request", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "deposit", amount: parseFloat(form.amount), name: "Wire Deposit Request", details }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Submission failed"); }
    } catch (e: any) { toast.error(e.message || "Failed"); setSubmitting(false); return; }
    setSubmitting(false);
    setStep(99);
  };

  const FieldInput = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em" }}>{label}</div>
      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder}
        style={{ width: "100%", height: 44, background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 8, padding: "0 14px", color: colors.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
    </div>
  );

  if (step === 99) return <SupportOptions onBack={onBack} amount={form.amount} colors={colors} />;

  return (
    <div>
      <StepIndicator current={step} total={totalSteps} colors={colors} />

      {/* Step 0 — Country */}
      {step === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Select Your Country</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Choose the country where your bank account is held.</div>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <button onClick={() => setCountryOpen(o => !o)} style={{ width: "100%", height: 48, background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", color: country ? colors.text : colors.muted, fontSize: 14, cursor: "pointer" }}>
              {country || "Select country"}
              <ChevronDown style={{ width: 16, height: 16, color: colors.muted }} strokeWidth={1.5} />
            </button>
            {countryOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 10, maxHeight: 240, overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => { setCountry(c); setCountryOpen(false); }} style={{ width: "100%", padding: "12px 16px", background: c === country ? `rgba(37,99,255,0.08)` : "transparent", border: "none", color: c === country ? colors.text : colors.muted, fontSize: 14, textAlign: "left", cursor: "pointer" }}>{c}</button>
                ))}
              </div>
            )}
          </div>
          <button disabled={!canProceed0} onClick={() => setStep(1)} style={{ width: "100%", height: 46, borderRadius: 999, border: "none", background: canProceed0 ? colors.blue : "rgba(255,255,255,0.06)", color: canProceed0 ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: canProceed0 ? "pointer" : "not-allowed" }}>Continue</button>
        </div>
      )}

      {/* Step 1 — Kraken Setup */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 18, padding: "18px 20px", background: `${KRAKEN_PURPLE}12`, border: `1px solid ${KRAKEN_PURPLE}30`, borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <KrakenLogo size={44} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>Kraken — Our Financial Partner</div>
                <div style={{ fontSize: 11, color: KRAKEN_PURPLE, fontWeight: 600, letterSpacing: "0.05em" }}>Official Liquidity Manager & Payment Processor</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: colors.muted, lineHeight: 1.7, margin: "0 0 14px" }}>
              All wire deposits at INT Brokers are processed through <strong style={{ color: colors.text }}>Kraken</strong> — one of the world's most trusted and regulated cryptocurrency exchanges. Kraken serves as our licensed financial manager, ensuring your funds are handled safely, compliantly, and efficiently.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "1️⃣", text: "Download the Kraken app (links below)" },
                { icon: "2️⃣", text: "Create a free account at kraken.com" },
                { icon: "3️⃣", text: "Complete identity verification (Level 2 / Intermediate)" },
                { icon: "4️⃣", text: "Our team will send wire instructions to your registered email" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <span style={{ fontSize: 12, color: colors.muted, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Buttons */}
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Download Kraken</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <a href="https://apps.apple.com/app/kraken-buy-bitcoin-crypto/id1481892508" target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: "11px 14px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>DOWNLOAD ON THE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>App Store</div>
              </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.kraken.trade" target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: "11px 14px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11, display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3.18 23.29A2.14 2.14 0 012 21.36V2.64A2.14 2.14 0 013.18.71L13.41 11 3.18 23.29z" fill="#4285F4"/><path d="M16.91 14.5L13.41 11l3.5-3.5 3.91 2.26a1.5 1.5 0 010 2.48L16.91 14.5z" fill="#FBBC04"/><path d="M16.91 14.5L13.41 11 3.18 23.29c.37.4.95.5 1.46.26l12.27-9.05z" fill="#34A853"/><path d="M16.91 7.5L4.64.45A1.21 1.21 0 003.18.71L13.41 11l3.5-3.5z" fill="#EA4335"/></svg>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>GET IT ON</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 1 }}>Google Play</div>
              </div>
            </a>
          </div>

          <a href="https://www.kraken.com/sign-up" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            height: 42, borderRadius: 10, textDecoration: "none", marginBottom: 18,
            background: `${KRAKEN_PURPLE}18`, border: `1px solid ${KRAKEN_PURPLE}40`, color: "#a89bff", fontSize: 13, fontWeight: 600,
          }}>
            <KrakenLogo size={20} /> Register on Kraken Web
          </a>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 18 }}>
            <input type="checkbox" checked={krakenConfirmed} onChange={e => setKrakenConfirmed(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: colors.blue }} />
            <span style={{ fontSize: 13, color: colors.muted, lineHeight: 1.5 }}>
              I have downloaded Kraken and will register / verify my account to proceed with the wire transfer.
            </span>
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, fontSize: 14, cursor: "pointer" }}>Back</button>
            <button disabled={!krakenConfirmed} onClick={() => setStep(2)} style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: krakenConfirmed ? colors.blue : "rgba(255,255,255,0.06)", color: krakenConfirmed ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: krakenConfirmed ? "pointer" : "not-allowed" }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 2 — Bank details */}
      {step === 2 && isUSA && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Select Your Bank</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Choose your US bank to pre-fill routing information.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {US_BANKS.map(b => (
              <button key={b.name} onClick={() => setBank(b)} style={{ padding: "12px 14px", background: bank?.name === b.name ? `rgba(37,99,255,0.1)` : colors.inputBg, border: `1px solid ${bank?.name === b.name ? `rgba(37,99,255,0.4)` : colors.bord}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <BankLogo bank={b} colors={colors} />
                <span style={{ fontSize: 12, fontWeight: 500, color: colors.text, textAlign: "left" }}>{b.name}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, cursor: "pointer" }}>Back</button>
            <button disabled={!canProceedBank} onClick={() => setStep(3)} style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: canProceedBank ? colors.blue : "rgba(255,255,255,0.06)", color: canProceedBank ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: canProceedBank ? "pointer" : "not-allowed" }}>Continue</button>
          </div>
        </div>
      )}

      {step === 2 && !isUSA && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Account Details</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Enter your bank account information.</div>
          <FieldInput label="ACCOUNT HOLDER FULL NAME" field="name" placeholder="As it appears on your bank account" />
          <FieldInput label="ACCOUNT NUMBER / IBAN" field="account" placeholder="Your account number or IBAN" />
          <FieldInput label="SORT / ROUTING / SWIFT" field="routing" placeholder="Routing, sort code, or SWIFT" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(1)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, cursor: "pointer" }}>Back</button>
            <button disabled={!canProceedBank} onClick={() => setStep(3)} style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: canProceedBank ? colors.blue : "rgba(255,255,255,0.06)", color: canProceedBank ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: canProceedBank ? "pointer" : "not-allowed" }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3 — Amount */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Deposit Amount</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>Enter the amount you'd like to wire via Kraken.</div>
          {bank && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, marginBottom: 14 }}>
              <BankLogo bank={bank} colors={colors} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{bank.name}</div>
                <div style={{ fontSize: 11, color: colors.muted, fontFamily: "monospace" }}>···{form.account?.slice(-4) || "xxxx"} · {form.routing || bank.routing}</div>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>AMOUNT (USD)</div>
            <div style={{ height: 52, background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 16px" }}>
              <span style={{ color: colors.muted, marginRight: 8, fontSize: 16 }}>$</span>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min={0}
                style={{ background: "transparent", border: "none", outline: "none", color: colors.text, fontSize: 20, width: "100%", fontFamily: "monospace", fontWeight: 700 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[1000, 5000, 10000, 25000].map(amt => (
              <button key={amt} onClick={() => setForm(f => ({ ...f, amount: String(amt) }))} style={{ flex: 1, height: 32, fontSize: 12, borderRadius: 6, background: form.amount === String(amt) ? `rgba(37,99,255,0.12)` : colors.inputBg, border: `1px solid ${form.amount === String(amt) ? `rgba(37,99,255,0.4)` : colors.bord}`, color: form.amount === String(amt) ? colors.blue : colors.muted, cursor: "pointer" }}>${(amt / 1000).toFixed(0)}K</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, cursor: "pointer" }}>Back</button>
            <button disabled={submitting || !form.amount || parseFloat(form.amount) <= 0} onClick={handleSubmit} style={{ flex: 1, height: 46, borderRadius: 999, border: "none", background: form.amount && parseFloat(form.amount) > 0 ? colors.blue : "rgba(255,255,255,0.06)", color: form.amount && parseFloat(form.amount) > 0 ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: form.amount && parseFloat(form.amount) > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {submitting ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Submitting...</> : "Submit Wire Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CRYPTO_DEPOSIT_COINS = [
  { symbol: "BTC",  name: "Bitcoin",   network: "Bitcoin Network",  color: "#f7931a" },
  { symbol: "ETH",  name: "Ethereum",  network: "ERC-20",           color: "#627eea" },
  { symbol: "USDT", name: "Tether",    network: "TRC-20 / ERC-20",  color: "#26a17b" },
  { symbol: "USDC", name: "USD Coin",  network: "ERC-20",           color: "#2775ca" },
  { symbol: "BNB",  name: "BNB",       network: "BEP-20",           color: "#f3ba2f" },
  { symbol: "SOL",  name: "Solana",    network: "Solana Network",   color: "#9945ff" },
  { symbol: "LTC",  name: "Litecoin",  network: "Litecoin Network", color: "#bfbbbb" },
  { symbol: "XRP",  name: "XRP",       network: "XRP Ledger",       color: "#00aae4" },
];

function CryptoDepositFlow({ onBack, colors }: { onBack: () => void; colors: any }) {
  const [selectedCoin, setSelectedCoin] = useState<typeof CRYPTO_DEPOSIT_COINS[0] | null>(null);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const fetchAddress = async (symbol: string) => {
    setLoadingAddress(true);
    setDepositAddress(null);
    try {
      const res = await fetch(`/api/transactions/deposit-address?symbol=${symbol}`, { credentials: "include" });
      const data = await res.json();
      setDepositAddress(data.address || null);
    } catch {
      setDepositAddress(null);
    } finally {
      setLoadingAddress(false);
    }
  };

  const selectCoin = (coin: typeof CRYPTO_DEPOSIT_COINS[0]) => {
    setSelectedCoin(coin);
    fetchAddress(coin.symbol);
    setCopied(false);
    setAmount("");
  };

  const copyAddress = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSubmit = async () => {
    if (!selectedCoin || !depositAddress) return;
    const num = parseFloat(amount);
    if (!num || num <= 0) { toast.error("Enter a valid amount"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions/request", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit", amount: num,
          name: `${selectedCoin.name} Crypto Deposit`,
          details: `Network: ${selectedCoin.network}, Address: ${depositAddress}`,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
      setDone(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <SupportOptions onBack={onBack} amount={amount} colors={colors} />;
  }

  return (
    <div>
      {!selectedCoin ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Select Cryptocurrency</div>
          <div style={{ fontSize: 12, color: colors.muted, marginBottom: 18 }}>Choose the coin you want to deposit. We'll provide your unique wallet address.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CRYPTO_DEPOSIT_COINS.map(coin => (
              <button key={coin.symbol} onClick={() => selectCoin(coin)} style={{
                padding: "13px 14px", background: colors.inputBg, border: `1px solid ${colors.bord}`,
                borderRadius: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                transition: "all 0.12s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = coin.color + "66"; e.currentTarget.style.background = coin.color + "0d"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.bord; e.currentTarget.style.background = colors.inputBg; }}
              >
                <AssetIcon symbol={coin.symbol} size={32} borderRadius="50%" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{coin.name}</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coin.network}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelectedCoin(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to coins
          </button>

          {/* Selected coin header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <AssetIcon symbol={selectedCoin.symbol} size={40} borderRadius="50%" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{selectedCoin.name} Deposit</div>
              <div style={{ fontSize: 12, color: colors.muted }}>Network: {selectedCoin.network}</div>
            </div>
          </div>

          {loadingAddress ? (
            <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Loader2 style={{ width: 24, height: 24, color: colors.muted, animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 13, color: colors.muted }}>Loading deposit address…</div>
            </div>
          ) : !depositAddress ? (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 8 }}>Address Not Available</div>
              <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6, marginBottom: 20 }}>
                No {selectedCoin.name} deposit address has been configured yet. Please contact support.
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px",
                background: "#25D366", borderRadius: 999, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600,
              }}>Contact Support via WhatsApp</a>
            </div>
          ) : (
            <>
              {/* Network warning */}
              <div style={{ padding: "10px 14px", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.5 }}>
                  Only send <strong>{selectedCoin.symbol}</strong> on the <strong>{selectedCoin.network}</strong>. Sending any other asset will result in permanent loss.
                </span>
              </div>

              {/* QR Code */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                <div style={{ padding: 12, background: "#fff", borderRadius: 14, display: "inline-block", marginBottom: 14 }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(depositAddress)}&margin=4`}
                    alt="QR Code"
                    style={{ display: "block", width: 160, height: 160 }}
                  />
                </div>
                <div style={{ fontSize: 11, color: colors.muted }}>Scan with your wallet app</div>
              </div>

              {/* Address */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: colors.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  {selectedCoin.symbol} Deposit Address
                </div>
                <div style={{
                  padding: "12px 14px", background: colors.inputBg, border: `1px solid ${colors.bord}`,
                  borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ flex: 1, fontSize: 12, color: colors.text, fontFamily: "monospace", wordBreak: "break-all", lineHeight: 1.5 }}>
                    {depositAddress}
                  </div>
                  <button onClick={copyAddress} style={{
                    flexShrink: 0, padding: "6px 12px", borderRadius: 7, border: "none",
                    background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
                    color: copied ? "#22c55e" : colors.muted, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                  }}>
                    {copied ? <><Check style={{ width: 12, height: 12 }} strokeWidth={2.5} /> Copied!</> : <>Copy</>}
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: colors.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Amount (USD equivalent)
                </div>
                <div style={{ height: 50, background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px" }}>
                  <span style={{ color: colors.muted, marginRight: 8 }}>$</span>
                  <input
                    type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min={0}
                    style={{ background: "transparent", border: "none", outline: "none", color: colors.text, fontSize: 18, width: "100%", fontFamily: "monospace", fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ padding: "10px 14px", background: "rgba(37,99,255,0.06)", border: "1px solid rgba(37,99,255,0.15)", borderRadius: 10, marginBottom: 18, fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>
                Send your {selectedCoin.symbol} to the address above, then click Confirm Deposit. Our team will credit your account after network confirmation.
              </div>

              <button
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                onClick={handleSubmit}
                style={{
                  width: "100%", height: 46, borderRadius: 999, border: "none",
                  background: amount && parseFloat(amount) > 0 ? colors.blue : "rgba(255,255,255,0.06)",
                  color: amount && parseFloat(amount) > 0 ? "#fff" : colors.muted,
                  fontSize: 15, fontWeight: 600, cursor: amount && parseFloat(amount) > 0 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {submitting ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Submitting…</> : "Confirm Deposit"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function WithdrawFlow({ availableCash, onBack, colors }: { availableCash: number; onBack: () => void; colors: any }) {
  const [method, setMethod] = useState<"bank" | "crypto" | null>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState("");
  const [cryptoDropOpen, setCryptoDropOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [routing, setRouting] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const selectedCrypto = CRYPTO_NETWORKS.find(c => c.symbol === cryptoNetwork);

  const num = parseFloat(amount) || 0;
  const insufficient = num > availableCash && num > 0;

  const handleSubmit = async (): Promise<void> => {
    if (!num || num <= 0) { toast.error("Enter a valid amount"); return; }
    if (num > availableCash) { toast.error("Amount exceeds available balance"); return; }
    if (method === "crypto" && (!cryptoNetwork || !walletAddress)) { toast.error("Enter wallet details"); return; }
    if (method === "bank" && (!bankName || !accountNum)) { toast.error("Enter bank details"); return; }
    setSubmitting(true);
    try {
      const details = method === "bank"
        ? `Bank: ${bankName}, Account: ****${accountNum.slice(-4)}, Routing: ${routing || "N/A"}`
        : `Crypto: ${cryptoNetwork}, Wallet: ${walletAddress}`;
      const res = await fetch("/api/transactions/request", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "withdraw",
          amount: num,
          name: method === "bank" ? "Bank Withdrawal Request" : "Crypto Withdrawal Request",
          details,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit withdrawal request");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(14,203,129,0.12)", border: "1.5px solid #0ecb81", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Check style={{ width: 28, height: 28, color: "#0ecb81" }} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Withdrawal Requested</div>
        <p style={{ fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 24 }}>
          Your withdrawal request of <strong style={{ color: colors.text }}>${fmt(num)}</strong> has been submitted.
          Our team will process it within 1–3 business days.
        </p>
        <button onClick={onBack} style={{ height: 44, padding: "0 28px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.text, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Back to Wallet
        </button>
      </div>
    );
  }

  if (!method) {
    return (
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Withdraw Funds</div>
        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>Choose your withdrawal destination.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "bank", label: "Bank Account", sub: "Wire transfer · 1–3 business days", icon: Landmark, color: "#2563FF" },
            { id: "crypto", label: "Crypto Wallet", sub: "BTC, ETH, USDT, USDC & more", icon: Bitcoin, color: "#f59e0b" },
          ].map(m => (
            <button key={m.id} onClick={() => setMethod(m.id as any)} style={{
              padding: "16px 18px", background: colors.inputBg, border: `1px solid ${colors.bord}`,
              borderRadius: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.bord; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${m.color}18`, border: `1px solid ${m.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <m.icon style={{ width: 18, height: 18, color: m.color }} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{m.label}</div>
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{m.sub}</div>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: colors.muted }} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const fieldStyle = {
    width: "100%", height: 44, background: colors.inputBg, border: `1px solid ${colors.bord}`,
    borderRadius: 8, padding: "0 14px", color: colors.text, fontSize: 14, outline: "none",
    boxSizing: "border-box" as const,
  };
  const labelStyle = { fontSize: 12, color: colors.muted, marginBottom: 6, display: "block" };

  return (
    <div>
      <button onClick={() => setMethod(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
        <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to methods
      </button>

      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
        {method === "bank" ? "Bank Account Withdrawal" : "Crypto Wallet Withdrawal"}
      </div>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>
        {method === "bank"
          ? "Enter your bank details. Processing takes 1–3 business days."
          : "Enter your wallet address. Contact support if you need assistance."}
      </div>

      {method === "crypto" && (
        <>
          <div style={{ marginBottom: 14, position: "relative" }}>
            <label style={labelStyle}>CRYPTOCURRENCY / NETWORK</label>
            <button
              type="button"
              onClick={() => setCryptoDropOpen(o => !o)}
              style={{
                width: "100%", height: 48, background: colors.inputBg, border: `1px solid ${cryptoDropOpen ? colors.blue : colors.bord}`,
                borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center",
                justifyContent: "space-between", cursor: "pointer", gap: 10,
                transition: "border-color 0.15s",
              }}
            >
              {selectedCrypto ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AssetIcon symbol={selectedCrypto.symbol} size={24} borderRadius="50%" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{selectedCrypto.name}</span>
                  <span style={{ fontSize: 12, color: colors.muted }}>— {selectedCrypto.network}</span>
                </div>
              ) : (
                <span style={{ fontSize: 14, color: colors.muted }}>Select cryptocurrency</span>
              )}
              <ChevronDown style={{ width: 16, height: 16, color: colors.muted, transform: cryptoDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} strokeWidth={1.5} />
            </button>
            {cryptoDropOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 60,
                background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)", overflow: "hidden",
              }}>
                {CRYPTO_NETWORKS.map(c => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => { setCryptoNetwork(c.symbol); setCryptoDropOpen(false); }}
                    style={{
                      width: "100%", padding: "12px 16px", background: c.symbol === cryptoNetwork ? `rgba(37,99,255,0.08)` : "transparent",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                      borderBottom: `1px solid ${colors.bord}`,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (c.symbol !== cryptoNetwork) e.currentTarget.style.background = colors.hover || "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (c.symbol !== cryptoNetwork) e.currentTarget.style.background = "transparent"; }}
                  >
                    <AssetIcon symbol={c.symbol} size={30} borderRadius="50%" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{c.network}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: colors.muted, fontFamily: "monospace" }}>{c.symbol}</span>
                    {c.symbol === cryptoNetwork && <Check style={{ width: 14, height: 14, color: colors.blue }} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>WALLET ADDRESS</label>
            <input
              type="text"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder={selectedCrypto ? `Your ${selectedCrypto.name} wallet address` : "Your wallet address"}
              style={fieldStyle}
            />
          </div>
        </>
      )}

      {method === "bank" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>BANK NAME</label>
            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Your bank name" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ACCOUNT NUMBER / IBAN</label>
            <input type="text" value={accountNum} onChange={e => setAccountNum(e.target.value)} placeholder="Account number or IBAN" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>ROUTING / SORT CODE (optional)</label>
            <input type="text" value={routing} onChange={e => setRouting(e.target.value)} placeholder="Routing or sort code" style={fieldStyle} />
          </div>
        </>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span>AMOUNT (USD)</span>
          <span style={{ color: insufficient ? colors.red : colors.muted }}>Avail: ${fmt(availableCash)}</span>
        </div>
        <div style={{ height: 48, background: colors.inputBg, border: `1px solid ${insufficient ? colors.red : colors.bord}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px" }}>
          <span style={{ color: colors.muted, marginRight: 8 }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            min={0}
            style={{ background: "transparent", border: "none", outline: "none", color: colors.text, fontSize: 16, width: "100%", fontFamily: "monospace" }}
          />
        </div>
        {insufficient && <div style={{ fontSize: 11, color: colors.red, marginTop: 4 }}>Exceeds available balance</div>}
      </div>

      <button
        onClick={() => setAmount(fmt(availableCash).replace(/,/g, ""))}
        style={{ fontSize: 12, color: colors.blue, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 20 }}
      >
        Use maximum (${fmt(availableCash)})
      </button>

      <button
        disabled={submitting || insufficient || !num}
        onClick={handleSubmit}
        style={{
          width: "100%", height: 46, borderRadius: 999, border: "none",
          background: num > 0 && !insufficient ? colors.blue : "rgba(255,255,255,0.06)",
          color: num > 0 && !insufficient ? "#fff" : colors.muted,
          fontSize: 15, fontWeight: 600, cursor: num > 0 && !insufficient ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {submitting ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Processing...</> : "Request Withdrawal"}
      </button>
    </div>
  );
}

export default function Wallet() {
  const { colors } = useTheme();
  const isMobile = useIsMobile();
  const { data: balance, isLoading: bl, refetch: refetchBalance } = useGetUserBalance();
  const { data: txData, isLoading: txl, refetch: refetchTx } = useGetTransactions({ limit: 20 });

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [depositMethod, setDepositMethod] = useState<"wire" | "crypto" | null>(null);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);

  const availableCash = balance?.availableCash || 0;

  const txTypeBadge = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      deposit:  { label: "Deposit",  color: colors.green },
      withdraw: { label: "Withdraw", color: colors.red },
      buy:      { label: "Buy",      color: "#60a5fa" },
      sell:     { label: "Sell",     color: "#f59e0b" },
      convert:  { label: "Convert",  color: "#a78bfa" },
    };
    return map[type] || { label: type, color: colors.muted };
  };

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "32px 24px", maxWidth: 1440, margin: "0 auto", background: colors.bg, minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: colors.text, margin: 0 }}>Wallet</h1>
        <button onClick={() => { refetchBalance(); refetchTx(); }} style={{ background: "none", border: "none", cursor: "pointer", color: colors.muted, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <RefreshCw style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Refresh
        </button>
      </div>

      {/* Total Portfolio Card */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 20,
          padding: "28px 32px", overflow: "hidden", position: "relative",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}>
          {/* Background accent */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200,
            borderRadius: "50%", background: `rgba(37,99,255,0.06)`, pointerEvents: "none",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: colors.muted, textTransform: "uppercase", marginBottom: 10 }}>
              Total Portfolio Value
            </div>
            {bl ? (
              <Loader2 style={{ width: 24, height: 24, color: colors.muted, animation: "spin 1s linear infinite" }} />
            ) : (
              <>
                <div style={{ fontSize: 38, fontWeight: 800, color: colors.text, fontFamily: "monospace", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 20 }}>
                  ${fmt(balance?.totalPortfolioValue || 0)}
                </div>
                <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${colors.bord}`, paddingTop: 18 }}>
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <div style={{ fontSize: 11, color: colors.muted, fontWeight: 500, marginBottom: 4 }}>CASH AVAILABLE</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: colors.green, fontFamily: "monospace" }}>
                      ${fmt(balance?.availableCash || 0)}
                    </div>
                  </div>
                  <div style={{ width: 1, background: colors.bord, flexShrink: 0 }} />
                  <div style={{ flex: 1, paddingLeft: 20 }}>
                    <div style={{ fontSize: 11, color: colors.muted, fontWeight: 500, marginBottom: 4 }}>INVESTED</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: colors.blue, fontFamily: "monospace" }}>
                      ${fmt(Math.max(0, (balance?.totalPortfolioValue || 0) - (balance?.availableCash || 0)))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2">
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${colors.bord}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>Transaction History</div>
            </div>
            {txl ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <Loader2 style={{ width: 24, height: 24, color: colors.muted, animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : !txData?.transactions?.length ? (
              <div style={{ padding: 48, textAlign: "center", color: colors.muted, fontSize: 14 }}>No transactions yet</div>
            ) : isMobile ? (
              /* Mobile card list */
              <div>
                {txData.transactions.map((tx, i, arr) => {
                  const badge = txTypeBadge(tx.type);
                  const s = tx.status as string;
                  const statusColor = s === "completed" ? colors.green : s === "pending" ? "#fbbf24" : s === "processing" ? "#60a5fa" : colors.muted;
                  return (
                    <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${colors.bord}` : "none" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: badge.color }}>{badge.label}</span>
                          {tx.symbol && <span style={{ fontSize: 11, color: colors.muted }}>{tx.symbol}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: colors.muted, fontFamily: "monospace" }}>
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: "monospace" }}>${fmt(tx.amount)}</div>
                        <div style={{ fontSize: 10, color: statusColor, marginTop: 2, fontWeight: 600, textTransform: "capitalize" }}>{tx.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Desktop table */
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.bord}` }}>
                      {["Date", "Type", "Asset", "Amount", "Status"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 500, color: colors.muted, letterSpacing: "0.04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txData.transactions.map((tx) => {
                      const badge = txTypeBadge(tx.type);
                      return (
                        <tr key={tx.id} style={{ borderBottom: `1px solid ${colors.bord}` }}
                          onMouseEnter={e => (e.currentTarget.style.background = colors.hover)}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 20px", fontSize: 12, color: colors.muted, fontFamily: "monospace" }}>
                            {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td style={{ padding: "14px 20px", textAlign: "right" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{badge.label}</span>
                          </td>
                          <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 12, color: colors.text }}>{tx.symbol || "USD"}</td>
                          <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: "monospace" }}>
                            ${fmt(tx.amount)}
                          </td>
                          <td style={{ padding: "14px 20px", textAlign: "right" }}>
                            <span style={{
                              fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600,
                              background: (tx.status as string) === "completed" ? "rgba(14,203,129,0.1)" : (tx.status as string) === "pending" ? "rgba(251,191,36,0.1)" : (tx.status as string) === "processing" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.06)",
                              color: (tx.status as string) === "completed" ? colors.green : (tx.status as string) === "pending" ? "#fbbf24" : (tx.status as string) === "processing" ? "#60a5fa" : colors.muted,
                            }}>
                              {(tx.status as string) === "processing" ? "Processing" : tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div>
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${colors.bord}` }}>
              {(["deposit", "withdraw"] as const).map(tab => (
                <button key={tab} onClick={() => { setMode(tab); setDepositMethod(null); setShowWithdrawFlow(false); }} style={{
                  flex: 1, height: 48, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                  background: "transparent",
                  color: mode === tab ? colors.text : colors.muted,
                  borderBottom: `2px solid ${mode === tab ? colors.blue : "transparent"}`,
                  transition: "all 0.12s",
                }}>
                  {tab === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              {/* ── Deposit ── */}
              {mode === "deposit" && (
                <>
                  {!depositMethod ? (
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>Select Deposit Method</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 20 }}>Choose how you want to fund your account.</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { id: "wire", label: "Wire Transfer", sub: "Bank wire · 1–3 business days", icon: "🏦" },
                          { id: "crypto", label: "Crypto Deposit", sub: "BTC, ETH, USDT & more", icon: "₿" },
                        ].map(m => (
                          <button key={m.id} onClick={() => setDepositMethod(m.id as any)} style={{
                            padding: "16px 18px", background: colors.inputBg, border: `1px solid ${colors.bord}`,
                            borderRadius: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(37,99,255,0.35)`; e.currentTarget.style.background = `rgba(37,99,255,0.04)`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.bord; e.currentTarget.style.background = colors.inputBg; }}
                          >
                            <span style={{ fontSize: 24 }}>{m.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{m.label}</div>
                              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{m.sub}</div>
                            </div>
                            <ChevronRight style={{ width: 16, height: 16, color: colors.muted }} strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : depositMethod === "wire" ? (
                    <div>
                      <button onClick={() => setDepositMethod(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
                        <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to methods
                      </button>
                      <WireDepositFlow onBack={() => setDepositMethod(null)} colors={colors} />
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setDepositMethod(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
                        <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to methods
                      </button>
                      <CryptoDepositFlow onBack={() => setDepositMethod(null)} colors={colors} />
                    </div>
                  )}
                </>
              )}

              {/* ── Withdraw ── */}
              {mode === "withdraw" && (
                <WithdrawFlow
                  availableCash={availableCash}
                  onBack={() => setMode("deposit")}
                  colors={colors}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
