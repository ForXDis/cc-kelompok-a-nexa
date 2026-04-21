/**
 * Studyfy Design System
 * Single Source of Truth untuk seluruh tampilan aplikasi
 * 
 * PENTING: Warna tema KONSISTEN untuk semua role (Guru & Murid)
 * Pembedaan role dilakukan melalui teks, fitur, dan layout - BUKAN warna
 */

const theme = {
  // ========================================
  // COLOR PALETTE
  // ========================================
  colors: {
    // Primary Brand Color - Indigo (untuk tombol utama, link, aksen)
    primary: {
      main: '#4F46E5',      // Indigo-600
      light: '#818CF8',     // Indigo-400
      dark: '#3730A3',      // Indigo-800
      contrast: '#FFFFFF',  // Teks di atas primary
    },

    // Secondary Color - Slate Gray (untuk elemen pendukung)
    secondary: {
      main: '#64748B',      // Slate-500
      light: '#94A3B8',     // Slate-400
      dark: '#475569',      // Slate-600
      contrast: '#FFFFFF',
    },

    // Background Colors
    background: {
      default: '#F8FAFC',   // Slate-50 - Background utama halaman
      paper: '#FFFFFF',     // Surface/Card background
      elevated: '#F1F5F9',  // Slate-100 - Background terpisah
    },

    // Text Colors
    text: {
      primary: '#1E293B',   // Slate-800 - Teks utama
      secondary: '#64748B', // Slate-500 - Teks pendukung
      disabled: '#94A3B8',  // Slate-400 - Teks disabled
      inverse: '#FFFFFF',   // Teks di atas background gelap
    },

    // Border Colors
    border: {
      light: '#E2E8F0',     // Slate-200
      main: '#CBD5E1',      // Slate-300
      dark: '#94A3B8',      // Slate-400
    },

    // Semantic Colors (untuk feedback status)
    success: {
      main: '#10B981',      // Emerald-500
      light: '#D1FAE5',     // Emerald-100
      dark: '#059669',      // Emerald-600
      contrast: '#FFFFFF',
    },

    warning: {
      main: '#F59E0B',      // Amber-500
      light: '#FEF3C7',     // Amber-100
      dark: '#D97706',      // Amber-600
      contrast: '#FFFFFF',
    },

    danger: {
      main: '#EF4444',      // Red-500
      light: '#FEE2E2',     // Red-100
      dark: '#DC2626',      // Red-600
      contrast: '#FFFFFF',
    },

    info: {
      main: '#3B82F6',      // Blue-500
      light: '#DBEAFE',     // Blue-100
      dark: '#2563EB',      // Blue-600
      contrast: '#FFFFFF',
    },
  },

  // ========================================
  // TYPOGRAPHY
  // ========================================
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    
    // Font Sizes
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },

    // Font Weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // ========================================
  // SPACING SCALE (8px base unit)
  // ========================================
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
  },

  // ========================================
  // BORDER RADIUS
  // ========================================
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',   // Pill shape
  },

  // ========================================
  // SHADOWS
  // ========================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // ========================================
  // TRANSITIONS
  // ========================================
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // ========================================
  // Z-INDEX SCALE
  // ========================================
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // ========================================
  // BREAKPOINTS (untuk referensi di JS)
  // ========================================
  breakpoints: {
    sm: 640,   // Mobile landscape
    md: 768,   // Tablet
    lg: 1024,  // Desktop
    xl: 1280,  // Large desktop
  },

  // ========================================
  // LAYOUT CONSTANTS
  // ========================================
  layout: {
    sidebarWidth: '260px',
    sidebarCollapsedWidth: '72px',
    headerHeight: '64px',
    maxContentWidth: '1200px',
  },
}

export default theme
