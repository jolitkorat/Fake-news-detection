import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/analyze', auth: 'JWT or API Key',
    description: 'Analyze a single news article for authenticity',
    request: `{
  "text": "Article content goes here...",
  "headline": "Optional article headline",
  "url": "https://example.com/article"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "65f4b2c3d4e5f6a7b8c9d0e1",
    "status": "Fake",
    "confidence": 92,
    "reasoning": [
      "Headline exaggerates facts by 340%",
      "Source domain registered 3 days ago",
      "Contradicts 7 verified Reuters reports"
    ],
    "trusted_sources": [
      { "name": "Reuters", "url": "reuters.com/fact-check", "relevance": 0.9 },
      { "name": "BBC Verify", "url": "bbc.com/news/reality_check", "relevance": 0.85 }
    ],
    "nlp_analysis": {
      "sentiment": { "label": "negative", "score": -0.82 },
      "propaganda_score": 87,
      "clickbait_score": 74,
      "bias_score": 65,
      "headline_consistency": 23
    },
    "processing_time_ms": 2340,
    "analyzed_at": "2025-01-15T10:30:00Z"
  }
}`,
  },
  {
    method: 'POST', path: '/api/scrape', auth: 'JWT or API Key',
    description: 'Scrape article headline and body from a URL without analyzing it',
    request: `{
  "url": "https://example.com/article",
  "headline": "Optional override headline"
}`,
    response: `{
  "success": true,
  "data": {
    "headline": "Article title extracted from page",
    "body": "Full article text extracted from the page",
    "author": "Author name",
    "publishedAt": "2025-01-15T10:30:00Z",
    "language": "en",
    "url": "https://example.com/article"
  }
}`,
  },
  {
    method: 'POST', path: '/api/bulk-analyze', auth: 'API Key only',
    description: 'Analyze multiple articles in a single request (Pro/Enterprise)',
    request: `{
  "articles": [
    { "id": "custom-id-1", "text": "First article...", "headline": "Headline 1" },
    { "id": "custom-id-2", "url": "https://example.com/article2" },
    { "id": "custom-id-3", "text": "Third article..." }
  ]
}`,
    response: `{
  "success": true,
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "total": 3,
    "processed": 3,
    "results": [
      { "id": "custom-id-1", "report_id": "65f4b...", "status": "Verified", "confidence": 88 },
      { "id": "custom-id-2", "report_id": "65f4c...", "status": "Misleading", "confidence": 71 },
      { "id": "custom-id-3", "report_id": "65f4d...", "status": "Fake", "confidence": 95 }
    ]
  }
}`,
  },
  {
    method: 'GET', path: '/api/report/:id', auth: 'JWT or API Key',
    description: 'Retrieve a full analysis report by ID',
    request: null,
    response: `{
  "success": true,
  "data": {
    "_id": "65f4b2c3d4e5f6a7b8c9d0e1",
    "verdict": "Fake",
    "confidence": 92,
    "reasoning": [...],
    "nlpAnalysis": { ... },
    "factCheckResults": [...],
    "createdAt": "2025-01-15T10:30:00Z"
  }
}`,
  },
  {
    method: 'POST', path: '/api/auth/register', auth: 'None',
    description: 'Create a new user account',
    request: `{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}`,
    response: `{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "...", "role": "user", "plan": "free" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}`,
  },
]

const METHOD_COLORS = {
  GET: { bg: 'rgba(0, 255, 135, 0.1)', text: '#00ff87', border: 'rgba(0, 255, 135, 0.3)' },
  POST: { bg: 'rgba(0, 180, 216, 0.1)', text: '#00b4d8', border: 'rgba(0, 180, 216, 0.3)' },
  DELETE: { bg: 'rgba(255, 45, 85, 0.1)', text: '#ff2d55', border: 'rgba(255, 45, 85, 0.3)' },
  PATCH: { bg: 'rgba(255, 214, 10, 0.1)', text: '#ffd60a', border: 'rgba(255, 214, 10, 0.3)' },
}

function CodeBlock({ code, lang = 'json' }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: '#050510', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <span className="text-xs font-mono text-slate-500">{lang}</span>
        <button onClick={copy} className="text-slate-500 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto"><code>{code}</code></pre>
    </div>
  )
}

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false)
  const mc = METHOD_COLORS[endpoint.method] || METHOD_COLORS.GET

  return (
    <div className="glass-card overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/2 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs font-bold px-2 py-1 rounded-md uppercase flex-shrink-0"
              style={{ background: mc.bg, color: mc.text, border: `1px solid ${mc.border}` }}>
          {endpoint.method}
        </span>
        <code className="text-sm text-white font-mono flex-1">{endpoint.path}</code>
        <span className="text-xs text-slate-500 hidden sm:block">{endpoint.auth}</span>
        {open ? <ChevronDown size={16} className="text-slate-500 flex-shrink-0" /> : <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />}
      </button>

      {open && (
        <motion.div
          className="px-5 pb-5 space-y-4 border-t border-white/5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <p className="text-sm text-slate-400 pt-4">{endpoint.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Auth:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{endpoint.auth}</span>
          </div>
          {endpoint.request && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Request Body</p>
              <CodeBlock code={endpoint.request} lang="json" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Response</p>
            <CodeBlock code={endpoint.response} lang="json" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

const CURL_EXAMPLE = `curl -X POST https://api.truthlens.ai/api/analyze \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: tl_live_your_api_key_here" \\
  -d '{
    "text": "Breaking news: Scientists discover...",
    "headline": "Optional headline for consistency check"
  }'`

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-[#080812] cyber-grid">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-medium"
               style={{ background: 'rgba(0, 245, 255, 0.08)', border: '1px solid rgba(0, 245, 255, 0.2)', color: '#00f5ff' }}>
            <Code2 size={12} />
            <span>REST API v1.0</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">
            <span className="gradient-text">TruthLens AI</span> API Docs
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Integrate fake news detection into your applications with our simple REST API.
            Supports JSON payloads and returns structured analysis results.
          </p>
        </motion.div>

        {/* Base URL */}
        <div className="glass-card p-5 mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Base URL</p>
          <code className="text-neon-cyan font-mono text-sm">https://api.truthlens.ai</code>
        </div>

        {/* Authentication */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-neon-cyan" />
            Authentication
          </h2>
          <div className="glass-card p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-white mb-1">JWT Token (Browser Apps)</p>
              <CodeBlock code={`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`} lang="http" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">API Key (3rd Party Apps)</p>
              <CodeBlock code={`x-api-key: tl_live_a1b2c3d4e5f6...`} lang="http" />
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-neon-purple" />
            Quick Start
          </h2>
          <CodeBlock code={CURL_EXAMPLE} lang="bash" />
        </section>

        {/* Endpoints */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-neon-green" />
            Endpoints
          </h2>
          <div className="space-y-3">
            {ENDPOINTS.map((ep, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EndpointCard endpoint={ep} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Rate Limits */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-neon-yellow" />
            Rate Limits
          </h2>
          <div className="glass-card overflow-hidden">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Analyses/Day</th>
                  <th>Bulk Size</th>
                  <th>History</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: 'Free', daily: '10', bulk: 'N/A', history: '30 days' },
                  { plan: 'Pro', daily: '200', bulk: '50/batch', history: '1 year' },
                  { plan: 'Enterprise', daily: 'Unlimited', bulk: '500/batch', history: 'Unlimited' },
                ].map(r => (
                  <tr key={r.plan}>
                    <td><span className="font-medium text-white">{r.plan}</span></td>
                    <td>{r.daily}</td>
                    <td>{r.bulk}</td>
                    <td>{r.history}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SDKs */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-neon-red" />
            Error Codes
          </h2>
          <div className="glass-card overflow-hidden">
            <table className="cyber-table">
              <thead>
                <tr><th>Code</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                {[
                  { code: 200, msg: 'Success' },
                  { code: 201, msg: 'Analysis created' },
                  { code: 400, msg: 'Bad request / validation error' },
                  { code: 401, msg: 'Authentication required or invalid' },
                  { code: 403, msg: 'Insufficient permissions' },
                  { code: 429, msg: 'Rate limit exceeded' },
                  { code: 500, msg: 'Internal server error' },
                ].map(e => (
                  <tr key={e.code}>
                    <td><code className="text-xs font-mono text-neon-cyan">{e.code}</code></td>
                    <td className="text-sm">{e.msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
