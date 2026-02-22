<div align="center">
<table>
<tr>
<td width="40%" align="center">
<img src="frontend/src/assets/logo.png" alt="MythInformation Logo" width="300" height="300" />
</td>
<td width="60%" align="left">

## 🕵️‍♂️ MythInformation
### *Bringing Lore and Order to the Multiverse.*

An AI-powered "Story Detective" that transforms chaotic wiki articles and scripts into interactive 3D **Galactic Knowledge Graphs**. Extract characters and relationships with Gemini, predict relationship types with ML, and analyze patterns in Databricks.

### 🏆 Event
[![Hackathon](https://img.shields.io/badge/Hacklytics-2026-yellow?style=for-the-badge&logo=data-science)](https://hacklytics.io/)
[![Track](https://img.shields.io/badge/Track-Entertainment-blueviolet?style=for-the-badge)](https://hacklytics.io/)

### 🛠️ Technologies
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/three.js%20-%23000000.svg?style=for-the-badge&logo=three.dot-js&logoColor=white)](https://threejs.org/)

[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Databricks](https://img.shields.io/badge/Databricks-FF3621?style=for-the-badge&logo=databricks&logoColor=white)](https://www.databricks.com/)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

</td>
</tr>
</table>
</div>

---

## 🛠️ The Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **The Brain** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) ![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=flat-square&logo=google) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square) |
| **The ML Engine** | ![Scikit-learn](https://img.shields.io/badge/Scikit_learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white) ![Databricks](https://img.shields.io/badge/Databricks-FF3621?style=flat-square&logo=databricks&logoColor=white) ![MLflow](https://img.shields.io/badge/MLflow-0193E3?style=flat-square) |
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
*   **🤖 ML Relationship Predictor:** AI-powered relationship type prediction using Random Forest classifier (87.5% accuracy on 20 relationship types). When creating new connections, the system suggests the most likely relationship type with confidence scoring.
*   **📊 Analytics Dashboard:** Databricks SQL dashboards showing KPI metrics, character connectivity analysis, relationship type distribution, work comparisons, user activity timelines, and centrality distributions.
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
   
   # Optional: Databricks Analytics
   DATABRICKS_HOST=your_workspace_url
   DATABRICKS_HTTP_PATH=your_cluster_path
   DATABRICKS_TOKEN=your_pat_token
   DATABRICKS_CATALOG=lore_graph
   DATABRICKS_SCHEMA=analytics
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

## ML Relationship Predictions
1. **While editing:** Click "Add Connection" under a character's dossier
2. **Select target:** Choose another character from the dropdown
3. **View prediction:** The AI suggests the relationship type with a confidence percentage
4. **Modify if needed:** Accept the suggestion or choose a different relationship type
5. **Confirm:** Click "Create Connection" to add it to your graph

### Accessing the Analytics Dashboard
1. **Go to Databricks Workspace:** Access your Databricks SQL Warehouse
2. **View SQL Queries:** 6 pre-built queries available in the workspace
3. **Track Metrics:** Monitor character connectivity, analysis trends, and graph growth over timeect Gutenberg by ID
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

### Databricks Delta Lake Tables (Analytics)
- **lore_analyses** - Analysis metadata synced from PostgreSQL (user_id, names, total_characters, total_relationships)
- **lore_characters** - Character data with graph metrics (analysis_id, name, degree_centrality, work_source, description)
- **lore_relationships** - Relationship data for analytics (analysis_id, source_id, target_id, relationship_type, work_source)
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
 and custom scrollbars
- ✅ **NEW: ML Relationship Predictor** with 87.5% accuracy on 20 relationship types
- ✅ **NEW: Databricks Analytics** with Delta Lake table syncing and 6 SQL dashboard queries
- ✅ **NEW: Async/Non-blocking Backend** - Databricks writes happen in background threads, API never hangs
- ✅ Full 3D force-directed graph visualization with 20k-point starfield
- ✅ Character extraction & relationship mapping via Google Gemini 2.5 Flash
- ✅ Interactive node selection with smooth camera transitions
- ✅ Rich character dossiers (showing ML predictions in action)
- 🌐 Deployment (Backend to Render/Railway, Frontend to Vercel)
- 📱 Mobile responsiveness (lower priority)
- 📊 Advanced analytics queries and visualization customization

---
**Developed Solo in 36 Hours for Hacklytics 2026 - Entertainment Track**
*Featuring AI-powered lore extraction, graph visualization, and ML relationship prediction.
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
