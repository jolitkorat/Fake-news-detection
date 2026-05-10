// Frontend integration example for fake news detection
// Add this to your React component (e.g., src/pages/FakeNewsChecker.jsx)

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../services/api'

export default function FakeNewsChecker() {
  const [newsText, setNewsText] = useState('')
  const [headline, setHeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!newsText.trim() || newsText.trim().length < 20) {
      setError('Please enter at least 20 characters of news text')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await api.post('/news/check-fake-news', {
        text: newsText,
        headline: headline || undefined,
      })

      setResult(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze news')
    } finally {
      setLoading(false)
    }
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Fake':
        return { bg: 'rgba(255, 45, 85, 0.1)', border: 'rgba(255, 45, 85, 0.3)', text: '#ff2d55' }
      case 'Misleading':
        return { bg: 'rgba(255, 159, 64, 0.1)', border: 'rgba(255, 159, 85, 0.3)', text: '#ff9f40' }
      case 'Partially True':
        return { bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)', text: '#ffc107' }
      case 'Verified':
        return { bg: 'rgba(76, 175, 80, 0.1)', border: 'rgba(76, 175, 80, 0.3)', text: '#4caf50' }
      default:
        return { bg: 'rgba(158, 158, 158, 0.1)', border: 'rgba(158, 158, 158, 0.3)', text: '#9e9e9e' }
    }
  }

  const getVerdictIcon = (verdict) => {
    switch (verdict) {
      case 'Fake':
        return <AlertCircle className="text-red-500" size={24} />
      case 'Misleading':
        return <AlertTriangle className="text-orange-500" size={24} />
      case 'Verified':
        return <CheckCircle className="text-green-500" size={24} />
      default:
        return <AlertCircle className="text-gray-500" size={24} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Fake News Detector</h1>
          <p className="text-slate-400">Powered by Anakin Search API</p>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Headline <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter article headline..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              News Content <span className="text-slate-500">*</span>
            </label>
            <textarea
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              placeholder="Paste the news content to analyze (minimum 20 characters)..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <p className="mt-2 text-xs text-slate-500">
              {newsText.length} characters (minimum 20 required)
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || newsText.trim().length < 20}
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {loading ? 'Analyzing...' : 'Analyze News'}
            {!loading && <Search size={18} />}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Verdict Card */}
            <div
              className="p-6 rounded-xl border-2"
              style={{
                background: getVerdictColor(result.verdict).bg,
                borderColor: getVerdictColor(result.verdict).border,
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                {getVerdictIcon(result.verdict)}
                <div>
                  <p className="text-sm text-slate-400">Verdict</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: getVerdictColor(result.verdict).text }}
                  >
                    {result.verdict}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="text-xl font-bold text-white">{result.confidence}%</p>
                </div>
                <div className="bg-white/10 p-3 rounded">
                  <p className="text-xs text-slate-400">Fake Score</p>
                  <p className="text-xl font-bold text-white">{result.scores.fakeScore}</p>
                </div>
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Credibility Score</p>
                <p className="text-2xl font-bold text-white">{result.scores.credibilityScore}</p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-1">Source Credibility</p>
                <p className="text-2xl font-bold text-white">{result.scores.sourceCredibilityScore}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <p className="text-sm font-semibold text-white mb-3">Analysis Reasoning</p>
              <ul className="space-y-2">
                {result.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Indicators */}
            {result.indicators && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">Sensational Keywords</p>
                  <p className="text-2xl font-bold text-orange-400">{result.indicators.sensational.count}</p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 mb-2">Propaganda Language</p>
                  <p className="text-2xl font-bold text-red-400">{result.indicators.propaganda.count}</p>
                </div>
              </div>
            )}

            {/* Source Analysis */}
            {result.sourceAnalysis && (
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <p className="text-sm font-semibold text-white mb-3">Source Analysis</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Trusted Sources Found</p>
                    <p className="text-lg font-bold text-green-400">{result.sourceAnalysis.trustedSourceCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Untrusted Sources</p>
                    <p className="text-lg font-bold text-red-400">{result.sourceAnalysis.untrustedSourceCount}</p>
                  </div>
                </div>

                {result.sourceAnalysis.sources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">Referenced Sources:</p>
                    {result.sourceAnalysis.sources.slice(0, 3).map((source, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded text-xs ${
                          source.isTrusted ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                        }`}
                      >
                        <p className="font-semibold">{source.domain}</p>
                        <p className="text-xs opacity-75 truncate">{source.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Processing Info */}
            <div className="text-center text-xs text-slate-500">
              <p>Analyzed in {result.processingTime}ms • Powered by Anakin Search API</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
