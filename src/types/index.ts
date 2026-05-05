export interface VirtualNode {
  id: string
  name: string
  type: 'file' | 'directory'
  content: string
  parent_path: string
  full_path: string
  created_at: string
}

export interface ShellState {
  cwd: string
  history: string[]
  historyIndex: number
  output: OutputLine[]
  user: string
  hostname: string
}

export interface OutputLine {
  id: string
  text: string
  type: 'input' | 'output' | 'error' | 'success'
}

export interface Mission {
  id: number
  title: string
  description: string
  hint1: string
  hint2: string
  hint3: string
  validate: (filesystem: VirtualNode[], cwd: string) => boolean
}

export interface MissionProgress {
  mission_id: number
  completed: boolean
  score: number
}

export interface User {
  id: string
  email: string
}