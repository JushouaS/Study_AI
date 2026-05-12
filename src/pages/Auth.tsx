import { useState } from "react"
import { supabase } from "../lib/supabase"
import { toast } from "sonner"
import { useTheme } from "../context/ThemeContext"
import { useNavigate, useSearchParams } from "react-router-dom"

type FormMode = "signin" | "signup"

const signupSchema = {
  email: (v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v) ? null : "Invalid email",
  password: (v: string) => v.length >= 8 ? null : "Minimum 8 characters",
}

const signinSchema = {
  email: (v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v) ? null : "Invalid email",
  password: (v: string) => v.length > 0 ? null : "Password required",
}

function calculateStrength(pwd: string): "weak" | "moderate" | "strong" {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[!@#$%^&*]/.test(pwd)) score++
  if (score <= 2) return "weak"
  if (score <= 3) return "moderate"
  return "strong"
}

const strengthConfig = {
  weak:     { label: "Weak",     width: "33%",  darkColor: "#ef4444", lightColor: "#ef4444" },
  moderate: { label: "Moderate", width: "66%",  darkColor: "#f59e0b", lightColor: "#f59e0b" },
  strong:   { label: "Strong",   width: "100%", darkColor: "#10b981", lightColor: "#10b981" },
}

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorMsg = searchParams.get("error_description")
  const { theme, toggleTheme } = useTheme()

  const [mode, setMode] = useState<FormMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const strength = password ? calculateStrength(password) : null
  const isDark = theme === "dark"

  const light = {
    pageBg: "#f0f4ff",
    card: "#ffffff",
    cardBorder: "#e0e7ff",
    cardShadow: "0 4px 32px rgba(99,102,241,0.08)",
    inputBg: "#f8faff",
    inputBorder: "#c7d2fe",
    inputFocusBorder: "#818cf8",
    inputFocusRing: "0 0 0 3px rgba(129,140,248,0.15)",
    btnGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    label: "#4b5563",
    heading: "#1e1b4b",
    subtext: "#6b7280",
    accent: "#6366f1",
    accentHover: "#4f46e5",
    inputText: "#1e1b4b",
    placeholderText: "#9ca3af",
    strengthBarBg: "#e0e7ff",
    errorBg: "#fee2e2",
    errorText: "#dc2626",
  }

  const switchMode = (next: FormMode) => {
    setMode(next)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const schema = mode === "signup" ? signupSchema : signinSchema
    const newErrors: Record<string, string> = {}

    if (!email) newErrors.email = "Email required"
    else { const err = schema.email(email); if (err) newErrors.email = err }

    if (!password) newErrors.password = "Password required"
    else { const err = schema.password(password); if (err) newErrors.password = err }

    if (mode === "signup") {
      if (strength !== "strong") newErrors.password = "Password must be Strong to sign up"
      if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast.error(error.message.includes("Invalid") ? "Invalid email or password" : error.message)
        } else {
          toast.success("Signed in!")
          navigate("/")
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
          toast.error(error.message.includes("already registered") ? "Email already registered" : error.message)
        } else {
          toast.success("Account created! Check your email to confirm.")
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { toast.error("Enter your email"); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      toast.success("Reset link sent! Check your email.")
      setForgotEmail("")
      setForgotPassword(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }



  const inputClass = "w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-zinc-400"

  const inputFocusClass = isDark
    ? "focus:border-zinc-500 focus:ring-zinc-700/40"
    : "focus:border-indigo-400 focus:ring-indigo-100"

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    backgroundColor: isDark ? "#1e1e1e" : light.inputBg,
    borderColor: hasError ? light.errorText : isDark ? "#2a2a2a" : light.inputBorder,
    color: isDark ? "#e5e5e5" : light.inputText,
  })

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300"
      style={{ backgroundColor: isDark ? "#0f0f10" : light.pageBg }}
    >
      <div className="w-full max-w-md">

        {/* Top bar — logo + theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* SVG Logo */}
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#63dcb4" fillOpacity="0.15"/>
              <path d="M7 18V20H21V18H7Z" fill="#63dcb4"/>
              <rect x="7" y="10" width="14" height="7" rx="1" fill="none" stroke="#63dcb4" strokeWidth="1.5"/>
              <path d="M11 10V9C11 7.9 11.9 7 13 7H15C16.1 7 17 7.9 17 9V10" stroke="#63dcb4" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="20" cy="8" r="2.5" fill="#63dcb4"/>
              <path d="M19 8H21M20 7V9" stroke="#080810" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: isDark ? "#ffffff" : light.heading }}
            >
              StudyAI
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border transition-all duration-200 hover:scale-105"
            style={{
              borderColor: isDark ? "#2a2a2a" : light.cardBorder,
              backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
              color: isDark ? "#a3a3a3" : light.subtext,
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Error from URL */}
        {errorMsg && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: isDark ? "#7f1d1d" : light.errorBg,
              color: isDark ? "#fca5a5" : light.errorText,
            }}
          >
            {decodeURIComponent(errorMsg)}
          </div>
        )}

        {/* Card */}
        <div
          className="rounded-2xl border p-8 transition-all duration-300"
          style={{
            backgroundColor: isDark ? "#171717" : light.card,
            borderColor: isDark ? "#2a2a2a" : light.cardBorder,
            boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.3)" : light.cardShadow,
          }}
        >
          {forgotPassword ? (
            /* ── Forgot Password ── */
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: isDark ? "#fff" : light.heading }}
                >
                  Reset Password
                </h2>
                <p className="text-sm" style={{ color: isDark ? "#a3a3a3" : light.subtext }}>
                  Enter your email to receive a reset link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#d4d4d8" : light.label }}>
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className={`${inputClass} ${inputFocusClass}`}
                  style={inputStyle(false)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !forgotEmail}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isDark ? "linear-gradient(135deg, #63dcb4, #7c6af7)" : light.btnGradient,
                  color: isDark ? "#080810" : "#ffffff",
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm" style={{ color: isDark ? "#a3a3a3" : light.subtext }}>
                <button
                  type="button"
                  onClick={() => { setForgotPassword(false); setForgotEmail("") }}
                  className="font-semibold transition-colors duration-200 hover:underline"
                  style={{ color: isDark ? "#63dcb4" : light.accent }}
                >
                  ← Back to sign in
                </button>
              </p>
            </form>
          ) : (
            /* ── Sign In / Sign Up ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Heading */}
              <div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{ color: isDark ? "#fff" : light.heading }}
                >
                  {mode === "signin" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm" style={{ color: isDark ? "#a3a3a3" : light.subtext }}>
                  {mode === "signin"
                    ? "Sign in to continue studying"
                    : "Join StudyAI and start learning smarter"}
                </p>
              </div>

              {/* Mode toggle tabs */}
              <div
                className="flex rounded-xl p-1 gap-1"
                style={{ backgroundColor: isDark ? "#0f0f10" : "#ede9fe" }}
              >
                {(["signin", "signup"] as FormMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: mode === m
                        ? isDark ? "#1e1e1e" : "#ffffff"
                        : "transparent",
                      color: mode === m
                        ? isDark ? "#ffffff" : light.heading
                        : isDark ? "#71717a" : light.subtext,
                      boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    {m === "signin" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#d4d4d8" : light.label }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })) }}
                  placeholder="your@email.com"
                  disabled={loading}
                  className={`${inputClass} ${inputFocusClass}`}
                  style={inputStyle(!!errors.email)}
                />
                {errors.email && (
                  <p className="text-xs mt-1" style={{ color: isDark ? "#f87171" : light.errorText }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#d4d4d8" : light.label }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })) }}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`${inputClass} ${inputFocusClass} pr-11`}
                    style={inputStyle(!!errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                    style={{ color: isDark ? "#71717a" : light.subtext }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength — only on signup */}
                {mode === "signup" && password && strength && (
                  <div className="mt-2 space-y-1.5">
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: isDark ? "#2a2a2a" : light.strengthBarBg }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-400"
                        style={{
                          width: strengthConfig[strength].width,
                          backgroundColor: isDark
                            ? strengthConfig[strength].darkColor
                            : strengthConfig[strength].lightColor,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: isDark ? "#71717a" : light.subtext }}>
                        Password strength
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: isDark
                            ? strengthConfig[strength].darkColor
                            : strengthConfig[strength].lightColor,
                        }}
                      >
                        {strengthConfig[strength].label}
                      </span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs mt-1" style={{ color: isDark ? "#f87171" : light.errorText }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password — signup only */}
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? "#d4d4d8" : light.label }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: "" })) }}
                      placeholder="••••••••"
                      disabled={loading}
                      className={`${inputClass} ${inputFocusClass} pr-11`}
                      style={inputStyle(!!errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                      style={{ color: isDark ? "#71717a" : light.subtext }}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: isDark ? "#f87171" : light.errorText }}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (mode === "signup" && strength !== "strong")}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #63dcb4, #7c6af7)"
                    : light.btnGradient,
                  color: isDark ? "#080810" : "#ffffff",
                }}
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin" ? "Sign In" : "Create Account"}
              </button>

              {/* Forgot password link */}
              {mode === "signin" && (
                <p className="text-center text-sm" style={{ color: isDark ? "#a3a3a3" : light.subtext }}>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="font-semibold transition-colors duration-200 hover:underline"
                    style={{ color: isDark ? "#63dcb4" : light.accent }}
                  >
                    Forgot password?
                  </button>
                </p>
              )}

              {/* Cybersecurity note for signup */}
              {mode === "signup" && (
                <p className="text-xs text-center px-2" style={{ color: isDark ? "#52525b" : "#9ca3af" }}>
                  🔒 Strong password required for your security. Use uppercase, numbers, and special characters.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: isDark ? "#3f3f46" : "#9ca3af" }}>
          StudyAI — AI-powered study companion for Computer Engineering
        </p>
      </div>
    </div>
  )
}