import { create } from 'zustand'
import type{ ShellState, OutputLine, VirtualNode } from '../types'

interface ShellStore extends ShellState {
  filesystem: VirtualNode[]
  setFilesystem: (nodes: VirtualNode[]) => void
  setCwd: (cwd: string) => void
  addOutput: (line: Omit<OutputLine, 'id'>) => void
  clearOutput: () => void
  addToHistory: (command: string) => void
  setHistoryIndex: (index: number) => void
  resetShell: () => void
}

const initialState: ShellState = {
  cwd: '/home/user',
  history: [],
  historyIndex: -1,
  output: [{
    id: '0',
    text: 'Welcome to TermiLearn 🚀 — Learn Linux in your browser\nType "help" to see available commands.',
    type: 'success'
  }],
  user: 'user',
  hostname: 'termilearnhost',
}

export const useShellStore = create<ShellStore>((set) => ({
  ...initialState,
  filesystem: [],

  setFilesystem: (nodes) => set({ filesystem: nodes }),

  setCwd: (cwd) => set({ cwd }),

  addOutput: (line) => set((state) => ({
    output: [...state.output, { ...line, id: Date.now().toString() }]
  })),

  clearOutput: () => set({ output: [] }),

  addToHistory: (command) => set((state) => ({
    history: [command, ...state.history].slice(0, 100),
    historyIndex: -1
  })),

  setHistoryIndex: (index) => set({ historyIndex: index }),

  resetShell: () => set({ ...initialState, filesystem: [] }),
}))
