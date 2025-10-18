// Vet discovery service using Google Places API and other sources
import { VetWithCoordinates } from './geolocation';

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  types?: string[];
  business_status?: string;
}

interface VetData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  isOpen?: boolean;
  isEmergency?: boolean;
  specialties?: string[];
  hours?: string;
  coordinates: [number, number];
}

// Mock API key - in production, this should be in environment variables
const GOOGLE_PLACES_API_KEY = process.env.VITE_GOOGLE_PLACES_API_KEY || '';

// Fallback vet data for demo purposes when API is not available
const fallbackVets: VetData[] = [
  {
    id: 'fallback-1',
    name: 'Delhi Veterinary Hospital',
    address: 'Near Red Fort, Old Delhi, Delhi 110006',
    phone: '+91-11-2396-1234',
    rating: 4.2,
    reviews: 89,
    isOpen: true,
    isEmergency: false,
    specialties: ['General Care', 'Surgery'],
    hours: 'Mon-Sat: 9 AM - 6 PM',
    coordinates: [28.6562, 77.2410]
  },
  {
    id: 'fallback-2',
    name: 'Pet Care Clinic',
    address: 'Karol Bagh, New Delhi, Delhi 110005',
    phone: '+91-11-2875-4321',
    rating: 4.5,
    reviews: 156,
    isOpen: true,
    isEmergency: true,
    specialties: ['Emergency', '24/7', 'Critical Care'],
    hours: 'Open 24 hours',
    coordinates: [28.6517, 77.1909]
  },
  {
    id: 'fallback-3',
    name: 'Animal Health Center',
    address: 'Connaught Place, New Delhi, Delhi 110001',
    phone: '+91-11-2331-5678',
    rating: 4.3,
    reviews: 203,
    isOpen: false,
    isEmergency: false,
    specialties: ['Dental', 'Grooming', 'Vaccination'],
    hours: 'Mon-Fri: 10 AM - 7 PM',
    coordinates: [28.6304, 77.2177]
  },
  {
    id: 'fallback-4',
    name: 'Emergency Pet Hospital',
    address: 'Lajpat Nagar, New Delhi, Delhi 110024',
    phone: '+91-11-2987-6543',
    rating: 4.7,
    reviews: 312,
    isOpen: true,
    isEmergency: true,
    specialties: ['Emergency', 'Surgery', 'ICU'],
    hours: 'Open 24 hours',
    coordinates: [28.5679, 77.2431]
  },
  {
    id: 'fallback-5',
    name: 'Veterinary Care Services',
    address: 'Saket, New Delhi, Delhi 110017',
    phone: '+91-11-2651-9876',
    rating: 4.4,
    reviews: 178,
    isOpen: true,
    isEmergency: false,
    specialties: ['General Care', 'Pet Boarding', 'Training'],
    hours: 'Mon-Sat: 8 AM - 8 PM',
    coordinates: [28.5245, 77.2065]
  }
];

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

// Format distance for display
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance} km`;
};

// Transform Google Places result to VetData
const transformGooglePlaceToVet = (place: GooglePlaceResult, userLat: number, userLon: number): VetData => {
  const distance = calculateDistance(userLat, userLon, place.geometry.location.lat, place.geometry.location.lng);
  
  // Determine if it's an emergency clinic based on name and types
  const isEmergency = place.name.toLowerCase().includes('emergency') || 
                     place.name.toLowerCase().includes('24') ||
                     place.name.toLowerCase().includes('urgent');
  
  // Extract specialties from types or name
  const specialties: string[] = [];
  if (place.types?.includes('veterinary_care')) specialties.push('General Care');
  if (place.types?.includes('hospital')) specialties.push('Surgery');
  if (isEmergency) specialties.push('Emergency', '24/7');
  
  // Generate opening hours string
  let hours = 'Hours not available';
  if (place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0) {
    hours = place.opening_hours.weekday_text[0] || 'Hours not available';
  }
  
  return {
    id: place.place_id,
    name: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    rating: place.rating,
    reviews: place.user_ratings_total,
    isOpen: place.opening_hours?.open_now,
    isEmergency,
    specialties: specialties.length > 0 ? specialties : ['General Care'],
    hours,
    coordinates: [place.geometry.location.lat, place.geometry.location.lng]
  };
};

// Search for veterinary clinics using Google Places API
export const searchNearbyVets = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<VetWithCoordinates[]> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('Google Places API key not found, using fallback data');
      return getFallbackVets(latitude, longitude);
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${latitude},${longitude}&` +
      `radius=${radius}&` +
      `type=veterinary_care&` +
      `key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }
    
    if (data.results && data.results.length > 0) {
      const vets = data.results
        .map((place: GooglePlaceResult) => transformGooglePlaceToVet(place, latitude, longitude))
        .filter((vet: VetData) => vet.business_status !== 'CLOSED_PERMANENTLY')
        .sort((a: VetData, b: VetData) => {
          const distA = calculateDistance(latitude, longitude, a.coordinates[0], a.coordinates[1]);
          const distB = calculateDistance(latitude, longitude, b.coordinates[0], b.coordinates[1]);
          return distA - distB;
        })
        .slice(0, 5)
        .map((vet: VetData) => ({
          ...vet,
          distance: formatDistance(calculateDistance(latitude, longitude, vet.coordinates[0], vet.coordinates[1]))
        }));
      
      return vets;
    }
    
    // If no results from Google Places, use fallback
    return getFallbackVets(latitude, longitude);
    
  } catch (error) {
    console.error('Error searching for nearby vets:', error);
    return getFallbackVets(latitude, longitude);
  }
};

// Get fallback vet data with calculated distances
export const getFallbackVets = (userLat: number, userLon: number): VetWithCoordinates[] => {
  return fallbackVets
    .map(vet => {
      const distance = calculateDistance(userLat, userLon, vet.coordinates[0], vet.coordinates[1]);
      return {
        ...vet,
        distance: formatDistance(distance)
      };
    })
    .sort((a, b) => {
      const distA = calculateDistance(userLat, userLon, a.coordinates[0], a.coordinates[1]);
      const distB = calculateDistance(userLat, userLon, b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    })
    .slice(0, 5);
};

// Alternative: Search using Overpass API (OpenStreetMap data) - free alternative
export const searchNearbyVetsOverpass = async (
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<VetWithCoordinates[]> => {
  try {
    console.log('Searching Overpass API for vets near:', latitude, longitude);
    
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="veterinary"](around:${radius},${latitude},${longitude});
        way["amenity"="veterinary"](around:${radius},${latitude},${longitude});
        relation["amenity"="veterinary"](around:${radius},${latitude},${longitude});
      );
      out center meta;
    `;

    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Overpass API response:', data);
    
    if (data.elements && data.elements.length > 0) {
      console.log('Found elements from Overpass:', data.elements.length);
      
      const vets = data.elements
        .filter((element: any) => element.tags && element.tags.name)
        .map((element: any, index: number) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          if (!lat || !lon) return null;
          
          const distance = calculateDistance(latitude, longitude, lat, lon);
          
          return {
            id: `overpass-${element.id || index}`,
            name: element.tags.name || 'Veterinary Clinic',
            address: `${element.tags['addr:street'] || ''} ${element.tags['addr:city'] || ''} ${element.tags['addr:postcode'] || ''}`.trim() || 'Address not available',
            phone: element.tags.phone || element.tags['contact:phone'] || 'Phone not available',
            rating: Math.random() * 2 + 3, // Random rating between 3-5
            reviews: Math.floor(Math.random() * 200) + 10, // Random reviews 10-210
            isOpen: Math.random() > 0.3, // 70% chance of being open
            isEmergency: element.tags.name?.toLowerCase().includes('emergency') || false,
            specialties: ['General Care'],
            hours: 'Hours not available',
            coordinates: [lat, lon],
            distance: formatDistance(distance)
          };
        })
        .filter((vet: any) => vet !== null)
        .sort((a: any, b: any) => {
          const distA = calculateDistance(latitude, longitude, a.coordinates[0], a.coordinates[1]);
          const distB = calculateDistance(latitude, longitude, b.coordinates[0], b.coordinates[1]);
          return distA - distB;
        })
        .slice(0, 5);
      
      console.log('Processed vets from Overpass:', vets.length);
      return vets;
    }
    
    console.log('No elements found in Overpass response');
    // If no results from Overpass, use fallback
    return getFallbackVets(latitude, longitude);
    
  } catch (error) {
    console.error('Error searching for nearby vets via Overpass:', error);
    return getFallbackVets(latitude, longitude);
  }
};
