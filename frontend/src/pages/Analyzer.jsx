import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Link2, FileText, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import { VerdictCard } from '../components/VerdictCard'
import api from '../services/api'

const TABS = [
  { id: 'text', label: 'Text Input', icon: FileText },
  { id: 'url', label: 'URL / Article', icon: Link2 },
]

const SAMPLE_FAKE = `BREAKING: Scientists BANNED from revealing the truth about 5G towers and COVID vaccines connection! Government insiders confirm massive cover-up as thousands die silently. Share before this gets deleted! The mainstream media refuses to cover this explosive story that proves everything they told you was a lie. Anonymous sources from deep inside the CDC have leaked documents showing...`

const SAMPLE_REAL = `According to a new study published in the New England Journal of Medicine, researchers from Harvard Medical School found that regular moderate exercise reduces the risk of cardiovascular disease by approximately 35%. The study, which followed 45,000 participants over 10 years, used rigorous double-blind methodology. Lead researcher Dr. Sarah Chen stated that "the evidence is compelling and consistent across age groups."`

export default function Analyzer() {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [headline, setHeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeError, setScrapeError] = useState('')
  const [scrapedData, setScrapedData] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const payload = activeTab === 'url'
        ? { url, headline: headline || undefined }
        : { text, headline: headline || undefined }

      const res = await api.post('/analyze', payload)
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async () => {
    setScrapeError('')
    setScrapedData(null)

    if (!url.trim().startsWith('http')) {
      setScrapeError('Enter a valid URL to scrape.')
      return
    }

    setScrapeLoading(true)

    try {
      const res = await api.post('/scrape', { url, headline: headline || undefined })
      const data = res.data.data
      setScrapedData(data)
      if (!headline && data.headline) {
        setHeadline(data.headline)
      }
    } catch (err) {
      setScrapeError(err.response?.data?.error || 'Failed to scrape article content.')
    } finally {
      setScrapeLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError('')
    setText('')
    setUrl('')
    setHeadline('')
  }

  const isValid = activeTab === 'url' ? url.trim().startsWith('http') : text.trim().length >= 50

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          <span className="gradient-text">AI Analyzer</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Submit news content for instant AI-powered authenticity analysis</p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  id={`tab-${id}`}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'text-neon-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={activeTab === id ? {
                    background: 'rgba(0, 245, 255, 0.1)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div className="glass-card p-6 space-y-5">
              {/* Headline (optional) */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">
                  Headline <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  id="analyzer-headline"
                  type="text"
                  className="input-cyber"
                  placeholder="Enter article headline for better accuracy..."
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                />
              </div>

              {/* URL Input */}
              {activeTab === 'url' && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-2">Article URL</label>
                  <div className="relative">
                    <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="analyzer-url"
                      type="url"
                      className="input-cyber pl-10"
                      placeholder="https://example.com/article..."
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleScrape}
                      disabled={scrapeLoading || !url.trim().startsWith('http')}
                      className="btn-secondary px-4 py-3 rounded-xl w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {scrapeLoading ? 'Fetching article...' : 'Fetch Article'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (scrapedData?.headline) setHeadline(scrapedData.headline)
                      }}
                      disabled={!scrapedData?.headline}
                      className="btn-secondary px-4 py-3 rounded-xl w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Use Scraped Headline
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Scrape the article first to auto-fill the headline and preview content. Your backend may use the configured Anakin scraper for best URL extraction.
                  </p>
                  {scrapeError && (
                    <div className="mt-3 text-sm text-red-400">{scrapeError}</div>
                  )}
                  {scrapeLoading && !scrapedData && (
                    <div className="mt-3 text-sm text-slate-400">Contacting backend scraper and extracting article content...</div>
                  )}
                  {scrapedData && (
                    <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Article preview</p>
                      <h3 className="text-sm text-white font-semibold">{scrapedData.headline || 'Untitled article'}</h3>
                      <p className="text-xs text-slate-500 mb-3">
                        {scrapedData.author ? `${scrapedData.author} · ` : ''}
                        {scrapedData.publishedAt ? new Date(scrapedData.publishedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                      <p className="text-sm text-slate-300 line-clamp-4">{scrapedData.body || 'No article body found.'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input */}
              {activeTab === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Article Content</label>
                    <span className={`text-xs ${text.length >= 50 ? 'text-green-400' : 'text-slate-500'}`}>
                      {text.length} chars {text.length < 50 ? `(min 50)` : '✓'}
                    </span>
                  </div>
                  <textarea
                    id="analyzer-text"
                    className="input-cyber resize-none"
                    rows={10}
                    placeholder="Paste your news article content here..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                  />
                  {/* Sample text buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setText(SAMPLE_FAKE)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded bg-red-500/5 border border-red-500/10"
                    >
                      Load Fake Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => setText(SAMPLE_REAL)}
                      className="text-xs text-green-400 hover:text-green-300 transition-colors px-2 py-1 rounded bg-green-500/5 border border-green-500/10"
                    >
                      Load Real Sample
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(255, 45, 85, 0.1)', border: '1px solid rgba(255, 45, 85, 0.2)', color: '#ff2d55' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {/* Analyze Button */}
              <button
                id="analyze-submit"
                onClick={handleAnalyze}
                disabled={loading || !isValid}
                className="btn-primary w-full py-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Analyze Content
                    </>
                  )}
                </span>
              </button>

              {/* Loading indicators */}
              {loading && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {['Preprocessing content...', 'Running NLP analysis...', 'Querying AI model...', 'Cross-checking sources...'].map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-2 text-xs text-slate-500"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.4 }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      {step}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 rounded-xl text-sm text-slate-500"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-medium text-slate-400 mb-2">💡 Tips for best results:</p>
              <ul className="space-y-1 text-xs">
                <li>• Include both headline and body for headline consistency checking</li>
                <li>• Longer articles (500+ words) yield more accurate analysis</li>
                <li>• URL analysis automatically extracts article content</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Reset button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                id="analyzer-reset"
                onClick={reset}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/10 hover:border-white/20"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <RotateCcw size={14} />
                New Analysis
              </button>
              <div className="text-xs text-slate-500">
                Processed in {result.processing_time_ms}ms · Model: {result.model || 'gpt-4o'}
              </div>
            </div>

            <VerdictCard result={result} />

            {/* Fact Checks */}
            {result.fact_checks?.length > 0 && (
              <motion.div
                className="glass-card p-6 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Search size={16} className="text-neon-yellow" />
                  Fact-Check Results
                </h3>
                <div className="space-y-3">
                  {result.fact_checks.map((fc, i) => (
                    <div key={i} className="p-3 rounded-xl"
                         style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p className="text-sm text-slate-300">{fc.claimText}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">{fc.rating}</span>
                        <span className="text-xs text-slate-500">— {fc.source}</span>
                        {fc.url && <a href={fc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">View →</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
