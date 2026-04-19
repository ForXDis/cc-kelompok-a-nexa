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
      {/* Left Section */}
      <div style={styles.leftSection}>
        <div style={styles.content}>
          <h1 style={styles.platformTitle}>Studyfy</h1>
          <p style={styles.platformSubtitle}>Platform Pembelajaran Terpadu</p>
          
          <h2 style={styles.welcomeTitle}>Selamat datang di</h2>
          <h2 style={styles.studyfyTitle}>Studyfy</h2>
          
          <p style={styles.description}>
            Ekosistem pendidikan digital yang dirancang untuk membantu pengajar dan siswa meraih potensi terbaik melalui teknologi.
          </p>

          {/* Features */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span style={styles.featureText}>Akses materi pembelajaran interaktif kapan saja</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span style={styles.featureText}>Pantau progres tugas dan nilai secara real-time</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.checkmark}>✓</span>
              <span style={styles.featureText}>Kolaborasi mudah antar siswa dan pengajar</span>
            </div>
          </div>

          <p style={styles.footerText}>Bergabung dengan 10,000+ siswa lainnya hari ini.</p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div style={styles.rightSection}>
        <div style={styles.formContainer}>
          {!isRegister && (
            <>
              <h3 style={styles.formTitle}>Masuk</h3>
              <p style={styles.formSubtitle}>
                Silakan masukkan email dan kata sandi Anda untuk mengakses dashboard pembelajaran.
              </p>
            </>
          )}
          
          {isRegister && (
            <>
              <h3 style={styles.formTitle}>Daftar Akun Baru</h3>
              <p style={styles.formSubtitle}>
                Buat akun Anda untuk memulai perjalanan pembelajaran.
              </p>
            </>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {isRegister && (
              <div style={styles.field}>
                <label style={styles.label}>Nama Lengkap</label>
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
              <label style={styles.label}>Email / Nama Pengguna</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@sekolah.edu"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Kata Sandi</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                style={styles.input}
              />
            </div>

            {!isRegister && (
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="remember" style={styles.checkboxLabel}>
                  Ingat saya di perangkat ini
                </label>
              </div>
            )}

            <button type="submit" style={styles.btnSubmit} disabled={loading}>
              {loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk Ke Portal →"}
            </button>
          </form>

          {!isRegister ? (
            <>
              <div style={styles.linkContainer}>
                <a href="#forgot" style={styles.link}>Lupa kata sandi?</a>
              </div>
              <div style={styles.signupContainer}>
                <span style={styles.signupText}>Belum memiliki akun? </span>
                <button 
                  type="button"
                  onClick={() => { setIsRegister(true); setError("") }}
                  style={styles.signupLink}
                >
                  Daftar Sekarang
                </button>
              </div>
            </>
          ) : (
            <div style={styles.signupContainer}>
              <span style={styles.signupText}>Sudah memiliki akun? </span>
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setError("") }}
                style={styles.signupLink}
              >
                Masuk Sekarang
              </button>
            </div>
          )}

          <div style={styles.helpContainer}>
            <a href="#help" style={styles.helpLink}>Butuh bantuan? Pusat Bantuan</a>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerLinks}>
            <a href="#terms" style={styles.footerLink}>Syarat & Ketentuan</a>
            <span style={styles.separator}>•</span>
            <a href="#privacy" style={styles.footerLink}>Kebijakan Privasi</a>
            <span style={styles.separator}>•</span>
            <a href="#help" style={styles.footerLink}>Pusat Bantuan</a>
          </div>
          <p style={styles.copyright}>2026 NamaLMS Education Group. Seluruh hak cipta dilindungi.</p>
          <p style={styles.version}>v2.4.0-stable</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#f8f9fa",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  leftSection: {
    flex: 1,
    backgroundColor: "#1a3a52",
    color: "white",
    padding: "3rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  content: {
    maxWidth: "450px",
  },
  platformTitle: {
    fontSize: "0.85rem",
    fontWeight: "600",
    letterSpacing: "0.05em",
    color: "#a0c4e8",
    margin: "0 0 0.5rem 0",
    textTransform: "uppercase",
  },
  platformSubtitle: {
    fontSize: "0.9rem",
    color: "#7fa8c9",
    margin: "0 0 2rem 0",
    fontWeight: "500",
  },
  welcomeTitle: {
    fontSize: "1.3rem",
    fontWeight: "400",
    color: "#a0c4e8",
    margin: "0 0 0.5rem 0",
  },
  studyfyTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "white",
    margin: "0 0 1.5rem 0",
  },
  description: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "#b8d1e6",
    margin: "0 0 2rem 0",
  },
  features: {
    marginBottom: "2rem",
  },
  feature: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "1rem",
    gap: "0.75rem",
  },
  checkmark: {
    color: "#4caf50",
    fontSize: "1.2rem",
    fontWeight: "bold",
    flexShrink: 0,
    marginTop: "0.1rem",
  },
  featureText: {
    fontSize: "0.9rem",
    color: "#b8d1e6",
    lineHeight: "1.4",
  },
  footerText: {
    fontSize: "0.9rem",
    color: "#a0c4e8",
    fontWeight: "500",
  },
  rightSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "2rem",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: "380px",
  },
  formTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a3a52",
    margin: "0 0 0.5rem 0",
  },
  formSubtitle: {
    fontSize: "0.9rem",
    color: "#666",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "0.75rem 1rem",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#1a3a52",
  },
  checkboxLabel: {
    fontSize: "0.9rem",
    color: "#555",
    cursor: "pointer",
  },
  btnSubmit: {
    padding: "0.9rem 1rem",
    backgroundColor: "#1a3a52",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "600",
    transition: "background-color 0.3s, transform 0.2s",
    marginTop: "0.5rem",
  },
  linkContainer: {
    textAlign: "center",
    marginTop: "0.5rem",
  },
  link: {
    color: "#1a3a52",
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: "500",
  },
  signupContainer: {
    textAlign: "center",
    marginTop: "1.2rem",
    fontSize: "0.9rem",
  },
  signupText: {
    color: "#666",
  },
  signupLink: {
    backgroundColor: "transparent",
    color: "#1a3a52",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "600",
    padding: "0",
    fontSize: "0.9rem",
  },
  helpContainer: {
    textAlign: "center",
    marginTop: "1.5rem",
  },
  helpLink: {
    color: "#666",
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: "500",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    textAlign: "center",
    border: "1px solid #fcc",
  },
  footer: {
    textAlign: "center",
    marginTop: "auto",
    paddingTop: "2rem",
    fontSize: "0.8rem",
    color: "#999",
  },
  footerLinks: {
    marginBottom: "0.5rem",
  },
  footerLink: {
    color: "#999",
    textDecoration: "none",
    fontSize: "0.8rem",
  },
  separator: {
    margin: "0 0.5rem",
    color: "#ddd",
  },
  copyright: {
    fontSize: "0.8rem",
    color: "#999",
    margin: "0.3rem 0",
  },
  version: {
    fontSize: "0.75rem",
    color: "#bbb",
    margin: "0.2rem 0 0 0",
  },
}

export default LoginPage
