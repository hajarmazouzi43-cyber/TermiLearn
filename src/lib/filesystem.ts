import { supabase } from './supabase'
import type{ VirtualNode } from '../types'

// Default filesystem structure for new users
export const defaultFilesystem: Omit<VirtualNode, 'id' | 'created_at'>[] = [
  { name: 'home', type: 'directory', content: '', parent_path: '/', full_path: '/home' },
  { name: 'user', type: 'directory', content: '', parent_path: '/home', full_path: '/home/user' },
  { name: 'documents', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/documents' },
  { name: 'projects', type: 'directory', content: '', parent_path: '/home/user', full_path: '/home/user/projects' },
  { name: 'readme.txt', type: 'file', content: 'Welcome to TermiLearn!\nThis is your home directory.\nType "help" to get started.', parent_path: '/home/user', full_path: '/home/user/readme.txt' },
  { name: 'etc', type: 'directory', content: '', parent_path: '/', full_path: '/etc' },
  { name: 'hosts', type: 'file', content: '127.0.0.1 localhost\n127.0.0.1 termilearnhost', parent_path: '/etc', full_path: '/etc/hosts' },
  { name: 'tmp', type: 'directory', content: '', parent_path: '/', full_path: '/tmp' },
  { name: 'bin', type: 'directory', content: '', parent_path: '/', full_path: '/bin' },
  { name: 'mystery.txt', type: 'file', content: 'Congratulations! You found the mystery file! 🎉\nYou are learning Linux fast!', parent_path: '/home/user/documents', full_path: '/home/user/documents/mystery.txt' },
]

export async function loadFilesystem(userId: string): Promise<VirtualNode[]> {
  const { data, error } = await supabase
    .from('filesystem')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  // First time user — create default filesystem
  if (!data || data.length === 0) {
    return await initFilesystem(userId)
  }

  return data as VirtualNode[]
}

export async function initFilesystem(userId: string): Promise<VirtualNode[]> {
  const nodes = defaultFilesystem.map(node => ({ ...node, user_id: userId }))

  const { data, error } = await supabase
    .from('filesystem')
    .insert(nodes)
    .select()

  if (error) throw error
  return data as VirtualNode[]
}

export async function createNode(
  userId: string,
  node: Omit<VirtualNode, 'id' | 'created_at'>
): Promise<VirtualNode> {
  const { data, error } = await supabase
    .from('filesystem')
    .insert({ ...node, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as VirtualNode
}

export async function deleteNode(userId: string, fullPath: string): Promise<void> {
  // Delete the node and all children
  const { error } = await supabase
    .from('filesystem')
    .delete()
    .eq('user_id', userId)
    .like('full_path', `${fullPath}%`)

  if (error) throw error
}

export async function updateNodeContent(
  userId: string,
  fullPath: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('filesystem')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('full_path', fullPath)

  if (error) throw error
}

export async function moveNode(
  userId: string,
  oldPath: string,
  newPath: string,
  newParentPath: string,
  newName: string
): Promise<void> {
  const { error } = await supabase
    .from('filesystem')
    .update({
      full_path: newPath,
      parent_path: newParentPath,
      name: newName,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('full_path', oldPath)

  if (error) throw error
}

export async function saveCommandHistory(
  userId: string,
  command: string
): Promise<void> {
  await supabase
    .from('command_history')
    .insert({ user_id: userId, command })
}

export async function resetFilesystem(userId: string): Promise<VirtualNode[]> {
  // Delete all nodes
  await supabase
    .from('filesystem')
    .delete()
    .eq('user_id', userId)

  // Recreate default
  return await initFilesystem(userId)
}