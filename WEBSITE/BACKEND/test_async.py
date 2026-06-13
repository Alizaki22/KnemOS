import asyncio
import sys
sys.path.append(r"C:\Users\ahadd\Documents\GitHub\Knemos\WEBSITE\BACKEND")
from scheduler import get_all_items_categorized

async def test():
    import time
    start = time.time()
    res = await asyncio.to_thread(get_all_items_categorized)
    print(f"Time: {time.time()-start}")
    print("Keys:", res.keys())
    print("Apps:", len(res['apps']))

asyncio.run(test())
