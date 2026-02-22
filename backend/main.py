from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import networkx as nx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
import traceback
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from scraper import get_gutenberg_book
from database import init_db
from routes_auth import router as auth_router
from routes_analyses import router as analyses_router
from routes_ml import router as ml_router
from ml_predictor import predictor

load_dotenv()

app = FastAPI(title="MythInformation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myth-information.vercel.app/", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database and ML model on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    # Load ML model (optional - will work without it)
    try:
        predictor.load_model()
    except Exception as e:
        print(f"Warning: ML model failed to load: {e}")

# Include routers
app.include_router(auth_router)
app.include_router(analyses_router)
app.include_router(ml_router)

class LoreRequest(BaseModel):
    text: str
    api_key: Optional[str] = None
    
    def validate_text(self):
        """Validate text input before processing."""
        if not self.text or not self.text.strip():
            raise ValueError("Text cannot be empty")
        if len(self.text) > 50000:
            raise ValueError("Text exceeds maximum length of 50,000 characters")
        return True

class GraphResponse(BaseModel):
    nodes: List[dict]
    links: List[dict]

class DossierResponse(BaseModel):
    name: str
    biography: str
    notable_events: List[str]

@app.get("/")
def health_check():
    return {"status": "MythInformation Brain is Active"}

async def run_extraction(text: str, api_key: str):
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
            max_output_tokens=8192
        )

        parser = JsonOutputParser()

        prompt = PromptTemplate(
            template="""
            You are a Multiversal Detective. Extract a Knowledge Graph from the text.
            
            1. Identify characters and their relationships.
            2. Identify the "Work" or "System" this text belongs to (e.g. "Pride and Prejudice", "FNAF", "Dracula").
            
            Return ONLY a valid JSON object:
            {{
                "nodes": [
                    {{"id": "Character Name", "source_work": "Name of the Book/Game/Movie"}}
                ],
                "edges": [
                    {{"source": "Name A", "target": "Name B", "label": "RELATIONSHIP", "source_work": "Name of the Book/Game/Movie"}}
                ]
            }}
            
            IMPORTANT: Use consistent naming for characters. Ensure 'source' and 'target' in edges exactly match an 'id' in nodes.
            
            Text: {text}
            """,
            input_variables=["text"],
        )

        chain = prompt | llm | parser
        result = chain.invoke({"text": text})

        G = nx.Graph()
        nodes_list = result.get("nodes", [])
        edges_list = result.get("edges", [])
        
        for node in nodes_list:
            G.add_node(node["id"])
        for edge in edges_list:
            G.add_edge(edge["source"], edge["target"])
        
        centrality = nx.degree_centrality(G) if len(G.nodes) > 0 else {}
        
        formatted_nodes = []
        for node_data in nodes_list:
            node_id = node_data["id"]
            work = node_data.get("source_work", "Unknown System")
            raw_importance = centrality.get(node_id, 0)
            size = 5 + (raw_importance * 50)
            
            formatted_nodes.append({
                "id": node_id,
                "work": work,
                "size": size,
                "val": size
            })
            
        return {"nodes": formatted_nodes, "links": edges_list}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Extraction Error: {str(e)}")

@app.post("/analyze", response_model=GraphResponse)
async def analyze_lore(request: LoreRequest):
    try:
        request.validate_text()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    
    api_key = request.api_key or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured. Set GOOGLE_API_KEY environment variable.")
    
    return await run_extraction(request.text, api_key)

@app.get("/analyze-gutenberg/{book_id}", response_model=GraphResponse)
async def analyze_gutenberg(book_id: str, limit_chars: int = 100000):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured.")
    
    text = get_gutenberg_book(book_id)
    if text.startswith("Gutenberg Error"):
        raise HTTPException(status_code=500, detail=text)
    
    return await run_extraction(text[:limit_chars], api_key)

@app.get("/character-dossier/{character_name}", response_model=DossierResponse)
async def character_dossier(character_name: str, system_name: str = "Unknown"):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API key not configured.")
    
    try:
        prompt = PromptTemplate(
            template="""
                You are a Multiversal Detective. Create a dossier for character "{character_name}" from "{system_name}".
                Return ONLY a valid JSON object.
                {{
                    "name": "{character_name}",
                    "biography": "Brief bio.",
                    "notable_events": ["Event 1"]
                }}  
            """,
            input_variables=["character_name", "system_name"],
        )
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0)
        chain = prompt | llm | JsonOutputParser()
        return chain.invoke({"character_name": character_name, "system_name": system_name})
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Dossier generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
