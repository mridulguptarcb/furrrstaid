import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Plus, 
  AlertCircle, 
  Calendar, 
  Activity,
  Settings,
  LogOut,
  Dog,
  Cat,
  MapPin
} from "lucide-react";
import Header from "@/components/Header";

const Dashboard = () => {
  // Mock pet data
  const pets = [
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
      nextVaccine: "Rabies - Due in 14 days",
      weight: "32 kg",
      status: "healthy"
    },
    {
      id: 2,
      name: "Luna",
      species: "Cat",
      breed: "Persian",
      age: "2 years",
      nextVaccine: "FVRCP - Due in 7 days",
      weight: "4.5 kg",
      status: "warning"
    }
  ];

  const recentAlerts = [
    { id: 1, pet: "Luna", message: "Vaccination reminder: FVRCP due in 7 days", time: "2 hours ago", type: "warning" },
    { id: 2, pet: "Max", message: "Annual checkup scheduled for next week", time: "1 day ago", type: "info" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, Pet Parent! 👋</h1>
              <p className="text-muted-foreground">Here's what's happening with your furry friends</p>
            </div>
            <Link to="/dashboard/add-pet">
              <Button variant="hero" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add New Pet
              </Button>
            </Link>
          </div>

          {/* Emergency Quick Access */}
          <Card className="mb-8 bg-gradient-to-br from-destructive/10 to-secondary/10 border-2 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Emergency Assistance</h3>
                    <p className="text-muted-foreground">Quick access to first-aid guidance when you need it most</p>
                  </div>
                </div>
                <Link to="/emergency">
                  <Button variant="emergency" size="lg">
                    Get Help Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{pets.length}</div>
                  <Heart className="h-8 w-8 text-primary" fill="currentColor" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Vaccines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">2</div>
                  <Calendar className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-primary">Good</div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Your Pets */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Pets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pets.map((pet) => (
                <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {pet.species === "Dog" ? (
                            <Dog className="h-6 w-6 text-primary" />
                          ) : (
                            <Cat className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <CardTitle>{pet.name}</CardTitle>
                          <CardDescription>{pet.breed} • {pet.age}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={pet.status === "healthy" ? "default" : "destructive"}>
                        {pet.status === "healthy" ? "Healthy" : "Attention"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-semibold">{pet.weight}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{pet.nextVaccine}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link to={`/pet/${pet.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                      <Link to={`/emergency?pet=${pet.id}`}>
                        <Button variant="secondary">
                          Emergency
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts & Reminders</CardTitle>
              <CardDescription>Stay on top of your pets' health needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.type === "warning" ? "bg-secondary/20" : "bg-primary/20"
                    }`}>
                      {alert.type === "warning" ? (
                        <AlertCircle className="h-5 w-5 text-secondary" />
                      ) : (
                        <Calendar className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{alert.pet}</span>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Link to="/vets">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Find Nearby Vets</h3>
                    <p className="text-sm text-muted-foreground">Emergency clinics & hospitals</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Settings</h3>
                    <p className="text-sm text-muted-foreground">Preferences & notifications</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
