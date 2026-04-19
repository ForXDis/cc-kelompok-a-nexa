import { useState } from "react"

function LoginPage({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError("Nama wajib diisi")
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError("Password minimal 8 karakter")
          setLoading(false)
          return
        }
        await onRegister(formData)
      } else {
        await onLogin({ email: formData.email, password: formData.password })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* Left Section - Learning Activity Background */}
      <div style={styles.leftSection}>
        <div style={styles.overlay}></div>
        <div style={styles.leftContent}>
          <h2 style={styles.leftTitle}>Studyfy</h2>
          <p style={styles.leftSubtitle}>Platform Pembelajaran Modern</p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div style={styles.rightSection}>
        <div style={styles.formContainer}>
          <div style={styles.logoSection}>
            <h1 style={styles.logo}>Studyfy</h1>
          </div>

          <h2 style={styles.title}>
            {isRegister ? "Buat Akun" : "Masuk"}
          </h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {isRegister && (
              <div style={styles.field}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.field}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Kata Sandi"
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? "..." : isRegister ? "Daftar" : "Masuk"}
            </button>
          </form>

          <div style={styles.divider}></div>

          <div style={styles.toggleContainer}>
            {!isRegister ? (
              <>
                <span style={styles.toggleText}>Belum punya akun?</span>
                <button 
                  type="button"
                  onClick={() => { setIsRegister(true); setError("") }}
                  style={styles.toggleLink}
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                <span style={styles.toggleText}>Sudah punya akun?</span>
                <button 
                  type="button"
                  onClick={() => { setIsRegister(false); setError("") }}
                  style={styles.toggleLink}
                >
                  Masuk
                </button>
              </>
            )}
          </div>

          {!isRegister && (
            <div style={styles.forgotContainer}>
              <a href="#forgot" style={styles.forgotLink}>Lupa kata sandi?</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  leftSection: {
    flex: 1,
    backgroundImage: "url(/learning-activity-bg.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(26, 58, 82, 0.4)",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    color: "white",
  },
  leftTitle: {
    fontSize: "2.8rem",
    fontWeight: "700",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.5px",
  },
  leftSubtitle: {
    fontSize: "1.1rem",
    fontWeight: "300",
    margin: "0",
    opacity: 0.95,
    letterSpacing: "0.3px",
  },
  rightSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafbfc",
    padding: "2rem",
  },
  formContainer: {
    width: "100%",
    maxWidth: "380px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  logo: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#1a3a52",
    margin: "0",
    letterSpacing: "-0.5px",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a3a52",
    margin: "0 0 1.5rem 0",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.85rem 1rem",
    border: "1.5px solid #ddd",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
    backgroundColor: "white",
    transition: "all 0.3s ease",
    color: "#1a3a52",
  },
  btnSubmit: {
    padding: "0.9rem 1rem",
    backgroundColor: "#1a3a52",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    marginTop: "0.5rem",
    letterSpacing: "0.3px",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1.2rem",
    fontSize: "0.9rem",
    textAlign: "center",
    border: "1px solid #fcc",
  },
  divider: {
    height: "1px",
    backgroundColor: "#ddd",
    margin: "1.8rem 0",
  },
  toggleContainer: {
    textAlign: "center",
    fontSize: "0.9rem",
    display: "flex",
    justifyContent: "center",
    gap: "0.4rem",
    flexWrap: "wrap",
  },
  toggleText: {
    color: "#666",
  },
  toggleLink: {
    backgroundColor: "transparent",
    color: "#1a3a52",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    padding: "0",
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  forgotContainer: {
    textAlign: "center",
    marginTop: "1.2rem",
  },
  forgotLink: {
    color: "#666",
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
}

export default LoginPage
