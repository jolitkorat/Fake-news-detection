import React from 'react'
import { motion } from 'framer-motion'

const VERDICT_CONFIG = {
  Fake: { color: '#ff2d55', bg: 'rgba(255, 45, 85, 0.1)', border: 'rgba(255, 45, 85, 0.3)', label: 'FAKE', className: 'badge-fake' },
  Misleading: { color: '#ffd60a', bg: 'rgba(255, 214, 10, 0.1)', border: 'rgba(255, 214, 10, 0.3)', label: 'MISLEADING', className: 'badge-misleading' },
  'Partially True': { color: '#ff8c00', bg: 'rgba(255, 140, 0, 0.1)', border: 'rgba(255, 140, 0, 0.3)', label: 'PARTIALLY TRUE', className: 'badge-partial' },
  Verified: { color: '#00ff87', bg: 'rgba(0, 255, 135, 0.1)', border: 'rgba(0, 255, 135, 0.3)', label: 'VERIFIED', className: 'badge-verified' },
  Unverifiable: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)', label: 'UNVERIFIABLE', className: 'badge-unverifiable' },
}

export function VerdictBadge({ verdict, size = 'md' }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.Unverifiable
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-4 py-1.5' : 'text-xs px-3 py-1'

  return (
    <span
      className={`${sizeClass} rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1.5`}
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}`, boxShadow: `0 0 10px ${config.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: config.color, boxShadow: `0 0 5px ${config.color}` }} />
      {config.label}
    </span>
  )
}

export function VerdictCard({ result }) {
  const config = VERDICT_CONFIG[result?.status || result?.verdict] || VERDICT_CONFIG.Unverifiable
  const verdict = result?.status || result?.verdict

  // Confidence gauge arc
  const confidence = result?.confidence || 0
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ borderColor: `${config.color}30` }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Confidence Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
            {/* Progress circle */}
            <motion.circle
              cx="80" cy="80" r={radius}
              fill="none"
              stroke={config.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              transform="rotate(-90 80 80)"
              style={{ filter: `drop-shadow(0 0 8px ${config.color}80)` }}
            />
            {/* Glow ring */}
            <circle cx="80" cy="80" r={radius} fill="none" stroke={config.color} strokeWidth="1" opacity="0.1" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold"
              style={{ color: config.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {confidence}%
            </motion.span>
            <span className="text-xs text-slate-500 mt-1">Confidence</span>
          </div>
        </div>

        {/* Verdict Info */}
        <div className="flex-1">
          <VerdictBadge verdict={verdict} size="lg" />
          <h2 className="text-2xl font-bold text-white mt-3 mb-2">
            {verdict === 'Fake' && 'This content appears to be Fake'}
            {verdict === 'Misleading' && 'This content is Misleading'}
            {verdict === 'Partially True' && 'This content is Partially True'}
            {verdict === 'Verified' && 'This content appears Verified'}
            {verdict === 'Unverifiable' && 'Content is Unverifiable'}
          </h2>
          {result?.summary && (
            <p className="text-slate-400 text-sm leading-relaxed">{result.summary}</p>
          )}
        </div>
      </div>

      {/* Reasoning */}
      {result?.reasoning?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full" style={{ background: config.color }} />
            AI Reasoning
          </h3>
          <div className="space-y-2.5">
            {result.reasoning.map((reason, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${config.color}20`, color: config.color }}>
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trusted Sources */}
      {result?.trusted_sources?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-cyan-400" />
            Trusted Sources
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.trusted_sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: 'rgba(0, 245, 255, 0.05)',
                  border: '1px solid rgba(0, 245, 255, 0.15)',
                  color: '#00f5ff',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {src.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* NLP Scores */}
      {result?.nlp_analysis && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Propaganda', value: result.nlp_analysis.propagandaScore || result.nlp_analysis.propaganda_score || 0, color: '#ff2d55' },
            { label: 'Clickbait', value: result.nlp_analysis.clickbaitScore || result.nlp_analysis.clickbait_score || 0, color: '#ffd60a' },
            { label: 'Bias', value: result.nlp_analysis.biasScore || result.nlp_analysis.bias_score || 0, color: '#ff8c00' },
            { label: 'Headline Match', value: result.nlp_analysis.headlineConsistency || result.nlp_analysis.headline_consistency || 100, color: '#00ff87' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs text-slate-500 mb-2">{label}</p>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <p className="text-xs font-bold mt-1" style={{ color }}>{value}%</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
