import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Globe, Bell, Moon, Eye, DollarSign, ChevronRight, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { toast } from "sonner";

const BG    = "#050505";
const CARD   = "#0C0F14";
const BORD   = "rgba(255,255,255,0.08)";
const TEXT   = "rgba(255,255,255,0.96)";
const MUTED  = "rgba(255,255,255,0.45)";
const BLUE   = "#2563FF";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? BLUE : "rgba(255,255,255,0.1)",
      border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
      flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 3, left: on ? 23 : 3, transition: "left 0.2s",
      }} />
    </button>
  );
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "JPY", "SGD", "HKD", "AED"];
const LANGUAGES  = ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Portuguese"];

export default function Settings() {
  const { user } = useAuth();

  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const [priceAlerts, setPriceAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts]   = useState(false);
  const [tradeConf, setTradeConf]     = useState(true);
  const [newsAlerts, setNewsAlerts]   = useState(false);

  const [hideBalance, setHideBalance] = useState(false);
  const [showPnl, setShowPnl]         = useState(true);
  const [compactView, setCompactView] = useState(false);

  const handleSave = () => toast.success("Settings saved");

  const PickerModal = ({ title, options, selected, onSelect, onClose }: {
    title: string; options: string[]; selected: string;
    onSelect: (v: string) => void; onClose: () => void;
  }) => (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: 360, background: "#0C0F14",
        border: `1px solid ${BORD}`, borderRadius: 20, overflow: "hidden", zIndex: 1, margin: "0 16px",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORD}`, fontSize: 15, fontWeight: 600, color: TEXT }}>{title}</div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onSelect(opt); onClose(); }} style={{
              width: "100%", padding: "14px 24px", background: "transparent", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
              color: selected === opt ? TEXT : MUTED, fontSize: 14, fontWeight: selected === opt ? 600 : 400,
              borderBottom: `1px solid ${BORD}`, transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {opt}
              {selected === opt && <Check style={{ width: 16, height: 16, color: BLUE }} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", background: BG, minHeight: "100%" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 32 }}>Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-1">
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            {[
              { label: "Profile", href: "/profile", active: false },
              { label: "Security", href: "/account/security", active: false },
              { label: "Settings", href: "/settings", active: true },
            ].map((item, i, arr) => (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
                background: item.active ? "rgba(37,99,255,0.08)" : "transparent",
                color: item.active ? TEXT : MUTED,
                fontSize: 14, fontWeight: item.active ? 600 : 500, textDecoration: "none",
              }}>
                {item.label}
                <ChevronRight style={{ width: 14, height: 14, opacity: 0.4 }} strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          {/* Preferences */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORD}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Preferences</div>
            </div>
            {/* Currency */}
            <div style={{ padding: "18px 28px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#11141A", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign style={{ width: 16, height: 16, color: TEXT }} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>Display Currency</div>
                  <div style={{ fontSize: 12, color: MUTED }}>Prices and balances shown in this currency</div>
                </div>
              </div>
              <button onClick={() => setShowCurrencyPicker(true)} style={{
                height: 34, padding: "0 16px", background: "#11141A", border: `1px solid ${BORD}`,
                borderRadius: 8, color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {currency} <ChevronRight style={{ width: 14, height: 14, opacity: 0.5 }} strokeWidth={2} />
              </button>
            </div>
            {/* Language */}
            <div style={{ padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#11141A", border: `1px solid ${BORD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe style={{ width: 16, height: 16, color: TEXT }} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>Language</div>
                  <div style={{ fontSize: 12, color: MUTED }}>Platform display language</div>
                </div>
              </div>
              <button onClick={() => setShowLangPicker(true)} style={{
                height: 34, padding: "0 16px", background: "#11141A", border: `1px solid ${BORD}`,
                borderRadius: 8, color: TEXT, fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {language} <ChevronRight style={{ width: 14, height: 14, opacity: 0.5 }} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 12 }}>
              <Bell style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Notifications</div>
            </div>
            {[
              { label: "Price Alerts", desc: "Notify when assets hit your target price", value: priceAlerts, set: setPriceAlerts },
              { label: "Email Notifications", desc: "Account activity and transaction emails", value: emailAlerts, set: setEmailAlerts },
              { label: "Push Notifications", desc: "Browser push notifications", value: pushAlerts, set: setPushAlerts },
              { label: "Trade Confirmations", desc: "Confirm every trade before execution", value: tradeConf, set: setTradeConf },
              { label: "Market News", desc: "Daily market summary and breaking news", value: newsAlerts, set: setNewsAlerts },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{item.desc}</div>
                </div>
                <Toggle on={item.value} onToggle={() => item.set(v => !v)} />
              </div>
            ))}
          </div>

          {/* Display */}
          <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORD}`, display: "flex", alignItems: "center", gap: 12 }}>
              <Eye style={{ width: 16, height: 16, color: MUTED }} strokeWidth={1.5} />
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Display</div>
            </div>
            {[
              { label: "Hide Portfolio Balance", desc: "Mask balance amounts in the dashboard", value: hideBalance, set: setHideBalance },
              { label: "Show P&L Percentages", desc: "Display % gain/loss on holdings", value: showPnl, set: setShowPnl },
              { label: "Compact View", desc: "Reduce spacing for denser data tables", value: compactView, set: setCompactView },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                borderBottom: i < arr.length - 1 ? `1px solid ${BORD}` : "none",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{item.desc}</div>
                </div>
                <Toggle on={item.value} onToggle={() => item.set(v => !v)} />
              </div>
            ))}
          </div>

          {/* Save */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSave} style={{
              height: 44, padding: "0 32px", background: BLUE, border: "none",
              borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Save Settings</button>
          </div>
        </div>
      </div>

      {showCurrencyPicker && (
        <PickerModal title="Select Currency" options={CURRENCIES} selected={currency}
          onSelect={setCurrency} onClose={() => setShowCurrencyPicker(false)} />
      )}
      {showLangPicker && (
        <PickerModal title="Select Language" options={LANGUAGES} selected={language}
          onSelect={setLanguage} onClose={() => setShowLangPicker(false)} />
      )}
    </div>
  );
}
