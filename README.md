# 🕵️‍♂️ MythInformation.tech
### *Bringing Lore and Order to the Multiverse.*

[![Hackathon](https://img.shields.io/badge/Hacklytics-2026-yellow?style=for-the-badge&logo=data-science)](https://hacklytics.io/)
[![Track](https://img.shields.io/badge/Track-Entertainment-blueviolet?style=for-the-badge)](https://hacklytics.io/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/three.js%20-%23000000.svg?style=for-the-badge&logo=three.dot-js&logoColor=white)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

**MythInformation.tech** is an AI-powered "Story Detective" designed to navigate the dense, non-linear lore of modern franchises. By transforming chaotic wiki articles and scripts into interactive 3D **Galactic Knowledge Graphs**, it reveals hidden connections and secret alliances that even the most dedicated fans might miss.

---

## 🛠️ The Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **The Brain** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) ![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square) |
| **The Face** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **The Graph** | ![NetworkX](https://img.shields.io/badge/NetworkX-000000?style=flat-square) ![D3-Force](https://img.shields.io/badge/D3_Force-F9A03C?style=flat-square&logo=d3.js&logoColor=white) |

---

## 🚀 Key Features
*   **User Authentication:** Secure JWT-based register/login system with password hashing via bcrypt.
*   **Persistent Analysis Storage:** Save, load, and manage multiple lore analyses per user in PostgreSQL.
*   **Multiversal Clustering:** Characters are automatically grouped into "Solar Systems" based on their source work (e.g., FNAF 1 vs. FNAF 2).
*   **Star Magnitude:** Characters with more connections glow brighter and appear larger using **Degree Centrality** metrics.
*   **Bridge Detection:** Characters appearing in multiple works are rendered with **Multi-Segment Segmented Coronas**, visually showing their multiversal history.
*   **AI Case Files:** Click a node to decrypt a character's dossier, including an AI-generated biography and mission history, rendered with rich Markdown support.
*   **Fluid Physics Engine:** Real-time collision detection and spring-forces create a "liquid" movement feel when adding new lore.
*   **Procedural Starfield:** A native 20,000-point 3D background for a cinematic immersive experience.

---

## 🔧 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Google Gemini API key

### Installation

1. **Clone & Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Setup Environment Variables:**
   ```bash
   # backend/.env
   GEMINI_API_KEY=your_gemini_key_here
   DATABASE_URL=postgresql://loreuser:lorepass@localhost:5432/loredb
   SECRET_KEY=your-secret-key-change-in-production
   ```

3. **Start PostgreSQL Docker Container:**
   ```bash
   docker-compose up -d
   ```

4. **Run Backend Server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

5. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access Application:**
   - Frontend: http://localhost:5173
   - API Docs: http://127.0.0.1:8000/docs

---

## 📖 Usage

### Analyzing Lore
1. **Register/Login** using the button in bottom-right
2. **Paste text** in the Detective's Notebook or search Project Gutenberg by ID
3. **View the 3D Graph** as characters and relationships materialize
4. **Click nodes** to view character dossiers
5. **Delete systems** by clicking the ✕ next to their name

### Saving & Loading
1. **Click "💾 Save Analysis"** after building your graph
2. **Name your analysis** and add notes
3. **Click "📂 Load Analysis"** to browse your saved work
4. **Load an analysis** to restore it and continue exploring

---

## 🗄️ Database Schema

### Users Table
- `id` - UUID primary key
- `username` - Unique username
- `email` - Unique email address
- `hashed_password` - Bcrypt hash
- `created_at` - Timestamp

### Analyses Table
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `name` - Analysis title
- `description` - User notes
- `nodes` - JSON array of graph nodes
- `links` - JSON array of graph edges
- `work_meta` - JSON object with system metadata (colors, positions)
- `created_at`, `updated_at` - Timestamps

---

## ✅ What's Working

- ✅ Full 3D force-directed graph visualization with 20k-point starfield
- ✅ Character extraction & relationship mapping via Google Gemini 2.5 Flash
- ✅ Interactive node selection with smooth camera transitions
- ✅ Rich character dossiers with Markdown support
- ✅ Multi-work clustering with colored "Solar System" shells
- ✅ User registration & login with JWT authentication
- ✅ PostgreSQL-backed analysis persistence
- ✅ Save/load analysis functionality with full state restoration
- ✅ System deletion with proper link cleanup
- ✅ Project Gutenberg book analysis integration
- ✅ Cyberpunk UI with Tailwind theming
- ✅ Comprehensive error handling and user feedback

---

## 🚧 Coming Next

- 🎬 Demo video walkthrough
- 🌐 Deployment (Backend to Render/Railway, Frontend to Vercel)
- 📱 Mobile responsiveness (lower priority)
- 📊 Optional: Databricks integration for advanced analytics

---
**Developed Solo in 36 Hours for Hacklytics 2026.**
