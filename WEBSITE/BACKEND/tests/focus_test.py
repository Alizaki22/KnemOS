import pytest
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from main import app
from services.wolfram_analytics import compute_focus_score

client = TestClient(app)

def test_focus_score():
    score = compute_focus_score()
    assert "score" in score
    assert "grade" in score
    assert 0 <= score["score"] <= 100

def test_focus_watchdog():
    response = client.get("/api/focus/status")
    assert response.status_code == 200
    assert "active" in response.json()
