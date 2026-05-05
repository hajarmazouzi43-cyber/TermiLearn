import { describe, it, expect } from 'vitest'
import { parseCommand, resolvePath } from '../commands'
import { executeLS, executeCD, executePWD, executeMKDIR, executeTOUCH, executeRM, executeCAT, executeECHO, executeWHOAMI, executeCLEAR, executeHELP, executeHISTORY,executeCP,executeMV } from '../commands'
import type { VirtualNode, OutputLine } from '../../types'

describe('parseCommand', () => {
  it('parses a simple command', () => {
    const result = parseCommand('ls')
    expect(result.cmd).toBe('ls')
    expect(result.args).toEqual([])
  })

  it('parses command with flags', () => {
    const result = parseCommand('ls -la')
    expect(result.cmd).toBe('ls')
    expect(result.args).toEqual(['-la'])
  })

  it('parses command with path argument', () => {
    const result = parseCommand('cd /home/user')
    expect(result.cmd).toBe('cd')
    expect(result.args).toEqual(['/home/user'])
  })

  it('parses command with multiple args', () => {
    const result = parseCommand('cp file.txt docs/')
    expect(result.cmd).toBe('cp')
    expect(result.args).toEqual(['file.txt', 'docs/'])
  })

  it('handles empty input', () => {
    const result = parseCommand('')
    expect(result.cmd).toBe('')
    expect(result.args).toEqual([])
  })

  it('handles extra spaces', () => {
    const result = parseCommand('  ls   -la  ')
    expect(result.cmd).toBe('ls')
    expect(result.args).toEqual(['-la'])
  })

  it('parses echo with multiple words', () => {
    const result = parseCommand('echo Hello World')
    expect(result.cmd).toBe('echo')
    expect(result.args).toEqual(['Hello', 'World'])
  })

  it('handles quoted strings', () => {
    const result = parseCommand('echo "Hello World"')
    expect(result.cmd).toBe('echo')
    expect(result.args).toEqual(['Hello World'])
  })
})

describe('resolvePath', () => {
  it('resolves absolute path', () => {
    expect(resolvePath('/etc', '/home/user')).toBe('/etc')
  })

  it('resolves ~ to home', () => {
    expect(resolvePath('~', '/anywhere')).toBe('/home/user')
  })

  it('resolves ~/path', () => {
    expect(resolvePath('~/documents', '/anywhere')).toBe('/home/user/documents')
  })

  it('resolves relative path', () => {
    expect(resolvePath('documents', '/home/user')).toBe('/home/user/documents')
  })

  it('resolves .. (parent directory)', () => {
    expect(resolvePath('..', '/home/user')).toBe('/home')
  })

  it('resolves multiple ..', () => {
    expect(resolvePath('../..', '/home/user/documents')).toBe('/home')
  })

  it('resolves . (current directory)', () => {
    expect(resolvePath('.', '/home/user')).toBe('/home/user')
  })

  it('resolves complex path with .. and .', () => {
    expect(resolvePath('./docs/../projects', '/home/user')).toBe('/home/user/projects')
  })

  it('handles empty path (goes to home)', () => {
    expect(resolvePath('', '/home/user')).toBe('/home/user')
  })

  it('resolves root path', () => {
    expect(resolvePath('/', '/home/user')).toBe('/')
  })
})

const mockFS: VirtualNode[] = [
  { id: '1', name: 'home', type: 'directory', content: '', parent_path: '/', full_path: '/home', created_at: '2025-01-01' },
  { id: '2', name: 'user', type: 'directory', content: '', parent_path: '/home', full_path: '/home/user', created_at: '2025-01-01' },
  { id: '3', name: 'documents', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/documents', created_at: '2025-01-01' },
  { id: '4', name: 'readme.txt', type: 'file', content: 'Hello World', parent_path: '/home/user', full_path: '/home/user/readme.txt', created_at: '2025-01-01' },
]

const createCtx = (overrides = {}) => {
  const outputs: Omit<OutputLine, 'id'>[] = []
  return {
    filesystem: mockFS,
    cwd: '/home/user',
    userId: 'test-user',
    setFilesystem: vi.fn(),
    setCwd: vi.fn(),
    addOutput: vi.fn((line: Omit<OutputLine, 'id'>) => outputs.push(line)),
    clearOutput: vi.fn(),
    getOutputs: () => outputs,
    ...overrides,
  }
}

describe('executeLS', () => {
  it('lists files in current directory', async () => {
    const ctx = createCtx()
    await executeLS([], ctx)
    expect(ctx.addOutput).toHaveBeenCalled()
  })

  it('lists files with -l flag', async () => {
    const ctx = createCtx()
    await executeLS(['-l'], ctx)
    expect(ctx.addOutput).toHaveBeenCalled()
  })

  it('lists files with -la flag', async () => {
    const ctx = createCtx()
    await executeLS(['-la'], ctx)
    expect(ctx.addOutput).toHaveBeenCalled()
  })

  it('shows error for non-existing path', async () => {
    const ctx = createCtx()
    await executeLS(['/nonexistent'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeCD', () => {
  it('changes to a valid directory', async () => {
    const ctx = createCtx()
    await executeCD(['/home/user/documents'], ctx)
    expect(ctx.setCwd).toHaveBeenCalledWith('/home/user/documents')
  })

  it('shows error for non-existing directory', async () => {
    const ctx = createCtx()
    await executeCD(['/nonexistent'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when cd to a file', async () => {
    const ctx = createCtx()
    await executeCD(['/home/user/readme.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('goes to home with no args', async () => {
    const ctx = createCtx({ cwd: '/home/user/documents' })
    await executeCD([], ctx)
    expect(ctx.setCwd).toHaveBeenCalledWith('/home/user')
  })
})

describe('executePWD', () => {
  it('prints current working directory', async () => {
    const ctx = createCtx()
    await executePWD(ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: '/home/user', type: 'output' })
    )
  })
})

describe('executeMKDIR', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeMKDIR([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when directory already exists', async () => {
    const ctx = createCtx()
    await executeMKDIR(['documents'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeTOUCH', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeTOUCH([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeRM', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeRM([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error for non-existing file', async () => {
    const ctx = createCtx()
    await executeRM(['nonexistent.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when rm directory without -r', async () => {
    const ctx = createCtx()
    await executeRM(['documents'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeCAT', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeCAT([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('displays file content', async () => {
    const ctx = createCtx()
    await executeCAT(['readme.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello World' })
    )
  })

  it('shows error for non-existing file', async () => {
    const ctx = createCtx()
    await executeCAT(['nonexistent.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when cat on directory', async () => {
    const ctx = createCtx()
    await executeCAT(['documents'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeECHO', () => {
  it('echoes text', async () => {
    const ctx = createCtx()
    await executeECHO(['Hello', 'World'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Hello World' })
    )
  })

  it('echoes empty string', async () => {
    const ctx = createCtx()
    await executeECHO([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: '' })
    )
  })
})

describe('executeWHOAMI', () => {
  it('returns user', async () => {
    const ctx = createCtx()
    await executeWHOAMI(ctx)
    expect(ctx.addOutput).toHaveBeenCalled()
  })
})

describe('executeCLEAR', () => {
  it('clears output', async () => {
    const ctx = createCtx()
    await executeCLEAR(ctx)
    expect(ctx.clearOutput).toHaveBeenCalled()
  })
})

describe('executeHELP', () => {
  it('displays help text', async () => {
    const ctx = createCtx()
    await executeHELP(ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' })
    )
  })
})

describe('executeHISTORY', () => {
  it('shows empty history message', async () => {
    const ctx = createCtx()
    await executeHISTORY([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'No commands in history' })
    )
  })

  it('shows history list', async () => {
    const ctx = createCtx()
    await executeHISTORY(['ls', 'pwd', 'cd documents'], ctx)
    expect(ctx.addOutput).toHaveBeenCalled()
  })
})
describe('executeCP', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeCP([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when source not found', async () => {
    const ctx = createCtx()
    await executeCP(['nonexistent.txt', 'dest.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})

describe('executeMV', () => {
  it('shows error when no args', async () => {
    const ctx = createCtx()
    await executeMV([], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })

  it('shows error when source not found', async () => {
    const ctx = createCtx()
    await executeMV(['nonexistent.txt', 'dest.txt'], ctx)
    expect(ctx.addOutput).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error' })
    )
  })
})