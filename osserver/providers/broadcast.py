
from websockets.server import WebSocketServerProtocol
from osserver.providers.abstract import AbstractProvider
from osserver.server import WebOSServer

class BroadcastProvider(AbstractProvider):
    async def broadcast (self, json):
        for connection in self.server.connections:
            await connection.send(self, json)
