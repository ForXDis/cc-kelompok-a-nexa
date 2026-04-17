import { useState, useEffect } from "react"
import LoginPage from "./components/LoginPage"
import GuruDashboard from "./components/GuruDashboard"
import MuridDashboard from "./components/MuridDashboard"
import {
  login, register, logout, getUser, getToken, checkHealth,
} from "./services/api"

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

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
      if (!healthy) {
        console.warn("Backend tidak tersedia")
      }
    })
  }, [])

  const handleLogin = async (data) => {
    const res = await login(data)
    setUser(res.user)
    setIsAuthenticated(true)
  }

  const handleRegister = async (userData) => {
    await register(userData)
    await handleLogin({ email: userData.email, password: userData.password })
  }

  const handleLogout = () => {
    logout()
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

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
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
}

export default App
