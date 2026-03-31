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
