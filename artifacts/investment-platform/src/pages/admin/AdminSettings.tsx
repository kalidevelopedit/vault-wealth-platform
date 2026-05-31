import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2, Wallet, CheckCircle2 } from "lucide-react";

const CARD    = "#111827";
const CARD2   = "#0d1120";
const BORD    = "rgba(255,255,255,0.07)";
const TEXT    = "rgba(255,255,255,0.92)";
const MUTED   = "rgba(255,255,255,0.38)";
const BLUE    = "#3b82f6";

const COINS = [
  { symbol: "BTC",  name: "Bitcoin",       network: "Bitcoin Network",   color: "#f7931a" },
  { symbol: "ETH",  name: "Ethereum",      network: "ERC-20",            color: "#627eea" },
  { symbol: "USDT", name: "Tether",        network: "TRC-20 / ERC-20",   color: "#26a17b" },
  { symbol: "USDC", name: "USD Coin",      network: "ERC-20",            color: "#2775ca" },
  { symbol: "BNB",  name: "BNB",           network: "BEP-20",            color: "#f3ba2f" },
  { symbol: "SOL",  name: "Solana",        network: "Solana Network",    color: "#9945ff" },
  { symbol: "LTC",  name: "Litecoin",      network: "Litecoin Network",  color: "#bfbbbb" },
  { symbol: "XRP",  name: "XRP",           network: "XRP Ledger",        color: "#00aae4" },
];

async function adminFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts, credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default function AdminSettings() {
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch("/admin/settings")
      .then((data: Record<string, string>) => {
        const addrs: Record<string, string> = {};
        for (const coin of COINS) {
          addrs[coin.symbol] = data[`wallet_address_${coin.symbol}`] || "";
        }
        setAddresses(addrs);
      })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const coin of COINS) {
        payload[`wallet_address_${coin.symbol}`] = addresses[coin.symbol] || "";
      }
      await adminFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(payload) });
      toast.success("Wallet addresses saved");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputSx: React.CSSProperties = {
    width: "100%", height: 44, background: CARD2, border: `1px solid ${BORD}`,
    borderRadius: 10, padding: "0 14px", color: TEXT, fontSize: 13,
    outline: "none", boxSizing: "border-box", fontFamily: "monospace",
  };
  const labelSx: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase",
    letterSpacing: "0.12em", marginBottom: 6, display: "block",
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "0 0 6px" }}>Platform Settings</h1>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
          Manage deposit wallet addresses. Users will see these when making crypto deposits and a QR code is generated automatically.
        </p>
      </div>

      {/* Wallet Addresses Card */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Wallet size={15} color={BLUE} />
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Crypto Deposit Wallet Addresses
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <Loader2 size={20} color={MUTED} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {COINS.map(coin => (
              <div key={coin.symbol}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: `${coin.color}20`,
                    border: `1px solid ${coin.color}40`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 9, fontWeight: 800, color: coin.color, flexShrink: 0,
                  }}>{coin.symbol.slice(0, 3)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{coin.name}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{coin.network}</div>
                  </div>
                </div>
                <label style={labelSx}>{coin.symbol} Wallet Address</label>
                <input
                  style={inputSx}
                  value={addresses[coin.symbol] || ""}
                  onChange={e => setAddresses(a => ({ ...a, [coin.symbol]: e.target.value }))}
                  placeholder={`${coin.symbol} deposit wallet address`}
                />
                {addresses[coin.symbol] && (
                  <div style={{
                    marginTop: 6, padding: "6px 10px", borderRadius: 7,
                    background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
                    fontSize: 10, color: "#22c55e", fontFamily: "monospace",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {addresses[coin.symbol]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Preview hint */}
      <div style={{
        marginBottom: 24, padding: "14px 18px", borderRadius: 12,
        background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)",
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</div>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
          Once saved, users depositing crypto will see the wallet address + an auto-generated QR code.
          Leave an address blank to hide that coin from the deposit screen.
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || loading}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "13px 28px",
          borderRadius: 12, cursor: "pointer",
          background: saved ? "rgba(34,197,94,0.15)" : BLUE,
          color: saved ? "#22c55e" : "#fff",
          fontSize: 14, fontWeight: 700,
          opacity: saving || loading ? 0.6 : 1,
          border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
        }}
      >
        {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
        {saving ? "Saving…" : saved ? "Saved!" : "Save Wallet Addresses"}
      </button>
    </div>
  );
}
