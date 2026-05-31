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

function WireDepositFlow({ onBack, colors }: { onBack: () => void; colors: any }) {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [bank, setBank] = useState<typeof US_BANKS[0] | null>(null);
  const [form, setForm] = useState({ name: "", account: "", routing: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const isUSA = country === "United States";
  const totalSteps = isUSA ? 4 : 3;

  const canProceed0 = !!country;
  const canProceed1 = isUSA ? !!bank : (!!form.name && !!form.account);

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
        body: JSON.stringify({
          type: "deposit",
          amount: parseFloat(form.amount),
          name: "Wire Deposit Request",
          details,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit request");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setStep(99);
  };

  const FieldInput = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>{label}</div>
      <input
        type={type}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%", height: 44, background: colors.inputBg, border: `1px solid ${colors.bord}`,
          borderRadius: 8, padding: "0 14px", color: colors.text, fontSize: 14, outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  if (step === 99) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "rgba(14,203,129,0.12)",
          border: "1.5px solid #0ecb81", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Check style={{ width: 28, height: 28, color: "#0ecb81" }} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Request Received</div>
        <p style={{ fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 24 }}>
          A member of our team will contact you within 24 hours to guide you through the wire transfer process safely and securely.
        </p>
        <div style={{ background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 12, padding: "16px 20px", textAlign: "left", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Deposit Amount</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: "monospace" }}>${fmt(parseFloat(form.amount))}</div>
          {bank && <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>Via {bank.name}</div>}
        </div>
        <button onClick={onBack} style={{
          height: 44, padding: "0 28px", borderRadius: 999, border: "none",
          background: "rgba(255,255,255,0.06)", color: colors.text, fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>
          Back to Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} total={totalSteps} colors={colors} />

      {step === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Select Your Country</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Choose the country where your bank account is held.</div>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <button onClick={() => setCountryOpen(o => !o)} style={{
              width: "100%", height: 48, background: colors.inputBg, border: `1px solid ${colors.bord}`,
              borderRadius: 10, padding: "0 16px", display: "flex", alignItems: "center",
              justifyContent: "space-between", color: country ? colors.text : colors.muted, fontSize: 14, cursor: "pointer",
            }}>
              {country || "Select country"}
              <ChevronDown style={{ width: 16, height: 16, color: colors.muted }} strokeWidth={1.5} />
            </button>
            {countryOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 10,
                maxHeight: 240, overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              }}>
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => { setCountry(c); setCountryOpen(false); }} style={{
                    width: "100%", padding: "12px 16px", background: c === country ? `rgba(37,99,255,0.08)` : "transparent",
                    border: "none", color: c === country ? colors.text : colors.muted, fontSize: 14, textAlign: "left", cursor: "pointer",
                  }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button disabled={!canProceed0} onClick={() => setStep(1)} style={{
            width: "100%", height: 46, borderRadius: 999, border: "none",
            background: canProceed0 ? colors.blue : "rgba(255,255,255,0.06)",
            color: canProceed0 ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: canProceed0 ? "pointer" : "not-allowed",
          }}>Continue</button>
        </div>
      )}

      {step === 1 && isUSA && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Select Your Bank</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Choose your US bank to pre-fill routing information.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {US_BANKS.map(b => (
              <button key={b.name} onClick={() => setBank(b)} style={{
                padding: "12px 14px", background: bank?.name === b.name ? `rgba(37,99,255,0.1)` : colors.inputBg,
                border: `1px solid ${bank?.name === b.name ? `rgba(37,99,255,0.4)` : colors.bord}`,
                borderRadius: 10, display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              }}>
                <BankLogo bank={b} colors={colors} />
                <span style={{ fontSize: 12, fontWeight: 500, color: colors.text, textAlign: "left" }}>{b.name}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Back</button>
            <button disabled={!canProceed1} onClick={() => setStep(2)} style={{
              flex: 1, height: 46, borderRadius: 999, border: "none",
              background: canProceed1 ? colors.blue : "rgba(255,255,255,0.06)",
              color: canProceed1 ? "#fff" : colors.muted, fontSize: 15, fontWeight: 600, cursor: canProceed1 ? "pointer" : "not-allowed",
            }}>Continue</button>
          </div>
        </div>
      )}

      {((step === 1 && !isUSA) || (step === 2 && isUSA)) && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Account Details</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Enter your bank account information.</div>
          <FieldInput label="ACCOUNT HOLDER FULL NAME" field="name" placeholder="As it appears on your bank account" />
          <FieldInput label="ACCOUNT NUMBER" field="account" placeholder="Your bank account number" />
          <FieldInput label={isUSA ? "ROUTING NUMBER" : "SORT / IBAN / ROUTING"} field="routing" placeholder={isUSA ? bank?.routing || "9-digit routing number" : "IBAN or routing code"} />
          {bank && !form.routing && (
            <button onClick={() => setForm(f => ({ ...f, routing: bank.routing }))} style={{ fontSize: 12, color: colors.blue, background: "none", border: "none", cursor: "pointer", marginTop: -8, marginBottom: 12, padding: 0 }}>
              Use {bank.name} default routing ({bank.routing})
            </button>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(isUSA ? 1 : 0)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Back</button>
            <button disabled={!form.name || !form.account} onClick={() => setStep(isUSA ? 3 : 2)} style={{
              flex: 1, height: 46, borderRadius: 999, border: "none",
              background: form.name && form.account ? colors.blue : "rgba(255,255,255,0.06)",
              color: form.name && form.account ? "#fff" : colors.muted,
              fontSize: 15, fontWeight: 600, cursor: form.name && form.account ? "pointer" : "not-allowed",
            }}>Continue</button>
          </div>
        </div>
      )}

      {((step === 3 && isUSA) || (step === 2 && !isUSA)) && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text, marginBottom: 6 }}>Deposit Amount</div>
          <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>
            Enter how much you'd like to wire. A team member will contact you with full wire instructions.
          </div>
          {bank && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, marginBottom: 16 }}>
              <BankLogo bank={bank} colors={colors} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{bank.name}</div>
                <div style={{ fontSize: 11, color: colors.muted, fontFamily: "monospace" }}>···{form.account?.slice(-4) || "xxxx"} · Routing: {form.routing || bank.routing}</div>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>AMOUNT (USD)</div>
            <div style={{ height: 52, background: colors.inputBg, border: `1px solid ${colors.bord}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 16px" }}>
              <span style={{ color: colors.muted, marginRight: 8, fontSize: 16 }}>$</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                min={0}
                style={{ background: "transparent", border: "none", outline: "none", color: colors.text, fontSize: 20, width: "100%", fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[1000, 5000, 10000, 25000].map(amt => (
              <button key={amt} onClick={() => setForm(f => ({ ...f, amount: String(amt) }))} style={{
                flex: 1, height: 32, fontSize: 12, borderRadius: 6,
                background: form.amount === String(amt) ? `rgba(37,99,255,0.12)` : colors.inputBg,
                border: `1px solid ${form.amount === String(amt) ? `rgba(37,99,255,0.4)` : colors.bord}`,
                color: form.amount === String(amt) ? colors.blue : colors.muted, cursor: "pointer",
              }}>${(amt / 1000).toFixed(0)}K</button>
            ))}
          </div>
          <div style={{ background: `rgba(37,99,255,0.06)`, border: `1px solid rgba(37,99,255,0.15)`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: colors.muted, lineHeight: 1.6 }}>
              After submitting, a member of our team will contact you within 24 hours to complete the wire transfer safely.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(isUSA ? 2 : 1)} style={{ height: 46, padding: "0 20px", borderRadius: 999, border: "none", background: "rgba(255,255,255,0.06)", color: colors.muted, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Back</button>
            <button
              disabled={submitting || !form.amount || parseFloat(form.amount) <= 0}
              onClick={handleSubmit}
              style={{
                flex: 1, height: 46, borderRadius: 999, border: "none",
                background: form.amount && parseFloat(form.amount) > 0 ? colors.blue : "rgba(255,255,255,0.06)",
                color: form.amount && parseFloat(form.amount) > 0 ? "#fff" : colors.muted,
                fontSize: 15, fontWeight: 600, cursor: form.amount && parseFloat(form.amount) > 0 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {submitting ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Submitting...</> : "Submit Wire Request"}
            </button>
          </div>
        </div>
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
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 8 }}>Crypto Deposit</div>
                        <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6, marginBottom: 20 }}>
                          Contact our support team to receive your personal deposit address for BTC, ETH, USDT, and other tokens.
                        </div>
                        <a href="https://wa.me/18886555555" target="_blank" rel="noopener noreferrer" style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "12px 24px", background: "#25D366", borderRadius: 999,
                          color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600,
                        }}>
                          Contact via WhatsApp
                        </a>
                      </div>
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
