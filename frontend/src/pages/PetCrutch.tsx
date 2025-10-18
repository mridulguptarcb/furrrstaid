import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crutchVolunteersAPI, crutchBookingsAPI, CrutchVolunteer, CrutchBooking, CrutchBookingCreate, petAPI, Pet } from "@/services/api";
import { format } from "date-fns";
import { Calendar, Home, Package, User, Star, Dog } from "lucide-react";
import { useParams } from "react-router-dom";

const PetCrutch = () => {
  const { id } = useParams();
  const [volunteers, setVolunteers] = useState<CrutchVolunteer[]>([]);
  const [available, setAvailable] = useState<CrutchVolunteer[]>([]);
  const [bookings, setBookings] = useState<CrutchBooking[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [pet, setPet] = useState<Pet | null>(null);

  const [pickupDate, setPickupDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dropoffDate, setDropoffDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pickupAddress, setPickupAddress] = useState<string>("");
  const [dropoffAddress, setDropoffAddress] = useState<string>("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const [vs, pets] = await Promise.all([
        crutchVolunteersAPI.getVolunteers(),
        petAPI.getPets(),
      ]);
      setVolunteers(vs);
      setAllPets(pets);
      if (id) {
        try {
          const p = await petAPI.getPet(parseInt(id));
          const b = await crutchBookingsAPI.getBookings(parseInt(id));
          setPet(p);
          setBookings(b);
        } catch (e) {
          // ignore
        }
      }
    })();
  }, [id]);

  const handleFindVolunteers = () => {
    const petSpecies = pet?.species?.toLowerCase();
    const filtered = volunteers.filter(v => {
      if (!petSpecies || !v.categories) return true;
      return v.categories.toLowerCase().split(',').map(s => s.trim()).includes(petSpecies);
    });
    setAvailable(filtered);
    setSelectedVolunteer(null);
    setSearched(true);
  };

  const computeCost = () => {
    const vol = volunteers.find(v => v.id === selectedVolunteer);
    if (!vol) return 0;
    const days = Math.max(1, Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / (1000*60*60*24)));
    return (vol.rate_per_day * days).toFixed(2);
  };

  const handleBook = async () => {
    if (!selectedVolunteer || !pickupAddress || !dropoffAddress) return;
    const petId = id ? parseInt(id) : (pet ? pet.id : undefined);
    if (!petId) return;

    const payload: CrutchBookingCreate = {
      pet_id: petId,
      volunteer_id: selectedVolunteer,
      pickup_date: new Date(pickupDate).toISOString(),
      dropoff_date: new Date(dropoffDate).toISOString(),
      pickup_address: pickupAddress,
      dropoff_address: dropoffAddress,
      notes: notes || undefined,
    };

    try {
      setLoading(true);
      const created = await crutchBookingsAPI.createBooking(payload);
      setBookings(prev => [created, ...prev]);
      setNotes("");
      setPickupAddress("");
      setDropoffAddress("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Pet Entrust (Hand over with confidence)
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">Schedule a volunteer to pick up and drop your pet while you’re away.</p>
          </div>

          {!searched ? (
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                  <CardTitle>Choose Pick & Drop Dates</CardTitle>
                  <CardDescription>We’ll show volunteers available for these dates</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pickup Date</Label>
                      <div className="relative">
                        <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                        <Calendar className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Dropoff Date</Label>
                      <div className="relative">
                        <Input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} />
                        <Calendar className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleFindVolunteers}>Find Volunteers</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                    <CardTitle>Book CareGiver Service</CardTitle>
                    <CardDescription>Finalize your booking details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label>Volunteer</Label>
                      <Select value={selectedVolunteer ? String(selectedVolunteer) : undefined} onValueChange={(v) => setSelectedVolunteer(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a volunteer" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.map((v) => (
                            <SelectItem key={v.id} value={String(v.id)}>
                              {v.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pickup Date</Label>
                        <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Dropoff Date</Label>
                        <Input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pickup Address</Label>
                      <Input placeholder="House no, street, city" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Dropoff Address</Label>
                      <Input placeholder="House no, street, city" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} />
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
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea placeholder="Any special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="text-sm text-muted-foreground">Estimated Cost</div>
                      <div className="font-semibold">₹{computeCost()}</div>
                    </div>
                    <Button disabled={!selectedVolunteer || loading} onClick={handleBook} className="w-full">
                      {loading ? 'Booking…' : 'Book'}
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
                        <CardTitle>Available Volunteers</CardTitle>
                        <CardDescription>Choose a volunteer for the selected dates</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 grid md:grid-cols-2 gap-4">
                    {available.length === 0 && (
                      <div className="text-sm text-muted-foreground col-span-full">
                        No volunteers available for the selected dates. Try different dates.
                      </div>
                    )}
                    {available.map(v => (
                      <div key={v.id} className={`p-4 rounded-xl border bg-gradient-to-r from-muted/30 to-card ${selectedVolunteer === v.id ? 'border-primary' : 'border-border'}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">{v.name}</div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{v.rating ?? '—'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">{v.bio || 'No bio provided'}</div>
                        <div className="text-sm mt-2"><span className="text-muted-foreground">Categories:</span> {v.categories || 'Dogs'}</div>
                        <div className="text-sm mt-1 text-primary">₹{v.rate_per_day.toFixed(2)} / day</div>
                        <div className="mt-3">
                          <Button variant={selectedVolunteer === v.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedVolunteer(v.id)}>
                            {selectedVolunteer === v.id ? 'Selected' : 'Select'}
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
                        <CardDescription>Your scheduled pickups and dropoffs</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    {bookings.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No bookings yet. Book your first caregiver service!</div>
                    ) : (
                      bookings.map(b => (
                        <div key={b.id} className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                          <div className="font-semibold">{format(new Date(b.pickup_date), 'MMM dd, yyyy')} → {format(new Date(b.dropoff_date), 'MMM dd, yyyy')}</div>
                          <div className="text-sm text-muted-foreground mt-1">Pickup: {b.pickup_address}</div>
                          <div className="text-sm text-muted-foreground">Dropoff: {b.dropoff_address}</div>
                          <div className="text-sm mt-2">Total: ₹{b.total_cost.toFixed(2)}</div>
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

export default PetCrutch;

