import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Components
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Loader2 } from "lucide-react";

// Public Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Marketing Pages
import WhyVault from "@/pages/marketing/WhyVault";
import Pricing from "@/pages/marketing/Pricing";
import Security from "@/pages/marketing/Security";
import RetirementPage from "@/pages/marketing/RetirementPage";
import CryptoPage from "@/pages/marketing/CryptoPage";

// App Pages
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Invest from "@/pages/Invest";
import AssetList from "@/pages/AssetList";
import AssetDetail from "@/pages/AssetDetail";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";

const queryClient = new QueryClient();

// Pending Approval Screen
function PendingApproval({ user }: { user: any }) {
  const submittedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#F5F6F7", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #E6E8EB", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/">
          <img src="/logo-dark.png" alt="INT Brokers" style={{ width: 180, height: "auto", mixBlendMode: "multiply" }} />
        </a>
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Application Status</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #E6E8EB", borderRadius: 99, padding: "5px 14px", marginBottom: 18 }}>
              <Loader2 size={11} className="animate-spin" style={{ color: "#d97706" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>Review In Progress</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em", marginBottom: 8 }}>Your application is being reviewed</h1>
            <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
              Welcome back, <strong style={{ color: "#0F172A" }}>{user.fullName}</strong>. Your account is pending approval from our compliance team.
            </p>
          </div>

          {/* Status card */}
          <div style={{ background: "white", border: "1px solid #E6E8EB", borderRadius: 14, marginBottom: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #F5F6F7" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>Account Details</span>
            </div>
            {[
              { label: "Name", value: user.fullName },
              { label: "Email", value: user.email },
              { label: "Submitted", value: submittedDate },
              { label: "Status", value: "Pending compliance review", amber: true },
              { label: "Estimated approval", value: "24–48 business hours" },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: i < arr.length - 1 ? "1px solid #F5F6F7" : "none", gap: 16 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: (row as any).amber ? "#d97706" : "#0F172A", textAlign: "right" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* What's happening */}
          <div style={{ background: "white", border: "1px solid #E6E8EB", borderRadius: 14, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid #F5F6F7" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>What's Happening</span>
            </div>
            {[
              { label: "Documents submitted", desc: "Your ID and biometric verification have been received", done: true },
              { label: "Compliance review", desc: "Our team is verifying your application — this takes 24–48 hrs", done: false },
              { label: "Account activation", desc: "You'll receive an email confirmation when approved", done: false },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", gap: 13, padding: "12px 18px", borderBottom: i < 2 ? "1px solid #F5F6F7" : "none" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${s.done ? "#0F172A" : "#E6E8EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  {s.done
                    ? <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="2,5 4,7 8,3" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{s.label}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Email reminder */}
          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
            Confirmation will be sent to <strong style={{ color: "#6B7280" }}>{user.email}</strong>.
            If you don't see it, check your <strong style={{ color: "#6B7280" }}>spam or junk folder</strong>.
          </p>

          <a href="/" style={{ display: "block", textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
            ← Return to home
          </a>
        </div>
      </div>
    </div>
  );
}

// Auth Guard Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Handle onboarding redirect
  if (!user.onboardingComplete && window.location.pathname !== '/onboarding') {
    return <Redirect to="/onboarding" />;
  }

  // Show pending approval screen if onboarding complete but KYC still pending
  if (user.onboardingComplete && user.kycStatus === "pending") {
    return <PendingApproval user={user} />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Marketing Pages */}
      <Route path="/why-vault" component={WhyVault} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/security" component={Security} />
      <Route path="/retirement" component={RetirementPage} />
      <Route path="/crypto" component={CryptoPage} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/users/:id">
        <AdminLayout><AdminUserDetail /></AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      
      {/* Protected App Routes */}
      <Route path="/onboarding">
        {() => {
          const { user, isLoading } = useAuth();
          if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
          if (!user) return <Redirect to="/login" />;
          if (user.onboardingComplete) return <Redirect to="/dashboard" />;
          return <Onboarding />;
        }}
      </Route>
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/invest"><ProtectedRoute component={Invest} /></Route>
      <Route path="/assets/:type(crypto|stocks|commodities)"><ProtectedRoute component={AssetList} /></Route>
      <Route path="/assets/:symbol"><ProtectedRoute component={AssetDetail} /></Route>
      <Route path="/wallet"><ProtectedRoute component={Wallet} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
