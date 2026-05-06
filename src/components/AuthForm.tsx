import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        if (!firstName.trim()) throw new Error('Please enter your first name')
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            first_name: firstName.trim()
          })
        }
        setSuccess('Account created! You can now sign in.')
        setIsLogin(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: 5,
    padding: '14px 18px',
    fontSize: 15,
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginTop: 10,
    display: 'block',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #faf5ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'rgba(139,92,246,0.06)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', width: '100%', maxWidth: 540 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
              marginBottom: 16
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>$_</span>
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>TermiLearn</h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 6 }}>Learn Linux in your browser</p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 24,
          padding: '48px 52px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1px solid rgba(226,232,240,0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated border lights */}
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #10b981, #3b82f6, #8b5cf6, transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg, transparent, #8b5cf6, #ec4899, transparent)',
            }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.75 }}
          />
          <motion.div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #ec4899, #f59e0b, #10b981, transparent)',
            }}
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
          />
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
              background: 'linear-gradient(180deg, transparent, #3b82f6, #10b981, transparent)',
            }}
            animate={{ y: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2.25 }}
          />

          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 32 }}>
              {isLogin ? 'Welcome back 👋' : 'Create your account'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {!isLogin && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required={!isLogin}
                      placeholder="Your first name"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#10b981'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="your@email.com"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: '#ef4444', fontSize: 13,
                      backgroundColor: '#fff5f5',
                      border: '1px solid #fecaca',
                      borderRadius: 5, padding: '12px 16px'
                    }}
                  >
                    ✗ {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: '#10b981', fontSize: 13,
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 5, padding: '12px 16px'
                    }}
                  >
                    ✓ {success}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    width: '100%',
                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 15,
                    padding: '15px',
                    borderRadius: 5,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
                    marginTop: 8,
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Loading...' : isLogin ? 'Sign in →' : 'Create account →'}
                </motion.button>
              </div>
            </form>

            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
                style={{
                  background: 'none', border: 'none',
                  color: '#64748b', fontSize: 14, cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, marginTop: 24 }}>
          ENSA Berrechid • Technologies Web 2025-2026
        </p>
      </motion.div>
    </div>
  )
}