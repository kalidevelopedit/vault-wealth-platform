import { useState } from "react";
import { toast } from "sonner";
import PinPad from "./PinPad";

interface PinSetupProps {
  onComplete: () => void;
}

export default function PinSetup({ onComplete }: PinSetupProps) {
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFirstPin = (pin: string) => {
    setFirstPin(pin);
    setStep("confirm");
    setError("");
  };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== firstPin) {
      setError("Passcodes don't match. Please try again.");
      setStep("enter");
      setFirstPin("");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to set passcode");
      }
      toast.success("Passcode set successfully");
      onComplete();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep("enter");
      setFirstPin("");
    } finally {
      setLoading(false);
    }
  };

  if (step === "enter") {
    return (
      <PinPad
        key="enter"
        title="Create Your Passcode"
        subtitle="Choose a 6-digit passcode you'll use to secure your account every time you log in."
        onComplete={handleFirstPin}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <PinPad
      key="confirm"
      title="Confirm Your Passcode"
      subtitle="Enter your passcode again to confirm. Make sure it matches exactly."
      onComplete={handleConfirmPin}
      error={error}
      loading={loading}
    />
  );
}
