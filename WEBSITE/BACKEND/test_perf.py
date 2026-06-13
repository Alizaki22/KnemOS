import sys
import os
import time
import asyncio
sys.path.append(r"C:\Users\ahadd\Documents\GitHub\Knemos\WEBSITE\BACKEND")
from services.data_collector import get_open_windows, get_processes, get_browser_tabs

def test():
    s = time.time()
    get_open_windows()
    print("windows:", time.time()-s)
    
    s = time.time()
    get_processes()
    print("processes:", time.time()-s)

test()
