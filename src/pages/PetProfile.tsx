import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Calendar, 
  Activity,
  AlertCircle,
  FileText,
  Syringe,
  Scale,
  Edit,
  Dog,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";

const PetProfile = () => {
  const { id } = useParams();

  // Mock pet data
  const pet = {
    id: parseInt(id || "1"),
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    age: "3 years",
    dob: "2021-03-15",
    weight: "32 kg",
    microchipId: "982000123456789",
    status: "healthy",
    allergies: ["Chicken", "Dairy"],
    medicalNotes: "Sensitive stomach, requires grain-free diet"
  };

  const timeline = [
    {
      id: 1,
      date: "2024-12-15",
      type: "checkup",
      title: "Annual Health Checkup",
      description: "Complete physical examination. All vitals normal.",
      doctor: "Dr. Sarah Johnson"
    },
    {
      id: 2,
      date: "2024-09-20",
      type: "vaccine",
      title: "Rabies Vaccination",
      description: "Annual rabies vaccine administered. Next due: September 2025",
      doctor: "Dr. Michael Chen"
    },
    {
      id: 3,
      date: "2024-06-10",
      type: "incident",
      title: "Minor Cut on Paw",
      description: "Small cut treated and bandaged. Healed completely in 5 days.",
      doctor: "Dr. Sarah Johnson"
    }
  ];

  const vaccinations = [
    { name: "Rabies", lastDate: "2024-09-20", nextDate: "2025-09-20", status: "current" },
    { name: "DHPP (Distemper)", lastDate: "2024-03-15", nextDate: "2025-03-15", status: "due-soon" },
    { name: "Bordetella", lastDate: "2023-12-01", nextDate: "2024-12-01", status: "overdue" },
    { name: "Leptospirosis", lastDate: "2024-09-20", nextDate: "2025-09-20", status: "current" }
  ];

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
                  <Dog className="h-16 w-16 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-bold">{pet.name}</h1>
                        <Badge variant={pet.status === "healthy" ? "default" : "destructive"}>
                          {pet.status === "healthy" ? "Healthy" : "Attention Needed"}
                        </Badge>
                      </div>
                      <p className="text-xl text-muted-foreground">{pet.breed} • {pet.age}</p>
                    </div>
                    <Button variant="outline" size="lg">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-6 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                      <p className="font-semibold">{new Date(pet.dob).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Weight</p>
                      <p className="font-semibold">{pet.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Microchip ID</p>
                      <p className="font-mono text-sm">{pet.microchipId}</p>
                    </div>
                  </div>

                  {pet.allergies.length > 0 && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-destructive mb-1">Allergies</p>
                          <p className="text-sm">{pet.allergies.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
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
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Appointment</h3>
                  <p className="text-sm text-muted-foreground">Schedule visit</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scale className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Log Weight</h3>
                  <p className="text-sm text-muted-foreground">Track progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Health Timeline</CardTitle>
                  <CardDescription>Complete medical history and events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {timeline.map((event) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.type === "checkup" ? "bg-primary/10" :
                            event.type === "vaccine" ? "bg-secondary/10" :
                            "bg-destructive/10"
                          }`}>
                            {event.type === "checkup" ? (
                              <Activity className="h-5 w-5 text-primary" />
                            ) : event.type === "vaccine" ? (
                              <Syringe className="h-5 w-5 text-secondary" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <div className="w-0.5 h-full bg-border min-h-[60px]" />
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{event.title}</h3>
                            <span className="text-sm text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <p className="text-xs text-muted-foreground">Provider: {event.doctor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccinations">
              <Card>
                <CardHeader>
                  <CardTitle>Vaccination Schedule</CardTitle>
                  <CardDescription>Keep track of all immunizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vaccinations.map((vaccine, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Syringe className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{vaccine.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last: {new Date(vaccine.lastDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              vaccine.status === "current" ? "default" :
                              vaccine.status === "due-soon" ? "secondary" :
                              "destructive"
                            }
                          >
                            {vaccine.status === "current" ? "Current" :
                             vaccine.status === "due-soon" ? "Due Soon" :
                             "Overdue"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Next: {new Date(vaccine.nextDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
