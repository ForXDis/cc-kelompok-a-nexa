import { useState, useEffect } from 'react'
import Login from './components/Login'
import TeacherDashboard from './components/TeacherDashboard'
import StudentDashboard from './components/StudentDashboard'
import theme from './styles/theme'
import {
  login, register, logout, getUser, getToken, checkHealth,
} from './services/api'

// Demo Mode - untuk testing tanpa backend
const DEMO_MODE = true

const DEMO_USERS = {
  guru: {
    id: 1,
    name: 'Demo Guru',
    email: 'guru@demo.com',
    role: 'guru',
  },
  murid: {
    id: 2,
    name: 'Demo Murid',
    email: 'murid@demo.com',
    role: 'murid',
  },
}

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDemoSelector, setShowDemoSelector] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(false)

  useEffect(() => {
    const token = getToken()
    const savedUser = getUser()
    if (token && savedUser) {
      setUser(savedUser)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    checkHealth().then(healthy => {
      setBackendAvailable(healthy)
      if (!healthy) {
        console.warn('Backend tidak tersedia - Demo mode tersedia')
      }
    })
  }, [])

  const handleLogin = async (data) => {
    if (!backendAvailable && DEMO_MODE) {
      // Demo login - pilih role
      setShowDemoSelector(true)
      return
    }
    const res = await login(data)
    setUser(res.user)
    setIsAuthenticated(true)
  }

  const handleDemoLogin = (role) => {
    const demoUser = DEMO_USERS[role]
    setUser(demoUser)
    setIsAuthenticated(true)
    setShowDemoSelector(false)
    // Simpan ke localStorage untuk persist
    localStorage.setItem('user', JSON.stringify(demoUser))
    localStorage.setItem('token', 'demo-token')
    localStorage.setItem('demo_mode', 'true')
  }

  const handleRegister = async (userData) => {
    if (!backendAvailable && DEMO_MODE) {
      // Demo register - langsung login sebagai role yang dipilih
      handleDemoLogin(userData.role || 'murid')
      return
    }
    await register(userData)
    await handleLogin({ email: userData.email, password: userData.password })
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('demo_mode')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Memuat...</p>
      </div>
    )
  }

  // Demo Role Selector Modal
  if (showDemoSelector) {
    return (
      <div style={styles.demoOverlay}>
        <div style={styles.demoModal}>
          <div style={styles.demoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h2 style={styles.demoTitle}>Mode Demo</h2>
          <p style={styles.demoSubtitle}>Backend tidak tersedia. Pilih role untuk melanjutkan:</p>
          <div style={styles.demoButtons}>
            <button 
              onClick={() => handleDemoLogin('guru')} 
              style={styles.demoBtnGuru}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              Masuk sebagai Pengajar
            </button>
            <button 
              onClick={() => handleDemoLogin('murid')} 
              style={styles.demoBtnMurid}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Masuk sebagai Pelajar
            </button>
          </div>
          <button 
            onClick={() => setShowDemoSelector(false)} 
            style={styles.demoBtnCancel}
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div>
        <Login onLogin={handleLogin} onRegister={handleRegister} />
        {DEMO_MODE && !backendAvailable && (
          <div style={styles.demoBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Backend tidak tersedia - Klik Login untuk masuk Demo Mode
          </div>
        )}
      </div>
    )
  }

  if (user?.role === 'guru') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  return <StudentDashboard user={user} onLogout={handleLogout} />
}

const styles = {
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.default,
    fontFamily: theme.typography.fontFamily,
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${theme.colors.border.light}`,
    borderTopColor: theme.colors.primary.main,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: theme.spacing[4],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.base,
  },
  demoOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing[4],
    fontFamily: theme.typography.fontFamily,
  },
  demoModal: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing[8],
    borderRadius: theme.borderRadius['2xl'],
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    boxShadow: theme.shadows.xl,
  },
  demoIcon: {
    width: '64px',
    height: '64px',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[4],
  },
  demoTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  demoSubtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
    fontSize: theme.typography.fontSize.base,
  },
  demoButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  demoBtnGuru: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    transition: `all ${theme.transitions.fast}`,
  },
  demoBtnMurid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    transition: `all ${theme.transitions.fast}`,
  },
  demoBtnCancel: {
    padding: `${theme.spacing[3]} ${theme.spacing[6]}`,
    backgroundColor: 'transparent',
    color: theme.colors.text.secondary,
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    fontSize: theme.typography.fontSize.sm,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
  },
  demoBanner: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme.colors.warning.main,
    color: theme.colors.text.primary,
    padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
    borderRadius: theme.borderRadius.lg,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
    boxShadow: theme.shadows.lg,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    fontFamily: theme.typography.fontFamily,
  },
}

export default App
