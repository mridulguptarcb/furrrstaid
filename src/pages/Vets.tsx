import { useState, useEffect } from "react";
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
  Filter,
  Loader2,
  RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import Map from "@/components/Map";
import { findNearbyVets, getCurrentLocation, Coordinates, VetWithCoordinates } from "@/services/geolocation";

const Vets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vets, setVets] = useState<VetWithCoordinates[]>([]);
  const [allVets, setAllVets] = useState<VetWithCoordinates[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVet, setSelectedVet] = useState<VetWithCoordinates | null>(null);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    openNow: false,
    emergency: false,
    highlyRated: false,
    all: true
  });


  // Load nearby vets based on user location
  useEffect(() => {
    const loadNearbyVets = async () => {
      setLoading(true);
      try {
        // Get user location
        const location = await getCurrentLocation();
        setUserLocation(location);
        
        // Find real nearby vets
        const nearbyVets = await findNearbyVets(location);
        setAllVets(nearbyVets);
        setVets(nearbyVets);
      } catch (error) {
        console.error('Error loading nearby vets:', error);
        // Set empty array if no vets found
        setVets([]);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyVets();
  }, []);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const handleVetSelect = (vet: VetWithCoordinates) => {
    setSelectedVet(vet);
  };

  const handleRefreshVets = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      const nearbyVets = await findNearbyVets(location);
      setAllVets(nearbyVets);
      applyFilters(nearbyVets, searchQuery, activeFilters);
    } catch (error) {
      console.error('Error refreshing vets:', error);
      setVets([]);
      setAllVets([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const applyFilters = (vetsToFilter: VetWithCoordinates[], query: string, filters: typeof activeFilters) => {
    let filteredVets = [...vetsToFilter];

    // Apply search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filteredVets = filteredVets.filter(vet => 
        vet.name.toLowerCase().includes(searchLower) ||
        vet.address.toLowerCase().includes(searchLower) ||
        vet.specialties?.some(specialty => specialty.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters.openNow) {
      filteredVets = filteredVets.filter(vet => vet.isOpen);
    }

    if (filters.emergency) {
      filteredVets = filteredVets.filter(vet => vet.isEmergency);
    }

    if (filters.highlyRated) {
      filteredVets = filteredVets.filter(vet => vet.rating && vet.rating >= 4.5);
    }

    setVets(filteredVets);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(allVets, query, activeFilters);
  };

  const toggleFilter = (filterType: keyof typeof activeFilters) => {
    const newFilters = { ...activeFilters };
    
    if (filterType === 'all') {
      // Reset all filters
      newFilters.all = true;
      newFilters.openNow = false;
      newFilters.emergency = false;
      newFilters.highlyRated = false;
    } else {
      // Toggle specific filter
      newFilters.all = false;
      newFilters[filterType] = !newFilters[filterType];
    }
    
    setActiveFilters(newFilters);
    applyFilters(allVets, searchQuery, newFilters);
  };

  const handleOpenNowClick = () => {
    const newFilters = { ...activeFilters };
    newFilters.all = false;
    newFilters.openNow = !newFilters.openNow;
    setActiveFilters(newFilters);
    applyFilters(allVets, searchQuery, newFilters);
  };

  const handleEmergencyClick = () => {
    const newFilters = { ...activeFilters };
    newFilters.all = false;
    newFilters.emergency = !newFilters.emergency;
    setActiveFilters(newFilters);
    applyFilters(allVets, searchQuery, newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Find Real Nearby Vets</h1>
            <p className="text-muted-foreground text-lg">
              Discover actual veterinary clinics near your location
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
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRefreshVets} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {(searchQuery || !activeFilters.all) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        toggleFilter('all');
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => toggleFilter('highlyRated')}
                    className={activeFilters.highlyRated ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Highly Rated
                    {activeFilters.highlyRated && (
                      <span className="ml-1 bg-white/20 px-1 rounded text-xs">
                        {allVets.filter(vet => vet.rating && vet.rating >= 4.5).length}
                      </span>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleOpenNowClick}
                    className={activeFilters.openNow ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Open Now
                    {activeFilters.openNow && (
                      <span className="ml-1 bg-white/20 px-1 rounded text-xs">
                        {allVets.filter(vet => vet.isOpen).length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge 
                  variant={activeFilters.all ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => toggleFilter('all')}
                >
                  All
                </Badge>
                <Badge 
                  variant={activeFilters.emergency ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={handleEmergencyClick}
                >
                  Emergency 24/7
                </Badge>
                <Badge 
                  variant={activeFilters.openNow ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={handleOpenNowClick}
                >
                  Open Now
                </Badge>
                <Badge 
                  variant={activeFilters.highlyRated ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => toggleFilter('highlyRated')}
                >
                  Highly Rated
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading map and finding nearby vets...</p>
                  </div>
                </div>
              ) : (
                <>
                  <Map 
                    vets={vets}
                    userLocation={userLocation ? [userLocation.latitude, userLocation.longitude] : undefined}
                    onVetSelect={handleVetSelect}
                    selectedVetId={selectedVet?.id}
                  />
                  {vets.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Found {vets.length} real veterinary clinics near your location
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Vet List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {vets.length === allVets.length 
                    ? "Top 5 Nearest Vets" 
                    : `${vets.length} Vets Found`
                  }
                </h2>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Searching for: "{searchQuery}"
                  </p>
                )}
                {(activeFilters.openNow || activeFilters.emergency || activeFilters.highlyRated) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Filters: {[
                      activeFilters.openNow && "Open Now",
                      activeFilters.emergency && "Emergency",
                      activeFilters.highlyRated && "Highly Rated"
                    ].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-sm text-muted-foreground">Sorted by distance</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || !activeFilters.all ? "No vets match your criteria" : "No vets found"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || !activeFilters.all 
                      ? "Try adjusting your search terms or filters to see more results."
                      : "Try adjusting your location or refresh to find nearby vets."
                    }
                  </p>
                  {(searchQuery || !activeFilters.all) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("");
                        toggleFilter('all');
                      }}
                    >
                      Clear all filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              vets.map((vet) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vets;
