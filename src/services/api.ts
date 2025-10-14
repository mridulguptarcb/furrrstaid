// API service layer for frontend-backend communication
const API_BASE_URL = 'http://localhost:8000/api';

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
    const response = await fetch(`${API_BASE_URL}/pets`);
    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }
    return response.json();
  },

  // Get single pet
  async getPet(id: number): Promise<Pet> {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pet');
    }
    return response.json();
  },

  // Create new pet
  async createPet(pet: PetCreate): Promise<Pet> {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch checkup reminders');
    }
    return response.json();
  },

  // Get single checkup reminder
  async getCheckupReminder(id: number): Promise<CheckupReminder> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch checkup reminder');
    }
    return response.json();
  },

  // Create checkup reminder
  async createCheckupReminder(reminder: CheckupReminderCreate): Promise<CheckupReminder> {
    const response = await fetch(`${API_BASE_URL}/checkup-reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch vaccinations');
    }
    return response.json();
  },

  // Get single vaccination
  async getVaccination(id: number): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vaccination');
    }
    return response.json();
  },

  // Record vaccination (administered)
  async recordVaccination(vaccination: VaccinationRecordCreate): Promise<Vaccination> {
    const response = await fetch(`${API_BASE_URL}/vaccinations/record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    });
    if (!response.ok) {
      throw new Error('Failed to delete vaccination');
    }
  },
};

export const alertsAPI = {
  // Get upcoming alerts for dashboard
  async getUpcomingAlerts(days: number = 7): Promise<UpcomingAlert[]> {
    const response = await fetch(`${API_BASE_URL}/upcoming-alerts?days=${days}`);
    if (!response.ok) {
      throw new Error('Failed to fetch upcoming alerts');
    }
    return response.json();
  },
};
