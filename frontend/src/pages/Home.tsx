import { Link } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Clock, MapPin, Shield, Activity, Phone, MessageSquare, Star } from "lucide-react";
import Header from "@/components/Header";
import heroImage from "@/assets/hero-image.jpg";
import featureVet from "@/assets/feature-vet.jpg";
import featureCare from "@/assets/feature-care.jpg";
import { useState, useEffect } from "react";
import { statsAPI } from "@/services/api";
import { buildApiUrl } from "@/lib/config";
import FeedbackForm from "@/components/FeedbackForm";

const Home = () => {
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [geminiCallCount, setGeminiCallCount] = useState(0);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const userResponse = await fetch(buildApiUrl("/stats/user-count"));
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserCount(userData.count);
        }
        
        // Fetch Gemini API call count
        const geminiData = await statsAPI.getGeminiCallCount();
        setGeminiCallCount(geminiData.count);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  🐾 Your Pet's Health Guardian
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                FurrstAid
                <span className="block text-primary mt-2">First-aid when every second matters</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                Calm guidance, expert advice, and instant access to emergency care, all in your pocket. Because your pet deserves the best, always.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/auth">
                  <Button variant="hero" size="lg" className="animate-bounce-gentle">
                    Get Emergency Help
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="lg">
                    Add Your Pet
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>
                    {isLoading 
                      ? "Loading..." 
                      : `Trusted by ${userCount}+ pet parents`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-secondary" fill="currentColor" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Happy golden retriever with caring veterinarian in modern clinic" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-xl p-4 shadow-xl border border-border animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{geminiCallCount} Lives Saved</p>
                    <p className="text-sm text-muted-foreground">Emergency AI Assists</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4">Help in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground">
              Emergency guidance designed for clarity under pressure
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Heart,
                title: "Select Your Pet",
                description: "Quick access to your pet's profile, medical history, and allergies"
              },
              {
                step: "02",
                icon: Activity,
                title: "Describe Symptoms",
                description: "Simple buttons or voice input to quickly describe what's happening"
              },
              {
                step: "03",
                icon: Phone,
                title: "Follow Guidance",
                description: "Clear, numbered steps with instant vet contact if needed"
              }
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="absolute top-0 right-0 text-8xl font-bold text-gray-500 -mr-4 -mt-4">
                    {item.step}
                  </div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Expert Veterinary Network</h2>
              <p className="text-lg text-muted-foreground">
                Find trusted, verified vets near you with real-time availability, ratings, and one-tap calling for emergencies.
              </p>
              <ul className="space-y-3">
                {[
                  "24/7 emergency hotline access",
                  "GPS-powered vet location finder",
                  "User reviews and ratings",
                  "Direct call and directions"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-4 w-4 text-primary" fill="currentColor" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/vets">
                <Button variant="default" size="lg">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Vets Near You
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={featureVet} 
                alt="Veterinarian examining a cute cat in a modern clinic" 
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img 
                src={featureCare} 
                alt="Happy pet owner hugging their healthy dog" 
                className="rounded-2xl shadow-xl w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl font-bold">Complete Health Tracking</h2>
              <p className="text-lg text-muted-foreground">
                Never miss a vaccination, keep medical records organized, and track your pet's health journey all in one place.
              </p>
              <ul className="space-y-3">
                {[
                  "Vaccination reminders & calendar",
                  "Medical history timeline",
                  "Document storage (PDFs, images)",
                  "Weight & health tracking"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-secondary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg">
                  Start Tracking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Feedback Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground">
              Connect with other pet parents and help us improve
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feedback Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setIsFeedbackOpen(true)}>
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Share Your Feedback</h3>
                <p className="text-muted-foreground">
                  Help us improve FurrstAid by sharing your experience and suggestions
                </p>
                <Button variant="outline" className="mt-4">
                  Open Feedback Form
                </Button>
              </CardContent>
            </Card>
            
            {/* Community Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">Community Forum</h3>
                <p className="text-muted-foreground">
                  Connect with other pet parents, share stories, and learn from each other
                </p>
                <Link to="/community">
                  <Button variant="outline" className="mt-4">
                    Visit Community
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary -z-10" />
        <div className="container mx-auto text-center text-muted-foreground">
          <h2 className="text-4xl font-bold mb-4">Ready to Protect Your Best Friend?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of pet parents who trust FurrstAid for peace of mind
          </p>
          <Link to="/auth">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
            >
              Get Started — It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Feedback Form */}
      <FeedbackForm isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      
      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                <span className="text-lg font-bold">FurrstAid</span>
              </div>
              <p className="text-sm text-muted-foreground">
                First-aid for pets, when every second matters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/emergency" className="hover:text-primary transition-colors">Emergency</Link></li>
                <li><Link to="/vets" className="hover:text-primary transition-colors">Find Vets</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 FurrstAid. All rights reserved. • contact@petaid.plus</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
