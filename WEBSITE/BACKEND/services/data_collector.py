# backend/services/data_collector.py
"""
System data collection: open windows, RAM stats, processes, browser tabs.
Uses pywin32 + psutil for Windows-native access.
"""
import psutil
import win32gui
import win32process
import hashlib
from models.schemas import WorkspaceItem
from typing import List

# Titles to always exclude from workspace detection
IGNORED_TITLES = {
    "KNEMOS", "Task Manager", "Program Manager", "", " ",
    "Microsoft Text Input Application", "Settings", "Windows Input Experience"
}

# Browser process name patterns
BROWSER_EXE = {'chrome.exe', 'firefox.exe', 'msedge.exe', 'brave.exe', 'opera.exe', 'safari.exe'}


def get_open_windows() -> List[WorkspaceItem]:
    """Enumerate all visible windows using pywin32."""
    items = []
    seen = set()
    exe_memory = {}
    pid_info = {}
    import time
    for proc in psutil.process_iter(['pid', 'name', 'exe', 'memory_info']):
        time.sleep(0.001)  # Release GIL to prevent starving asyncio
        try:
            info = proc.info
            name = (info.get('name') or '').lower()
            exe_path = info.get('exe') or ''
            
            if name:
                mem_mb = round(info['memory_info'].rss / (1024 * 1024), 1) if info.get('memory_info') else 0
                exe_memory[name] = exe_memory.get(name, 0) + mem_mb
            
            if info.get('pid'):
                pid_info[info['pid']] = {
                    'name': name,
                    'exe': exe_path
                }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    import ctypes
    
    def get_window_text_safe(hwnd):
        length = ctypes.windll.user32.SendMessageTimeoutW(hwnd, 0x000E, 0, 0, 2, 50, None)
        if length == 0:
            return ""
        buf = ctypes.create_unicode_buffer(255)
        res = ctypes.windll.user32.SendMessageTimeoutW(hwnd, 0x000D, 255, buf, 2, 50, None)
        if res == 0:
            return ""
        return buf.value.strip()

    def enum_handler(hwnd, _):
        if not win32gui.IsWindowVisible(hwnd):
            return
        title = get_window_text_safe(hwnd)
        if not title or title in IGNORED_TITLES or title in seen:
            return
        seen.add(title)
        try:
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            
            p_info = pid_info.get(pid, {})
            exe = p_info.get('exe', '')
            name = p_info.get('name', '')
            
            # Use aggregated memory for the exe, or fallback to 0
            mem_mb = exe_memory.get(name, 0)
            
            items.append(WorkspaceItem(
                title=title,
                source='window',
                path=exe,
                memoryMb=round(mem_mb, 1)
            ))
        except Exception:
            items.append(WorkspaceItem(title=title, source='window'))

    win32gui.EnumWindows(enum_handler, None)
    return items


def get_processes() -> list[dict]:
    """Return top 30 running processes by memory usage."""
    procs = []
    import time
    try:
        for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'cpu_percent', 'status']):
            time.sleep(0.001)  # Release GIL to prevent starving asyncio
            try:
                info = proc.info
                mem_mb = round(info['memory_info'].rss / (1024 * 1024), 1) if info.get('memory_info') else 0
                procs.append({
                    "pid": info['pid'],
                    "name": info['name'] or 'unknown',
                    "memory_mb": mem_mb,
                    "cpu_percent": round(info.get('cpu_percent') or 0.0, 1),
                    "status": info.get('status', 'running'),
                    "is_browser": (info['name'] or '').lower() in BROWSER_EXE
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
    except Exception as e:
        print(f"[DataCollector] Process enumeration error: {e}")

    # Sort by memory descending, return top 30
    procs.sort(key=lambda x: x['memory_mb'], reverse=True)
    return procs[:30]


def get_ram_stats() -> dict:
    """Return current RAM usage stats with 'saved_gb' estimate."""
    vm = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=None)
    return {
        "total_gb":     round(vm.total / 1e9, 1),
        "used_gb":      round(vm.used / 1e9, 1),
        "available_gb": round(vm.available / 1e9, 1),
        "percent":      round(vm.percent, 1),
        "saved_gb":     round((vm.total - vm.used) / 1e9 * 0.4, 1),
        "cpu_percent":  round(cpu, 1)
    }


# In-memory store for browser tabs per extension instance
_browser_streams: dict[str, list[dict]] = {}

def update_browser_tabs(browser_id: str, browser_type: str, tabs: list[dict]):
    global _browser_streams
    _browser_streams[browser_id] = tabs

def get_browser_tabs() -> List[WorkspaceItem]:
    all_tabs = []
    for tabs in _browser_streams.values():
        all_tabs.extend([
            WorkspaceItem(title=t['title'], source='browser_tab', url=t.get('url'))
            for t in tabs
            if t.get('title')
        ])
    return all_tabs


def get_all_items_categorized() -> dict:
    """Get all detected items categorized by type — used for home screen."""
    windows = get_open_windows()
    tabs = get_browser_tabs()
    procs = get_processes()

    browsers = []
    apps = []
    BROWSER_TITLES = ['chrome', 'firefox', 'edge', 'brave', 'safari', 'opera']

    for w in windows:
        title_lower = w.title.lower()
        is_browser = any(b in title_lower for b in BROWSER_TITLES)
        item = w.model_dump()
        
        path_str = item.get('path') or ''
        title_str = item.get('title') or ''
        # hash executable path + title
        base_id = hashlib.md5(f"{path_str}:{title_str}".encode()).hexdigest()[:12]
        
        if is_browser:
            browsers.append({**item, "id": f"browser-{base_id}", "categoryType": "browsers"})
        else:
            apps.append({**item, "id": f"app-{base_id}", "categoryType": "apps"})

    tab_items = []
    for t in tabs:
        url_str = t.url or ''
        title_str = t.title or ''
        # hash normalized URL + title
        base_id = hashlib.md5(f"{url_str.split('?')[0]}:{title_str}".encode()).hexdigest()[:12]
        tab_items.append({**t.model_dump(), "id": f"tab-{base_id}", "categoryType": "tabs"})

    proc_items = [
        {
            "id": f"proc-{p['name']}",
            "title": p['name'],
            "source": "process",
            "categoryType": "processes",
            "memoryMb": p['memory_mb'],
            "isActive": p['status'] == 'running'
        }
        for p in procs[:15]  # Top 15 processes
    ]

    return {
        "browsers": browsers,
        "apps": apps,
        "tabs": tab_items,
        "files": [],
        "processes": proc_items
    }
