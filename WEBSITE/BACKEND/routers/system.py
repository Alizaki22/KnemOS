# backend/routers/system.py
"""
System endpoints:
  GET  /api/system/health            — backend ping
  GET  /api/system/ram               — live RAM stats
  GET  /api/system/windows           — open windows
  GET  /api/system/processes         — running processes
  GET  /api/system/focus             — current cognitive focus score
  POST /api/system/browser-tabs      — receive tabs from Chrome Extension
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.data_collector import get_ram_stats, get_open_windows, update_browser_tabs, get_processes
from services.wolfram_analytics import compute_focus_score
from models.schemas import BrowserTab

router = APIRouter()


class TabsPayload(BaseModel):
    tabs: List[BrowserTab]


@router.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@router.get("/ram")
async def ram():
    return get_ram_stats()


@router.get("/windows")
async def windows():
    items = get_open_windows()
    return {"windows": [i.model_dump() for i in items]}


@router.get("/processes")
async def processes():
    """Return list of running processes with CPU and memory usage."""
    procs = get_processes()
    return {"processes": procs}


@router.get("/focus")
async def focus():
    """Return current cognitive focus score — was previously missing (404)."""
    return compute_focus_score()


@router.post("/browser-tabs")
async def receive_tabs(payload: TabsPayload):
    """Chrome Extension posts browser tabs here."""
    from services.memory_indexer import log_activity_event
    tabs = [t.model_dump() for t in payload.tabs]
    update_browser_tabs(tabs)

    # Log tabs as activity events for RAG context
    for tab in tabs[:10]:  # Log top 10 tabs only
        if tab.get("title"):
            log_activity_event("tab_detected", tab["title"], {
                "url": tab.get("url", ""),
                "active": tab.get("active", False)
            })

    return {"status": "ok", "received": len(tabs)}
