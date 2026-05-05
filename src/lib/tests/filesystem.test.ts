import { describe, it, expect, beforeEach } from 'vitest'
import type { VirtualNode } from '../../types'

// Mock filesystem for testing
const mockFilesystem: VirtualNode[] = [
  { id: '1', name: 'home', type: 'directory', content: '', parent_path: '/', full_path: '/home', created_at: '2025-01-01' },
  { id: '2', name: 'user', type: 'directory', content: '', parent_path: '/home', full_path: '/home/user', created_at: '2025-01-01' },
  { id: '3', name: 'documents', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/documents', created_at: '2025-01-01' },
  { id: '4', name: 'readme.txt', type: 'file', content: 'Hello World', parent_path: '/home/user', full_path: '/home/user/readme.txt', created_at: '2025-01-01' },
  { id: '5', name: 'notes.txt', type: 'file', content: 'My notes', parent_path: '/home/user/documents', full_path: '/home/user/documents/notes.txt', created_at: '2025-01-01' },
]

// Pure functions to test
function getNode(fs: VirtualNode[], path: string): VirtualNode | undefined {
  return fs.find(n => n.full_path === path)
}

function getChildren(fs: VirtualNode[], path: string): VirtualNode[] {
  return fs.filter(n => n.parent_path === path)
}

function nodeExists(fs: VirtualNode[], path: string): boolean {
  return fs.some(n => n.full_path === path)
}

function getFileContent(fs: VirtualNode[], path: string): string | null {
  const node = getNode(fs, path)
  if (!node || node.type !== 'file') return null
  return node.content
}

function filterByType(fs: VirtualNode[], type: 'file' | 'directory'): VirtualNode[] {
  return fs.filter(n => n.type === type)
}

describe('Filesystem Operations', () => {
  let fs: VirtualNode[]

  beforeEach(() => {
    fs = [...mockFilesystem]
  })

  describe('getNode', () => {
    it('finds an existing node', () => {
      const node = getNode(fs, '/home/user')
      expect(node).toBeDefined()
      expect(node?.name).toBe('user')
    })

    it('returns undefined for non-existing path', () => {
      const node = getNode(fs, '/nonexistent')
      expect(node).toBeUndefined()
    })

    it('finds a file node', () => {
      const node = getNode(fs, '/home/user/readme.txt')
      expect(node?.type).toBe('file')
      expect(node?.content).toBe('Hello World')
    })
  })

  describe('getChildren', () => {
    it('returns children of a directory', () => {
      const children = getChildren(fs, '/home/user')
      expect(children.length).toBe(2)
      expect(children.map(c => c.name)).toContain('documents')
      expect(children.map(c => c.name)).toContain('readme.txt')
    })

    it('returns empty array for file', () => {
      const children = getChildren(fs, '/home/user/readme.txt')
      expect(children).toEqual([])
    })

    it('returns empty array for non-existing path', () => {
      const children = getChildren(fs, '/nonexistent')
      expect(children).toEqual([])
    })
  })

  describe('nodeExists', () => {
    it('returns true for existing node', () => {
      expect(nodeExists(fs, '/home/user')).toBe(true)
    })

    it('returns false for non-existing node', () => {
      expect(nodeExists(fs, '/home/user/nonexistent')).toBe(false)
    })
  })

  describe('getFileContent', () => {
    it('returns content of a file', () => {
      expect(getFileContent(fs, '/home/user/readme.txt')).toBe('Hello World')
    })

    it('returns null for directory', () => {
      expect(getFileContent(fs, '/home/user')).toBeNull()
    })

    it('returns null for non-existing file', () => {
      expect(getFileContent(fs, '/nonexistent.txt')).toBeNull()
    })
  })

  describe('filterByType', () => {
    it('filters only files', () => {
      const files = filterByType(fs, 'file')
      expect(files.every(n => n.type === 'file')).toBe(true)
      expect(files.length).toBe(2)
    })

    it('filters only directories', () => {
      const dirs = filterByType(fs, 'directory')
      expect(dirs.every(n => n.type === 'directory')).toBe(true)
      expect(dirs.length).toBe(3)
    })
  })
})