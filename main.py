
from server.providers.filesystem.provider import FileSystemProvider
from server.server import WebOSServer, use_default_server_config

use_default_server_config()

server = WebOSServer('./stdos')
server.add_provider( FileSystemProvider(server) )

try:
    server.start()
except Exception as e:
    print(e)
except KeyboardInterrupt:
    server.stop()