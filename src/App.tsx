import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import AuthForm from './components/AuthForm'
import HomePage from './pages/HomePage'
import TerminalPage from './pages/TerminalPage'
import CoursePage from './pages/CoursePage'

type Page = 'home' | 'terminal' | 'missions' | 'course'

function TypingText({ texts }: { texts: string[] }) {
  const [textIndex, setTextIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const current = texts[textIndex]
    if (charIndex < current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1))
        setCharIndex(c => c + 1)
      }, 60)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setTextIndex(i => (i + 1) % texts.length)
        setCharIndex(0)
        setDisplayed('')
      }, 800)
      return () => clearTimeout(t)
    }
  }, [charIndex, textIndex, texts])

  return <span>{displayed}</span>
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showApp, setShowApp] = useState(false)
  const [currentPage, setCurrentPage] = useState<Page>('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setUserEmail(session?.user?.email ?? '')
      setLoading(false)
    })

    setTimeout(() => setShowApp(true), 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null)
        setUserEmail(session?.user?.email ?? '')
        if (!session) setCurrentPage('home')
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading || !showApp) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
        >
          {/* Logo */}
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.15, 1, 1.15, 1],
              boxShadow: [
                '0 0 0px rgba(16,185,129,0)',
                '0 0 40px rgba(16,185,129,0.5)',
                '0 0 0px rgba(16,185,129,0)',
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 90, height: 90,
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              borderRadius: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.span
              animate={{
                opacity: [1, 0.4, 1],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ color: 'white', fontWeight: 900, fontSize: 32, fontFamily: 'monospace' }}
            >$_</motion.span>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ textAlign: 'center' }}
          >
            <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>
              TermiLearn
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0', fontFamily: 'monospace' }}>
              Learn Linux in your browser
            </p>
          </motion.div>

          {/* Typing text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              backgroundColor: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 10, padding: '10px 20px',
              fontFamily: 'monospace', fontSize: 13, color: '#10b981',
              display: 'flex', alignItems: 'center', gap: 8,
              minWidth: 260
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >▋</motion.span>
            <TypingText texts={[
              'Initializing terminal...',
              'Loading filesystem...',
              'Setting up environment...',
              'Almost ready...',
              'Ready!'
            ]} />
          </motion.div>

        </motion.div>
      </div>
    )
  }

  if (!userId) return <AuthForm />

  if (currentPage === 'course') return (
    <CoursePage
      onGoHome={() => setCurrentPage('home')}
      onNavigate={(page) => setCurrentPage(page as Page)}
    />
  )

  if (currentPage === 'terminal' || currentPage === 'missions') return (
    <TerminalPage
      userId={userId}
      userEmail={userEmail}
      showMissionsDefault={currentPage === 'missions'}
      onGoHome={() => setCurrentPage('home')}
    />
  )

  return (
    <HomePage
      userId={userId}
      userEmail={userEmail}
      onNavigate={(page) => setCurrentPage(page as Page)}
    />
  )
}