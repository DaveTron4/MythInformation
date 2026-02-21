# 🕵️‍♂️ MythInformation.tech: Hackathon Roadmap

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

### 🔴 Phase 4: The Final Pitch (Hours 28–36)
*Focus: Stability and Presentation.*

- [ ] **Error Handling:** Advanced error states for API failures.
- [ ] **Deployment:** Backend on Render, Frontend on Vercel.
- [ ] **The Demo Video:** Capturing the multiversal expansion.
- [ ] **ReadMe Polish:** Finalizing the "Case File" documentation.
