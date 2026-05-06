import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

interface CoursePageProps {
  onGoHome: () => void
  onNavigate: (page: 'terminal' | 'missions') => void
}

const commands = [
  { cmd: 'ls', category: 'navigation', icon: '📂', desc: 'List directory contents', usage: 'ls [-l] [-la]', example: 'ls -la /home/user', detail: 'Shows all files and directories. Use -l for detailed view, -a to show hidden files starting with a dot.' },
  { cmd: 'cd', category: 'navigation', icon: '📍', desc: 'Change directory', usage: 'cd [path]', example: 'cd ~/documents', detail: 'Navigate between directories. Use ~ for home directory, .. to go up one level, / for root.' },
  { cmd: 'pwd', category: 'navigation', icon: '🗺️', desc: 'Print working directory', usage: 'pwd', example: 'pwd', detail: 'Displays the full absolute path of your current directory.' },
  { cmd: 'mkdir', category: 'files', icon: '📁', desc: 'Create a directory', usage: 'mkdir [name]', example: 'mkdir projects', detail: 'Creates a new empty directory with the specified name in the current location.' },
  { cmd: 'touch', category: 'files', icon: '📄', desc: 'Create an empty file', usage: 'touch [name]', example: 'touch notes.txt', detail: 'Creates a new empty file or updates the timestamp of an existing one.' },
  { cmd: 'rm', category: 'files', icon: '🗑️', desc: 'Remove file or directory', usage: 'rm [-r] [name]', example: 'rm -r oldfolder', detail: 'Deletes files permanently. Use the -r flag to delete directories and their contents recursively.' },
  { cmd: 'cat', category: 'files', icon: '👁️', desc: 'Display file content', usage: 'cat [file]', example: 'cat readme.txt', detail: 'Reads and displays the full content of a text file directly in the terminal.' },
  { cmd: 'echo', category: 'files', icon: '💬', desc: 'Display text', usage: 'echo [text]', example: 'echo Hello World', detail: 'Prints any text you provide to the terminal output. Useful for testing and scripting.' },
  { cmd: 'cp', category: 'files', icon: '📋', desc: 'Copy a file', usage: 'cp [src] [dest]', example: 'cp a.txt docs/', detail: 'Creates an exact copy of a file and places it at the specified destination path.' },
  { cmd: 'mv', category: 'files', icon: '✂️', desc: 'Move or rename', usage: 'mv [src] [dest]', example: 'mv old.txt new.txt', detail: 'Moves a file to a new location or renames it if the destination is in the same directory.' },
  { cmd: 'clear', category: 'system', icon: '🧹', desc: 'Clear the terminal', usage: 'clear', example: 'clear', detail: 'Removes all visible output from the terminal screen. Your history is still accessible with the up arrow.' },
  { cmd: 'whoami', category: 'system', icon: '👤', desc: 'Display current user', usage: 'whoami', example: 'whoami', detail: 'Prints the username of the currently logged-in user. Useful when switching between users.' },
  { cmd: 'history', category: 'system', icon: '📜', desc: 'Show command history', usage: 'history', example: 'history', detail: 'Lists all commands you have previously executed in this session, with their index numbers.' },
  { cmd: 'help', category: 'system', icon: '❓', desc: 'List all commands', usage: 'help', example: 'help', detail: 'Displays a complete list of all available commands with their description and usage.' },
]

const catStyle: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  navigation: { bg: '#f0fdf4', border: '#bbf7d0', badge: 'bg-emerald-100 text-emerald-700', text: '#10b981' },
  files: { bg: '#eff6ff', border: '#bfdbfe', badge: 'bg-blue-100 text-blue-700', text: '#3b82f6' },
  system: { bg: '#f5f3ff', border: '#ddd6fe', badge: 'bg-violet-100 text-violet-700', text: '#8b5cf6' },
}

const categories = [
  { key: 'all', label: '🔍 All Commands', color: '#0f172a' },
  { key: 'navigation', label: '🧭 Navigation', color: '#10b981' },
  { key: 'files', label: '📁 File Management', color: '#3b82f6' },
  { key: 'system', label: '⚙️ System', color: '#8b5cf6' },
]

export default function CoursePage({ onGoHome, onNavigate }: CoursePageProps) {
  const [activeCmd, setActiveCmd] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = commands.filter(c => {
    const matchCat = activeCategory === 'all' || c.category === activeCategory
    const matchSearch = c.cmd.includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={onGoHome}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600, fontSize: 15 }}
              onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              ← Home
            </button>
            <div style={{ width: 1, height: 24, backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, backgroundColor: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>📚</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>Command Course</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onNavigate('terminal')}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >🖥️ Open Terminal</button>
            <button onClick={() => onNavigate('missions')}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', backgroundColor: '#f59e0b', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >🎯 Test Knowledge</button>
            <button onClick={() => supabase.auth.signOut()}
              style={{ padding: '8px 18px', borderRadius: 10, border: '2px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >Sign out</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', padding: '56px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>
            📖 Linux Command Course
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 32 }}>
            Learn all 14 essential commands — click any card to see details and try it live
          </p>

          {/* Search */}
          <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search a command..."
              style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: 14, border: '2px solid #e2e8f0', fontSize: 15, outline: 'none', backgroundColor: 'white', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
        </motion.div>
      </section>

      {/* CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { n: '14', l: 'Commands', i: '⌨️', color: '#eff6ff', border: '#bfdbfe', text: '#3b82f6' },
            { n: '3', l: 'Categories', i: '📂', color: '#f0fdf4', border: '#bbf7d0', text: '#10b981' },
            { n: '5', l: 'Missions', i: '🎯', color: '#fefce8', border: '#fde68a', text: '#f59e0b' },
          ].map(s => (
            <div key={s.l} style={{ backgroundColor: s.color, border: `2px solid ${s.border}`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 36 }}>{s.i}</span>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.text }}>{s.n}</div>
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '10px 22px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                backgroundColor: activeCategory === cat.key ? cat.color : '#f1f5f9',
                color: activeCategory === cat.key ? 'white' : '#64748b',
                boxShadow: activeCategory === cat.key ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                transform: activeCategory === cat.key ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >{cat.label} ({activeCategory === cat.key || cat.key === 'all' ? commands.filter(c => cat.key === 'all' || c.category === cat.key).length : commands.filter(c => c.category === cat.key).length})</button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24, fontWeight: 500 }}>
          {filtered.length} command{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((cmd, i) => {
            const s = catStyle[cmd.category]
            const isActive = activeCmd === cmd.cmd
            return (
              <motion.div key={cmd.cmd}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -5 }}
                onClick={() => setActiveCmd(isActive ? null : cmd.cmd)}
                style={{
                  backgroundColor: isActive ? 'white' : s.bg,
                  border: `2px solid ${isActive ? '#3b82f6' : s.border}`,
                  borderRadius: 18, padding: 22, cursor: 'pointer',
                  boxShadow: isActive ? '0 12px 40px rgba(59,130,246,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s'
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 30 }}>{cmd.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                    {cmd.category}
                  </span>
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: s.text, marginBottom: 6 }}>{cmd.cmd}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>{cmd.desc}</div>

                <div style={{ backgroundColor: '#0f172a', borderRadius: 10, padding: '10px 14px' }}>
                  <code style={{ color: '#10b981', fontSize: 13, fontFamily: 'monospace' }}>{cmd.example}</code>
                </div>

                {/* Expanded */}
                {isActive && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 18, paddingTop: 18, borderTop: '2px dashed #e2e8f0' }}
                  >
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>SYNTAX: </span>
                      <code style={{ color: '#3b82f6', fontSize: 13, fontWeight: 700 }}>{cmd.usage}</code>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, marginBottom: 14 }}>{cmd.detail}</p>
                    <button
                      onClick={e => { e.stopPropagation(); onNavigate('terminal') }}
                      style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', backgroundColor: s.text, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >🖥️ Try "{cmd.cmd}" in Terminal →</button>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>No commands found</h3>
            <p style={{ color: '#64748b' }}>Try a different search term</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all') }}
              style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 700, cursor: 'pointer' }}
            >Clear filters</button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1e293b', padding: '32px 24px', textAlign: 'center', marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, backgroundColor: '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 13 }}>$_</span>
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>TermiLearn</span>
        </div>
        {/* Infos Académiques & Copyright */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, width: '100%', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>
          © 2026 TermiLearn • Engineered by <strong>Hajar MAZOUZI</strong>
        </p>
       
      </div>
      </footer>
    </div>
  )
}