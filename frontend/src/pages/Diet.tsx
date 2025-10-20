import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { aiAPI, petAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Diet = () => {
  const { toast } = useToast();
  const [pets, setPets] = useState<Array<{ id: number; name: string; species: string; breed: string; age_years: number; weight_kg: number }>>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [allergies, setAllergies] = useState("",
  );
  const [goals, setGoals] = useState("Maintain healthy weight and energy levels");
  const [dietPlan, setDietPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedDietData, setParsedDietData] = useState<{
    weeklyPlan: Array<{ day: string; breakfast: string; lunch: string; dinner: string; portions: string }>;
    dailyCalories: string;
    hydrationTips: string[];
    treatRecommendations: string[];
    foodsToAvoid: string[];
    specialNotes: string[];
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await petAPI.getPets();
        setPets(data);
        if (data.length > 0) setSelectedPetId(String(data[0].id));
      } catch {
        toast({ title: "Unable to load pets", description: "Please add a pet first." });
      }
    };
    load();
  }, [toast]);

  const selectedPet = useMemo(() => pets.find(p => String(p.id) === selectedPetId), [pets, selectedPetId]);

  const parseDietResponse = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const weeklyPlan: Array<{ day: string; breakfast: string; lunch: string; dinner: string; portions: string }> = [];
    const hydrationTips: string[] = [];
    const treatRecommendations: string[] = [];
    const foodsToAvoid: string[] = [];
    const specialNotes: string[] = [];
    let dailyCalories = "";

    let currentSection = "";
    let currentDay = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect sections
      if (line.toLowerCase().includes('calorie') || line.toLowerCase().includes('calories')) {
        currentSection = 'calories';
        dailyCalories = line;
        continue;
      }
      if (line.toLowerCase().includes('hydration') || line.toLowerCase().includes('water')) {
        currentSection = 'hydration';
        continue;
      }
      if (line.toLowerCase().includes('treat') || line.toLowerCase().includes('snack')) {
        currentSection = 'treats';
        continue;
      }
      if (line.toLowerCase().includes('avoid') || line.toLowerCase().includes('don\'t') || line.toLowerCase().includes('never')) {
        currentSection = 'avoid';
        continue;
      }
      if (line.toLowerCase().includes('note') || line.toLowerCase().includes('special') || line.toLowerCase().includes('condition')) {
        currentSection = 'notes';
        continue;
      }

      // Detect days
      const dayMatch = line.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|day \d+)/i);
      if (dayMatch) {
        currentDay = dayMatch[1];
        currentSection = 'weekly';
        continue;
      }

      // Parse weekly plan
      if (currentSection === 'weekly' && currentDay) {
        const mealMatch = line.match(/^(breakfast|lunch|dinner|morning|afternoon|evening):\s*(.+)/i);
        if (mealMatch) {
          const mealType = mealMatch[1].toLowerCase();
          const mealContent = mealMatch[2];
          
          let dayIndex = weeklyPlan.findIndex(day => day.day.toLowerCase() === currentDay.toLowerCase());
          if (dayIndex === -1) {
            weeklyPlan.push({ day: currentDay, breakfast: "", lunch: "", dinner: "", portions: "" });
            dayIndex = weeklyPlan.length - 1;
          }

          if (mealType.includes('breakfast') || mealType.includes('morning')) {
            weeklyPlan[dayIndex].breakfast = mealContent;
          } else if (mealType.includes('lunch') || mealType.includes('afternoon')) {
            weeklyPlan[dayIndex].lunch = mealContent;
          } else if (mealType.includes('dinner') || mealType.includes('evening')) {
            weeklyPlan[dayIndex].dinner = mealContent;
          }
        } else if (line.includes('portion') || line.includes('gram') || line.includes('cup')) {
          let dayIndex = weeklyPlan.findIndex(day => day.day.toLowerCase() === currentDay.toLowerCase());
          if (dayIndex !== -1) {
            weeklyPlan[dayIndex].portions = line;
          }
        }
      }

      // Parse other sections
      if (currentSection === 'hydration' && line && !line.toLowerCase().includes('hydration')) {
        hydrationTips.push(line);
      }
      if (currentSection === 'treats' && line && !line.toLowerCase().includes('treat')) {
        treatRecommendations.push(line);
      }
      if (currentSection === 'avoid' && line && !line.toLowerCase().includes('avoid')) {
        foodsToAvoid.push(line);
      }
      if (currentSection === 'notes' && line && !line.toLowerCase().includes('note')) {
        specialNotes.push(line);
      }
    }

    return {
      weeklyPlan,
      dailyCalories,
      hydrationTips,
      treatRecommendations,
      foodsToAvoid,
      specialNotes
    };
  };

  const handleGenerate = async () => {
    if (!selectedPet) {
      toast({ title: "Select a pet", description: "Choose a pet to generate a plan." });
      return;
    }
    setIsLoading(true);
    setDietPlan("");
    try {
      const prompt = `Create a detailed, safe, and practical 7-day diet schedule for a ${selectedPet.species} named ${selectedPet.name}.
Breed: ${selectedPet.breed}. Age: ${selectedPet.age_years} years. Weight: ${selectedPet.weight_kg} kg.
Allergies/sensitivities: ${allergies || "None mentioned"}.
Owner goals: ${goals}.
Return:
- A weekly table with breakfast/lunch/dinner and portion sizes in grams or cups
- Daily calorie estimate
- Hydration tips
- Treat recommendations and limits
- Foods to avoid for this pet
- Notes for senior/special conditions if relevant
Keep it concise and actionable. Use simple bullet points and short hints.`;

      const res = await aiAPI.generateDietPlan(prompt);
      const text: string = res.text || "No advice generated.";
      setDietPlan(text);
      
      // Parse the response into structured data
      const parsed = parseDietResponse(text);
      setParsedDietData(parsed);
    } catch (e) {
      toast({ title: "Failed to generate plan", description: "Try again in a moment." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Personalized Diet Plan</h1>
          <p className="text-muted-foreground mb-6">Generate a 7-day food schedule tailored for your pet.</p>

          <Card className="mb-6">
            <CardContent className="p-6 grid gap-4 md:grid-cols-2">
              <div>
                <Label>Pet</Label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>
                    {pets.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} • {p.breed} • {p.weight_kg}kg</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Allergies / restrictions</Label>
                <Input className="mt-2" placeholder="e.g. chicken, lactose" value={allergies} onChange={e => setAllergies(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Goals</Label>
                <Input className="mt-2" placeholder="e.g. weight loss, shiny coat, joint health" value={goals} onChange={e => setGoals(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button onClick={handleGenerate} disabled={isLoading || pets.length === 0}>{isLoading ? "Generating..." : "Generate Plan"}</Button>
              </div>
            </CardContent>
          </Card>

          {parsedDietData && (
            <div className="space-y-6">
              {/* Weekly Plan Table */}
              {parsedDietData.weeklyPlan.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>7-Day Meal Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Day</TableHead>
                            <TableHead>Breakfast</TableHead>
                            <TableHead>Lunch</TableHead>
                            <TableHead>Dinner</TableHead>
                            <TableHead>Portions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedDietData.weeklyPlan.map((day, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{day.day}</TableCell>
                              <TableCell>{day.breakfast || "-"}</TableCell>
                              <TableCell>{day.lunch || "-"}</TableCell>
                              <TableCell>{day.dinner || "-"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{day.portions || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {parsedDietData.dailyCalories && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Daily Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{parsedDietData.dailyCalories}</p>
                    </CardContent>
                  </Card>
                )}

                {parsedDietData.hydrationTips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Hydration Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {parsedDietData.hydrationTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {parsedDietData.treatRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Treat Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {parsedDietData.treatRecommendations.map((treat, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{treat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {parsedDietData.foodsToAvoid.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">Foods to Avoid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {parsedDietData.foodsToAvoid.map((food, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{food}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {parsedDietData.specialNotes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Special Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {parsedDietData.specialNotes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Fallback: Show raw text if parsing failed */}
              {parsedDietData.weeklyPlan.length === 0 && dietPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Diet Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="whitespace-pre-wrap leading-relaxed text-sm">
                    {dietPlan}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Diet;



