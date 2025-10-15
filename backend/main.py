from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
from datetime import datetime, date
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./furrstaid.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
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
    
    # Relationships
    checkup_reminders = relationship("CheckupReminder", back_populates="pet")
    vaccinations = relationship("Vaccination", back_populates="pet")

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

SECRET_KEY = "b6f8e9c8f25a4f7b2ad90e1a6a55a5b6f1a6c88b2a4478b6e5a77c9b3a9f0f2a"  # replace with env variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# -----------------------------------
# SCHEMAS
# -----------------------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str



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

# Initialize default data
def init_default_data():
    db = SessionLocal()
    try:
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
            
    except Exception as e:
        print(f"Error initializing default data: {e}")
    finally:
        db.close()

# Initialize data on startup
@app.on_event("startup")
async def startup_event():
    init_default_data()

# API Routes
@app.get("/")
async def root():
    return {"message": "FurrstAid API is running!"}

# Pet endpoints
@app.get("/api/pets", response_model=List[PetResponse])
async def get_pets(db: Session = Depends(get_db)):
    pets = db.query(Pet).filter(Pet.is_active == True).all()
    return pets

@app.get("/api/pets/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@app.post("/api/pets", response_model=PetResponse)
async def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    db_pet = Pet(**pet.dict())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@app.put("/api/pets/{pet_id}", response_model=PetResponse)
async def update_pet(pet_id: int, pet_update: PetUpdate, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True).first()
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
async def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_active == True).first()
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
@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, hashed_password=hashed_pw)
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
