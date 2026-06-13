# backend/routers/chat.py
"""
Chat endpoint — real local Qwen2.5 via Ollama.
Two modes:
  query  — current system state context (RAM, tabs, focus, workspace)
  rag    — historical context from activity log + ChromaDB semantic search
"""
import time
import requests
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

OLLAMA_URL = "http://localhost:11434"
CHAT_MODEL = "qwen2.5:7b"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    mode: Optional[str] = "query"  # "query" or "rag"


def _build_system_context_query() -> str:
    """Build context from live system state for query mode."""
    try:
        from services.data_collector import get_open_windows, get_browser_tabs, get_ram_stats
        from services.wolfram_analytics import compute_focus_score
        from services.memory_indexer import get_activity_timeline
        from services.wolfram_engine import wolfram_service

        windows = get_open_windows()
        tabs = get_browser_tabs()
        ram = get_ram_stats()
        focus = compute_focus_score()
        timeline = get_activity_timeline(hours=4, limit=20)
        
        # Wolfram Data
        forecast = wolfram_service.generate_productivity_forecast()
        clusters = wolfram_service.generate_workspace_clusters()

        window_list = "\n".join([f"- {w.title}" for w in windows[:10]])
        tab_list = "\n".join([f"- {t.title}" for t in tabs[:10]])
        timeline_str = "\n".join([
            f"- [{time.strftime('%H:%M', time.localtime(e['timestamp']))}] {e['event_type']}: {e['title']}"
            for e in timeline[:10]
        ])

        return f"""You are KNEMOS, a local AI assistant integrated into a semantic desktop operating system.
You have access to the user's current system state. Answer questions accurately based on this context.
Never mention you are a language model or Qwen. Just answer as KNEMOS.

CURRENT SYSTEM STATE:
RAM: {ram.get('used_gb', '?')}GB used of {ram.get('total_gb', '?')}GB ({ram.get('percent', '?')}%)
Focus Score: {focus.get('score', 0)}/100 (Grade: {focus.get('grade', '?')})
Context Switches: {focus.get('context_switches', 0)}

OPEN WINDOWS:
{window_list or '(none detected)'}

OPEN TABS:
{tab_list or '(none from extension)'}

WOLFRAM INTELLIGENCE LAYER:
Productivity Trend: {forecast.get('trend')}
Prediction: {forecast.get('prediction')}
Burnout Risk: {forecast.get('burnout_risk')}
Suggested Workspaces: {', '.join([c['name'] for c in clusters.get('clusters', [])])}

RECENT ACTIVITY (last 4 hours):
{timeline_str or '(no activity recorded yet)'}
"""
    except Exception as e:
        return f"You are KNEMOS AI. Answer the user's question. (Context unavailable: {e})"


def _build_rag_context(query: str) -> str:
    """Build context from historical memory for RAG mode."""
    try:
        from services.memory_indexer import search_memory, search_activity_log

        # Vector search over screenshots
        semantic_results = search_memory(query, limit=5)
        # Keyword search over activity log
        keyword_results = search_activity_log(query, limit=10)

        sem_str = "\n".join([
            f"- [{time.strftime('%Y-%m-%d %H:%M', time.localtime(r['timestamp']))}] {r['text_preview'][:150]}"
            for r in semantic_results
        ])
        kw_str = "\n".join([
            f"- [{time.strftime('%Y-%m-%d %H:%M', time.localtime(r['timestamp']))}] {r['event_type']}: {r['title']}"
            for r in keyword_results
        ])

        return f"""You are KNEMOS, a local AI assistant with access to the user's historical workspace memory.
Answer questions based on stored activity logs and indexed screen content.

SEMANTIC MEMORY (most relevant stored content):
{sem_str or '(no relevant memories found)'}

ACTIVITY LOG MATCHES:
{kw_str or '(no matching activity)'}
"""
    except Exception as e:
        return f"You are KNEMOS AI with memory access. (Memory unavailable: {e})"


def _call_ollama(system_prompt: str, user_message: str, history: List[ChatMessage]) -> str:
    """Call Ollama Qwen2.5 with full conversation context."""
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history
    for msg in history[-8:]:  # Last 8 messages for context
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})

    try:
        resp = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": CHAT_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 512
                }
            },
            timeout=30  # 30 second timeout for local model
        )
        if resp.status_code == 200:
            data = resp.json()
            return data.get("message", {}).get("content", "")
        else:
            return f"[KNEMOS AI] Ollama returned status {resp.status_code}. Make sure Ollama is running with: ollama serve"
    except requests.exceptions.ConnectionError:
        return "[KNEMOS AI] Cannot connect to Ollama. Please start Ollama with: ollama serve — then ensure the model is available: ollama pull qwen2.5:7b"
    except requests.exceptions.Timeout:
        return "[KNEMOS AI] The local model is taking longer than expected. This is normal on first load. Please try again."
    except Exception as e:
        return f"[KNEMOS AI] Error: {e}"


@router.post("")
async def chat_endpoint(req: ChatRequest):
    """
    Main chat endpoint. Routes to query or RAG mode.
    Connects to local Qwen2.5 via Ollama.
    """
    import asyncio
    mode = req.mode or "query"

    if mode == "rag":
        system_prompt = await asyncio.to_thread(_build_rag_context, req.message)
    else:
        system_prompt = await asyncio.to_thread(_build_system_context_query)

    reply = await asyncio.to_thread(_call_ollama, system_prompt, req.message, req.history)

    return {
        "reply": reply,
        "mode": mode,
        "model": CHAT_MODEL,
        "context": {
            "mode": mode,
            "timestamp": int(time.time())
        }
    }


@router.get("/status")
async def chat_status():
    """Check if Ollama and the chat model are available."""
    try:
        import asyncio
        resp = await asyncio.to_thread(requests.get, f"{OLLAMA_URL}/api/tags", timeout=3)
        if resp.status_code == 200:
            models = [m.get("name", "") for m in resp.json().get("models", [])]
            model_available = any(CHAT_MODEL in m for m in models)
            return {
                "ollama_running": True,
                "model_available": model_available,
                "available_models": models,
                "recommended_model": CHAT_MODEL
            }
    except Exception:
        pass
    return {
        "ollama_running": False,
        "model_available": False,
        "available_models": [],
        "recommended_model": CHAT_MODEL
    }
