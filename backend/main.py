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

load_dotenv()

app = FastAPI(title="MythInformation API")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoreRequest(BaseModel):
    text: str
    api_key: Optional[str] = None

class GraphResponse(BaseModel):
    nodes: List[dict]
    links: List[dict]

class DossierResponse(BaseModel):
    name: str
    biography: str
    notable_events: List[str]

# Health Check
@app.get("/")
def health_check():
    return {"status": "MythInformation Brain is Active"}

# Extraction Logic
async def run_extraction(text: str, api_key: str):
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
            max_output_tokens=8192
        )

        prompt = PromptTemplate(
            template="""
            You are a Multiversal Detective. Extract characters and their relationships from the text.
            Return ONLY a valid JSON object.
            
            Structure:
            {{
                "nodes": [
                    {{"id": "Character Name", "source_work": "Name of Game/Book"}}
                ],
                "edges": [
                    {{"source": "Name A", "target": "Name B", "label": "RELATIONSHIP", "source_work": "Name of Game/Book"}}
                ]
            }}
            
            Text: {text}
            """,
            input_variables=["text"],
        )

        chain = prompt | llm | JsonOutputParser()
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
            size = 4 + (raw_importance * 50)
            
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

# Endpoints
@app.post("/analyze", response_model=GraphResponse)
async def analyze_lore(request: LoreRequest):
    api_key = request.api_key or os.getenv("GOOGLE_API_KEY")
    if not api_key: raise HTTPException(status_code=400, detail="API Key Missing")
    return await run_extraction(request.text, api_key)

@app.get("/analyze-gutenberg/{book_id}", response_model=GraphResponse)
async def analyze_gutenberg(book_id: str, limit_chars: int = 100000):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key: raise HTTPException(status_code=400, detail="API Key Missing")
    
    text = get_gutenberg_book(book_id)
    if text.startswith("Gutenberg Error"):
        raise HTTPException(status_code=404, detail=text)
        
    return await run_extraction(text[:limit_chars], api_key)

@app.get("/character-dossier/{character_name}", response_model=DossierResponse)
async def character_dossier(character_name: str, system_name: str = "Unknown"):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key: raise HTTPException(status_code=400, detail="API Key Missing")
    
    prompt = PromptTemplate(
        template="""
            You are a Multiversal Detective. Create a detailed dossier for the character "{character_name}" specifically from the work/system "{system_name}".
            Return ONLY a valid JSON object.
            
            Structure:
            {{
                "name": "{character_name}",
                "biography": "Brief biography here.",
                "notable_events": [
                    "Description of event 1",
                    "Description of event 2"
                ]
            }}  
        """,
        input_variables=["character_name", "system_name"],
    )
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0)
    chain = prompt | llm | JsonOutputParser()
    try:
        return chain.invoke({"character_name": character_name, "system_name": system_name})
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
