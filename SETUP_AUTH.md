# PostgreSQL + Docker Setup Guide

## 🚀 Quick Start

### 1. Start PostgreSQL in Docker

```powershell
# Navigate to project root
cd "C:\Users\david\OneDrive - Georgia State University\Personal\Projects\lore-graph"

# Start PostgreSQL container
docker-compose up -d

# Check if it's running
docker ps
```

### 2. Install Python Dependencies

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install new dependencies
pip install -r backend/requirements.txt
```

### 3. Configure Environment Variables

```powershell
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env and set:
# - GOOGLE_API_KEY (your existing key)
# - SECRET_KEY (generate a new random string, min 32 chars)
```

To generate a secure SECRET_KEY:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Start the Backend

```powershell
cd backend
uvicorn main:app --reload
```

The database tables will be created automatically on first run.

---

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns JWT token)
- `GET /auth/me` - Get current user info

### Analyses (Requires Auth)
- `POST /analyses` - Save current graph
- `GET /analyses` - Get all user's saved analyses
- `GET /analyses/{id}` - Load specific analysis
- `PUT /analyses/{id}` - Update analysis
- `DELETE /analyses/{id}` - Delete analysis

### Existing Endpoints (Still Work)
- `POST /analyze` - Analyze custom text
- `GET /analyze-gutenberg/{book_id}` - Analyze book
- `GET /character-dossier/{name}` - Get character info

---

## 🧪 Testing the API

### Register a User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123"
```

### Save Analysis (with token)
```bash
curl -X POST http://localhost:8000/analyses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"My First Analysis","nodes":[],"links":[]}'
```

---

## 🛠️ Docker Commands

```powershell
# Stop the database
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL shell
docker exec -it lore-graph-db psql -U loreuser -d loredb
```

---

## 🗄️ Database Schema

**users** table:
- id (UUID)
- email (unique)
- username (unique)
- hashed_password
- created_at
- updated_at

**analyses** table:
- id (UUID)
- user_id (FK to users)
- name
- description
- nodes (JSON)
- links (JSON)
- work_meta (JSON) - stores color/position data
- created_at
- updated_at

---

## 🔐 Authentication Flow

1. User registers → Creates user account
2. User logs in → Receives JWT token
3. Client stores token (localStorage)
4. All API requests include: `Authorization: Bearer <token>`
5. Backend validates token and identifies user
6. User can save/load their analyses

---

## ⚡ Next Steps

1. Start Docker container
2. Install dependencies
3. Configure .env file
4. Start backend
5. Test authentication endpoints
6. Implement frontend UI (next phase)
