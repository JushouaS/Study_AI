import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Chat from './pages/Chat'
import AuthCallback from './pages/AuthCallback'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'sonner'
import type { Session } from '@supabase/supabase-js'

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg text-text">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-card border border-mint/20 flex items-center justify-center text-mint shadow-[0_0_24px_rgba(99,220,180,0.12)]">
          <span className="font-heading font-extrabold text-xl">S</span>
        </div>
        <span className="font-heading text-lg font-bold tracking-tight">Loading...</span>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/" element={session ? <Chat session={session} /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  )
}