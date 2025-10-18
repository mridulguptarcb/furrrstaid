import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Loader2, Scale, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Sparkles, Zap, Star, Crown, Heart, Activity, BarChart3, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { petAPI, Pet, weightAPI, WeightLog } from "@/services/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const weightLogSchema = z.object({
  weight_kg: z.number().min(0.1, "Weight must be greater than 0").max(200, "Weight must be realistic"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  body_condition_score: z.number().min(1).max(9).optional(),
  activity_level: z.string().optional(),
  feeding_amount: z.string().optional(),
});

type WeightLogFormData = z.infer<typeof weightLogSchema>;

type WeightEntry = WeightLog;

const LogWeight = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [weightTrend, setWeightTrend] = useState<'up' | 'down' | 'stable'>('stable');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<WeightLogFormData>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Load pet data and weight history
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoadingData(true);
        const petData = await petAPI.getPet(parseInt(id));
        setPet(petData);
        setCurrentWeight(petData.weight_kg);

        const history = await weightAPI.getWeightLogs(parseInt(id));
        setWeightHistory(history);

        // Calculate weight trend
        if (history.length >= 2) {
          const latest = history[history.length - 1].weight_kg;
          const previous = history[history.length - 2].weight_kg;
          if (latest > previous + 0.1) setWeightTrend('up');
          else if (latest < previous - 0.1) setWeightTrend('down');
          else setWeightTrend('stable');
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id]);

  const onSubmit = async (data: WeightLogFormData) => {
    try {
      setLoading(true);
      
      if (!id || !pet) return;
      await weightAPI.createWeightLog({
        pet_id: parseInt(id),
        weight_kg: data.weight_kg,
        date: new Date(data.date).toISOString(),
        notes: data.notes,
        body_condition_score: data.body_condition_score,
        activity_level: data.activity_level,
        feeding_amount: data.feeding_amount,
      });

      // Refresh pet and weight history
      const [updatedPet, history] = await Promise.all([
        petAPI.getPet(parseInt(id)),
        weightAPI.getWeightLogs(parseInt(id)),
      ]);
      setPet(updatedPet);
      setCurrentWeight(updatedPet.weight_kg);
      setWeightHistory(history);
      if (history.length >= 2) {
        const latest = history[history.length - 1].weight_kg;
        const previous = history[history.length - 2].weight_kg;
        if (latest > previous + 0.1) setWeightTrend('up');
        else if (latest < previous - 0.1) setWeightTrend('down');
        else setWeightTrend('stable');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/pet/${id}`);
      }, 1500);
    } catch (error) {
      console.error("Error logging weight:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeightTrendIcon = () => {
    switch (weightTrend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-blue-500" />;
    }
  };

  const getWeightTrendColor = () => {
    switch (weightTrend) {
      case 'up':
        return "text-red-600";
      case 'down':
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  const getWeightTrendText = () => {
    switch (weightTrend) {
      case 'up':
        return "Weight increasing";
      case 'down':
        return "Weight decreasing";
      default:
        return "Weight stable";
    }
  };

  const getBodyConditionText = (score?: number) => {
    if (!score) return "Not recorded";
    if (score <= 3) return "Underweight";
    if (score <= 5) return "Ideal";
    if (score <= 7) return "Overweight";
    return "Obese";
  };

  const getBodyConditionColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score <= 3) return "text-red-500";
    if (score <= 5) return "text-green-500";
    if (score <= 7) return "text-yellow-500";
    return "text-red-600";
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
                  Weight Logged! ⚖️
                </h2>
                <p className="text-muted-foreground mb-6">
                  {pet?.name}'s weight has been successfully recorded.
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
        <div className="container mx-auto max-w-6xl">
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
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Log Weight
                </h1>
              </div>
              <p className="text-muted-foreground">Track {pet.name}'s weight and health ⚖️</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weight Log Form */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-green-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Scale className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Log New Weight
                      </CardTitle>
                      <CardDescription>
                        Record {pet.name}'s current weight
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Pet Info */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-muted/50 to-card border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary">{pet.name}</h3>
                          <p className="text-sm text-primary/70">{pet.species} • {pet.breed}</p>
                        </div>
                      </div>
                    </div>

                    {/* Weight Input */}
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
                        className="h-12 border-2 border-border focus:border-primary text-lg font-semibold"
                      />
                      {errors.weight_kg && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.weight_kg.message}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="space-y-3">
                      <Label htmlFor="date" className="text-base font-semibold">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        {...register("date")}
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                      {errors.date && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    {/* Body Condition Score */}
                    <div className="space-y-3">
                      <Label htmlFor="body_condition_score" className="text-base font-semibold">Body Condition Score (1-9)</Label>
                      <Input
                        id="body_condition_score"
                        type="number"
                        {...register("body_condition_score", { valueAsNumber: true })}
                        min="1"
                        max="9"
                        placeholder="5"
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">
                        1-3: Underweight, 4-5: Ideal, 6-7: Overweight, 8-9: Obese
                      </p>
                    </div>

                    {/* Activity Level */}
                    <div className="space-y-3">
                      <Label htmlFor="activity_level" className="text-base font-semibold">Activity Level</Label>
                      <Input
                        id="activity_level"
                        {...register("activity_level")}
                        placeholder="e.g., Very active, Moderate, Low"
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                    </div>

                    {/* Feeding Amount */}
                    <div className="space-y-3">
                      <Label htmlFor="feeding_amount" className="text-base font-semibold">Feeding Amount</Label>
                      <Input
                        id="feeding_amount"
                        {...register("feeding_amount")}
                        placeholder="e.g., 1 cup dry food, 2 cans wet food"
                        className="h-12 border-2 border-border focus:border-primary"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
                      <Textarea
                        id="notes"
                        {...register("notes")}
                        placeholder="Any observations or notes about the weight measurement"
                        rows={3}
                        className="border-2 border-border focus:border-primary"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Logging Weight...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Log Weight
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Weight History & Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Weight & Trend */}
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Weight Overview
                      </CardTitle>
                      <CardDescription>
                        Current weight and trend analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current Weight */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        <Scale className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-primary mb-2">{currentWeight} kg</h3>
                      <p className="text-primary/70 font-medium">Current Weight</p>
                    </div>

                    {/* Weight Trend */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        {getWeightTrendIcon()}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 text-primary`}>
                        {getWeightTrendText()}
                      </h3>
                      <p className="text-primary/70 font-medium">Trend</p>
                    </div>

                    {/* Last Recorded */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-r from-muted/30 to-card border border-border">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary mb-2">
                        {weightHistory.length > 0 ? format(new Date(weightHistory[weightHistory.length - 1].date), "MMM dd") : "N/A"}
                      </h3>
                      <p className="text-primary/70 font-medium">Last Recorded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weight History Chart */}
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Weight History
                      </CardTitle>
                      <CardDescription>
                        Track {pet.name}'s weight over time
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {weightHistory.length > 0 ? (
                    <div className="space-y-4">
                      {/* Line Chart Visualization */}
                      <ChartContainer
                        className="w-full rounded-xl border border-border bg-gradient-to-r from-muted/30 to-card p-2"
                        config={{
                          weight: { label: "Weight (kg)", color: "hsl(var(--primary))" },
                        }}
                      >
                        <LineChart
                          data={weightHistory.map((e) => ({
                            dateLabel: format(new Date(e.date), "MMM dd"),
                            weight: e.weight_kg,
                          }))}
                          margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="dateLabel" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            allowDecimals={false}
                          />
                          <ChartTooltip
                            cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                            content={<ChartTooltipContent labelKey="weight" />}
                            formatter={(value: number) => (
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Weight</span>
                                <span className="font-mono font-medium">{value.toFixed(1)} kg</span>
                              </div>
                            )}
                          />
                          <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ChartContainer>

                      {/* Weight History Table */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg mb-4">Recent Entries</h4>
                        {weightHistory.slice(-5).reverse().map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                <Scale className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">{entry.weight_kg} kg</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(entry.date), "MMM dd, yyyy")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {entry.body_condition_score && (
                                <Badge 
                                  variant="secondary" 
                                  className={`${getBodyConditionColor(entry.body_condition_score)} bg-opacity-20`}
                                >
                                  {getBodyConditionText(entry.body_condition_score)}
                                </Badge>
                              )}
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Weight History</h3>
                      <p className="text-muted-foreground">Start logging {pet.name}'s weight to see trends and analytics.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Insights */}
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Health Insights
                      </CardTitle>
                      <CardDescription>
                        Recommendations based on weight data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {weightTrend === 'up' && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-700">
                          <strong>Weight Gain Detected:</strong> Consider monitoring food intake and increasing exercise. Consult your vet if the trend continues.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {weightTrend === 'down' && (
                      <Alert className="border-green-200 bg-green-50">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                          <strong>Weight Loss Detected:</strong> Monitor appetite and energy levels. Consult your vet if weight loss continues unexpectedly.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {weightTrend === 'stable' && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Minus className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700">
                          <strong>Weight Stable:</strong> Great! {pet.name} is maintaining a healthy weight. Keep up the good work!
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-2">💡 Tips</h4>
                        <ul className="text-sm text-green-600 space-y-1">
                          <li>• Weigh at the same time of day</li>
                          <li>• Use the same scale for consistency</li>
                          <li>• Record weight weekly for trends</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-700 mb-2">📊 Goals</h4>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• Maintain healthy weight range</li>
                          <li>• Monitor body condition score</li>
                          <li>• Track feeding patterns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogWeight;
