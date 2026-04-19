import { useState, useEffect } from "react"
import LoginPage from "./components/LoginPage"
import GuruDashboard from "./components/GuruDashboard"
import MuridDashboard from "./components/MuridDashboard"
import {
  login, register, logout, getUser, getToken, checkHealth,
} from "./services/api"

// Demo Mode - untuk testing tanpa backend
const DEMO_MODE = true

const DEMO_USERS = {
  guru: {
    id: 1,
    name: "Demo Guru",
    email: "guru@demo.com",
    role: "guru",
  },
  murid: {
    id: 2,
    name: "Demo Murid",
    email: "murid@demo.com",
    role: "murid",
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
        console.warn("Backend tidak tersedia - Demo mode tersedia")
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
    localStorage.setItem("user", JSON.stringify(demoUser))
    localStorage.setItem("token", "demo-token")
    localStorage.setItem("demo_mode", "true")
  }

  const handleRegister = async (userData) => {
    if (!backendAvailable && DEMO_MODE) {
      // Demo register - langsung login sebagai role yang dipilih
      handleDemoLogin(userData.role || "murid")
      return
    }
    await register(userData)
    await handleLogin({ email: userData.email, password: userData.password })
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem("demo_mode")
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading...</p>
      </div>
    )
  }

  // Demo Role Selector Modal
  if (showDemoSelector) {
    return (
      <div style={styles.demoOverlay}>
        <div style={styles.demoModal}>
          <h2 style={styles.demoTitle}>Demo Mode</h2>
          <p style={styles.demoSubtitle}>Backend tidak tersedia. Pilih role untuk demo:</p>
          <div style={styles.demoButtons}>
            <button 
              onClick={() => handleDemoLogin("guru")} 
              style={styles.demoBtnGuru}
            >
              Login sebagai Guru
            </button>
            <button 
              onClick={() => handleDemoLogin("murid")} 
              style={styles.demoBtnMurid}
            >
              Login sebagai Murid
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
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
        {DEMO_MODE && !backendAvailable && (
          <div style={styles.demoBanner}>
            Backend tidak tersedia - Klik Login untuk masuk Demo Mode
          </div>
        )}
      </div>
    )
  }

  if (user?.role === "guru") {
    return <GuruDashboard user={user} onLogout={handleLogout} />
  }

  return <MuridDashboard user={user} onLogout={handleLogout} />
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F4E79",
    color: "white",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  demoOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(31, 78, 121, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  demoModal: {
    backgroundColor: "white",
    padding: "2.5rem",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  demoTitle: {
    color: "#1F4E79",
    marginBottom: "0.5rem",
    fontSize: "1.75rem",
  },
  demoSubtitle: {
    color: "#666",
    marginBottom: "1.5rem",
    fontSize: "0.95rem",
  },
  demoButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "1rem",
  },
  demoBtnGuru: {
    padding: "1rem",
    backgroundColor: "#1F4E79",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  demoBtnMurid: {
    padding: "1rem",
    backgroundColor: "#548235",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  demoBtnCancel: {
    padding: "0.7rem 1.5rem",
    backgroundColor: "transparent",
    color: "#888",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  demoBanner: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#FFC107",
    color: "#333",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "0.9rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
}

export default App
