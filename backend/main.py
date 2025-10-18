from fastapi import FastAPI, HTTPException, Depends
from fastapi import Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr, ConfigDict
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
from datetime import datetime, date
import uvicorn
import httpx
import google.generativeai as genai
from fastapi.staticfiles import StaticFiles
import os


# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./furrstaid.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    
    # Relationships
    pets = relationship("Pet", back_populates="user")

class Pet(Base):
    __tablename__ = "pets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)
    breed = Column(String(100), nullable=False)
    age_years = Column(Integer, nullable=False)
    age_months = Column(Integer, default=0)
    weight_kg = Column(Float, nullable=False)
    gender = Column(String(20), nullable=False)
    color = Column(String(50), nullable=True)
    microchip_id = Column(String(50), nullable=True)
    medical_notes = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    vet_name = Column(String(100), nullable=True)
    vet_phone = Column(String(20), nullable=True)
    last_vaccination = Column(DateTime, nullable=True)
    next_vaccination_due = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    checkup_reminders = relationship("CheckupReminder", back_populates="pet")
    vaccinations = relationship("Vaccination", back_populates="pet")
    user = relationship("User", back_populates="pets")

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False, index=True)
    weight_kg = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    body_condition_score = Column(Integer, nullable=True)
    activity_level = Column(String(50), nullable=True)
    feeding_amount = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pet = relationship("Pet")

class Walker(Base):
    __tablename__ = "walkers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    rate_per_hour = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    categories = Column(Text, nullable=True)  # comma-separated, e.g., "Dogs,Cats"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WalkBooking(Base):
    __tablename__ = "walk_bookings"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    walker_id = Column(Integer, ForeignKey("walkers.id"), nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    scheduled_time = Column(String(10), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    total_cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pet = relationship("Pet")
    # no backref needed; keep simple

class CrutchVolunteer(Base):
    __tablename__ = "crutch_volunteers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    rate_per_day = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    categories = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CrutchBooking(Base):
    __tablename__ = "crutch_bookings"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("crutch_volunteers.id"), nullable=False)
    pickup_date = Column(DateTime, nullable=False)
    dropoff_date = Column(DateTime, nullable=False)
    pickup_address = Column(Text, nullable=False)
    dropoff_address = Column(Text, nullable=False)
    total_cost = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pet = relationship("Pet")

class Species(Base):
    __tablename__ = "species"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(20), nullable=True)

class Breed(Base):
    __tablename__ = "breeds"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    species_id = Column(Integer, nullable=False)

class CheckupReminder(Base):
    __tablename__ = "checkup_reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    checkup_type = Column(String(50), nullable=False)
    due_date = Column(DateTime, nullable=False)
    due_time = Column(String(10), nullable=False)
    priority = Column(String(20), nullable=False, default="medium")
    location = Column(String(200), nullable=True)
    vet_name = Column(String(100), nullable=True)
    vet_phone = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    reminder_enabled = Column(Boolean, default=True)
    reminder_hours = Column(Integer, default=24)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    pet = relationship("Pet", back_populates="checkup_reminders")

class Vaccination(Base):
    __tablename__ = "vaccinations"
    
    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    vaccine_name = Column(String(200), nullable=False)
    vaccine_type = Column(String(50), nullable=False)
    date_administered = Column(DateTime, nullable=True)  # Null for scheduled vaccinations
    next_due_date = Column(DateTime, nullable=True)
    veterinarian = Column(String(100), nullable=True)
    batch_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    is_scheduled = Column(Boolean, default=False)  # True for scheduled, False for administered
    scheduled_date = Column(DateTime, nullable=True)
    scheduled_time = Column(String(10), nullable=True)
    location = Column(String(200), nullable=True)
    vet_phone = Column(String(20), nullable=True)
    reminder_enabled = Column(Boolean, default=True)
    reminder_hours = Column(Integer, default=24)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    pet = relationship("Pet", back_populates="vaccinations")

class Vet(Base):
    __tablename__ = "vets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, nullable=True)
    reviews_count = Column(Integer, default=0)
    is_open = Column(Boolean, default=True)
    is_emergency = Column(Boolean, default=False)
    specialties = Column(Text, nullable=True)  # JSON string of specialties
    hours = Column(Text, nullable=True)  # Opening hours
    website = Column(String(200), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class PetBase(BaseModel):
    name: str
    species: str
    breed: str
    age_years: int
    age_months: int = 0
    weight_kg: float
    gender: str
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    vet_name: Optional[str] = None
    vet_phone: Optional[str] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    age_years: Optional[int] = None
    age_months: Optional[int] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    color: Optional[str] = None
    microchip_id: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    vet_name: Optional[str] = None
    vet_phone: Optional[str] = None

class PetResponse(PetBase):
    id: int
    last_vaccination: Optional[datetime] = None
    next_vaccination_due: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SpeciesResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    
    class Config:
        from_attributes = True

class BreedResponse(BaseModel):
    id: int
    name: str
    species_id: int
    
    class Config:
        from_attributes = True

class CheckupReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    checkup_type: str
    due_date: datetime
    due_time: str
    priority: str = "medium"
    location: Optional[str] = None
    vet_name: Optional[str] = None
    vet_phone: Optional[str] = None
    notes: Optional[str] = None
    reminder_enabled: bool = True
    reminder_hours: int = 24

class CheckupReminderCreate(CheckupReminderBase):
    pet_id: int

class CheckupReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    checkup_type: Optional[str] = None
    due_date: Optional[datetime] = None
    due_time: Optional[str] = None
    priority: Optional[str] = None
    location: Optional[str] = None
    vet_name: Optional[str] = None
    vet_phone: Optional[str] = None
    notes: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_hours: Optional[int] = None
    is_completed: Optional[bool] = None

class CheckupReminderResponse(CheckupReminderBase):
    id: int
    pet_id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class VaccinationBase(BaseModel):
    vaccine_name: str
    vaccine_type: str
    veterinarian: Optional[str] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None
    reminder_enabled: bool = True
    reminder_hours: int = 24

class VaccinationRecordCreate(VaccinationBase):
    pet_id: int
    date_administered: datetime
    next_due_date: Optional[datetime] = None

class VaccinationScheduleCreate(VaccinationBase):
    pet_id: int
    scheduled_date: datetime
    scheduled_time: str
    location: Optional[str] = None
    vet_phone: Optional[str] = None

class VaccinationUpdate(BaseModel):
    vaccine_name: Optional[str] = None
    vaccine_type: Optional[str] = None
    date_administered: Optional[datetime] = None
    next_due_date: Optional[datetime] = None
    veterinarian: Optional[str] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None
    is_scheduled: Optional[bool] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    location: Optional[str] = None
    vet_phone: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    reminder_hours: Optional[int] = None

class VaccinationResponse(VaccinationBase):
    id: int
    pet_id: int
    date_administered: Optional[datetime] = None
    next_due_date: Optional[datetime] = None
    is_scheduled: bool
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    location: Optional[str] = None
    vet_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WeightLogBase(BaseModel):
    pet_id: int
    weight_kg: float
    date: datetime
    notes: Optional[str] = None
    body_condition_score: Optional[int] = None
    activity_level: Optional[str] = None
    feeding_amount: Optional[str] = None

class WeightLogCreate(WeightLogBase):
    pass

class WeightLogResponse(WeightLogBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WalkerBase(BaseModel):
    name: str
    bio: Optional[str] = None
    rate_per_hour: float
    rating: Optional[float] = None
    categories: Optional[str] = None
    is_active: bool = True

class WalkerCreate(WalkerBase):
    pass

class WalkerResponse(WalkerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WalkBookingBase(BaseModel):
    pet_id: int
    walker_id: int
    scheduled_date: datetime
    scheduled_time: str
    duration_minutes: int
    notes: Optional[str] = None

class WalkBookingCreate(WalkBookingBase):
    pass

class WalkBookingResponse(WalkBookingBase):
    id: int
    total_cost: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CrutchVolunteerBase(BaseModel):
    name: str
    bio: Optional[str] = None
    rate_per_day: float
    rating: Optional[float] = None
    categories: Optional[str] = None
    is_active: bool = True

class CrutchVolunteerCreate(CrutchVolunteerBase):
    pass

class CrutchVolunteerResponse(CrutchVolunteerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CrutchBookingBase(BaseModel):
    pet_id: int
    volunteer_id: int
    pickup_date: datetime
    dropoff_date: datetime
    pickup_address: str
    dropoff_address: str
    notes: Optional[str] = None

class CrutchBookingCreate(CrutchBookingBase):
    pass

class CrutchBookingResponse(CrutchBookingBase):
    id: int
    total_cost: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VetBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    latitude: float
    longitude: float
    rating: Optional[float] = None
    reviews_count: int = 0
    is_open: bool = True
    is_emergency: bool = False
    specialties: Optional[str] = None  # JSON string
    hours: Optional[str] = None
    website: Optional[str] = None

class VetCreate(VetBase):
    pass

class VetResponse(VetBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VetSearchRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0
    limit: int = 5

SECRET_KEY = "b6f8e9c8f25a4f7b2ad90e1a6a55a5b6f1a6c88b2a4478b6e5a77c9b3a9f0f2a"  # replace with env variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# -----------------------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None

    class Config:
        from_attributes = True



# FastAPI app
app = FastAPI(title="FurrstAid API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8081","http://localhost:8080"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from passlib.context import CryptContext

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
from fastapi import Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")  # tokenUrl points to your login endpoint

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme, use_cache=True), db: Session = Depends(get_db)):
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None
    return user

@app.get("/user/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get the profile of the currently logged in user"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone
    }

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None

@app.put("/user/update")
def update_user(user_data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the current user's profile information"""
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    
    db.commit()
    return {"message": "Profile updated successfully"}

@app.get("/stats/user-count")
def get_user_count(db: Session = Depends(get_db)):
    """Get the total number of users in the database"""
    count = db.query(User).count()
    return {"count": count}

# Initialize default data
def init_default_data():
    db = SessionLocal()
    try:
        # --- Lightweight migrations for SQLite ---
        # Ensure 'categories' column exists on walkers (added later)
        try:
            with engine.connect() as conn:
                cols = conn.execute(text("PRAGMA table_info('walkers')")).fetchall()
                col_names = {row[1] for row in cols} if cols else set()
                if 'categories' not in col_names:
                    conn.execute(text("ALTER TABLE walkers ADD COLUMN categories TEXT"))
        except Exception as _:
            # Ignore migration error; table may not exist yet (will be created by metadata)
            pass

        # Ensure crutch volunteers table exists columns (safe no-op if fresh)
        try:
            with engine.connect() as conn:
                conn.execute(text("PRAGMA table_info('crutch_volunteers')"))
                conn.execute(text("PRAGMA table_info('crutch_bookings')"))
        except Exception as _:
            pass

        # Check if species already exist
        if db.query(Species).count() == 0:
            species_data = [
                {"name": "Dog", "icon": "🐕"},
                {"name": "Cat", "icon": "🐱"},
                {"name": "Bird", "icon": "🐦"},
                {"name": "Rabbit", "icon": "🐰"},
                {"name": "Hamster", "icon": "🐹"},
                {"name": "Fish", "icon": "🐠"},
                {"name": "Turtle", "icon": "🐢"},
                {"name": "Other", "icon": "🐾"}
            ]
            
            for species in species_data:
                db_species = Species(**species)
                db.add(db_species)
            
            db.commit()
            
            # Add breeds
            breeds_data = [
                # Dog breeds
                {"name": "Golden Retriever", "species_id": 1},
                {"name": "Labrador Retriever", "species_id": 1},
                {"name": "German Shepherd", "species_id": 1},
                {"name": "French Bulldog", "species_id": 1},
                {"name": "Bulldog", "species_id": 1},
                {"name": "Poodle", "species_id": 1},
                {"name": "Beagle", "species_id": 1},
                {"name": "Rottweiler", "species_id": 1},
                {"name": "Siberian Husky", "species_id": 1},
                {"name": "Pitbull", "species_id": 1},
                {"name": "Border Collie", "species_id": 1},
                {"name": "Chihuahua", "species_id": 1},
                {"name": "Dachshund", "species_id": 1},
                {"name": "Yorkshire Terrier", "species_id": 1},
                {"name": "Mixed Breed", "species_id": 1},
                
                # Cat breeds
                {"name": "Persian", "species_id": 2},
                {"name": "Maine Coon", "species_id": 2},
                {"name": "British Shorthair", "species_id": 2},
                {"name": "Ragdoll", "species_id": 2},
                {"name": "Siamese", "species_id": 2},
                {"name": "American Shorthair", "species_id": 2},
                {"name": "Scottish Fold", "species_id": 2},
                {"name": "Sphynx", "species_id": 2},
                {"name": "Bengal", "species_id": 2},
                {"name": "Russian Blue", "species_id": 2},
                {"name": "Abyssinian", "species_id": 2},
                {"name": "Mixed Breed", "species_id": 2},
                
                # Bird breeds
                {"name": "Budgerigar", "species_id": 3},
                {"name": "Cockatiel", "species_id": 3},
                {"name": "Canary", "species_id": 3},
                {"name": "Lovebird", "species_id": 3},
                {"name": "Conure", "species_id": 3},
                {"name": "Cockatoo", "species_id": 3},
                {"name": "African Grey", "species_id": 3},
                {"name": "Macaw", "species_id": 3},
                {"name": "Finch", "species_id": 3},
                {"name": "Parakeet", "species_id": 3},
                {"name": "Mixed Breed", "species_id": 3},
                
                # Rabbit breeds
                {"name": "Holland Lop", "species_id": 4},
                {"name": "Netherland Dwarf", "species_id": 4},
                {"name": "Lionhead", "species_id": 4},
                {"name": "Flemish Giant", "species_id": 4},
                {"name": "Rex", "species_id": 4},
                {"name": "Mini Rex", "species_id": 4},
                {"name": "English Lop", "species_id": 4},
                {"name": "French Lop", "species_id": 4},
                {"name": "Himalayan", "species_id": 4},
                {"name": "Dutch", "species_id": 4},
                {"name": "Mixed Breed", "species_id": 4},
                
                # Hamster breeds
                {"name": "Syrian Hamster", "species_id": 5},
                {"name": "Dwarf Hamster", "species_id": 5},
                {"name": "Roborovski", "species_id": 5},
                {"name": "Chinese Hamster", "species_id": 5},
                {"name": "European Hamster", "species_id": 5},
                {"name": "Mixed Breed", "species_id": 5},
                
                # Fish breeds
                {"name": "Goldfish", "species_id": 6},
                {"name": "Betta", "species_id": 6},
                {"name": "Guppy", "species_id": 6},
                {"name": "Angelfish", "species_id": 6},
                {"name": "Tetra", "species_id": 6},
                {"name": "Cichlid", "species_id": 6},
                {"name": "Discus", "species_id": 6},
                {"name": "Koi", "species_id": 6},
                {"name": "Mixed Breed", "species_id": 6},
                
                # Turtle breeds
                {"name": "Red-Eared Slider", "species_id": 7},
                {"name": "Box Turtle", "species_id": 7},
                {"name": "Russian Tortoise", "species_id": 7},
                {"name": "Hermann's Tortoise", "species_id": 7},
                {"name": "Greek Tortoise", "species_id": 7},
                {"name": "Sulcata Tortoise", "species_id": 7},
                {"name": "Painted Turtle", "species_id": 7},
                {"name": "Yellow-Bellied Slider", "species_id": 7},
                {"name": "Mixed Breed", "species_id": 7},
                
                # Other breeds
                {"name": "Guinea Pig", "species_id": 8},
                {"name": "Chinchilla", "species_id": 8},
                {"name": "Ferret", "species_id": 8},
                {"name": "Hedgehog", "species_id": 8},
                {"name": "Sugar Glider", "species_id": 8},
                {"name": "Mixed Breed", "species_id": 8},
            ]
            
            for breed in breeds_data:
                db_breed = Breed(**breed)
                db.add(db_breed)
            
            db.commit()
            
        # Seed mock walkers
        # Replace older English mock walkers with Indian mock walkers if present
        old_mock_names = ["Alex Johnson", "Priya Desai", "Marco Rossi", "Sofia Nguyen"]
        existing_old_mocks = db.query(Walker).filter(Walker.name.in_(old_mock_names)).all()
        if existing_old_mocks:
            for ow in existing_old_mocks:
                db.delete(ow)
            db.commit()

        # Ensure Indian mock walkers exist (idempotent upsert-like behavior)
        desired_walkers = [
            {"name": "Rahul Sharma", "bio": "Fitness enthusiast, great with energetic breeds.", "rate_per_hour": 300.0, "rating": 4.8, "categories": "Dogs", "is_active": True},
            {"name": "Aisha Khan", "bio": "Gentle with small and senior pets.", "rate_per_hour": 350.0, "rating": 4.9, "categories": "Dogs,Cats", "is_active": True},
            {"name": "Vikram Iyer", "bio": "Loves long park walks and trail routes.", "rate_per_hour": 400.0, "rating": 4.7, "categories": "Dogs", "is_active": True},
            {"name": "Neha Patel", "bio": "Weekend walks and evening slots available.", "rate_per_hour": 320.0, "rating": 4.6, "categories": "Dogs,Birds", "is_active": True},
        ]
        existing_names = {w.name for w in db.query(Walker).all()}
        added_any = False
        for w in desired_walkers:
            if w["name"] not in existing_names:
                db.add(Walker(**w))
                added_any = True
        if added_any:
            db.commit()

        # Seed crutch volunteers if none or missing
        desired_crutch = [
            {"name": "Ananya Gupta", "bio": "Loving home boarding with daily updates.", "rate_per_day": 800.0, "rating": 4.9, "categories": "Dogs,Cats", "is_active": True},
            {"name": "Rohit Verma", "bio": "Pick & drop to daycare or vet.", "rate_per_day": 700.0, "rating": 4.7, "categories": "Dogs", "is_active": True},
            {"name": "Meera Nair", "bio": "Quiet space for senior pets.", "rate_per_day": 750.0, "rating": 4.8, "categories": "Dogs,Cats,Birds", "is_active": True},
        ]
        existing_crutch = {c.name for c in db.query(CrutchVolunteer).all()}
        added_cv = False
        for c in desired_crutch:
            if c["name"] not in existing_crutch:
                db.add(CrutchVolunteer(**c))
                added_cv = True
        if added_cv:
            db.commit()

        # Seed vet data if none exists
        if db.query(Vet).count() == 0:
            import json
            
            vet_data = [
                {
                    "name": "Delhi Veterinary Hospital",
                    "address": "Near Red Fort, Old Delhi, Delhi 110006",
                    "phone": "+91-11-2396-1234",
                    "latitude": 28.6562,
                    "longitude": 77.2410,
                    "rating": 4.2,
                    "reviews_count": 89,
                    "is_open": True,
                    "is_emergency": False,
                    "specialties": json.dumps(["General Care", "Surgery"]),
                    "hours": "Mon-Sat: 9 AM - 6 PM"
                },
                {
                    "name": "Pet Care Clinic",
                    "address": "Karol Bagh, New Delhi, Delhi 110005",
                    "phone": "+91-11-2875-4321",
                    "latitude": 28.6517,
                    "longitude": 77.1909,
                    "rating": 4.5,
                    "reviews_count": 156,
                    "is_open": True,
                    "is_emergency": True,
                    "specialties": json.dumps(["Emergency", "24/7", "Critical Care"]),
                    "hours": "Open 24 hours"
                },
                {
                    "name": "Animal Health Center",
                    "address": "Connaught Place, New Delhi, Delhi 110001",
                    "phone": "+91-11-2331-5678",
                    "latitude": 28.6304,
                    "longitude": 77.2177,
                    "rating": 4.3,
                    "reviews_count": 203,
                    "is_open": False,
                    "is_emergency": False,
                    "specialties": json.dumps(["Dental", "Grooming", "Vaccination"]),
                    "hours": "Mon-Fri: 10 AM - 7 PM"
                },
                {
                    "name": "Emergency Pet Hospital",
                    "address": "Lajpat Nagar, New Delhi, Delhi 110024",
                    "phone": "+91-11-2987-6543",
                    "latitude": 28.5679,
                    "longitude": 77.2431,
                    "rating": 4.7,
                    "reviews_count": 312,
                    "is_open": True,
                    "is_emergency": True,
                    "specialties": json.dumps(["Emergency", "Surgery", "ICU"]),
                    "hours": "Open 24 hours"
                },
                {
                    "name": "Veterinary Care Services",
                    "address": "Saket, New Delhi, Delhi 110017",
                    "phone": "+91-11-2651-9876",
                    "latitude": 28.5245,
                    "longitude": 77.2065,
                    "rating": 4.4,
                    "reviews_count": 178,
                    "is_open": True,
                    "is_emergency": False,
                    "specialties": json.dumps(["General Care", "Pet Boarding", "Training"]),
                    "hours": "Mon-Sat: 8 AM - 8 PM"
                }
            ]
            
            for vet in vet_data:
                db.add(Vet(**vet))
            
            db.commit()

    except Exception as e:
        print(f"Error initializing default data: {e}")
    finally:
        db.close()

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    init_default_data()

# Stats model for storing counters
class Stats(Base):
    __tablename__ = "stats"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(Integer, default=0)

# Feedback model
class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(String)
    rating = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="feedback")

# Community Post model
class CommunityPost(Base):
    __tablename__ = "community_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(String)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")

# Comment model
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="comments")
    post = relationship("CommunityPost", back_populates="comments")

# Like model
class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="likes")
    post = relationship("CommunityPost", back_populates="likes")

# Update User model to include relationships
User.feedback = relationship("Feedback", back_populates="user")
User.posts = relationship("CommunityPost", back_populates="user")
User.comments = relationship("Comment", back_populates="user")
User.likes = relationship("Like", back_populates="user")

# Create tables
Base.metadata.create_all(bind=engine)

# Gemini proxy endpoint
class GeminiRequest(BaseModel):
    prompt: str

@app.post("/api/ai/gemini")
async def ai_gemini(req: GeminiRequest, db: Session = Depends(get_db)):
    try:
        GEMINI_API_KEY = "AIzaSyBszmP8SEavmAx8tLlsPxvuXK928R_-Ulk"
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash-lite")
        response = model.generate_content(req.prompt)
        text = getattr(response, "text", None) or "No advice generated."
        
        # Increment the counter in the database
        stat = db.query(Stats).filter(Stats.key == "gemini_calls").first()
        if stat:
            stat.value += 1
        else:
            stat = Stats(key="gemini_calls", value=1)
            db.add(stat)
        db.commit()
        
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/gemini-calls")
async def get_gemini_call_count(db: Session = Depends(get_db)):
    """Get the total number of Gemini API calls made"""
    stat = db.query(Stats).filter(Stats.key == "gemini_calls").first()
    count = stat.value if stat else 0
    return {"count": count}

# Feedback and Community endpoints
class FeedbackCreate(BaseModel):
    title: str
    content: str
    rating: int

class FeedbackResponse(BaseModel):
    id: int
    title: str
    content: str
    rating: int
    created_at: datetime
    user_name: str
    
    class Config:
        orm_mode = True

class CommunityPostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class CommunityPostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    content: str
    image_url: Optional[str]
    created_at: datetime
    user_name: str
    comment_count: int
    like_count: int
    is_liked_by_user: bool = False
    is_owner: bool = False
        
class LikeCreate(BaseModel):
    post_id: int
    
class LikeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    post_id: int
    user_id: int
    created_at: datetime

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    content: str
    created_at: datetime
    user_name: str

@app.post("/api/feedback", response_model=FeedbackResponse)
async def create_feedback(feedback: FeedbackCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Submit feedback"""
    db_feedback = Feedback(
        user_id=current_user.id,
        title=feedback.title,
        content=feedback.content,
        rating=feedback.rating
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return {
        "id": db_feedback.id,
        "title": db_feedback.title,
        "content": db_feedback.content,
        "rating": db_feedback.rating,
        "created_at": db_feedback.created_at,
        "user_name": current_user.name
    }

@app.get("/api/community/posts", response_model=List[CommunityPostResponse])
async def get_community_posts(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    """Get all community posts"""
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).all()
    
    result = []
    for post in posts:
        comment_count = db.query(Comment).filter(Comment.post_id == post.id).count()
        like_count = db.query(Like).filter(Like.post_id == post.id).count()
        user = db.query(User).filter(User.id == post.user_id).first()
        
        # Check if current user has liked this post
        is_liked = False
        is_owner = False
        if current_user:
            is_liked = db.query(Like).filter(
                Like.post_id == post.id, 
                Like.user_id == current_user.id
            ).first() is not None
            is_owner = post.user_id == current_user.id
            
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "image_url": post.image_url,
            "created_at": post.created_at,
            "user_name": user.name if user else "Unknown",
            "comment_count": comment_count,
            "like_count": like_count,
            "is_liked_by_user": is_liked,
            "is_owner": is_owner
        })
    
    return result

@app.post("/api/community/posts", response_model=CommunityPostResponse)
async def create_community_post(post: CommunityPostCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a community post"""
    db_post = CommunityPost(
        user_id=current_user.id,
        title=post.title,
        content=post.content,
        image_url=post.image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return {
        "id": db_post.id,
        "title": db_post.title,
        "content": db_post.content,
        "image_url": db_post.image_url,
        "created_at": db_post.created_at,
        "user_name": current_user.name,
        "comment_count": 0,
        "like_count": 0
    }

@app.get("/api/community/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(post_id: int, db: Session = Depends(get_db)):
    """Get comments for a specific post"""
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at).all()
    
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        result.append({
            "id": comment.id,
            "content": comment.content,
            "created_at": comment.created_at,
            "user_name": user.name if user else "Unknown"
        })
    
    return result

@app.post("/api/community/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: int, comment: CommentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a comment to a post"""
    # Check if post exists
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "created_at": db_comment.created_at,
        "user_name": current_user.name
    }

@app.post("/api/community/posts/{post_id}/like", response_model=dict)
async def like_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Like or unlike a post"""
    # Check if post exists
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked this post
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike the post
        db.delete(existing_like)
        db.commit()
        return {"status": "unliked", "like_count": db.query(Like).filter(Like.post_id == post_id).count()}
    else:
        # Like the post
        new_like = Like(
            post_id=post_id,
            user_id=current_user.id
        )
        db.add(new_like)
        db.commit()
        return {"status": "liked", "like_count": db.query(Like).filter(Like.post_id == post_id).count()}

@app.delete("/api/community/posts/{post_id}", response_model=dict)
async def delete_post(post_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a post"""
    # Check if post exists and belongs to current user
    post = db.query(CommunityPost).filter(
        CommunityPost.id == post_id,
        CommunityPost.user_id == current_user.id
    ).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or you don't have permission to delete it")
    
    # Delete the post (cascade will handle comments and likes)
    db.delete(post)
    db.commit()
    
    return {"status": "deleted"}

# Pet endpoints
@app.get("/api/pets", response_model=List[PetResponse])
async def get_pets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pets = db.query(Pet).filter(Pet.is_active == True, Pet.user_id == current_user.id).all()
    return pets

@app.get("/api/pets/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@app.post("/api/pets", response_model=PetResponse)
async def create_pet(pet: PetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_pet = Pet(**pet.dict(), user_id=current_user.id)
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.put("/api/pets/{pet_id}", response_model=PetResponse)
async def update_pet(pet_id: int, pet_update: PetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    update_data = pet_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pet, field, value)
    
    pet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pet)
    return pet

@app.delete("/api/pets/{pet_id}")
async def delete_pet(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True, Pet.user_id == current_user.id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    pet.is_active = False
    db.commit()
    return {"message": "Pet deleted successfully"}

# Species and breeds endpoints
@app.get("/api/species", response_model=List[SpeciesResponse])
async def get_species(db: Session = Depends(get_db)):
    species = db.query(Species).all()
    return species

@app.get("/api/breeds", response_model=List[BreedResponse])
async def get_breeds(species_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Breed)
    if species_id:
        query = query.filter(Breed.species_id == species_id)
    breeds = query.all()
    return breeds

@app.get("/api/breeds/by-species/{species_name}", response_model=List[BreedResponse])
async def get_breeds_by_species(species_name: str, db: Session = Depends(get_db)):
    species = db.query(Species).filter(Species.name == species_name).first()
    if not species:
        raise HTTPException(status_code=404, detail="Species not found")
    
    breeds = db.query(Breed).filter(Breed.species_id == species.id).all()
    return breeds

# Checkup Reminder endpoints
@app.get("/api/checkup-reminders", response_model=List[CheckupReminderResponse])
async def get_checkup_reminders(pet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(CheckupReminder)
    if pet_id:
        query = query.filter(CheckupReminder.pet_id == pet_id)
    reminders = query.all()
    return reminders

@app.get("/api/checkup-reminders/{reminder_id}", response_model=CheckupReminderResponse)
async def get_checkup_reminder(reminder_id: int, db: Session = Depends(get_db)):
    reminder = db.query(CheckupReminder).filter(CheckupReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Checkup reminder not found")
    return reminder

@app.post("/api/checkup-reminders", response_model=CheckupReminderResponse)
async def create_checkup_reminder(reminder: CheckupReminderCreate, db: Session = Depends(get_db)):
    db_reminder = CheckupReminder(**reminder.dict())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

@app.put("/api/checkup-reminders/{reminder_id}", response_model=CheckupReminderResponse)
async def update_checkup_reminder(reminder_id: int, reminder_update: CheckupReminderUpdate, db: Session = Depends(get_db)):
    reminder = db.query(CheckupReminder).filter(CheckupReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Checkup reminder not found")
    
    update_data = reminder_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reminder, field, value)
    
    reminder.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(reminder)
    return reminder

@app.delete("/api/checkup-reminders/{reminder_id}")
async def delete_checkup_reminder(reminder_id: int, db: Session = Depends(get_db)):
    reminder = db.query(CheckupReminder).filter(CheckupReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Checkup reminder not found")
    
    db.delete(reminder)
    db.commit()
    return {"message": "Checkup reminder deleted successfully"}

# Vaccination endpoints
@app.get("/api/vaccinations", response_model=List[VaccinationResponse])
async def get_vaccinations(pet_id: Optional[int] = None, is_scheduled: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(Vaccination)
    if pet_id:
        query = query.filter(Vaccination.pet_id == pet_id)
    if is_scheduled is not None:
        query = query.filter(Vaccination.is_scheduled == is_scheduled)
    vaccinations = query.all()
    return vaccinations

@app.get("/api/vaccinations/{vaccination_id}", response_model=VaccinationResponse)
async def get_vaccination(vaccination_id: int, db: Session = Depends(get_db)):
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination not found")
    return vaccination

@app.post("/api/vaccinations/record", response_model=VaccinationResponse)
async def record_vaccination(vaccination: VaccinationRecordCreate, db: Session = Depends(get_db)):
    db_vaccination = Vaccination(**vaccination.dict(), is_scheduled=False)
    db.add(db_vaccination)
    db.commit()
    db.refresh(db_vaccination)
    return db_vaccination

@app.post("/api/vaccinations/schedule", response_model=VaccinationResponse)
async def schedule_vaccination(vaccination: VaccinationScheduleCreate, db: Session = Depends(get_db)):
    db_vaccination = Vaccination(**vaccination.dict(), is_scheduled=True)
    db.add(db_vaccination)
    db.commit()
    db.refresh(db_vaccination)
    return db_vaccination

@app.put("/api/vaccinations/{vaccination_id}", response_model=VaccinationResponse)
async def update_vaccination(vaccination_id: int, vaccination_update: VaccinationUpdate, db: Session = Depends(get_db)):
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination not found")
    
    update_data = vaccination_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vaccination, field, value)
    
    vaccination.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vaccination)
    return vaccination

@app.delete("/api/vaccinations/{vaccination_id}")
async def delete_vaccination(vaccination_id: int, db: Session = Depends(get_db)):
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination not found")
    
    db.delete(vaccination)
    db.commit()
    return {"message": "Vaccination deleted successfully"}

# Weight log endpoints
@app.get("/api/weight-logs", response_model=List[WeightLogResponse])
async def get_weight_logs(pet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WeightLog)
    if pet_id is not None:
        query = query.filter(WeightLog.pet_id == pet_id)
    # Order ascending by date for charting
    logs = query.order_by(WeightLog.date.asc()).all()
    return logs

@app.post("/api/weight-logs", response_model=WeightLogResponse)
async def create_weight_log(weight_log: WeightLogCreate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == weight_log.pet_id, Pet.is_active == True).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    db_log = WeightLog(**weight_log.dict())
    db.add(db_log)

    # Update pet current weight to latest log
    pet.weight_kg = weight_log.weight_kg
    pet.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(db_log)
    return db_log

# Walker endpoints
@app.get("/api/walkers", response_model=List[WalkerResponse])
async def get_walkers(db: Session = Depends(get_db)):
    walkers = db.query(Walker).filter(Walker.is_active == True).all()
    return walkers

@app.post("/api/walkers", response_model=WalkerResponse)
async def create_walker(walker: WalkerCreate, db: Session = Depends(get_db)):
    db_walker = Walker(**walker.dict())
    db.add(db_walker)
    db.commit()
    db.refresh(db_walker)
    return db_walker

# Walk booking endpoints
@app.get("/api/walk-bookings", response_model=List[WalkBookingResponse])
async def get_walk_bookings(pet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WalkBooking)
    if pet_id is not None:
        query = query.filter(WalkBooking.pet_id == pet_id)
    bookings = query.order_by(WalkBooking.scheduled_date.desc()).all()
    return bookings

@app.post("/api/walk-bookings", response_model=WalkBookingResponse)
async def create_walk_booking(booking: WalkBookingCreate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == booking.pet_id, Pet.is_active == True).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    walker = db.query(Walker).filter(Walker.id == booking.walker_id, Walker.is_active == True).first()
    if not walker:
        raise HTTPException(status_code=404, detail="Walker not found")

    hours = booking.duration_minutes / 60.0
    total_cost = round(hours * (walker.rate_per_hour or 0), 2)
    db_booking = WalkBooking(**booking.dict(), total_cost=total_cost)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

# Crutch volunteer endpoints
@app.get("/api/crutch-volunteers", response_model=List[CrutchVolunteerResponse])
async def get_crutch_volunteers(db: Session = Depends(get_db)):
    volunteers = db.query(CrutchVolunteer).filter(CrutchVolunteer.is_active == True).all()
    return volunteers

@app.post("/api/crutch-volunteers", response_model=CrutchVolunteerResponse)
async def create_crutch_volunteer(volunteer: CrutchVolunteerCreate, db: Session = Depends(get_db)):
    db_vol = CrutchVolunteer(**volunteer.dict())
    db.add(db_vol)
    db.commit()
    db.refresh(db_vol)
    return db_vol

@app.get("/api/crutch-bookings", response_model=List[CrutchBookingResponse])
async def get_crutch_bookings(pet_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(CrutchBooking)
    if pet_id is not None:
        query = query.filter(CrutchBooking.pet_id == pet_id)
    bookings = query.order_by(CrutchBooking.pickup_date.desc()).all()
    return bookings

@app.post("/api/crutch-bookings", response_model=CrutchBookingResponse)
async def create_crutch_booking(booking: CrutchBookingCreate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == booking.pet_id, Pet.is_active == True).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    volunteer = db.query(CrutchVolunteer).filter(CrutchVolunteer.id == booking.volunteer_id, CrutchVolunteer.is_active == True).first()
    if not volunteer:
        raise HTTPException(status_code=404, detail="Volunteer not found")

    days = max(1, (booking.dropoff_date - booking.pickup_date).days)
    total_cost = round(days * (volunteer.rate_per_day or 0), 2)
    db_booking = CrutchBooking(**booking.dict(), total_cost=total_cost)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, phone=user.phone, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


@app.post("/login")
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": user.email})
    return {"message": "Login successful", "user_id": user.id, "access_token": access_token}


@app.get("/api/upcoming-alerts")
async def get_upcoming_alerts(days: int = 7, db: Session = Depends(get_db)):
    from datetime import timedelta
    
    # Get upcoming checkup reminders
    upcoming_checkups = db.query(CheckupReminder).filter(
        CheckupReminder.due_date <= datetime.utcnow() + timedelta(days=days),
        CheckupReminder.due_date >= datetime.utcnow(),
        CheckupReminder.is_completed == False
    ).all()
    
    # Get upcoming scheduled vaccinations
    upcoming_vaccinations = db.query(Vaccination).filter(
        Vaccination.is_scheduled == True,
        Vaccination.scheduled_date <= datetime.utcnow() + timedelta(days=days),
        Vaccination.scheduled_date >= datetime.utcnow()
    ).all()
    
    alerts = []
    
    # Process checkup reminders
    for checkup in upcoming_checkups:
        days_until_due = (checkup.due_date - datetime.utcnow()).days
        alerts.append({
            "id": f"checkup_{checkup.id}",
            "pet_id": checkup.pet_id,
            "pet_name": checkup.pet.name,
            "title": checkup.title,
            "type": "checkup",
            "due_date": checkup.due_date.isoformat(),
            "due_time": checkup.due_time,
            "priority": checkup.priority,
            "location": checkup.location,
            "veterinarian": checkup.vet_name,
            "days_until_due": days_until_due,
            "status": "overdue" if days_until_due < 0 else "upcoming"
        })
    
    # Process scheduled vaccinations
    for vaccination in upcoming_vaccinations:
        days_until_due = (vaccination.scheduled_date - datetime.utcnow()).days
        alerts.append({
            "id": f"vaccination_{vaccination.id}",
            "pet_id": vaccination.pet_id,
            "pet_name": vaccination.pet.name,
            "title": vaccination.vaccine_name,
            "type": "vaccination",
            "due_date": vaccination.scheduled_date.isoformat(),
            "due_time": vaccination.scheduled_time,
            "priority": "high",  # Default for vaccinations
            "location": vaccination.location,
            "veterinarian": vaccination.veterinarian,
            "days_until_due": days_until_due,
            "status": "overdue" if days_until_due < 0 else "upcoming"
        })
    
    return alerts

# Vet endpoints
@app.get("/api/vets", response_model=List[VetResponse])
async def get_vets(db: Session = Depends(get_db)):
    vets = db.query(Vet).filter(Vet.is_active == True).all()
    return vets

@app.post("/api/vets", response_model=VetResponse)
async def create_vet(vet: VetCreate, db: Session = Depends(get_db)):
    db_vet = Vet(**vet.dict())
    db.add(db_vet)
    db.commit()
    db.refresh(db_vet)
    return db_vet

@app.get("/api/vets/search")
async def search_nearby_vets(
    latitude: float,
    longitude: float,
    radius_km: float = 10.0,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """
    Search for nearby vets based on user location
    """
    import math
    
    # Get all active vets
    vets = db.query(Vet).filter(Vet.is_active == True).all()
    
    # Calculate distances and filter by radius
    nearby_vets = []
    for vet in vets:
        # Haversine formula for distance calculation
        lat1, lon1 = math.radians(latitude), math.radians(longitude)
        lat2, lon2 = math.radians(vet.latitude), math.radians(vet.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance_km = 6371 * c  # Earth's radius in km
        
        if distance_km <= radius_km:
            import json
            vet_dict = {
                "id": vet.id,
                "name": vet.name,
                "address": vet.address,
                "phone": vet.phone,
                "rating": vet.rating,
                "reviews": vet.reviews_count,
                "isOpen": vet.is_open,
                "isEmergency": vet.is_emergency,
                "specialties": json.loads(vet.specialties) if vet.specialties else [],
                "hours": vet.hours,
                "coordinates": [vet.latitude, vet.longitude],
                "distance": f"{distance_km:.1f} km" if distance_km >= 1 else f"{distance_km * 1000:.0f} m"
            }
            nearby_vets.append((distance_km, vet_dict))
    
    # Sort by distance and return top results
    nearby_vets.sort(key=lambda x: x[0])
    return [vet_data for _, vet_data in nearby_vets[:limit]]

@app.get("/api/vets/{vet_id}", response_model=VetResponse)
async def get_vet(vet_id: int, db: Session = Depends(get_db)):
    vet = db.query(Vet).filter(Vet.id == vet_id, Vet.is_active == True).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found")
    return vet

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/user/name")
async def get_user_name(current_user: User = Depends(get_current_user)):
    """Get only the name of the currently logged in user"""
    return {"name": current_user.name}

from fastapi.responses import FileResponse

app.mount("/assets", StaticFiles(directory=os.path.join("static", "assets")), name="assets")

# Serve index.html at root
@app.get("/")
def serve_index():
    return FileResponse(os.path.join("static", "index.html"))

# Catch-all route for React Router (all non-API paths)
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    # Don't catch API routes
    if full_path.startswith("api/"):
        return {"error": "API endpoint not found"}
    return FileResponse(os.path.join("static", "index.html"))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
