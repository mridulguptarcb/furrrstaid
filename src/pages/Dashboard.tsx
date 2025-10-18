import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { userAPI } from "@/services/api";
import { useEffect, useState } from "react";
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
  MapPin,
  Loader2,
  Bell,
  Stethoscope,
  Syringe,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Header from "@/components/Header";
import { petAPI, Pet, alertsAPI, UpcomingAlert, checkupReminderAPI, vaccinationAPI } from "@/services/api";

const Dashboard = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingAlerts, setUpcomingAlerts] = useState<UpcomingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await userAPI.getUserName();
        if (response && response.name) {
          setUserName(response.name);
          console.log("User name fetched successfully:", response.name);
        } else {
          console.error("User name not found in response:", response);
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error);
      }
    };

    fetchUserName();
  }, []);

  // Load pets and alerts from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [petsData, alertsData] = await Promise.all([
          petAPI.getPets(),
          alertsAPI.getUpcomingAlerts(7)
        ]);
        setPets(petsData);
        setUpcomingAlerts(alertsData);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter alerts to show only those within 7 days
  const alertsWithin7Days = upcomingAlerts.filter(alert => alert.days_until_due <= 7);

  // Helper function to get alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "checkup": return <Stethoscope className="h-5 w-5" />;
      case "vaccination": return <Syringe className="h-5 w-5" />;
      case "weight": return <Activity className="h-5 w-5" />;
      case "dental": return <Activity className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const handleMarkDone = async (alert: UpcomingAlert) => {
    try {
      setMarkingIds(prev => new Set(prev).add(alert.id));
      if (alert.type === "checkup") {
        const reminderId = parseInt(alert.id.replace("checkup_", ""));
        await checkupReminderAPI.updateCheckupReminder(reminderId, { is_completed: true });
      } else if (alert.type === "vaccination") {
        const vaccinationId = parseInt(alert.id.replace("vaccination_", ""));
        // Mark scheduled vaccination as administered now
        await vaccinationAPI.updateVaccination(vaccinationId, {
          is_scheduled: false,
          // record administration time as now
          // backend expects datetime string
          date_administered: new Date().toISOString(),
        } as any);
      }
      setUpcomingAlerts(prev => prev.filter(a => a.id !== alert.id));
    } catch (err) {
      console.error("Failed to mark reminder done", err);
    } finally {
      setMarkingIds(prev => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  };

  // Helper function to get alert color
  const getAlertColor = (type: string, status: string) => {
    if (status === "overdue") return "bg-destructive/20 text-destructive";
    
    switch (type) {
      case "checkup": return "bg-blue-500/20 text-blue-600";
      case "vaccination": return "bg-green-500/20 text-green-600";
      case "weight": return "bg-orange-500/20 text-orange-600";
      case "dental": return "bg-purple-500/20 text-purple-600";
      default: return "bg-gray-500/20 text-gray-600";
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Helper function to format time until due
  const formatTimeUntilDue = (daysUntilDue: number) => {
    if (daysUntilDue === 0) return "Today";
    if (daysUntilDue === 1) return "Tomorrow";
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    return `In ${daysUntilDue} days`;
  };

  // Helper function to format age
  const formatAge = (years: number, months: number) => {
    if (years === 0 && months === 0) return "Less than 1 month";
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  // Helper function to determine health status
  const getHealthStatus = (pet: Pet) => {
    // Simple logic - could be enhanced based on vaccination dates, medical notes, etc.
    if (pet.next_vaccination_due) {
      const dueDate = new Date(pet.next_vaccination_due);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 7) return "warning";
    }
    return "healthy";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userName || "Pet Parent"}! 👋</h1>
              <p className="text-muted-foreground">Here's what's happening with your furry friends</p>
            </div>
            <Link to="/add-pet">
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{alertsWithin7Days.length}</div>
                  <Bell className="h-8 w-8 text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
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
            {pets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No pets added yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first furry friend to get personalized care recommendations.
                  </p>
                  <Link to="/add-pet">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Pet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pets.map((pet) => {
                  const healthStatus = getHealthStatus(pet);
                  return (
                    <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {pet.species === "Dog" ? (
                                <Dog className="h-6 w-6 text-primary" />
                              ) : pet.species === "Cat" ? (
                                <Cat className="h-6 w-6 text-primary" />
                              ) : (
                                <Heart className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div>
                              <CardTitle>{pet.name}</CardTitle>
                              <CardDescription>{pet.breed} • {formatAge(pet.age_years, pet.age_months)}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={healthStatus === "healthy" ? "default" : "destructive"}>
                            {healthStatus === "healthy" ? "Healthy" : "Attention"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-semibold">{pet.weight_kg} kg</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Gender</span>
                          <span className="font-semibold">{pet.gender}</span>
                        </div>
                        {pet.next_vaccination_due && (
                          <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                            <Calendar className="h-4 w-4 text-secondary" />
                            <span>Next vaccination due: {new Date(pet.next_vaccination_due).toLocaleDateString()}</span>
                          </div>
                        )}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Upcoming Alerts & Reminders
              </CardTitle>
              <CardDescription>All upcoming events within the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsWithin7Days.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up! 🎉</h3>
                  <p className="text-muted-foreground mb-4">
                    No upcoming alerts or reminders in the next 7 days.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertsWithin7Days.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full ${getAlertColor(alert.type, alert.status)} flex items-center justify-center`}>
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-lg">{alert.title}</span>
                                <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                                  {alert.priority}
                                </Badge>
                                {alert.status === "overdue" && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>{alert.pet_name}</strong> • {new Date(alert.due_date).toLocaleDateString()} at {alert.due_time}
                              </p>
                              {alert.location && (
                                <p className="text-xs text-muted-foreground">
                                  📍 {alert.location}
                                </p>
                              )}
                              {alert.veterinarian && (
                                <p className="text-xs text-muted-foreground">
                                  👨‍⚕️ {alert.veterinarian}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                alert.status === "overdue" ? "text-destructive" :
                                alert.days_until_due <= 1 ? "text-orange-600" :
                                "text-muted-foreground"
                              }`}>
                                {formatTimeUntilDue(alert.days_until_due)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/pet/${alert.pet_id}`}>
                                <Activity className="mr-2 h-4 w-4" />
                                View Pet
                              </Link>
                            </Button>
                            {alert.type === "checkup" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/pet/${alert.pet_id}/checkup-reminder`}>
                                  <Stethoscope className="mr-2 h-4 w-4" />
                                  Reschedule
                                </Link>
                              </Button>
                            )}
                            {alert.type === "vaccination" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/pet/${alert.pet_id}/vaccinations`}>
                                  <Syringe className="mr-2 h-4 w-4" />
                                  Schedule
                                </Link>
                              </Button>
                            )}
                            {(alert.type === "checkup" || alert.type === "vaccination") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleMarkDone(alert)}
                                disabled={markingIds.has(alert.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {markingIds.has(alert.id) ? "Marking..." : "Mark Done"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
