import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

export type MarketCategory = "stocks" | "crypto" | "commodities" | "retirement";

interface MarketPreferencesContextValue {
  preferences: MarketCategory[];
  setPreferences: (prefs: MarketCategory[]) => void;
  hasSetPreferences: boolean;
  resetPreferences: () => void;
}

const MarketPreferencesContext = createContext<MarketPreferencesContextValue>({
  preferences: [],
  setPreferences: () => {},
  hasSetPreferences: false,
  resetPreferences: () => {},
});

export function MarketPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = user?.id ? `market_prefs_v1_${user.id}` : null;

  const [preferences, setPreferencesState] = useState<MarketCategory[]>([]);
  const [hasSetPreferences, setHasSetPreferences] = useState(false);

  useEffect(() => {
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPreferencesState(parsed);
          setHasSetPreferences(true);
        }
      }
    } catch {}
  }, [key]);

  const setPreferences = (prefs: MarketCategory[]) => {
    setPreferencesState(prefs);
    setHasSetPreferences(true);
    if (key) localStorage.setItem(key, JSON.stringify(prefs));
  };

  const resetPreferences = () => {
    setPreferencesState([]);
    setHasSetPreferences(false);
    if (key) localStorage.removeItem(key);
  };

  return (
    <MarketPreferencesContext.Provider value={{ preferences, setPreferences, hasSetPreferences, resetPreferences }}>
      {children}
    </MarketPreferencesContext.Provider>
  );
}

export const useMarketPreferences = () => useContext(MarketPreferencesContext);
