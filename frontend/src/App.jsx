import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Analytics from './pages/Analytics'
import History from './pages/History'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import ApiDocs from './pages/ApiDocs'
import ReportPage from './pages/ReportPage'
import FakeNewsChecker from './pages/FakeNewsChecker'

import DashboardLayout from './components/DashboardLayout'
import LoadingScreen from './components/LoadingScreen'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/docs" element={<ApiDocs />} />

      {/* Protected Dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
      <Route path="/analyze" element={<PrivateRoute><DashboardLayout><Analyzer /></DashboardLayout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><DashboardLayout><Analytics /></DashboardLayout></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><DashboardLayout><History /></DashboardLayout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><DashboardLayout><Settings /></DashboardLayout></PrivateRoute>} />
      <Route path="/report/:id" element={<PrivateRoute><DashboardLayout><ReportPage /></DashboardLayout></PrivateRoute>} />
      <Route path="/fake-news-checker" element={<PrivateRoute><DashboardLayout><FakeNewsChecker /></DashboardLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><DashboardLayout><Admin /></DashboardLayout></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
