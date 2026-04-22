import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AssetIcon } from "@/components/AssetIcon";
import {
  useGetPortfolioSummary, useGetHoldings, useGetTransactions, useGetMarketSummary
} from "@workspace/api-client-react";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown, ArrowLeftRight, Zap, Loader2 } from "lucide-react";

const BG = "#050505";
const CARD = "#0C0F14";
const BORD = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.96)";
const MUTED = "rgba(255,255,255,0.45)";
const BLUE = "#2563FF";
const GREEN = "#16a34a";
const RED = "#dc2626";

const fmtUSD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const mask = (val: string, hide: boolean) => hide ? "******" : val;

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: ls } = useGetPortfolioSummary();
  const { data: holdings, isLoading: lh } = useGetHoldings();
  const { data: txData, isLoading: txl } = useGetTransactions({ limit: 5 });
  const { data: marketData, isLoading: lm } = useGetMarketSummary();

  const totalValue = summary?.totalAssets || 0;
  const hideBalance = false;

  const actions = [
    { label: "Deposit", icon: ArrowDownToLine, href: "/wallet" },
    { label: "Withdraw", icon: ArrowUpFromLine, href: "/wallet" },
    { label: "Buy", icon: TrendingUp, href: "/invest" },
    { label: "Sell", icon: TrendingDown, href: "/invest" },
    { label: "Convert", icon: ArrowLeftRight, href: "/invest" },
    { label: "Markets", icon: Zap, href: "/assets/crypto" },
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1440, margin: "0 auto", background: BG, minHeight: "100%" }}>
      
      {/* Balance Hero Panel */}
      <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, padding: "32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: 14, color: MUTED, marginBottom: 8, fontWeight: 500 }}>Portfolio Overview</div>
          {ls ? <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} /> : (
            <>
              <div style={{ fontSize: 48, fontWeight: 700, color: TEXT, fontFamily: "monospace", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 8 }}>
                ${mask(fmtUSD(totalValue), hideBalance)}
              </div>
              <div style={{ fontSize: 14, color: MUTED, fontFamily: "monospace" }}>
                ≈ {mask(fmtUSD(totalValue), hideBalance)} USD
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/wallet" style={{
            height: 44, padding: "0 24px", background: BLUE, color: "#fff",
            borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>Deposit</Link>
          <Link href="/wallet" style={{
            height: 44, padding: "0 24px", background: "transparent", color: TEXT, border: `1px solid ${BORD}`,
            borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>Withdraw</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 32, borderBottom: `1px solid ${BORD}`, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, borderBottom: `2px solid ${TEXT}`, paddingBottom: 12 }}>Crypto</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: MUTED, paddingBottom: 12 }}>Account</div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        {actions.map(a => (
          <Link key={a.label} href={a.href} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", height: 40,
            background: "#11141A", border: `1px solid ${BORD}`, borderRadius: 999,
            color: TEXT, fontSize: 13, fontWeight: 500, textDecoration: "none",
          }}>
            <a.icon style={{ width: 14, height: 14, color: MUTED }} strokeWidth={2} />
            {a.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Holdings List */}
        <div className="lg:col-span-2">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORD}`, fontSize: 16, fontWeight: 600, color: TEXT }}>
              Holdings
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                    {["Asset", "Quantity", "Value", "24h Change"].map((h, i) => (
                      <th key={h} style={{ padding: "16px 24px", textAlign: i === 0 ? "left" : "right", fontSize: 12, fontWeight: 500, color: MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lh ? (
                    <tr><td colSpan={4} style={{ padding: 40, textAlign: "center" }}><Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite", margin: "0 auto" }} /></td></tr>
                  ) : holdings?.length ? holdings.map((h) => {
                    const pos = h.gainLossPercentage >= 0;
                    return (
                      <tr key={h.symbol} style={{ borderBottom: `1px solid ${BORD}` }}>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <AssetIcon symbol={h.symbol} size={32} borderRadius="50%" />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{h.symbol}</div>
                              <div style={{ fontSize: 12, color: MUTED }}>{h.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>{h.quantity.toLocaleString()}</td>
                        <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>${fmtUSD(h.currentValue)}</td>
                        <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 14, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>
                          {pos ? "+" : ""}{h.gainLossPercentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: MUTED, fontSize: 14 }}>No holdings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions & Market Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Market Summary Strip */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, fontSize: 14, fontWeight: 600, color: TEXT }}>Trending</div>
            <div style={{ padding: "8px 20px" }}>
              {lm ? <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite", margin: "16px auto" }} /> : marketData?.trending?.slice(0,4).map(a => {
                const pos = a.changePercent24h >= 0;
                return (
                  <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${BORD}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{a.symbol}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: pos ? GREEN : RED, fontFamily: "monospace" }}>{pos ? "+" : ""}{a.changePercent24h.toFixed(2)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORD}`, fontSize: 14, fontWeight: 600, color: TEXT }}>Recent Activity</div>
            <div>
              {txl ? <Loader2 style={{ width: 16, height: 16, color: MUTED, animation: "spin 1s linear infinite", margin: "24px auto" }} /> : txData?.transactions?.map((tx, i, arr) => (
                <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, textTransform: "capitalize", marginBottom: 2 }}>{tx.type} {tx.symbol || ""}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, fontFamily: "monospace" }}>
                    {tx.type === "deposit" ? "+" : tx.type === "withdraw" ? "-" : ""}${fmtUSD(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
