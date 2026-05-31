import { useState, useMemo } from "react";
import {
  useCreateTransaction, useGetUserBalance, useGetHoldings,
  getGetUserBalanceQueryKey, getGetPortfolioSummaryQueryKey,
  getGetHoldingsQueryKey, getGetTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/use-auth";
import { AssetIcon } from "@/components/AssetIcon";
import {
  X, TrendingUp, TrendingDown, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, Check, Building2,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────
interface TradeAsset {
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent24h: number;
}
interface Props {
  asset: TradeAsset | null;
  defaultSide?: "buy" | "sell";
  onClose: () => void;
}
type FundingCurrency = "USD" | "USDT" | "USDC";
type BankField       = { id: string; label: string; placeholder: string };
type CountryBanking  = { banks: { name: string; logo: string }[]; fields: BankField[]; timeline: string };

// ── Funding options ─────────────────────────────────────────────────────────
const FUNDING_OPTIONS = [
  { id: "USD"  as FundingCurrency, label: "USD Balance", fee: 0,     desc: "Your available fiat balance — no conversion fee" },
  { id: "USDT" as FundingCurrency, label: "USDT",        fee: 0.001, desc: "Tether USD stablecoin — 0.1% swap fee" },
  { id: "USDC" as FundingCurrency, label: "USDC",        fee: 0.001, desc: "USD Coin — 0.1% swap fee" },
];

// ── Country banking config ─────────────────────────────────────────────────
const COUNTRY_BANKING: Record<string, CountryBanking> = {
  US: {
    timeline: "3–5 business days via ACH",
    banks: [
      { name: "Chase",           logo: "https://logo.clearbit.com/chase.com" },
      { name: "Bank of America", logo: "https://logo.clearbit.com/bankofamerica.com" },
      { name: "Wells Fargo",     logo: "https://logo.clearbit.com/wellsfargo.com" },
      { name: "Citibank",        logo: "https://logo.clearbit.com/citi.com" },
      { name: "US Bank",         logo: "https://logo.clearbit.com/usbank.com" },
      { name: "Capital One",     logo: "https://logo.clearbit.com/capitalone.com" },
      { name: "TD Bank",         logo: "https://logo.clearbit.com/td.com" },
      { name: "PNC Bank",        logo: "https://logo.clearbit.com/pnc.com" },
    ],
    fields: [
      { id: "routingNumber", label: "Routing Number (ABA)", placeholder: "9-digit routing number" },
      { id: "accountNumber", label: "Account Number",       placeholder: "10–12 digit account number" },
      { id: "accountType",   label: "Account Type",         placeholder: "Checking or Savings" },
    ],
  },
  GB: {
    timeline: "3–5 business days via BACS",
    banks: [
      { name: "Barclays",     logo: "https://logo.clearbit.com/barclays.com" },
      { name: "HSBC",         logo: "https://logo.clearbit.com/hsbc.com" },
      { name: "Lloyds Bank",  logo: "https://logo.clearbit.com/lloydsbank.com" },
      { name: "NatWest",      logo: "https://logo.clearbit.com/natwest.com" },
      { name: "Santander UK", logo: "https://logo.clearbit.com/santander.co.uk" },
      { name: "Nationwide",   logo: "https://logo.clearbit.com/nationwide.co.uk" },
    ],
    fields: [
      { id: "sortCode",      label: "Sort Code",           placeholder: "XX-XX-XX (6 digits)" },
      { id: "accountNumber", label: "Account Number",      placeholder: "8-digit account number" },
      { id: "accountName",   label: "Account Holder Name", placeholder: "As per your bank" },
    ],
  },
  CA: {
    timeline: "3–5 business days via EFT",
    banks: [
      { name: "RBC Royal Bank",  logo: "https://logo.clearbit.com/rbc.com" },
      { name: "TD Canada Trust", logo: "https://logo.clearbit.com/td.com" },
      { name: "Scotiabank",      logo: "https://logo.clearbit.com/scotiabank.com" },
      { name: "BMO",             logo: "https://logo.clearbit.com/bmo.com" },
      { name: "CIBC",            logo: "https://logo.clearbit.com/cibc.com" },
      { name: "National Bank",   logo: "https://logo.clearbit.com/nbc.ca" },
    ],
    fields: [
      { id: "institutionNumber", label: "Institution Number", placeholder: "3-digit institution #" },
      { id: "transitNumber",     label: "Transit Number",     placeholder: "5-digit branch transit" },
      { id: "accountNumber",     label: "Account Number",     placeholder: "7–12 digit account" },
    ],
  },
  AU: {
    timeline: "3–5 business days via BECS",
    banks: [
      { name: "Commonwealth Bank", logo: "https://logo.clearbit.com/commbank.com.au" },
      { name: "ANZ",               logo: "https://logo.clearbit.com/anz.com" },
      { name: "Westpac",           logo: "https://logo.clearbit.com/westpac.com.au" },
      { name: "NAB",               logo: "https://logo.clearbit.com/nab.com.au" },
      { name: "Macquarie",         logo: "https://logo.clearbit.com/macquarie.com" },
    ],
    fields: [
      { id: "bsb",           label: "BSB Number",   placeholder: "XXX-XXX (6 digits)" },
      { id: "accountNumber", label: "Account Number", placeholder: "6–10 digit account" },
      { id: "accountName",   label: "Account Name",   placeholder: "As per your bank" },
    ],
  },
  DE: {
    timeline: "2–4 business days via SEPA",
    banks: [
      { name: "Deutsche Bank",   logo: "https://logo.clearbit.com/db.com" },
      { name: "Commerzbank",     logo: "https://logo.clearbit.com/commerzbank.com" },
      { name: "Postbank",        logo: "https://logo.clearbit.com/postbank.de" },
      { name: "HypoVereinsbank", logo: "https://logo.clearbit.com/hvb.de" },
      { name: "Sparkasse",       logo: "https://logo.clearbit.com/sparkasse.de" },
    ],
    fields: [
      { id: "iban", label: "IBAN",        placeholder: "DE89 3704 0044 0532 0130 00" },
      { id: "bic",  label: "BIC / SWIFT", placeholder: "e.g. DEUTDEDB" },
    ],
  },
  FR: {
    timeline: "2–4 business days via SEPA",
    banks: [
      { name: "BNP Paribas",      logo: "https://logo.clearbit.com/bnpparibas.com" },
      { name: "Société Générale", logo: "https://logo.clearbit.com/societegenerale.com" },
      { name: "Crédit Agricole",  logo: "https://logo.clearbit.com/credit-agricole.fr" },
      { name: "LCL",              logo: "https://logo.clearbit.com/lcl.fr" },
    ],
    fields: [
      { id: "iban", label: "IBAN",        placeholder: "FR76 3000 6000 0112 3456 7890 189" },
      { id: "bic",  label: "BIC / SWIFT", placeholder: "e.g. BNPAFRPP" },
    ],
  },
  NL: {
    timeline: "2–4 business days via SEPA",
    banks: [
      { name: "ING",      logo: "https://logo.clearbit.com/ing.nl" },
      { name: "ABN AMRO", logo: "https://logo.clearbit.com/abnamro.nl" },
      { name: "Rabobank", logo: "https://logo.clearbit.com/rabobank.com" },
    ],
    fields: [
      { id: "iban", label: "IBAN",        placeholder: "NL91 ABNA 0417 1643 00" },
      { id: "bic",  label: "BIC / SWIFT", placeholder: "e.g. ABNANL2A" },
    ],
  },
  SE: {
    timeline: "2–4 business days via Bankgirot",
    banks: [
      { name: "Swedbank",      logo: "https://logo.clearbit.com/swedbank.se" },
      { name: "SEB",           logo: "https://logo.clearbit.com/seb.se" },
      { name: "Handelsbanken", logo: "https://logo.clearbit.com/handelsbanken.se" },
      { name: "Nordea",        logo: "https://logo.clearbit.com/nordea.se" },
    ],
    fields: [
      { id: "iban", label: "IBAN",        placeholder: "SE45 5000 0000 0583 9825 7466" },
      { id: "bic",  label: "BIC / SWIFT", placeholder: "e.g. SWEDSESS" },
    ],
  },
  CH: {
    timeline: "2–4 business days via SIC",
    banks: [
      { name: "UBS",         logo: "https://logo.clearbit.com/ubs.com" },
      { name: "PostFinance", logo: "https://logo.clearbit.com/postfinance.ch" },
      { name: "Raiffeisen",  logo: "https://logo.clearbit.com/raiffeisen.ch" },
      { name: "Zürcher KB",  logo: "https://logo.clearbit.com/zkb.ch" },
    ],
    fields: [
      { id: "iban", label: "IBAN",        placeholder: "CH56 0483 5012 3456 7800 9" },
      { id: "bic",  label: "BIC / SWIFT", placeholder: "e.g. UBSWCHZH80A" },
    ],
  },
  SG: {
    timeline: "2–4 business days via FAST/GIRO",
    banks: [
      { name: "DBS Bank",           logo: "https://logo.clearbit.com/dbs.com" },
      { name: "OCBC Bank",          logo: "https://logo.clearbit.com/ocbc.com" },
      { name: "UOB",                logo: "https://logo.clearbit.com/uob.com.sg" },
      { name: "Standard Chartered", logo: "https://logo.clearbit.com/sc.com" },
    ],
    fields: [
      { id: "accountNumber", label: "Account Number", placeholder: "e.g. 123-45678-9" },
      { id: "bankCode",      label: "Bank Code",      placeholder: "e.g. 7171 (DBS), 7339 (OCBC)" },
      { id: "swift",         label: "SWIFT / BIC",    placeholder: "e.g. DBSSSGSG" },
    ],
  },
  AE: {
    timeline: "2–4 business days",
    banks: [
      { name: "Emirates NBD",              logo: "https://logo.clearbit.com/emiratesnbd.com" },
      { name: "Abu Dhabi Commercial Bank", logo: "https://logo.clearbit.com/adcb.com" },
      { name: "First Abu Dhabi Bank",      logo: "https://logo.clearbit.com/bankfab.com" },
      { name: "Dubai Islamic Bank",        logo: "https://logo.clearbit.com/dib.ae" },
      { name: "Mashreq Bank",              logo: "https://logo.clearbit.com/mashreq.com" },
    ],
    fields: [
      { id: "iban",  label: "IBAN",        placeholder: "AE070331234567890123456" },
      { id: "swift", label: "SWIFT / BIC", placeholder: "e.g. EBILAEAD" },
    ],
  },
  JP: {
    timeline: "3–5 business days via Zengin",
    banks: [
      { name: "MUFG Bank",       logo: "https://logo.clearbit.com/bk.mufg.jp" },
      { name: "Sumitomo Mitsui", logo: "https://logo.clearbit.com/smbc.co.jp" },
      { name: "Mizuho Bank",     logo: "https://logo.clearbit.com/mizuhobank.co.jp" },
      { name: "Rakuten Bank",    logo: "https://logo.clearbit.com/rakuten-bank.co.jp" },
    ],
    fields: [
      { id: "bankCode",      label: "Bank Code (銀行コード)",    placeholder: "4-digit bank code" },
      { id: "branchCode",    label: "Branch Code (支店コード)",  placeholder: "3-digit branch code" },
      { id: "accountType",   label: "Account Type (種別)",       placeholder: "普通 or 当座" },
      { id: "accountNumber", label: "Account Number (口座番号)", placeholder: "7-digit number" },
    ],
  },
  IN: {
    timeline: "2–4 business days via NEFT/RTGS",
    banks: [
      { name: "HDFC Bank",           logo: "https://logo.clearbit.com/hdfcbank.com" },
      { name: "ICICI Bank",          logo: "https://logo.clearbit.com/icicibank.com" },
      { name: "State Bank of India", logo: "https://logo.clearbit.com/sbi.co.in" },
      { name: "Axis Bank",           logo: "https://logo.clearbit.com/axisbank.com" },
      { name: "Kotak Mahindra",      logo: "https://logo.clearbit.com/kotak.com" },
    ],
    fields: [
      { id: "ifsc",          label: "IFSC Code",           placeholder: "11-char (e.g. HDFC0001234)" },
      { id: "accountNumber", label: "Account Number",      placeholder: "9–18 digit account" },
      { id: "accountName",   label: "Account Holder Name", placeholder: "As per bank records" },
    ],
  },
  BR: {
    timeline: "1–3 business days via PIX/TED",
    banks: [
      { name: "Itaú Unibanco",          logo: "https://logo.clearbit.com/itau.com.br" },
      { name: "Banco do Brasil",         logo: "https://logo.clearbit.com/bb.com.br" },
      { name: "Bradesco",                logo: "https://logo.clearbit.com/bradesco.com.br" },
      { name: "Caixa Econômica Federal", logo: "https://logo.clearbit.com/caixa.gov.br" },
      { name: "Nubank",                  logo: "https://logo.clearbit.com/nubank.com.br" },
    ],
    fields: [
      { id: "pixKey",        label: "Chave PIX",     placeholder: "CPF, phone, email, or random key" },
      { id: "agencia",       label: "Agência",        placeholder: "4-digit branch code" },
      { id: "accountNumber", label: "Conta Corrente", placeholder: "Account number + check digit" },
    ],
  },
  ZA: {
    timeline: "3–5 business days via EFT",
    banks: [
      { name: "Standard Bank", logo: "https://logo.clearbit.com/standardbank.co.za" },
      { name: "ABSA",          logo: "https://logo.clearbit.com/absa.co.za" },
      { name: "FNB",           logo: "https://logo.clearbit.com/fnb.co.za" },
      { name: "Nedbank",       logo: "https://logo.clearbit.com/nedbank.co.za" },
      { name: "Capitec Bank",  logo: "https://logo.clearbit.com/capitecbank.co.za" },
    ],
    fields: [
      { id: "branchCode",    label: "Branch Code",   placeholder: "6-digit universal branch code" },
      { id: "accountNumber", label: "Account Number", placeholder: "9–11 digit account" },
      { id: "accountType",   label: "Account Type",   placeholder: "Cheque, Savings, or Transmission" },
    ],
  },
};

const DEFAULT_BANKING: CountryBanking = {
  timeline: "5–10 business days via SWIFT",
  banks: [],
  fields: [
    { id: "swift",       label: "SWIFT / BIC Code",      placeholder: "8 or 11-character SWIFT code" },
    { id: "iban",        label: "IBAN / Account Number",  placeholder: "Your full account number" },
    { id: "bankName",    label: "Bank Name",              placeholder: "Full name of your bank" },
    { id: "accountName", label: "Account Holder Name",    placeholder: "Name on the account" },
  ],
};

function getBankingConfig(code: string | undefined): CountryBanking {
  return code ? (COUNTRY_BANKING[code] ?? DEFAULT_BANKING) : DEFAULT_BANKING;
}

// ── Wallet types ────────────────────────────────────────────────────────────
const WALLET_TYPES_SELL = [
  { id: "metamask",  name: "MetaMask",        tag: "Browser",  logo: "https://www.google.com/s2/favicons?domain=metamask.io&sz=64",        coins: ["ETH","USDT","USDC","BNB"] },
  { id: "ledger",    name: "Ledger",          tag: "Hardware", logo: "https://www.google.com/s2/favicons?domain=ledger.com&sz=64",          coins: ["BTC","ETH","USDT","USDC","BNB","SOL"] },
  { id: "trezor",    name: "Trezor",          tag: "Hardware", logo: "https://www.google.com/s2/favicons?domain=trezor.io&sz=64",           coins: ["BTC","ETH","USDT","USDC"] },
  { id: "coinbase",  name: "Coinbase Wallet", tag: "Mobile",   logo: "https://www.google.com/s2/favicons?domain=wallet.coinbase.com&sz=64", coins: ["BTC","ETH","USDT","USDC","SOL"] },
  { id: "trust",     name: "Trust Wallet",    tag: "Mobile",   logo: "https://www.google.com/s2/favicons?domain=trustwallet.com&sz=64",     coins: ["BTC","ETH","USDT","USDC","BNB","SOL"] },
  { id: "phantom",   name: "Phantom",         tag: "Browser",  logo: "https://www.google.com/s2/favicons?domain=phantom.app&sz=64",         coins: ["SOL","ETH","USDC"] },
  { id: "exodus",    name: "Exodus",          tag: "Desktop",  logo: "https://www.google.com/s2/favicons?domain=exodus.com&sz=64",          coins: ["BTC","ETH","USDT","SOL","BNB"] },
  { id: "atomic",    name: "Atomic Wallet",   tag: "Desktop",  logo: "https://www.google.com/s2/favicons?domain=atomicwallet.io&sz=64",     coins: ["BTC","ETH","USDT","USDC","BNB","SOL"] },
];

const ADDR_FORMATS: Record<string, { hint: string; prefixes: string[]; minLen: number; maxLen: number }> = {
  BTC:  { hint: "Starts with 1, 3, or bc1 · 26–62 characters",               prefixes: ["1","3","bc1"], minLen: 26, maxLen: 62 },
  ETH:  { hint: "Starts with 0x · exactly 42 characters",                     prefixes: ["0x"],          minLen: 42, maxLen: 42 },
  USDT: { hint: "ERC-20: starts with 0x · TRC-20: starts with T",             prefixes: ["0x","T"],      minLen: 34, maxLen: 42 },
  USDC: { hint: "Starts with 0x · exactly 42 characters",                     prefixes: ["0x"],          minLen: 42, maxLen: 42 },
  BNB:  { hint: "BEP-20: starts with 0x · BSC native: starts with bnb1",      prefixes: ["0x","bnb1"],   minLen: 40, maxLen: 45 },
  SOL:  { hint: "Base58 alphanumeric · 32–44 characters",                      prefixes: [],              minLen: 32, maxLen: 44 },
};

function validateAddr(addr: string, sym: string): { ok: boolean; warn?: string } {
  if (!addr || addr.length < 10) return { ok: false };
  const fmt = ADDR_FORMATS[sym.toUpperCase()];
  if (!fmt) return addr.length >= 20 ? { ok: true } : { ok: false };
  const hasPrefix = fmt.prefixes.length === 0 || fmt.prefixes.some(p => addr.toLowerCase().startsWith(p.toLowerCase()));
  if (!hasPrefix) return { ok: false, warn: `Expected prefix: ${fmt.prefixes.join(" or ")}` };
  if (addr.length < fmt.minLen) return { ok: false, warn: `Too short — min ${fmt.minLen} characters` };
  if (addr.length > fmt.maxLen) return { ok: false, warn: `Too long — max ${fmt.maxLen} characters` };
  return { ok: true };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmt2 = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPrice = (n: number) =>
  n < 0.01
    ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function BankLogoImg({ bank }: { bank: { name: string; logo: string } }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: 26, height: 26, borderRadius: 6, overflow: "hidden", background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!err && bank.logo
        ? <img src={bank.logo} onError={() => setErr(true)} alt={bank.name} style={{ width: 20, height: 20, objectFit: "contain" }} />
        : <Building2 style={{ width: 13, height: 13, color: "#666" }} />}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function TradeModal({ asset, defaultSide = "buy", onClose }: Props) {
  const { colors } = useTheme();
  const { card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg, bg: BG } = colors;
  const { user } = useAuth();

  // buy flow state
  const [side, setSide]       = useState<"buy" | "sell">(defaultSide);
  const [step, setStep]       = useState<"funding" | "amount">(defaultSide === "buy" ? "funding" : "amount");
  const [funding, setFunding] = useState<FundingCurrency>("USD");
  const [amount, setAmount]   = useState("");

  // sell payout state
  const [sellStep, setSellStep]             = useState<"amount" | "payout">("amount");
  const [payoutMethod, setPayoutMethod]     = useState<"bank" | "crypto" | null>(null);
  const [selectedBank, setSelectedBank]     = useState("");
  const [otherBankName, setOtherBankName]   = useState("");
  const [bankFields, setBankFields]         = useState<Record<string, string>>({});
  const [walletType, setWalletType]         = useState("");
  const [walletAddress, setWalletAddress]   = useState("");

  // shared
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  // queries
  const queryClient                                       = useQueryClient();
  const { data: balance }                                 = useGetUserBalance();
  const { data: holdingsRaw, isLoading: holdingsLoading } = useGetHoldings({ query: {} as any });
  const createTx                                          = useCreateTransaction();

  // computed
  const bankConfig    = getBankingConfig(user?.country);
  const availableCash = Number(balance?.availableCash) || 0;
  const amtNum        = parseFloat(amount) || 0;
  const feeOpt        = FUNDING_OPTIONS.find(f => f.id === funding)!;
  const feeAmount     = amtNum * feeOpt.fee;
  const netAmount     = amtNum - feeAmount;
  const estQty        = asset && asset.currentPrice > 0 ? netAmount / asset.currentPrice : 0;

  const myHolding = useMemo(() => {
    const list = Array.isArray(holdingsRaw) ? (holdingsRaw as any[]) : [];
    return list.find((h: any) =>
      typeof h.symbol === "string" &&
      h.symbol.toUpperCase() === asset?.symbol?.toUpperCase()
    );
  }, [holdingsRaw, asset?.symbol]);

  const holdingQty   = Number(myHolding?.quantity)     || 0;
  const holdingValue = Number(myHolding?.currentValue) || 0;

  const insufficient = side === "buy"
    ? amtNum > availableCash && amtNum > 0
    : amtNum > holdingValue  && amtNum > 0;

  const addrVal  = walletAddress ? validateAddr(walletAddress, asset?.symbol ?? "") : { ok: false as const, warn: undefined };
  const addrFmt  = ADDR_FORMATS[(asset?.symbol ?? "").toUpperCase()];

  const compatibleWallets = WALLET_TYPES_SELL.filter(w =>
    !asset?.symbol || w.coins.includes(asset.symbol.toUpperCase())
  );
  const walletsToShow = compatibleWallets.length > 0 ? compatibleWallets : WALLET_TYPES_SELL;

  const effectiveBank = selectedBank === "Other" ? otherBankName : selectedBank;

  const payoutValid = payoutMethod === "bank"
    ? effectiveBank.trim() !== "" && bankConfig.fields.every(f => (bankFields[f.id] ?? "").trim() !== "")
    : payoutMethod === "crypto"
      ? walletType !== "" && addrVal.ok
      : false;

  if (!asset) return null;

  const pos = asset.changePercent24h >= 0;

  // helpers
  const resetSellState = () => {
    setSellStep("amount");
    setPayoutMethod(null);
    setSelectedBank("");
    setOtherBankName("");
    setBankFields({});
    setWalletType("");
    setWalletAddress("");
  };

  const handleSwitchSide = (s: "buy" | "sell") => {
    setSide(s);
    setStep(s === "buy" ? "funding" : "amount");
    setAmount("");
    resetSellState();
  };

  const showBack = (side === "buy" && step === "amount") || (side === "sell" && sellStep === "payout");
  const handleBack = () => {
    if (side === "buy" && step === "amount")       setStep("funding");
    if (side === "sell" && sellStep === "payout")  setSellStep("amount");
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    // sell amount step → advance to payout
    if (side === "sell" && sellStep === "amount") {
      if (!amtNum || amtNum <= 0)  { toast.error("Enter a valid amount"); return; }
      if (holdingValue <= 0)        { toast.error(`You don't hold any ${asset.symbol}`); return; }
      if (amtNum > holdingValue)    { toast.error(`Max sellable: $${fmt2(holdingValue)}`); return; }
      setSellStep("payout");
      return;
    }

    if (!amtNum || amtNum <= 0) { toast.error("Enter a valid amount"); return; }

    if (side === "buy" && amtNum > availableCash) {
      toast.error(`Insufficient funds — available: $${fmt2(availableCash)}`);
      return;
    }
    if (side === "sell") {
      if (holdingValue <= 0)     { toast.error(`You don't hold any ${asset.symbol}`); return; }
      if (amtNum > holdingValue) { toast.error(`Exceeds your ${asset.symbol} position — max: $${fmt2(holdingValue)}`); return; }
      if (!payoutValid)          { toast.error("Please complete all payout destination fields"); return; }
    }

    setSubmitting(true);
    try {
      const payoutInfo = side === "sell" ? {
        payoutMethod,
        ...(payoutMethod === "bank"   ? { bankName: effectiveBank, ...bankFields, timeline: bankConfig.timeline } : {}),
        ...(payoutMethod === "crypto" ? { walletType, walletAddress } : {}),
      } : undefined;

      await createTx.mutateAsync({
        data: {
          type: side,
          symbol: asset.symbol,
          amount: amtNum,
          ...(side === "buy"  ? { fundingCurrency: funding, swapFee: feeAmount } as any : {}),
          ...(side === "sell" ? { payoutInfo } as any : {}),
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() }),
      ]);
      setSuccess(true);
      // No auto-close — user must click OK
    } catch (err: any) {
      toast.error(err?.message || "Order failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input helper ──────────────────────────────────────────────────────────
  const inputStyle = (filled?: boolean): React.CSSProperties => ({
    width: "100%", height: 42, borderRadius: 9, padding: "0 12px",
    background: inputBg, border: `1px solid ${filled ? BLUE : BORD}`,
    color: TEXT, fontSize: 13, outline: "none",
    fontFamily: "monospace", boxSizing: "border-box",
    transition: "border-color 0.12s",
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: CARD, border: `1px solid ${BORD}`, borderRadius: 20,
        width: "100%", maxWidth: 440,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${BORD}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {showBack && (
              <button onClick={handleBack} style={{
                width: 28, height: 28, borderRadius: 8, background: inputBg,
                border: `1px solid ${BORD}`, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: MUTED, marginRight: 2,
              }}>
                <ChevronLeft size={14} strokeWidth={2} />
              </button>
            )}
            <AssetIcon symbol={asset.symbol} size={32} borderRadius="50%" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{asset.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                <span style={{ fontSize: 13, color: MUTED, fontFamily: "monospace" }}>${fmtPrice(asset.currentPrice)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pos ? GREEN : RED, display: "flex", alignItems: "center", gap: 2 }}>
                  {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {pos ? "+" : ""}{asset.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 10, background: inputBg,
            border: `1px solid ${BORD}`, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: MUTED,
          }}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* ══ SUCCESS SCREEN ══════════════════════════════════════════════ */}
          {success ? (
            <div style={{ padding: "32px 24px", textAlign: "center" }}>
              {/* Clean icon — no colored background */}
              <div style={{
                width: 52, height: 52, borderRadius: "50%", margin: "0 auto 18px",
                border: `1.5px solid ${BORD}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Check size={20} strokeWidth={1.5} style={{ color: TEXT }} />
              </div>

              <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
                {side === "buy" ? "Buy Order Submitted" : "Sell Order Submitted"}
              </div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, maxWidth: 320, margin: "0 auto 22px" }}>
                {side === "buy"
                  ? `Your order to buy ${asset.symbol} via ${funding} is under review and will be processed within 24 hours.`
                  : payoutMethod === "bank"
                    ? `Your sell order for ${asset.symbol} is pending admin approval. Once approved, $${fmt2(amtNum)} will be sent to your ${effectiveBank} account.`
                    : `Your sell order for ${asset.symbol} is pending admin approval. Once approved, funds will be transferred to your ${WALLET_TYPES_SELL.find(w => w.id === walletType)?.name ?? walletType} wallet.`
                }
              </div>

              {/* Payout summary (sell only) */}
              {side === "sell" && (
                <div style={{
                  background: BG, border: `1px solid ${BORD}`, borderRadius: 12,
                  padding: "14px 16px", marginBottom: 14, textAlign: "left",
                }}>
                  <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                    Payout Summary
                  </div>
                  {([
                    ["Selling", `${asset.symbol}`],
                    ["Amount", `$${fmt2(amtNum)}`],
                    ["Method", payoutMethod === "bank" ? "Bank Transfer" : "Crypto Wallet"],
                    ...(payoutMethod === "bank" ? [
                      ["Bank",     effectiveBank],
                      ["Timeline", bankConfig.timeline],
                    ] : [
                      ["Wallet",   WALLET_TYPES_SELL.find(w => w.id === walletType)?.name ?? walletType],
                      ["Address",  walletAddress.length > 14 ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}` : walletAddress],
                    ]),
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: MUTED }}>{label}</span>
                      <span style={{ color: TEXT, fontWeight: 600, fontFamily: label === "Address" ? "monospace" : undefined }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {side === "sell" && payoutMethod === "bank" && (
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, padding: "10px 14px", borderRadius: 9, border: `1px solid ${BORD}`, textAlign: "left" }}>
                  Bank transfers take up to <strong style={{ color: TEXT }}>{bankConfig.timeline}</strong>. You will receive email confirmation once funds are dispatched.
                </div>
              )}

              <div style={{ fontSize: 11, color: MUTED, marginBottom: 18 }}>
                ⏳ {side === "buy" ? "Processed within 24 hours" : "Pending admin review"}
              </div>

              <button onClick={onClose} style={{
                width: "100%", height: 44, borderRadius: 10, border: `1px solid ${BORD}`,
                background: "transparent", color: TEXT, fontSize: 14, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.02em",
              }}>
                OK
              </button>
            </div>

          ) : (
            <form onSubmit={handleTrade} style={{ padding: 20 }}>

              {/* ── Buy / Sell toggle ── */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
                background: BG, borderRadius: 12, padding: 4,
                border: `1px solid ${BORD}`, marginBottom: 18,
              }}>
                {(["buy", "sell"] as const).map(s => (
                  <button key={s} type="button" onClick={() => handleSwitchSide(s)} style={{
                    height: 38, borderRadius: 9, border: "none", cursor: "pointer",
                    fontSize: 13.5, fontWeight: 700, transition: "all 0.15s",
                    background: side === s ? (s === "buy" ? GREEN : RED) : "transparent",
                    color: side === s ? "#fff" : MUTED,
                    boxShadow: side === s ? `0 2px 10px ${s === "buy" ? "rgba(14,203,129,0.28)" : "rgba(246,70,93,0.28)"}` : "none",
                  }}>{s === "buy" ? "Buy" : "Sell"}</button>
                ))}
              </div>

              {/* ══ BUY: Funding step ══════════════════════════════════════ */}
              {side === "buy" && step === "funding" && (
                <div>
                  <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 12, letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase" }}>
                    Select Funding Source
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {FUNDING_OPTIONS.map(opt => (
                      <button key={opt.id} type="button" onClick={() => setFunding(opt.id)} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "13px 16px", borderRadius: 12, cursor: "pointer",
                        background: funding === opt.id ? "rgba(37,99,255,0.08)" : inputBg,
                        border: `1.5px solid ${funding === opt.id ? BLUE : BORD}`,
                        transition: "all 0.12s", textAlign: "left",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                            background: funding === opt.id ? "rgba(37,99,255,0.15)" : "rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: funding === opt.id ? BLUE : MUTED,
                          }}>
                            {opt.id === "USD" ? "$" : opt.id.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{opt.label}</div>
                            <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                              {opt.id === "USD" ? `Balance: $${fmt2(availableCash)}` : opt.desc}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {opt.fee > 0 ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#eab308", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 6, padding: "3px 7px" }}>
                              {(opt.fee * 100).toFixed(1)}% fee
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, background: "rgba(14,203,129,0.08)", border: "1px solid rgba(14,203,129,0.2)", borderRadius: 6, padding: "3px 7px" }}>
                              No fee
                            </span>
                          )}
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${funding === opt.id ? BLUE : BORD}`, background: funding === opt.id ? BLUE : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {funding === opt.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setStep("amount")} style={{
                    width: "100%", height: 46, borderRadius: 12, border: "none",
                    background: BLUE, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* ══ BUY: Amount step ═══════════════════════════════════════ */}
              {side === "buy" && step === "amount" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: BG, border: `1px solid ${BORD}`, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: MUTED }}>Available balance</span>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: insufficient ? RED : TEXT }}>
                      ${fmt2(availableCash)}
                    </span>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 7, letterSpacing: "0.06em", fontWeight: 500 }}>AMOUNT ({funding})</div>
                    <div style={{ height: 50, borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${insufficient ? RED : amtNum > 0 ? BLUE : BORD}`, background: inputBg, transition: "border-color 0.15s" }}>
                      <span style={{ fontSize: 17, color: MUTED, flexShrink: 0 }}>$</span>
                      <input autoFocus type="number" value={amount} min={0} step="any" onChange={e => setAmount(e.target.value)} placeholder="0.00"
                        style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 18, fontWeight: 600, width: "100%", fontFamily: "monospace" }} />
                    </div>
                    {amtNum > 0 && feeOpt.fee > 0 && (
                      <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 9, background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.15)", fontSize: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, marginBottom: 4 }}><span>You send</span><span style={{ color: TEXT, fontFamily: "monospace" }}>${fmt2(amtNum)}</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: MUTED, marginBottom: 4 }}><span>Swap fee</span><span style={{ color: "#eab308", fontFamily: "monospace" }}>−${fmt2(feeAmount)}</span></div>
                        <div style={{ height: 1, background: BORD, margin: "6px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: MUTED }}>Net to invest</span><span style={{ color: GREEN, fontWeight: 700, fontFamily: "monospace" }}>${fmt2(netAmount)}</span></div>
                      </div>
                    )}
                    {amtNum > 0 && estQty > 0 && (
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 6, textAlign: "right", fontFamily: "monospace" }}>
                        ≈ {estQty < 0.0001 ? estQty.toFixed(8) : estQty.toFixed(6)} {asset.symbol}
                      </div>
                    )}
                    {insufficient && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, color: RED, fontSize: 12 }}>
                        <AlertCircle size={12} strokeWidth={2} />
                        Insufficient funds — need ${fmt2(amtNum - availableCash)} more
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} type="button" onClick={() => setAmount(((availableCash * pct) / 100).toFixed(2))}
                        style={{ flex: 1, height: 30, fontSize: 12, borderRadius: 8, background: "transparent", border: `1px solid ${BORD}`, color: MUTED, cursor: "pointer", fontWeight: 500, transition: "all 0.1s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = TEXT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.color = MUTED; }}
                      >{pct}%</button>
                    ))}
                  </div>

                  {amtNum > 0 && (
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(14,203,129,0.06)", border: "1px solid rgba(14,203,129,0.18)", marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: MUTED }}>Total cost</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GREEN, fontFamily: "monospace" }}>${fmt2(amtNum)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: MUTED }}>Status after submission</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#eab308" }}>⏳ Pending Admin Review</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={submitting || insufficient || !amtNum} style={{
                    width: "100%", height: 48, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, color: "#fff", background: GREEN,
                    cursor: submitting || insufficient || !amtNum ? "not-allowed" : "pointer", opacity: submitting || !amtNum ? 0.65 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: !submitting && amtNum && !insufficient ? "0 4px 18px rgba(14,203,129,0.35)" : "none", transition: "all 0.15s",
                  }}>
                    {submitting ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing…</> : `Submit Buy Order — ${asset.symbol}`}
                  </button>
                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: MUTED }}>
                    Orders are reviewed and processed within 24 hours
                  </div>
                </>
              )}

              {/* ══ SELL: Amount step ══════════════════════════════════════ */}
              {side === "sell" && sellStep === "amount" && (
                <>
                  {/* Holding strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: BG, border: `1px solid ${BORD}`, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: MUTED }}>{asset.symbol} position</div>
                      {holdingQty > 0 && !holdingsLoading && (
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 1, fontFamily: "monospace" }}>
                          {holdingQty < 0.0001 ? holdingQty.toFixed(8) : holdingQty.toFixed(6)} {asset.symbol}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace", color: holdingsLoading ? MUTED : holdingValue > 0 ? GREEN : RED }}>
                      {holdingsLoading ? "Loading…" : holdingValue > 0 ? `$${fmt2(holdingValue)}` : `No ${asset.symbol} held`}
                    </span>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 7, letterSpacing: "0.06em", fontWeight: 500 }}>AMOUNT (USD)</div>
                    <div style={{ height: 50, borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center", gap: 8, border: `1.5px solid ${insufficient ? RED : amtNum > 0 ? BLUE : BORD}`, background: inputBg, transition: "border-color 0.15s" }}>
                      <span style={{ fontSize: 17, color: MUTED, flexShrink: 0 }}>$</span>
                      <input autoFocus type="number" value={amount} min={0} step="any" onChange={e => setAmount(e.target.value)} placeholder="0.00"
                        style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 18, fontWeight: 600, width: "100%", fontFamily: "monospace" }} />
                    </div>
                    {amtNum > 0 && asset.currentPrice > 0 && (
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 6, textAlign: "right", fontFamily: "monospace" }}>
                        ≈ {(amtNum / asset.currentPrice).toFixed(asset.currentPrice > 100 ? 6 : 4)} {asset.symbol}
                      </div>
                    )}
                    {insufficient && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, color: RED, fontSize: 12 }}>
                        <AlertCircle size={12} strokeWidth={2} />
                        {holdingValue > 0 ? `Exceeds position — max $${fmt2(holdingValue)}` : `You don't hold any ${asset.symbol}`}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} type="button" onClick={() => setAmount(((holdingValue * pct) / 100).toFixed(2))}
                        style={{ flex: 1, height: 30, fontSize: 12, borderRadius: 8, background: "transparent", border: `1px solid ${BORD}`, color: MUTED, cursor: "pointer", fontWeight: 500, transition: "all 0.1s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = TEXT; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.color = MUTED; }}
                      >{pct}%</button>
                    ))}
                  </div>

                  <button type="submit"
                    disabled={!amtNum || amtNum <= 0 || insufficient || (holdingsLoading && holdingValue === 0) || holdingValue <= 0}
                    style={{
                      width: "100%", height: 48, borderRadius: 12, border: "none", fontSize: 14, fontWeight: 700, color: "#fff", background: RED,
                      cursor: !amtNum || insufficient || holdingValue <= 0 ? "not-allowed" : "pointer",
                      opacity: !amtNum || holdingValue <= 0 ? 0.55 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s",
                    }}>
                    {holdingsLoading && !holdingValue
                      ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading position…</>
                      : holdingValue <= 0
                        ? `No ${asset.symbol} to sell`
                        : `Continue to Payout →`}
                  </button>
                  <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: MUTED }}>
                    You will choose your payout destination on the next step
                  </div>
                </>
              )}

              {/* ══ SELL: Payout destination step ══════════════════════════ */}
              {side === "sell" && sellStep === "payout" && (
                <>
                  {/* Amount reminder */}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderRadius: 9, border: `1px solid ${BORD}`, background: BG, marginBottom: 18, fontSize: 13 }}>
                    <span style={{ color: MUTED }}>Selling {asset.symbol}</span>
                    <span style={{ color: TEXT, fontWeight: 700, fontFamily: "monospace" }}>${fmt2(amtNum)}</span>
                  </div>

                  {/* Method selection */}
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 10, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>
                    Choose Payout Destination
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                    {([
                      { id: "bank" as const,   label: "Bank Transfer",  sub: "USD sent to your bank",   icon: "🏦" },
                      { id: "crypto" as const, label: "Crypto Wallet",   sub: "Transfer coin to wallet", icon: "₿" },
                    ]).map(opt => (
                      <button key={opt.id} type="button" onClick={() => setPayoutMethod(opt.id)} style={{
                        padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        border: `1.5px solid ${payoutMethod === opt.id ? BLUE : BORD}`,
                        background: payoutMethod === opt.id ? "rgba(37,99,255,0.08)" : inputBg,
                        transition: "all 0.12s",
                      }}>
                        <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>{opt.sub}</div>
                      </button>
                    ))}
                  </div>

                  {/* ── Bank Transfer form ── */}
                  {payoutMethod === "bank" && (
                    <>
                      {/* Timeline notice */}
                      <div style={{ fontSize: 12, color: MUTED, padding: "9px 12px", borderRadius: 9, border: `1px solid ${BORD}`, marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ flexShrink: 0 }}>⏱</span>
                        <span>Bank transfers take up to <strong style={{ color: TEXT }}>{bankConfig.timeline}</strong>. Processing begins after admin approval.</span>
                      </div>

                      {/* Bank selector */}
                      {bankConfig.banks.length > 0 && (
                        <>
                          <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>Select Your Bank</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                            {bankConfig.banks.map(bank => (
                              <button key={bank.name} type="button" onClick={() => setSelectedBank(bank.name)} style={{
                                display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9,
                                border: `1.5px solid ${selectedBank === bank.name ? BLUE : BORD}`,
                                background: selectedBank === bank.name ? "rgba(37,99,255,0.08)" : inputBg,
                                cursor: "pointer", transition: "all 0.1s",
                              }}>
                                <BankLogoImg bank={bank} />
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: selectedBank === bank.name ? TEXT : MUTED, whiteSpace: "nowrap" }}>
                                  {bank.name}
                                </span>
                              </button>
                            ))}
                            <button type="button" onClick={() => setSelectedBank("Other")} style={{
                              display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 9,
                              border: `1.5px solid ${selectedBank === "Other" ? BLUE : BORD}`,
                              background: selectedBank === "Other" ? "rgba(37,99,255,0.08)" : inputBg,
                              cursor: "pointer",
                            }}>
                              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Building2 size={12} style={{ color: MUTED }} />
                              </div>
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: selectedBank === "Other" ? TEXT : MUTED }}>Other</span>
                            </button>
                          </div>
                        </>
                      )}

                      {/* Custom bank name (when "Other" or no presets) */}
                      {(bankConfig.banks.length === 0 || selectedBank === "Other") && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 5, fontWeight: 500 }}>Bank Name</div>
                          <input value={otherBankName} onChange={e => setOtherBankName(e.target.value)} placeholder="Full name of your bank" style={inputStyle(otherBankName.trim() !== "")} />
                        </div>
                      )}

                      {/* Country-specific banking fields */}
                      {(bankConfig.banks.length === 0 || selectedBank) && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 4 }}>
                          {bankConfig.fields.map(field => (
                            <div key={field.id}>
                              <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 5, fontWeight: 500 }}>{field.label}</div>
                              <input
                                value={bankFields[field.id] ?? ""}
                                onChange={e => setBankFields(prev => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder}
                                style={inputStyle((bankFields[field.id] ?? "").trim() !== "")}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Crypto Wallet form ── */}
                  {payoutMethod === "crypto" && (
                    <>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, letterSpacing: "0.08em", fontWeight: 700, textTransform: "uppercase" }}>
                        Select Your Wallet
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        {walletsToShow.map(w => (
                          <button key={w.id} type="button" onClick={() => setWalletType(walletType === w.id ? "" : w.id)} style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 9,
                            border: `1.5px solid ${walletType === w.id ? BLUE : BORD}`,
                            background: walletType === w.id ? "rgba(37,99,255,0.08)" : inputBg,
                            cursor: "pointer", transition: "all 0.1s",
                          }}>
                            <img src={w.logo} alt={w.name}
                              style={{ width: 18, height: 18, borderRadius: 4, objectFit: "contain" }}
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: walletType === w.id ? TEXT : MUTED }}>{w.name}</span>
                            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: MUTED }}>{w.tag}</span>
                          </button>
                        ))}
                      </div>

                      <div style={{ marginBottom: 4 }}>
                        <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 6, fontWeight: 500 }}>
                          Wallet Address ({asset.symbol})
                        </div>
                        <div style={{ position: "relative" }}>
                          <input
                            value={walletAddress}
                            onChange={e => setWalletAddress(e.target.value)}
                            placeholder={`Paste your ${asset.symbol} wallet address`}
                            spellCheck={false}
                            style={{
                              ...inputStyle(),
                              height: 46, padding: "0 42px 0 12px", fontSize: 12,
                              border: `1.5px solid ${walletAddress ? (addrVal.ok ? GREEN : RED) : BORD}`,
                            }}
                          />
                          {walletAddress && (
                            <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                              {addrVal.ok
                                ? <Check size={14} style={{ color: GREEN }} strokeWidth={2.5} />
                                : <AlertCircle size={14} style={{ color: RED }} strokeWidth={2} />}
                            </div>
                          )}
                        </div>
                        {addrFmt && !walletAddress && (
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 5 }}>{addrFmt.hint}</div>
                        )}
                        {walletAddress && !addrVal.ok && addrVal.warn && (
                          <div style={{ fontSize: 11, color: RED, marginTop: 4 }}>{addrVal.warn}</div>
                        )}
                        {walletAddress && addrVal.ok && (
                          <div style={{ fontSize: 11, color: GREEN, marginTop: 4 }}>
                            Valid {asset.symbol} address format
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Submit */}
                  <div style={{ paddingTop: 16 }}>
                    <button type="submit" disabled={submitting || !payoutValid} style={{
                      width: "100%", height: 48, borderRadius: 12, border: "none",
                      fontSize: 14, fontWeight: 700, color: "#fff", background: RED,
                      cursor: submitting || !payoutValid ? "not-allowed" : "pointer",
                      opacity: !payoutValid ? 0.5 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s",
                      boxShadow: payoutValid && !submitting ? "0 4px 18px rgba(246,70,93,0.28)" : "none",
                    }}>
                      {submitting
                        ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</>
                        : `Submit Sell Order — $${fmt2(amtNum)}`}
                    </button>
                    <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: MUTED }}>
                      Sell orders are reviewed by admin — funds sent to your payout destination upon approval
                    </div>
                  </div>
                </>
              )}

            </form>
          )}
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
