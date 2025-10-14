import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Bell, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, Sparkles, Zap, Star, Crown, Heart, Shield, Stethoscope, FileText, Repeat, Settings, Syringe, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { petAPI, Pet, vaccinationAPI, VaccinationRecordCreate, VaccinationScheduleCreate } from "@/services/api";

const vaccinationSchema = z.object({
  vaccine_name: z.string().min(1, "Vaccine name is required").max(100, "Name must be less than 100 characters"),
  vaccine_type: z.string().min(1, "Vaccine type is required"),
  date_administered: z.date({
    required_error: "Date administered is required",
  }),
  next_due_date: z.date({
    required_error: "Next due date is required",
  }),
  veterinarian: z.string().optional(),
  batch_number: z.string().optional(),
  notes: z.string().optional(),
});

const vaccinationScheduleSchema = z.object({
  vaccine_name: z.string().min(1, "Vaccine name is required").max(100, "Name must be less than 100 characters"),
  vaccine_type: z.string().min(1, "Vaccine type is required"),
  scheduled_date: z.date({
    required_error: "Scheduled date is required",
  }),
  scheduled_time: z.string().min(1, "Scheduled time is required"),
  location: z.string().optional(),
  veterinarian: z.string().optional(),
  vet_phone: z.string().optional(),
  notes: z.string().optional(),
  reminder_enabled: z.boolean().default(true),
  reminder_hours: z.number().min(1).max(168).default(24),
});

type VaccinationFormData = z.infer<typeof vaccinationSchema>;
type VaccinationScheduleFormData = z.infer<typeof vaccinationScheduleSchema>;

const Vaccinations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("record");

  // Vaccination form
  const vaccinationForm = useForm<VaccinationFormData>({
    resolver: zodResolver(vaccinationSchema),
  });

  // Vaccination schedule form
  const scheduleForm = useForm<VaccinationScheduleFormData>({
    resolver: zodResolver(vaccinationScheduleSchema),
    defaultValues: {
      reminder_enabled: true,
      reminder_hours: 24,
    },
  });

  const [administeredDate, setAdministeredDate] = useState<Date | undefined>(undefined);
  const [nextDueDate, setNextDueDate] = useState<Date | undefined>(undefined);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);

  // Load pet data
  useEffect(() => {
    const loadPetData = async () => {
      if (!id) return;

      try {
        setLoadingData(true);
        const petData = await petAPI.getPet(parseInt(id));
        setPet(petData);
      } catch (error) {
        console.error("Error loading pet data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadPetData();
  }, [id]);

  const onVaccinationSubmit = async (data: VaccinationFormData) => {
    try {
      setLoading(true);
      
      const vaccinationData: VaccinationRecordCreate = {
        pet_id: parseInt(id!),
        vaccine_name: data.vaccine_name,
        vaccine_type: data.vaccine_type,
        date_administered: data.date_administered.toISOString(),
        next_due_date: data.next_due_date?.toISOString(),
        veterinarian: data.veterinarian,
        batch_number: data.batch_number,
        notes: data.notes,
        reminder_enabled: true,
        reminder_hours: 24,
      };
      
      await vaccinationAPI.recordVaccination(vaccinationData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/pet/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Error recording vaccination:", error);
    } finally {
      setLoading(false);
    }
  };

  const onScheduleSubmit = async (data: VaccinationScheduleFormData) => {
    try {
      setLoading(true);
      
      const scheduleData: VaccinationScheduleCreate = {
        pet_id: parseInt(id!),
        vaccine_name: data.vaccine_name,
        vaccine_type: data.vaccine_type,
        scheduled_date: data.scheduled_date.toISOString(),
        scheduled_time: data.scheduled_time,
        location: data.location,
        veterinarian: data.veterinarian,
        vet_phone: data.vet_phone,
        notes: data.notes,
        reminder_enabled: data.reminder_enabled,
        reminder_hours: data.reminder_hours,
      };
      
      await vaccinationAPI.scheduleVaccination(scheduleData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/pet/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Error scheduling vaccination:", error);
    } finally {
      setLoading(false);
    }
  };

  const vaccineTypes = [
    { value: "rabies", label: "Rabies", icon: "🦠", color: "bg-red-100 text-red-700" },
    { value: "dhpp", label: "DHPP (Distemper)", icon: "💉", color: "bg-blue-100 text-blue-700" },
    { value: "bordetella", label: "Bordetella", icon: "🦠", color: "bg-green-100 text-green-700" },
    { value: "leptospirosis", label: "Leptospirosis", icon: "🦠", color: "bg-yellow-100 text-yellow-700" },
    { value: "lyme", label: "Lyme Disease", icon: "🦠", color: "bg-purple-100 text-purple-700" },
    { value: "canine_influenza", label: "Canine Influenza", icon: "🦠", color: "bg-orange-100 text-orange-700" },
    { value: "other", label: "Other", icon: "💉", color: "bg-gray-100 text-gray-700" },
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="text-center border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {activeTab === "record" ? "Vaccination Recorded! ✨" : "Vaccination Scheduled! ✨"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "record" 
                    ? `The vaccination for ${pet?.name} has been successfully recorded.`
                    : `The vaccination appointment for ${pet?.name} has been successfully scheduled.`
                  }
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Redirecting to profile...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive">Pet not found</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/pet/${pet.id}`)}
              className="bg-card/80 backdrop-blur-sm border-border hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Syringe className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Vaccinations
                </h1>
              </div>
              <p className="text-muted-foreground">Manage vaccinations for {pet.name} 💉</p>
            </div>
          </div>

          {/* Pet Info Display */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-muted/50 to-card border border-border mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">{pet.name}</h3>
                <p className="text-primary/70">{pet.species} • {pet.breed}</p>
                <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary">
                  {pet.age_years} years, {pet.age_months} months
                </Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="record">Record Vaccination</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Vaccination</TabsTrigger>
            </TabsList>

            {/* Record Vaccination Tab */}
            <TabsContent value="record">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Syringe className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Record Vaccination
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Log a vaccination that has been administered 📝
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={vaccinationForm.handleSubmit(onVaccinationSubmit)} className="space-y-8">
                    {/* Vaccination Details */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <FileText className="h-6 w-6" />
                        Vaccination Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="vaccine_name" className="text-base font-semibold">Vaccine Name *</Label>
                          <Input
                            id="vaccine_name"
                            {...vaccinationForm.register("vaccine_name")}
                            placeholder="e.g., Rabies, DHPP, Bordetella"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                          {vaccinationForm.formState.errors.vaccine_name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {vaccinationForm.formState.errors.vaccine_name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="vaccine_type" className="text-base font-semibold">Vaccine Type *</Label>
                          <Select onValueChange={(value) => vaccinationForm.setValue("vaccine_type", value)}>
                            <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                              <SelectValue placeholder="Select vaccine type" />
                            </SelectTrigger>
                            <SelectContent>
                              {vaccineTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{type.icon}</span>
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {vaccinationForm.formState.errors.vaccine_type && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {vaccinationForm.formState.errors.vaccine_type.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <CalendarIcon className="h-6 w-6" />
                        Important Dates
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Date Administered *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-border hover:border-primary justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {administeredDate ? format(administeredDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={administeredDate}
                                onSelect={(selectedDate) => {
                                  setAdministeredDate(selectedDate);
                                  vaccinationForm.setValue("date_administered", selectedDate || new Date());
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {vaccinationForm.formState.errors.date_administered && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {vaccinationForm.formState.errors.date_administered.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Next Due Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-border hover:border-primary justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {nextDueDate ? format(nextDueDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={nextDueDate}
                                onSelect={(selectedDate) => {
                                  setNextDueDate(selectedDate);
                                  vaccinationForm.setValue("next_due_date", selectedDate || new Date());
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {vaccinationForm.formState.errors.next_due_date && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {vaccinationForm.formState.errors.next_due_date.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Stethoscope className="h-6 w-6" />
                        Additional Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="veterinarian" className="text-base font-semibold">Veterinarian</Label>
                          <Input
                            id="veterinarian"
                            {...vaccinationForm.register("veterinarian")}
                            placeholder="Doctor's name"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="batch_number" className="text-base font-semibold">Batch Number</Label>
                          <Input
                            id="batch_number"
                            {...vaccinationForm.register("batch_number")}
                            placeholder="Vaccine batch number"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
                        <Textarea
                          id="notes"
                          {...vaccinationForm.register("notes")}
                          placeholder="Any additional notes about the vaccination"
                          rows={3}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Submit Section */}
                    <div className="border-t border-border pt-8 mt-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/pet/${pet.id}`)}
                          className="flex-1 h-14 text-lg border-2 border-border hover:bg-muted/50"
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Recording...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Record Vaccination
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Vaccination Tab */}
            <TabsContent value="schedule">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <CalendarIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Schedule Vaccination
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Book a vaccination appointment 📅
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-8">
                    {/* Vaccination Details */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <FileText className="h-6 w-6" />
                        Vaccination Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="schedule_vaccine_name" className="text-base font-semibold">Vaccine Name *</Label>
                          <Input
                            id="schedule_vaccine_name"
                            {...scheduleForm.register("vaccine_name")}
                            placeholder="e.g., Rabies, DHPP, Bordetella"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                          {scheduleForm.formState.errors.vaccine_name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {scheduleForm.formState.errors.vaccine_name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="schedule_vaccine_type" className="text-base font-semibold">Vaccine Type *</Label>
                          <Select onValueChange={(value) => scheduleForm.setValue("vaccine_type", value)}>
                            <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                              <SelectValue placeholder="Select vaccine type" />
                            </SelectTrigger>
                            <SelectContent>
                              {vaccineTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{type.icon}</span>
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {scheduleForm.formState.errors.vaccine_type && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {scheduleForm.formState.errors.vaccine_type.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Clock className="h-6 w-6" />
                        Appointment Date & Time
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold">Scheduled Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-12 border-2 border-border hover:border-primary justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={(selectedDate) => {
                                  setScheduledDate(selectedDate);
                                  scheduleForm.setValue("scheduled_date", selectedDate || new Date());
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {scheduleForm.formState.errors.scheduled_date && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {scheduleForm.formState.errors.scheduled_date.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="scheduled_time" className="text-base font-semibold">Scheduled Time *</Label>
                          <Select onValueChange={(value) => scheduleForm.setValue("scheduled_time", value)}>
                            <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {scheduleForm.formState.errors.scheduled_time && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {scheduleForm.formState.errors.scheduled_time.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location & Contact */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <MapPin className="h-6 w-6" />
                        Location & Contact
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="location" className="text-base font-semibold">Location</Label>
                          <Input
                            id="location"
                            {...scheduleForm.register("location")}
                            placeholder="Veterinary clinic or hospital name"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="schedule_veterinarian" className="text-base font-semibold flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Veterinarian Name
                          </Label>
                          <Input
                            id="schedule_veterinarian"
                            {...scheduleForm.register("veterinarian")}
                            placeholder="Doctor's name (if known)"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="vet_phone" className="text-base font-semibold flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Number
                        </Label>
                        <Input
                          id="vet_phone"
                          {...scheduleForm.register("vet_phone")}
                          placeholder="Clinic phone number"
                          className="h-12 border-2 border-orange-200 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Bell className="h-6 w-6" />
                        Reminder Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Controller
                            name="reminder_enabled"
                            control={scheduleForm.control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            )}
                          />
                          <Label className="text-base font-semibold">Enable appointment reminder</Label>
                        </div>

                        {scheduleForm.watch("reminder_enabled") && (
                          <div className="space-y-3">
                            <Label htmlFor="reminder_hours" className="text-base font-semibold">Remind me</Label>
                            <Select onValueChange={(value) => scheduleForm.setValue("reminder_hours", parseInt(value))}>
                              <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-500">
                                <SelectValue placeholder="Select reminder time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 hour before</SelectItem>
                                <SelectItem value="2">2 hours before</SelectItem>
                                <SelectItem value="4">4 hours before</SelectItem>
                                <SelectItem value="24">1 day before</SelectItem>
                                <SelectItem value="48">2 days before</SelectItem>
                                <SelectItem value="168">1 week before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <FileText className="h-6 w-6" />
                        Additional Notes
                      </h3>
                      
                      <div className="space-y-3">
                        <Label htmlFor="schedule_notes" className="text-base font-semibold">Notes</Label>
                        <Textarea
                          id="schedule_notes"
                          {...scheduleForm.register("notes")}
                          placeholder="Any special instructions, concerns, or additional information"
                          rows={4}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Submit Section */}
                    <div className="border-t border-border pt-8 mt-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate(`/pet/${pet.id}`)}
                          className="flex-1 h-14 text-lg border-2 border-border hover:bg-muted/50"
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Schedule Vaccination
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Vaccinations;
