import { useAuth } from "@/hooks/use-auth";
import { useGetUserProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, FileText, Settings, Loader2, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const { data: profile, isLoading } = useGetUserProfile({ query: { enabled: !!authUser } });

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <Button variant="secondary" className="w-full justify-start font-medium bg-muted/50 text-foreground">
            <User className="w-4 h-4 mr-3" /> Personal Information
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Shield className="w-4 h-4 mr-3" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <FileText className="w-4 h-4 mr-3" /> Documents & KYC
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4 mr-3" /> Preferences
          </Button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Identity Verification (KYC)</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Your identity has been verified. You have full access to all platform features.
                  </p>
                </div>
                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approved
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <Button variant="outline" size="sm">Edit</Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-serif">
                  {profile?.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{profile?.fullName}</h3>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Legal Name</label>
                  <div className="font-medium">{profile?.legalName || profile?.fullName}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Date of Birth</label>
                  <div className="font-medium">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Phone Number</label>
                  <div className="font-medium">{profile?.phone}</div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Country</label>
                  <div className="font-medium">{profile?.country}</div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Residential Address</label>
                  <div className="font-medium">
                    {profile?.address ? `${profile.address}, ${profile.city} ${profile.postalCode}` : 'Not provided'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end pt-4">
             <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
               Log out on all devices
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
