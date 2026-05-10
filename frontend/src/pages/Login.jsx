import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Shield, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#080812] cyber-grid">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
             style={{ background: 'radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 3L3 12V24L18 33L33 24V12L18 3Z" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="18" cy="18" r="5" fill="white"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            Truth is the<br /><span className="gradient-text">most powerful</span><br />weapon.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Join thousands of fact-checkers, journalists, and organizations fighting misinformation with AI.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {['98.7% Accuracy', '2.3s Response', '50M+ Analyzed', 'Enterprise Ready'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
              <Shield size={18} color="white" />
            </div>
            <span className="font-bold text-white">TruthLens <span className="gradient-text">AI</span></span>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-8">Sign in to your TruthLens AI account</p>

            {error && (
              <motion.div
                className="flex items-center gap-2 p-3 rounded-xl mb-6 text-sm"
                style={{ background: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.2)', color: '#ff2d55' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Email</label>
                <input
                  id="login-email"
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
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    className="input-cyber pr-12"
                    placeholder="••••••••"
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
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>Sign In <ArrowRight size={16} /></>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-neon-cyan hover:underline font-medium">Create one free</Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 p-3 rounded-xl text-xs"
                 style={{ background: 'rgba(0, 245, 255, 0.05)', border: '1px solid rgba(0, 245, 255, 0.1)' }}>
              <p className="text-slate-400">
                <span className="text-cyan-400 font-medium">Demo:</span> demo@truthlens.ai / Demo1234!
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-slate-400 hover:text-white">Terms</a> and{' '}
            <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
