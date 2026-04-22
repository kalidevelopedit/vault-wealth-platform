import { useState } from "react";
import { useGetUserBalance, useGetTransactions } from "@workspace/api-client-react";
import { Loader2, RefreshCw, ChevronDown, ChevronRight, Check, Building2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BG   = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED= "rgba(255,255,255,0.45)";
const BLUE = "#2563FF";
const GREEN= "#0ecb81";
const RED  = "#f6465d";

const fmt = (n: number) =>
  n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";

const US_BANKS = [
  { name: "Chase",           routing: "021000021", logo: "https://logo.clearbit.com/chase.com" },
  { name: "Bank of America", routing: "026009593", logo: "https://logo.clearbit.com/bankofamerica.com" },
  { name: "Wells Fargo",     routing: "121042882", logo: "https://logo.clearbit.com/wellsfargo.com" },
  { name: "Citibank",        routing: "021000089", logo: "https://logo.clearbit.com/citibank.com" },
  { name: "US Bank",         routing: "091000022", logo: "https://logo.clearbit.com/usbank.com" },
  { name: "PNC Bank",        routing: "031000053", logo: "https://logo.clearbit.com/pnc.com" },
  { name: "Capital One",     routing: "051405515", logo: "https://logo.clearbit.com/capitalone.com" },
  { name: "TD Bank",         routing: "031101266", logo: "https://logo.clearbit.com/td.com" },
  { name: "Truist",          routing: "053101121", logo: "https://logo.clearbit.com/truist.com" },
  { name: "Goldman Sachs",   routing: "124085066", logo: "https://logo.clearbit.com/goldmansachs.com" },
  { name: "Morgan Stanley",  routing: "021272723", logo: "https://logo.clearbit.com/morganstanley.com" },
  { name: "First Republic",  routing: "321081669", logo: "https://logo.clearbit.com/firstrepublic.com" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "Saudi Arabia", "Other",
];

function BankLogo({ bank }: { bank: typeof US_BANKS[0] }) {
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

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            background: i < current ? BLUE : i === current ? "rgba(37,99,255,0.15)" : "rgba(255,255,255,0.06)",
            border: i === current ? `1.5px solid ${BLUE}` : "1.5px solid transparent",
            color: i < current ? "#fff" : i === current ? BLUE : MUTED,
          }}>
            {i < current ? <Check style={{ width: 12, height: 12 }} strokeWidth={3} /> : i + 1}
          </div>
          {i < total - 1 && <div style={{ width: 28, height: 1, background: i < current ? BLUE : BORD }} />}
        </div>
      ))}
    </div>
  );
}

function WireDepositFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [bank, setBank] = useState<typeof US_BANKS[0] | null>(null);
  const [form, setForm] = useState({ name: "", account: "", routing: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const isUSA = country === "United States";
  const totalSteps = isUSA ? 4 : 3;

  const stepLabels = isUSA
    ? ["Country", "Bank", "Details", "Amount"]
    : ["Country", "Details", "Amount"];

  const canProceed0 = !!country;
  const canProceed1 = isUSA ? !!bank : (!!form.name && !!form.account);
  const canProceed2 = isUSA ? (!!form.name && !!form.account && !!form.routing) : !!form.amount;
  const canProceed3 = !!form.amount && parseFloat(form.amount) > 0;

  function getActualStep() {
    if (!isUSA && step >= 1) return step + 1;
    return step;
  }

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error("Enter a valid amount");
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setStep(99);
  };

  if (step === 99) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "rgba(14,203,129,0.12)",
          border: `1.5px solid ${GREEN}`, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 20px",
        }}>
          <Check style={{ width: 28, height: 28, color: GREEN }} strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Request Received</div>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 8 }}>
          A member of our team will contact you within 24 hours to guide you through the wire transfer process safely and securely.
        </p>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
          Please have your bank details ready. All transfers are processed under our institutional banking framework.
        </p>
        <div style={{ background: "#0A0D11", border: `1px solid ${BORD}`, borderRadius: 12, padding: "16px 20px", textAlign: "left", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Deposit Amount</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>${fmt(parseFloat(form.amount))}</div>
          {bank && <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>Via {bank.name}</div>}
        </div>
        <button onClick={onBack} style={{
          height: 44, padding: "0 28px", borderRadius: 999, border: "none",
          background: "rgba(255,255,255,0.06)", color: TEXT, fontSize: 14, fontWeight: 500, cursor: "pointer",
        }}>
          Back to Wallet
        </button>
      </div>
    );
  }

  const Input = ({ label, field, placeholder, type = "text" }: { label: string; field: keyof typeof form; placeholder: string; type?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{label}</div>
      <input
        type={type}
        value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%", height: 44, background: "#0A0D11", border: `1px solid ${BORD}`,
          borderRadius: 8, padding: "0 14px", color: TEXT, fontSize: 14, outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );

  return (
    <div>
      <StepIndicator current={step} total={totalSteps} />

      {/* Step 0: Country */}
      {step === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Select Your Country</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Choose the country where your bank account is held.</div>
          <div style={{ position: "relative", marginBottom: 24 }}>
            <button onClick={() => setCountryOpen(o => !o)} style={{
              width: "100%", height: 48, background: "#0A0D11", border: `1px solid ${BORD}`,
              borderRadius: 10, padding: "0 16px", display: "flex", alignItems: "center",
              justifyContent: "space-between", color: country ? TEXT : MUTED, fontSize: 14, cursor: "pointer",
            }}>
              {country || "Select country"}
              <ChevronDown style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
            </button>
            {countryOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
                background: "#111418", border: `1px solid ${BORD}`, borderRadius: 10,
                maxHeight: 240, overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              }}>
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => { setCountry(c); setCountryOpen(false); }} style={{
                    width: "100%", padding: "12px 16px", background: c === country ? "rgba(37,99,255,0.08)" : "transparent",
                    border: "none", color: c === country ? TEXT : MUTED, fontSize: 14, textAlign: "left", cursor: "pointer",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = c === country ? "rgba(37,99,255,0.08)" : "transparent"}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button disabled={!canProceed0} onClick={() => setStep(1)} style={{
            width: "100%", height: 46, borderRadius: 999, border: "none",
            background: canProceed0 ? BLUE : "rgba(255,255,255,0.06)",
            color: canProceed0 ? "#fff" : MUTED, fontSize: 15, fontWeight: 600, cursor: canProceed0 ? "pointer" : "not-allowed",
          }}>
            Continue
          </button>
        </div>
      )}

      {/* Step 1: Bank selection (USA only) */}
      {step === 1 && isUSA && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Select Your Bank</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Choose your US bank to pre-fill routing information.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
            {US_BANKS.map(b => (
              <button key={b.name} onClick={() => setBank(b)} style={{
                padding: "12px 14px", background: bank?.name === b.name ? "rgba(37,99,255,0.1)" : "#0A0D11",
                border: `1px solid ${bank?.name === b.name ? "rgba(37,99,255,0.4)" : BORD}`,
                borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", transition: "all 0.12s",
              }}>
                <BankLogo bank={b} />
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT, textAlign: "left" }}>{b.name}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(0)} style={{
              height: 46, padding: "0 20px", borderRadius: 999, border: "none",
              background: "rgba(255,255,255,0.06)", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>Back</button>
            <button disabled={!canProceed1} onClick={() => setStep(2)} style={{
              flex: 1, height: 46, borderRadius: 999, border: "none",
              background: canProceed1 ? BLUE : "rgba(255,255,255,0.06)",
              color: canProceed1 ? "#fff" : MUTED, fontSize: 15, fontWeight: 600, cursor: canProceed1 ? "pointer" : "not-allowed",
            }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1 (non-USA) or Step 2 (USA): Account details */}
      {((step === 1 && !isUSA) || (step === 2 && isUSA)) && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Account Details</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
            Enter your bank account information.{bank ? ` Routing pre-filled for ${bank.name}.` : ""}
          </div>
          <Input label="ACCOUNT HOLDER FULL NAME" field="name" placeholder="As it appears on your bank account" />
          <Input label="ACCOUNT NUMBER" field="account" placeholder="Your bank account number" />
          <Input
            label={isUSA ? "ROUTING NUMBER" : "SORT / IBAN / ROUTING"}
            field="routing"
            placeholder={isUSA ? bank?.routing || "9-digit routing number" : "IBAN or routing code"}
          />
          {bank && !form.routing && (
            <button onClick={() => setForm(f => ({ ...f, routing: bank.routing }))} style={{
              fontSize: 12, color: BLUE, background: "none", border: "none", cursor: "pointer", marginTop: -8, marginBottom: 12, padding: 0,
            }}>
              Use {bank.name} default routing ({bank.routing})
            </button>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(isUSA ? 1 : 0)} style={{
              height: 46, padding: "0 20px", borderRadius: 999, border: "none",
              background: "rgba(255,255,255,0.06)", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>Back</button>
            <button disabled={!form.name || !form.account} onClick={() => setStep(isUSA ? 3 : 2)} style={{
              flex: 1, height: 46, borderRadius: 999, border: "none",
              background: form.name && form.account ? BLUE : "rgba(255,255,255,0.06)",
              color: form.name && form.account ? "#fff" : MUTED,
              fontSize: 15, fontWeight: 600, cursor: form.name && form.account ? "pointer" : "not-allowed",
            }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Last step: Amount */}
      {((step === 3 && isUSA) || (step === 2 && !isUSA)) && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Deposit Amount</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
            Enter how much you'd like to wire. A team member will contact you with full wire instructions.
          </div>
          {bank && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#0A0D11", border: `1px solid ${BORD}`, borderRadius: 10, marginBottom: 16 }}>
              <BankLogo bank={bank} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{bank.name}</div>
                <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                  ···{form.account?.slice(-4) || "xxxx"} &nbsp;|&nbsp; Routing: {form.routing || bank.routing}
                </div>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>AMOUNT (USD)</div>
            <div style={{ height: 52, background: "#0A0D11", border: `1px solid ${BORD}`, borderRadius: 10, display: "flex", alignItems: "center", padding: "0 16px" }}>
              <span style={{ color: MUTED, marginRight: 8, fontSize: 16 }}>$</span>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                min={0}
                style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 20, width: "100%", fontFamily: "monospace", fontWeight: 700 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[1000, 5000, 10000, 25000].map(amt => (
              <button key={amt} onClick={() => setForm(f => ({ ...f, amount: String(amt) }))} style={{
                flex: 1, height: 32, fontSize: 12, borderRadius: 6,
                background: form.amount === String(amt) ? "rgba(37,99,255,0.12)" : "#0A0D11",
                border: `1px solid ${form.amount === String(amt) ? "rgba(37,99,255,0.4)" : BORD}`,
                color: form.amount === String(amt) ? BLUE : MUTED, cursor: "pointer",
              }}>
                ${(amt / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
          <div style={{ background: "rgba(37,99,255,0.06)", border: "1px solid rgba(37,99,255,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
              After submitting, a member of our team will contact you within 24 hours to complete the wire transfer safely and securely. Do not send funds until you hear from us.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(isUSA ? 2 : 1)} style={{
              height: 46, padding: "0 20px", borderRadius: 999, border: "none",
              background: "rgba(255,255,255,0.06)", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer",
            }}>Back</button>
            <button
              disabled={submitting || !form.amount || parseFloat(form.amount) <= 0}
              onClick={handleSubmit}
              style={{
                flex: 1, height: 46, borderRadius: 999, border: "none",
                background: form.amount && parseFloat(form.amount) > 0 ? BLUE : "rgba(255,255,255,0.06)",
                color: form.amount && parseFloat(form.amount) > 0 ? "#fff" : MUTED,
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

export default function Wallet() {
  const { data: balance, isLoading: bl, refetch: refetchBalance } = useGetUserBalance();
  const { data: txData, isLoading: txl, refetch: refetchTx } = useGetTransactions({ limit: 20 });

  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [depositMethod, setDepositMethod] = useState<"wire" | "crypto" | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  const availableCash = balance?.availableCash || 0;
  const withdrawNum = parseFloat(withdrawAmount) || 0;
  const withdrawInsufficient = withdrawNum > availableCash && withdrawNum > 0;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawNum || withdrawNum <= 0) return toast.error("Enter a valid amount");
    if (withdrawNum > availableCash) {
      return toast.error(`Insufficient balance — available: $${fmt(availableCash)}`);
    }
    setWithdrawSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setWithdrawSubmitting(false);
    toast.success("Withdrawal request submitted — a team member will process it shortly.");
    setWithdrawAmount("");
    refetchBalance(); refetchTx();
  };

  const txTypeBadge = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      deposit: { label: "Deposit", color: GREEN },
      withdraw: { label: "Withdraw", color: RED },
      buy: { label: "Buy", color: "#60a5fa" },
      sell: { label: "Sell", color: "#f59e0b" },
      convert: { label: "Convert", color: "#a78bfa" },
    };
    return map[type] || { label: type, color: MUTED };
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: TEXT, margin: 0 }}>Wallet</h1>
        <button onClick={() => { refetchBalance(); refetchTx(); }} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <RefreshCw style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Refresh
        </button>
      </div>

      {/* Balance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
        {[
          { label: "Total Portfolio", value: balance?.totalPortfolioValue || 0, sub: "All assets" },
          { label: "Available Cash", value: availableCash, sub: "Ready to use" },
        ].map(card => (
          <div key={card.label} style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, fontWeight: 500 }}>{card.label}</div>
            {bl ? <Loader2 style={{ width: 20, height: 20, color: MUTED, animation: "spin 1s linear infinite" }} /> : (
              <>
                <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, fontFamily: "monospace", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  ${fmt(card.value)}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Transaction History</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Date", "Type", "Asset", "Amount", "Status"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: i === 0 ? "left" : "right", fontSize: 11, fontWeight: 500, color: MUTED, letterSpacing: "0.04em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txl ? (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: "center" }}>
                      <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    </td></tr>
                  ) : txData?.transactions?.length ? txData.transactions.map((tx) => {
                    const badge = txTypeBadge(tx.type);
                    return (
                      <tr key={tx.id} style={{ borderBottom: `1px solid ${BORD}` }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 20px", fontSize: 12, color: MUTED, fontFamily: "monospace" }}>
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 12, color: TEXT }}>{tx.symbol || "USD"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "right", fontSize: 13, fontWeight: 600, color: TEXT, fontFamily: "monospace" }}>
                          ${fmt(tx.amount)}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <span style={{
                            fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 500,
                            background: tx.status === "completed" ? "rgba(14,203,129,0.1)" : tx.status === "pending" ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.06)",
                            color: tx.status === "completed" ? GREEN : tx.status === "pending" ? "#fbbf24" : MUTED,
                          }}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: MUTED, fontSize: 14 }}>
                      No transactions yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div>
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${BORD}` }}>
              {(["deposit", "withdraw"] as const).map(tab => (
                <button key={tab} onClick={() => { setMode(tab); setDepositMethod(null); }} style={{
                  flex: 1, height: 48, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                  background: "transparent",
                  color: mode === tab ? TEXT : MUTED,
                  borderBottom: `2px solid ${mode === tab ? BLUE : "transparent"}`,
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
                      <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Select Deposit Method</div>
                      <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Choose how you want to fund your account.</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { id: "wire", label: "Wire Transfer", sub: "Bank wire · 1–3 business days", icon: "🏦" },
                          { id: "crypto", label: "Crypto Deposit", sub: "BTC, ETH, USDT & more", icon: "₿" },
                        ].map(m => (
                          <button key={m.id} onClick={() => setDepositMethod(m.id as any)} style={{
                            padding: "16px 18px", background: "#0A0D11", border: `1px solid ${BORD}`,
                            borderRadius: 12, display: "flex", alignItems: "center", gap: 14,
                            cursor: "pointer", transition: "all 0.12s", textAlign: "left",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,99,255,0.35)"; e.currentTarget.style.background = "rgba(37,99,255,0.04)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.background = "#0A0D11"; }}
                          >
                            <span style={{ fontSize: 24 }}>{m.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{m.label}</div>
                              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{m.sub}</div>
                            </div>
                            <ChevronRight style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : depositMethod === "wire" ? (
                    <div>
                      <button onClick={() => setDepositMethod(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
                        <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to methods
                      </button>
                      <WireDepositFlow onBack={() => setDepositMethod(null)} />
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setDepositMethod(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
                        <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Back to methods
                      </button>
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Crypto Deposit</div>
                        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 20 }}>Contact our support team to receive your personal deposit address for BTC, ETH, USDT, and other tokens.</div>
                        <div style={{ background: "#0A0D11", border: `1px solid ${BORD}`, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: MUTED }}>
                          A dedicated wallet address will be assigned to your account. Reach out via live chat or email.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── Withdraw ── */}
              {mode === "withdraw" && (
                <form onSubmit={handleWithdraw}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Withdraw Funds</div>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 20 }}>Withdrawals are processed within 1–2 business days.</div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <span>AMOUNT (USD)</span>
                      <span style={{ color: withdrawInsufficient ? RED : MUTED }}>
                        Avail: ${fmt(availableCash)}
                      </span>
                    </div>
                    <div style={{
                      height: 48, background: "#0A0D11",
                      border: `1px solid ${withdrawInsufficient ? RED : BORD}`,
                      borderRadius: 10, display: "flex", alignItems: "center", padding: "0 14px",
                    }}>
                      <span style={{ color: MUTED, marginRight: 8 }}>$</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        min={0}
                        max={availableCash}
                        style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 16, width: "100%", fontFamily: "monospace" }}
                      />
                    </div>
                    {withdrawInsufficient && (
                      <div style={{ fontSize: 11, color: RED, marginTop: 4 }}>
                        Amount exceeds available balance (${fmt(availableCash)})
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setWithdrawAmount(fmt(availableCash).replace(/,/g, ""))}
                    type="button"
                    style={{ fontSize: 12, color: BLUE, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 20 }}
                  >
                    Use maximum (${fmt(availableCash)})
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawSubmitting || withdrawInsufficient || !withdrawNum}
                    style={{
                      width: "100%", height: 46, borderRadius: 999, border: "none",
                      background: withdrawNum > 0 && !withdrawInsufficient ? BLUE : "rgba(255,255,255,0.06)",
                      color: withdrawNum > 0 && !withdrawInsufficient ? "#fff" : MUTED,
                      fontSize: 15, fontWeight: 600,
                      cursor: withdrawNum > 0 && !withdrawInsufficient ? "pointer" : "not-allowed",
                      opacity: withdrawSubmitting ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {withdrawSubmitting ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Processing...</> : "Request Withdrawal"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
