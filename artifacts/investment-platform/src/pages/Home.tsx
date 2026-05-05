import { useState, useEffect, useRef, useCallback } from "react";
import { HomeNavbar } from "@/components/layout/HomeNavbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import {
  Check, ChevronRight, ChevronLeft, Info,
  User, Users, Landmark, Briefcase, Building2,
  DollarSign, Globe2, Zap, ShieldCheck,
  TrendingUp, ArrowUpRight, Star, Shield, Lock, Clock,
  Bitcoin, BarChart3, Wheat, Calculator, PiggyBank, Target
} from "lucide-react";

/* ─── CSS ──────────────────────────────────────────────────────────────── */
const css = `
  @keyframes fadeInUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes pulse-dot{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.85)} }
  @keyframes slide-in-right { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slide-in-left  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }

  .hero-1{animation:fadeInUp .7s ease both}
  .hero-2{animation:fadeInUp .7s .13s ease both}
  .hero-3{animation:fadeInUp .7s .26s ease both}
  .hero-4{animation:fadeInUp .7s .36s ease both}
  .hero-mockup{animation:fadeIn 1.2s .4s ease both}
  .ticker-track{display:flex;width:max-content;animation:ticker 32s linear infinite}
  .float-chip{animation:float 5s ease-in-out infinite}
  .float-chip2{animation:float 6s 1s ease-in-out infinite}
  .float-chip3{animation:float 4.5s 2s ease-in-out infinite}
  .pulse-dot{animation:pulse-dot 2s ease-in-out infinite}
  .slide-r{animation:slide-in-right .45s ease both}
  .slide-l{animation:slide-in-left .45s ease both}

  .stat-chip:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.45)!important}
  .feat-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.13)!important}
  .rate-card:hover{transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,0,0,.5)!important}
  .acct-card:hover{border-color:#0d1520!important;background:#f9fafb!important}
  .award-card:hover{border-color:#0d1520!important;background:#f5f6f7!important}
  .step-card:hover{background:#fff!important;box-shadow:0 4px 20px rgba(0,0,0,.06)!important}
  .inv-tab:hover{border-color:rgba(255,255,255,0.25)!important;color:rgba(255,255,255,0.85)!important}
  .testi-card{transition:opacity .4s ease,transform .4s ease}

  .calc-slider{-webkit-appearance:none;appearance:none;width:100%;height:4px;outline:none;background:rgba(255,255,255,0.12);border-radius:999px;cursor:pointer}
  .calc-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer;transition:transform .12s}
  .calc-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}
  .calc-slider::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:none;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer}
  .calc-output{transition:all 0.3s ease}
  @keyframes countUp{from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)}}
  .val-animate{animation:countUp 0.3s ease both}

  /* ── Mobile ── */
  @media (max-width: 768px) {
    /* Hero */
    .hero-float-chip { display: none !important; }
    .hero-mockup { display: none !important; }
    .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
    .hero-icon-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; max-width: 100% !important; }
    .hero-stats-row { display: grid !important; grid-template-columns: 1fr 1fr !important; padding: 4px 8px !important; gap: 0 !important; }
    .hero-stats-row > div { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding: 12px 8px !important; }
    .hero-stats-row > div:nth-child(1),.hero-stats-row > div:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
    .hero-stats-row > div:nth-child(3),.hero-stats-row > div:nth-child(4) { border-bottom: none !important; }
    .hero-stats-row > div:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.08) !important; }
    .hero-cta-row { flex-direction: column !important; gap: 10px !important; }
    .hero-cta-row a,.hero-cta-row > a { width: 100% !important; justify-content: center !important; box-sizing: border-box !important; }

    /* Floating badges & chips — prevent horizontal overflow */
    .float-chip,.float-chip2,.float-chip3 { display: none !important; }
    .ret-badge { display: none !important; }

    /* Layout grids */
    .section-two-col { grid-template-columns: 1fr !important; gap: 24px !important; }
    .section-two-col-img { display: none !important; }
    .rate-cards-grid { grid-template-columns: 1fr !important; }
    .calc-grid { grid-template-columns: 1fr !important; }
    .feat-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .steps-grid { grid-template-columns: 1fr !important; }

    /* Investment category panel */
    .inv-panel { grid-template-columns: 1fr !important; }
    .inv-panel-img { min-height: 200px !important; }
    .inv-panel-content { padding: 28px 24px !important; }

    /* Tabs, awards, account types */
    .inv-tabs { overflow-x: auto !important; padding-bottom: 4px !important; }
    .inv-tabs::-webkit-scrollbar { display: none; }
    .awards-row { gap: 10px !important; }
    .awards-row > div { min-width: 130px !important; padding: 20px 14px !important; }
    .acct-types-row { gap: 10px !important; }
    .acct-types-row > a { width: calc(50% - 5px) !important; padding: 18px 10px !important; }

    /* Trust badges */
    .trust-badges { gap: 10px !important; }
    .trust-badges > div { padding: 10px 14px !important; }

    /* Testimonials */
    .testi-track { gap: 16px !important; }
    .testi-card { min-width: 280px !important; max-width: 300px !important; padding: 24px 20px !important; }

    /* Rate cards */
    .rate-card { padding: 28px 24px 24px !important; }
    .rate-card .rate-num { font-size: 52px !important; }

    /* Section spacing */
    .section-pad { padding: 56px 0 !important; }
    .hero-badge { font-size: 11px !important; }

    /* Retirement section */
    .ret-section-img { border-radius: 16px !important; }

    /* Pricing split section image */
    .pricing-img { display: none !important; }

    /* Step card row */
    .steps-grid > div { padding: 20px 16px !important; }

    /* Feat cards on mobile: ensure no overflow */
    .feat-card { padding: 24px 20px 20px !important; }

    /* Account feature cards */
    .acct-types-row > a { min-width: 0 !important; }
  }
`;

const DOT  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;
const DOTL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

/* ─── Data ──────────────────────────────────────────────────────────────── */
const HERO_ASSETS = [
  { sym:"BTC",  name:"Bitcoin",  price:"$107,842", chg:"+2.41%", up:true,  col:"#f59e0b", data:[72,68,75,74,82,79,88,85,92,90,98,102,99,107,105] },
  { sym:"ETH",  name:"Ethereum", price:"$3,880",   chg:"+1.87%", up:true,  col:"#818cf8", data:[58,61,57,65,63,70,68,76,74,79,77,83,81,87,85] },
  { sym:"AAPL", name:"Apple",    price:"$213.40",  chg:"+0.94%", up:true,  col:"#60a5fa", data:[82,81,85,84,87,85,89,88,87,91,90,92,91,94,93] },
  { sym:"NVDA", name:"Nvidia",   price:"$891.20",  chg:"+4.22%", up:true,  col:"#34d399", data:[48,54,51,60,58,66,64,72,70,78,76,84,81,90,88] },
  { sym:"XAU",  name:"Gold",     price:"$3,324.5", chg:"+0.61%", up:true,  col:"#fbbf24", data:[74,76,75,78,77,80,79,82,81,83,82,85,84,86,85] },
  { sym:"SOL",  name:"Solana",   price:"$184.30",  chg:"-0.62%", up:false, col:"#a78bfa", data:[88,83,87,81,85,79,83,77,81,76,79,74,77,72,75] },
];

const TICKERS = [
  {sym:"BTC/USD",price:"107,842",chg:"+2.41%",up:true},
  {sym:"AAPL",price:"211.84",chg:"+1.24%",up:true},
  {sym:"SPY",price:"589.12",chg:"+0.83%",up:true},
  {sym:"TSLA",price:"347.28",chg:"-1.02%",up:false},
  {sym:"GC=F",price:"3,324.5",chg:"+0.61%",up:true},
  {sym:"EUR/USD",price:"1.0874",chg:"-0.18%",up:false},
  {sym:"ETH/USD",price:"2,941",chg:"+3.14%",up:true},
  {sym:"NVDA",price:"138.42",chg:"+4.57%",up:true},
  {sym:"CL=F",price:"71.63",chg:"-0.44%",up:false},
  {sym:"QQQ",price:"512.04",chg:"+1.06%",up:true},
];

const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    age: 64,
    title: "Retired Teacher, Ohio",
    image: "/testimonial-sarah.png",
    stars: 5,
    quote: "I was nervous about investing my retirement savings online, but Vault Wealth made it incredibly simple. Their advisors walked me through everything step by step. My portfolio has grown 18% in the past year and I finally feel financially secure for my golden years.",
    tag: "Retirement Investor",
  },
  {
    name: "Robert Chen",
    age: 71,
    title: "Former Engineer, California",
    image: "/testimonial-robert.png",
    stars: 5,
    quote: "At 71, I needed a platform I could trust with decades of savings. Vault Wealth's security, transparent fees, and access to global markets — including crypto — is exactly what I needed. I've diversified into Bitcoin and gold ETFs and couldn't be happier.",
    tag: "Senior Investor",
  },
  {
    name: "James Patterson",
    age: 52,
    title: "Business Owner, Texas",
    image: "/testimonial-james.png",
    stars: 5,
    quote: "The institutional-grade tools at a fraction of the cost. I moved $800K from a traditional broker and immediately saved thousands in fees. The crypto and commodities access is unparalleled. Best investment decision I ever made was switching to Vault.",
    tag: "Active Trader",
  },
];

const INV_CATEGORIES = [
  {
    id: "stocks",
    icon: BarChart3,
    label: "Stocks & ETFs",
    color: "rgba(255,255,255,0.7)",
    bg: "linear-gradient(135deg,#1e3a5f,#0f2040)",
    image: "/market-charts.jpg",
    headline: "Access 170+ Global Stock Markets",
    sub: "Trade equities across the NYSE, NASDAQ, LSE, TSX, ASX and more from a single account with commission-free pricing.",
    stats: [{v:"$0",l:"Min. Commission"},{v:"170+",l:"Markets"},{v:"4.4M+",l:"Investors"}],
    bullets: ["Zero-commission US stock trading","Pre-market & after-hours trading 24/7","Fractional shares from $1","Access to IPOs and new listings","Advanced charting and screening tools"],
  },
  {
    id: "crypto",
    icon: Bitcoin,
    label: "Cryptocurrency",
    color: "rgba(255,255,255,0.7)",
    bg: "linear-gradient(135deg,#1c1a12,#0f0e08)",
    image: "/crypto-investment.jpg",
    headline: "Invest in Bitcoin, Ethereum & 60+ Coins",
    sub: "Trade crypto 24/7 with institutional-grade security, cold storage protection, and competitive spreads. No wallet required.",
    stats: [{v:"60+",l:"Cryptocurrencies"},{v:"24/7",l:"Trading"},{v:"0.15%",l:"Max Spread"}],
    bullets: ["Bitcoin, Ethereum, Solana and more","24/7 crypto trading, no downtime","Cold storage custody — your keys secured","Crypto staking rewards up to 8% APY","Spot and perpetual futures trading"],
  },
  {
    id: "retirement",
    icon: Landmark,
    label: "Retirement",
    color: "rgba(255,255,255,0.7)",
    bg: "linear-gradient(135deg,#0a1e18,#040f0c)",
    image: "/senior-retirement.jpg",
    headline: "Secure Your Future With Smart Retirement Planning",
    sub: "IRA, Roth IRA, SEP-IRA and pension accounts with tax-advantaged growth, personalized allocation, and expert guidance for seniors.",
    stats: [{v:"$0",l:"Account Minimum"},{v:"3.14%",l:"Cash Yield"},{v:"Tax-Free",l:"Roth Growth"}],
    bullets: ["Traditional & Roth IRA accounts","Automatic rebalancing & diversification","Target-date retirement funds","Social Security optimization tools","Dedicated senior investor support line"],
  },
  {
    id: "commodities",
    icon: Wheat,
    label: "Commodities",
    color: "rgba(255,255,255,0.7)",
    bg: "linear-gradient(135deg,#1a1510,#100d08)",
    image: "/city-skyline.jpg",
    headline: "Gold, Oil, Silver & Agricultural Markets",
    sub: "Hedge inflation and diversify with real assets. Trade gold, crude oil, natural gas, silver and agricultural futures with low margin rates.",
    stats: [{v:"50+",l:"Commodities"},{v:"4.14%",l:"Margin Rate"},{v:"24/5",l:"Trading Hours"}],
    bullets: ["Gold and silver spot & futures","Crude oil and natural gas","Agricultural futures — corn, wheat, soy","Low margin rates from 4.14%","Real-time commodity data & analysis"],
  },
];

/* ─── Hero Sparkline ────────────────────────────────────────────────────── */
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const W = 80, H = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pad = H * 0.1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`;
  const color = up ? "#4ade80" : "#f87171";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`hsg-${up ? "u" : "d"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#hsg-${up ? "u" : "d"})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Hero Terminal Widget ───────────────────────────────────────────────── */
function HeroTerminal() {
  return (
    <div className="hero-1" style={{
      background: "rgba(255,255,255,0.025)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 24,
      overflow: "hidden",
      backdropFilter: "blur(24px)",
      boxShadow: "0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>Market Overview</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Live</span>
        </div>
      </div>
      {/* Asset rows */}
      {HERO_ASSETS.map((asset, i) => (
        <div key={asset.sym} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "11px 20px",
          borderBottom: i < HERO_ASSETS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `${asset.col}18`,
            border: `1px solid ${asset.col}30`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: asset.col, letterSpacing: "0em" }}>{asset.sym}</span>
          </div>
          <div style={{ flex: "0 0 68px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.78)", lineHeight: 1 }}>{asset.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{asset.sym}/USD</div>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Sparkline data={asset.data} up={asset.up} />
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{asset.price}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: asset.up ? "#4ade80" : "#f87171", marginTop: 2 }}>{asset.chg}</div>
          </div>
        </div>
      ))}
      {/* Bottom bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { label: "Portfolio Value", val: "$64,243.80", color: "rgba(255,255,255,0.78)" },
          { label: "Today's P&L", val: "+$1,842.40", color: "#4ade80" },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "13px 20px", borderRight: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none", background: "rgba(255,255,255,0.015)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── StarRating ────────────────────────────────────────────────────────── */
function StarRating({ n }: { n: number }) {
  return (
    <div style={{display:"flex",gap:3}}>
      {Array.from({length:n}).map((_,i)=>(
        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
      ))}
    </div>
  );
}

/* ─── Testimonial Carousel ──────────────────────────────────────────────── */
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"r"|"l">("r");
  const [key, setKey] = useState(0);

  const go = (next: number, d: "r"|"l") => {
    setDir(d);
    setIdx((next + TESTIMONIALS.length) % TESTIMONIALS.length);
    setKey(k => k + 1);
  };

  useEffect(() => {
    const t = setInterval(() => go(idx + 1, "r"), 6000);
    return () => clearInterval(t);
  }, [idx]);

  const t = TESTIMONIALS[idx];

  return (
    <div style={{position:"relative",maxWidth:860,margin:"0 auto"}}>
      <div key={key} className={dir === "r" ? "slide-r" : "slide-l"}
        style={{background:"#fff",borderRadius:24,padding:"48px 52px",border:"1px solid #E6E8EB",boxShadow:"0 8px 40px rgba(0,0,0,0.06)",position:"relative",overflow:"hidden"}}>

        {/* Quote mark */}
        <div style={{position:"absolute",top:24,right:36,fontSize:120,color:"rgba(0,0,0,0.04)",fontWeight:900,lineHeight:1,fontFamily:"Georgia,serif",pointerEvents:"none"}}>"</div>

        <div style={{display:"flex",gap:32,alignItems:"flex-start",flexWrap:"wrap"}}>
          {/* Avatar */}
          <div style={{flexShrink:0}}>
            <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",border:"3px solid #E6E8EB",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
              <img src={t.image} alt={t.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
            </div>
          </div>

          {/* Content */}
          <div style={{flex:1,minWidth:280}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <StarRating n={t.stars} />
              <span style={{fontSize:11,fontWeight:600,background:"rgba(13,21,32,0.06)",color:"#374151",padding:"2px 10px",borderRadius:999,border:"1px solid rgba(13,21,32,0.10)"}}>{t.tag}</span>
            </div>

            <p style={{fontSize:16,color:"#374151",lineHeight:1.8,fontStyle:"italic",marginBottom:20}}>
              "{t.quote}"
            </p>

            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#0F172A"}}>{t.name}, <span style={{fontWeight:500,color:"#6B7280"}}>age {t.age}</span></div>
              <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{t.title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:24}}>
        <button onClick={() => go(idx-1,"l")} style={{width:40,height:40,borderRadius:"50%",border:"1px solid #E6E8EB",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"border-color .15s"}}
          onMouseEnter={e=>(e.currentTarget.style.borderColor="#0d1520")} onMouseLeave={e=>(e.currentTarget.style.borderColor="#E6E8EB")}>
          <ChevronLeft size={18} color="#374151" />
        </button>
        <div style={{display:"flex",gap:8}}>
          {TESTIMONIALS.map((_,i)=>(
            <button key={i} onClick={() => go(i, i > idx ? "r" : "l")} style={{width:i===idx?24:8,height:8,borderRadius:999,background:i===idx?"#0d1520":"#E6E8EB",border:"none",cursor:"pointer",transition:"width .3s,background .3s",padding:0}} />
          ))}
        </div>
        <button onClick={() => go(idx+1,"r")} style={{width:40,height:40,borderRadius:"50%",border:"1px solid #E6E8EB",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"border-color .15s"}}
          onMouseEnter={e=>(e.currentTarget.style.borderColor="#0d1520")} onMouseLeave={e=>(e.currentTarget.style.borderColor="#E6E8EB")}>
          <ChevronRight size={18} color="#374151" />
        </button>
      </div>
    </div>
  );
}

/* ─── Investment Category Panel ─────────────────────────────────────────── */
function InvestmentCategories() {
  const [active, setActive] = useState(0);
  const cat = INV_CATEGORIES[active];

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % INV_CATEGORIES.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{background:"#080a0f",padding:"96px 0",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
      <div style={{position:"absolute",top:-100,left:"30%",width:600,height:400,background:"radial-gradient(ellipse,rgba(255,255,255,0.02) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />

      <div style={{position:"relative",zIndex:1,maxWidth:1160,margin:"0 auto",padding:"0 24px"}}>
        {/* Heading */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>What You Can Trade</p>
          <h2 style={{fontSize:"clamp(28px,4vw,44px)",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",lineHeight:1.1,margin:0}}>
            Every Asset Class. One Platform.
          </h2>
          <p style={{color:"rgba(255,255,255,0.3)",fontSize:15,marginTop:12}}>Diversify across stocks, crypto, retirement accounts and commodities</p>
        </div>

        {/* Tab strip */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:36,flexWrap:"wrap"}}>
          {INV_CATEGORIES.map((c,i)=>{
            const Icon = c.icon;
            const isActive = i === active;
            return (
              <button key={c.id} onClick={()=>setActive(i)} className="inv-tab"
                style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px",borderRadius:12,border:`1px solid ${isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,background:isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",color:isActive ? "#fff" : "rgba(255,255,255,0.45)",fontWeight:600,fontSize:13,cursor:"pointer",transition:"all .2s"}}>
                <Icon size={16} color={isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)"} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div key={active} className="slide-r inv-panel" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,borderRadius:24,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
          {/* Image */}
          <div className="inv-panel-img" style={{position:"relative",minHeight:380,overflow:"hidden"}}>
            <img src={cat.image} alt={cat.label} style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}} />
            <div style={{position:"absolute",inset:0,background:`linear-gradient(to right, rgba(8,10,15,0.2), rgba(8,10,15,0.7))`}} />
            <div style={{position:"absolute",inset:0,background:cat.bg,opacity:0.55}} />
            {/* Stats overlay */}
            <div style={{position:"absolute",bottom:24,left:24,display:"flex",gap:12}}>
              {cat.stats.map(s=>(
                <div key={s.l} style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 16px",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{s.v}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="inv-panel-content" style={{background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",padding:"44px 44px",backdropFilter:"blur(4px)"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:16,background:"rgba(255,255,255,0.07)",borderRadius:8,padding:"4px 12px",border:"1px solid rgba(255,255,255,0.12)"}}>
              {<cat.icon size={14} color="rgba(255,255,255,0.7)" />}
              <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.12em"}}>{cat.label}</span>
            </div>
            <h3 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:900,color:"#fff",letterSpacing:"-0.025em",lineHeight:1.2,marginBottom:14}}>{cat.headline}</h3>
            <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",lineHeight:1.8,marginBottom:28}}>{cat.sub}</p>
            <ul style={{listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:12}}>
              {cat.bullets.map((b,i)=>(
                <li key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Check size={15} color="rgba(255,255,255,0.4)" strokeWidth={2} style={{flexShrink:0,marginTop:2}} />
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>{b}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",borderRadius:12,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none",transition:"background .15s"}}>
              Start Investing <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Retirement Section ────────────────────────────────────────────────── */
function RetirementSection() {
  return (
    <section style={{background:"#fff",padding:"96px 0",borderTop:"1px solid #E6E8EB"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
        <div className="section-two-col" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:72,alignItems:"center"}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:12}}>For Retirees & Seniors</p>
            <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:900,color:"#0F172A",letterSpacing:"-0.03em",marginBottom:20,lineHeight:1.1}}>
              Your Retirement Deserves More Than a Savings Account
            </h2>
            <p style={{fontSize:15,color:"#6B7280",lineHeight:1.8,marginBottom:28}}>
              Millions of retirees are losing purchasing power to inflation while their money sits in low-yield savings accounts. Vault Wealth gives seniors access to the same institutional investment tools that banks and hedge funds use — with no minimums, no jargon, and full-time support.
            </p>
            <p style={{fontSize:15,color:"#6B7280",lineHeight:1.8,marginBottom:36}}>
              Whether you're 55 or 80, it's never too late to put your money to work smarter. Our retirement specialists help you balance income, growth, and security.
            </p>

            {/* Feature list */}
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:36}}>
              {[
                {icon:Shield,title:"SIPC & FDIC Protected",desc:"Up to $500K SIPC protection. Cash balances FDIC insured up to $2.5M through bank sweeps."},
                {icon:Lock,title:"Senior Fraud Protection",desc:"Two-factor authentication, withdrawal whitelisting, and 24/7 fraud monitoring purpose-built for seniors."},
                {icon:Clock,title:"Dedicated Senior Support",desc:"Speak to a real person, Monday to Friday. Our senior specialists understand your unique needs."},
                {icon:TrendingUp,title:"Inflation-Beating Returns",desc:"Earn up to 3.14% on cash, plus exposure to dividend stocks, REITs and Treasury bonds."},
              ].map(({icon:Icon,title,desc},i)=>(
                <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",padding:"16px 20px",borderRadius:14,background:"linear-gradient(135deg,#080a0f,#0f1320)",border:"1px solid rgba(255,255,255,0.07)",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"rgba(255,255,255,0.05)"}} />
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,backdropFilter:"blur(8px)"}}>
                    <Icon size={18} color="rgba(255,255,255,0.75)" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:3}}>{title}</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.6}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <Link href="/register" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 32px",borderRadius:12,background:"#0d1520",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none",boxShadow:"0 4px 16px rgba(13,21,32,0.2)"}}>
                Open Retirement Account
              </Link>
              <a href="#" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 24px",borderRadius:12,border:"1px solid #E6E8EB",color:"#374151",fontWeight:600,fontSize:14,textDecoration:"none"}}>
                Speak to an Advisor <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* Image */}
          <div style={{position:"relative"}}>
            <div style={{borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.12)",border:"1px solid #E6E8EB"}}>
              <img src="/senior-couple.jpg" alt="Senior couple reviewing investments" style={{width:"100%",height:"420px",objectFit:"cover",display:"block"}} />
            </div>
            {/* floating badge */}
            <div className="ret-badge" style={{position:"absolute",top:24,right:-20,background:"#fff",borderRadius:16,padding:"16px 20px",boxShadow:"0 12px 40px rgba(0,0,0,0.12)",border:"1px solid #E6E8EB",minWidth:180}}>
              <div style={{fontSize:10,color:"#9CA3AF",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Average Client Return</div>
              <div style={{fontSize:28,fontWeight:900,color:"#0F172A",letterSpacing:"-0.025em"}}>+14.7%</div>
              <div style={{fontSize:12,color:"#2b6b4e",fontWeight:700,marginTop:2}}>↑ Per year (5yr avg)</div>
            </div>
            {/* second floating badge */}
            <div className="ret-badge" style={{position:"absolute",bottom:24,left:-20,background:"#0F172A",borderRadius:16,padding:"16px 20px",boxShadow:"0 12px 40px rgba(0,0,0,0.2)",minWidth:200}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Cash Yield</div>
              <div style={{fontSize:24,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>3.14% APY</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>Instantly available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Crypto Section ────────────────────────────────────────────────────── */
function CryptoSection() {
  return (
    <section style={{background:"#080a0f",padding:"96px 0",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
      <div style={{position:"absolute",top:-80,right:-80,width:500,height:500,background:"radial-gradient(ellipse,rgba(255,255,255,0.03) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />
      <div style={{position:"absolute",bottom:-80,left:-80,width:400,height:400,background:"radial-gradient(ellipse,rgba(255,255,255,0.02) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />

      <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
        <div className="section-two-col" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:72,alignItems:"center"}}>
          {/* Image */}
          <div className="section-two-col-img" style={{position:"relative"}}>
            <div style={{borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <img src="/crypto-investment.jpg" alt="Cryptocurrency investing" style={{width:"100%",height:"400px",objectFit:"cover",display:"block"}} />
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(8,10,15,0.6),transparent)"}} />
            </div>
            {/* Floating crypto price cards */}
            <div className="float-chip" style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.7)"}}>₿</div>
                <div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Bitcoin</div>
                  <div style={{fontSize:16,color:"#fff",fontWeight:800}}>$107,842</div>
                </div>
                <div style={{fontSize:13,color:"#4ade80",fontWeight:700,marginLeft:8}}>+2.41%</div>
              </div>
            </div>
            <div className="float-chip2" style={{position:"absolute",bottom:36,right:20,background:"rgba(255,255,255,0.05)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:14,padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.7)"}}>Ξ</div>
                <div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Ethereum</div>
                  <div style={{fontSize:16,color:"#fff",fontWeight:800}}>$2,941</div>
                </div>
                <div style={{fontSize:13,color:"#4ade80",fontWeight:700,marginLeft:8}}>+3.14%</div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:12}}>Cryptocurrency</p>
            <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",marginBottom:20,lineHeight:1.1}}>
              Crypto Investing Made Simple & Secure
            </h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,0.45)",lineHeight:1.8,marginBottom:28}}>
              Trade Bitcoin, Ethereum, Solana and 60+ cryptocurrencies with institutional-grade custody. Cold storage, multi-sig wallets, and insurance coverage mean your digital assets are safe even if markets are volatile.
            </p>

            {/* Stat row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
              {[
                {v:"60+",l:"Cryptos"},
                {v:"0.15%",l:"Max Spread"},
                {v:"8% APY",l:"Staking Yield"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"16px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>{s.v}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4}}>{s.l}</div>
                </div>
              ))}
            </div>

            <ul style={{listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:12}}>
              {[
                "No crypto wallet needed — we handle custody",
                "Earn up to 8% APY staking Ethereum & Solana",
                "Insured cold storage — never held on exchanges",
                "Seamlessly mix crypto with stocks in one portfolio",
                "Tax-loss harvesting & crypto tax reports included",
              ].map((b,i)=>(
                <li key={i} style={{display:"flex",gap:12,alignItems:"center"}}>
                  <Check size={15} color="rgba(255,255,255,0.4)" strokeWidth={2} style={{flexShrink:0}} />
                  <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.5}}>{b}</span>
                </li>
              ))}
            </ul>
            <Link href="/register" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 32px",borderRadius:12,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontWeight:700,fontSize:14,textDecoration:"none"}}>
              Start Trading Crypto <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Investment Calculator ─────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000
    ? "$" + (n / 1_000_000).toFixed(2) + "M"
    : "$" + n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function InvestmentCalculator() {
  const [principal, setPrincipal] = useState(50000);
  const [monthly, setMonthly]     = useState(500);
  const [years, setYears]         = useState(10);
  const [animKey, setAnimKey]     = useState(0);

  const r     = 2.35 / 100;          // fixed 2.35% monthly projected
  const t     = years * 12;
  const grow  = Math.pow(1 + r, t);
  const total = principal * grow + monthly * (grow - 1) / r;
  const monthlyEarning = total * r;
  const totalContributed = principal + monthly * t;
  const totalGrowth = total - totalContributed;

  const trigger = useCallback(() => setAnimKey(k => k + 1), []);

  useEffect(() => { trigger(); }, [principal, monthly, years]);

  /* SVG chart — yearly snapshots */
  const W = 520, H = 200, PX = 40, PY = 20, PB = 32;
  const points = Array.from({ length: years + 1 }, (_, i) => {
    const months = i * 12;
    const g = Math.pow(1 + r, months);
    return months === 0 ? principal : principal * g + monthly * (g - 1) / r;
  });
  const maxV = points[points.length - 1];
  const minV = points[0];
  const range = maxV - minV || 1;
  const W_inner = W - PX * 2;
  const H_inner = H - PY - PB;

  const toX = (i: number) => PX + (i / years) * W_inner;
  const toY = (v: number) => PY + H_inner - ((v - minV) / range) * H_inner;

  const pathStr = points.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const areaStr = pathStr + ` L ${toX(years).toFixed(1)} ${(PY + H_inner).toFixed(1)} L ${PX} ${(PY + H_inner).toFixed(1)} Z`;

  /* Y-axis labels */
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
    v: minV + f * range,
    y: toY(minV + f * range),
  }));

  return (
    <section style={{ background: "#F5F6F7", padding: "96px 0", borderTop: "1px solid #E6E8EB", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: DOTL }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7280", marginBottom: 10 }}>Investment Calculator</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            See How Your Money Can Grow
          </h2>
          <p style={{ color: "#6B7280", fontSize: 15, maxWidth: 540, margin: "0 auto" }}>
            Adjust your investment amount and timeline to see estimated compounded growth based on a projected monthly return of 2.35%.
          </p>
        </div>

        <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(440px,1fr))", gap: 32, alignItems: "start" }}>

          {/* ── Left: controls ── */}
          <div style={{ background: "linear-gradient(140deg,#0d1520,#141e2e)", borderRadius: 24, padding: "40px 40px 36px", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 80px rgba(0,0,0,0.18)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.08)" }} />

            {/* Slider: initial investment */}
            {[
              { label: "Initial Investment", value: principal, min: 1000, max: 500000, step: 1000, setter: setPrincipal, display: fmt(principal) },
              { label: "Monthly Contribution", value: monthly, min: 0, max: 10000, step: 100, setter: setMonthly, display: fmt(monthly) + "/mo" },
              { label: "Investment Period", value: years, min: 1, max: 30, step: 1, setter: setYears, display: `${years} year${years !== 1 ? "s" : ""}` },
            ].map(({ label, value, min, max, step, setter, display }) => (
              <div key={label} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{display}</span>
                </div>
                <input
                  type="range" className="calc-slider"
                  min={min} max={max} step={step} value={value}
                  onChange={e => setter(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{label === "Investment Period" ? `${min}yr` : fmt(min)}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{label === "Investment Period" ? `${max}yr` : fmt(max)}</span>
                </div>
              </div>
            ))}

            {/* Projected rate badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px", marginTop: 4 }}>
              <Info size={14} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                Projected monthly return: <strong style={{ color: "rgba(255,255,255,0.55)" }}>2.35%</strong> — historical performance range 1.75%–3%. Past performance does not guarantee future results.
              </span>
            </div>

            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28, background: "#fff", color: "#0d1520", fontWeight: 700, fontSize: 14, padding: "13px 32px", textDecoration: "none", borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              Start Building Wealth <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* ── Right: results + chart ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Result cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: PiggyBank, label: "Estimated Monthly Income", value: fmt(monthlyEarning), note: "After " + years + " years" },
                { icon: Target, label: "Projected Portfolio Value", value: fmt(total), note: "Total estimated value" },
                { icon: DollarSign, label: "Total Contributions", value: fmt(totalContributed), note: "Principal + monthly" },
                { icon: TrendingUp, label: "Estimated Growth", value: fmt(totalGrowth), note: "Compounded returns" },
              ].map(({ icon: Icon, label, value, note }, i) => (
                <div key={label} style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", border: "1px solid #E6E8EB", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#0d1520,#1a2d4a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1.3 }}>{label}</span>
                  </div>
                  <div key={animKey + i} className="val-animate" style={{ fontSize: "clamp(18px,2.5vw,24px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{note}</div>
                </div>
              ))}
            </div>

            {/* SVG chart */}
            <div style={{ background: "linear-gradient(140deg,#0d1520,#141e2e)", borderRadius: 20, padding: "28px 24px 20px", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Projected Growth</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Estimated — not guaranteed</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                  </linearGradient>
                </defs>
                {/* Y-axis ticks */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line x1={PX} y1={tick.y} x2={W - PX} y2={tick.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <text x={PX - 8} y={tick.y + 4} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="Inter,sans-serif">{tick.v >= 1e6 ? (tick.v / 1e6).toFixed(1) + "M" : (tick.v / 1e3).toFixed(0) + "K"}</text>
                  </g>
                ))}
                {/* X-axis labels (every 5 years or every 2yr if short) */}
                {Array.from({ length: years + 1 }, (_, i) => i).filter(i => i % (years > 10 ? 5 : years > 5 ? 2 : 1) === 0).map(i => (
                  <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="Inter,sans-serif">Yr {i}</text>
                ))}
                {/* Area fill */}
                <path d={areaStr} fill="url(#chartGrad)" />
                {/* Line */}
                <path d={pathStr} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* End dot */}
                <circle cx={toX(years)} cy={toY(maxV)} r="5" fill="#fff" opacity="0.9" />
                <circle cx={toX(years)} cy={toY(maxV)} r="9" fill="rgba(255,255,255,0.15)" />
                {/* End label */}
                <text x={toX(years)} y={toY(maxV) - 16} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontWeight="700" fontFamily="Inter,sans-serif">
                  {maxV >= 1e6 ? "$" + (maxV / 1e6).toFixed(2) + "M" : "$" + (maxV / 1e3).toFixed(0) + "K"}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{background:"#fff",fontFamily:"'Inter',system-ui,sans-serif",overflowX:"hidden"}}>
      <style>{css}</style>
      <HomeNavbar />

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section style={{background:"#080a0f",position:"relative",overflow:"hidden",minHeight:"calc(100vh - 200px)",display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
        <div style={{position:"absolute",top:-300,left:"10%",width:1200,height:800,background:"radial-gradient(ellipse,rgba(37,99,235,0.09) 0%,transparent 60%)",zIndex:1,pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:-100,right:"5%",width:700,height:700,background:"radial-gradient(ellipse,rgba(37,99,235,0.05) 0%,transparent 65%)",zIndex:1,pointerEvents:"none"}} />

        <div style={{position:"relative",zIndex:5,maxWidth:1280,margin:"0 auto",padding:"clamp(60px,7vw,100px) 32px",width:"100%",boxSizing:"border-box" as const}}>
          <div className="hero-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center"}}>

            {/* ── LEFT: Headline + CTAs ── */}
            <div>
              {/* Live badge */}
              <div className="hero-1" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(74,222,128,0.07)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:999,padding:"5px 14px",marginBottom:28}}>
                <span className="pulse-dot" style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",display:"inline-block",boxShadow:"0 0 8px rgba(74,222,128,0.8)"}} />
                <span style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:500}}>Markets Live · 170+ Global Instruments</span>
              </div>

              <h1 className="hero-2" style={{fontSize:"clamp(52px,5.5vw,84px)",fontWeight:900,color:"#fff",letterSpacing:"-0.045em",lineHeight:0.95,margin:"0 0 20px"}}>
                Trade<br/>
                <span style={{color:"rgba(255,255,255,0.25)"}}>Everything.</span>
              </h1>

              <p className="hero-3" style={{fontSize:17,color:"rgba(255,255,255,0.42)",lineHeight:1.65,maxWidth:420,marginBottom:36}}>
                Stocks · Crypto · Forex · Commodities<br/>
                <span style={{color:"rgba(255,255,255,0.62)",fontWeight:500}}>One account. Zero minimums.</span>
              </p>

              {/* Asset class icon grid */}
              <div className="hero-icon-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:400}}>
                {[
                  {icon:BarChart3,   label:"Equities",    sub:"170+ Markets"},
                  {icon:Bitcoin,     label:"Crypto",      sub:"60+ Coins"},
                  {icon:Globe2,      label:"Forex",       sub:"100+ Pairs"},
                  {icon:Wheat,       label:"Commodities", sub:"Futures & Spot"},
                  {icon:TrendingUp,  label:"Bonds",       sub:"1M+ Securities"},
                  {icon:Calculator,  label:"Options",     sub:"$0.65/contract"},
                ].map(({icon:Icon,label,sub})=>(
                  <div key={label} style={{
                    background:"rgba(255,255,255,0.03)",
                    border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:14,
                    padding:"16px 14px",
                    display:"flex",
                    flexDirection:"column" as const,
                    gap:10,
                    position:"relative" as const,
                    overflow:"hidden",
                  }}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"rgba(255,255,255,0.06)"}} />
                    <div style={{
                      width:36,height:36,borderRadius:10,
                      background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(255,255,255,0.1)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <Icon size={18} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.8)",lineHeight:1,letterSpacing:"-0.005em"}}>{label}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:4,lineHeight:1}}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Live Market Terminal ── */}
            <div className="hero-mockup">
              <HeroTerminal />
            </div>
          </div>

          {/* Mobile stats strip — hidden on desktop, shown on mobile via CSS */}
          <div className="hero-stats-row" style={{display:"none",marginTop:36,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"16px 8px"}}>
            {[{v:"$19.5B",l:"Equity Capital"},{v:"4.4M+",l:"Clients"},{v:"170+",l:"Markets"},{v:"50+",l:"Years"}].map((s,i,arr)=>(
              <div key={s.v} style={{textAlign:"center",padding:"0 12px",borderRight:i<arr.length-1?"1px solid rgba(255,255,255,0.08)":"none"}}>
                <div style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.025em"}}>{s.v}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase" as const,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TICKER BAR ─────────────────────────────────────────────── */}
      <div style={{background:"#0a0c11",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"11px 0",overflow:"hidden"}}>
        <div className="ticker-track">
          {[...TICKERS,...TICKERS].map((t,i)=>(
            <div key={i} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"0 32px",whiteSpace:"nowrap"}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:t.up?"#4ade80":"#f87171",display:"inline-block",flexShrink:0}} />
              <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:600,letterSpacing:"0.06em"}}>{t.sym}</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.88)",fontWeight:700,fontVariantNumeric:"tabular-nums"}}>${t.price}</span>
              <span style={{fontSize:11,fontWeight:700,color:t.up?"#4ade80":"#f87171"}}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RATE CARDS ─────────────────────────────────────────────── */}
      <section style={{background:"#080a0f",padding:"80px 0 96px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
        <div style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"0 24px"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:10}}>Unbeatable Rates</p>
            <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",lineHeight:1.1,margin:0}}>Your Money Works Harder</h2>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:15,marginTop:10}}>Earn more on cash. Pay less to borrow.</p>
          </div>
          <div className="rate-cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20}}>
            {[
              {head:"Earn up to",currency:"USD",rate:"3.14%",note:"on instantly available cash balances",cta:"View Interest Rates",accent:"#4ade80"},
              {head:"Borrow at margin rates as low as",currency:"USD",rate:"4.14%",note:"Among the lowest margin rates globally",cta:"View Margin Rates",accent:"#60a5fa"},
            ].map(r=>(
              <div key={r.rate} className="rate-card" style={{background:"linear-gradient(140deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"40px 40px 36px",transition:"transform .22s ease,box-shadow .22s ease",cursor:"default",position:"relative",overflow:"hidden",backdropFilter:"blur(12px)"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${r.accent}50,transparent)`}} />
                <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:`radial-gradient(ellipse,${r.accent}10,transparent 70%)`,pointerEvents:"none"}} />
                <p style={{color:"rgba(255,255,255,0.38)",fontSize:13,marginBottom:14,lineHeight:1.5}}>{r.head}</p>
                <div style={{marginBottom:16,display:"flex",alignItems:"flex-end",gap:4}}>
                  <span style={{color:"rgba(255,255,255,0.3)",fontSize:18,fontWeight:500,lineHeight:1,paddingBottom:8}}>{r.currency}</span>
                  <span style={{color:"#fff",fontSize:"clamp(52px,8vw,72px)",fontWeight:900,letterSpacing:"-0.04em",lineHeight:1}}>{r.rate}</span>
                </div>
                <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,lineHeight:1.6,marginBottom:32}}>{r.note}</p>
                <a href="#" style={{display:"inline-flex",alignItems:"center",gap:6,color:r.accent,fontSize:13,fontWeight:600,textDecoration:"none"}}>
                  {r.cta} <ChevronRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INVESTMENT CALCULATOR ─────────────────────────────────── */}
      <InvestmentCalculator />

      {/* ─── INVESTMENT CATEGORIES ─────────────────────────────────── */}
      <InvestmentCategories />

      {/* ─── FEATURE CARDS ─────────────────────────────────────────── */}
      <section style={{background:"#F5F6F7",padding:"88px 0",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOTL}} />
        <div style={{position:"relative",zIndex:1,maxWidth:1120,margin:"0 auto",padding:"0 24px"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:10}}>Why Vault Wealth</p>
            <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#0F172A",letterSpacing:"-0.03em",lineHeight:1.1}}>Built for Long-Term Wealth</h2>
          </div>
          <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20}}>
            {[
              {Icon:DollarSign,title:"Professional Pricing",desc:"Commissions starting at $0, low margin rates, high interest paid, and Stock Yield Enhancement.",gradient:"linear-gradient(135deg,#1e3a5f,#0f2040)"},
              {Icon:Globe2,title:"Global Access",desc:"Invest globally in stocks, options, futures, currencies, bonds and funds from a single unified platform.",gradient:"linear-gradient(135deg,#0a2920,#052015)"},
              {Icon:Zap,title:"Premier Technology",desc:"Vault's powerful suite of technology helps you optimize trading speed, efficiency and portfolio analysis.",gradient:"linear-gradient(135deg,#2d1f0a,#1e1505)"},
              {Icon:ShieldCheck,title:"Strength & Security",desc:"$19.5 billion in equity capital, automated risk controls, all assets marked to market daily.",gradient:"linear-gradient(135deg,#1f0a0a,#150505)"},
            ].map(({Icon,title,desc,gradient})=>(
              <div key={title} className="feat-card" style={{background:gradient,borderRadius:20,padding:"32px 28px 28px",cursor:"pointer",transition:"transform .22s ease,box-shadow .22s ease",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid rgba(255,255,255,0.04)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"rgba(255,255,255,0.06)"}} />
                <div style={{marginBottom:20}}>
                  <Icon size={26} color="rgba(255,255,255,0.55)" strokeWidth={1.5} />
                </div>
                <h3 style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:10,letterSpacing:"-0.01em"}}>{title}</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.75,marginBottom:20}}>{desc}</p>
                <a href="#" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.5)",textDecoration:"none"}}>
                  Learn More <ChevronRight size={13} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RETIREMENT ─────────────────────────────────────────────── */}
      <RetirementSection />

      {/* ─── CRYPTO ─────────────────────────────────────────────────── */}
      <CryptoSection />

      {/* ─── TESTIMONIALS ──────────────────────────────────────────── */}
      <section style={{background:"#F5F6F7",padding:"96px 0",borderTop:"1px solid #E6E8EB",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOTL}} />
        <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:10}}>Real Investors. Real Results.</p>
            <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#0F172A",letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:12}}>
              Trusted by 4.4 Million Investors Worldwide
            </h2>
            <p style={{color:"#6B7280",fontSize:15}}>From first-time retirees to seasoned traders — here's what our clients say</p>
          </div>

          <TestimonialCarousel />

          {/* Trust badges row */}
          <div className="trust-badges" style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",marginTop:60}}>
            {[
              {icon:Shield,label:"SIPC Member",sub:"Up to $500K protected"},
              {icon:Lock,label:"Bank-Grade Security",sub:"256-bit AES encryption"},
              {icon:Star,label:"4.9/5 App Store",sub:"50,000+ ratings"},
              {icon:TrendingUp,label:"$2.4T+ AUM",sub:"Assets under management"},
            ].map(({icon:Icon,label,sub},i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 22px",background:"linear-gradient(135deg,#080a0f,#0f1320)",borderRadius:16,border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"rgba(255,255,255,0.06)"}} />
                <div style={{width:38,height:38,borderRadius:11,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,backdropFilter:"blur(8px)"}}>
                  <Icon size={17} color="rgba(255,255,255,0.75)" strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{label}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROFESSIONAL PRICING SPLIT ────────────────────────────── */}
      <section style={{background:"#fff",padding:"96px 0",borderTop:"1px solid #E6E8EB"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
          <div className="section-two-col" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:72,alignItems:"center"}}>
            <div className="section-two-col-img" style={{borderRadius:20,overflow:"hidden",position:"relative",boxShadow:"0 20px 60px rgba(0,0,0,0.12)"}}>
              <img src="/platform-mockup.png" alt="Professional pricing dashboard" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} />
              <div style={{position:"absolute",bottom:20,left:20,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(12px)",borderRadius:14,padding:"12px 18px",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",border:"1px solid rgba(0,0,0,0.06)"}}>
                <div style={{fontSize:11,color:"#6B7280",fontWeight:500}}>Commission Saved (YTD)</div>
                <div style={{fontSize:22,fontWeight:900,color:"#0F172A",letterSpacing:"-0.02em"}}>$18,432.50</div>
                <div style={{fontSize:12,color:"#2b6b4e",fontWeight:700}}>↑ 23% vs last year</div>
              </div>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:12}}>Professional Pricing</p>
              <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#0F172A",letterSpacing:"-0.03em",marginBottom:24,lineHeight:1.1}}>
                Experience Professional Pricing
              </h2>
              <ul style={{listStyle:"none",padding:0,margin:"0 0 32px",display:"flex",flexDirection:"column",gap:16}}>
                {[
                  {bold:"Low commissions starting at $0",rest:" with no added spreads, ticket charges, platform fees, or account minimums."},
                  {bold:"Best execution",rest:" — advanced trading technologies designed to maximize price improvement."},
                  {bold:"Margin rates up to 55% lower",rest:" than the industry average."},
                  {bold:"Earn up to USD 3.14%",rest:" on instantly available cash balances."},
                  {bold:"Earn extra income",rest:" on your lendable shares through Stock Yield Enhancement."},
                ].map((item,i)=>(
                  <li key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <Check size={16} color="#2b6b4e" strokeWidth={2} style={{flexShrink:0,marginTop:3}} />
                    <span style={{fontSize:14,color:"#374151",lineHeight:1.7}}>
                      <strong style={{color:"#0F172A",fontWeight:700}}>{item.bold}</strong>{item.rest}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="#" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:14,fontWeight:700,color:"#0d1520",textDecoration:"none"}}>
                Learn More <ChevronRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST / STATS (dark) ──────────────────────────────────── */}
      <section style={{background:"#080a0f",padding:"96px 0",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
        <div style={{position:"absolute",top:-100,right:-100,width:600,height:600,background:"radial-gradient(ellipse,rgba(37,99,235,0.06) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:-100,left:-100,width:500,height:500,background:"radial-gradient(ellipse,rgba(255,255,255,0.015) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
          <div className="section-two-col" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(420px,1fr))",gap:72,alignItems:"start"}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",marginBottom:12}}>Strength &amp; Security</p>
              <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#fff",letterSpacing:"-0.03em",marginBottom:20,lineHeight:1.1}}>A Broker You Can Trust</h2>
              <p style={{fontSize:15,color:"rgba(255,255,255,0.4)",lineHeight:1.8,marginBottom:40}}>
                When placing your money with a broker, you need to make sure your broker is secure and can endure through good and bad times. Our strong capital position, conservative balance sheet and automated risk controls are designed to protect Vault from major market events.
              </p>
              <a href="#" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:14,fontWeight:700,color:"#60a5fa",textDecoration:"none"}}>
                Vault Financial Protection <ChevronRight size={16} />
              </a>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {label:"Member of the",val:"S&P 500"},
                {label:"Nasdaq Listed",val:"VWT"},
                {label:"Equity Capital",val:"$19.5B"},
                {label:"Privately Held",val:"74%"},
                {label:"Excess Regulatory Capital",val:"$13.3B"},
                {label:"Client Accounts",val:"4.40M"},
                {label:"Daily Avg Revenue Trades",val:"4.04M"},
                {label:"Years of Innovation",val:"50+"},
              ].map((s,i)=>(
                <div key={i} className="stat-chip" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"18px 20px",transition:"transform .18s,box-shadow .18s",cursor:"default",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"rgba(255,255,255,0.06)"}} />
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontWeight:600,marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.3}}>{s.label}</div>
                  <div style={{fontSize:"clamp(20px,2.5vw,26px)",fontWeight:900,color:"#fff",letterSpacing:"-0.025em"}}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── AWARDS ────────────────────────────────────────────────── */}
      <section style={{background:"#fff",padding:"80px 0",borderTop:"1px solid #E6E8EB"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:10}}>Recognition</p>
          <h2 style={{fontSize:"clamp(22px,3.5vw,36px)",fontWeight:900,color:"#0F172A",marginBottom:8,letterSpacing:"-0.025em"}}>Award-Winning Platform</h2>
          <p style={{color:"#6B7280",fontSize:14,marginBottom:48}}>Recognized by the world's leading financial publications</p>
          <div className="awards-row" style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",alignItems:"stretch"}}>
            {[
              {rank:"#1",label:"Professional Trading",src:"StockBrokers.com 2026"},
              {rank:"#1",label:"International Trading",src:"StockBrokers.com 2026"},
              {rank:"Best",label:"Advanced Traders",src:"NerdWallet 2026"},
              {rank:"Best",label:"For Advanced Traders",src:"Investopedia 2026"},
              {rank:"Best",label:"Online Broker",src:"BrokerChooser 2026"},
            ].map((a,i)=>(
              <div key={i} className="award-card" style={{textAlign:"center",padding:"28px",background:"#fff",border:"1px solid #E6E8EB",borderRadius:16,minWidth:155,transition:"border-color .2s,background .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",cursor:"default"}}>
                <div style={{fontSize:36,fontWeight:900,color:"#0d1520",letterSpacing:"-0.03em",lineHeight:1}}>{a.rank}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginTop:8,marginBottom:4,lineHeight:1.4}}>{a.label}</div>
                <div style={{fontSize:11,color:"#9CA3AF",fontWeight:500}}>{a.src}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACCOUNT TYPES ─────────────────────────────────────────── */}
      <section style={{background:"#F5F6F7",padding:"96px 0",borderTop:"1px solid #E6E8EB",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOTL}} />
        <div style={{position:"relative",zIndex:1,maxWidth:1100,margin:"0 auto",padding:"0 24px",textAlign:"center"}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#6B7280",marginBottom:10}}>Account Types</p>
          <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,color:"#0F172A",letterSpacing:"-0.025em",marginBottom:8}}>Choose the Best Account for You</h2>
          <p style={{color:"#6B7280",fontSize:15,marginBottom:52}}>From individual to institutional — we have an account for every investor</p>
          <div className="acct-types-row" style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",marginBottom:60}}>
            {[
              {Icon:User,label:"Individual Accounts",sub:"Personal investing accounts"},
              {Icon:Users,label:"Joint or Trust Accounts",sub:"Shared and fiduciary accounts"},
              {Icon:Landmark,label:"Retirement Accounts",sub:"IRA, Roth, SEP and SIMPLE"},
              {Icon:Briefcase,label:"Non-Professional Advisors",sub:"Manage friends & family"},
              {Icon:Building2,label:"Institutional Accounts",sub:"Advisors, hedge funds & brokers"},
            ].map(({Icon,label,sub})=>(
              <a key={label} href="#" className="acct-card" style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 24px",border:"1px solid #E6E8EB",textDecoration:"none",width:175,borderRadius:16,transition:"border-color .18s,background .18s",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",background:"#fff"}}>
                <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#080a0f,#131a26)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
                  <Icon size={20} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />
                </div>
                <span style={{fontSize:13,fontWeight:700,color:"#0F172A",marginBottom:4,textAlign:"center",lineHeight:1.3}}>{label}</span>
                <span style={{fontSize:11,color:"#9CA3AF",textAlign:"center",lineHeight:1.4}}>{sub}</span>
              </a>
            ))}
          </div>
          <div className="steps-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:40}}>
            {[
              {step:"01",title:"Complete the Application",desc:"It only takes a few minutes"},
              {step:"02",title:"Fund Your Account",desc:"Connect your bank or transfer an account"},
              {step:"03",title:"Get Started Trading",desc:"Take your investing to the next level"},
            ].map((s,i)=>(
              <div key={i} className="step-card" style={{padding:"28px",borderRadius:16,border:"1px solid #E6E8EB",background:"#F5F6F7",textAlign:"center",transition:"background .18s,box-shadow .18s",cursor:"default"}}>
                <div style={{fontSize:28,fontWeight:900,color:"rgba(13,21,32,0.1)",letterSpacing:"-0.04em",lineHeight:1,marginBottom:10}}>{s.step}</div>
                <h4 style={{fontSize:15,fontWeight:700,color:"#0F172A",marginBottom:6}}>{s.title}</h4>
                <p style={{fontSize:13,color:"#6B7280",lineHeight:1.6,margin:0}}>{s.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/register" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",background:"#0d1520",color:"#fff",fontWeight:700,fontSize:15,padding:"14px 52px",textDecoration:"none",borderRadius:12,boxShadow:"0 4px 16px rgba(13,21,32,0.2)",transition:"transform .15s,box-shadow .15s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(-1px)";(e.currentTarget as HTMLElement).style.boxShadow="0 8px 28px rgba(13,21,32,0.28)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="";(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(13,21,32,0.2)"}}>
            Open Account — No Minimums
          </Link>
          <p style={{fontSize:12,color:"#9CA3AF",marginTop:12}}>No account minimums. No hidden fees.</p>
        </div>
      </section>

      {/* ─── 24/7 BANNER ────────────────────────────────────────────── */}
      <section style={{background:"linear-gradient(135deg,#0f2d52 0%,#0a1e3a 50%,#0f1320 100%)",padding:"72px 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:DOT,zIndex:0}} />
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:300,background:"radial-gradient(ellipse,rgba(255,255,255,0.03) 0%,transparent 70%)",zIndex:0,pointerEvents:"none"}} />
        <div style={{position:"relative",zIndex:1,maxWidth:740,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:999,padding:"5px 14px",marginBottom:24}}>
            <span className="pulse-dot" style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block",boxShadow:"0 0 8px #4ade80"}} />
            <span style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:500}}>Markets open 24/7 for eligible instruments</span>
          </div>
          <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:900,color:"#fff",letterSpacing:"-0.025em",marginBottom:16,lineHeight:1.15}}>
            Trade US Stocks and ETFs Around the Clock
          </h2>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:15,lineHeight:1.8,marginBottom:32}}>
            React immediately to market-moving news. Trade over 10,000 US Stocks and ETFs, Index Futures and Options, US Treasuries, and global bonds when it's convenient for you.
          </p>
          <a href="#" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontSize:14,fontWeight:600,padding:"12px 32px",textDecoration:"none",borderRadius:12,backdropFilter:"blur(8px)",transition:"background .15s,border-color .15s"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.16)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.1)"}}>
            Learn About 24/7 Trading <ChevronRight size={14} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
