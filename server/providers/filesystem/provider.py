
from server.connection import Connection
from server.providers.broadcast import BroadcastProvider
from server.providers.filesystem.diff import compute_diff, create_path_diff, delete_path_diff, move_path_diff, params_data_diff
from server.providers.filesystem.events import FSProviderEventHandler
from server.providers.filesystem.filetree import compute_file_tree, FileSystemNode, push_tree, pop_tree
from server.server import WebOSServer

from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler

import asyncio

class FileSystemProvider(BroadcastProvider):
    def __init__(self, server: "WebOSServer"):
        super().__init__(server)

        self.tree     = None
        self.observer = None
    def get_provider_name(self):
        return "filesystem"
    async def on_init(self, connection: Connection):
        patch = compute_diff(None, self.tree, [])

        await connection.send(self, { "patch": patch })

    def on_create (self, path: str, is_dir: bool):
        print(path, is_dir)
        asyncio.run( self.broadcast({ "patch" : [ create_path_diff(path), params_data_diff(path, not is_dir, is_dir) ] }) )
        print("ended...")

        file = FileSystemNode("", "", is_dir, not is_dir)
        push_tree(self.tree, file, path)
    def on_delete (self, path: str):
        asyncio.run( self.broadcast({ "patch" : [ delete_path_diff(path) ] }) )

        pop_tree(self.tree, path)
    def on_move (self, src: str, dest: str):
        asyncio.run( self.broadcast({ "patch" : [ move_path_diff(src, dest) ] }) )

        src_node = pop_tree(self.tree, src)

        push_tree(self.tree, src_node, dest)

    def on_start (self):
        self.tree = compute_file_tree( self.server.os_path, "" )

        if self.observer is None:
            self.get_logger().info("Starting FileSystem Observer")

            self.observer = Observer()
            self.handler  = FSProviderEventHandler(self)
            self.observer.schedule( self.handler, self.server.os_path, recursive=True )
            self.observer.start()
        else:
            self.get_logger().critical("The FileSystem Provider already has an observer, maybe you did not stop your server properly")
        pass
    def on_stop (self):
        if self.observer is None:
            self.get_logger().critical("Cannot stop a provider that hasn't properly started, maybe something else went wrong")
            return

        self.get_logger().info("Stopping FileSystem Observer")

        self.observer.stop()
        self.observer.join()
        
        self.observer = None