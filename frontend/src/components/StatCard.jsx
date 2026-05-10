import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend, className = '' }) {
  const colors = {
    cyan: { text: '#00f5ff', bg: 'rgba(0, 245, 255, 0.1)', border: 'rgba(0, 245, 255, 0.2)' },
    purple: { text: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.2)' },
    green: { text: '#00ff87', bg: 'rgba(0, 255, 135, 0.1)', border: 'rgba(0, 255, 135, 0.2)' },
    red: { text: '#ff2d55', bg: 'rgba(255, 45, 85, 0.1)', border: 'rgba(255, 45, 85, 0.2)' },
    yellow: { text: '#ffd60a', bg: 'rgba(255, 214, 10, 0.1)', border: 'rgba(255, 214, 10, 0.2)' },
  }

  const c = colors[color] || colors.cyan

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-500'
            }`}>
              {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl flex-shrink-0" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <Icon size={22} style={{ color: c.text }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
