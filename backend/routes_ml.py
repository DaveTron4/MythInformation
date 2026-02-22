from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from ml_predictor import predictor

router = APIRouter(prefix="/predict", tags=["ML Predictions"])

class RelationshipPredictionRequest(BaseModel):
    """Request schema for relationship type prediction"""
    source_centrality: float
    target_centrality: float
    source_name_length: int
    target_name_length: int
    same_work: int = 0
    source_in_work: int = 0

class RelationshipPredictionResponse(BaseModel):
    """Response schema for relationship prediction"""
    predicted_relationship: Optional[str]
    confidence: Optional[float]
    error: Optional[str] = None

@router.post("/relationship-type", response_model=RelationshipPredictionResponse)
async def predict_relationship_type(request: RelationshipPredictionRequest):
    """
    Predict the relationship type between two characters based on their features.
    
    Features:
    - source_centrality: How connected the source character is (0-1 scale)
    - target_centrality: How connected the target character is (0-1 scale)
    - source_name_length: Length of source character's name
    - target_name_length: Length of target character's name
    - same_work: 1 if both characters from same work, 0 otherwise
    - source_in_work: 1 if source character is from the relationship's work
    
    Returns:
    - predicted_relationship: The predicted relationship type
    - confidence: Confidence score (0-1)
    """
    result = predictor.predict(
        request.source_centrality,
        request.target_centrality,
        request.source_name_length,
        request.target_name_length,
        request.same_work,
        request.source_in_work
    )
    
    if result["error"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result["error"]
        )
    
    return result

@router.get("/health")
async def ml_health_check():
    """Check if ML model is loaded and ready"""
    return {
        "ml_model_loaded": predictor.is_loaded,
        "model_features": predictor.feature_names,
        "label_classes": predictor.label_encoder.classes_.tolist() if predictor.label_encoder else None
    }
