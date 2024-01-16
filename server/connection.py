
import json

class Connection:
    def __init__(self, websocket):
        self.websocket = websocket
    
    async def send (self, provider, data: any):
        data = { "provider": provider.get_provider_name(), "data": data }

        string_data = json.dumps(data)
        await self.websocket.send(string_data)
    async def recv (self):
        return await self.websocket.recv()