import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useAdminLogin } from "@workspace/api-client-react";

export default function AdminLogin() {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();
  const adminLogin = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    
    setLoading(true);
    try {
      await adminLogin.mutateAsync({ data: { passcode } });
      localStorage.setItem("adminAuthenticated", "true");
      toast.success("Admin access granted");
      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid passcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl tracking-tight">Admin Portal</CardTitle>
          <CardDescription>Enter secure passcode to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Passcode" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="h-14 text-center text-xl tracking-widest"
                required
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={loading}>
              {loading ? "Verifying..." : "Access Portal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
