
import websockets
import json
from osserver.connection import Connection
from osserver.message import Message

from osserver.providers.abstract import AbstractProvider

import asyncio
import logging
import os

import traceback

logger = logging.getLogger("WebOS")

def use_default_server_config ():
    logging.root.setLevel(logging.NOTSET)

    FORMAT = "[%(asctime)s %(levelname)s] %(message)s"

    while len(logger.handlers) != 0: logger.removeHandler(logger.handlers[-1])

    handler = logging.StreamHandler()
    handler.setLevel(logging.NOTSET)
    handler.setFormatter( logging.Formatter(FORMAT) )
    
    logger.addHandler(handler)

class WebOSServer:
    def __init__(self, os_path, url = "localhost", port = 8042):
        self.providers = {}

        self.url  = url
        self.port = port

        self.os_path = os.path.abspath(os_path) + os.sep

        self.connections: set[Connection] = set()
    def add_provider (self, provider: AbstractProvider):
        self.providers[provider.get_provider_name()] = provider

        for connection in self.connections:
            provider.on_init(connection)

    def convert_to_os_path (self, path: str):
        if path.startswith('.'): return None
        if path.startswith('/'): path = path[1:]

        jpath = os.path.join(self.os_path, path)
        tpath = os.path.normpath(jpath)

        if self.is_absolute_path_in_os(tpath): return tpath

        return None
    def is_absolute_path_in_os (self, path: str):
        return path.startswith(self.os_path) or path + os.sep == self.os_path
    def get_logger (self):
        return logger

    async def __serve(self):
        async with websockets.serve(self.__handle, "localhost", self.port):
            await asyncio.Future()
    async def __handle (self, socket):
        connection = Connection(socket)

        logger.info("New client connected")
        self.connections.add(connection)

        for key in self.providers:
            await self.providers[key].on_init(connection)

        try:
            while True:
                message = await connection.recv()
                
                data = None

                try:
                    data = json.loads(message)
                except Exception:
                    logger.warning("Protocol Exception - Expected JSON Data")
                    pass

                if data is None: continue

                target_provider_name = data.get('provider', None)
                if target_provider_name is None:
                    logger.warning("Protocol Exception - JSON should have a 'provider' field")
                    continue
                
                target_provider = self.providers.get(target_provider_name, None)
                if target_provider is None:
                    logger.warning("Protocol Exception - The 'provider' field should reference valid providers name")
                    logger.warning("Here is the list of enabled providers :")
                    for key in self.providers:
                        logger.warning(" - " + key)
                    
                    continue

                logger.info("Received message for provider '" + target_provider_name + "'")
                
                await target_provider.on_message(connection, Message(connection, data))
        except Exception as ex:
            if isinstance(ex, websockets.exceptions.ConnectionClosedOK):
                logger.info("Client disconnected properly")
            else:
                logger.critical("Client was kicked out due to an unexpected exception")
                
                traceback.print_exception(ex)
        
        self.connections.remove(connection)
        
        for key in self.providers:
            await self.providers[key].on_leave(connection)

    def stop (self):
        for key in self.providers:
            self.providers[key].on_stop()
    def start (self):
        for key in self.providers:
            self.providers[key].on_start()
        
        asyncio.run(self.__serve())
        #while True:
        #    import time
        #    time.sleep(1)