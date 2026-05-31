import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  bg: string; card: string; bord: string; text: string; muted: string;
  headerBg: string; sidebarBg: string; inputBg: string;
  active: string; hover: string; blue: string; green: string; red: string;
}

const DARK: ThemeColors = {
  bg: "#050505", card: "#0C0F14", bord: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.96)", muted: "rgba(255,255,255,0.44)",
  headerBg: "#0A0A0A", sidebarBg: "#050505", inputBg: "#11141A",
  active: "#191F28", hover: "rgba(255,255,255,0.03)",
  blue: "#2563FF", green: "#0ecb81", red: "#f6465d",
};

const LIGHT: ThemeColors = {
  bg: "#F3F4F6", card: "#FFFFFF", bord: "rgba(0,0,0,0.09)",
  text: "rgba(0,0,0,0.88)", muted: "rgba(0,0,0,0.46)",
  headerBg: "#FFFFFF", sidebarBg: "#FAFBFC", inputBg: "#EEF0F3",
  active: "#EEF2FF", hover: "rgba(0,0,0,0.03)",
  blue: "#2563FF", green: "#059669", red: "#DC2626",
};

interface ThemeCtx {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ mode: "dark", colors: DARK, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem("vw_theme") as ThemeMode) || "dark"; } catch { return "dark"; }
  });

  const toggle = () => setMode(m => { const n = m === "dark" ? "light" : "dark"; localStorage.setItem("vw_theme", n); return n; });
  const colors = mode === "dark" ? DARK : LIGHT;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.body.style.background = colors.bg;
    document.body.style.color = colors.text;
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode, colors]);

  return <Ctx.Provider value={{ mode, colors, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
