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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
              <span className="text-black font-bold text-sm">$_</span>
            </div>
            <span className="text-3xl font-bold text-white">TermiLearn</span>
          </div>
          <p className="text-gray-400 text-sm">Learn Linux in your browser — no installation needed</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
          {/* Terminal header bar */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-800">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-gray-500 text-xs font-mono">
              {isLogin ? 'auth — login' : 'auth — register'}
            </span>
          </div>

          <h2 className="text-white text-xl font-semibold mb-6">
            {isLogin ? 'Sign in to your session' : 'Create a new account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-gray-400 text-sm mb-1 font-mono">first_name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Hajar"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-1 font-mono">email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-green-500 transition-colors"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1 font-mono">password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm font-mono bg-red-950/30 border border-red-900 rounded-lg px-3 py-2"
              >
                ✗ {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm font-mono bg-green-950/30 border border-green-900 rounded-lg px-3 py-2"
              >
                ✓ {success}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:text-green-700 text-black font-semibold py-2.5 rounded-lg transition-colors font-mono text-sm"
            >
              {loading ? 'Loading...' : isLogin ? '$ login' : '$ register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
              className="text-gray-500 hover:text-green-400 text-sm transition-colors font-mono"
            >
              {isLogin ? '> No account? Register here' : '> Already have an account? Login'}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4 font-mono">
          ENSA Berrechid • Technologies Web 2025-2026
        </p>
      </motion.div>
    </div>
  )
}