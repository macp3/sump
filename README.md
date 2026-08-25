# SUMP

> **A private web application for couples**, built with **FastAPI (Python)** and **React (TypeScript + Tailwind CSS)** in a light **Editorial Atelier & Architecture** design system.

The application allows couples to coordinate shared date itineraries, view an interactive synchronized monthly calendar, preserve relationship milestones, and generate curated inspirations.

---

## Key Features

1. **Closed 2-User System (Maciej & Selina):**
   * No public registration; access is restricted to the two configured accounts.
   * Secure Bcrypt password hashing and JWT token authentication.
   * Ability to update passwords, customize active status/mood, and view partner's last active time.

2. **Date Itinerary & Event Proposals:**
   * Propose events categorized by type (Romantic Evening, Fine Dining, Cinema & Performance, Adventure & Exploration, Private Home Atelier, Confidential Itinerary, Outdoors & Landscape).
   * Specify date & time, venue (with Google Maps integration), dress code recommendations, and budget tier.
   * **Confidential Mode (Surprise Date):** Venue and specific details remain masked until the organizer reveals them.
   * **Interactions:** Confirm invitations, propose a reschedule, or decline with a note.
   * **Archived Timeline:** Record reflections and 1-5 star ratings for completed dates.

3. **Interactive Shared Calendar & Milestones:**
   * Monthly calendar grid synchronized with all date proposals (Pending, Confirmed, Completed) and custom milestones (Anniversaries, Trips, Celebrations).
   * Day detail drawer allowing users to inspect scheduled events and propose plans for that specific calendar date.

4. **Curated Date Inspirations (Inspiration Selector):**
   * Generator for curated date concepts and cultural experiences.
   * One-click conversion from a drawn concept to an official date invitation.

5. **Relationship Continuum (Time Elapsed Counter):**
   * Real-time timer tracking days, hours, minutes, and seconds shared together in an architectural metric layout.

---

## Security & GitHub (Zero Hardcoded Secrets)

* All JWT secrets, initial passwords, usernames, and database connection strings are loaded **strictly from environment variables** (`.env`).
* `.env` files, SQLite databases `*.db`, virtual environments `venv/`, and `node_modules/` are protected in [`.gitignore`](file:///C:/Users/mmaci/Documents/SUMP/.gitignore).
* Safe templates are provided in [`backend/.env.example`](file:///C:/Users/mmaci/Documents/SUMP/backend/.env.example) and [`frontend/.env.example`](file:///C:/Users/mmaci/Documents/SUMP/frontend/.env.example).

---

## Local Development Setup

### Step 1: Configure Environment Variables

1. **Backend:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

---

### Step 2: Run Locally

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API runs at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).

#### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

### Step 3: Run via Docker Compose (Optional)

```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:3000`.

---

## Deployment on Microsoft Azure

### Option A: Azure Container Apps (Recommended)
1. **Database:** Provision *Azure Database for PostgreSQL Flexible Server*.
2. **Container Registry:** Create an *Azure Container Registry (ACR)*.
3. **Build & Push Images:**
   ```bash
   az acr build --registry <your_acr_name> --image sump-backend:latest ./backend
   az acr build --registry <your_acr_name> --image sump-frontend:latest ./frontend
   ```
4. **Deploy Container Apps:** Configure environment variables in Azure Portal (including `DATABASE_URL` pointing to PostgreSQL).

### Option B: Azure App Service (Linux)
1. Create a **Web App (Linux, Python 3.12)** for backend and a **Web App (Node/Static)** for frontend.
2. In **Configuration -> Application settings**, paste your environment variables.
3. Connect GitHub Actions for automated continuous deployment.
