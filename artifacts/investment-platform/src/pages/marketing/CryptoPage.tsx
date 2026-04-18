import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Check, ArrowUpRight, ChevronRight, Shield, Zap, TrendingUp, Lock } from "lucide-react";
import { AssetIcon } from "@/components/AssetIcon";

const DOT = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

const COINS = [
  { sym: "BTC",  name: "Bitcoin",  price: "$107,842", chg: "+2.41%", up: true,  market: "$2.1T",  desc: "The original digital gold. Store of value with limited supply." },
  { sym: "ETH",  name: "Ethereum", price: "$2,941",   chg: "+3.14%", up: true,  market: "$354B",  desc: "Smart contract platform powering DeFi and Web3 applications." },
  { sym: "SOL",  name: "Solana",   price: "$164.20",  chg: "+5.82%", up: true,  market: "$75B",   desc: "High-speed blockchain with low fees and growing ecosystem." },
  { sym: "BNB",  name: "BNB",      price: "$612.40",  chg: "+1.23%", up: true,  market: "$88B",   desc: "Binance Smart Chain's native token with DeFi utility." },
  { sym: "XRP",  name: "XRP",      price: "$2.14",    chg: "-0.82%", up: false, market: "$123B",  desc: "Fast, low-cost international payment network." },
  { sym: "ADA",  name: "Cardano",  price: "$0.83",    chg: "+2.10%", up: true,  market: "$29B",   desc: "Peer-reviewed, proof-of-stake blockchain platform." },
  { sym: "AVAX", name: "Avalanche",price: "$38.90",   chg: "+4.15%", up: true,  market: "$16B",   desc: "Blazing-fast, low-cost smart contracts platform." },
  { sym: "DOT",  name: "Polkadot", price: "$8.42",    chg: "+1.78%", up: true,  market: "$12B",   desc: "Multi-chain interoperability with shared security." },
  { sym: "LINK", name: "Chainlink",price: "$18.60",   chg: "+3.02%", up: true,  market: "$11B",   desc: "Decentralized oracle network powering smart contracts." },
  { sym: "UNI",  name: "Uniswap",  price: "$12.44",   chg: "+2.45%", up: true,  market: "$9.3B",  desc: "The leading decentralized trading protocol on Ethereum." },
  { sym: "ATOM", name: "Cosmos",   price: "$9.18",    chg: "+1.93%", up: true,  market: "$3.5B",  desc: "Internet of blockchains with cross-chain IBC protocol." },
  { sym: "MATIC",name: "Polygon",  price: "$0.74",    chg: "+3.88%", up: true,  market: "$7.2B",  desc: "Ethereum scaling with fast, near-free transactions." },
];

const WHY_VAULT_CRYPTO = [
  { icon: Shield, color: "#fbbf24", title: "Institutional Custody", desc: "95% of crypto held in cold storage with multi-sig wallets. Insured against exchange hacks and theft." },
  { icon: Zap, color: "#60a5fa", title: "24/7 Trading", desc: "Crypto never sleeps. Trade Bitcoin, Ethereum and 60+ coins any time — weekends and holidays included." },
  { icon: TrendingUp, color: "#4ade80", title: "Staking Rewards", desc: "Earn up to 8% APY staking Ethereum and Solana directly from your Vault account. No technical knowledge needed." },
  { icon: Lock, color: "#f87171", title: "No Wallet Needed", desc: "We handle custody, security and private keys. You just trade and earn — we handle the complexity." },
];

export default function CryptoPage() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <HomeNavbar />

      {/* Hero */}
      <section style={{ background: "#080a0f", padding: "96px 24px 80px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse,rgba(245,158,11,0.08) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 12 }}>Cryptocurrency</p>
          <h1 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24 }}>
            Institutional Crypto.<br />
            <span style={{ background: "linear-gradient(90deg,#f59e0b,#fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simple for Everyone.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 36px" }}>
            Trade 60+ cryptocurrencies with the security and infrastructure of a Wall Street institution. No wallet, no seed phrases — just buy, sell, and earn.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            {[{ v: "60+", l: "Cryptocurrencies" }, { v: "0.15%", l: "Max Spread" }, { v: "8% APY", l: "Staking Yield" }, { v: "24/7", l: "Trading" }].map(s => (
              <div key={s.v} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 40px", borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0F172A", fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(245,158,11,0.35)" }}>
            Start Trading Crypto <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {/* Live Coins Table */}
      <section style={{ background: "#F5F6F7", padding: "80px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Available Cryptocurrencies</p>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em" }}>Trade 60+ Digital Assets</h2>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E6E8EB", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            {COINS.map((c, i) => (
              <div key={c.sym} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 24px", borderBottom: i < COINS.length - 1 ? "1px solid #E6E8EB" : "none", flexWrap: "wrap" }}>
                <AssetIcon symbol={c.sym} size={44} borderRadius={12} />
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{c.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>{c.price}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.up ? "#2b6b4e" : "#943636", marginTop: 1 }}>{c.chg}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>Market Cap</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{c.market}</div>
                </div>
                <Link href="/register" style={{ padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0F172A", fontWeight: 700, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>
                  Trade
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 16 }}>+ 48 more cryptocurrencies available on the platform</p>
        </div>
      </section>

      {/* Why Vault for Crypto */}
      <section style={{ background: "#080a0f", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#f59e0b", marginBottom: 10 }}>Why Vault for Crypto</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>Institutional Security. Retail Simplicity.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {WHY_VAULT_CRYPTO.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 26px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, backdropFilter: "blur(8px)" }}>
                  <Icon size={22} color={color} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Included benefits */}
          <div style={{ marginTop: 40, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 20, padding: "32px 36px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", marginBottom: 20 }}>Everything included with crypto trading:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {["No wallet or seed phrases needed", "Tax-loss harvesting for crypto", "Crypto staking up to 8% APY", "Portfolio crypto allocation tracking", "Instant buy/sell at market price", "Crypto + stocks in one account", "Crypto tax reporting included", "24/7 trading, no downtime"].map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Check size={13} color="#f59e0b" strokeWidth={2.5} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg,#0f2d52,#0a1e3a,#0f1320)", padding: "72px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: DOT }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>Start Trading Crypto Today</h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>No wallet needed. No minimums. Buy your first Bitcoin in under 2 minutes.</p>
          <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 44px", borderRadius: 12, background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0F172A", fontWeight: 800, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(245,158,11,0.35)" }}>
            Buy Your First Crypto <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
