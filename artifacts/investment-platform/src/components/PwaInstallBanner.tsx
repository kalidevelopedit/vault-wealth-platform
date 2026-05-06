import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const DISMISSED_KEY = "pwa_install_dismissed";

export function PwaInstallBanner() {
  const { colors, mode } = useTheme();
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const install = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") dismiss();
  };

  if (!visible) return null;

  return (
    <>
      <div style={{
        position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 9999,
        background: mode === "dark" ? "#0C0F14" : "#fff",
        border: `1px solid ${colors.bord}`,
        borderRadius: 16, padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "#050505",
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src="/pwa-icon.svg" alt="INT Brokers" style={{ width: 36, height: 36, borderRadius: 8 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 1 }}>
            Add INT Brokers to Home Screen
          </div>
          <div style={{ fontSize: 11, color: colors.muted, lineHeight: 1.3 }}>
            {isIOS ? "Tap Share → Add to Home Screen" : "Install for quick access to your portfolio"}
          </div>
        </div>
        <button onClick={install} style={{
          height: 34, padding: "0 14px", borderRadius: 999,
          background: colors.blue, border: "none", cursor: "pointer",
          color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Download style={{ width: 12, height: 12 }} strokeWidth={2} />
          Install
        </button>
        <button onClick={dismiss} style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: colors.inputBg, border: `1px solid ${colors.bord}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X style={{ width: 13, height: 13, color: colors.muted }} strokeWidth={2} />
        </button>
      </div>

      {showIOSGuide && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "flex-end", padding: 16,
        }} onClick={() => setShowIOSGuide(false)}>
          <div style={{
            width: "100%", background: mode === "dark" ? "#0C0F14" : "#fff",
            borderRadius: 20, padding: 24, border: `1px solid ${colors.bord}`,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
              Add to Home Screen (iOS)
            </div>
            <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6, marginBottom: 20 }}>
              To install INT Brokers as an app on your iPhone or iPad:
            </div>
            {[
              "1. Tap the Share button (\u{25A1}\u{2191}) in Safari's toolbar",
              "2. Scroll down and tap \u201CAdd to Home Screen\u201D",
              "3. Tap \u201CAdd\u201D in the top right corner",
            ].map((step, i) => (
              <div key={i} style={{ fontSize: 13, color: colors.text, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${colors.bord}` : "none" }}>
                {step}
              </div>
            ))}
            <button onClick={() => { setShowIOSGuide(false); dismiss(); }} style={{
              marginTop: 20, width: "100%", height: 44, borderRadius: 12,
              background: colors.blue, border: "none", cursor: "pointer",
              color: "#fff", fontSize: 14, fontWeight: 700,
            }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
