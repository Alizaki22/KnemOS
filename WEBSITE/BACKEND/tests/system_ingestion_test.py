import pytest
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_receive_browser_tabs():
    payload = {
        "browser_id": "test_ext",
        "browser_type": "chrome",
        "session_id": "123",
        "tabs": [
            {"id": 1, "title": "Test Tab 1", "url": "https://test1.com", "active": True},
            {"id": 2, "title": "Test Tab 2", "url": "https://test2.com", "active": False}
        ]
    }
    response = client.post("/api/system/browser-tabs", json=payload)
    assert response.status_code == 200
    assert response.json()["received"] == 2

    # Verify categories update
    from services.data_collector import get_browser_tabs
    tabs = get_browser_tabs()
    assert len(tabs) >= 2
    assert any(t.title == "Test Tab 1" for t in tabs)

def test_ram_telemetry():
    response = client.get("/api/system/ram")
    assert response.status_code == 200
    data = response.json()
    assert "total_gb" in data
    assert "used_gb" in data
    assert "percent" in data
