
from osserver.connection import Connection

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from osserver.server import WebOSServer

class AbstractProvider:
    def __init__(self, server: "WebOSServer"):
        self.server = server

    def get_provider_name (self):
        raise Exception("AbstractProvider does not provide a name")
    
    def on_start (self): pass
    def on_stop  (self): pass
    def get_logger (self):
        return self.server.get_logger()
    async def on_init (self, connection: Connection):
        pass
    async def on_message (self, connection: Connection, message: any):
        pass
    async def on_leave (self, connection: Connection):
        pass
