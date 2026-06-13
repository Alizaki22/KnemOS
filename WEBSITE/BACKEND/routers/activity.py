# backend/routers/activity.py
"""
Activity tracking endpoints:
  GET  /api/activity/timeline    — chronological event list
  POST /api/activity/log         — log an event
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.memory_indexer import log_activity_event, get_activity_timeline

router = APIRouter()


class ActivityEvent(BaseModel):
    event_type: str
    title: str
    metadata: Optional[dict] = None


@router.get("/timeline")
async def timeline(hours: int = 24, limit: int = 100):
    """Return chronological activity events from the last N hours."""
    import asyncio
    events = await asyncio.to_thread(get_activity_timeline, hours=hours, limit=limit)
    return {"events": events, "count": len(events)}


@router.post("/log")
async def log_event(event: ActivityEvent):
    """Log an activity event (window open, tab change, focus, etc.)."""
    import asyncio
    await asyncio.to_thread(log_activity_event, event.event_type, event.title, event.metadata or {})
    return {"status": "logged"}
