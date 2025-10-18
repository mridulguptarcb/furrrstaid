import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Heart, 
  Calendar, 
  Activity,
  AlertCircle,
  FileText,
  Syringe,
  Scale,
  Edit,
  Trash2,
  Dog,
  Cat,
  Bird,
  Rabbit,
  ArrowLeft,
  Loader2,
  Bell,
  BellRing,
  Plus,
  Settings,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import Header from "@/components/Header";
import { petAPI, Pet, vaccinationAPI, Vaccination, checkupReminderAPI, CheckupReminder } from "@/services/api";

const PetProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [reminders, setReminders] = useState<CheckupReminder[]>([]);
  const [scheduledVaccinations, setScheduledVaccinations] = useState<Vaccination[]>([]);

  // Delete functions
  const handleDeleteCheckupReminder = async (reminderId: number) => {
    try {
      await checkupReminderAPI.deleteCheckupReminder(reminderId);
      // Remove from local state
      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
    } catch (error) {
      console.error("Error deleting checkup reminder:", error);
    }
  };

  const handleDeleteScheduledVaccination = async (vaccinationId: number) => {
    try {
      await vaccinationAPI.deleteVaccination(vaccinationId);
      // Remove from local state
      setScheduledVaccinations(prev => prev.filter(vaccination => vaccination.id !== vaccinationId));
    } catch (error) {
      console.error("Error deleting scheduled vaccination:", error);
    }
  };

  // Load pet data and related data from API
  useEffect(() => {
    const loadPetData = async () => {
      if (!id) {
        setError("Pet ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [petData, vaccinationsData, remindersData, scheduledVaccinationsData] = await Promise.all([
          petAPI.getPet(parseInt(id)),
          vaccinationAPI.getVaccinations(parseInt(id), false), // Get administered vaccinations
          checkupReminderAPI.getCheckupReminders(parseInt(id)),
          vaccinationAPI.getVaccinations(parseInt(id), true) // Get scheduled vaccinations
        ]);
        setPet(petData);
        setVaccinations(vaccinationsData);
        setReminders(remindersData);
        setScheduledVaccinations(scheduledVaccinationsData);
      } catch (err) {
        setError("Failed to load pet data");
        console.error("Error loading pet:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPetData();
  }, [id]);

  const handleDelete = async () => {
    if (!pet) return;

    try {
      setDeleting(true);
      await petAPI.deletePet(pet.id);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting pet:", err);
    } finally {
      setDeleting(false);
    }
  };

  const formatAge = (years: number, months: number) => {
    if (years === 0 && months === 0) return "Less than 1 month";
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog':
        return <Dog className="h-16 w-16 text-white" />;
      case 'cat':
        return <Cat className="h-16 w-16 text-white" />;
      case 'bird':
        return <Bird className="h-16 w-16 text-white" />;
      case 'rabbit':
        return <Rabbit className="h-16 w-16 text-white" />;
      default:
        return <Heart className="h-16 w-16 text-white" />;
    }
  };

  const getHealthStatus = (pet: Pet) => {
    if (pet.next_vaccination_due) {
      const dueDate = new Date(pet.next_vaccination_due);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 0) return { status: "overdue", label: "Overdue", variant: "destructive" as const };
      if (daysUntilDue <= 7) return { status: "due-soon", label: "Due Soon", variant: "secondary" as const };
    }
    return { status: "healthy", label: "Healthy", variant: "default" as const };
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

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">{error || "Pet not found"}</p>
                <Button onClick={() => navigate("/dashboard")} className="mt-4">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(pet);

  // Build timeline from completed checkup reminders and administered vaccinations
  const completedReminders = reminders.filter(r => r.is_completed);
  const administeredVaccinations = vaccinations.filter(v => !!v.date_administered);

  type TimelineItem = {
    id: string;
    dateISO: string;
    title: string;
    type: "checkup" | "vaccination";
    description?: string;
    provider?: string;
    time?: string;
  };

  const timelineItems: TimelineItem[] = [
    ...completedReminders.map(r => ({
      id: `checkup-${r.id}`,
      dateISO: r.due_date,
      title: r.title,
      type: "checkup" as const,
      description: r.description,
      provider: r.vet_name || pet?.vet_name,
      time: r.due_time,
    })),
    ...administeredVaccinations.map(v => ({
      id: `vaccination-${v.id}`,
      dateISO: v.date_administered as string,
      title: v.vaccine_name,
      type: "vaccination" as const,
      description: v.notes,
      provider: v.veterinarian || pet?.vet_name,
    })),
  ].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

  const getVaccinationStatus = (nextDueDate: string) => {
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) return { status: "overdue", label: "Overdue", variant: "destructive" as const };
    if (daysUntilDue <= 30) return { status: "due-soon", label: "Due Soon", variant: "secondary" as const };
    return { status: "current", label: "Current", variant: "default" as const };
  };

  const getReminderStatus = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) return { status: "overdue", label: "Overdue", variant: "destructive" as const };
    if (daysUntilDue <= 7) return { status: "due-soon", label: "Due Soon", variant: "secondary" as const };
    return { status: "upcoming", label: "Upcoming", variant: "default" as const };
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "annual":
      case "routine": return <Stethoscope className="h-5 w-5" />;
      case "dental": return <Activity className="h-5 w-5" />;
      case "emergency": return <AlertCircle className="h-5 w-5" />;
      case "specialist": return <Stethoscope className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case "annual":
      case "routine": return "bg-blue-500/10 text-blue-600";
      case "dental": return "bg-purple-500/10 text-purple-600";
      case "emergency": return "bg-red-500/10 text-red-600";
      case "specialist": return "bg-orange-500/10 text-orange-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const documents = [
    { id: 1, name: "Vaccination Certificate.pdf", date: "2024-09-20", size: "245 KB" },
    { id: 2, name: "Health Report - Annual.pdf", date: "2024-12-15", size: "512 KB" },
    { id: 3, name: "Microchip Registration.pdf", date: "2021-04-01", size: "128 KB" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Pet Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  {getSpeciesIcon(pet.species)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold">{pet.name}</h1>
                        <Badge variant={healthStatus.variant}>
                          {healthStatus.label}
                        </Badge>
                      </div>
                      <p className="text-xl text-muted-foreground">{pet.breed} • {formatAge(pet.age_years, pet.age_months)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="lg" onClick={() => navigate(`/edit-pet/${pet.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="lg">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Pet Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {pet.name}'s profile? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={deleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deleting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-6 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Species</p>
                      <p className="font-semibold">{pet.species}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Gender</p>
                      <p className="font-semibold">{pet.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Weight</p>
                      <p className="font-semibold">{pet.weight_kg} kg</p>
                    </div>
                    {pet.color && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Color</p>
                        <p className="font-semibold">{pet.color}</p>
                      </div>
                    )}
                    {pet.microchip_id && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Microchip ID</p>
                        <p className="font-mono text-sm">{pet.microchip_id}</p>
                      </div>
                    )}
                    {pet.birth_date && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Birth Date</p>
                        <p className="font-semibold">{new Date(pet.birth_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {(pet.allergies || pet.medical_notes || pet.special_needs) && (
                    <div className="mt-6 space-y-3">
                      {pet.allergies && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-destructive mb-1">Allergies</p>
                              <p className="text-sm">{pet.allergies}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {pet.special_needs && (
                        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-secondary mb-1">Special Needs</p>
                              <p className="text-sm">{pet.special_needs}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            <Link to={`/emergency?pet=${pet.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Emergency</h3>
                    <p className="text-sm text-muted-foreground">Get help now</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to={`/pet/${pet.id}/checkup-reminder`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Checkup Reminder</h3>
                    <p className="text-sm text-muted-foreground">Set health checkup</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to={`/pet/${pet.id}/vaccinations`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Syringe className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Vaccinations</h3>
                    <p className="text-sm text-muted-foreground">Record & schedule</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to={`/pet/${pet.id}/weight`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scale className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Log Weight</h3>
                    <p className="text-sm text-muted-foreground">Track progress</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Veterinary Information */}
          {(pet.vet_name || pet.vet_phone || pet.emergency_contact) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Veterinary Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {pet.vet_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Veterinarian</p>
                        <p className="font-semibold">{pet.vet_name}</p>
                      </div>
                    </div>
                  )}
                  {pet.vet_phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold">{pet.vet_phone}</p>
                      </div>
                    </div>
                  )}
                  {pet.emergency_contact && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-semibold">{pet.emergency_contact}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Health Timeline</CardTitle>
                  <CardDescription>Shows completed checkups and administered vaccinations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timelineItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === "checkup" ? "bg-primary/10" : "bg-secondary/10"}`}>
                            {item.type === "checkup" ? (
                              <Activity className="h-5 w-5 text-primary" />
                            ) : (
                              <Syringe className="h-5 w-5 text-secondary" />
                            )}
                          </div>
                          <div className="w-0.5 h-full bg-border min-h-[60px]" />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{item.title}</h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.dateISO).toLocaleDateString()} {item.time ? `at ${item.time}` : ""}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          {item.provider && (
                            <p className="text-xs text-muted-foreground">Provider: {item.provider}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {timelineItems.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No completed reminders yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccinations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Syringe className="h-5 w-5" />
                    Received Vaccinations
                  </CardTitle>
                  <CardDescription>Track all administered immunizations and their records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vaccinations.map((vaccination) => {
                      const status = vaccination.next_due_date ? getVaccinationStatus(vaccination.next_due_date) : { status: "current", label: "Current", variant: "default" as const };
                      return (
                        <div key={vaccination.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                <Syringe className="h-5 w-5 text-secondary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{vaccination.vaccine_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Administered: {vaccination.date_administered ? new Date(vaccination.date_administered).toLocaleDateString() : "Not administered"}
                                </p>
                                {vaccination.veterinarian && (
                                  <p className="text-xs text-muted-foreground">
                                    By: {vaccination.veterinarian}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {vaccination.next_due_date && (
                              <div>
                                <p className="text-muted-foreground">Next Due Date:</p>
                                <p className="font-medium">{new Date(vaccination.next_due_date).toLocaleDateString()}</p>
                              </div>
                            )}
                            {vaccination.batch_number && (
                              <div>
                                <p className="text-muted-foreground">Batch Number:</p>
                                <p className="font-mono text-xs">{vaccination.batch_number}</p>
                              </div>
                            )}
                          </div>
                          
                          {vaccination.notes && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-md">
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {vaccination.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {vaccinations.length === 0 && (
                      <div className="text-center py-8">
                        <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No vaccinations recorded yet</p>
                        <Button asChild>
                          <Link to={`/pet/${pet.id}/vaccinations`}>
                            <Syringe className="mr-2 h-4 w-4" />
                            Record First Vaccination
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders">
              <div className="space-y-6">
                {/* Set Reminders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Set Reminders
                    </CardTitle>
                    <CardDescription>View and manage all your pet care reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Checkup Reminders */}
                      {reminders.map((reminder) => {
                        const status = getReminderStatus(reminder.due_date);
                        return (
                          <div key={`checkup-${reminder.id}`} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${getReminderColor(reminder.checkup_type)} flex items-center justify-center`}>
                                  {getReminderIcon(reminder.checkup_type)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{reminder.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Due: {new Date(reminder.due_date).toLocaleDateString()} at {reminder.due_time}
                                  </p>
                                  {reminder.location && (
                                    <p className="text-xs text-muted-foreground">
                                      Location: {reminder.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {reminder.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Checkup
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {reminder.vet_name && (
                                <div>
                                  <p className="text-muted-foreground">Veterinarian:</p>
                                  <p className="font-medium">{reminder.vet_name}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground">Reminder:</p>
                                <p className="font-medium">
                                  {reminder.reminder_enabled 
                                    ? `${reminder.reminder_hours} hours before`
                                    : "Disabled"
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {reminder.notes && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {reminder.notes}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Bell className="mr-2 h-4 w-4" />
                                Reschedule
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Checkup Reminder</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this checkup reminder? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteCheckupReminder(reminder.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}

                      {/* Scheduled Vaccinations */}
                      {scheduledVaccinations.map((vaccination) => {
                        const status = getReminderStatus(vaccination.scheduled_date!);
                        return (
                          <div key={`vaccination-${vaccination.id}`} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                  <Syringe className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{vaccination.vaccine_name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Scheduled: {new Date(vaccination.scheduled_date!).toLocaleDateString()} at {vaccination.scheduled_time}
                                  </p>
                                  {vaccination.location && (
                                    <p className="text-xs text-muted-foreground">
                                      Location: {vaccination.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={status.variant}>
                                  {status.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  high
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Vaccination
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {vaccination.veterinarian && (
                                <div>
                                  <p className="text-muted-foreground">Veterinarian:</p>
                                  <p className="font-medium">{vaccination.veterinarian}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-muted-foreground">Reminder:</p>
                                <p className="font-medium">
                                  {vaccination.reminder_enabled 
                                    ? `${vaccination.reminder_hours} hours before`
                                    : "Disabled"
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {vaccination.notes && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {vaccination.notes}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Bell className="mr-2 h-4 w-4" />
                                Reschedule
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Scheduled Vaccination</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this scheduled vaccination? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteScheduledVaccination(vaccination.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        );
                      })}
                      
                      {reminders.length === 0 && scheduledVaccinations.length === 0 && (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No reminders set yet</p>
                          <div className="flex gap-2 justify-center">
                            <Button asChild>
                              <Link to={`/pet/${pet.id}/checkup-reminder`}>
                                <Stethoscope className="mr-2 h-4 w-4" />
                                Set Checkup Reminder
                              </Link>
                            </Button>
                            <Button asChild variant="outline">
                              <Link to={`/pet/${pet.id}/vaccinations`}>
                                <Syringe className="mr-2 h-4 w-4" />
                                Schedule Vaccination
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                        <Link to={`/pet/${pet.id}/checkup-reminder`}>
                          <Stethoscope className="h-6 w-6" />
                          <span>Set Checkup Reminder</span>
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                        <Link to={`/pet/${pet.id}/vaccinations`}>
                          <Syringe className="h-6 w-6" />
                          <span>Schedule Vaccination</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Documents</CardTitle>
                  <CardDescription>Certificates, reports, and records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(doc.date).toLocaleDateString()} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4">
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PetProfile;
