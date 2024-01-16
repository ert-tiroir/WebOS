
from watchdog.events import FileSystemEventHandler, FileSystemEvent, FileSystemMovedEvent

import os

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.providers.filesystem.provider import *

class FSProviderEventHandler (FileSystemEventHandler):
    def __init__(self, provider: "FileSystemProvider"):
        self.provider = provider
    def get_relative_path (self, path: str):
        relpath = os.path.relpath(path, self.provider.server.os_path)
        if not relpath.startswith(os.sep):
            relpath = os.sep + relpath
        
        return relpath
    def on_modified(self, event: FileSystemEvent):
        pass
    def on_created(self, event: FileSystemEvent):
        path = self.get_relative_path(event.src_path)

        self.provider.on_create(path, event.is_directory)
    def on_deleted(self, event: FileSystemEvent):
        path = self.get_relative_path(event.src_path)
        
        self.provider.on_delete(path)
    def on_moved(self, event: FileSystemMovedEvent):
        src  = self.get_relative_path(event.src_path)
        dest = self.get_relative_path(event.dest_path)
        
        self.provider.on_move(src, dest)
