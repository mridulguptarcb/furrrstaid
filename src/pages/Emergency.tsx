import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Phone, 
  MapPin, 
  ChevronRight,
  Droplet,
  Activity,
  Pill,
  Heart,
  Scissors,
  Zap,
  Dog,
  Cat,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { petAPI, Pet } from "@/services/api";

const Emergency = () => {
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [customEmergency, setCustomEmergency] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<string>("");

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const petsData = await petAPI.getPets();
        setPets(petsData);
      } catch (err) {
        setError('Failed to load pets. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load your pets. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [toast]);

  const emergencyTypes = [
    { id: "bleeding", icon: Droplet, label: "Bleeding", color: "text-red-500", severity: "high" },
    { id: "choking", icon: Activity, label: "Choking", color: "text-red-500", severity: "high" },
    { id: "poisoning", icon: Pill, label: "Poisoning", color: "text-red-500", severity: "high" },
    { id: "seizure", icon: Zap, label: "Seizure", color: "text-orange-500", severity: "high" },
    { id: "injury", icon: Scissors, label: "Injury/Trauma", color: "text-orange-500", severity: "medium" },
    { id: "heatstroke", icon: Heart, label: "Heatstroke", color: "text-orange-500", severity: "high" }
  ];

  const getGuidance = (symptom: string) => {
    const guidance: Record<string, any> = {
      bleeding: {
        triage: "red",
        steps: [
          "Stay calm and keep your pet calm",
          "Apply firm pressure with a clean cloth or gauze",
          "If bleeding soaks through, add more cloth on top (don't remove the first layer)",
          "Keep pressure for 5-10 minutes",
          "If bleeding is severe or doesn't stop, call your vet immediately"
        ],
        donts: [
          "Don't use cotton balls (fibers can stick)",
          "Don't apply a tourniquet unless instructed by a vet",
          "Don't try to clean a deep wound yourself"
        ],
        urgency: "Call your vet immediately if bleeding is heavy, won't stop, or from mouth/nose"
      },
      choking: {
        triage: "red",
        steps: [
          "Check if the pet can breathe — look for chest movement",
          "If conscious, open their mouth and look for visible obstruction",
          "If you see it and can safely remove it, do so gently",
          "For dogs: Perform the Heimlich — sharp thrusts just below ribcage",
          "For cats: Hold upside down and give 4 firm back blows",
          "Call your vet immediately and head there now"
        ],
        donts: [
          "Don't blindly reach into throat (you may push object deeper)",
          "Don't give water if choking",
          "Don't delay — this is life-threatening"
        ],
        urgency: "This is a critical emergency. Call vet NOW and drive there immediately"
      },
      poisoning: {
        triage: "red",
        steps: [
          "Identify what they ingested if possible (keep packaging)",
          "Call Pet Poison Helpline or your vet immediately",
          "Do NOT induce vomiting unless instructed",
          "If substance is on fur/skin, rinse with lukewarm water",
          "Keep your pet warm and calm",
          "Bring the substance packaging/sample to the vet"
        ],
        donts: [
          "Don't induce vomiting without vet guidance",
          "Don't give milk or food",
          "Don't wait for symptoms to worsen"
        ],
        urgency: "Call vet or poison control immediately — have product details ready"
      }
    };

    return guidance[symptom] || guidance.bleeding;
  };

  const callGemini = async (prompt: string) => {
    const res = await fetch(`http://localhost:8000/api/ai/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Gemini request failed");
    const data = await res.json();
    const text = data?.text || "No advice generated.";
    return text as string;
  };

  const handleCallVet = () => {
    toast({
      title: "Calling Emergency Vet",
      description: "Connecting you to the nearest 24/7 emergency clinic...",
    });
  };

  if (selectedSymptom && selectedPet && !loading) {
    const guidance = getGuidance(selectedSymptom);
    const pet = pets.find(p => p.id === selectedPet);

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => {
                setSelectedSymptom(null);
                setSelectedPet(null);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Emergency Options
            </Button>

            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="destructive" className="uppercase">
                    {guidance.triage === "red" ? "High Priority" : "Urgent"}
                  </Badge>
                  <span className="text-muted-foreground">for {pet?.name}</span>
                </div>
                <CardTitle className="text-2xl">Emergency Guidance: {emergencyTypes.find(e => e.id === selectedSymptom)?.label}</CardTitle>
                <CardDescription className="text-base">
                  Follow these steps carefully. Stay calm — you're doing great.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Urgency Alert */}
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{guidance.urgency}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-full"
                    onClick={handleCallVet}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call Emergency Vet
                  </Button>
                  <Link to="/vets" className="w-full">
                    <Button variant="outline" size="lg" className="w-full">
                      <MapPin className="mr-2 h-5 w-5" />
                      Get Directions
                    </Button>
                  </Link>
                </div>

                {/* Step by Step */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Step-by-Step Instructions</h3>
                  <div className="space-y-3">
                    {guidance.steps.map((step: string, index: number) => (
                      <div key={index} className="flex gap-4 items-start p-4 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Don'ts */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-destructive">⚠️ Important Don'ts</h3>
                  <ul className="space-y-2">
                    {guidance.donts.map((dont: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                        <span>{dont}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground border border-border">
                  <p>
                    <strong className="text-foreground">Disclaimer:</strong> This guidance is for informational purposes only and is not a substitute for professional veterinary care. Always consult with a licensed veterinarian for medical advice.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-destructive/10 rounded-full mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Emergency Help</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quick access to first-aid guidance. Stay calm — we'll walk you through it step by step.
            </p>
          </div>

          {/* Pet Selection */}
          {!selectedPet && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>1. Select Your Pet</CardTitle>
                <CardDescription>Who needs help right now?</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading your pets...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-destructive font-medium mb-2">Failed to load pets</p>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : pets.length === 0 ? (
                  <div className="text-center py-8">
                    <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium mb-2">No pets found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need to add a pet first to use the emergency feature.
                    </p>
                    <Link to="/add-pet">
                      <Button>
                        Add Your First Pet
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {pets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPet(pet.id)}
                        className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {pet.species === "Dog" ? (
                            <Dog className="h-6 w-6 text-primary" />
                          ) : (
                            <Cat className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">{pet.breed}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Symptom Selection */}
          {selectedPet && !selectedSymptom && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>2. What's Happening?</CardTitle>
                    <CardDescription>Select the emergency type</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPet(null)}
                  >
                    Change Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedSymptom(type.id)}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-destructive hover:bg-destructive/5 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <type.icon className={`h-6 w-6 ${type.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{type.label}</h3>
                        {type.severity === "high" && (
                          <Badge variant="destructive" className="text-xs mt-1">Critical</Badge>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  ))}
                </div>

                {/* Custom Emergency */}
                <div className="mt-8 p-4 rounded-lg border border-border bg-muted/20">
                  <h4 className="font-semibold mb-2">Or describe your situation</h4>
                  <p className="text-sm text-muted-foreground mb-3">Enter a brief description of the emergency to get tailored first-aid guidance.</p>
                  <Textarea
                    placeholder="e.g., My dog ate chocolate about 20 minutes ago and is drooling."
                    value={customEmergency}
                    onChange={(e) => setCustomEmergency(e.target.value)}
                    rows={3}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      disabled={!customEmergency || aiLoading}
                      onClick={async () => {
                        try {
                          setAiLoading(true);
                          setAiAdvice("");
                          const pet = pets.find(p => p.id === selectedPet);
                          const species = pet?.species || "pet";
                          const prompt = `You are a veterinary first-aid assistant. Provide concise, safe, step-by-step guidance for the following custom emergency for a ${species}. Avoid diagnoses; focus on first-aid and when to call a vet. Situation: ${customEmergency}`;
                          const advice = await callGemini(prompt);
                          setAiAdvice(advice);
                        } catch (e) {
                          setAiAdvice("Failed to get advice. Please try again.");
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                    >
                      {aiLoading ? "Getting Advice..." : "Get Advice"}
                    </Button>
                    {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>

                  {aiAdvice && (
                    <div className="mt-4 p-4 rounded-lg bg-card border border-border">
                      <h5 className="font-semibold mb-2">AI First-Aid Guidance</h5>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">{aiAdvice}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Access Card */}
          {!selectedPet && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Need immediate help?</h3>
                    <p className="text-sm text-muted-foreground">If this is life-threatening, call a vet immediately</p>
                  </div>
                  <Button variant="destructive" size="lg" onClick={handleCallVet}>
                    <Phone className="mr-2 h-5 w-5" />
                    Call Emergency Vet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
