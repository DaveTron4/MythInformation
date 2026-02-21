# 🕵️‍♂️ MythInformation.tech: Hackathon Roadmap

### 🟢 Phase 1: The Brain (Hours 0–8)
*Focus: Getting Gemini to extract structured facts correctly.*

- [x] **Project Scaffolding:** Create `backend/` and `frontend/` directories.
- [x] **API Foundation:** Set up FastAPI with `/analyze` endpoint.
- [ ] **Prompt Engineering:** Fine-tune the extraction prompt to prevent Gemini from hallucinating relationships.
- [ ] **Schema Validation:** Ensure the backend always returns valid JSON that the 3D graph can read.
- [ ] **Lore Stress Test:** Test extraction with a massive chunk of text (e.g., the first chapter of a game script).

### 🔵 Phase 2: The Face (Hours 8–16)
*Focus: Immersive 3D visualization using Three.js.*

- [ ] **React Setup:** Initialize Vite + React and install `react-force-graph-3d`.
- [ ] **The "Red String" Board:** Create a basic 3D canvas that renders nodes and links from a static JSON file.
- [ ] **Live Connection:** Connect the React frontend to the FastAPI backend using `axios`.
- [ ] **Input UI:** Build a cinematic text area for users to paste lore.
- [ ] **Camera Controls:** Implement "Focus on Node" functionality (click a character to zoom into them).

### 🟡 Phase 3: The Data Science "Magic" (Hours 16–28)
*Focus: Adding the "Science" to Hacklytics.*

- [ ] **Centrality Scoring:** Use NetworkX on the backend to calculate which characters are "Hubs" (make their nodes larger).
- [ ] **Community Detection:** Color-code nodes automatically based on "Factions" (using the Louvain algorithm).
- [ ] **Interactive Lore Cards:** When a node is clicked, have Gemini generate a "Detective Dossier" summary for that character.
- [ ] **Visual Polish:** Add neon glows, space backgrounds, or particle effects using Three.js primitives.

### 🔴 Phase 4: The Final Pitch (Hours 28–36)
*Focus: Stability and Presentation.*

- [ ] **Error Handling:** Add a "loading" state (maybe a spinning magnifying glass) while Gemini is thinking.
- [ ] **Deployment:** Host the backend on Render/Heroku and the frontend on Vercel.
- [ ] **The Demo Video:** Record a screen capture of you turning a wall of text into a beautiful 3D web of secrets.
- [ ] **ReadMe Polish:** Write a "Case File" for your project documentation on Devpost.
