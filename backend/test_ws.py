import asyncio
import websockets
import json

async def test_ws():
    uri = "wss://nsg-erp.onrender.com/employee-portal/ws/test_client"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            
            payload = {
                "type": "new_message",
                "channel_id": "general-channel",
                "text": "Hello world from test script",
                "sender": "test_client",
                "attachment_url": None,
                "attachment_type": None
            }
            await websocket.send(json.dumps(payload))
            print("Message sent, waiting for response...")
            
            # Wait for 3 seconds for a response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print(f"Received: {response}")
            except asyncio.TimeoutError:
                print("No response received within timeout.")
                
    except Exception as e:
        print(f"WebSocket connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
