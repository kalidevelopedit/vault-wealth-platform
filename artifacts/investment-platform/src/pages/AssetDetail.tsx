import { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, Link } from "wouter";
import {
  useGetAssetDetail, useCreateTransaction, useGetUserBalance,
  getGetUserBalanceQueryKey, getGetPortfolioSummaryQueryKey,
  getGetHoldingsQueryKey, getGetTransactionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const fmtPrice = (p: number) =>
  p >= 1
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const fmtQty = (n: number, decimals = 4) => n.toFixed(decimals);

function getTvSymbol(symbol: string, type: string): string {
  if (type === "stock") return symbol;
  if (type === "commodity") {
    const map: Record<string, string> = {
      GOLD: "COMEX:GC1!", SILVER: "COMEX:SI1!", PLATINUM: "COMEX:PL1!",
      OIL: "NYMEX:CL1!", GAS: "NYMEX:NG1!", WHEAT: "CBOT:ZW1!",
      CORN: "CBOT:ZC1!", COPPER: "COMEX:HG1!", NATGAS: "NYMEX:NG1!",
    };
    return map[symbol] || symbol;
  }
  if (symbol === "USDT" || symbol === "USDC" || symbol === "BUSD") return "BINANCE:USDTUSDT";
  return `BINANCE:${symbol}USDT`;
}

function TradingViewChart({ tvSymbol, theme }: { tvSymbol: string; theme: "dark" | "light" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`tv_${tvSymbol.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`);

  useEffect(() => {
    const id = idRef.current;
    let cancelled = false;

    function initWidget() {
      if (cancelled) return;
      const tv = (window as any).TradingView;
      if (!tv || !document.getElementById(id)) return;
      const el = document.getElementById(id);
      if (el) el.innerHTML = "";
      try {
        new tv.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: theme === "dark" ? "#0C0F14" : "#ffffff",
          enable_publishing: false,
          allow_symbol_change: false,
          withdateranges: true,
          hide_side_toolbar: false,
          container_id: id,
        });
      } catch (_) {}
    }

    if ((window as any).TradingView) {
      setTimeout(initWidget, 50);
    } else {
      const existing = document.getElementById("tv-script-main");
      if (!existing) {
        const s = document.createElement("script");
        s.id = "tv-script-main";
        s.src = "https://s3.tradingview.com/tv.js";
        s.async = true;
        s.onload = () => setTimeout(initWidget, 50);
        document.head.appendChild(s);
      } else {
        const poll = setInterval(() => {
          if ((window as any).TradingView) { clearInterval(poll); setTimeout(initWidget, 50); }
        }, 150);
        return () => { clearInterval(poll); cancelled = true; };
      }
    }

    return () => { cancelled = true; };
  }, [tvSymbol, theme]);

  return (
    <div
      id={idRef.current}
      ref={containerRef}
      style={{ height: "100%", width: "100%", minHeight: 480 }}
    />
  );
}

function OrderBook({ price, symbol, colors }: { price: number; symbol: string; colors: any }) {
  const [book, setBook] = useState<{ asks: any[]; bids: any[] }>({ asks: [], bids: [] });

  useEffect(() => {
    const gen = () => {
      const asks = Array.from({ length: 10 }, (_, i) => {
        const p = price * (1 + (i + 1) * 0.00018 + Math.random() * 0.00012);
        const q = parseFloat((Math.random() * 5 + 0.05).toFixed(4));
        return { price: p, qty: q, total: p * q };
      }).sort((a, b) => b.price - a.price);
      const bids = Array.from({ length: 10 }, (_, i) => {
        const p = price * (1 - (i + 1) * 0.00018 - Math.random() * 0.00012);
        const q = parseFloat((Math.random() * 5 + 0.05).toFixed(4));
        return { price: p, qty: q, total: p * q };
      }).sort((a, b) => b.price - a.price);
      setBook({ asks, bids });
    };
    gen();
    const iv = setInterval(gen, 2500);
    return () => clearInterval(iv);
  }, [price]);

  const maxTotal = Math.max(...[...book.asks, ...book.bids].map(r => r.total), 1);

  return (
    <div style={{ fontSize: 12, fontFamily: "monospace" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        padding: "0 0 6px", color: colors.muted, fontSize: 11, borderBottom: `1px solid ${colors.bord}`,
      }}>
        <span>Price (USD)</span>
        <span style={{ textAlign: "right" }}>Qty ({symbol})</span>
        <span style={{ textAlign: "right" }}>Total</span>
      </div>
      {book.asks.map((row, i) => (
        <div key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 0" }}>
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: `${(row.total / maxTotal) * 100}%`,
            background: "rgba(246,70,93,0.07)", pointerEvents: "none",
          }} />
          <span style={{ color: colors.red, position: "relative" }}>{fmtPrice(row.price)}</span>
          <span style={{ textAlign: "right", color: colors.text, position: "relative" }}>{fmtQty(row.qty)}</span>
          <span style={{ textAlign: "right", color: colors.muted, position: "relative" }}>{fmtPrice(row.total)}</span>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${colors.bord}`, borderBottom: `1px solid ${colors.bord}`, padding: "6px 0", textAlign: "center", margin: "4px 0" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.green, fontFamily: "monospace" }}>
          {fmtPrice(price)}
        </span>
        <span style={{ fontSize: 10, color: colors.muted, marginLeft: 8 }}>Mark</span>
      </div>
      {book.bids.map((row, i) => (
        <div key={i} style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "3px 0" }}>
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: `${(row.total / maxTotal) * 100}%`,
            background: "rgba(14,203,129,0.07)", pointerEvents: "none",
          }} />
          <span style={{ color: colors.green, position: "relative" }}>{fmtPrice(row.price)}</span>
          <span style={{ textAlign: "right", color: colors.text, position: "relative" }}>{fmtQty(row.qty)}</span>
          <span style={{ textAlign: "right", color: colors.muted, position: "relative" }}>{fmtPrice(row.total)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AssetDetail() {
  const [_, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol?.toUpperCase() || "";
  const { colors, mode } = useTheme();
  const { bg: BG, card: CARD, bord: BORD, text: TEXT, muted: MUTED, blue: BLUE, green: GREEN, red: RED, inputBg } = colors;
  const isMobile = useIsMobile(768);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [infoTab, setInfoTab] = useState<"about" | "stats">("stats");
  const queryClient = useQueryClient();

  const { data: asset, isLoading } = useGetAssetDetail(symbol, { query: { enabled: !!symbol, refetchInterval: 15_000 } });
  const { data: balance } = useGetUserBalance();
  const createTx = useCreateTransaction();

  const tvSymbol = useMemo(
    () => asset ? getTvSymbol(asset.symbol, asset.type || "crypto") : "",
    [asset?.symbol, asset?.type]
  );

  const availableCash = balance?.availableCash || 0;
  const amtNum = parseFloat(amount) || 0;
  const isInsufficientFunds = side === "buy" && amtNum > availableCash && amtNum > 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    if (!amtNum || amtNum <= 0) return toast.error("Enter a valid amount");
    if (side === "buy" && amtNum > availableCash) {
      return toast.error(`Insufficient funds — available: $${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
    }
    setSubmitting(true);
    try {
      await createTx.mutateAsync({ data: { type: side, symbol: asset.symbol, amount: amtNum } });
      toast.success(`${side === "buy" ? "Buy order placed" : "Sell order placed"} — ${asset.symbol}`);
      setAmount("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getGetUserBalanceQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetHoldingsQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() }),
      ]);
    } catch (e: any) {
      toast.error(e.message || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 28, height: 28, color: MUTED, animation: "spin 1s linear infinite" }} />
    </div>
  );
  if (!asset) return (
    <div style={{ minHeight: "100vh", background: BG, padding: 40, color: MUTED, textAlign: "center", paddingTop: 80 }}>
      Asset not found — <Link href="/markets" style={{ color: BLUE }}>Back to Markets</Link>
    </div>
  );

  const pos = asset.changePercent24h >= 0;

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Breadcrumb */}
      <div style={{ borderBottom: `1px solid ${BORD}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/markets" style={{ display: "flex", alignItems: "center", gap: 6, color: MUTED, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} strokeWidth={1.5} /> Markets
        </Link>
        <span style={{ color: BORD }}>›</span>
        <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{asset.name}</span>
        <span style={{ color: MUTED, fontSize: 13 }}>/ USD</span>
      </div>

      {/* Coin Header */}
      <div style={{
        borderBottom: `1px solid ${BORD}`, padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AssetIcon symbol={asset.symbol} size={36} borderRadius="50%" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{asset.name}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{asset.symbol}/USD</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: TEXT, fontFamily: "monospace", letterSpacing: "-0.5px" }}>
            ${fmtPrice(asset.currentPrice)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: pos ? GREEN : RED, display: "flex", alignItems: "center", gap: 4 }}>
            {pos ? <TrendingUp style={{ width: 13, height: 13 }} /> : <TrendingDown style={{ width: 13, height: 13 }} />}
            {pos ? "+" : ""}{asset.changePercent24h.toFixed(2)}%
          </span>
        </div>

        <div style={{ display: "flex", gap: 32, marginLeft: "auto", flexWrap: "wrap" }}>
          {[
            { label: "24h High", value: `$${fmtPrice(asset.high24h)}`, color: GREEN },
            { label: "24h Low",  value: `$${fmtPrice(asset.low24h)}`,  color: RED },
            { label: "24h Volume", value: asset.volume24h ? `$${(asset.volume24h / 1e6).toFixed(2)}M` : "—", color: TEXT },
            { label: "Market Cap", value: asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : "—", color: TEXT },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: stat.color, fontFamily: "monospace" }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: isMobile ? "auto" : "calc(100vh - 220px)", minHeight: isMobile ? 0 : 560 }}>
        {/* Chart Area */}
        <div style={{ flex: 1, minWidth: 0, borderRight: isMobile ? "none" : `1px solid ${BORD}`, borderBottom: isMobile ? `1px solid ${BORD}` : "none", display: "flex", flexDirection: "column", height: isMobile ? 320 : undefined }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            {tvSymbol ? (
              <TradingViewChart key={`${tvSymbol}-${mode}`} tvSymbol={tvSymbol} theme={mode} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 style={{ width: 24, height: 24, color: MUTED, animation: "spin 1s linear infinite" }} />
              </div>
            )}
          </div>

          {/* Info tabs */}
          <div style={{ borderTop: `1px solid ${BORD}` }}>
            <div style={{ display: "flex", padding: "0 24px", borderBottom: `1px solid ${BORD}` }}>
              {(["stats", "about"] as const).map(tab => (
                <button key={tab} onClick={() => setInfoTab(tab)} style={{
                  padding: "12px 0", marginRight: 24, fontSize: 13, fontWeight: 500,
                  color: infoTab === tab ? TEXT : MUTED, background: "none", border: "none",
                  cursor: "pointer", borderBottom: `2px solid ${infoTab === tab ? BLUE : "transparent"}`,
                  transition: "all 0.12s",
                }}>
                  {tab === "stats" ? "Statistics" : "About"}
                </button>
              ))}
            </div>
            <div style={{ padding: "16px 24px" }}>
              {infoTab === "stats" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px 32px" }}>
                  {[
                    { label: "Current Price", value: `$${fmtPrice(asset.currentPrice)}` },
                    { label: "24h Change",    value: `${pos ? "+" : ""}${asset.changePercent24h.toFixed(2)}%`, color: pos ? GREEN : RED },
                    { label: "24h High",      value: `$${fmtPrice(asset.high24h)}` },
                    { label: "24h Low",       value: `$${fmtPrice(asset.low24h)}` },
                    { label: "Market Cap",    value: asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : "—" },
                    { label: "24h Volume",    value: asset.volume24h ? `$${(asset.volume24h / 1e6).toFixed(1)}M` : "—" },
                    { label: "Symbol",        value: asset.symbol },
                    { label: "Type",          value: asset.type || "Crypto" },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: s.color || TEXT, fontFamily: "monospace" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, maxWidth: 680, margin: 0 }}>
                  {asset.description ||
                    `${asset.name} (${asset.symbol}) is traded on INT Brokers with institutional-grade execution, deep liquidity, and tight spreads. Access real-time pricing, advanced charting, and seamless order execution across all market conditions.`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Trade + Order Book */}
        <div style={{ width: isMobile ? "100%" : 320, flexShrink: 0, display: "flex", flexDirection: "column", overflowY: isMobile ? "visible" : "auto", background: CARD }}>
          {/* Buy / Sell Form */}
          <div style={{ padding: 16, borderBottom: `1px solid ${BORD}` }}>
            {/* Buy / Sell Toggle */}
            <div style={{ display: "flex", marginBottom: 16, background: inputBg, borderRadius: 10, padding: 3, gap: 3, border: `1px solid ${BORD}` }}>
              <button onClick={() => setSide("buy")} style={{
                flex: 1, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: "pointer", border: "none", transition: "all 0.15s",
                background: side === "buy" ? GREEN : "transparent",
                color: side === "buy" ? "#fff" : MUTED,
                boxShadow: side === "buy" ? "0 2px 8px rgba(14,203,129,0.3)" : "none",
              }}>Buy</button>
              <button onClick={() => setSide("sell")} style={{
                flex: 1, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: "pointer", border: "none", transition: "all 0.15s",
                background: side === "sell" ? RED : "transparent",
                color: side === "sell" ? "#fff" : MUTED,
                boxShadow: side === "sell" ? "0 2px 8px rgba(246,70,93,0.3)" : "none",
              }}>Sell</button>
            </div>

            <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Order Type</div>
            <div style={{ height: 38, background: inputBg, border: `1px solid ${BORD}`, borderRadius: 8, display: "flex", alignItems: "center", padding: "0 12px", color: TEXT, fontSize: 13, marginBottom: 14 }}>
              Market
            </div>

            <form onSubmit={handleTrade}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>Amount (USD)</span>
                  <span style={{ color: side === "buy" && amtNum > availableCash ? RED : MUTED }}>
                    Avail: ${availableCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div style={{
                  height: 44, background: inputBg,
                  border: `1px solid ${isInsufficientFunds ? RED : BORD}`,
                  borderRadius: 8, display: "flex", alignItems: "center", padding: "0 12px",
                }}>
                  <span style={{ color: MUTED, marginRight: 6, fontSize: 13 }}>$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    style={{
                      background: "transparent", border: "none", outline: "none",
                      color: TEXT, fontSize: 14, width: "100%", fontFamily: "monospace",
                    }}
                  />
                </div>
                {isInsufficientFunds && (
                  <div style={{ fontSize: 11, color: RED, marginTop: 4 }}>Insufficient balance</div>
                )}
                {amtNum > 0 && asset.currentPrice > 0 && (
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6, fontFamily: "monospace", textAlign: "right" }}>
                    ≈ {(amtNum / asset.currentPrice).toFixed(6)} {asset.symbol}
                  </div>
                )}
              </div>

              {/* Quick amounts */}
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} type="button"
                    onClick={() => setAmount(((availableCash * pct) / 100).toFixed(2))}
                    style={{
                      flex: 1, height: 28, fontSize: 11, borderRadius: 6,
                      background: inputBg, border: `1px solid ${BORD}`,
                      color: MUTED, cursor: "pointer", transition: "all 0.1s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = BLUE; }}
                    onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORD; }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || isInsufficientFunds || !amtNum}
                style={{
                  width: "100%", height: 44, borderRadius: 10, border: "none",
                  cursor: submitting || isInsufficientFunds || !amtNum ? "not-allowed" : "pointer",
                  background: side === "buy" ? GREEN : RED,
                  color: "#fff",
                  fontSize: 14, fontWeight: 700,
                  opacity: submitting || !amtNum ? 0.7 : 1,
                  transition: "all 0.15s",
                  boxShadow: !submitting && amtNum ? `0 4px 14px ${side === "buy" ? "rgba(14,203,129,0.35)" : "rgba(246,70,93,0.35)"}` : "none",
                }}
              >
                {submitting ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${asset.symbol}`}
              </button>
            </form>
          </div>

          {/* Order Book */}
          <div style={{ flex: 1, padding: "12px 16px", minHeight: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Order Book</div>
            <OrderBook price={asset.currentPrice} symbol={asset.symbol} colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
