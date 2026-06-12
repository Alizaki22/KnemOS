import pytest
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_websocket_connection():
    with client.websocket_connect("/ws") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_json()
        assert data["type"] == "pong"
