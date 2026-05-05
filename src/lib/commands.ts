import type{ VirtualNode, OutputLine } from '../types'
import { createNode, deleteNode, moveNode } from './filesystem'

interface CommandContext {
  filesystem: VirtualNode[]
  cwd: string
  userId: string
  setFilesystem: (nodes: VirtualNode[]) => void
  setCwd: (cwd: string) => void
  addOutput: (line: Omit<OutputLine, 'id'>) => void
  clearOutput: () => void
}

// Resolve path (handle ~, .., .)
export function resolvePath(path: string, cwd: string): string {
  if (path === '~' || path === '') return '/home/user'
  if (path.startsWith('~/')) return '/home/user' + path.slice(1)
  if (path.startsWith('/')) return normalizePath(path)
  return normalizePath(cwd + '/' + path)
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}

function getNode(filesystem: VirtualNode[], path: string): VirtualNode | undefined {
  return filesystem.find(n => n.full_path === path)
}

function getChildren(filesystem: VirtualNode[], path: string): VirtualNode[] {
  return filesystem.filter(n => n.parent_path === path)
}

// ── COMMANDS ──

export async function executeLS(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al')
  const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al')
  const pathArg = args.find(a => !a.startsWith('-'))
  const targetPath = pathArg ? resolvePath(pathArg, ctx.cwd) : ctx.cwd

  const node = getNode(ctx.filesystem, targetPath)
  if (!node && targetPath !== '/') {
    ctx.addOutput({ text: `ls: ${targetPath}: No such file or directory`, type: 'error' })
    return
  }

  const children = getChildren(ctx.filesystem, targetPath)
  const visible = showAll ? children : children.filter(n => !n.name.startsWith('.'))

  if (visible.length === 0) {
    ctx.addOutput({ text: '', type: 'output' })
    return
  }

  if (showLong) {
    const lines = visible.map(n => {
      const type = n.type === 'directory' ? 'd' : '-'
      const perms = n.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--'
      const size = n.content.length.toString().padStart(6)
      const date = new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
      const color = n.type === 'directory' ? `\x1b[blue]${n.name}\x1b[/blue]` : n.name
      return `${type}${perms}  1 user user ${size} ${date} ${color}`
    })
    ctx.addOutput({ text: lines.join('\n'), type: 'output' })
  } else {
    const names = visible.map(n =>
      n.type === 'directory' ? `\x1b[blue]${n.name}\x1b[/blue]` : n.name
    )
    ctx.addOutput({ text: names.join('  '), type: 'output' })
  }
}

export async function executeCD(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  const target = args[0] || '~'
  const targetPath = resolvePath(target, ctx.cwd)

  if (targetPath === '/') {
    ctx.setCwd('/')
    return
  }

  const node = getNode(ctx.filesystem, targetPath)
  if (!node) {
    ctx.addOutput({ text: `cd: ${target}: No such file or directory`, type: 'error' })
    return
  }
  if (node.type !== 'directory') {
    ctx.addOutput({ text: `cd: ${target}: Not a directory`, type: 'error' })
    return
  }

  ctx.setCwd(targetPath)
}

export async function executePWD(ctx: CommandContext): Promise<void> {
  ctx.addOutput({ text: ctx.cwd, type: 'output' })
}

export async function executeMKDIR(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  if (args.length === 0) {
    ctx.addOutput({ text: 'mkdir: missing operand', type: 'error' })
    return
  }

  const name = args[0]
  const targetPath = resolvePath(name, ctx.cwd)
  const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/'
  const dirName = targetPath.split('/').pop() || ''

  if (getNode(ctx.filesystem, targetPath)) {
    ctx.addOutput({ text: `mkdir: cannot create directory '${name}': File exists`, type: 'error' })
    return
  }

  const newNode = await createNode(ctx.userId, {
    name: dirName,
    type: 'directory',
    content: '',
    parent_path: parentPath,
    full_path: targetPath,
  })

  ctx.setFilesystem([...ctx.filesystem, newNode])
}

export async function executeTOUCH(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  if (args.length === 0) {
    ctx.addOutput({ text: 'touch: missing file operand', type: 'error' })
    return
  }

  const name = args[0]
  const targetPath = resolvePath(name, ctx.cwd)
  const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/'
  const fileName = targetPath.split('/').pop() || ''

  if (getNode(ctx.filesystem, targetPath)) return // already exists, silent

  const newNode = await createNode(ctx.userId, {
    name: fileName,
    type: 'file',
    content: '',
    parent_path: parentPath,
    full_path: targetPath,
  })

  ctx.setFilesystem([...ctx.filesystem, newNode])
}

export async function executeRM(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  const recursive = args.includes('-r') || args.includes('-rf')
  const target = args.find(a => !a.startsWith('-'))

  if (!target) {
    ctx.addOutput({ text: 'rm: missing operand', type: 'error' })
    return
  }

  const targetPath = resolvePath(target, ctx.cwd)
  const node = getNode(ctx.filesystem, targetPath)

  if (!node) {
    ctx.addOutput({ text: `rm: cannot remove '${target}': No such file or directory`, type: 'error' })
    return
  }

  if (node.type === 'directory' && !recursive) {
    ctx.addOutput({ text: `rm: cannot remove '${target}': Is a directory`, type: 'error' })
    return
  }

  await deleteNode(ctx.userId, targetPath)
  ctx.setFilesystem(ctx.filesystem.filter(n => !n.full_path.startsWith(targetPath)))
}

export async function executeCAT(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  if (args.length === 0) {
    ctx.addOutput({ text: 'cat: missing file operand', type: 'error' })
    return
  }

  const targetPath = resolvePath(args[0], ctx.cwd)
  const node = getNode(ctx.filesystem, targetPath)

  if (!node) {
    ctx.addOutput({ text: `cat: ${args[0]}: No such file or directory`, type: 'error' })
    return
  }

  if (node.type === 'directory') {
    ctx.addOutput({ text: `cat: ${args[0]}: Is a directory`, type: 'error' })
    return
  }

  ctx.addOutput({ text: node.content || '', type: 'output' })
}

export async function executeECHO(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  ctx.addOutput({ text: args.join(' '), type: 'output' })
}

export async function executeCP(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  if (args.length < 2) {
    ctx.addOutput({ text: 'cp: missing file operand', type: 'error' })
    return
  }

  const srcPath = resolvePath(args[0], ctx.cwd)
  const destPath = resolvePath(args[1], ctx.cwd)
  const src = getNode(ctx.filesystem, srcPath)

  if (!src) {
    ctx.addOutput({ text: `cp: ${args[0]}: No such file or directory`, type: 'error' })
    return
  }

  const destName = destPath.split('/').pop() || ''
  const destParent = destPath.substring(0, destPath.lastIndexOf('/')) || '/'

  const newNode = await createNode(ctx.userId, {
    name: destName,
    type: src.type,
    content: src.content,
    parent_path: destParent,
    full_path: destPath,
  })

  ctx.setFilesystem([...ctx.filesystem, newNode])
}

export async function executeMV(
  args: string[],
  ctx: CommandContext
): Promise<void> {
  if (args.length < 2) {
    ctx.addOutput({ text: 'mv: missing file operand', type: 'error' })
    return
  }

  const srcPath = resolvePath(args[0], ctx.cwd)
  let destPath = resolvePath(args[1], ctx.cwd)
  const src = getNode(ctx.filesystem, srcPath)

  if (!src) {
    ctx.addOutput({ text: `mv: ${args[0]}: No such file or directory`, type: 'error' })
    return
  }

  const destNode = getNode(ctx.filesystem, destPath)
  if (destNode?.type === 'directory') {
    destPath = destPath + '/' + src.name
  }

  const newName = destPath.split('/').pop() || ''
  const newParent = destPath.substring(0, destPath.lastIndexOf('/')) || '/'

  await moveNode(ctx.userId, srcPath, destPath, newParent, newName)
  ctx.setFilesystem(
    ctx.filesystem.map(n =>
      n.full_path === srcPath
        ? { ...n, full_path: destPath, parent_path: newParent, name: newName }
        : n
    )
  )
}

export async function executeCLEAR(ctx: CommandContext): Promise<void> {
  ctx.clearOutput()
}

export async function executeWHOAMI(ctx: CommandContext): Promise<void> {
  ctx.addOutput({ text: ctx.cwd.includes('user') ? 'user' : 'root', type: 'output' })
}

export async function executeHISTORY(
  history: string[],
  ctx: CommandContext
): Promise<void> {
  if (history.length === 0) {
    ctx.addOutput({ text: 'No commands in history', type: 'output' })
    return
  }
  const lines = history.map((cmd, i) => `  ${(history.length - i).toString().padStart(3)}  ${cmd}`)
  ctx.addOutput({ text: lines.join('\n'), type: 'output' })
}

export async function executeHELP(ctx: CommandContext): Promise<void> {
  const help = `
Available commands:
───────────────────────────────────────
  ls [-l] [-la]     List directory contents
  cd [path]         Change directory
  pwd               Print working directory
  mkdir [name]      Create a directory
  touch [name]      Create an empty file
  rm [-r] [name]    Remove file or directory
  cat [file]        Display file content
  echo [text]       Display text
  cp [src] [dest]   Copy a file
  mv [src] [dest]   Move or rename a file
  clear             Clear the terminal
  whoami            Display current user
  history           Show command history
  help              Show this help message
───────────────────────────────────────
Use Tab for autocompletion, ↑↓ for history
`.trim()
  ctx.addOutput({ text: help, type: 'success' })
}

// ── COMMAND PARSER ──
export interface ParsedCommand {
  cmd: string
  args: string[]
  raw: string
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim()
  const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
  const unquoted = tokens.map(t => t.replace(/^['"]|['"]$/g, ''))
  const [cmd, ...args] = unquoted
  return { cmd: cmd || '', args, raw: trimmed }
}