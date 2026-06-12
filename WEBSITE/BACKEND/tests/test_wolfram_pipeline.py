import pytest
from services.wolfram_engine import wolfram_service

def test_wolfram_detection():
    status = wolfram_service.detect_wolfram()
    assert isinstance(status, dict)
    assert "installed" in status

def test_wolfram_heatmap_fallback():
    heatmap = wolfram_service.generate_focus_heatmap()
    assert "heatmap" in heatmap
    assert "source" in heatmap

def test_wolfram_productivity_forecast():
    forecast = wolfram_service.generate_productivity_forecast()
    assert "trend" in forecast
    assert "prediction" in forecast

def test_wolfram_clusters():
    clusters = wolfram_service.generate_workspace_clusters()
    assert "clusters" in clusters

def test_wolfram_graph():
    graph = wolfram_service.generate_memory_relationship_graph()
    assert "nodes" in graph
    assert "edges" in graph
