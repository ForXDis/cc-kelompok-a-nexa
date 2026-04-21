import { useState, useEffect, useCallback } from 'react'
import theme from '../styles/theme'

/**
 * Custom Hook untuk mendeteksi ukuran layar dan responsivitas
 * 
 * Karena inline styles tidak mendukung @media query,
 * hook ini menyediakan state yang bisa digunakan untuk 
 * conditional styling di JavaScript
 * 
 * Usage:
 * const { isMobile, isTablet, isDesktop, screenWidth } = useResponsive()
 * 
 * const containerStyle = {
 *   padding: isMobile ? theme.spacing[4] : theme.spacing[8],
 *   flexDirection: isMobile ? 'column' : 'row',
 * }
 */

const useResponsive = () => {
  // Initialize dengan ukuran default (untuk SSR safety)
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  // Debounced resize handler untuk performa
  const handleResize = useCallback(() => {
    setScreenWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    // Set initial value
    setScreenWidth(window.innerWidth)

    // Debounce resize event untuk performa yang lebih baik
    let timeoutId = null
    const debouncedResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', debouncedResize)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedResize)
    }
  }, [handleResize])

  // Breakpoint checks
  const isMobile = screenWidth < theme.breakpoints.md       // < 768px
  const isTablet = screenWidth >= theme.breakpoints.md && screenWidth < theme.breakpoints.lg  // 768px - 1023px
  const isDesktop = screenWidth >= theme.breakpoints.lg     // >= 1024px
  const isLargeDesktop = screenWidth >= theme.breakpoints.xl // >= 1280px

  // Helper untuk conditional values
  const responsive = (mobile, tablet, desktop) => {
    if (isMobile) return mobile
    if (isTablet) return tablet ?? desktop
    return desktop
  }

  return {
    // Screen width value
    screenWidth,
    
    // Boolean breakpoint checks
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    
    // Combined checks
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
    
    // Helper function
    responsive,
    
    // Breakpoint values (for reference)
    breakpoints: theme.breakpoints,
  }
}

export default useResponsive
