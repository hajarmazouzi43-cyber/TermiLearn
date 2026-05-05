import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AuthForm from './components/AuthForm'
import HomePage from './pages/HomePage'
import TerminalPage from './pages/TerminalPage'
import CoursePage from './pages/CoursePage'  // ← AJOUTÉ

type Page = 'home' | 'terminal' | 'missions' | 'course'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
      setUserEmail(session?.user?.email ?? '')
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setUserEmail(session?.user?.email ?? '')
      if (!session) setCurrentPage('home')
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-green-400 font-mono text-sm">Loading TermiLearn...</p>
        </div>
      </div>
    )
  }

  if (!userId) return <AuthForm />
  
    // Page Course (nouveau)
    if (currentPage === 'course') {
      return (
          <CoursePage
              onGoHome={() => setCurrentPage('home')}
              onNavigate={(page) => setCurrentPage(page as Page)}
          />
    )
  }

  if (currentPage === 'terminal' || currentPage === 'missions') {
    return (
      <TerminalPage
        userId={userId}
        userEmail={userEmail}
        showMissionsDefault={currentPage === 'missions'}
        onGoHome={() => setCurrentPage('home')}
      />
    )
  }

  return (
    <HomePage
      userId={userId}
      userEmail={userEmail}
            onNavigate={(page) => setCurrentPage(page as Page)}  
    />
  )
}