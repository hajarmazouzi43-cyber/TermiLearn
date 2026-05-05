import type { VirtualNode, Mission } from '../types'

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Mission 1 — Find Your Way',
    description: 'Navigate to /home/user/documents using "cd" and verify with "pwd".',
    hint1: 'Use the "cd" command followed by the path.',
    hint2: 'Try: cd /home/user/documents',
    hint3: 'Then type "pwd" to confirm you are in the right place.',
    validate: (_fs: VirtualNode[], cwd: string) => cwd === '/home/user/documents',
  },
  {
    id: 2,
    title: 'Mission 2 — Create & Build',
    description: 'Create a directory called "myproject" inside /home/user, then create a file called "index.txt" inside it.',
    hint1: 'First use "mkdir" to create the directory.',
    hint2: 'Try: mkdir myproject — then: cd myproject',
    hint3: 'Then use "touch index.txt" to create the file.',
    validate: (fs: VirtualNode[]) => {
      const hasDir = fs.some(n => n.full_path === '/home/user/myproject' && n.type === 'directory')
      const hasFile = fs.some(n => n.full_path === '/home/user/myproject/index.txt' && n.type === 'file')
      return hasDir && hasFile
    },
  },
  {
    id: 3,
    title: 'Mission 3 — Read the Mystery',
    description: 'Find and display the content of "mystery.txt" located somewhere in /home/user/documents.',
    hint1: 'Use "cd" to navigate to /home/user/documents.',
    hint2: 'Use "ls" to list the files in that directory.',
    hint3: 'Use "cat mystery.txt" to read the file.',
    validate: (_fs: VirtualNode[], cwd: string) => cwd === '/home/user/documents',
  },
  {
    id: 4,
    title: 'Mission 4 — Copy & Organize',
    description: 'Copy the file "readme.txt" from /home/user to /home/user/documents.',
    hint1: 'Use the "cp" command to copy files.',
    hint2: 'Syntax: cp [source] [destination]',
    hint3: 'Try: cp /home/user/readme.txt /home/user/documents/readme.txt',
    validate: (fs: VirtualNode[]) =>
      fs.some(n => n.full_path === '/home/user/documents/readme.txt' && n.type === 'file'),
  },
  {
    id: 5,
    title: 'Mission 5 — Clean Up',
    description: 'Delete the directory "myproject" and everything inside it using "rm -r".',
    hint1: 'Use "rm" with the "-r" flag to delete directories.',
    hint2: 'Make sure you are not inside the directory you want to delete.',
    hint3: 'Try: cd /home/user — then: rm -r myproject',
    validate: (fs: VirtualNode[]) =>
      !fs.some(n => n.full_path === '/home/user/myproject'),
  },
]

export function getMissionProgress(
  missionId: number,
  completedMissions: number[]
): { completed: boolean; locked: boolean } {
  const completed = completedMissions.includes(missionId)
  const locked = missionId > 1 && !completedMissions.includes(missionId - 1)
  return { completed, locked }
}