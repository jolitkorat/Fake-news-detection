import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Search, Shield, Clock, TrendingUp, Zap, ChevronRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'
import { VerdictBadge } from '../components/VerdictCard'
import api from '../services/api'

const VERDICT_COLORS = {
  Fake: '#ff2d55',
  Misleading: '#ffd60a',
  'Partially True': '#ff8c00',
  Verified: '#00ff87',
  Unverifiable: '#64748b',
}

const SAMPLE_ANALYSES = [
  { _id: '1', originalContent: { headline: 'Government announces new energy policy' }, verdict: 'Verified', confidence: 89, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '2', originalContent: { headline: 'Celebrity secret revealed by insiders!' }, verdict: 'Fake', confidence: 94, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '3', originalContent: { headline: 'New study links coffee to health benefits' }, verdict: 'Partially True', confidence: 67, createdAt: new Date(Date.now() - 86400000).toISOString() },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [analyses, setAnalyses] = useState(SAMPLE_ANALYSES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, histRes] = await Promise.all([
          api.get('/stats'),
          api.get('/history?limit=5'),
        ])
        setStats(statsRes.data.data)
        if (histRes.data.data.analyses.length > 0) {
          setAnalyses(histRes.data.data.analyses)
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const distribution = stats?.distribution || { Fake: 12, Misleading: 8, 'Partially True': 15, Verified: 20, Unverifiable: 5 }
  const total = stats?.total || 60

  const pieData = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: VERDICT_COLORS[name] }))

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </motion.h1>
        <p className="text-slate-400 text-sm mt-1">Here's your fake news detection overview</p>
      </div>

      {/* Quick Action */}
      <motion.div
        className="glass-card p-6 mb-8 flex flex-col md:flex-row items-center gap-6"
        style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 245, 255, 0.05))', borderColor: 'rgba(0, 245, 255, 0.2)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-neon-cyan" />
            <span className="text-sm font-semibold text-neon-cyan">Quick Analysis</span>
          </div>
          <p className="text-white font-medium">Analyze news content instantly</p>
          <p className="text-slate-400 text-sm mt-1">Paste text, enter a URL, or upload an article</p>
        </div>
        <button
          id="dashboard-analyze-btn"
          onClick={() => navigate('/analyze')}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <Search size={16} />
          <span>Start Analysis</span>
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Analyses" value={total.toLocaleString()} subtitle="All time" icon={BarChart3} color="cyan" trend={12} />
        <StatCard title="Fake Detected" value={distribution.Fake || 0} subtitle="Content flagged as fake" icon={Shield} color="red" trend={-5} />
        <StatCard title="Verified" value={distribution.Verified || 0} subtitle="Content confirmed true" icon={TrendingUp} color="green" />
        <StatCard title="Today" value={stats?.analyses?.today || 3} subtitle="Analyses today" icon={Clock} color="purple" />
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verdict Distribution Pie */}
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-neon-cyan" />
            Verdict Distribution
          </h3>

          {loading ? (
            <div className="h-48 shimmer rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map(({ name, color }) => (
                    <Cell key={name} fill={color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f0f1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          <div className="space-y-2 mt-2">
            {Object.entries(distribution).map(([label, count]) => count > 0 && (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: VERDICT_COLORS[label] }} />
                  <span className="text-slate-400">{label}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-neon-purple" />
              Recent Analyses
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-slate-400 hover:text-neon-cyan transition-colors flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {analyses.slice(0, 5).map((a, i) => (
              <motion.div
                key={a._id}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
                whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/report/${a._id}`)}
              >
                <VerdictBadge verdict={a.verdict} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">
                    {a.originalContent?.headline || 'Direct text analysis'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: VERDICT_COLORS[a.verdict] }}>
                    {a.confidence}%
                  </p>
                  <p className="text-xs text-slate-600">confidence</p>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => navigate('/analyze')}
            className="w-full mt-4 p-3 rounded-xl text-sm text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all text-center"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            + New Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
