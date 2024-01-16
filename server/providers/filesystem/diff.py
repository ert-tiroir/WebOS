
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.providers.filesystem.filetree import FileSystemNode

def create_path_diff (path: str):
    return { "mode": "create", "path": path }
def create_node_diff (node: "FileSystemNode"):
    return create_path_diff(node.relpath)
def delete_path_diff (path: str):
    return {
        "mode": "delete",
        "path": path
    }
def delete_node_diff (node: "FileSystemNode"):
    return delete_path_diff(node.relpath)
def move_path_diff (src: str, dest: str):
    return {
        "mode": "move",
        "source": src,
        "destination": dest
    }
def params_data_diff (relpath, is_file, is_directory):
    return {
        "mode": "params",
        "path": relpath,
        "is_file": is_file,
        "is_directory": is_directory
    }
def params_node_diff (old: "FileSystemNode", new: "FileSystemNode"):
    return params_data_diff(new.relpath, new.isFile, new.isDirectory)
def needs_param_diff (old: "FileSystemNode", new: "FileSystemNode"):
    if new is None:
        return False
    if old is None:
        return True
    
    return old.isFile != new.isFile or old.isDirectory != new.isDirectory

def compute_diff (old: "FileSystemNode", new: "FileSystemNode", target: list[any]):
    all_keys = set()

    if old is None and new is None: return
    if old is None:
        target.append(create_node_diff(new))
        target.append(params_node_diff(old, new))

        for key in new.subfiles:
            compute_diff(None, new.subfiles[key], target)
        
        return target
    if new is None:
        target.append(delete_node_diff(old))

        return target

    if needs_param_diff(old, new):
        target.append(params_node_diff(old, new))

    all_keys.add(old.subfiles.keys())
    all_keys.add(new.subfiles.keys())

    for key in all_keys:
        next_old = old.subfiles.get(key, None)
        next_new = new.subfiles.get(key, None)

        compute_diff(next_old, next_new)
    
    return target
