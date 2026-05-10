import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, Filter, Search } from 'lucide-react'
import { VerdictBadge } from '../components/VerdictCard'
import api from '../services/api'

const VERDICTS = ['All', 'Fake', 'Misleading', 'Partially True', 'Verified', 'Unverifiable']

const DEMO_HISTORY = [
  { _id: 'a1', originalContent: { headline: 'Government announces new climate policy' }, verdict: 'Verified', confidence: 89, createdAt: new Date(Date.now() - 3600000).toISOString(), inputType: 'text' },
  { _id: 'a2', originalContent: { headline: 'SHOCKING: Celebrity caught in massive scandal!' }, verdict: 'Fake', confidence: 95, createdAt: new Date(Date.now() - 86400000).toISOString(), inputType: 'url' },
  { _id: 'a3', originalContent: { headline: 'New vaccine side effects revealed' }, verdict: 'Misleading', confidence: 78, createdAt: new Date(Date.now() - 172800000).toISOString(), inputType: 'text' },
  { _id: 'a4', originalContent: { headline: 'Tech company reports record profits' }, verdict: 'Partially True', confidence: 62, createdAt: new Date(Date.now() - 259200000).toISOString(), inputType: 'url' },
  { _id: 'a5', originalContent: { headline: 'Scientists discover new species' }, verdict: 'Verified', confidence: 91, createdAt: new Date(Date.now() - 345600000).toISOString(), inputType: 'text' },
]

export default function History() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState(DEMO_HISTORY)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 20 })
        if (filter !== 'All') params.append('verdict', filter)
        const res = await api.get(`/history?${params}`)
        if (res.data.data.analyses.length > 0) {
          setAnalyses(res.data.data.analyses)
          setTotalPages(res.data.data.pagination.pages)
        }
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [page, filter])

  const filtered = analyses.filter(a =>
    !search || a.originalContent?.headline?.toLowerCase().includes(search.toLowerCase())
  )

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          <span className="gradient-text">History</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your analysis history and previous reports</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="history-search"
            type="text"
            className="input-cyber pl-9 text-sm py-2"
            placeholder="Search by headline..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-500" />
          {VERDICTS.map(v => (
            <button
              key={v}
              id={`filter-${v}`}
              onClick={() => { setFilter(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === v
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 shimmer rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Clock size={40} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No analyses found</p>
            <button onClick={() => navigate('/analyze')} className="btn-primary mt-4 text-sm">
              <span>Start Analyzing</span>
            </button>
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Verdict</th>
                <th>Content</th>
                <th>Type</th>
                <th>Confidence</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <motion.tr
                  key={a._id}
                  className="cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/report/${a._id}`)}
                >
                  <td><VerdictBadge verdict={a.verdict} size="sm" /></td>
                  <td>
                    <span className="text-slate-200 text-sm line-clamp-1 max-w-xs block">
                      {a.originalContent?.headline || 'Text analysis'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-500 uppercase">
                      {a.inputType}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-16">
                        <div className="progress-fill" style={{
                          width: `${a.confidence}%`,
                          background: a.confidence > 80 ? '#00ff87' : a.confidence > 60 ? '#ffd60a' : '#ff2d55'
                        }} />
                      </div>
                      <span className="text-xs text-slate-300 font-medium">{a.confidence}%</span>
                    </div>
                  </td>
                  <td><span className="text-xs text-slate-500">{timeAgo(a.createdAt)}</span></td>
                  <td><ChevronRight size={14} className="text-slate-600" /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm transition-all ${
                  page === p
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
