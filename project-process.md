# 🕵️‍♂️ MythInformation.tech: Hackathon Roadmap

---

## 📊 Progress Summary
- **Current Status:** 80% Complete - All core features functional, ready for testing and deployment
- **Phase 1:** ✅ Complete
- **Phase 2:** ✅ Complete
- **Phase 3:** ✅ Complete  
- **Phase 3.5:** ✅ Complete (Authentication & Persistence)
- **Phase 4:** 🟡 In Progress (Deployment & Polish)

---

### 🟢 Phase 1: The Brain (Hours 0–8)
*Focus: Getting Gemini to extract structured facts correctly.*

- [x] **Project Scaffolding:** Create `backend/` and `frontend/` directories.
- [x] **API Foundation:** Set up FastAPI with `/analyze` and `/character-dossier` endpoints.
- [ ] **Lore Lakehouse:** Set up a Databricks workspace (Community Edition) or a local Delta Lake.
- [x] **Prompt Engineering:** Optimized prompts for strict JSON and character disambiguation.
- [x] **Schema Validation:** Pydantic models for both Graph and Dossier responses.
- [x] **Lore Stress Test:** Verified extraction with 5,000+ character text blocks.

### 🔵 Phase 2: The Face (Hours 8–16)
*Focus: Immersive 3D visualization using Three.js.*

- [x] **React Setup:** Vite + React + `react-force-graph-3d`.
- [x] **The "Red String" Board:** Dynamic 3D canvas with physics-based node layout.
- [x] **Live Connection:** Full API integration via `apiService`.
- [x] **Input UI:** Cyberpunk "Detective's Notebook" for custom lore analysis.
- [x] **Camera Controls:** Smooth 2000ms transition zoom when clicking nodes.

### 🟡 Phase 3: The Data Science "Magic" (Hours 16–28)
*Focus: Adding the "Science" to Hacklytics.*

- [ ] **Lakehouse Analytics:** Use Databricks SQL or Spark to run PageRank.
- [x] **Centrality Scoring:** NetworkX calculates node size based on narrative importance.
- [x] **Multiversal Clustering:** Fluid physics pull nodes into "Solar System" clusters.
- [x] **Bridge Detection:** Segmented coronas show characters existing in 3+ systems simultaneously.
- [x] **Interactive Lore Cards:** DossierPanel with rich Markdown rendering and real-time relationship filtering.
- [x] **Visual Polish:** 20,000-point starfield and collision-based "liquid" physics.

### � Phase 3.5: User Persistence & Authentication (Hours 20–26)
*Focus: Multi-session support and persistent analysis storage.*

- [x] **PostgreSQL Database:** Docker container with persistent volume storage.
- [x] **User Authentication:** JWT-based register/login system with bcrypt password hashing.
- [x] **Analysis CRUD:** Full backend endpoints for creating, reading, updating, deleting analyses.
- [x] **Save/Load UI:** Modal dialogs for saving analyses with name and description.
- [x] **Analysis Library:** Browse, load, and delete saved analyses for each user.
- [x] **State Persistence:** GraphData (nodes/links) and workMeta properly restored on load.
- [x] **Link Integrity:** Fixed node-to-node connection issues during system deletion and analysis loading.

### 🔴 Phase 4: The Final Pitch (Hours 28–36)
*Focus: Stability and Presentation.*

- [x] **Error Handling:** Comprehensive error handling for API failures and user feedback.
- [ ] **Deployment:** Backend on Render/Railway, Frontend on Vercel.
- [ ] **The Demo Video:** Capturing the multiversal expansion and auth workflow.
- [ ] **ReadMe Polish:** Finalizing the "Case File" documentation.
- [ ] **Mobile Responsiveness:** (Low priority for hackathon - desktop-first experience).

---

## 🏗️ Technical Architecture

### Backend Stack
- **Framework:** FastAPI (async Python)
- **AI Engine:** Google Gemini 2.5 Flash via LangChain
- **Database:** PostgreSQL 15 (Docker)
- **ORM:** SQLAlchemy with Pydantic schemas
- **Authentication:** JWT tokens + bcrypt password hashing (via passlib)
- **Graph Analysis:** NetworkX for centrality calculations
- **APIs:** Project Gutenberg integration for book text extraction

### Frontend Stack
- **Framework:** React 19 + Vite 7 (fast HMR, optimized builds)
- **3D Visualization:** Three.js + react-force-graph-3d
- **Physics Engine:** D3-Force for particle simulation
- **Styling:** Tailwind CSS v4 with custom cyberpunk theme
- **State Management:** React Context API (AuthContext)
- **HTTP Client:** Axios with retry/backoff logic

### Database Design
- **User Model:** Email, username, hashed password, created_at
- **Analysis Model:** Name, description, nodes/links (JSON), work_meta, user_id, timestamps
- **Relationships:** One-to-many (User → Analyses) with cascade delete

---

## ✨ Key Technical Decisions

| Decision | Rationale |
| :--- | :--- |
| **PostgreSQL over Supabase** | Full control over schema, no vendor lock-in, easier local testing |
| **Docker Compose** | Reproducible database setup, consistent environments |
| **JWT over Session Auth** | Stateless, scalable, ideal for SPA + REST API |
| **React Context** | Minimal overhead, no Redux complexity needed |
| **JSON columns for graphs** | Flexible schema for evolving graph structures |
| **String IDs for links** | Easier serialization, avoids object reference issues |
| **Bcrypt 4.0.1** | Passlib compatibility, didn't use newer 4.1+ versions |

---

## 🐛 Bugs Fixed
1. **Bcrypt Compatibility:** Pinned to v4.0.1 for passlib support
2. **Link Detachment:** Fixed source/target normalization on load/delete
3. **Email Validation:** Added email-validator package for Pydantic EmailStr
4. **CORS on Auth Errors:** Ensured error handling happens after CORS setup

---
