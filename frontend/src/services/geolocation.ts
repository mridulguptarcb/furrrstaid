// Geolocation service for getting user location and calculating distances

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface VetWithCoordinates {
  id: number;
  name: string;
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isEmergency: boolean;
  specialties: string[];
  hours: string;
  coordinates: [number, number];
  distance?: number;
}

// Get user's current location
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // Fallback to Delhi coordinates if geolocation fails
        console.warn('Geolocation failed, using default location:', error.message);
        resolve({
          latitude: 28.6139,
          longitude: 77.2090,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) *
      Math.cos(toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Convert degrees to radians
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance} km`;
};

// Find nearby vets based on user location using backend API
import { buildApiUrl } from "@/lib/config";
export const findNearbyVets = async (
  userLocation?: Coordinates
): Promise<VetWithCoordinates[]> => {
  let location = userLocation;
  
  if (!location) {
    try {
      location = await getCurrentLocation();
    } catch (error) {
      console.error('Failed to get user location:', error);
      // Use Delhi as fallback
      location = { latitude: 28.6139, longitude: 77.2090 };
    }
  }

  console.log('Searching for vets near:', location);

  try {
    // Use backend API to search for nearby vets
    const response = await fetch(
      buildApiUrl(`/api/vets/search?latitude=${location.latitude}&longitude=${location.longitude}&radius_km=10&limit=5`)
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const vets = await response.json();
    console.log('Found vets via backend API:', vets.length);
    
    if (vets && vets.length > 0) {
      return vets;
    }
    
    // If no results from backend, use fallback
    console.log('No results from backend, using fallback data');
    const { getFallbackVets } = await import('./vetDiscovery');
    return getFallbackVets(location.latitude, location.longitude);
    
  } catch (error) {
    console.error('Error calling backend API, using fallback:', error);
    // Import and use fallback data directly
    const { getFallbackVets } = await import('./vetDiscovery');
    return getFallbackVets(location.latitude, location.longitude);
  }
};
