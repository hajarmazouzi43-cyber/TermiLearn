import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { loadFilesystem, resetFilesystem } from '../lib/filesystem'
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
  const [resetting, setResetting] = useState(false)
  const { setFilesystem, resetShell, cwd } = useShellStore()

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
  }, [userId])

  const handleReset = async () => {
    if (!confirm('Reset your filesystem to default? This cannot be undone.')) return
    setResetting(true)
    try {
      const fs = await resetFilesystem(userId)
      setFilesystem(fs)
      resetShell()
    } finally {
      setResetting(false)
    }
  }

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

{/* NAVBAR STYLÉE - TERMINAL PAGE */}
<nav style={{
  position: 'sticky',
  top: 12,
  zIndex: 50,
  width: 'calc(100% - 32px)',
  margin: '0 16px',
  backgroundColor: 'rgba(255,255,255,0.96)',
  backdropFilter: 'blur(12px)',
  borderRadius: 60,
  boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)',
  padding: '0 20px',
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: "'Inter', system-ui, sans-serif"
}}>
  
  {/* Logo + Titre */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onGoHome}>
    <div style={{
      width: 38, height: 38,
      background: 'linear-gradient(135deg, #10b981, #3b82f6)',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 14px rgba(16,185,129,0.25)'
    }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>$_</span>
    </div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#0a2540' }}>TermiLearn</div>
      <div style={{ fontSize: 11, color: '#5c6f87' }}>Linux Terminal</div>
    </div>
  </div>

  {/* Statut environment */}
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 40,
    padding: '6px 16px'
  }}>
    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
    <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>Environment ready</span>
  </div>

  {/* Boutons d'action */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {/* Terminal - bleu foncé */}
    <button
      onClick={() => setShowTerminalModal(true)}
      style={{
        padding: '8px 18px',
        borderRadius: 40,
        border: 'none',
        backgroundColor: '#0f172a',
        color: '#10b981',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#1e293b'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#0f172a'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      Terminal
    </button>

    {/* Missions - ORANGE */}
    <button
      onClick={() => { setShowMissions(m => !m); setShowQuiz(false) }}
      style={{
        padding: '8px 18px',
        borderRadius: 40,
        border: 'none',
        backgroundColor: showMissions ? '#fef3c7' : '#ffffff',
        border: showMissions ? 'none' : '1px solid #e2e8f0',
        color: showMissions ? '#b45309' : '#5c6f87',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}
      onMouseEnter={e => {
        if (!showMissions) {
          e.currentTarget.style.backgroundColor = '#fef3c7'
          e.currentTarget.style.color = '#b45309'
          e.currentTarget.style.borderColor = '#fde68a'
        }
      }}
      onMouseLeave={e => {
        if (!showMissions) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.color = '#5c6f87'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }
      }}
    >
      Missions
      <span style={{
        backgroundColor: completedMissions.length === 5 ? '#10b981' : '#e2e8f0',
        color: completedMissions.length === 5 ? 'white' : '#5c6f87',
        borderRadius: 20,
        padding: '2px 10px',
        fontSize: 11,
        fontWeight: 600
      }}>
        {completedMissions.length}/5
      </span>
    </button>

    {/* Quiz - VERT */}
    <button
      onClick={() => { setShowQuiz(q => !q); setShowMissions(false) }}
      style={{
        padding: '8px 18px',
        borderRadius: 40,
        border: 'none',
        backgroundColor: showQuiz ? '#dcfce7' : '#ffffff',
        border: showQuiz ? 'none' : '1px solid #e2e8f0',
        color: showQuiz ? '#166534' : '#5c6f87',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        if (!showQuiz) {
          e.currentTarget.style.backgroundColor = '#dcfce7'
          e.currentTarget.style.color = '#166534'
          e.currentTarget.style.borderColor = '#bbf7d0'
        }
      }}
      onMouseLeave={e => {
        if (!showQuiz) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.color = '#5c6f87'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }
      }}
    >
      Quiz
    </button>

    {/* Cheat Sheet - BLEU CLAIR */}
    <button
      onClick={() => setShowCheatSheet(true)}
      style={{
        padding: '8px 18px',
        borderRadius: 40,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        color: '#5c6f87',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#e0f2fe'
        e.currentTarget.style.color = '#0369a1'
        e.currentTarget.style.borderColor = '#bae6fd'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#ffffff'
        e.currentTarget.style.color = '#5c6f87'
        e.currentTarget.style.borderColor = '#e2e8f0'
      }}
    >
      Cheat Sheet
    </button>

    {/* AI Copilot - VIOLET */}
    <button
      onClick={() => setShowCopilot(c => !c)}
      style={{
        padding: '8px 18px',
        borderRadius: 40,
        border: 'none',
        backgroundColor: showCopilot ? '#f3e8ff' : '#ffffff',
        border: showCopilot ? 'none' : '1px solid #e2e8f0',
        color: showCopilot ? '#6b21a5' : '#5c6f87',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}
      onMouseEnter={e => {
        if (!showCopilot) {
          e.currentTarget.style.backgroundColor = '#f3e8ff'
          e.currentTarget.style.color = '#6b21a5'
          e.currentTarget.style.borderColor = '#d8b4fe'
        }
      }}
      onMouseLeave={e => {
        if (!showCopilot) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.color = '#5c6f87'
          e.currentTarget.style.borderColor = '#e2e8f0'
        }
      }}
    >
      🤖 AI Copilot
    </button>
  </div>

  {/* Zone droite utilisateur */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backgroundColor: '#f8fafc',
      borderRadius: 40,
      padding: '5px 16px 5px 12px',
      border: '1px solid #eef2f6'
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 32,
        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 13,
        boxShadow: '0 2px 8px rgba(16,185,129,0.2)'
      }}>
        {userEmail?.charAt(0).toUpperCase() || 'U'}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1e2a3e', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {userEmail}
      </span>
    </div>

    <button
      onClick={() => supabase.auth.signOut()}
      style={{
        padding: '8px 20px',
        borderRadius: 40,
        border: '1px solid #e2e8f0',
        backgroundColor: 'white',
        color: '#5c6f87',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#fecaca'
        e.currentTarget.style.backgroundColor = '#fff5f5'
        e.currentTarget.style.color = '#ef4444'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.backgroundColor = 'white'
        e.currentTarget.style.color = '#5c6f87'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      Sign out
    </button>
  </div>
</nav>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* Left */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!showMissions && !showQuiz ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ backgroundColor: 'white', borderRadius: 18, padding: 40, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', textAlign: 'center' }}
            >
             
              <h2 style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Ready to practice?</h2>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 28px' }}>
                Open the terminal to run Linux commands in a safe virtual environment.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button whileHover={{ y: -2 }} onClick={() => setShowTerminalModal(true)}
                  style={{ padding: '13px 28px', borderRadius: 12, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'monospace', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                >$ Open Terminal</motion.button>
                <motion.button whileHover={{ y: -2 }} onClick={() => setShowMissions(true)}
                  style={{ padding: '13px 28px', borderRadius: 12, border: '1.5px solid #fde68a', backgroundColor: '#fefce8', color: '#b45309', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                > View Missions</motion.button>
                <motion.button whileHover={{ y: -2 }} onClick={() => setShowQuiz(true)}
                  style={{ padding: '13px 28px', borderRadius: 12, border: '1.5px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#059669', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                > Take Quiz</motion.button>
              </div>

              <div style={{ marginTop: 40, textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Quick start commands</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {[
                    { cmd: 'ls -la', desc: 'List all files' },
                    { cmd: 'pwd', desc: 'Current path' },
                    { cmd: 'mkdir test', desc: 'Create folder' },
                    { cmd: 'touch file.txt', desc: 'Create file' },
                    { cmd: 'cat readme.txt', desc: 'Read a file' },
                    { cmd: 'help', desc: 'All commands' },
                  ].map(q => (
                    <div key={q.cmd}
                      style={{ backgroundColor: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1.5px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => setShowTerminalModal(true)}
                    >
                      <code style={{ color: '#10b981', fontSize: 13, fontFamily: 'monospace', display: 'block', marginBottom: 2 }}>{q.cmd}</code>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{q.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          ) : showQuiz ? (
            <div style={{ backgroundColor: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>📝 Quiz Linux</h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>15 questions • Progressive • Easy → Hard</p>
                </div>
                <button onClick={() => setShowQuiz(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}
                >✕</button>
              </div>
              <QuizPanel onClose={() => setShowQuiz(false)} />
            </div>

          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: 18, padding: 24, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}> Missions</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setShowMissions(false); setShowQuiz(true) }}
                    style={{ padding: '8px 16px', borderRadius: 9, border: '1.5px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#059669', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                  > Quiz</button>
                  <button onClick={() => setShowTerminalModal(true)}
                    style={{ padding: '8px 16px', borderRadius: 9, border: 'none', backgroundColor: '#0f172a', color: '#10b981', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}
                  >$ Open Terminal</button>
                </div>
              </div>
              <MissionPanel userId={userId} completedMissions={completedMissions} onMissionComplete={handleMissionComplete} />
            </div>
          )}
        </div>

        {/* Right — AI Copilot */}
        <AnimatePresence>
          {showCopilot && (
            <motion.div
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 360 }}
              exit={{ opacity: 0, x: 40, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ flexShrink: 0, overflow: 'hidden', height: 'calc(100vh - 124px)', position: 'sticky', top: 92 }}
            >
              <div style={{ width: 360, height: '100%', backgroundColor: 'white', borderRadius: 18, border: '1.5px solid #f1f5f9', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
              transition={{ type: 'spring', damping: 25 }}
              style={{ width: '100%', maxWidth: 860, height: '75vh', display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)', border: '1px solid #334155' }}
            >
              <div style={{ backgroundColor: '#1e293b', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', cursor: 'pointer' }} onClick={() => setShowTerminalModal(false)} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                  <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace', marginLeft: 6 }}>bash — user@termilearnhost</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>Press ESC to close</span>
                  <button onClick={() => setShowTerminalModal(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 6px', borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >✕</button>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <Terminal userId={userId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHEAT SHEET */}
      <AnimatePresence>
        {showCheatSheet && <CheatSheet onClose={() => setShowCheatSheet(false)} />}
      </AnimatePresence>

    </div>
  )
}