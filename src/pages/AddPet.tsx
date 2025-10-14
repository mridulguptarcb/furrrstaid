import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, Upload, Camera, Heart, Shield, Calendar, Stethoscope, MapPin, Phone, Mail, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { petAPI, speciesAPI, breedAPI, PetCreate, Species, Breed } from "@/services/api";

const petSchema = z.object({
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
  // Enhanced fields
  birth_date: z.string().optional(),
  neutered: z.boolean().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  last_vet_visit: z.string().optional(),
  insurance_info: z.string().optional(),
  behavioral_notes: z.string().optional(),
  special_needs: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

const AddPet = () => {
  const navigate = useNavigate();
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
    reset,
    control,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      age_years: 0,
      age_months: 0,
      weight_kg: 0,
      neutered: false,
    },
  });

  const selectedSpecies = watch("species");

  // Load species and breeds data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [speciesData, breedsData] = await Promise.all([
          speciesAPI.getSpecies(),
          breedAPI.getBreeds(),
        ]);
        setSpecies(speciesData);
        setBreeds(breedsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Update breeds when species changes
  useEffect(() => {
    if (selectedSpecies) {
      const loadBreedsForSpecies = async () => {
        try {
          const breedsData = await breedAPI.getBreedsBySpecies(selectedSpecies);
          setBreeds(breedsData);
          // Reset breed selection when species changes
          setValue("breed", "");
        } catch (error) {
          console.error("Error loading breeds:", error);
        }
      };
      loadBreedsForSpecies();
    }
  }, [selectedSpecies, setValue]);

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

  const onSubmit = async (data: PetFormData) => {
    try {
      setLoading(true);
      const petData: PetCreate = {
        name: data.name,
        species: data.species,
        breed: data.breed,
        age_years: data.age_years,
        age_months: data.age_months || 0,
        weight_kg: data.weight_kg,
        gender: data.gender,
        color: data.color,
        microchip_id: data.microchip_id,
        medical_notes: data.medical_notes,
        emergency_contact: data.emergency_contact,
        vet_name: data.vet_name,
        vet_phone: data.vet_phone,
        birth_date: data.birth_date,
        neutered: data.neutered,
        allergies: data.allergies,
        medications: data.medications,
        last_vet_visit: data.last_vet_visit,
        insurance_info: data.insurance_info,
        behavioral_notes: data.behavioral_notes,
        special_needs: data.special_needs,
      };
      
      await petAPI.createPet(petData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error creating pet:", error);
      // You could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pet Added Successfully! 🎉</h2>
                <p className="text-muted-foreground mb-4">
                  Your furry friend has been added to your dashboard. Redirecting you now...
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Redirecting to dashboard...</span>
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
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add New Pet</h1>
              <p className="text-muted-foreground">Tell us about your furry friend</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Add Your Furry Friend</CardTitle>
                  <CardDescription>
                    Tell us about your pet so we can provide the best care recommendations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pet Photo Upload */}
              <div className="mb-8">
                <Label className="text-sm font-medium mb-3 block">Pet Photo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                    {petImage ? (
                      <img src={petImage} alt="Pet" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
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
                      size="sm"
                      onClick={() => document.getElementById('pet-image')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {petImage ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional: Add a photo of your pet
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={formStep === 1 ? "basic" : formStep === 2 ? "details" : "medical"} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic" onClick={() => setFormStep(1)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="details" onClick={() => setFormStep(2)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="medical" onClick={() => setFormStep(3)}>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Medical
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Basic Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Pet Name *</Label>
                          <Input
                            id="name"
                            {...register("name")}
                            placeholder="Enter pet name"
                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="species">Species *</Label>
                          <Select onValueChange={(value) => setValue("species", value)}>
                            <SelectTrigger>
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

                        <div className="space-y-2">
                          <Label htmlFor="breed">Breed *</Label>
                          <Select onValueChange={(value) => setValue("breed", value)}>
                            <SelectTrigger>
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

                        <div className="space-y-2">
                          <Label>Gender *</Label>
                          <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex flex-row space-x-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Male" id="male" />
                                  <Label htmlFor="male">Male</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Female" id="female" />
                                  <Label htmlFor="female">Female</Label>
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age_years">Age (Years) *</Label>
                          <Input
                            id="age_years"
                            type="number"
                            {...register("age_years", { valueAsNumber: true })}
                            min="0"
                            max="30"
                            placeholder="0"
                          />
                          {errors.age_years && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.age_years.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age_months">Age (Months)</Label>
                          <Input
                            id="age_months"
                            type="number"
                            {...register("age_months", { valueAsNumber: true })}
                            min="0"
                            max="11"
                            placeholder="0"
                          />
                          {errors.age_months && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.age_months.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight_kg">Weight (kg) *</Label>
                          <Input
                            id="weight_kg"
                            type="number"
                            step="0.1"
                            {...register("weight_kg", { valueAsNumber: true })}
                            min="0.1"
                            max="200"
                            placeholder="0.0"
                          />
                          {errors.weight_kg && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.weight_kg.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color">Color/Markings</Label>
                        <Input
                          id="color"
                          {...register("color")}
                          placeholder="e.g., Brown, Black, White, Spotted"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6 mt-6">
                    {/* Additional Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Additional Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="microchip_id">Microchip ID</Label>
                          <Input
                            id="microchip_id"
                            {...register("microchip_id")}
                            placeholder="Enter microchip ID if available"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birth_date">Birth Date</Label>
                          <Input
                            id="birth_date"
                            type="date"
                            {...register("birth_date")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Spayed/Neutered</Label>
                        <Controller
                          name="neutered"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              value={field.value ? "true" : "false"}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="neutered-yes" />
                                <Label htmlFor="neutered-yes">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="neutered-no" />
                                <Label htmlFor="neutered-no">No</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="unknown" id="neutered-unknown" />
                                <Label htmlFor="neutered-unknown">Unknown</Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact">Emergency Contact</Label>
                        <Input
                          id="emergency_contact"
                          {...register("emergency_contact")}
                          placeholder="Emergency contact person name"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vet_name" className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            Veterinarian Name
                          </Label>
                          <Input
                            id="vet_name"
                            {...register("vet_name")}
                            placeholder="Your vet's name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vet_phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Veterinarian Phone
                          </Label>
                          <Input
                            id="vet_phone"
                            {...register("vet_phone")}
                            placeholder="Vet's phone number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="insurance_info">Pet Insurance Information</Label>
                        <Input
                          id="insurance_info"
                          {...register("insurance_info")}
                          placeholder="Insurance provider and policy number"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-6 mt-6">
                    {/* Medical Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        Medical Information
                      </h3>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This information helps us provide better care recommendations and emergency guidance.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="last_vet_visit">Last Veterinary Visit</Label>
                        <Input
                          id="last_vet_visit"
                          type="date"
                          {...register("last_vet_visit")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allergies">Known Allergies</Label>
                        <Textarea
                          id="allergies"
                          {...register("allergies")}
                          placeholder="List any known allergies or food sensitivities"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medications">Current Medications</Label>
                        <Textarea
                          id="medications"
                          {...register("medications")}
                          placeholder="List any current medications, supplements, or treatments"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="special_needs">Special Needs</Label>
                        <Textarea
                          id="special_needs"
                          {...register("special_needs")}
                          placeholder="Any special dietary requirements, mobility issues, or behavioral considerations"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="behavioral_notes">Behavioral Notes</Label>
                        <Textarea
                          id="behavioral_notes"
                          {...register("behavioral_notes")}
                          placeholder="Any behavioral observations, training notes, or social preferences"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medical_notes">Additional Medical Notes</Label>
                        <Textarea
                          id="medical_notes"
                          {...register("medical_notes")}
                          placeholder="Any other important medical information, previous surgeries, or health concerns"
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Enhanced Submit Section */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding Your Pet...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Add Your Pet
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      By adding your pet, you agree to our terms of service and privacy policy.
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

export default AddPet;
