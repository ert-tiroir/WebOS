
from websockets.server import WebSocketServerProtocol
from server.providers.abstract import AbstractProvider
from server.server import WebOSServer

class BroadcastProvider(AbstractProvider):
    async def broadcast (self, json):
        for connection in self.server.connections:
            await connection.send(self, json)
