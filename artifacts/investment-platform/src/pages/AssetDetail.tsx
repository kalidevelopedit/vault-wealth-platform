import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetAssetDetail, useGetAssetChart, useCreateTransaction, useGetTransactions } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, ArrowLeft } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { toast } from "sonner";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const BLUE = "#2563FF";
const GREEN = "#16a34a";
const RED = "#dc2626";

export default function AssetDetail() {
  const [_, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol || "";

  const [period, setPeriod] = useState<"1d" | "1w" | "1m" | "1y" | "all">("1m");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: asset, isLoading } = useGetAssetDetail(symbol, { query: { enabled: !!symbol } });
  const { data: chart } = useGetAssetChart(symbol, { period }, { query: { enabled: !!symbol } });
  const { data: trades } = useGetTransactions({ limit: 10 }); // mock order book
  const createTx = useCreateTransaction();

  if (isLoading) return <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} /></div>;
  if (!asset) return <div style={{ minHeight: "100vh", background: BG, padding: 40, color: MUTED, textAlign: "center" }}>Asset not found</div>;

  const pos = asset.changePercent24h >= 0;
  const fmtP = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: p >= 1 ? 2 : 4, maximumFractionDigits: p >= 1 ? 2 : 6 });

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: side, symbol: asset.symbol, amount: amt } });
      toast.success(`${side === "buy" ? "Purchase" : "Sale"} executed`);
      setAmount("");
    } catch (e: any) {
      toast.error(e.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/assets/crypto" style={{ color: MUTED, textDecoration: "none", fontSize: 13 }}>Markets</Link>
        <span style={{ color: MUTED, fontSize: 13 }}>/</span>
        <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{asset.symbol}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <AssetIcon symbol={asset.symbol} size={48} borderRadius="50%" />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: "0 0 4px 0" }}>{asset.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: TEXT, fontFamily: "monospace", lineHeight: 1 }}>${fmtP(asset.currentPrice)}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>{pos ? "+" : ""}{asset.changePercent24h.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Chart & Info */}
        <div className="lg:col-span-3 space-y-6">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Chart</div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["1d","1w","1m","1y","all"] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{
                    background: period === p ? "#191F28" : "transparent", color: period === p ? TEXT : MUTED,
                    border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer"
                  }}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 400 }}>
              {chart?.data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={pos ? GREEN : RED} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={pos ? GREEN : RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={["auto","auto"]} orientation="right" tick={{ fontSize: 11, fill: MUTED }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, fontSize: 12, color: TEXT }} itemStyle={{ color: TEXT }} />
                    <Area type="monotone" dataKey="value" stroke={pos ? GREEN : RED} strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} /></div>}
            </div>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 16 }}>About {asset.symbol}</div>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>
              {asset.description || `Trade ${asset.name} on Vault Wealth. Enjoy deep liquidity, tight spreads, and institutional-grade execution.`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Market Cap", value: asset.marketCap ? `$${(asset.marketCap/1e9).toFixed(2)}B` : "—" },
                { label: "24h Volume", value: asset.volume24h ? `$${(asset.volume24h/1e6).toFixed(2)}M` : "—" },
                { label: "24h High", value: `$${fmtP(asset.high24h)}` },
                { label: "24h Low", value: `$${fmtP(asset.low24h)}` },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Trade & Order Book */}
        <div className="space-y-6">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <button onClick={() => setSide("buy")} style={{
                flex: 1, height: 40, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: side === "buy" ? "#191F28" : "transparent", color: side === "buy" ? GREEN : MUTED
              }}>Buy</button>
              <button onClick={() => setSide("sell")} style={{
                flex: 1, height: 40, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                background: side === "sell" ? "#191F28" : "transparent", color: side === "sell" ? RED : MUTED
              }}>Sell</button>
            </div>

            <form onSubmit={handleTrade}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>Order Type</div>
                <div style={{ height: 44, background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px", color: TEXT, fontSize: 13 }}>Market Order</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>Amount (USD)</span>
                  <span>Avail: $100,000.00</span>
                </div>
                <div style={{ height: 44, background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 16px" }}>
                  <span style={{ color: MUTED, marginRight: 8 }}>$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{
                    background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, width: "100%", fontFamily: "monospace"
                  }} />
                </div>
                {amount && <div style={{ fontSize: 11, color: MUTED, marginTop: 8, textAlign: "right", fontFamily: "monospace" }}>≈ {(Number(amount)/asset.currentPrice).toFixed(6)} {asset.symbol}</div>}
              </div>
              <button type="submit" disabled={submitting} style={{
                width: "100%", height: 48, borderRadius: 999, border: "none", cursor: submitting ? "not-allowed" : "pointer",
                background: side === "buy" ? GREEN : RED, color: "#fff", fontSize: 15, fontWeight: 600, opacity: submitting ? 0.7 : 1
              }}>
                {submitting ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
              </button>
            </form>
          </div>

          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 16, padding: "0 8px" }}>Recent Trades</div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px 8px", fontSize: 11, color: MUTED }}>
              <span>Price</span><span>Amount</span>
            </div>
            {trades?.transactions?.slice(0,8).map((t, i) => {
              const isBuy = t.type === "buy" || Math.random() > 0.5;
              const price = asset.currentPrice * (1 + (Math.random() * 0.002 - 0.001));
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", fontSize: 12, fontFamily: "monospace" }}>
                  <span style={{ color: isBuy ? GREEN : RED }}>${price.toFixed(2)}</span>
                  <span style={{ color: TEXT }}>{(Math.random() * 2).toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
