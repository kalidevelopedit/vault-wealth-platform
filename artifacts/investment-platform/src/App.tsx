import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MarketPreferencesProvider } from "@/contexts/MarketPreferencesContext";
import { useEffect } from "react";

// Components
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Loader2 } from "lucide-react";

// PIN Pages
import PinSetup from "@/pages/PinSetup";
import PinEntry from "@/pages/PinEntry";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

// Public Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function HomeOrRedirect() {
  const isPWA = typeof window !== "undefined" && (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
  return isPWA ? <Redirect to="/login" /> : <Home />;
}

// Marketing Pages
import WhyVault from "@/pages/marketing/WhyVault";
import Pricing from "@/pages/marketing/Pricing";
import Security from "@/pages/marketing/Security";
import RetirementPage from "@/pages/marketing/RetirementPage";
import CryptoPage from "@/pages/marketing/CryptoPage";

// Why Vault subpages
import LowerCosts from "@/pages/marketing/LowerCosts";
import GlobalAccess from "@/pages/marketing/GlobalAccess";
import Technology from "@/pages/marketing/Technology";
import AwardsPage from "@/pages/marketing/AwardsPage";

// Product pages
import StocksETFs from "@/pages/marketing/StocksETFs";
import Options from "@/pages/marketing/Options";
import Futures from "@/pages/marketing/Futures";
import Forex from "@/pages/marketing/Forex";
import Bonds from "@/pages/marketing/Bonds";
import PreciousMetals from "@/pages/marketing/PreciousMetals";

// Account pages
import IndividualAccounts from "@/pages/marketing/IndividualAccounts";
import IRA from "@/pages/marketing/IRA";
import SEPIRA from "@/pages/marketing/SEPIRA";
import Rollover401k from "@/pages/marketing/Rollover401k";
import JointAccounts from "@/pages/marketing/JointAccounts";
import TrustAccounts from "@/pages/marketing/TrustAccounts";
import Institutional from "@/pages/marketing/Institutional";

// Pricing subpages
import Commissions from "@/pages/marketing/Commissions";
import MarginRates from "@/pages/marketing/MarginRates";
import InterestOnCash from "@/pages/marketing/InterestOnCash";
import CryptoSpreads from "@/pages/marketing/CryptoSpreads";
import NoHiddenFees from "@/pages/marketing/NoHiddenFees";

// Company pages
import About from "@/pages/marketing/About";
import Careers from "@/pages/marketing/Careers";
import Press from "@/pages/marketing/Press";
import Terms from "@/pages/marketing/Terms";
import Privacy from "@/pages/marketing/Privacy";
import RiskDisclosures from "@/pages/marketing/RiskDisclosures";

// App Pages
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Invest from "@/pages/Invest";
import AssetList from "@/pages/AssetList";
import AssetDetail from "@/pages/AssetDetail";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import UserSecurity from "@/pages/UserSecurity";
import Convert from "@/pages/Convert";
import Settings from "@/pages/Settings";
import WealthBuilder from "@/pages/WealthBuilder";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";
import AdminEmailTemplates from "@/pages/admin/AdminEmailTemplates";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
              <Loader2 size={11} className="animate-spin" style={{ color: "#6B7280" }} />
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
  const { user, isLoading, logout, refreshUser } = useAuth();
  
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

  // Account frozen — show support popup
  if ((user as any).isFrozen) {
    const WHATSAPP_LINK = "https://wa.me/18886555555?text=My%20account%20has%20been%20frozen.%20Please%20help.";
    return (
      <div style={{ minHeight: "100vh", background: "#080c18", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif", padding: "20px 16px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#0f1624", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "40px 24px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.92)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>Account Suspended</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: "0 0 32px" }}>
            Your account has been temporarily suspended by our compliance team.
            {(user as any).frozenReason ? ` Reason: ${(user as any).frozenReason}.` : ""}
            {" "}Please contact support to resolve this.
          </p>
          <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", boxSizing: "border-box",
            padding: "14px", borderRadius: 12, background: "#25D366", color: "#fff", textDecoration: "none",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", boxShadow: "0 4px 20px rgba(37,211,102,0.25)", marginBottom: 12,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contact Support via WhatsApp
          </a>
          <a href="/login" style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", marginTop: 4 }}>← Back to Login</a>
        </div>
      </div>
    );
  }

  // Handle onboarding redirect
  if (!user.onboardingComplete && window.location.pathname !== '/onboarding') {
    return <Redirect to="/onboarding" />;
  }

  // Show pending/rejected/flagged screen based on KYC status
  if (user.onboardingComplete && user.kycStatus === "pending") {
    return <PendingApproval user={user} />;
  }

  if (user.onboardingComplete && (user.kycStatus === "rejected" || user.kycStatus === "flagged")) {
    const isRejected = user.kycStatus === "rejected";
    const WA = "https://wa.me/18886555555?text=My%20KYC%20application%20was%20not%20approved.%20Please%20help.";
    return (
      <div style={{ minHeight: "100vh", background: "#080c18", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif", padding: "20px 16px" }}>
        <div style={{ width: "100%", maxWidth: 440, background: "#0f1624", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 28px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            {isRejected ? "Application Not Approved" : "Application Under Review"}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 28px" }}>
            {isRejected
              ? "Your KYC application was not approved. Please contact our support team to understand next steps or resubmit with correct documents."
              : "Your application has been flagged for additional review. Our compliance team will reach out shortly."}
            {(user as any).kycNotes ? ` Note: ${(user as any).kycNotes}` : ""}
          </p>
          <a href={WA} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", padding: "13px", borderRadius: 10, background: "#25D366", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contact Support via WhatsApp
          </a>
          <button onClick={logout} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer" }}>Sign out</button>
        </div>
      </div>
    );
  }

  // First login: must set a PIN
  if (user.mustSetPin) {
    return <PinSetup onComplete={refreshUser} />;
  }

  // Has PIN but hasn't verified this session
  if (user.hasPin && !user.pinVerified) {
    return (
      <PinEntry
        userEmail={user.email ?? ""}
        onSuccess={refreshUser}
        onLogout={logout}
      />
    );
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
      <Route path="/" component={HomeOrRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Marketing Pages — Why Vault */}
      <Route path="/why-vault" component={WhyVault} />
      <Route path="/why-vault/lower-costs" component={LowerCosts} />
      <Route path="/why-vault/global-access" component={GlobalAccess} />
      <Route path="/why-vault/technology" component={Technology} />
      <Route path="/why-vault/awards" component={AwardsPage} />

      {/* Marketing Pages — Products */}
      <Route path="/products/stocks" component={StocksETFs} />
      <Route path="/products/options" component={Options} />
      <Route path="/products/futures" component={Futures} />
      <Route path="/products/forex" component={Forex} />
      <Route path="/products/bonds" component={Bonds} />
      <Route path="/products/precious-metals" component={PreciousMetals} />
      <Route path="/crypto" component={CryptoPage} />
      <Route path="/retirement" component={RetirementPage} />

      {/* Marketing Pages — Accounts */}
      <Route path="/accounts/individual" component={IndividualAccounts} />
      <Route path="/accounts/ira" component={IRA} />
      <Route path="/accounts/sep-ira" component={SEPIRA} />
      <Route path="/accounts/401k" component={Rollover401k} />
      <Route path="/accounts/joint" component={JointAccounts} />
      <Route path="/accounts/trust" component={TrustAccounts} />
      <Route path="/accounts/institutional" component={Institutional} />

      {/* Marketing Pages — Pricing */}
      <Route path="/pricing" component={Pricing} />
      <Route path="/pricing/commissions" component={Commissions} />
      <Route path="/pricing/margin-rates" component={MarginRates} />
      <Route path="/pricing/interest-on-cash" component={InterestOnCash} />
      <Route path="/pricing/crypto-spreads" component={CryptoSpreads} />
      <Route path="/pricing/no-hidden-fees" component={NoHiddenFees} />

      {/* Marketing Pages — Company */}
      <Route path="/about" component={About} />
      <Route path="/security" component={Security} />
      <Route path="/careers" component={Careers} />
      <Route path="/press" component={Press} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/risk-disclosures" component={RiskDisclosures} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/users/:id">
        {(params: any) => <AdminLayout><AdminUserDetail urlUserId={parseInt(params?.id || "0", 10)} /></AdminLayout>}
      </Route>
      <Route path="/admin/users">
        <AdminLayout><AdminDashboard /></AdminLayout>
      </Route>
      <Route path="/admin/email-templates">
        <AdminLayout><AdminEmailTemplates /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><AdminSettings /></AdminLayout>
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
      <Route path="/markets"><ProtectedRoute component={AssetList} /></Route>
      <Route path="/assets/:type(crypto|stocks|commodities)"><ProtectedRoute component={AssetList} /></Route>
      <Route path="/assets/:symbol"><ProtectedRoute component={AssetDetail} /></Route>
      <Route path="/wallet"><ProtectedRoute component={Wallet} /></Route>
      <Route path="/wealth-builder"><ProtectedRoute component={WealthBuilder} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route path="/account/security"><ProtectedRoute component={UserSecurity} /></Route>
      <Route path="/convert"><ProtectedRoute component={Convert} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <MarketPreferencesProvider>
              <TooltipProvider>
                <ScrollToTop />
                <ErrorBoundary section="App">
                  <Router />
                </ErrorBoundary>
                <Toaster />
              </TooltipProvider>
            </MarketPreferencesProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
