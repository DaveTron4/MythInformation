from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Analysis
from schemas import AnalysisCreate, AnalysisUpdate, AnalysisResponse, AnalysisListItem
from auth import get_current_user
from databricks_integration import DatabricksClient

router = APIRouter(prefix="/analyses", tags=["Analyses"])
db_client = None

@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    analysis_data: AnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analysis for the current user."""
    new_analysis = Analysis(
        user_id=current_user.id,
        name=analysis_data.name,
        description=analysis_data.description,
        nodes=analysis_data.nodes,
        links=analysis_data.links,
        work_meta=analysis_data.work_meta
    )
    
    db.add(new_analysis)
    db.commit()
    try:
        global db_client
        if db_client is None:
            db_client = DatabricksClient()
        db_client.log_analysis(
            new_analysis.id,
            current_user.id,
            new_analysis.nodes,
            new_analysis.links
        )
    except Exception as e:
        print(f"Databricks logging failed: {e}")
    db.refresh(new_analysis)
    
    return new_analysis

@router.get("", response_model=List[AnalysisListItem])
async def get_my_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analyses for the current user."""
    analyses = db.query(Analysis).filter(
        Analysis.user_id == current_user.id
    ).order_by(Analysis.updated_at.desc()).all()
    
    # Convert to list items with node count
    result = []
    for analysis in analyses:
        result.append({
            "id": analysis.id,
            "name": analysis.name,
            "description": analysis.description,
            "created_at": analysis.created_at,
            "updated_at": analysis.updated_at,
            "node_count": len(analysis.nodes) if analysis.nodes else 0
        })
    
    return result

@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific analysis by ID."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return analysis

@router.put("/{analysis_id}", response_model=AnalysisResponse)
async def update_analysis(
    analysis_id: str,
    analysis_data: AnalysisUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing analysis."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Update fields if provided
    if analysis_data.name is not None:
        analysis.name = analysis_data.name
    if analysis_data.description is not None:
        analysis.description = analysis_data.description
    if analysis_data.nodes is not None:
        analysis.nodes = analysis_data.nodes
    if analysis_data.links is not None:
        analysis.links = analysis_data.links
    if analysis_data.work_meta is not None:
        analysis.work_meta = analysis_data.work_meta
    
    db.commit()
    db.refresh(analysis)
    
    return analysis

@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an analysis."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    db.delete(analysis)
    db.commit()
    
    return None
