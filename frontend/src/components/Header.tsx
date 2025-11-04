import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Heart, MessageSquare, Phone, ShieldCheck } from "lucide-react";

const Header = () => {
  const { toast } = useToast();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasActivePass, setHasActivePass] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("furrstaid_vet_pass_active");
    setHasActivePass(stored === "true");
  }, []);

  const handlePay = async () => {
    setIsProcessingPayment(true);
    // Simulate payment flow
    await new Promise((r) => setTimeout(r, 1200));
    localStorage.setItem("furrstaid_vet_pass_active", "true");
    setHasActivePass(true);
    setIsProcessingPayment(false);
    toast({ title: "Payment successful", description: "Your Vet Connect pass is now active." });
  };

  const facetimeSupported = useMemo(() => {
    const ua = navigator.userAgent || "";
    return /Macintosh|iPhone|iPad|iPod/.test(ua);
  }, []);

  const startVideoCall = () => {
    if (!hasActivePass) return;
    if (facetimeSupported) {
      window.location.href = "facetime://support@furrstaid.vet";
    } else {
      toast({
        title: "Connecting to vet",
        description: "We will connect you via a secure web call.",
      });
      // Placeholder: navigate to vets page where web call could be initiated
      window.location.href = "/vets";
    }
  };

  const startChat = () => {
    if (!hasActivePass) return;
    // For now, route to Community chat as a placeholder
    window.location.href = "/community";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Heart className="h-8 w-8 text-primary" fill="currentColor" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FurrstAid
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/emergency" className="text-foreground/80 hover:text-primary transition-colors">
            Emergency
          </Link>
          <Link to="/vets" className="text-foreground/80 hover:text-primary transition-colors">
            Find Vets
          </Link>
          <Link to="/walk-service" className="text-foreground/80 hover:text-primary transition-colors">
            Walk Service
          </Link>
          <Link to="/diet" className="text-foreground/80 hover:text-primary transition-colors">
            Diet
          </Link>
          <Link to="/pet-crutch" className="text-foreground/80 hover:text-primary transition-colors">
            Pet Entrust
          </Link>
          <Link to="/dashboard" className="text-foreground/80 hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-sm">
                <Phone className="h-4 w-4 mr-2" />
                Connect to Vet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Connect to a Vet</DialogTitle>
                <DialogDescription>
                  Chat and video consults are available. Activate a pass to begin.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" /> Connect to speciaslised Vets
                    </CardTitle>
                    <CardDescription>Instant access to chat and video for your pet</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-semibold">₹499/hr</div>
                      <div className="text-xs text-muted-foreground">One-time consult</div>
                    </div>
                    {hasActivePass ? (
                      <Button variant="secondary" disabled>
                        
                      </Button>
                    ) : (
                      <Button onClick={handlePay} disabled={isProcessingPayment}>
                        {isProcessingPayment ? "Processing..." : "Pay to Connect"}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant={hasActivePass ? "default" : "outline"} disabled={!hasActivePass} onClick={startChat}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Chat Now
                  </Button>
                  <Button variant={hasActivePass ? "default" : "outline"} disabled={!hasActivePass} onClick={startVideoCall}>
                    <Phone className="h-4 w-4 mr-2" /> Video Call
                  </Button>
                </div>

                <Separator />

               
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => setIsConnectOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
