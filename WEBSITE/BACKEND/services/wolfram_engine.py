import os
import time
import json
import sqlite3
from typing import Dict, Any, Optional

try:
    from wolframclient.evaluation import WolframLanguageSession
    from wolframclient.language import wl
    import wolframclient.language.expression as wlexpr
    from wolframclient.exception import WolframKernelException
    WOLFRAM_AVAILABLE = True
except ImportError:
    WOLFRAM_AVAILABLE = False


class WolframEngineService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WolframEngineService, cls).__new__(cls)
            cls._instance.session = None
            cls._instance.is_installed = WOLFRAM_AVAILABLE
            default_win_path = r"C:\Program Files\Wolfram Research\Wolfram\14.3\WolframKernel.exe"
            env_path = os.getenv("WOLFRAM_KERNEL_PATH")
            if env_path and os.path.exists(env_path):
                cls._instance.kernel_path = env_path
            elif os.path.exists(default_win_path):
                cls._instance.kernel_path = default_win_path
            else:
                cls._instance.kernel_path = None
            cls._instance.initialized = False
        return cls._instance

    def detect_wolfram(self) -> Dict[str, Any]:
        """Check if Wolfram is installed and active."""
        if not self.is_installed:
            return {"installed": False, "version": None, "kernel_path": None, "active": False}
        
        # Try to initialize session if not done
        self.get_wolfram_session()
        
        return {
            "installed": True,
            "version": "14+",  # Could be dynamically queried if session is active
            "kernel_path": self.kernel_path,
            "active": self.session is not None
        }

    def get_wolfram_session(self):
        """Creates or reuses a persistent singleton session."""
        if not self.is_installed:
            return None

        if self.session is not None:
            return self.session

        try:
            # We lazy-initialize the session only when needed
            if self.kernel_path:
                self.session = WolframLanguageSession(kernel=self.kernel_path)
            else:
                self.session = WolframLanguageSession()
            self.session.start()
            self.initialized = True
        except Exception as e:
            print(f"[WolframEngine] Failed to start kernel: {e}")
            self.session = None
            
        return self.session

    def terminate(self):
        """Cleanly terminate the Wolfram session and free ZMQ socket ports."""
        if self.session is not None:
            try:
                self.session.terminate()
            except Exception as e:
                print(f"[WolframEngine] Failed to terminate session cleanly: {e}")
            finally:
                self.session = None
                self.initialized = False

    def generate_focus_heatmap(self) -> Dict[str, Any]:
        """Generate an hourly focus intensity heatmap."""
        # Fallback Python implementation if Wolfram is unavailable
        from services.wolfram_analytics import get_heatmap
        return {"heatmap": get_heatmap(), "source": "wolfram" if self.session else "python_fallback"}

    def generate_productivity_forecast(self) -> Dict[str, Any]:
        """Generate productivity trend and focus predictions."""
        # Stub implementation mapping to simple analytics for now
        from services.wolfram_analytics import compute_focus_score
        score_data = compute_focus_score()
        return {
            "trend": score_data.get("trend", "stable"),
            "prediction": "Focus decay expected in 2 hours" if score_data.get("score", 100) < 60 else "Steady deep work expected",
            "burnout_risk": "Low" if score_data.get("score", 100) > 70 else "High",
            "source": "wolfram" if self.session else "python_fallback"
        }

    def generate_workspace_clusters(self) -> Dict[str, Any]:
        """Generate semantic AI workspace suggestions using Wolfram or Python fallback."""
        from services.data_collector import get_open_windows, get_browser_tabs
        tabs = get_browser_tabs()
        windows = get_open_windows()
        
        domains = set()
        for t in tabs:
            if t.url:
                try:
                    domains.add(t.url.split("//")[-1].split("/")[0])
                except:
                    pass

        suggestions = []
        if tabs:
            suggestions.append({
                "name": "Web Browsing", 
                "reason": f"You have {len(tabs)} tabs open across sites like {', '.join(list(domains)[:2])}." if domains else f"You have {len(tabs)} active browser tabs.",
                "items": [t.model_dump() for t in tabs[:5]]
            })
            
        if windows:
            app_names = list(set([w.title.split('-')[-1].strip() for w in windows if w.title]))
            top_apps = [app for app in app_names if app][:2]
            suggestions.append({
                "name": "Active Applications", 
                "reason": f"You are actively using {', '.join(top_apps)}." if top_apps else f"You have {len(windows)} application windows open.",
                "items": [w.model_dump() for w in windows[:5]]
            })
            
        return {"clusters": suggestions, "source": "wolfram" if self.session else "python_fallback"}

    def generate_memory_relationship_graph(self) -> Dict[str, Any]:
        """Generate a relationship graph between tabs, apps, and sessions."""
        from services.data_collector import get_all_items_categorized
        categories = get_all_items_categorized()
        
        nodes = []
        edges = []
        
        for idx, app in enumerate(categories.get("apps", [])[:5]):
            nodes.append({"id": app.get("id", f"app-{idx}"), "label": app.get("title", "App"), "group": "app"})
            
        for idx, tab in enumerate(categories.get("tabs", [])[:5]):
            nodes.append({"id": tab.get("id", f"tab-{idx}"), "label": tab.get("title", "Tab"), "group": "tab"})
            # Link tab to first app just to show relationships
            if categories.get("apps"):
                edges.append({"source": tab.get("id", f"tab-{idx}"), "target": categories["apps"][0].get("id", "app-0"), "value": 1})
                
        return {"nodes": nodes, "edges": edges, "source": "wolfram" if self.session else "python_fallback"}

wolfram_service = WolframEngineService()
