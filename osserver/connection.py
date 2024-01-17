
import json

class Connection:
    def __init__(self, websocket):
        self.websocket = websocket

        self.send_uuid = 0
    
    async def answer (self, uuid, data: any):
        data = { "is_answer": True, "answer_to": uuid, "data": data, "uuid": self.send_uuid }
        self.send_uuid += 1

        string_data = json.dumps(data)
        await self.websocket.send(string_data)
    async def send (self, provider, data: any):
        data = { "provider": provider.get_provider_name(), "data": data, "uuid": self.send_uuid }
        self.send_uuid += 1

        string_data = json.dumps(data)
        await self.websocket.send(string_data)
    async def recv (self):
        return await self.websocket.recv()