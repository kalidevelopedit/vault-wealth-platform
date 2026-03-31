import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useSaveInvestmentPreferences, useSaveUserProfile, useUploadIdDocument, useUploadSelfieVideo, useSubmitKyc } from "@workspace/api-client-react";
import { Loader2, UploadCloud, Camera, CheckCircle2, Building, LineChart, Bitcoin } from "lucide-react";

export default function Onboarding() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const savePreferencesMutation = useSaveInvestmentPreferences();
  const saveProfileMutation = useSaveUserProfile();
  const uploadIdMutation = useUploadIdDocument();
  const uploadSelfieMutation = useUploadSelfieVideo();
  const submitKycMutation = useSubmitKyc();

  // State for forms
  const [preferences, setPreferences] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    legalName: user?.fullName || "",
    dateOfBirth: "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    country: user?.country || "US"
  });
  const [idType, setIdType] = useState("passport");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handlePreferencesSubmit = async () => {
    if (preferences.length === 0) {
      toast.error("Please select at least one investment preference");
      return;
    }
    setLoading(true);
    try {
      await savePreferencesMutation.mutateAsync({ data: { preferences: preferences as any[] } });
      nextStep();
    } catch (e: any) {
      toast.error(e.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    if (!profile.legalName || !profile.dateOfBirth || !profile.address) {
      toast.error("Please fill out all required fields");
      return;
    }
    setLoading(true);
    try {
      await saveProfileMutation.mutateAsync({ data: profile });
      nextStep();
    } catch (e: any) {
      toast.error(e.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleIdUpload = async (side: "front" | "back") => {
    const file = side === "front" ? idFront : idBack;
    if (!file && (side === "front" || idType !== "passport")) {
      toast.error(`Please select a file for the ${side} of your ID`);
      return;
    }
    
    setLoading(true);
    try {
      if (file) {
        // In a real app, upload file to cloud storage first and get URL
        // Using a fake URL for mockup
        await uploadIdMutation.mutateAsync({
          data: {
            documentType: idType as any,
            side: side as any,
            fileUrl: `https://fake-storage.com/${file.name}`
          }
        });
      }
      nextStep();
    } catch (e: any) {
      toast.error(e.message || `Failed to upload ID ${side}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieUpload = async () => {
    setLoading(true);
    try {
      await uploadSelfieMutation.mutateAsync({
        data: { videoUrl: "https://fake-storage.com/selfie.mp4" }
      });
      nextStep();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await submitKycMutation.mutateAsync();
      toast.success("Application submitted successfully");
      window.location.href = "/dashboard"; // hard reload to update auth state
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-serif text-2xl tracking-tighter mb-4">
            V
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Setup your account</h1>
          <p className="text-muted-foreground mt-2">Step {step} of 8</p>
          
          <div className="w-full bg-border h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-border shadow-lg">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Investment Preferences</CardTitle>
                <CardDescription>What asset classes are you interested in?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "crypto", label: "Digital Assets", icon: Bitcoin, desc: "BTC, ETH, etc." },
                    { id: "stocks", label: "Equities", icon: LineChart, desc: "Stocks & ETFs" },
                    { id: "commodities", label: "Commodities", icon: Building, desc: "Gold, Silver, Oil" }
                  ].map((item) => {
                    const isSelected = preferences.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                        onClick={() => togglePreference(item.id)}
                      >
                        <item.icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handlePreferencesSubmit} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Continue
                </Button>
              </CardFooter>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>We need this information to verify your identity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Full Name</Label>
                  <Input id="legalName" value={profile.legalName} onChange={e => setProfile({...profile, legalName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={profile.dateOfBirth} onChange={e => setProfile({...profile, dateOfBirth: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <Input id="address" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" value={profile.postalCode} onChange={e => setProfile({...profile, postalCode: e.target.value})} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={handleProfileSubmit} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Continue
                </Button>
              </CardFooter>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Country of Residence</CardTitle>
                <CardDescription>Confirm your country of residence for tax purposes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={profile.country} onValueChange={v => setProfile({...profile, country: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Continue</Button>
              </CardFooter>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>Choose an identity document to upload.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: "passport", label: "Passport" },
                    { id: "drivers_license", label: "Driver's License" },
                    { id: "national_id", label: "National ID Card" }
                  ].map(type => (
                    <div 
                      key={type.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${idType === type.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setIdType(type.id)}
                    >
                      <span className="font-medium">{type.label}</span>
                      {idType === type.id && <CheckCircle2 className="text-primary w-5 h-5" />}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Continue</Button>
              </CardFooter>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle>Upload ID (Front)</CardTitle>
                <CardDescription>Upload a clear photo of the front of your {idType.replace('_', ' ')}.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mb-4">PNG, JPG or PDF (max. 10MB)</p>
                  <Input 
                    type="file" 
                    className="hidden" 
                    id="id-front"
                    onChange={e => setIdFront(e.target.files?.[0] || null)}
                  />
                  <Button asChild variant="outline">
                    <Label htmlFor="id-front">Select File</Label>
                  </Button>
                  {idFront && (
                    <p className="mt-4 text-sm font-medium text-primary flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> {idFront.name}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={() => handleIdUpload("front")} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Upload & Continue
                </Button>
              </CardFooter>
            </>
          )}

          {step === 6 && (
            <>
              <CardHeader>
                <CardTitle>Upload ID (Back)</CardTitle>
                <CardDescription>Upload a clear photo of the back of your document.</CardDescription>
              </CardHeader>
              <CardContent>
                {idType === "passport" ? (
                  <div className="p-8 text-center bg-muted/30 rounded-xl">
                    <p className="text-muted-foreground">Passports do not require a back upload.</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="id-back"
                      onChange={e => setIdBack(e.target.files?.[0] || null)}
                    />
                    <Button asChild variant="outline">
                      <Label htmlFor="id-back">Select File</Label>
                    </Button>
                    {idBack && (
                      <p className="mt-4 text-sm font-medium text-primary flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> {idBack.name}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={() => handleIdUpload("back")} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {idType === "passport" ? "Skip & Continue" : "Upload & Continue"}
                </Button>
              </CardFooter>
            </>
          )}

          {step === 7 && (
            <>
              <CardHeader>
                <CardTitle>Liveness Check</CardTitle>
                <CardDescription>We need to verify that you are a real person.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center overflow-hidden relative border border-border">
                  <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-medium">Camera access required</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs text-center">
                    Please ensure you are in a well-lit area and remove any hats or sunglasses.
                  </p>
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-xl pointer-events-none"></div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={handleSelfieUpload} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Start Verification
                </Button>
              </CardFooter>
            </>
          )}

          {step === 8 && (
            <>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Please review your information before final submission.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Personal Details</h4>
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{profile.legalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium">{profile.country}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Documents</h4>
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">ID Type:</span>
                      <span className="font-medium">{idType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-green-600 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Uploaded
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>Back</Button>
                <Button onClick={handleFinalSubmit} disabled={loading} size="lg" className="px-8">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Application
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
