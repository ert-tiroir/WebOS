
import os

class FileSystemNode:
    def __init__(self, relpath: str, name: str, isDirectory: bool, isFile: bool):
        if not relpath.startswith(os.sep): relpath = os.sep + relpath
        
        self.relpath = relpath
        self.name    = name

        self.isDirectory = isDirectory
        self.isFile      = isFile

        self.subfiles: dict["FileSystemNode"] = {}
    def add_sub_file (self, file: "FileSystemNode"):
        if self.isDirectory:
            self.subfiles[file.name] = file
    def __str__(self, depth = 0):
        strings = [ "\t" * depth + self.relpath ]

        for sf in self.subfiles:
            strings.append(sf.__str__(depth + 1))
        return "\n".join(strings)

def compute_file_tree (abspath, relpath):
    normpath = os.path.join(abspath, relpath)

    node = FileSystemNode(
        relpath, os.path.basename (relpath),

        os.path.isdir  (normpath),
        os.path.isfile (normpath)
    )

    if not os.path.exists(normpath): return None

    if os.path.isdir(normpath):
        for filename in os.listdir(normpath):
            result = compute_file_tree(
                abspath,
                os.path.join(relpath, filename)
            )

            if result is not None:
                node.add_sub_file(result)

    return node

def split_path (path: str) -> list[str]:
    if path.startswith(os.sep):
        path = path[len(os.sep):]
    
    return path.split(os.sep)
def get_in_tree (root: "FileSystemNode", path: list[str]) -> "FileSystemNode":
    if root is None: return None
    if len(path) == 0: return root

    next = root.subfiles.get(path[0], None)
    return get_in_tree(next, path[1:])
def push_tree (root: "FileSystemNode", object: "FileSystemNode", relpath: str):
    object.relpath = relpath
    
    path = split_path(relpath)

    parent = get_in_tree(root, path[:-1])
    if parent is None: return

    object.name = path[-1]
    parent.subfiles[path[-1]] = object
def pop_tree (root: "FileSystemNode", relpath: str):
    path = split_path(relpath)

    parent = get_in_tree(root, path[:-1])
    if parent is None: return None

    node = parent.subfiles.get(path[-1], None)
    if node is None: return None

    return parent.subfiles.pop(path[-1])