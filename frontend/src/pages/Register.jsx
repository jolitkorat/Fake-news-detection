import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const requirements = [
  { test: (p) => p.length >= 8, label: '8+ characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'Uppercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'Number' },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080812] cyber-grid p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
              <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                <path d="M18 3L3 12V24L18 33L33 24V12L18 3Z" stroke="white" strokeWidth="2.5" fill="none"/>
                <circle cx="18" cy="18" r="5" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-white">TruthLens <span className="gradient-text">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start detecting fake news for free</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <motion.div
              className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.2)', color: '#ff2d55' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Full Name</label>
              <input
                id="register-name"
                type="text"
                className="input-cyber"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Email</label>
              <input
                id="register-email"
                type="email"
                className="input-cyber"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPw ? 'text' : 'password'}
                  className="input-cyber pr-12"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password requirements */}
              {form.password && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {requirements.map(({ test, label }) => {
                    const met = test(form.password)
                    return (
                      <div key={label} className={`flex items-center gap-1 text-xs transition-colors ${met ? 'text-green-400' : 'text-slate-600'}`}>
                        <Check size={10} />
                        {label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>Create Account <ArrowRight size={16} /></>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-neon-cyan hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Free plan includes 10 analyses/day. No credit card required.
        </p>
      </motion.div>
    </div>
  )
}
