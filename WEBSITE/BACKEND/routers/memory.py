# backend/routers/memory.py
from fastapi import APIRouter
from pydantic import BaseModel
from services.memory_indexer import search_memory, capture_and_index, list_screenshots

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    limit: int = 5


@router.post("/search")
async def search(req: SearchRequest):
    import asyncio
    results = await asyncio.to_thread(search_memory, req.query, req.limit)
    return {"results": results}


@router.get("/screenshots")
async def screenshots():
    import asyncio
    items = await asyncio.to_thread(list_screenshots, limit=50)
    return {"screenshots": items, "total": len(items)}


@router.post("/capture")
async def force_capture():
    import asyncio
    screenshot_id = await asyncio.to_thread(capture_and_index)
    return {
        "status": "captured" if screenshot_id else "skipped",
        "screenshot_id": screenshot_id or "skipped"
    }
