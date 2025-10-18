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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, Upload, Camera, Heart, Shield, Calendar, Stethoscope, MapPin, Phone, Mail, AlertCircle, CheckCircle, Sparkles, Zap, Star, Crown } from "lucide-react";
import Header from "@/components/Header";
import { petAPI, speciesAPI, breedAPI, Pet, PetUpdate, Species, Breed } from "@/services/api";

const petUpdateSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(100, "Name must be less than 100 characters"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  age_years: z.number().min(0, "Age must be 0 or greater").max(30, "Age must be realistic"),
  age_months: z.number().min(0, "Months must be 0 or greater").max(11, "Months must be less than 12"),
  weight_kg: z.number().min(0.1, "Weight must be greater than 0").max(200, "Weight must be realistic"),
  gender: z.string().min(1, "Gender is required"),
  color: z.string().optional(),
  microchip_id: z.string().optional(),
  medical_notes: z.string().optional(),
  emergency_contact: z.string().optional(),
  vet_name: z.string().optional(),
  vet_phone: z.string().optional(),
  birth_date: z.string().optional(),
  neutered: z.boolean().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  last_vet_visit: z.string().optional(),
  insurance_info: z.string().optional(),
  behavioral_notes: z.string().optional(),
  special_needs: z.string().optional(),
});

type PetUpdateFormData = z.infer<typeof petUpdateSchema>;

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [petImage, setPetImage] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<PetUpdateFormData>({
    resolver: zodResolver(petUpdateSchema),
  });

  const selectedSpecies = watch("species");

  // Load pet data and form options
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoadingData(true);
        const [petData, speciesData, breedsData] = await Promise.all([
          petAPI.getPet(parseInt(id)),
          speciesAPI.getSpecies(),
          breedAPI.getBreeds(),
        ]);

        setPet(petData);
        setSpecies(speciesData);
        setBreeds(breedsData);

        // Populate form with existing pet data
        reset({
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          age_years: petData.age_years,
          age_months: petData.age_months,
          weight_kg: petData.weight_kg,
          gender: petData.gender,
          color: petData.color || "",
          microchip_id: petData.microchip_id || "",
          medical_notes: petData.medical_notes || "",
          emergency_contact: petData.emergency_contact || "",
          vet_name: petData.vet_name || "",
          vet_phone: petData.vet_phone || "",
          birth_date: petData.birth_date || "",
          neutered: petData.neutered || false,
          allergies: petData.allergies || "",
          medications: petData.medications || "",
          last_vet_visit: petData.last_vet_visit || "",
          insurance_info: petData.insurance_info || "",
          behavioral_notes: petData.behavioral_notes || "",
          special_needs: petData.special_needs || "",
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, reset]);

  // Update breeds when species changes
  useEffect(() => {
    if (selectedSpecies) {
      const loadBreedsForSpecies = async () => {
        try {
          const breedsData = await breedAPI.getBreedsBySpecies(selectedSpecies);
          setBreeds(breedsData);
        } catch (error) {
          console.error("Error loading breeds:", error);
        }
      };
      loadBreedsForSpecies();
    }
  }, [selectedSpecies]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPetImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PetUpdateFormData) => {
    if (!pet) return;

    try {
      setLoading(true);
      const petData: PetUpdate = {
        ...data,
        age_months: data.age_months || 0,
      };
      
      await petAPI.updatePet(pet.id, petData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/pet/${pet.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating pet:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog':
        return <Heart className="h-6 w-6 text-primary" />;
      case 'cat':
        return <Heart className="h-6 w-6 text-primary" />;
      case 'bird':
        return <Heart className="h-6 w-6 text-primary" />;
      case 'rabbit':
        return <Heart className="h-6 w-6 text-primary" />;
      default:
        return <Heart className="h-6 w-6 text-primary" />;
    }
  };

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
                  Profile Updated Successfully! ✨
                </h2>
                <p className="text-muted-foreground mb-6">
                  {pet?.name}'s profile has been updated with all the latest information.
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Edit {pet.name}'s Profile
                </h1>
              </div>
              <p className="text-muted-foreground">Update your furry friend's information with style ✨</p>
            </div>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  {getSpeciesIcon(pet.species)}
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Update Profile Information
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Make your pet's profile shine with the latest details 🌟
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Pet Photo Upload */}
              <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-muted/50 to-card border border-border">
                <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Pet Photo
                </Label>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-gradient-to-br from-muted/50 to-card">
                    {petImage ? (
                      <img src={petImage} alt="Pet" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                          <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No photo</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="pet-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => document.getElementById('pet-image')?.click()}
                        className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0 hover:opacity-90 shadow-lg"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      {petImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      ✨ Add a beautiful photo of {pet.name}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={formStep === 1 ? "basic" : formStep === 2 ? "details" : "medical"} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-muted/50 to-card border border-border">
                    <TabsTrigger 
                      value="basic" 
                      onClick={() => setFormStep(1)}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details" 
                      onClick={() => setFormStep(2)}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="medical" 
                      onClick={() => setFormStep(3)}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Medical
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-8">
                    {/* Basic Information */}
                      <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Star className="h-6 w-6" />
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-base font-semibold">Pet Name *</Label>
                          <Input
                            id="name"
                            {...register("name")}
                            placeholder="Enter pet name"
                            className="h-12 border-2 border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="species" className="text-base font-semibold">Species *</Label>
                          <Select onValueChange={(value) => setValue("species", value)}>
                              <SelectTrigger className="h-12 border-2 border-border focus:border-primary">
                              <SelectValue placeholder="Select species" />
                            </SelectTrigger>
                            <SelectContent>
                              {species.map((s) => (
                                <SelectItem key={s.id} value={s.name}>
                                  {s.icon} {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.species && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.species.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="breed" className="text-base font-semibold">Breed *</Label>
                          <Select onValueChange={(value) => setValue("breed", value)}>
                              <SelectTrigger className="h-12 border-2 border-border focus:border-primary">
                              <SelectValue placeholder="Select breed" />
                            </SelectTrigger>
                            <SelectContent>
                              {breeds.map((b) => (
                                <SelectItem key={b.id} value={b.name}>
                                  {b.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.breed && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.breed.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Gender *</Label>
                          <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-row space-x-8"
                              >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="Male" id="male" className="border-2 border-border" />
                                  <Label htmlFor="male" className="text-base font-medium">Male</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="Female" id="female" className="border-2 border-border" />
                                  <Label htmlFor="female" className="text-base font-medium">Female</Label>
                                </div>
                              </RadioGroup>
                            )}
                          />
                          {errors.gender && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.gender.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="age_years" className="text-base font-semibold">Age (Years) *</Label>
                          <Input
                            id="age_years"
                            type="number"
                            {...register("age_years", { valueAsNumber: true })}
                            min="0"
                            max="30"
                            placeholder="0"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                          {errors.age_years && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.age_years.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="age_months" className="text-base font-semibold">Age (Months)</Label>
                          <Input
                            id="age_months"
                            type="number"
                            {...register("age_months", { valueAsNumber: true })}
                            min="0"
                            max="11"
                            placeholder="0"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                          {errors.age_months && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.age_months.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="weight_kg" className="text-base font-semibold">Weight (kg) *</Label>
                          <Input
                            id="weight_kg"
                            type="number"
                            step="0.1"
                            {...register("weight_kg", { valueAsNumber: true })}
                            min="0.1"
                            max="200"
                            placeholder="0.0"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                          {errors.weight_kg && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.weight_kg.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="color" className="text-base font-semibold">Color/Markings</Label>
                        <Input
                          id="color"
                          {...register("color")}
                          placeholder="e.g., Brown, Black, White, Spotted"
                          className="h-12 border-2 border-green-200 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 mt-8">
                    {/* Additional Details */}
                      <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Shield className="h-6 w-6" />
                        Additional Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="microchip_id" className="text-base font-semibold">Microchip ID</Label>
                          <Input
                            id="microchip_id"
                            {...register("microchip_id")}
                            placeholder="Enter microchip ID if available"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="birth_date" className="text-base font-semibold">Birth Date</Label>
                          <Input
                            id="birth_date"
                            type="date"
                            {...register("birth_date")}
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Spayed/Neutered</Label>
                        <Controller
                          name="neutered"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              value={field.value ? "true" : "false"}
                              className="flex flex-row space-x-8"
                            >
                              <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="true" id="neutered-yes" className="border-2 border-border" />
                                <Label htmlFor="neutered-yes" className="text-base font-medium">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="false" id="neutered-no" className="border-2 border-border" />
                                <Label htmlFor="neutered-no" className="text-base font-medium">No</Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="unknown" id="neutered-unknown" className="border-2 border-border" />
                                <Label htmlFor="neutered-unknown" className="text-base font-medium">Unknown</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="emergency_contact" className="text-base font-semibold">Emergency Contact</Label>
                        <Input
                          id="emergency_contact"
                          {...register("emergency_contact")}
                          placeholder="Emergency contact person name"
                          className="h-12 border-2 border-blue-200 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="vet_name" className="text-base font-semibold flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Veterinarian Name
                          </Label>
                          <Input
                            id="vet_name"
                            {...register("vet_name")}
                            placeholder="Your vet's name"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="vet_phone" className="text-base font-semibold flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Veterinarian Phone
                          </Label>
                          <Input
                            id="vet_phone"
                            {...register("vet_phone")}
                            placeholder="Vet's phone number"
                            className="h-12 border-2 border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="insurance_info" className="text-base font-semibold">Pet Insurance Information</Label>
                        <Input
                          id="insurance_info"
                          {...register("insurance_info")}
                          placeholder="Insurance provider and policy number"
                          className="h-12 border-2 border-blue-200 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-6 mt-8">
                    {/* Medical Information */}
                      <div className="space-y-6 p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                        <Stethoscope className="h-6 w-6" />
                        Medical Information
                      </h3>
                      
                        <Alert className="border-border bg-muted/50">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          <AlertDescription className="text-foreground">
                          This information helps us provide better care recommendations and emergency guidance.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <Label htmlFor="last_vet_visit" className="text-base font-semibold">Last Veterinary Visit</Label>
                        <Input
                          id="last_vet_visit"
                          type="date"
                          {...register("last_vet_visit")}
                          className="h-12 border-2 border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="allergies" className="text-base font-semibold">Known Allergies</Label>
                        <Textarea
                          id="allergies"
                          {...register("allergies")}
                          placeholder="List any known allergies or food sensitivities"
                          rows={3}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="medications" className="text-base font-semibold">Current Medications</Label>
                        <Textarea
                          id="medications"
                          {...register("medications")}
                          placeholder="List any current medications, supplements, or treatments"
                          rows={3}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="special_needs" className="text-base font-semibold">Special Needs</Label>
                        <Textarea
                          id="special_needs"
                          {...register("special_needs")}
                          placeholder="Any special dietary requirements, mobility issues, or behavioral considerations"
                          rows={3}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="behavioral_notes" className="text-base font-semibold">Behavioral Notes</Label>
                        <Textarea
                          id="behavioral_notes"
                          {...register("behavioral_notes")}
                          placeholder="Any behavioral observations, training notes, or social preferences"
                          rows={3}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="medical_notes" className="text-base font-semibold">Additional Medical Notes</Label>
                        <Textarea
                          id="medical_notes"
                          {...register("medical_notes")}
                          placeholder="Any other important medical information, previous surgeries, or health concerns"
                          rows={4}
                          className="border-2 border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Enhanced Submit Section */}
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
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Making {pet.name}'s profile absolutely amazing!
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

export default EditPet;
