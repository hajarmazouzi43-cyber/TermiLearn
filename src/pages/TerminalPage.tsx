import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { loadFilesystem } from '../lib/filesystem'
import { useShellStore } from '../store/shellStore'
import Terminal from '../components/Terminal'
import MissionPanel from '../components/MissionPanel'
import CheatSheet from '../components/CheatSheet'
import AICopilot from '../components/AICopilot'
import QuizPanel from '../components/QuizPanel'

interface TerminalPageProps {
  userId: string
  userEmail: string
  showMissionsDefault?: boolean
  onGoHome?: () => void
}

export default function TerminalPage({ userId, userEmail, showMissionsDefault = false, onGoHome }: TerminalPageProps) {
  const [loading, setLoading] = useState(true)
  const [showCheatSheet, setShowCheatSheet] = useState(false)
  const [showMissions, setShowMissions] = useState(showMissionsDefault)
  const [showTerminalModal, setShowTerminalModal] = useState(false)
  const [showCopilot, setShowCopilot] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [completedMissions, setCompletedMissions] = useState<number[]>([])
  const { setFilesystem, cwd } = useShellStore()

  useEffect(() => {
    const init = async () => {
      try {
        const fs = await loadFilesystem(userId)
        setFilesystem(fs)
        const { data } = await supabase
          .from('missions_progress')
          .select('mission_id')
          .eq('user_id', userId)
          .eq('completed', true)
        if (data) setCompletedMissions(data.map(d => d.mission_id))
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [setFilesystem, userId])

  const handleMissionComplete = (missionId: number) => {
    setCompletedMissions(prev => [...prev, missionId])
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#10b981', fontFamily: 'monospace', fontSize: 14 }}>Loading your environment...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" 
    }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onGoHome && (
            <button onClick={onGoHome}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b' }}
            >← Home</button>
          )}
          <div style={{ width: 1, height: 24, backgroundColor: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, backgroundColor: '#0f172a', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: 800, fontSize: 12, fontFamily: 'monospace' }}>$_</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>TermiLearn</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Linux Terminal</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 14px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Environment ready</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowTerminalModal(true)} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Terminal</button>

          <button
            onClick={() => { setShowMissions(m => !m); setShowQuiz(false) }}
            style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              backgroundColor: showMissions ? '#fefce8' : 'white',
              border: showMissions ? 'none' : '1.5px solid #e2e8f0',
              color: showMissions ? '#b45309' : '#64748b'
            }}
          >
            Missions <span style={{ backgroundColor: completedMissions.length === 5 ? '#10b981' : '#e2e8f0', color: completedMissions.length === 5 ? 'white' : '#64748b', borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{completedMissions.length}/5</span>
          </button>

          <button
            onClick={() => { setShowQuiz(q => !q); setShowMissions(false) }}
            style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              backgroundColor: showQuiz ? '#f0fdf4' : 'white',
              border: showQuiz ? 'none' : '1.5px solid #e2e8f0',
              color: showQuiz ? '#059669' : '#64748b'
            }}
          >Quiz</button>

          <button onClick={() => setShowCheatSheet(true)} style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cheat Sheet</button>

          <button
            onClick={() => setShowCopilot(c => !c)}
            style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              backgroundColor: showCopilot ? '#eef2ff' : 'white',
              border: showCopilot ? 'none' : '1.5px solid #e2e8f0',
              color: showCopilot ? '#6366f1' : '#64748b'
            }}
          >🤖 AI Copilot</button>

          <div style={{ width: 1, height: 24, backgroundColor: '#e2e8f0' }} />
          <span style={{ fontSize: 12, color: '#94a3b8', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>

          <button onClick={() => supabase.auth.signOut()} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #fecaca', backgroundColor: '#fff5f5', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {!showMissions && !showQuiz ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'white', borderRadius: 24, padding: 48, border: '1px solid #eef2f6', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', textAlign: 'center' }}
            >
              <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Ready to practice?</h2>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, maxWidth: 460, margin: '0 auto 32px' }}>
                Open the terminal to run Linux commands in a safe virtual environment.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
                <button
                  onClick={() => setShowTerminalModal(true)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 40,
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.45)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.35)'
                  }}
                >
                  🖥️ Open Terminal
                </button>

                <button
                  onClick={() => setShowMissions(true)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 40,
                    border: '1.5px solid #fde68a',
                    backgroundColor: '#fffbeb',
                    color: '#b45309',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#fef3c7'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#fffbeb'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  🎯 View Missions
                </button>

                <button
                  onClick={() => setShowQuiz(true)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 40,
                    border: '1.5px solid #d1fae5',
                    backgroundColor: '#f0fdf4',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#dcfce7'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  📝 Take Quiz
                </button>
              </div>

              {/* Quick start commands */}
              <div style={{ textAlign: 'left', maxWidth: 540, margin: '0 auto' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Quick start commands
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {[
                    { cmd: 'ls -la', desc: 'List all files' },
                    { cmd: 'pwd', desc: 'Current path' },
                    { cmd: 'mkdir test', desc: 'Create folder' },
                    { cmd: 'touch file.txt', desc: 'Create file' },
                    { cmd: 'cat readme.txt', desc: 'Read a file' },
                    { cmd: 'help', desc: 'All commands' },
                  ].map(q => (
                    <div
                      key={q.cmd}
                      onClick={() => setShowTerminalModal(true)}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: 12,
                        padding: '12px 16px',
                        border: '1px solid #eef2f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#10b981'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.08)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#eef2f6'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <code style={{ color: '#10b981', fontSize: 13, fontFamily: 'monospace', display: 'block', marginBottom: 4 }}>{q.cmd}</code>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{q.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : showQuiz ? (
            <div style={{ backgroundColor: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>📝 Quiz Linux</h2>
                <button onClick={() => setShowQuiz(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <QuizPanel onClose={() => setShowQuiz(false)} />
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: 18, padding: 24, border: '1.5px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>🎯 Missions</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setShowMissions(false); setShowQuiz(true) }} style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#059669', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}> Quiz</button>
                  <button onClick={() => setShowTerminalModal(true)} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>$ Open Terminal</button>
                </div>
              </div>
              <MissionPanel userId={userId} completedMissions={completedMissions} onMissionComplete={handleMissionComplete} />
            </div>
          )}
        </div>

<AnimatePresence>
          {showCopilot && (
            <motion.div
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 360 }}
              exit={{ opacity: 0, x: 40, width: 0 }}
              style={{ flexShrink: 0, height: 'calc(100vh - 124px)', position: 'sticky', top: 92 }}
            >
              <div style={{ width: 360, height: '100%', backgroundColor: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <AICopilot onClose={() => setShowCopilot(false)} currentCwd={cwd} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TERMINAL MODAL */}
      <AnimatePresence>
        {showTerminalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={e => { if (e.target === e.currentTarget) setShowTerminalModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ width: '100%', maxWidth: 860, height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid #334155' }}
            >
              <div style={{ backgroundColor: '#1e293b', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', cursor: 'pointer' }} onClick={() => setShowTerminalModal(false)} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                </div>
                <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>bash — user@termilearnhost</span>
                <button onClick={() => setShowTerminalModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Terminal userId={userId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
<AnimatePresence>
        {showCheatSheet && <CheatSheet onClose={() => setShowCheatSheet(false)} />}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}