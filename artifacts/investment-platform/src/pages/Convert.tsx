import { useState } from "react";
import { useListAssets, useGetUserBalance, useCreateTransaction } from "@workspace/api-client-react";
import { ArrowUpDown, Loader2, ChevronDown, Info } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

const fmt = (n: number, d = 6) =>
  n < 0.001 ? n.toExponential(2) : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: d });

// Conversion rules:
// crypto → crypto ✓
// crypto → USD ✓
// stock  → USD ✓
// commodity → USD ✓
// stock → stock ✗ | stock → crypto ✗
// commodity → commodity ✗ | commodity → crypto ✗

const ASSET_TYPE_MAP: Record<string, "crypto" | "stock" | "commodity" | "fiat"> = {
  USD: "fiat",
  USDT: "crypto", USDC: "crypto", BTC: "crypto", ETH: "crypto",
  SOL: "crypto", BNB: "crypto", XRP: "crypto", ADA: "crypto",
  DOT: "crypto", DOGE: "crypto", AVAX: "crypto", MATIC: "crypto",
  LINK: "crypto", UNI: "crypto", ATOM: "crypto", NEAR: "crypto",
};

function getAssetType(symbol: string, asset: any): "crypto" | "stock" | "commodity" | "fiat" {
  if (symbol === "USD") return "fiat";
  if (ASSET_TYPE_MAP[symbol]) return ASSET_TYPE_MAP[symbol];
  if (!asset) return "stock";
  const category = (asset.category || asset.assetType || "").toLowerCase();
  if (category.includes("crypto")) return "crypto";
  if (category.includes("commodity") || ["GOLD", "SILVER", "OIL", "CRUDE", "GAS", "WHEAT", "COPPER", "PLAT"].some(c => symbol.includes(c))) return "commodity";
  return "stock";
}

function isConversionAllowed(
  fromSymbol: string,
  toSymbol: string,
  fromAsset: any,
  toAsset: any,
  assets: any[],
): { ok: boolean; reason?: string } {
  if (fromSymbol === toSymbol) return { ok: false, reason: "Select two different assets" };
  const fromType = getAssetType(fromSymbol, fromAsset);
  const toType = getAssetType(toSymbol, toAsset);

  if (fromType === "fiat") return { ok: false, reason: "Use the Deposit tab to convert USD to assets" };
  if (fromType === "crypto" && (toType === "crypto" || toType === "fiat")) return { ok: true };
  if (fromType === "stock" && toType === "fiat") return { ok: true };
  if (fromType === "commodity" && toType === "fiat") return { ok: true };

  // Specific error messages
  if (fromType === "stock" && toType === "stock") return { ok: false, reason: "Stock → Stock conversion not supported. Sell to USD first." };
  if (fromType === "stock" && toType === "crypto") return { ok: false, reason: "Stock → Crypto not supported. Sell stock to USD first, then buy crypto." };
  if (fromType === "commodity" && toType === "commodity") return { ok: false, reason: "Commodity → Commodity conversion not supported. Sell to USD first." };
  if (fromType === "commodity" && toType === "crypto") return { ok: false, reason: "Commodity → Crypto not supported. Sell commodity to USD first, then buy crypto." };
  if (fromType === "crypto" && toType === "stock") return { ok: false, reason: "Crypto → Stock not supported. Convert to USD first, then buy the stock." };
  if (fromType === "crypto" && toType === "commodity") return { ok: false, reason: "Crypto → Commodity not supported. Convert to USD first, then buy the commodity." };

  return { ok: false, reason: "This conversion pair is not supported." };
}

const USD_FIAT = { symbol: "USD", name: "US Dollar", currentPrice: 1, category: "fiat", id: "usd" };

function AssetSelector({ value, onChange, assets, label, allowFiat = false, colors }: {
  value: string; onChange: (v: string) => void; assets: any[];
  label: string; allowFiat?: boolean; colors: any;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const all = allowFiat ? [USD_FIAT, ...assets] : assets;
  const filtered = search
    ? all.filter(a => a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
    : all.slice(0, 40);
  const selected = all.find(a => a.symbol === value);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: colors.muted, letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <button onClick={() => { setOpen(o => !o); setSearch(""); }} style={{
        width: "100%", height: 52, background: colors.inputBg, border: `1px solid ${colors.bord}`,
        borderRadius: 12, padding: "0 16px", display: "flex", alignItems: "center",
        gap: 10, cursor: "pointer", color: colors.text,
      }}>
        {selected ? (
          <>
            <AssetIcon symbol={selected.symbol} size={24} />
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1, textAlign: "left" }}>{selected.symbol}</span>
            <span style={{ fontSize: 12, color: colors.muted }}>{selected.name}</span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: colors.muted, flex: 1, textAlign: "left" }}>Select asset</span>
        )}
        <ChevronDown style={{ width: 16, height: 16, color: colors.muted, flexShrink: 0 }} strokeWidth={1.5} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 12,
          overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", maxHeight: 320,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${colors.bord}` }}>
            <input
              autoFocus
              placeholder="Search assets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", height: 34, background: colors.inputBg, border: `1px solid ${colors.bord}`,
                borderRadius: 8, padding: "0 12px", color: colors.text, fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map(a => (
              <button key={a.symbol} onClick={() => { onChange(a.symbol); setOpen(false); }} style={{
                width: "100%", padding: "12px 16px", background: "transparent", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: colors.text,
              }}
                onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <AssetIcon symbol={a.symbol} size={28} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.symbol}</div>
                  <div style={{ fontSize: 11, color: colors.muted }}>{a.name}</div>
                </div>
                <div style={{ fontSize: 13, fontFamily: "monospace", color: colors.muted }}>${fmt(a.currentPrice, 2)}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: colors.muted, fontSize: 13 }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Convert() {
  const { colors } = useTheme();
  const { data: allAssets } = useListAssets();
  const { data: balance } = useGetUserBalance();
  const createTx = useCreateTransaction();

  const [fromSym, setFromSym] = useState("BTC");
  const [toSym, setToSym] = useState("ETH");
  const [fromAmt, setFromAmt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ from: string; to: string; fromAmt: number; toAmt: number } | null>(null);

  const assets = (allAssets || []) as any[];
  const fromAsset = assets.find(a => a.symbol === fromSym) || (fromSym === "USD" ? USD_FIAT : null);
  const toAsset   = assets.find(a => a.symbol === toSym) || (toSym === "USD" ? USD_FIAT : null);

  const rate = fromAsset && toAsset ? fromAsset.currentPrice / toAsset.currentPrice : 0;
  const toAmt = parseFloat(fromAmt) > 0 && rate > 0 ? parseFloat(fromAmt) * rate : 0;
  const usdValue = parseFloat(fromAmt) > 0 && fromAsset ? parseFloat(fromAmt) * fromAsset.currentPrice : 0;

  const convCheck = isConversionAllowed(fromSym, toSym, fromAsset, toAsset, assets);
  const availableCash = balance?.availableCash || 0;
  const insufficient = usdValue > availableCash && usdValue > 0;

  const swap = () => {
    // Only swap if the reverse is also a valid pair
    const reverseCheck = isConversionAllowed(toSym, fromSym, toAsset, fromAsset, assets);
    if (!reverseCheck.ok) {
      toast.info("Swapped direction is not supported for this pair");
      return;
    }
    setFromSym(toSym); setToSym(fromSym); setFromAmt("");
  };

  const handleConvert = async (): Promise<void> => {
    const amt = parseFloat(fromAmt);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!fromAsset || !toAsset) { toast.error("Select assets to convert"); return; }
    if (!convCheck.ok) { toast.error(convCheck.reason || "Invalid conversion pair"); return; }
    if (insufficient) { toast.error(`Insufficient funds — available: $${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`); return; }

    setSubmitting(true);
    try {
      await createTx.mutateAsync({
        data: {
          type: "convert" as any,
          amount: usdValue,
          symbol: fromSym,
        } as any,
      });
      const result = { from: fromSym, to: toSym, fromAmt: amt, toAmt };
      setSuccess(result);
      setFromAmt("");
      toast.success(`Converted ${amt} ${fromSym} → ${toSym}`);
    } catch (e: any) {
      toast.error(e.message || "Conversion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const QUICK_PAIRS = [
    { from: "BTC", to: "ETH", label: "BTC/ETH" },
    { from: "ETH", to: "USD", label: "ETH → USD" },
    { from: "SOL", to: "BTC", label: "SOL/BTC" },
    { from: "BNB", to: "USDC", label: "BNB/USDC" },
  ];

  if (success) {
    return (
      <div style={{ padding: "32px 24px", maxWidth: 560, margin: "0 auto", background: colors.bg, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(14,203,129,0.1)", border: "1.5px solid #0ecb81", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ecb81" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Conversion Complete</h2>
        <p style={{ fontSize: 14, color: colors.muted, lineHeight: 1.7, marginBottom: 24 }}>
          Successfully converted <strong style={{ color: colors.text }}>{success.fromAmt} {success.from}</strong> to <strong style={{ color: colors.blue }}>{fmt(success.toAmt, 6)} {success.to}</strong> at market rate.
        </p>
        <button onClick={() => setSuccess(null)} style={{ height: 44, padding: "0 28px", borderRadius: 999, border: "none", background: colors.blue, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          New Conversion
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", background: colors.bg, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 8 }}>Convert</h1>
      <p style={{ fontSize: 14, color: colors.muted, marginBottom: 32 }}>Swap between supported asset pairs at live market rates.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter Card */}
        <div className="lg:col-span-2">
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 24 }}>Swap Assets</div>

            {/* From selector */}
            <AssetSelector label="FROM" value={fromSym} onChange={v => { setFromSym(v); setFromAmt(""); }} assets={assets} allowFiat={false} colors={colors} />

            <div style={{ marginTop: 12, position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: colors.muted, letterSpacing: "0.06em", marginBottom: 8 }}>AMOUNT</div>
              <input
                type="number"
                value={fromAmt}
                onChange={e => setFromAmt(e.target.value)}
                placeholder="0.00"
                min={0}
                style={{
                  width: "100%", height: 52, background: colors.inputBg, border: `1px solid ${colors.bord}`,
                  borderRadius: 12, padding: "0 16px", color: colors.text, fontSize: 18, fontWeight: 600,
                  outline: "none", boxSizing: "border-box", fontFamily: "monospace",
                }}
              />
              {fromAsset && parseFloat(fromAmt) > 0 && (
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>≈ ${fmt(usdValue, 2)} USD</div>
              )}
            </div>

            {/* Swap Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: colors.bord }} />
              <button onClick={swap} style={{
                width: 40, height: 40, borderRadius: "50%", background: colors.active || colors.inputBg,
                border: `1px solid ${colors.bord}`, cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: colors.muted, transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = colors.blue; (e.currentTarget as any).querySelector("svg").style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = colors.active || colors.inputBg; }}
              >
                <ArrowUpDown style={{ width: 16, height: 16 }} strokeWidth={2} />
              </button>
              <div style={{ flex: 1, height: 1, background: colors.bord }} />
            </div>

            {/* To selector — always show USD as option */}
            <AssetSelector label="TO" value={toSym} onChange={v => { setToSym(v); setFromAmt(""); }} assets={assets} allowFiat colors={colors} />

            {/* Conversion validation */}
            {fromSym && toSym && fromSym !== toSym && !convCheck.ok && (
              <div style={{
                marginTop: 14, padding: "12px 16px", background: "rgba(246,70,93,0.07)",
                border: "1px solid rgba(246,70,93,0.2)", borderRadius: 10,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <Info style={{ width: 16, height: 16, color: "#f6465d", flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
                <div style={{ fontSize: 13, color: "#f6465d", lineHeight: 1.5 }}>{convCheck.reason}</div>
              </div>
            )}

            {/* Preview */}
            {convCheck.ok && rate > 0 && toAmt > 0 && (
              <div style={{
                marginTop: 16, padding: "14px 18px", background: `rgba(37,99,255,0.07)`,
                border: `1px solid rgba(37,99,255,0.15)`, borderRadius: 10,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 13, color: colors.muted }}>You will receive</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: "monospace" }}>
                  {fmt(toAmt)} <span style={{ color: colors.blue }}>{toSym}</span>
                </div>
              </div>
            )}

            {/* Rate */}
            {fromAsset && toAsset && convCheck.ok && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: 8, borderTop: `1px solid ${colors.bord}` }}>
                <span style={{ fontSize: 12, color: colors.muted }}>Exchange Rate</span>
                <span style={{ fontSize: 12, color: colors.text, fontFamily: "monospace" }}>
                  1 {fromSym} = {fmt(rate)} {toSym}
                </span>
              </div>
            )}

            {/* Insufficient */}
            {convCheck.ok && insufficient && (
              <div style={{ fontSize: 12, color: colors.red, marginTop: 8, textAlign: "right" }}>
                Insufficient funds — available: ${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={!fromAmt || submitting || insufficient || !convCheck.ok}
              style={{
                width: "100%", height: 52, background: colors.blue, border: "none", borderRadius: 12,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 16,
                opacity: !fromAmt || submitting || insufficient || !convCheck.ok ? 0.45 : 1, transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {submitting ? <><Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> Processing...</> : "Convert Now"}
            </button>
          </div>

          {/* Conversion Rules */}
          <div style={{ marginTop: 16, background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 14 }}>Supported Conversions</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Crypto → Crypto", desc: "BTC, ETH, SOL, etc.", allowed: true },
                { label: "Crypto → USD", desc: "Sell crypto to cash", allowed: true },
                { label: "Stock → USD", desc: "Liquidate equity", allowed: true },
                { label: "Commodity → USD", desc: "Sell gold, oil, etc.", allowed: true },
                { label: "Stock → Stock", desc: "Not supported", allowed: false },
                { label: "Any → Stock/Commodity", desc: "Use trading desk", allowed: false },
              ].map(r => (
                <div key={r.label} style={{
                  padding: "10px 14px", background: r.allowed ? "rgba(14,203,129,0.04)" : "rgba(246,70,93,0.04)",
                  border: `1px solid ${r.allowed ? "rgba(14,203,129,0.15)" : "rgba(246,70,93,0.12)"}`,
                  borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 14 }}>{r.allowed ? "✓" : "✗"}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: r.allowed ? colors.green : colors.red }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: colors.muted }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Available Balance */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>Available Cash</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: "monospace" }}>
              ${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Quick Pairs */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 16 }}>Quick Pairs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {QUICK_PAIRS.map(p => {
                const fa = assets.find(a => a.symbol === p.from) || (p.from === "USD" ? USD_FIAT : null);
                const ta = assets.find(a => a.symbol === p.to) || (p.to === "USD" ? USD_FIAT : null);
                const r = fa && ta ? fa.currentPrice / ta.currentPrice : null;
                const isActive = fromSym === p.from && toSym === p.to;
                return (
                  <button key={`${p.from}-${p.to}`}
                    onClick={() => { setFromSym(p.from); setToSym(p.to); setFromAmt(""); }}
                    style={{
                      width: "100%", padding: "10px 14px",
                      background: isActive ? `rgba(37,99,255,0.1)` : colors.inputBg,
                      border: `1px solid ${isActive ? `rgba(37,99,255,0.3)` : colors.bord}`,
                      borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                    }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <AssetIcon symbol={p.from} size={20} />
                      <AssetIcon symbol={p.to} size={20} />
                    </div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{p.label}</div>
                      {r && <div style={{ fontSize: 11, color: colors.muted, fontFamily: "monospace" }}>1:{fmt(r, 4)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fee Info */}
          <div style={{ background: colors.card, border: `1px solid ${colors.bord}`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 12 }}>Conversion Details</div>
            {[
              { label: "Conversion Fee", value: "0.10%" },
              { label: "Processing Time", value: "Instant" },
              { label: "Min. Amount", value: "$10.00" },
              { label: "Daily Limit", value: "$250,000" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.bord}` }}>
                <span style={{ fontSize: 12, color: colors.muted }}>{item.label}</span>
                <span style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
