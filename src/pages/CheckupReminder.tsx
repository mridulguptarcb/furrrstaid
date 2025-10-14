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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, Clock, MapPin, Phone, Stethoscope, AlertCircle, CheckCircle, Sparkles, Zap, Star, Crown, Heart, Bell, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { petAPI, Pet, checkupReminderAPI, CheckupReminderCreate } from "@/services/api";

const checkupReminderSchema = z.object({
  title: z.string().min(1, "Checkup reminder title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  checkup_type: z.string().min(1, "Checkup type is required"),
  due_date: z.date({
    required_error: "Due date is required",
  }),
  due_time: z.string().min(1, "Due time is required"),
  priority: z.string().min(1, "Priority is required"),
  location: z.string().optional(),
  vet_name: z.string().optional(),
  vet_phone: z.string().optional(),
  notes: z.string().optional(),
  reminder_enabled: z.boolean().default(true),
  reminder_hours: z.number().min(1).max(168).default(24),
});

type CheckupReminderFormData = z.infer<typeof checkupReminderSchema>;

const CheckupReminder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<CheckupReminderFormData>({
    resolver: zodResolver(checkupReminderSchema),
    defaultValues: {
      reminder_enabled: true,
      reminder_hours: 24,
      priority: "medium",
    },
  });

  const checkupType = watch("checkup_type");
  const reminderEnabled = watch("reminder_enabled");

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

  const onSubmit = async (data: CheckupReminderFormData) => {
    try {
      setLoading(true);
      
      const reminderData: CheckupReminderCreate = {
        pet_id: parseInt(id!),
        title: data.title,
        description: data.description,
        checkup_type: data.checkup_type,
        due_date: data.due_date.toISOString(),
        due_time: data.due_time,
        priority: data.priority,
        location: data.location,
        vet_name: data.vet_name,
        vet_phone: data.vet_phone,
        notes: data.notes,
        reminder_enabled: data.reminder_enabled,
        reminder_hours: data.reminder_hours,
      };
      
      await checkupReminderAPI.createCheckupReminder(reminderData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/pet/${id}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating checkup reminder:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkupTypes = [
    { value: "annual", label: "Annual Checkup", icon: "🩺", color: "bg-blue-100 text-blue-700" },
    { value: "routine", label: "Routine Examination", icon: "🔍", color: "bg-green-100 text-green-700" },
    { value: "dental", label: "Dental Checkup", icon: "🦷", color: "bg-purple-100 text-purple-700" },
    { value: "follow_up", label: "Follow-up Visit", icon: "📋", color: "bg-cyan-100 text-cyan-700" },
    { value: "emergency", label: "Emergency Checkup", icon: "🚨", color: "bg-red-100 text-red-700" },
    { value: "specialist", label: "Specialist Consultation", icon: "👨‍⚕️", color: "bg-orange-100 text-orange-700" },
    { value: "other", label: "Other", icon: "📝", color: "bg-gray-100 text-gray-700" },
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-700", icon: "🟢" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", icon: "🟡" },
    { value: "high", label: "High", color: "bg-red-100 text-red-700", icon: "🔴" },
    { value: "urgent", label: "Urgent", color: "bg-red-200 text-red-800", icon: "🚨" },
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
                  Checkup Reminder Set! ✨
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your checkup reminder for {pet?.name} has been successfully created.
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Checkup Reminder
                </h1>
              </div>
              <p className="text-muted-foreground">Set a checkup reminder for {pet.name} 🏥</p>
            </div>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Set Checkup Reminder
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Never miss important health checkups 📅
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Pet Info Display */}
                <div className="p-6 rounded-xl bg-gradient-to-r from-muted/50 to-card border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
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

                {/* Checkup Details */}
                  <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                    <FileText className="h-6 w-6" />
                    Checkup Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-base font-semibold">Reminder Title *</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="e.g., Annual Health Checkup, Dental Examination"
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="checkup_type" className="text-base font-semibold">Checkup Type *</Label>
                      <Select onValueChange={(value) => setValue("checkup_type", value)}>
                        <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                          <SelectValue placeholder="Select checkup type" />
                        </SelectTrigger>
                        <SelectContent>
                          {checkupTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{type.icon}</span>
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.checkup_type && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.checkup_type.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Brief description of the checkup purpose"
                      rows={3}
                      className="border-2 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Date & Time Selection */}
                  <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                    <Clock className="h-6 w-6" />
                    Due Date & Time
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calendar */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Due Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 border-2 border-border hover:border-primary justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(selectedDate) => {
                              setDueDate(selectedDate);
                              setValue("due_date", selectedDate || new Date());
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.due_date && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.due_date.message}
                        </p>
                      )}
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-4">
                      <Label htmlFor="due_time" className="text-base font-semibold">Due Time *</Label>
                      <Select onValueChange={(value) => setValue("due_time", value)}>
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
                      {errors.due_time && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.due_time.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority */}
                  <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                    <Star className="h-6 w-6" />
                    Priority Level
                  </h3>
                  
                  <div className="space-y-3">
                    <Label htmlFor="priority" className="text-base font-semibold">Priority *</Label>
                    <Select onValueChange={(value) => setValue("priority", value)}>
                      <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{priority.icon}</span>
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.priority.message}
                      </p>
                    )}
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
                        {...register("location")}
                        placeholder="Veterinary clinic or hospital name"
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="vet_name" className="text-base font-semibold flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Veterinarian Name
                      </Label>
                      <Input
                        id="vet_name"
                        {...register("vet_name")}
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
                      {...register("vet_phone")}
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
                        control={control}
                        render={({ field }) => (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500"
                          />
                        )}
                      />
                      <Label className="text-base font-semibold">Enable reminder notification</Label>
                    </div>

                    {reminderEnabled && (
                      <div className="space-y-3">
                        <Label htmlFor="reminder_hours" className="text-base font-semibold">Remind me</Label>
                        <Select onValueChange={(value) => setValue("reminder_hours", parseInt(value))}>
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
                    <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
                    <Textarea
                      id="notes"
                      {...register("notes")}
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
                          Setting Reminder...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Set Checkup Reminder
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Keeping {pet.name} healthy with timely checkups! 🏥✨
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckupReminder;
