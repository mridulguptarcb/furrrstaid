import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Vet {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isEmergency: boolean;
  specialties: string[];
  hours: string;
  coordinates: [number, number];
}

interface MapProps {
  vets: Vet[];
  userLocation?: [number, number];
  onVetSelect?: (vet: Vet) => void;
  selectedVetId?: number;
}

// Custom component to handle map center updates
const MapCenterHandler = ({ userLocation }: { userLocation?: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 13);
    }
  }, [userLocation, map]);
  
  return null;
};

const Map = ({ vets, userLocation, onVetSelect, selectedVetId }: MapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  if (!mapLoaded) {
    return (
      <div className="h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = userLocation || [28.6139, 77.2090]; // Delhi coordinates as fallback

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterHandler userLocation={userLocation} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <MapPin className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Vet markers */}
        {vets.map((vet) => (
          <Marker 
            key={vet.id} 
            position={vet.coordinates}
            eventHandlers={{
              click: () => onVetSelect?.(vet),
            }}
          >
            <Popup>
              <div className="min-w-[250px] p-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm">{vet.name}</h3>
                  {vet.isEmergency && (
                    <Badge variant="destructive" className="text-xs">24/7</Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{vet.address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{vet.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{vet.hours}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{vet.rating}</span>
                    <span className="text-xs text-muted-foreground">({vet.reviews})</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{vet.distance}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {vet.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => window.location.href = `tel:${vet.phone}`}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.address)}`, '_blank')}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
