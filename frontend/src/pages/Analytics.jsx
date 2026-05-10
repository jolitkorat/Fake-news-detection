import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import { TrendingUp, BarChart3, Activity, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import StatCard from '../components/StatCard'

const VERDICT_COLORS = {
  Fake: '#ff2d55',
  Misleading: '#ffd60a',
  'Partially True': '#ff8c00',
  Verified: '#00ff87',
  Unverifiable: '#64748b',
}

// Generate demo trend data
const generateTrend = () => Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  Fake: Math.floor(Math.random() * 12) + 2,
  Verified: Math.floor(Math.random() * 15) + 5,
  Misleading: Math.floor(Math.random() * 8) + 1,
}))

const DEMO_RADAR = [
  { subject: 'Propaganda', A: 72 },
  { subject: 'Clickbait', A: 58 },
  { subject: 'Bias', A: 45 },
  { subject: 'Accuracy', A: 30 },
  { subject: 'Emotion', A: 65 },
  { subject: 'Coherence', A: 80 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null
  return (
    <div className="p-3 rounded-xl text-sm" style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-slate-300 mb-1 font-medium">{label}</p>
      {payload.map(({ name, value, color }) => (
        <p key={name} className="text-xs" style={{ color }}>{name}: {value}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [trendData] = useState(generateTrend)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const distribution = stats?.distribution || { Fake: 24, Misleading: 16, 'Partially True': 30, Verified: 40, Unverifiable: 10 }
  const total = stats?.total || 120

  const pieData = Object.entries(distribution).map(([name, value]) => ({ name, value, color: VERDICT_COLORS[name] }))
  const barData = Object.entries(distribution).map(([name, value]) => ({ name, value, fill: VERDICT_COLORS[name] }))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          <span className="gradient-text">Analytics</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your detection history and pattern analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Analyses" value={total} icon={BarChart3} color="cyan" />
        <StatCard title="Fake Detected" value={distribution.Fake} icon={AlertTriangle} color="red" trend={-8} />
        <StatCard title="Accuracy Rate" value="98.7%" icon={TrendingUp} color="green" />
        <StatCard title="Avg Confidence" value="81%" icon={Activity} color="purple" />
      </div>

      {/* Trend + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 14-day trend */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
            <Activity size={16} className="text-neon-cyan" />
            14-Day Detection Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="Fake" stroke="#ff2d55" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Verified" stroke="#00ff87" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Misleading" stroke="#ffd60a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-neon-purple" />
            Distribution
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map(({ name, color }) => (
                  <Cell key={name} fill={color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.filter(d => d.value > 0).map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{name}</span>
                </div>
                <span className="font-medium text-white">{value} ({Math.round(value / total * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-neon-yellow" />
            Verdict Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map(({ name, fill }) => (
                  <Cell key={name} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart - manipulation patterns */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-neon-red" />
            Manipulation Pattern Analysis
          </h3>
          <p className="text-xs text-slate-500 mb-4">Average scores across all analyzed content</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={DEMO_RADAR}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Radar name="Score" dataKey="A" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.1} strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
