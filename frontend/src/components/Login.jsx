import { useState } from 'react'
import theme from '../styles/theme'
import useResponsive from '../hooks/useResponsive'
import { Button, Input } from './ui'

/**
 * Login Page Component
 * Tampilan card login yang berada di tengah layar
 * Desain konsisten untuk semua user (guru & murid)
 */

const Login = ({ onLogin, onRegister }) => {
  const { isMobile } = useResponsive()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'murid',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError('Nama wajib diisi')
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError('Password minimal 8 karakter')
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

  const switchMode = (register) => {
    setIsRegister(register)
    setError('')
  }

  // Styles
  const styles = getStyles(isMobile)

  return (
    <div style={styles.wrapper}>
      {/* Background Pattern */}
      <div style={styles.bgPattern} />
      
      {/* Login Card */}
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 style={styles.logoText}>Studyfy</h1>
          <p style={styles.tagline}>Platform Belajar Modern untuk Semua</p>
        </div>

        {/* Tab Switcher */}
        <div style={styles.tabContainer}>
          <button
            style={{
              ...styles.tab,
              ...(isRegister ? {} : styles.tabActive),
            }}
            onClick={() => switchMode(false)}
          >
            Masuk
          </button>
          <button
            style={{
              ...styles.tab,
              ...(isRegister ? styles.tabActive : {}),
            }}
            onClick={() => switchMode(true)}
          >
            Daftar
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <>
              <Input
                label="Nama Lengkap"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                fullWidth
              />

              {/* Role Selector */}
              <div style={styles.roleField}>
                <label style={styles.label}>Daftar sebagai</label>
                <div style={styles.roleSelector}>
                  <label
                    style={{
                      ...styles.roleOption,
                      ...(formData.role === 'murid' ? styles.roleOptionActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="murid"
                      checked={formData.role === 'murid'}
                      onChange={handleChange}
                      style={styles.radioHidden}
                    />
                    <div style={styles.roleIconWrapper}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <span style={styles.roleText}>Pelajar</span>
                  </label>

                  <label
                    style={{
                      ...styles.roleOption,
                      ...(formData.role === 'guru' ? styles.roleOptionActive : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="guru"
                      checked={formData.role === 'guru'}
                      onChange={handleChange}
                      style={styles.radioHidden}
                    />
                    <div style={styles.roleIconWrapper}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <span style={styles.roleText}>Pengajar</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nama@email.com"
            required
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isRegister ? 'Minimal 8 karakter' : 'Masukkan password'}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingText}>Memproses...</span>
            ) : isRegister ? (
              'Daftar Sekarang'
            ) : (
              'Masuk'
            )}
          </Button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            style={styles.switchLink}
            onClick={() => switchMode(!isRegister)}
          >
            {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
          </button>
        </p>
      </div>
    </div>
  )
}

// Styles generator
const getStyles = (isMobile) => ({
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.default,
    padding: isMobile ? theme.spacing[4] : theme.spacing[6],
    fontFamily: theme.typography.fontFamily,
    position: 'relative',
    overflow: 'hidden',
  },

  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.colors.primary.main}08 0%, ${theme.colors.primary.light}05 100%)`,
    pointerEvents: 'none',
  },

  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius['2xl'],
    padding: isMobile ? theme.spacing[6] : theme.spacing[8],
    width: '100%',
    maxWidth: '420px',
    boxShadow: theme.shadows.xl,
    position: 'relative',
    zIndex: 1,
  },

  logoSection: {
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },

  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    marginBottom: theme.spacing[4],
  },

  logoText: {
    margin: 0,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },

  tagline: {
    margin: 0,
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  tabContainer: {
    display: 'flex',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[1],
    marginBottom: theme.spacing[6],
  },

  tab: {
    flex: 1,
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    transition: `all ${theme.transitions.fast}`,
    fontFamily: theme.typography.fontFamily,
  },

  tabActive: {
    backgroundColor: theme.colors.background.paper,
    color: theme.colors.text.primary,
    boxShadow: theme.shadows.sm,
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.danger.light,
    color: theme.colors.danger.dark,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[4],
    fontSize: theme.typography.fontSize.sm,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[5],
  },

  roleField: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },

  roleSelector: {
    display: 'flex',
    gap: theme.spacing[3],
  },

  roleOption: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.xl,
    cursor: 'pointer',
    transition: `all ${theme.transitions.fast}`,
    backgroundColor: theme.colors.background.paper,
  },

  roleOptionActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: `${theme.colors.primary.main}08`,
  },

  radioHidden: {
    display: 'none',
  },

  roleIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.elevated,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.primary.main,
  },

  roleText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },

  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
  },

  footer: {
    textAlign: 'center',
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  switchLink: {
    background: 'none',
    border: 'none',
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.semibold,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily,
  },
})

export default Login
