import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, Trash2, Copy, Plus, Check, AlertCircle, Webhook, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'

const PERMISSION_OPTIONS = ['analyze', 'bulk_analyze', 'read_reports', 'webhooks']

export default function Settings() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [apiKeys, setApiKeys] = useState([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPerms, setNewKeyPerms] = useState(['analyze', 'read_reports'])
  const [generatedKey, setGeneratedKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/keys').then(res => setApiKeys(res.data.data)).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/keys/generate', { name: newKeyName, permissions: newKeyPerms })
      setGeneratedKey(res.data.data.key)
      setApiKeys(prev => [...prev, res.data.data])
      setNewKeyName('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate key')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return
    await api.delete(`/keys/${id}`)
    setApiKeys(prev => prev.filter(k => k.id !== id))
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const togglePerm = (p) => {
    setNewKeyPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white"><span className="gradient-text">Settings</span></h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account, API keys, and preferences</p>
      </div>

      {/* Profile */}
      <section className="glass-card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'rgba(0, 245, 255, 0.1)', color: '#00f5ff', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
                {user?.plan}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#9333ea', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-slate-500 text-xs">Total Analyses</p>
            <p className="text-white font-bold mt-0.5">{user?.analysisCount || 0}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-slate-500 text-xs">Member Since</p>
            <p className="text-white font-bold mt-0.5">{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="glass-card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Theme</p>
            <p className="text-xs text-slate-500 mt-0.5">Switch between dark and light mode</p>
          </div>
          <button
            id="settings-theme-toggle"
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              theme === 'light' ? 'bg-cyan-500' : 'bg-white/10'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${
              theme === 'light' ? 'left-7' : 'left-0.5'
            }`} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Current: {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</p>
      </section>

      {/* API Keys */}
      <section className="glass-card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Key size={18} className="text-neon-cyan" />
          API Keys
        </h2>

        {/* Generated key alert */}
        {generatedKey && (
          <motion.div
            className="p-4 rounded-xl mb-4"
            style={{ background: 'rgba(0, 255, 135, 0.08)', border: '1px solid rgba(0, 255, 135, 0.2)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start gap-2 mb-2">
              <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-400 font-medium">API Key generated! Copy it now — it won't be shown again.</p>
            </div>
            <div className="flex items-center gap-2 mt-3 p-3 rounded-lg"
                 style={{ background: 'rgba(0,0,0,0.3)', fontFamily: 'monospace' }}>
              <span className="text-xs text-slate-300 flex-1 break-all">{generatedKey}</span>
              <button onClick={() => handleCopy(generatedKey)}
                      className="text-neon-cyan hover:text-white transition-colors flex-shrink-0">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* Existing keys */}
        {apiKeys.length > 0 && (
          <div className="space-y-2 mb-4">
            {apiKeys.map(key => (
              <div key={key.id || key._id} className="flex items-center justify-between p-3 rounded-xl"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="text-sm font-medium text-white">{key.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{key.keyPrefix}••••••••</p>
                </div>
                <button onClick={() => handleRevoke(key.id || key._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Generate new key */}
        <div className="p-4 rounded-xl"
             style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm font-medium text-white mb-3">Generate New API Key</p>
          <input
            id="api-key-name"
            type="text"
            className="input-cyber mb-3 text-sm"
            placeholder="Key name (e.g., Production App)"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mb-3">
            {PERMISSION_OPTIONS.map(p => (
              <button
                key={p}
                onClick={() => togglePerm(p)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                  newKeyPerms.includes(p)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 border border-white/5 hover:border-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          <button
            id="generate-api-key"
            onClick={handleGenerate}
            disabled={loading || !newKeyName.trim()}
            className="btn-primary text-sm py-2 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Plus size={14} />
              {loading ? 'Generating...' : 'Generate Key'}
            </span>
          </button>
        </div>
      </section>

      {/* API Docs link */}
      <section className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Webhook size={18} className="text-neon-purple" />
              API Documentation
            </h2>
            <p className="text-xs text-slate-400 mt-1">Integrate TruthLens AI into your applications</p>
          </div>
          <a href="/docs" className="flex items-center gap-2 btn-secondary text-sm">
            <ExternalLink size={14} />
            View Docs
          </a>
        </div>
      </section>
    </div>
  )
}
