# backend/routers/focus.py
"""
Deep Focus mode endpoints:
  POST /api/focus/activate      — minimize all windows outside selected workspace
  POST /api/focus/deactivate    — restore previously minimized windows
  GET  /api/focus/status        — current focus mode status
"""
import win32gui
import win32con
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.memory_indexer import log_activity_event

router = APIRouter()

# In-memory state for focus session
_focus_state = {
    "active": False,
    "workspace_id": None,
    "workspace_name": None,
    "protected_titles": set(),
    "minimized_hwnds": []
}


class FocusActivateRequest(BaseModel):
    workspace_id: Optional[str] = None
    workspace_name: Optional[str] = None
    protected_titles: Optional[list[str]] = None  # Window titles to keep visible


@router.get("/status")
async def focus_status():
    return {
        "active": _focus_state["active"],
        "workspace_id": _focus_state["workspace_id"],
        "workspace_name": _focus_state["workspace_name"],
        "protected_titles": list(_focus_state["protected_titles"]),
        "minimized_count": len(_focus_state["minimized_hwnds"])
    }


@router.post("/activate")
async def activate_focus(req: FocusActivateRequest):
    """
    Minimize all windows not in the protected list.
    Uses pywin32 ShowWindow(hwnd, SW_MINIMIZE).
    """
    if _focus_state["active"]:
        # Already active, deactivate first
        await _restore_windows()

    protected = set(req.protected_titles or [])
    # Always protect KnemOS itself
    protected.add("KnemOS")

    _focus_state["active"] = True
    _focus_state["workspace_id"] = req.workspace_id
    _focus_state["workspace_name"] = req.workspace_name
    _focus_state["protected_titles"] = protected
    _focus_state["minimized_hwnds"] = []

    minimized = []

    def enum_minimize(hwnd, _):
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = win32gui.GetWindowText(hwnd).strip()
        if not title:
            return
        # Check if any protected title is a substring of the window title
        is_protected = any(pt.lower() in title.lower() for pt in protected if pt)
        if not is_protected:
            try:
                win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
                minimized.append(hwnd)
            except Exception:
                pass

    try:
        win32gui.EnumWindows(enum_minimize, None)
        _focus_state["minimized_hwnds"] = minimized

        log_activity_event("focus_activate", req.workspace_name or "Deep Focus", {
            "workspace_id": req.workspace_id,
            "minimized_count": len(minimized)
        })

        return {
            "status": "activated",
            "minimized_count": len(minimized),
            "workspace_name": req.workspace_name,
            "protected_titles": list(protected)
        }
    except Exception as e:
        print(f"[Focus] Activate error: {e}")
        _focus_state["active"] = False
        return {"status": "error", "message": str(e)}


async def _restore_windows():
    """Internal helper: restore all minimized windows."""
    restored = 0
    for hwnd in _focus_state["minimized_hwnds"]:
        try:
            if win32gui.IsWindow(hwnd):
                win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
                restored += 1
        except Exception:
            pass
    _focus_state["minimized_hwnds"] = []
    return restored

def enforce_focus():
    """Watchdog function to auto-minimize unrelated windows while focus is active."""
    if not _focus_state["active"]:
        return
        
    protected = _focus_state["protected_titles"]
    newly_minimized = []

    def enum_minimize(hwnd, _):
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = win32gui.GetWindowText(hwnd).strip()
        if not title:
            return
        is_protected = any(pt.lower() in title.lower() for pt in protected if pt)
        if not is_protected:
            try:
                # If window isn't already minimized
                tup = win32gui.GetWindowPlacement(hwnd)
                if tup[1] != win32con.SW_SHOWMINIMIZED:
                    win32gui.ShowWindow(hwnd, win32con.SW_MINIMIZE)
                    newly_minimized.append(hwnd)
                    if hwnd not in _focus_state["minimized_hwnds"]:
                        _focus_state["minimized_hwnds"].append(hwnd)
            except Exception:
                pass

    try:
        win32gui.EnumWindows(enum_minimize, None)
    except Exception as e:
        print(f"[Focus Watchdog] Error: {e}")

@router.post("/deactivate")
async def deactivate_focus():
    """Restore all windows that were minimized by focus mode."""
    if not _focus_state["active"]:
        return {"status": "not_active", "restored_count": 0}

    restored = await _restore_windows()

    log_activity_event("focus_deactivate", _focus_state.get("workspace_name") or "Deep Focus ended", {
        "restored_count": restored
    })

    _focus_state["active"] = False
    _focus_state["workspace_id"] = None
    _focus_state["workspace_name"] = None
    _focus_state["protected_titles"] = set()

    return {"status": "deactivated", "restored_count": restored}
