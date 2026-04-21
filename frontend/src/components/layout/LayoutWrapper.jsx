import { useState } from 'react'
import theme from '../../styles/theme'
import useResponsive from '../../hooks/useResponsive'

/**
 * LayoutWrapper - Komponen layout utama untuk halaman dashboard
 * 
 * Digunakan oleh SEMUA role (Guru & Murid) untuk konsistensi visual
 * Menyediakan: Header, Sidebar, dan area Konten Utama
 * 
 * Props:
 * - user: object { name, email, role }
 * - onLogout: function
 * - menuItems: array of { icon, label, id, badge? }
 * - activeMenu: string (id menu yang aktif)
 * - onMenuClick: function(menuId)
 * - children: konten utama
 */

const LayoutWrapper = ({ 
  user, 
  onLogout, 
  menuItems = [], 
  activeMenu, 
  onMenuClick,
  pageTitle,
  pageSubtitle,
  children 
}) => {
  const { isMobile, isTablet, isMobileOrTablet } = useResponsive()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // Dynamic styles based on screen size
  const styles = getStyles(isMobile, isTablet, sidebarOpen)

  return (
    <div style={styles.wrapper}>
      {/* Mobile Overlay */}
      {isMobileOrTablet && sidebarOpen && (
        <div style={styles.overlay} onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Sidebar Header / Logo */}
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <span style={styles.logoText}>Studyfy</span>
          </div>
          {isMobileOrTablet && (
            <button style={styles.closeSidebarBtn} onClick={closeSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav style={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              style={{
                ...styles.menuItem,
                ...(activeMenu === item.id ? styles.menuItemActive : {}),
              }}
              onClick={() => {
                onMenuClick(item.id)
                if (isMobileOrTablet) closeSidebar()
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              <span style={styles.menuLabel}>{item.label}</span>
              {item.badge && (
                <span style={styles.menuBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer - User Info */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userSection}>
            <div style={styles.userAvatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || 'User'}</span>
              <span style={styles.userRole}>
                {user?.role === 'guru' ? 'Pengajar' : 'Pelajar'}
              </span>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {isMobileOrTablet && (
              <button style={styles.menuToggle} onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            <div style={styles.headerTitleSection}>
              {pageTitle && <h1 style={styles.pageTitle}>{pageTitle}</h1>}
              {pageSubtitle && <p style={styles.pageSubtitle}>{pageSubtitle}</p>}
            </div>
          </div>
          <div style={styles.headerRight}>
            {/* Notification Button */}
            <button style={styles.headerIconBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {/* User Avatar (Mobile) */}
            {isMobile && (
              <div style={styles.headerAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  )
}

// Style generator function
const getStyles = (isMobile, isTablet, sidebarOpen) => {
  const isMobileOrTablet = isMobile || isTablet
  
  return {
    wrapper: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.background.default,
      fontFamily: theme.typography.fontFamily,
    },

    // Overlay for mobile sidebar
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.modal - 10,
    },

    // Sidebar
    sidebar: {
      position: isMobileOrTablet ? 'fixed' : 'sticky',
      top: 0,
      left: isMobileOrTablet ? (sidebarOpen ? 0 : `-${theme.layout.sidebarWidth}`) : 0,
      width: theme.layout.sidebarWidth,
      height: '100vh',
      backgroundColor: theme.colors.background.paper,
      borderRight: `1px solid ${theme.colors.border.light}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: theme.zIndex.modal,
      transition: `left ${theme.transitions.normal}`,
      boxShadow: isMobileOrTablet && sidebarOpen ? theme.shadows.xl : 'none',
    },

    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing[5],
      borderBottom: `1px solid ${theme.colors.border.light}`,
    },

    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[3],
    },

    logoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    logoText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
    },

    closeSidebarBtn: {
      padding: theme.spacing[2],
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: theme.colors.text.secondary,
      borderRadius: theme.borderRadius.md,
    },

    sidebarNav: {
      flex: 1,
      padding: `${theme.spacing[4]} ${theme.spacing[3]}`,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing[1],
      overflowY: 'auto',
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[3],
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      cursor: 'pointer',
      textAlign: 'left',
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      transition: `all ${theme.transitions.fast}`,
      width: '100%',
    },

    menuItemActive: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
    },

    menuIcon: {
      fontSize: theme.typography.fontSize.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
    },

    menuLabel: {
      flex: 1,
    },

    menuBadge: {
      backgroundColor: theme.colors.danger.main,
      color: theme.colors.danger.contrast,
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
      borderRadius: theme.borderRadius.full,
      minWidth: '20px',
      textAlign: 'center',
    },

    sidebarFooter: {
      padding: theme.spacing[4],
      borderTop: `1px solid ${theme.colors.border.light}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[3],
    },

    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.light,
      color: theme.colors.primary.dark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: theme.typography.fontSize.base,
    },

    userInfo: {
      display: 'flex',
      flexDirection: 'column',
    },

    userName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },

    userRole: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
    },

    logoutBtn: {
      padding: theme.spacing[2],
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: theme.colors.text.secondary,
      borderRadius: theme.borderRadius.md,
      transition: `color ${theme.transitions.fast}`,
    },

    // Main Wrapper
    mainWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0, // Prevent flex overflow
    },

    // Header
    header: {
      position: 'sticky',
      top: 0,
      height: theme.layout.headerHeight,
      backgroundColor: theme.colors.background.paper,
      borderBottom: `1px solid ${theme.colors.border.light}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `0 ${isMobile ? theme.spacing[4] : theme.spacing[6]}`,
      zIndex: theme.zIndex.sticky,
    },

    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[4],
    },

    menuToggle: {
      padding: theme.spacing[2],
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      color: theme.colors.text.primary,
      borderRadius: theme.borderRadius.md,
    },

    headerTitleSection: {
      display: 'flex',
      flexDirection: 'column',
    },

    pageTitle: {
      margin: 0,
      fontSize: isMobile ? theme.typography.fontSize.lg : theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },

    pageSubtitle: {
      margin: 0,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },

    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing[3],
    },

    headerIconBtn: {
      padding: theme.spacing[2],
      border: 'none',
      backgroundColor: theme.colors.background.elevated,
      cursor: 'pointer',
      color: theme.colors.text.secondary,
      borderRadius: theme.borderRadius.md,
      transition: `all ${theme.transitions.fast}`,
    },

    headerAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: theme.typography.fontSize.sm,
    },

    // Main Content
    mainContent: {
      flex: 1,
      padding: isMobile ? theme.spacing[4] : theme.spacing[6],
      overflowY: 'auto',
    },
  }
}

export default LayoutWrapper
