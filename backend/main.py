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

load_dotenv()

app = FastAPI(title="MythInformation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoreRequest(BaseModel):
    text: str
    api_key: Optional[str] = None

class GraphResponse(BaseModel):
    nodes: List[dict]
    links: List[dict]

async def run_extraction(text: str, api_key: str):
    try:
        # Setting up the LLM with the provided API key
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0,
            max_output_tokens=8192
        )

        parser = JsonOutputParser()

        prompt = PromptTemplate(
            template="""
            You are a Multiversal Detective. Extract characters and their relationships from the text.
            
            Return ONLY a valid JSON object. Do not include markdown formatting.
            
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
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

@app.post("/analyze", response_model=GraphResponse)
async def analyze_lore(request: LoreRequest):
    api_key = request.api_key or os.getenv("GOOGLE_API_KEY")
    return await run_extraction(request.text, api_key)

@app.get("/analyze-book", response_model=GraphResponse)
async def analyze_local_book(limit_chars: int = 3000):
    api_key = os.getenv("GOOGLE_API_KEY")
    file_path = "book_lore.txt"
    if not os.path.exists(file_path):
        return {"nodes": [], "links": []}
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()[:limit_chars]
    return await run_extraction(text, api_key)

@app.get("/character-dossier/{character_name}", response_model=GraphResponse)
async def character_dossier(character_name: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    prompt = PromptTemplate(
        template="""
            You are a Multiversal Detective. Create a detailed dossier for the character "{character_name}" based on all known information.
            
            Include:
            - A brief biography
            - Key relationships with other characters
            - Notable events they were involved in
            
            Return ONLY a valid JSON object. Do not include markdown formatting.
            
            Structure:
            {{
                "name": "Character Name",
                "biography": "Brief biography here.",
                "relationships": [
                {{"character": "Related Character", "relationship": "Type of Relationship"}}
                ],
                "notable_events": [
                "Description of notable event 1",
                "Description of notable event 2"
                ]
            }}  
        """,
        input_variables=["character_name"],
    )
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0,
        max_output_tokens=4096
    )

    parser = JsonOutputParser()
    chain = prompt | llm | parser
    try:
        result = chain.invoke({"character_name": character_name})
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
