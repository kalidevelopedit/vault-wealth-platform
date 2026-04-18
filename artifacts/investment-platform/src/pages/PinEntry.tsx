import { useState } from "react";
import { toast } from "sonner";
import PinPad from "./PinPad";

interface PinEntryProps {
  userEmail: string;
  onSuccess: () => void;
  onLogout: () => void;
}

export default function PinEntry({ userEmail, onSuccess, onLogout }: PinEntryProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handlePin = async (pin: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Incorrect passcode");
        return;
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (forgotSent) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userEmail }),
      });
      if (res.ok) {
        setForgotSent(true);
        toast.success("Reset instructions sent to your email");
      } else {
        toast.error("Could not send reset email");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PinPad
        title="Enter Your Passcode"
        subtitle={forgotSent
          ? "A new temporary passcode has been sent to your email. Log in again to continue."
          : `Welcome back. Enter your 6-digit passcode to access your account.`}
        onComplete={handlePin}
        onForgot={handleForgot}
        error={error}
        loading={loading}
      />
      <div style={{ textAlign: "center", marginTop: -20 }}>
        <button
          onClick={onLogout}
          style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
