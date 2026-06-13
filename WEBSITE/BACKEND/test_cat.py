import sys
import os
sys.path.append(r"C:\Users\ahadd\Documents\GitHub\Knemos\WEBSITE\BACKEND")
from services.data_collector import get_all_items_categorized
import time

start = time.time()
try:
    cats = get_all_items_categorized()
    print("Success! Apps:", len(cats['apps']))
    print("Time:", time.time() - start)
except Exception as e:
    print("Error:", e)
