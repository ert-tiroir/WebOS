
let current_syscall_id = 0;

function iota () {
    current_syscall_id ++;
    return current_syscall_id;
}

export const EXIT_SYSCALL = iota();
export const LOAD_SYSCALL = iota();

export const  OPEN_SYSCALL = iota();
export const  READ_SYSCALL = iota();
export const WRITE_SYSCALL = iota();

export const VNODE_ADD_TO_BODY = iota();

export const VNODE_CREATE = iota();
export const VNODE_APPEND_CHILD = iota();
export const VNODE_REMOVE_CHILD = iota();

export const STDIN  = 0;
export const STDOUT = 1;
export const STDERR = 2;
