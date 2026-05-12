import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi'

interface HomePageProps {
  userId: string
  userEmail: string
  onNavigate: (page: 'terminal' | 'missions' | 'course') => void
}

function HoverCard({ n, title, color, bg, border, desc, hover, action, actionLabel, tag, code, index }: {
  n: string; title: string; color: string; bg: string; border: string
  desc: string; hover: string; action: () => void; actionLabel: string
  tag: string; code: string; index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={action}
      style={{
        display: 'flex', alignItems: 'center', gap: 24,
        borderRadius: 20, padding: '28px 32px',
        background: isHovered ? bg : 'white',
        border: `2px solid ${isHovered ? border : '#f1f5f9'}`,
        boxShadow: isHovered
          ? `0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px ${border}`
          : '0 2px 16px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px) translateX(4px)' : 'translateY(0) translateX(0)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: isHovered ? `linear-gradient(90deg, ${color}, ${color}80)` : 'transparent',
        transition: 'all 0.45s ease',
        borderRadius: '20px 20px 0 0',
      }} />

      <div style={{
        width: 64, height: 64, borderRadius: 18, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: isHovered ? color : '#f8fafc',
        border: `2px solid ${isHovered ? color : '#e2e8f0'}`,
        boxShadow: isHovered ? `0 8px 24px ${color}40` : 'none',
        transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        <span style={{
          fontSize: 18, fontWeight: 900, fontFamily: 'monospace',
          color: isHovered ? 'white' : '#94a3b8',
          transition: 'color 0.45s ease',
        }}>{n}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h3 style={{
            fontSize: 17, fontWeight: 800,
            color: isHovered ? color : '#0f172a',
            transition: 'color 0.45s ease',
          }}>{title}</h3>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px',
            borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.8,
            background: isHovered ? `${color}15` : '#f1f5f9',
            color: isHovered ? color : '#94a3b8',
            border: `1px solid ${isHovered ? border : 'transparent'}`,
            transition: 'all 0.45s ease',
          }}>{tag}</span>
        </div>

        <p style={{
          fontSize: 14, lineHeight: 1.65,
          color: isHovered ? '#475569' : '#94a3b8',
          transition: 'all 0.45s ease',
        }}>
          {isHovered ? hover : desc}
        </p>

        <div style={{
          marginTop: 10,
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: 13, fontWeight: 700, color: color,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {actionLabel} →
        </div>
      </div>

      <div style={{
        flexShrink: 0,
        background: isHovered ? '#0f172a' : '#f8fafc',
        border: `1.5px solid ${isHovered ? color + '40' : '#e2e8f0'}`,
        borderRadius: 12, padding: '10px 18px',
        fontFamily: 'monospace', fontSize: 12,
        color: isHovered ? color : '#94a3b8',
        transition: 'all 0.45s ease',
        boxShadow: isHovered ? `0 4px 16px rgba(0,0,0,0.12)` : 'none',
        whiteSpace: 'nowrap',
      }}>
        {code}
      </div>
    </motion.div>
  )
}

const DEMO_STEPS = [
  { prompt: 'user@termilearnhost:~$', cmd: ' ls', output: 'documents/  projects/  readme.txt', outputColor: '#60a5fa' },
  { prompt: 'user@termilearnhost:~$', cmd: ' cat readme.txt', output: 'Welcome to TermiLearn! 🚀', outputColor: '#94a3b8' },
  { prompt: 'user@termilearnhost:~$', cmd: ' mkdir myproject', output: '', outputColor: '' },
  { prompt: 'user@termilearnhost:~$', cmd: ' cd myproject', output: '', outputColor: '' },
  { prompt: 'user@termilearnhost:~/myproject$', cmd: ' touch index.txt', output: '', outputColor: '' },
  { prompt: 'user@termilearnhost:~/myproject$', cmd: ' echo Hello Linux!', output: 'Hello Linux! 🎉', outputColor: '#10b981' },
]

function TerminalDemo() {
  const [stepIndex, setStepIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [lines, setLines] = useState<{ prompt: string; cmd: string; output: string; outputColor: string }[]>([])
  const [phase, setPhase] = useState<'typing' | 'output' | 'pause'>('typing')

  useEffect(() => {
    const step = DEMO_STEPS[stepIndex]

    if (phase === 'typing') {
      if (charIndex < step.cmd.length) {
        const t = setTimeout(() => setCharIndex(c => c + 1), 90)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setPhase('output'), 500)
        return () => clearTimeout(t)
      }
    }

    if (phase === 'output') {
      setLines(prev => [...prev, {
        prompt: step.prompt,
        cmd: step.cmd,
        output: step.output,
        outputColor: step.outputColor
      }])
      const t = setTimeout(() => setPhase('pause'), 200)
      return () => clearTimeout(t)
    }

    if (phase === 'pause') {
      const t = setTimeout(() => {
        if (stepIndex + 1 >= DEMO_STEPS.length) {
          setLines([])
          setStepIndex(0)
        } else {
          setStepIndex(s => s + 1)
        }
        setCharIndex(0)
        setPhase('typing')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [phase, charIndex, stepIndex])

  const step = DEMO_STEPS[stepIndex]

  return (
    <>
      {lines.map((line, i) => (
        <div key={i}>
          <div>
            <span style={{ color: '#10b981', textShadow: '0 0 8px rgba(16,185,129,0.4)' }}>{line.prompt}</span>
            <span style={{ color: 'white' }}>{line.cmd}</span>
          </div>
          {line.output && (
            <div style={{ color: line.outputColor, fontWeight: line.outputColor === '#60a5fa' ? 600 : 400 }}>
              {line.output}
            </div>
          )}
        </div>
      ))}

      <div>
        <span style={{ color: '#10b981', textShadow: '0 0 8px rgba(16,185,129,0.4)' }}>{step.prompt}</span>
        <span style={{ color: 'white' }}>{step.cmd.slice(0, charIndex)}</span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ color: '#10b981' }}
        >█</motion.span>
      </div>
    </>
  )
}

export default function HomePage({ userId, userEmail, onNavigate }: HomePageProps) {
  const [firstName, setFirstName] = useState('')
  const [contactForm, setContactForm] = useState({ name: '', email: userEmail, message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [activeSection, setActiveSection] = useState('features')

  useEffect(() => {
    supabase.from('profiles').select('first_name').eq('id', userId).single()
      .then(({ data }) => { if (data) setFirstName(data.first_name) })
  }, [userId])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'guide', 'contact']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: '#1e293b' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 12,
        zIndex: 50,
        width: 'calc(100% - 32px)',
        margin: '0 16px',
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: 60,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.02)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 14px rgba(16,185,129,0.25)'
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>$_</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0a2540', letterSpacing: -0.5 }}>TermiLearn</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', padding: '4px', borderRadius: 60 }}>
          {[
            { label: 'Features', id: 'features' },
            { label: 'Guide', id: 'guide' },
            { label: 'Contact', id: 'contact' },
            { label: 'Course', id: 'course', action: () => onNavigate('course') }
          ].map(item => {
            const isActive = (item.id === 'features' && activeSection === 'features') ||
                            (item.id === 'guide' && activeSection === 'guide') ||
                            (item.id === 'contact' && activeSection === 'contact')
            return (
              <button
                key={item.label}
                onClick={() => item.action ? item.action() : scrollTo(item.id)}
                style={{
                  background: isActive ? 'white' : 'transparent',
                  border: 'none',
                  color: isActive ? '#10b981' : '#4a5b6e',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: '8px 20px',
                  borderRadius: 40,
                  transition: 'all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#ffffff'
                    e.currentTarget.style.color = '#10b981'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#4a5b6e'
                  }
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {firstName && (
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
                width: 34,
                height: 34,
                borderRadius: 34,
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(16,185,129,0.2)'
              }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1e2a3e' }}>
                {firstName}
              </span>
            </div>
          )}

          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              padding: '8px 20px',
              borderRadius: 40,
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#5c6f87',
              fontSize: 14,
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

      {/* HERO */}
      <section style={{ padding: '80px 32px 60px', textAlign: 'center', background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
        >
          {firstName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 50, padding: '6px 18px', marginBottom: 28, fontSize: 14, color: '#10b981', fontWeight: 600 }}
            >
               Welcome back, {firstName}!
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: 56, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1.5, color: 'white' }}
          >
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}
            >
              Learn Linux
            </motion.span>
            <span style={{ color: 'white' }}>in your browser</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: 17, color: '#64748b', marginBottom: 40, lineHeight: 1.7, maxWidth: 460 }}
          >
            Interactive terminal, complete course, and guided missions — no installation needed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ width: '100%', marginBottom: 36 }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 40px rgba(16,185,129,0.15)', '0 0 0px rgba(16,185,129,0)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="terminal-window"
              style={{ maxWidth: 520, margin: '0 auto', textAlign: 'left' }}
            >
              <div className="terminal-header gap-2">
                <div className="terminal-dot" style={{ backgroundColor: '#ef4444' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#f59e0b' }} />
                <div className="terminal-dot" style={{ backgroundColor: '#10b981' }} />
                <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace', marginLeft: 8 }}>bash — termilearnhost</span>
              </div>
              <div style={{ padding: '18px 20px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, backgroundColor: '#030712', minHeight: 160 }}>
                <TerminalDemo />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(16,185,129,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('terminal')}
              style={{ padding: '14px 28px', borderRadius: 14, border: '1px solid rgba(16,185,129,0.4)', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700, fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
               Open Terminal
            </motion.button>

            <motion.button
              whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(59,130,246,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('course')}
              style={{ padding: '14px 28px', borderRadius: 14, border: '1px solid rgba(59,130,246,0.4)', backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 700, fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
               Learn Commands
            </motion.button>

            <motion.button
              whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(139,92,246,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('missions')}
              style={{ padding: '14px 28px', borderRadius: 14, border: '1px solid rgba(139,92,246,0.4)', backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontWeight: 700, fontSize: 15, cursor: 'pointer', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
               Test My Knowledge
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 10, letterSpacing: -0.5 }}>What you can do</h2>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Everything you need to master Linux</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            {
              title: 'Virtual Terminal',
              desc: 'Practice real Linux commands in a safe browser environment. No setup, no risk.',
              color: '#10b981', bg: '#f0fdf4', border: '#d1fae5',
              action: 'terminal' as const,
              illustration: (
                <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 130 }}>
                  <rect x="20" y="10" width="160" height="95" rx="10" fill="#0f172a" />
                  <rect x="28" y="18" width="144" height="79" rx="6" fill="#030712" />
                  <text x="36" y="38" fontFamily="monospace" fontSize="9" fill="#10b981">user@host:~$</text>
                  <text x="36" y="38" fontFamily="monospace" fontSize="9" fill="#10b981" dx="72"> ls -la</text>
                  <rect x="36" y="44" width="60" height="6" rx="2" fill="#1e40af" opacity="0.6" />
                  <rect x="100" y="44" width="40" height="6" rx="2" fill="#374151" opacity="0.6" />
                  <text x="36" y="62" fontFamily="monospace" fontSize="9" fill="#10b981">user@host:~$</text>
                  <rect x="36" y="68" width="80" height="6" rx="2" fill="#374151" opacity="0.4" />
                  <text x="36" y="85" fontFamily="monospace" fontSize="9" fill="#10b981">user@host:~$ </text>
                  <rect x="108" y="77" width="7" height="11" rx="1" fill="#10b981" opacity="0.9" />
                  <rect x="18" y="105" width="164" height="8" rx="4" fill="#1e293b" />
                  <rect x="75" y="105" width="50" height="8" rx="4" fill="#374151" />
                  <circle cx="36" cy="24" r="3" fill="#ef4444" />
                  <circle cx="46" cy="24" r="3" fill="#f59e0b" />
                  <circle cx="56" cy="24" r="3" fill="#10b981" />
                </svg>
              )
            },
            {
              title: 'Command Course',
              desc: '14 essential Linux commands explained with examples. Learn at your own pace.',
              color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe',
              action: 'course' as const,
              illustration: (
                <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 130 }}>
                  <rect x="40" y="15" width="55" height="75" rx="4" fill="#1e40af" />
                  <rect x="42" y="15" width="51" height="75" rx="4" fill="#3b82f6" />
                  <rect x="44" y="22" width="35" height="5" rx="2" fill="white" opacity="0.9" />
                  <rect x="44" y="31" width="28" height="4" rx="2" fill="white" opacity="0.6" />
                  <rect x="44" y="39" width="32" height="4" rx="2" fill="white" opacity="0.6" />
                  <rect x="44" y="47" width="25" height="4" rx="2" fill="white" opacity="0.6" />
                  <rect x="44" y="55" width="30" height="4" rx="2" fill="white" opacity="0.6" />
                  <path d="M95 15 L115 25 L115 90 L95 90 Z" fill="#bfdbfe" />
                  <rect x="105" y="30" width="68" height="32" rx="8" fill="white" stroke="#dbeafe" strokeWidth="1.5" />
                  <text x="115" y="46" fontFamily="monospace" fontSize="11" fill="#3b82f6" fontWeight="bold">ls</text>
                  <rect x="113" y="50" width="40" height="4" rx="2" fill="#e2e8f0" />
                  <rect x="105" y="68" width="68" height="32" rx="8" fill="white" stroke="#dbeafe" strokeWidth="1.5" />
                  <text x="115" y="84" fontFamily="monospace" fontSize="11" fill="#3b82f6" fontWeight="bold">cd</text>
                  <rect x="113" y="88" width="35" height="4" rx="2" fill="#e2e8f0" />
                  <circle cx="160" cy="25" r="3" fill="#fbbf24" opacity="0.8" />
                  <circle cx="170" cy="15" r="2" fill="#fbbf24" opacity="0.6" />
                  <circle cx="150" cy="18" r="2" fill="#fbbf24" opacity="0.5" />
                </svg>
              )
            },
            {
              title: 'Missions',
              desc: '5 guided challenges to test and validate your Linux knowledge progressively.',
              color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
              action: 'missions' as const,
              illustration: (
                <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 130 }}>
                  <path d="M80 30 L120 30 L115 65 Q100 75 85 65 Z" fill="#f59e0b" />
                  <path d="M85 65 Q100 72 115 65 L112 70 Q100 78 88 70 Z" fill="#d97706" />
                  <rect x="92" y="70" width="16" height="15" rx="2" fill="#d97706" />
                  <rect x="82" y="85" width="36" height="6" rx="3" fill="#f59e0b" />
                  <path d="M80 35 Q65 35 65 50 Q65 62 80 60" stroke="#f59e0b" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M120 35 Q135 35 135 50 Q135 62 120 60" stroke="#f59e0b" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <polygon points="100,38 102,44 108,44 103,48 105,54 100,50 95,54 97,48 92,44 98,44" fill="white" opacity="0.9" />
                  <rect x="30" y="100" width="18" height="18" rx="5" fill="#10b981" />
                  <text x="39" y="113" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="white" fontWeight="bold">1</text>
                  <rect x="55" y="100" width="18" height="18" rx="5" fill="#10b981" />
                  <text x="64" y="113" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="white" fontWeight="bold">2</text>
                  <rect x="80" y="100" width="18" height="18" rx="5" fill="#10b981" />
                  <text x="89" y="113" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="white" fontWeight="bold">3</text>
                  <rect x="105" y="100" width="18" height="18" rx="5" fill="#e2e8f0" />
                  <text x="114" y="113" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#94a3b8" fontWeight="bold">4</text>
                  <rect x="130" y="100" width="18" height="18" rx="5" fill="#e2e8f0" />
                  <text x="139" y="113" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#94a3b8" fontWeight="bold">5</text>
                  <line x1="48" y1="109" x2="55" y2="109" stroke="#10b981" strokeWidth="2" />
                  <line x1="73" y1="109" x2="80" y2="109" stroke="#10b981" strokeWidth="2" />
                  <line x1="98" y1="109" x2="105" y2="109" stroke="#e2e8f0" strokeWidth="2" />
                  <line x1="123" y1="109" x2="130" y2="109" stroke="#e2e8f0" strokeWidth="2" />
                </svg>
              )
            },
            {
              title: 'Quiz',
              desc: '15 levels of questions to challenge your Linux skills. Badge included!',
              color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
              action: 'missions' as const,
              illustration: (
                <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 130 }}>
                  <rect x="20" y="10" width="160" height="70" rx="10" fill="white" stroke="#ddd6fe" strokeWidth="2" />
                  <rect x="30" y="22" width="90" height="7" rx="3" fill="#ddd6fe" />
                  <rect x="30" y="38" width="65" height="12" rx="6" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
                  <text x="38" y="48" fontFamily="monospace" fontSize="8" fill="#8b5cf6" fontWeight="bold">A) ls</text>
                  <rect x="102" y="38" width="65" height="12" rx="6" fill="#8b5cf6" />
                  <text x="110" y="48" fontFamily="monospace" fontSize="8" fill="white" fontWeight="bold">B) pwd</text>
                  <rect x="30" y="56" width="65" height="12" rx="6" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.5" />
                  <text x="38" y="66" fontFamily="monospace" fontSize="8" fill="#94a3b8" fontWeight="bold">C) cd</text>
                  <rect x="102" y="56" width="65" height="12" rx="6" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="1.5" />
                  <text x="110" y="66" fontFamily="monospace" fontSize="8" fill="#94a3b8" fontWeight="bold">D) cat</text>
                  <circle cx="50" cy="105" r="16" fill="#fef3c7" stroke="#fde68a" strokeWidth="2" />
                  <text x="50" y="109" textAnchor="middle" fontSize="16">🥉</text>
                  <circle cx="100" cy="100" r="20" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
                  <text x="100" y="106" textAnchor="middle" fontSize="20">🥇</text>
                  <circle cx="150" cy="105" r="16" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" />
                  <text x="150" y="109" textAnchor="middle" fontSize="16">🥈</text>
                  <circle cx="175" cy="20" r="12" fill="#10b981" />
                  <text x="175" y="25" textAnchor="middle" fontSize="14" fill="white">✓</text>
                </svg>
              )
            },
          ].map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              onClick={() => onNavigate(f.action)}
              style={{ backgroundColor: f.bg, border: `1.5px solid ${f.border}`, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              <div style={{ padding: '24px 24px 0', backgroundColor: `${f.color}08` }}>
                {f.illustration}
              </div>
              <div style={{ padding: '20px 24px 28px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{f.desc}</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>Get started →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GUIDE */}
      <section id="guide" style={{ padding: '80px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 50, padding: '6px 18px', marginBottom: 18, fontSize: 12, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>
               How it works
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 12, letterSpacing: -0.8 }}>
              4 steps to master Linux
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16 }}>From zero to confident — follow the path</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                n: '01', title: 'Read the course', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
                desc: 'Browse 14 commands with explanations and examples. Click any card to learn more.',
                hover: 'Browse ls, cd, mkdir, cat and 10 more — each with a live example you can try.',
                action: () => onNavigate('course'), actionLabel: '📚 Open Course',
                tag: 'Start here', code: '$ man linux'
              },
              {
                n: '02', title: 'Practice in the terminal', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0',
                desc: 'Open the virtual terminal and type real commands. Explore freely — nothing can break.',
                hover: 'Try ls -la, cd documents, mkdir test... Tab autocomplete and history included!',
                action: () => onNavigate('terminal'), actionLabel: '🖥️ Open Terminal',
                tag: 'Hands-on', code: '$ ls -la'
              },
              {
                n: '03', title: 'Complete the missions', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
                desc: 'Validate your skills with 5 guided challenges. Each mission unlocks the next.',
                hover: 'Mission 1: Navigate. Mission 2: Create files. Mission 3: Read. Mission 4: Copy. Mission 5: Clean up.',
                action: () => onNavigate('missions'), actionLabel: '🎯 Start Missions',
                tag: 'Validate', code: '$ ./mission_5'
              },
              {
                n: '04', title: 'Test with the Quiz', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
                desc: '15 questions progressives pour valider tes connaissances. Obtiens ton badge!',
                hover: 'Easy → Medium → Hard. Explication à chaque réponse. Score final avec badge 🥇🥈🥉.',
                action: () => onNavigate('missions'), actionLabel: '📝 Take Quiz',
                tag: 'Challenge', code: '$ quiz --start'
              },
            ].map((s, i) => (
              <HoverCard key={s.n} {...s} index={i} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(16,185,129,0.2)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('terminal')}
              style={{ padding: '14px 36px', borderRadius: 14, border: '2px solid #10b981', background: 'white', color: '#10b981', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s ease' }}
            >
               Start your Linux journey
            </motion.button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: '80px 32px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 50, padding: '6px 18px', marginBottom: 18, fontSize: 12, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              💬 Get in touch
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', marginBottom: 10, letterSpacing: -0.8 }}>Share your ideas</h2>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>Suggestions, bugs, feedback — we'd love to hear from you</p>
          </div>

          <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1.5px solid #f1f5f9' }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, #10b981, #3b82f6, #f59e0b)' }} />
            <div style={{ padding: 40 }}>
              {contactSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>🎉</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Message sent!</h3>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Thank you! We'll get back to you soon.</p>
                  <button onClick={() => setContactSent(false)} style={{ background: 'none', border: '1.5px solid #10b981', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: '8px 20px', borderRadius: 10 }}>Send another →</button>
                </motion.div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setContactSent(true) }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>1</span>
                      Your name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                      <input type="text"
                        value={contactForm.name}
                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        required placeholder="Hajar"
                        style={{ width: '100%', padding: '13px 16px 13px 42px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'inherit', transition: 'all 0.3s ease' }}
                        onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)' }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>2</span>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                      <input type="email"
                        value={contactForm.email}
                        onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '13px 16px 13px 42px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'inherit', transition: 'all 0.3s ease' }}
                        onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(59,130,246,0.08)' }}
                        onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 900 }}>3</span>
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      required rows={4} placeholder="Your idea or feedback..."
                      style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'inherit', transition: 'all 0.3s ease' }}
                      onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.backgroundColor = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.08)' }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>

                  <motion.button type="submit"
                    whileHover={{ y: -2, boxShadow: '0 12px 30px rgba(16,185,129,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '15px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: 0.3 }}
                  >
                    📨 Send Message
                  </motion.button>

                  <p style={{ textAlign: 'center', fontSize: 12, color: '#cbd5e1', margin: 0 }}>
                    We usually reply within 24 hours 🕐
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#020617', padding: '60px 24px', borderTop: '1px solid #1e293b', marginTop: 60 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, backgroundColor: '#10b981', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'monospace' }}>$_</span>
                </div>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}>TermiLearn</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: '450px', lineHeight: '1.6', margin: '0 auto' }}>
                Bridging the gap between theory and practice through an interactive Linux terminal simulation environment.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <a href="https://github.com/hajarmazouzi43-cyber" target="_blank" rel="noopener noreferrer" title="GitHub"
                style={{ color: '#94a3b8', fontSize: 22, transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <FiGithub />
              </a>
              <a href="https://linkedin.com/in/hajar-mazouzi-121a4235b/" target="_blank" rel="noopener noreferrer" title="LinkedIn"
                style={{ color: '#94a3b8', fontSize: 22, transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0077b5'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <FiLinkedin />
              </a>
              <a href="https://hajarmazouzi43-cyber.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" title="Portfolio"
                style={{ color: '#94a3b8', fontSize: 22, transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#10b981'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}>
                <FiGlobe />
              </a>
            </div>

            <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, width: '100%', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>
                © 2026 TermiLearn • Engineered by <strong>Hajar MAZOUZI</strong>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}