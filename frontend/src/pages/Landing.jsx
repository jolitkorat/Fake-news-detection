import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, BarChart3, Globe, Lock, ChevronRight, Star, Check, ArrowRight } from 'lucide-react'

const features = [
  { icon: Shield, title: 'AI-Powered Detection', desc: 'GPT-4o analyzes content for misinformation patterns, propaganda, and logical inconsistencies.', color: '#7c3aed' },
  { icon: Eye, title: 'Multi-Source Fact Check', desc: 'Cross-references with Reuters, BBC, Snopes, FactCheck.org and Google Fact Check API.', color: '#00f5ff' },
  { icon: Zap, title: 'Real-Time Analysis', desc: 'Get results in seconds. Analyze text, URLs, or batch process via REST API.', color: '#00ff87' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track patterns, trending fake news, and your organization\'s detection metrics.', color: '#ffd60a' },
  { icon: Globe, title: 'Multi-Language Support', desc: 'Analyze content in 50+ languages with language-specific NLP models.', color: '#ff8c00' },
  { icon: Lock, title: 'Enterprise Security', desc: 'JWT auth, API keys, rate limiting, HMAC webhooks, and SOC2-ready architecture.', color: '#ff2d55' },
]

const stats = [
  { value: '98.7%', label: 'Detection Accuracy' },
  { value: '2.3s', label: 'Avg Response Time' },
  { value: '50M+', label: 'Articles Analyzed' },
  { value: '150+', label: 'Countries Served' },
]

const plans = [
  {
    name: 'Free', price: '$0', period: '/month',
    features: ['10 analyses/day', 'Basic verdict', 'API access', '30-day history'],
    cta: 'Get Started', highlighted: false,
  },
  {
    name: 'Pro', price: '$29', period: '/month',
    features: ['200 analyses/day', 'Full NLP analysis', 'Bulk processing (50)', 'Webhooks', '1-year history', 'Priority support'],
    cta: 'Start Pro Trial', highlighted: true,
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    features: ['Unlimited analyses', 'Custom AI models', 'Dedicated infrastructure', 'SLA guarantee', 'SSO & RBAC', 'On-premise option'],
    cta: 'Contact Sales', highlighted: false,
  },
]

const FadeInUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
)

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#080812] overflow-x-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow"
             style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow"
             style={{ background: 'radial-gradient(circle, #00f5ff, transparent)', animationDelay: '1s' }} />
      </div>

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5"
           style={{ background: 'rgba(8, 8, 18, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <path d="M18 3L3 12V24L18 33L33 24V12L18 3Z" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="18" cy="18" r="5" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-white">TruthLens <span className="gradient-text">AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/docs" className="hover:text-white transition-colors">API Docs</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm hidden sm:block">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">
            <span>Get Started</span>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-32">
        {/* Badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-medium"
          style={{ background: 'rgba(0, 245, 255, 0.08)', border: '1px solid rgba(0, 245, 255, 0.2)', color: '#00f5ff' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Zap size={12} />
          <span>Powered by GPT-4o + Advanced NLP</span>
          <span className="px-2 py-0.5 bg-cyan-500/20 rounded-full">NEW</span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-black leading-tight max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Detect <span className="gradient-text">Fake News</span> in
          <br />Seconds with AI
        </motion.h1>

        <motion.p
          className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          TruthLens AI analyzes news articles, URLs, and text for misinformation using
          advanced AI models, NLP, and cross-referencing with trusted fact-checking sources.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <button onClick={() => navigate('/register')} className="btn-primary group text-base px-8 py-4">
            <span className="flex items-center gap-2">
              Start Analyzing Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button onClick={() => navigate('/docs')} className="btn-secondary text-base px-8 py-4">
            View API Docs
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black gradient-text mb-1">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          className="mt-20 w-full max-w-4xl glass-card p-6 text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-slate-500 font-mono ml-2">POST /api/analyze</span>
          </div>
          <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`{
  "status": "Fake",
  "confidence": 92,
  "reasoning": [
    "Headline exaggerates actual facts by 340%",
    "Source domain registered 3 days ago",
    "Contradicts 7 verified Reuters reports",
    "High propaganda score (87/100)"
  ],
  "trusted_sources": [
    { "name": "Reuters", "url": "reuters.com/fact-check" },
    { "name": "BBC Verify", "url": "bbc.com/news/reality_check" }
  ]
}`}
          </pre>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-24">
        <FadeInUp className="text-center mb-16">
          <p className="text-neon-cyan text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-bold text-white mb-4">Intelligence-Grade Verification</h2>
          <p className="text-slate-400 max-w-xl mx-auto">A complete toolkit for detecting misinformation at scale.</p>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <FadeInUp key={title} delay={i * 0.1}>
              <div className="glass-card p-6 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <FadeInUp className="text-center mb-16">
          <p className="text-neon-purple text-sm font-semibold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl font-bold text-white">AI Analysis Pipeline</h2>
        </FadeInUp>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
          {['Submit Content', 'NLP Processing', 'AI Analysis', 'Fact Checking', 'Get Results'].map((step, i) => (
            <React.Fragment key={step}>
              <FadeInUp delay={i * 0.15} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-sm font-bold"
                     style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)', boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' }}>
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-white">{step}</p>
              </FadeInUp>
              {i < 4 && (
                <ChevronRight size={20} className="text-slate-600 hidden md:block flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative z-10 px-6 md:px-12 py-24">
        <FadeInUp className="text-center mb-16">
          <p className="text-neon-green text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400">Start free. Scale as you grow.</p>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(({ name, price, period, features: planFeatures, cta, highlighted }, i) => (
            <FadeInUp key={name} delay={i * 0.1}>
              <div className={`glass-card p-8 h-full flex flex-col relative ${highlighted ? 'border-purple-500/50' : ''}`}
                   style={highlighted ? { boxShadow: '0 0 30px rgba(124, 58, 237, 0.2), 0 8px 32px rgba(0,0,0,0.3)' } : {}}>
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                       style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)', color: 'white' }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm text-slate-400 font-medium">{name}</p>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-black text-white">{price}</span>
                    <span className="text-slate-400 text-sm mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {planFeatures.map(feat => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check size={14} className="text-green-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  <span>{cta}</span>
                </button>
              </div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <FadeInUp>
          <div className="max-w-3xl mx-auto glass-card p-12"
               style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 245, 255, 0.05))' }}>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Fight Misinformation?</h2>
            <p className="text-slate-400 mb-8">Join thousands of journalists, researchers, and organizations using TruthLens AI.</p>
            <button onClick={() => navigate('/register')} className="btn-primary text-base px-10 py-4">
              <span className="flex items-center gap-2">
                Start Free Today <ArrowRight size={18} />
              </span>
            </button>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TruthLens AI</span>
            <span>© 2025. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/docs" className="hover:text-white transition-colors">API Docs</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
