from fastapi import APIRouter
from services.wolfram_engine import wolfram_service

router = APIRouter()

@router.get("/status")
async def get_status():
    return wolfram_service.detect_wolfram()

@router.get("/focus-heatmap")
async def get_focus_heatmap():
    return wolfram_service.generate_focus_heatmap()

@router.get("/workspace-insights")
async def get_workspace_insights():
    return wolfram_service.generate_workspace_clusters()

@router.get("/predictions")
async def get_predictions():
    return wolfram_service.generate_productivity_forecast()

@router.get("/knowledge-graph")
async def get_knowledge_graph():
    return wolfram_service.generate_memory_relationship_graph()
