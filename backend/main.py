from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI(title="MythInformation API")

# Enable CORS
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

@app.get("/")
def health_check():
    return {"status": "MythInformation Brain is Active"}

@app.post("/analyze", response_model=GraphResponse)
async def analyze_lore(request: LoreRequest):
    api_key = request.api_key or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Google API Key is required")

    return await run_extraction(request.text, api_key)

@app.get("/analyze-book", response_model=GraphResponse)
async def analyze_local_book(limit_chars: int = 5000):
    """
    Tests extraction using the locally saved book_lore.txt file.
    'limit_chars' prevents sending 800k chars at once during testing.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="Google API Key is required in .env")

    file_path = "book_lore.txt"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="book_lore.txt not found. Run scraper.py first.")

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
            # Take a slice of the book for testing (e.g., first 5000 characters)
            sample_text = text[:limit_chars]
            
        return await run_extraction(sample_text, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def run_extraction(text: str, api_key: str):
    """
    Shared logic for calling Gemini and parsing results.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0
        )

        prompt = PromptTemplate(
            template="""
            You are an expert Lore Detective. Extract a Knowledge Graph from the text.
            Identify characters, their factions, and how they are related.
            
            Return ONLY a JSON object:
            {{
                "nodes": ["Character Name", "Faction Name"],
                "edges": [{{"source": "Name A", "target": "Name B", "label": "RELATIONSHIP"}}]
            }}
            
            Text: {text}
            """,
            input_variables=["text"],
        )

        chain = prompt | llm | JsonOutputParser()
        result = chain.invoke({"text": text})
        
        # Format for React-Force-Graph
        formatted_nodes = [{"id": name, "group": 1} for name in result.get("nodes", [])]
        formatted_links = result.get("edges", [])
        
        return {"nodes": formatted_nodes, "links": formatted_links}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
