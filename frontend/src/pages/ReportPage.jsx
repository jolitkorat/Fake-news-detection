import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { VerdictCard } from '../components/VerdictCard'
import api from '../services/api'

export default function ReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/report/${id}`)
      .then(res => setReport(res.data.data))
      .catch(err => setError(err.response?.data?.error || 'Report not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <Loader2 size={32} className="animate-spin text-neon-cyan" />
    </div>
  )

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={() => navigate('/history')} className="btn-secondary">Back to History</button>
    </div>
  )

  // Adapt report format to VerdictCard format
  const cardResult = {
    status: report.verdict,
    confidence: report.confidence,
    reasoning: report.reasoning,
    trusted_sources: report.trustedSources,
    nlp_analysis: report.nlpAnalysis ? {
      propagandaScore: report.nlpAnalysis.propagandaScore,
      clickbaitScore: report.nlpAnalysis.clickbaitScore,
      biasScore: report.nlpAnalysis.biasScore,
      headlineConsistency: report.nlpAnalysis.headlineConsistency,
    } : null,
    fact_checks: report.factCheckResults,
    summary: `Analyzed on ${new Date(report.createdAt).toLocaleString()} via ${report.inputType} input. Processing time: ${report.processingTime}ms.`,
    processing_time_ms: report.processingTime,
    model: report.model,
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to History
        </button>
        <h1 className="text-2xl font-bold text-white">
          <span className="gradient-text">Report</span>
          <span className="text-sm font-normal text-slate-500 ml-3 font-mono">#{id.slice(-8)}</span>
        </h1>
        {report.originalContent?.headline && (
          <p className="text-slate-400 text-sm mt-1 truncate">{report.originalContent.headline}</p>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <VerdictCard result={cardResult} />

        {/* Original Content Preview */}
        {(report.originalContent?.url || report.originalContent?.body) && (
          <div className="glass-card p-6 mt-6">
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Analyzed Content</h3>
            {report.originalContent.url && (
              <div className="mb-3">
                <span className="text-xs text-slate-500">URL: </span>
                <a href={report.originalContent.url} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-cyan-400 hover:underline break-all">
                  {report.originalContent.url}
                </a>
              </div>
            )}
            {report.originalContent.body && (
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-5">
                {report.originalContent.body}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
