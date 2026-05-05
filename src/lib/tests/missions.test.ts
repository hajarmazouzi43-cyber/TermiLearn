import { describe, it, expect } from 'vitest'
import { MISSIONS, getMissionProgress } from '../missions'
import type { VirtualNode } from '../../types'

const mockFS: VirtualNode[] = [
  { id: '1', name: 'home', type: 'directory', content: '', parent_path: '/', full_path: '/home', created_at: '2025-01-01' },
  { id: '2', name: 'user', type: 'directory', content: '', parent_path: '/home', full_path: '/home/user', created_at: '2025-01-01' },
  { id: '3', name: 'documents', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/documents', created_at: '2025-01-01' },
  { id: '4', name: 'readme.txt', type: 'file', content: 'Hello', parent_path: '/home/user', full_path: '/home/user/readme.txt', created_at: '2025-01-01' },
]

describe('Missions', () => {
  it('has exactly 5 missions', () => {
    expect(MISSIONS.length).toBe(5)
  })

  it('missions have unique ids', () => {
    const ids = MISSIONS.map(m => m.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(5)
  })

  it('missions have required fields', () => {
    MISSIONS.forEach(m => {
      expect(m.id).toBeDefined()
      expect(m.title).toBeTruthy()
      expect(m.description).toBeTruthy()
      expect(m.hint1).toBeTruthy()
      expect(m.hint2).toBeTruthy()
      expect(m.hint3).toBeTruthy()
      expect(typeof m.validate).toBe('function')
    })
  })

  describe('Mission 1 validation', () => {
    it('passes when cwd is /home/user/documents', () => {
      expect(MISSIONS[0].validate(mockFS, '/home/user/documents')).toBe(true)
    })

    it('fails when cwd is wrong', () => {
      expect(MISSIONS[0].validate(mockFS, '/home/user')).toBe(false)
    })
  })

  describe('Mission 2 validation', () => {
    it('passes when myproject dir and index.txt exist', () => {
      const fs: VirtualNode[] = [
        ...mockFS,
        { id: '10', name: 'myproject', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/myproject', created_at: '2025-01-01' },
        { id: '11', name: 'index.txt', type: 'file', content: '', parent_path: '/home/user/myproject', full_path: '/home/user/myproject/index.txt', created_at: '2025-01-01' },
      ]
      expect(MISSIONS[1].validate(fs, '/home/user')).toBe(true)
    })

    it('fails when only directory exists', () => {
      const fs: VirtualNode[] = [
        ...mockFS,
        { id: '10', name: 'myproject', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/myproject', created_at: '2025-01-01' },
      ]
      expect(MISSIONS[1].validate(fs, '/home/user')).toBe(false)
    })

    it('fails when neither exists', () => {
      expect(MISSIONS[1].validate(mockFS, '/home/user')).toBe(false)
    })
  })

  describe('Mission 4 validation', () => {
    it('passes when readme.txt copied to documents', () => {
      const fs: VirtualNode[] = [
        ...mockFS,
        { id: '20', name: 'readme.txt', type: 'file', content: 'Hello', parent_path: '/home/user/documents', full_path: '/home/user/documents/readme.txt', created_at: '2025-01-01' },
      ]
      expect(MISSIONS[3].validate(fs, '/home/user')).toBe(true)
    })

    it('fails when file not copied', () => {
      expect(MISSIONS[3].validate(mockFS, '/home/user')).toBe(false)
    })
  })

  describe('Mission 5 validation', () => {
    it('passes when myproject is deleted', () => {
      expect(MISSIONS[4].validate(mockFS, '/home/user')).toBe(true)
    })

    it('fails when myproject still exists', () => {
      const fs: VirtualNode[] = [
        ...mockFS,
        { id: '30', name: 'myproject', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/myproject', created_at: '2025-01-01' },
      ]
      expect(MISSIONS[4].validate(fs, '/home/user')).toBe(false)
    })
  })
})

describe('getMissionProgress', () => {
  it('returns completed true for completed mission', () => {
    const result = getMissionProgress(1, [1, 2, 3])
    expect(result.completed).toBe(true)
  })

  it('returns completed false for incomplete mission', () => {
    const result = getMissionProgress(3, [1, 2])
    expect(result.completed).toBe(false)
  })

  it('first mission is never locked', () => {
    const result = getMissionProgress(1, [])
    expect(result.locked).toBe(false)
  })

  it('mission 2 locked if mission 1 not completed', () => {
    const result = getMissionProgress(2, [])
    expect(result.locked).toBe(true)
  })

  it('mission 2 unlocked if mission 1 completed', () => {
    const result = getMissionProgress(2, [1])
    expect(result.locked).toBe(false)
  })

  it('mission 5 locked if mission 4 not completed', () => {
    const result = getMissionProgress(5, [1, 2, 3])
    expect(result.locked).toBe(true)
  })
})