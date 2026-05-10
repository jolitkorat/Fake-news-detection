import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080812] cyber-grid">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 3L3 12V24L18 33L33 24V12L18 3Z" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M18 9L10 14V22L18 27L26 22V14L18 9Z" fill="rgba(255,255,255,0.2)"/>
              <circle cx="18" cy="18" r="4" fill="white"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}/>
        </div>

        <div className="text-center">
          <p className="gradient-text font-bold text-xl tracking-wider">TruthLens AI</p>
          <p className="text-slate-500 text-xs mt-1">Initializing systems...</p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #00f5ff)' }}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  )
}
