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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0d0f14" }}>
      <div className="w-full max-w-md text-center">
        <div className="w-12 h-12 border border-white/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Application Status</p>
        <h1 className="text-2xl font-bold text-white mb-3">Application Under Review</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Your application has been submitted and is currently under review by our compliance team. You will receive an email once approved — typically within 24–48 hours.
        </p>

        <div style={{ background: "#161a24" }} className="border border-white/8 mb-6">
          <div className="px-5 py-3 border-b border-white/6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Your Details</p>
          </div>
          <div className="divide-y divide-white/4">
            {[
              { label: "Full Name", value: user.fullName },
              { label: "Email", value: user.email },
              { label: "Account Status", value: "Pending Review" },
              { label: "Submitted", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3">
                <span className="text-white/35 text-xs">{row.label}</span>
                <span className={`text-xs font-medium ${row.label === "Account Status" ? "text-amber-400" : "text-white"}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <a href="/" className="text-white/25 text-xs hover:text-white/50 transition-colors">Return to home</a>
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
