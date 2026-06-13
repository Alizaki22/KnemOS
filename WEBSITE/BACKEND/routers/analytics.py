# backend/routers/analytics.py
from fastapi import APIRouter
from services.wolfram_analytics import compute_focus_score, get_heatmap, get_predictions

router = APIRouter()


@router.get("/focus-score")
async def focus_score():
    import asyncio
    return await asyncio.to_thread(compute_focus_score)


@router.get("/heatmap")
async def heatmap():
    import asyncio
    data = await asyncio.to_thread(get_heatmap)
    return {"data": data}


@router.get("/predictions")
async def predictions():
    import asyncio
    return await asyncio.to_thread(get_predictions)
