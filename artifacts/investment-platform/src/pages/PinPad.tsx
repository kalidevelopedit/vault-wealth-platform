import { useState } from "react";
import { Delete } from "lucide-react";
import { Link } from "wouter";

interface PinPadProps {
  title: string;
  subtitle: string;
  onComplete: (pin: string) => void;
  onForgot?: () => void;
  error?: string;
  loading?: boolean;
}

export default function PinPad({ title, subtitle, onComplete, onForgot, error, loading }: PinPadProps) {
  const [pin, setPin] = useState("");
  const PIN_LENGTH = 6;

  const handleDigit = (d: string) => {
    if (pin.length >= PIN_LENGTH || loading) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => onComplete(next), 120);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setPin(p => p.slice(0, -1));
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6F7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", alignItems: "center" }}>

        <Link href="/">
          <img
            src="/logo-dark.png"
            alt="INT Brokers"
            style={{ width: 200, height: "auto", display: "block", mixBlendMode: "multiply", marginBottom: 40, cursor: "pointer" }}
          />
        </Link>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{subtitle}</p>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 32, height: 16, alignItems: "center" }}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i < pin.length ? 14 : 12,
                height: i < pin.length ? 14 : 12,
                borderRadius: "50%",
                background: i < pin.length ? "#0d1520" : "transparent",
                border: `2px solid ${i < pin.length ? "#0d1520" : "#D1D5DB"}`,
                transition: "all 0.12s ease",
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: "10px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, fontSize: 12, color: "#DC2626", textAlign: "center", width: "100%" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 280 }}>
          {keys.flat().map((key, i) => {
            if (key === "") return <div key={i} />;
            if (key === "del") return (
              <button
                key={i}
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                style={{
                  height: 64,
                  borderRadius: 14,
                  background: "white",
                  border: "1px solid #E6E8EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  opacity: pin.length === 0 ? 0.3 : 1,
                }}
              >
                <Delete size={18} color="#6B7280" />
              </button>
            );
            return (
              <button
                key={i}
                onClick={() => handleDigit(key)}
                disabled={loading}
                style={{
                  height: 64,
                  borderRadius: 14,
                  background: "white",
                  border: "1px solid #E6E8EB",
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#0F172A",
                  cursor: "pointer",
                  transition: "transform 0.08s, background 0.1s",
                  boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                }}
                onMouseDown={e => (e.currentTarget.style.transform = "scale(0.94)")}
                onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              >
                {key}
              </button>
            );
          })}
        </div>

        {onForgot && (
          <button
            onClick={onForgot}
            disabled={loading}
            style={{ marginTop: 32, fontSize: 12, color: "#6B7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Forgot passcode?
          </button>
        )}
      </div>
    </div>
  );
}
