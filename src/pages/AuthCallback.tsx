import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Verifying your email...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const type = params.get('type')

        if (type === 'recovery') {
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code)
            if (error) throw error
          }
          toast.success('Please set your new password.')
          navigate('/auth/reset-password', { replace: true })
          return
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (data.session) {
          toast.success('Email confirmed! You are now signed in.')
          navigate('/', { replace: true })
        } else {
          setStatus('No session found. Please sign in.')
          setTimeout(() => navigate('/auth', { replace: true }), 2000)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed'
        setStatus(message)
        toast.error(message)
        setTimeout(() => navigate('/auth', { replace: true }), 3000)
      }
    }
    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-primary-container flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-on-background font-headline-md text-headline-md font-bold mb-2">{status}</h2>
        <p className="text-on-surface-variant text-body-sm">Please wait while we verify your account...</p>
      </div>
    </div>
  )
}
