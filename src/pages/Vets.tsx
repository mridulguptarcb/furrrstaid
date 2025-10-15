import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Navigation,
  Search,
  Filter
} from "lucide-react";
import Header from "@/components/Header";

const Vets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock vet data
  const vets = [
    {
      id: 1,
      name: "24*7 Pet Clinic-Best",
      address: "24*7 Pet Clinic-Best, A-10, Vikas Marg, near Apsara Saree, opposite Metro Piller No 80, Block A, Swasthya Vihar, Delhi, 110092",
      phone: "093109 28060",
      distance: "0.8 km",
      rating: 4.8,
      reviews: 234,
      isOpen: true,
      isEmergency: true,
      specialties: ["Emergency", "Surgery", "24/7"],
      hours: "Open 24 hours"
    },
    {
      id: 2,
      name: "Wet-Pets",
      address: "Wet-pets,7/181, Raja Ram Kohli Marg, Block 7, Geeta Colony, Delhi, 110031",
      phone: "9540359475",
      distance: "1.2 km",
      rating: 4.9,
      reviews: 456,
      isOpen: true,
      isEmergency: false,
      specialties: ["General Care", "Dental", "Grooming"],
      hours: "Mon-Sat: 8 AM - 6 PM"
    },
    {
      id: 3,
      name: "Govt Veterinary Hospital Seelampur",
      address: "Govt Veterinary Hospital,M7CF+H7G, North Kanti Nagar, Block C, Seelampur, Shahdara, Delhi, 110053",
      phone: "9811456237",
      distance: "2.1 km",
      rating: 4.7,
      reviews: 189,
      isOpen: true,
      isEmergency: true,
      specialties: ["Emergency", "Exotic Pets", "Cardiology"],
      hours: "Open 24 hours"
    },
    {
      id: 4,
      name: "Shahdara Government Veterinary Hospital Delhi",
      address: "Goverment Veterinary,M7HW+W9X, Circular Rd, छोटा बाजार, Jawala Nagar, Shahdara, Delhi, 110032",
      phone: "9672585124",
      distance: "3.5 km",
      rating: 4.6,
      reviews: 123,
      isOpen: false,
      isEmergency: false,
      specialties: ["Farm Animals", "General Care"],
      hours: "Mon-Fri: 9 AM - 5 PM"
    },
    {
      id: 5,
      name: "Life line dog clinic and pet care",
      address: "Life line clinic , 26/5, backside of Manohar Bikkaneri Delhi 110051, Krishna Nagar, New Delhi, Delhi 110051",
      phone: "9990388951",
      distance: "4.2 km",
      rating: 4.9,
      reviews: 312,
      isOpen: true,
      isEmergency: false,
      specialties: ["Surgery", "Oncology", "Rehabilitation"],
      hours: "Mon-Sat: 7 AM - 7 PM"
    }
  ];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Find Nearby Vets</h1>
            <p className="text-muted-foreground text-lg">
              Trusted veterinary care when you need it most
            </p>
          </div>

          {/* Search & Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, specialty, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    Open Now
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  All
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Emergency 24/7
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Open Now
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  Highly Rated
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card className="mb-8 overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgc3Ryb2tlPSJyZ2JhKDI2LCAxNjcsIDE2NywgMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
              <div className="text-center z-10">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Map view showing {vets.length} nearby vets</p>
              </div>
            </div>
          </Card>

          {/* Vet List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{vets.length} Vets Near You</h2>
              <span className="text-sm text-muted-foreground">Sorted by distance</span>
            </div>

            {vets.map((vet) => (
              <Card key={vet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{vet.name}</CardTitle>
                        {vet.isEmergency && (
                          <Badge variant="destructive" className="ml-2">24/7 Emergency</Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{vet.address}</span>
                          <Badge variant="outline" className="ml-2">{vet.distance}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{vet.hours}</span>
                          {vet.isOpen && (
                            <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">
                              Open Now
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{vet.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-lg">{vet.rating}</span>
                        <span className="text-sm text-muted-foreground">({vet.reviews})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vet.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleCall(vet.phone)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDirections(vet.address)}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vets;
