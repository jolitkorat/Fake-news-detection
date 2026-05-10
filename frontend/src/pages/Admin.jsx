import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BarChart3, Shield, Search, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatCard from '../components/StatCard'
import { VerdictBadge } from '../components/VerdictCard'
import api from '../services/api'

const PLAN_COLORS = { free: '#64748b', pro: '#00f5ff', enterprise: '#7c3aed' }

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users?limit=20'),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data.data)
      setUsers(usersRes.data.data.users)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const distribution = stats?.verdictDistribution || { Fake: 35, Misleading: 22, 'Partially True': 45, Verified: 78, Unverifiable: 15 }
  const barData = Object.entries(distribution).map(([name, value]) => ({
    name: name.split(' ')[0],
    value,
    fill: { Fake: '#ff2d55', Misleading: '#ffd60a', Partially: '#ff8c00', Verified: '#00ff87', Unverifiable: '#64748b' }[name.split(' ')[0]],
  }))

  const filteredUsers = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = async (userId, role) => {
    await api.patch(`/admin/users/${userId}`, { role })
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u))
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user? This is irreversible.')) return
    await api.delete(`/admin/users/${userId}`)
    setUsers(prev => prev.filter(u => u._id !== userId))
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'rgba(255, 45, 85, 0.15)', border: '1px solid rgba(255, 45, 85, 0.3)' }}>
            <Shield size={16} style={{ color: '#ff2d55' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white"><span className="gradient-text">Admin Panel</span></h1>
            <p className="text-slate-400 text-sm">System overview and user management</p>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={stats?.users?.total || 0} icon={Users} color="cyan" />
        <StatCard title="Total Analyses" value={stats?.analyses?.total || 0} icon={BarChart3} color="purple" />
        <StatCard title="Today" value={stats?.analyses?.today || 0} subtitle="Analyses today" icon={BarChart3} color="green" />
        <StatCard title="Fake Detected" value={distribution.Fake || 0} icon={Shield} color="red" />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Verdict chart */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">System-wide Verdict Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map(({ name, fill }) => <Cell key={name} fill={fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {(stats?.recentActivity || []).slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <VerdictBadge verdict={a.verdict} size="sm" />
                <span className="text-slate-400 flex-1 truncate">{a.originalContent?.headline || 'Text analysis'}</span>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {Math.floor((Date.now() - new Date(a.createdAt)) / 60000)}m ago
                </span>
              </div>
            ))}
            {!stats?.recentActivity?.length && (
              <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users size={16} className="text-neon-cyan" />
            User Management
          </h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="admin-search-users"
              type="text"
              className="input-cyber pl-9 py-2 text-sm w-64"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-14 shimmer rounded-xl" />)}
          </div>
        ) : (
          <table className="cyber-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Analyses</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #7c3aed, #00b4d8)' }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-medium">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border outline-none cursor-pointer"
                      style={{ background: '#0f0f1a', borderColor: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                    </select>
                  </td>
                  <td>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                          style={{ color: PLAN_COLORS[u.plan], background: `${PLAN_COLORS[u.plan]}15`, border: `1px solid ${PLAN_COLORS[u.plan]}30` }}>
                      {u.plan}
                    </span>
                  </td>
                  <td><span className="text-slate-300 text-sm">{u.analysisCount || 0}</span></td>
                  <td><span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <button onClick={() => handleDeleteUser(u._id)}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-all">
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
