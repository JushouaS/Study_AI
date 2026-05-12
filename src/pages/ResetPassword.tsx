import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import Icon from '../components/Icon'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const calculateStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: 'bg-outline-variant', percent: 0 }
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++
    if (strength <= 2) return { level: 1, label: 'Weak', color: 'bg-error', percent: 33 }
    if (strength <= 3) return { level: 2, label: 'Moderate', color: 'bg-tertiary', percent: 66 }
    return { level: 3, label: 'Strong', color: 'bg-secondary', percent: 100 }
  }

  const strength = calculateStrength(password)
  const passwordsMatch = password === confirmPassword
  const canSubmit = password && passwordsMatch && strength.level === 3

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-surface">
      <div className="w-full max-w-md fade-up">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Icon name="lock_reset" className="text-on-primary text-xl" />
            </div>
            <span className="font-headline-md text-headline-md font-extrabold text-primary">StudyAI</span>
          </div>
          <p className="text-on-surface-variant text-sm font-body-md">Set your new password</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h2 className="font-headline-md text-headline-md font-bold mb-6 text-on-background">Reset Password</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-on-surface-variant mb-1 block font-label-md">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 pr-10 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
                </button>
              </div>

              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant">Strength:</span>
                    <span className={`text-xs font-semibold ${strength.level === 1 ? 'text-error' : strength.level === 2 ? 'text-tertiary' : 'text-secondary'}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-outline-variant rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-on-surface-variant mb-1 block font-label-md">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-3 pr-10 text-sm text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                >
                  <Icon name={showConfirmPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-error mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
            >
              {loading ? <span className="animate-pulse">Please wait...</span> : 'Update Password'}
            </button>
          </div>

          <p className="text-center text-on-surface-variant text-sm mt-6">
            Remember your password?{' '}
            <button onClick={() => navigate('/auth')} className="text-primary hover:underline font-semibold">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
