import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function DemoLogin() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
      return;
    }
    login({ email: "demo@vestplatform.com", password: "demo1234" })
      .then(() => setLocation("/dashboard"))
      .catch(() => setLocation("/login"));
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#f8f7f4", gap: 20,
    }}>
      <Logo variant="dark" height={32} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6b7280", fontSize: 14 }}>
        <Loader2 size={16} className="animate-spin" />
        Loading demo account…
      </div>
    </div>
  );
}
