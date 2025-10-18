import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { walkersAPI, walkBookingsAPI, Walker, WalkBooking, WalkBookingCreate, petAPI, Pet } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Clock, Dog, User, Star } from "lucide-react";
import { useParams } from "react-router-dom";

const WalkService = () => {
  const { id } = useParams();
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWalker, setSelectedWalker] = useState<number | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [scheduledTime, setScheduledTime] = useState<string>("10:00");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>("");
  const [bookings, setBookings] = useState<WalkBooking[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [availableWalkers, setAvailableWalkers] = useState<Walker[]>([]);

  useEffect(() => {
    (async () => {
      const [w, pets] = await Promise.all([
        walkersAPI.getWalkers(),
        petAPI.getPets(),
      ]);
      setWalkers(w);
      setAllPets(pets);
      if (id) {
        try {
          const [p, b] = await Promise.all([
            petAPI.getPet(parseInt(id)),
            walkBookingsAPI.getBookings(parseInt(id)),
          ]);
          setPet(p);
          setBookings(b);
        } catch (e) {
          // ignore if pet not found in this context
        }
      }
    })();
  }, [id]);

  const computeCost = () => {
    const walker = walkers.find(w => w.id === selectedWalker);
    if (!walker) return 0;
    const hours = durationMinutes / 60;
    return (walker.rate_per_hour * hours).toFixed(2);
  };

  const handleBook = async () => {
    if (!selectedWalker || !durationMinutes || !scheduledDate || !scheduledTime) return;
    const petId = id ? parseInt(id) : (pet ? pet.id : undefined);
    if (!petId) return;

    const payload: WalkBookingCreate = {
      pet_id: petId,
      walker_id: selectedWalker,
      scheduled_date: new Date(scheduledDate).toISOString(),
      scheduled_time: scheduledTime,
      duration_minutes: durationMinutes,
      notes: notes || undefined,
    };

    try {
      setLoading(true);
      const created = await walkBookingsAPI.createBooking(payload);
      setBookings(prev => [created, ...prev]);
      setNotes("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFindWalkers = () => {
    // Basic availability mock:
    // - If a pet is selected, show walkers whose categories include the pet species (case-insensitive)
    // - Otherwise show all walkers
    const petSpecies = pet?.species?.toLowerCase();
    const filtered = walkers.filter(w => {
      if (!petSpecies || !w.categories) return true;
      return w.categories.toLowerCase().split(',').map(s => s.trim()).includes(petSpecies);
    });
    setAvailableWalkers(filtered);
    setSelectedWalker(null);
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Dog className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pet Walking Service
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">Hire a volunteer walker for your pet at your preferred date and time.</p>
          </div>

          {!searched ? (
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <CardTitle>Choose Date & Time</CardTitle>
                  <CardDescription>Select when you need the walk</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="relative">
                      <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                      <Calendar className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <div className="relative">
                      <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                      <Clock className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleFindWalkers}>Find Walkers</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                    <CardTitle>Book a Walk</CardTitle>
                    <CardDescription>Finalize your booking details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label>Walker</Label>
                      <Select value={selectedWalker ? String(selectedWalker) : undefined} onValueChange={(v) => setSelectedWalker(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a walker" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWalkers.map((w) => (
                            <SelectItem key={w.id} value={String(w.id)}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <div className="relative">
                        <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                        <Calendar className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="relative">
                        <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                        <Clock className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <Input type="number" min={15} step={15} value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value || '0'))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Any special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Pet</Label>
                      <Select value={pet ? String(pet.id) : (id ? String(id) : undefined)} onValueChange={(v) => {
                        const p = allPets.find(p => String(p.id) === v) || null;
                        setPet(p);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pet" />
                        </SelectTrigger>
                        <SelectContent>
                          {allPets.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name} ({p.species})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="text-sm text-muted-foreground">Estimated Cost</div>
                      <div className="font-semibold">₹{computeCost()}</div>
                    </div>
                    <Button disabled={!selectedWalker || loading} onClick={handleBook} className="w-full">
                      {loading ? 'Booking…' : 'Book Walk'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <CardTitle>Available Walkers</CardTitle>
                        <CardDescription>Choose a walker for the selected date/time</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                    {availableWalkers.length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-full">
                        No walkers available for the selected slot. Try a different time.
                      </div>
                    )}
                    {availableWalkers.map(w => (
                      <div key={w.id} className={`p-4 rounded-xl border ${selectedWalker === w.id ? 'border-primary' : 'border-border'} bg-gradient-to-r from-muted/30 to-card`}>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">{w.name}</div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{w.rating ?? '—'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">{w.bio || 'No bio provided'}</div>
                        <div className="text-sm mt-2"><span className="text-muted-foreground">Categories:</span> {w.categories || 'Dogs'}</div>
                        <div className="text-sm mt-1 text-primary">₹{w.rate_per_hour.toFixed(2)} / hr</div>
                        <div className="mt-3">
                          <Button variant={selectedWalker === w.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedWalker(w.id)}>
                            {selectedWalker === w.id ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      <div>
                        <CardTitle>Upcoming Bookings</CardTitle>
                        <CardDescription>Your scheduled dog walks</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {bookings.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No bookings yet. Book your first walk!</div>
                    ) : (
                      bookings.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                          <div>
                            <div className="font-semibold">{format(new Date(b.scheduled_date), 'MMM dd, yyyy')} at {b.scheduled_time}</div>
                            <div className="text-sm text-muted-foreground">Duration: {b.duration_minutes} mins</div>
                          </div>
                          <div className="font-semibold">₹{b.total_cost.toFixed(2)}</div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkService;
