import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('ws://127.0.0.1:8765/ws') as ws:
            print("Connected")
            await ws.send('hello')
            print("Sent hello")
            res = await ws.recv()
            print("Received:", res)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
