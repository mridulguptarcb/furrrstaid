// API service layer for frontend-backend communication
import { buildApiUrl } from "@/lib/config";
const API_BASE_URL = buildApiUrl('/api');

// Function to get the authentication token from local storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token'); // Corrected key to 'token'
};

// Function to create headers with authorization
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Types
export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months: number;
  weight_kg: number;
  gender: string;
  color?: string;
  microchip_id?: string;
  medical_notes?: string;
  emergency_contact?: string;
  vet_name?: string;
  vet_phone?: string;
  last_vaccination?: string;
  next_vaccination_due?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PetCreate {
  name: string;
  species: string;
  breed: string;
  age_years: number;
  age_months?: number;
  weight_kg: number;
  gender: string;
  color?: string;
  microchip_id?: string;
  medical_notes?: string;
  emergency_contact?: string;
  vet_name?: string;
  vet_phone?: string;
  // Enhanced fields
  birth_date?: string;
  neutered?: boolean;
  allergies?: string;
  medications?: string;
  last_vet_visit?: string;
  insurance_info?: string;
  behavioral_notes?: string;
  special_needs?: string;
}

export interface PetUpdate {
  name?: string;
  species?: string;
  breed?: string;
  age_years?: number;
  age_months?: number;
  weight_kg?: number;
  gender?: string;
  color?: string;
  microchip_id?: string;
  medical_notes?: string;
  emergency_contact?: string;
  vet_name?: string;
  vet_phone?: string;
}

export interface Species {
  id: number;
  name: string;
  icon?: string;
}

export interface Breed {
  id: number;
  name: string;
  species_id: number;
}

export interface CheckupReminder {
  id: number;
  pet_id: number;
  title: string;
  description?: string;
  checkup_type: string;
  due_date: string;
  due_time: string;
  priority: string;
  location?: string;
  vet_name?: string;
  vet_phone?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_hours: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckupReminderCreate {
  pet_id: number;
  title: string;
  description?: string;
  checkup_type: string;
  due_date: string;
  due_time: string;
  priority: string;
  location?: string;
  vet_name?: string;
  vet_phone?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_hours: number;
}

export interface Vaccination {
  id: number;
  pet_id: number;
  vaccine_name: string;
  vaccine_type: string;
  date_administered?: string;
  next_due_date?: string;
  veterinarian?: string;
  batch_number?: string;
  notes?: string;
  is_scheduled: boolean;
  scheduled_date?: string;
  scheduled_time?: string;
  location?: string;
  vet_phone?: string;
  reminder_enabled: boolean;
  reminder_hours: number;
  created_at: string;
  updated_at: string;
}

export interface VaccinationRecordCreate {
  pet_id: number;
  vaccine_name: string;
  vaccine_type: string;
  date_administered: string;
  next_due_date?: string;
  veterinarian?: string;
  batch_number?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_hours: number;
}

export interface VaccinationScheduleCreate {
  pet_id: number;
  vaccine_name: string;
  vaccine_type: string;
  scheduled_date: string;
  scheduled_time: string;
  location?: string;
  veterinarian?: string;
  vet_phone?: string;
  notes?: string;
  reminder_enabled: boolean;
  reminder_hours: number;
}

export interface UpcomingAlert {
  id: string;
  pet_id: number;
  pet_name: string;
  title: string;
  type: string;
  due_date: string;
  due_time: string;
  priority: string;
  location?: string;
  veterinarian?: string;
  days_until_due: number;
  status: string;
}

// API functions
export const petAPI = {
  // Get all pets
  async getPets(): Promise<Pet[]> {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }
    return response.json();
  },

  // Get single pet
  async getPet(id: number): Promise<Pet> {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pet');
    }
    return response.json();
  },

  // Create new pet
  async createPet(pet: PetCreate): Promise<Pet> {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pet),
    });
    if (!response.ok) {
      throw new Error('Failed to create pet');
    }
    return response.json();
  },

  // Update pet
  async updatePet(id: number, pet: PetUpdate): Promise<Pet> {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pet),
    });
    if (!response.ok) {
      throw new Error('Failed to update pet');
    }
    return response.json();
  },

  // Delete pet
  async deletePet(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete pet');
    }
  },
};

export const speciesAPI = {
  // Get all species
  async getSpecies(): Promise<Species[]> {
    const response = await fetch(`${API_BASE_URL}/species`);
    if (!response.ok) {
      throw new Error('Failed to fetch species');
    }
    return response.json();
  },
};

export const breedAPI = {
  // Get all breeds
  async getBreeds(speciesId?: number): Promise<Breed[]> {
    const url = speciesId 
      ? `${API_BASE_URL}/breeds?species_id=${speciesId}`
      : `${API_BASE_URL}/breeds`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch breeds');
    }
    return response.json();
  },

  // Get breeds by species name
  async getBreedsBySpecies(speciesName: string): Promise<Breed[]> {
    const response = await fetch(`${API_BASE_URL}/breeds/by-species/${speciesName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch breeds');
    }
    return response.json();
  },
};

export const checkupReminderAPI = {
  // Get all checkup reminders
  async getCheckupReminders(petId?: number): Promise<CheckupReminder[]> {
    const url = petId 
      ? `${API_BASE_URL}/checkup-reminders?pet_id=${petId}`
      : `${API_BASE_URL}/checkup-reminders`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch checkup reminders');
    }
    return response.json();
  },

  // Get single checkup reminder
  async getCheckupReminder(id: number): Promise<CheckupReminder> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch checkup reminder');
    }
    return response.json();
  },

  // Create checkup reminder
  async createCheckupReminder(reminder: CheckupReminderCreate): Promise<CheckupReminder> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder),
    });
    if (!response.ok) {
      throw new Error('Failed to create checkup reminder');
    }
    return response.json();
  },

  // Update checkup reminder
  async updateCheckupReminder(id: number, reminder: Partial<CheckupReminderCreate>): Promise<CheckupReminder> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder),
    });
    if (!response.ok) {
      throw new Error('Failed to update checkup reminder');
    }
    return response.json();
  },

  // Delete checkup reminder
  async deleteCheckupReminder(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete checkup reminder');
    }
  },
};

export const vaccinationAPI = {
  // Get all vaccinations
  async getVaccinations(petId?: number, isScheduled?: boolean): Promise<Vaccination[]> {
    let url = `${API_BASE_URL}/vaccinations`;
    const params = new URLSearchParams();
    if (petId) params.append('pet_id', petId.toString());
    if (isScheduled !== undefined) params.append('is_scheduled', isScheduled.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccinations');
    }
    return response.json();
  },

  // Get single vaccination
  async getVaccination(id: number): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination');
    }
    return response.json();
  },

  // Record vaccination (administered)
  async recordVaccination(vaccination: VaccinationRecordCreate): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/record`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vaccination),
    });
    if (!response.ok) {
      throw new Error('Failed to record vaccination');
    }
    return response.json();
  },

  // Schedule vaccination (appointment)
  async scheduleVaccination(vaccination: VaccinationScheduleCreate): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/schedule`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(vaccination),
    });
    if (!response.ok) {
      throw new Error('Failed to schedule vaccination');
    }
    return response.json();
  },

  // Update vaccination
  async updateVaccination(id: number, vaccination: Partial<VaccinationRecordCreate | VaccinationScheduleCreate>): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(vaccination),
    });
    if (!response.ok) {
      throw new Error('Failed to update vaccination');
    }
    return response.json();
  },

  // Delete vaccination
  async deleteVaccination(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete vaccination');
    }
  },
};

export const alertsAPI = {
  // Get upcoming alerts for dashboard
  async getUpcomingAlerts(days: number = 7): Promise<UpcomingAlert[]> {
    const response = await fetch(`${API_BASE_URL}/upcoming-alerts?days=${days}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming alerts');
    }
    return response.json();
  },
};

// Weight logs
export interface WeightLog {
  id: number;
  pet_id: number;
  weight_kg: number;
  date: string; // ISO string
  notes?: string;
  body_condition_score?: number;
  activity_level?: string;
  feeding_amount?: string;
  created_at: string;
  updated_at: string;
}

export interface WeightLogCreate {
  pet_id: number;
  weight_kg: number;
  date: string; // ISO
  notes?: string;
  body_condition_score?: number;
  activity_level?: string;
  feeding_amount?: string;
}

export const weightAPI = {
  async getWeightLogs(petId: number): Promise<WeightLog[]> {
    const response = await fetch(`${API_BASE_URL}/weight-logs?pet_id=${petId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch weight logs');
    }
    return response.json();
  },

  async createWeightLog(payload: WeightLogCreate): Promise<WeightLog> {
    const response = await fetch(`${API_BASE_URL}/weight-logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to create weight log');
    }
    return response.json();
  },
};

// Walkers and walk bookings
export interface Walker {
  id: number;
  name: string;
  bio?: string;
  rate_per_hour: number;
  rating?: number;
  categories?: string; // comma-separated
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalkerCreate {
  name: string;
  bio?: string;
  rate_per_hour: number;
  rating?: number;
  categories?: string;
  is_active?: boolean;
}

export interface WalkBooking {
  id: number;
  pet_id: number;
  walker_id: number;
  scheduled_date: string; // ISO
  scheduled_time: string;
  duration_minutes: number;
  total_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WalkBookingCreate {
  pet_id: number;
  walker_id: number;
  scheduled_date: string; // ISO
  scheduled_time: string;
  duration_minutes: number;
  notes?: string;
}

export const walkersAPI = {
  async getWalkers(): Promise<Walker[]> {
    const response = await fetch(`${API_BASE_URL}/walkers`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch walkers');
    return response.json();
  },
  async createWalker(payload: WalkerCreate): Promise<Walker> {
    const response = await fetch(`${API_BASE_URL}/walkers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create walker');
    return response.json();
  },
};

export const walkBookingsAPI = {
  async getBookings(petId?: number): Promise<WalkBooking[]> {
    const url = petId ? `${API_BASE_URL}/walk-bookings?pet_id=${petId}` : `${API_BASE_URL}/walk-bookings`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch walk bookings');
    return response.json();
  },
  async createBooking(payload: WalkBookingCreate): Promise<WalkBooking> {
    const response = await fetch(`${API_BASE_URL}/walk-bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create walk booking');
    return response.json();
  },
};

// Pet Crutch (boarding/pick & drop)
export interface CrutchVolunteer {
  id: number;
  name: string;
  bio?: string;
  rate_per_day: number;
  rating?: number;
  categories?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrutchVolunteerCreate {
  name: string;
  bio?: string;
  rate_per_day: number;
  rating?: number;
  categories?: string;
  is_active?: boolean;
}

export interface CrutchBooking {
  id: number;
  pet_id: number;
  volunteer_id: number;
  pickup_date: string;
  dropoff_date: string;
  pickup_address: string;
  dropoff_address: string;
  total_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CrutchBookingCreate {
  pet_id: number;
  volunteer_id: number;
  pickup_date: string;
  dropoff_date: string;
  pickup_address: string;
  dropoff_address: string;
  notes?: string;
}

export const crutchVolunteersAPI = {
  async getVolunteers(): Promise<CrutchVolunteer[]> {
    const response = await fetch(`${API_BASE_URL}/crutch-volunteers`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch crutch volunteers');
    return response.json();
  },
  async createVolunteer(payload: CrutchVolunteerCreate): Promise<CrutchVolunteer> {
    const response = await fetch(`${API_BASE_URL}/crutch-volunteers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create crutch volunteer');
    return response.json();
  },
};

export const crutchBookingsAPI = {
  async getBookings(petId?: number): Promise<CrutchBooking[]> {
    const url = petId ? `${API_BASE_URL}/crutch-bookings?pet_id=${petId}` : `${API_BASE_URL}/crutch-bookings`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch crutch bookings');
    return response.json();
  },
  async createBooking(payload: CrutchBookingCreate): Promise<CrutchBooking> {
    const response = await fetch(`${API_BASE_URL}/crutch-bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create crutch booking');
    return response.json();
  },
};

export const userAPI = {
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    return response.json();
  },
  
  getUserName: async () => {
    const response = await fetch(`${API_BASE_URL}/user/name`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user name');
    }
    return response.json();
  },
};

// Stats API
export const statsAPI = {
  getGeminiCallCount: async () => {
    const response = await fetch(`${API_BASE_URL}/stats/gemini-calls`);
    if (!response.ok) {
      throw new Error('Failed to fetch Gemini API call count');
    }
    return response.json();
  },
};

export const aiAPI = {
  generateDietPlan: async (prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/ai/gemini`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }
    return response.json();
  },
};
