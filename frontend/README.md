# FurrstAid Web - Pet Management System

A comprehensive pet management system with FastAPI backend and React frontend.

## Features

- **Add Pet**: Complete form to add new pets with detailed information
- **Pet Dashboard**: View all pets with health status and vaccination reminders
- **Species & Breed Management**: Dynamic species and breed selection
- **Health Tracking**: Monitor pet health status and vaccination schedules
- **Emergency Access**: Quick access to emergency features

## Backend Setup (FastAPI)

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, you can access:
- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

### API Endpoints

#### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/{pet_id}` - Get specific pet
- `POST /api/pets` - Create new pet
- `PUT /api/pets/{pet_id}` - Update pet
- `DELETE /api/pets/{pet_id}` - Delete pet

#### Species & Breeds
- `GET /api/species` - Get all species
- `GET /api/breeds` - Get all breeds
- `GET /api/breeds/by-species/{species_name}` - Get breeds by species

## Frontend Setup (React + Vite)

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation

1. Navigate to the project root:
```bash
cd .
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Database

The application uses SQLite database (`furrstaid.db`) which will be created automatically when you first run the backend. The database includes:

- **Pets table**: Stores all pet information
- **Species table**: Pre-populated with common pet species
- **Breeds table**: Pre-populated with common breeds for each species

## Pet Information Fields

When adding a pet, the following information is collected:

### Required Fields
- **Name**: Pet's name
- **Species**: Dog, Cat, Bird, Rabbit, etc.
- **Breed**: Specific breed within the species
- **Age**: Years and months
- **Weight**: Weight in kilograms
- **Gender**: Male or Female

### Optional Fields
- **Color**: Pet's color/pattern
- **Microchip ID**: Microchip identification number
- **Medical Notes**: Important medical information
- **Emergency Contact**: Emergency contact person
- **Veterinarian**: Vet name and phone number

## Development

### Backend Development
- The FastAPI backend includes automatic API documentation
- Database migrations are handled automatically
- CORS is configured for frontend communication

### Frontend Development
- Built with React 18 and TypeScript
- Uses Vite for fast development
- Includes form validation with Zod
- Responsive design with Tailwind CSS

## Production Deployment

### Backend
1. Set up a production database (PostgreSQL recommended)
2. Update the database URL in `main.py`
3. Use a production ASGI server like Gunicorn with Uvicorn workers
4. Set up proper environment variables for security

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` folder with a web server like Nginx

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.