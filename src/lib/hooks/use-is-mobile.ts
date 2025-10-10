"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the device is a mobile/touch device
 * Uses the media query @media (pointer: fine) to detect mouse vs touch devices
 *
 * @returns true for touch devices (mobile/tablet), false for pointer devices (desktop)
 */
export function useIsMobile(): boolean {
  // Default to false (desktop) for SSR
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return

    // Media query to detect fine pointer (mouse) vs coarse pointer (touch)
    // pointer: fine = has precise pointing device (mouse)
    // pointer: coarse = has imprecise pointing device (touch)
    const mediaQuery = window.matchMedia('(pointer: coarse)')

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobile
}
