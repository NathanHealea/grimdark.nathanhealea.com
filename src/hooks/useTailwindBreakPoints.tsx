import { useEffect, useState } from 'react'

export type BreakPoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// Define Tailwind CSS breakpoints in pixels
// These are standard Tailwind breakpoints.
const breakpoints: Record<BreakPoints, number> = {
  xs: 0, // Tailwind doesn't have an 'xs' but we can consider it as 0 for 'greater than' logic
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

/**
 * A React hook to determine if the current screen width is greater than
 * a specified Tailwind CSS breakpoint.
 *
 * @param {string} breakpointName - The name of the Tailwind CSS breakpoint (e.g., 'sm', 'md', 'lg', 'xl', '2xl').
 * @returns {boolean} True if the screen width is greater than the specified breakpoint, false otherwise.
 */
export default function useTailwindBreakpoints(breakpoint: BreakPoints) {
  // State to store the current window width
  const [windowWidth, setWindowWidth] = useState(0)
  // State to store whether the current window width matches the breakpoint condition
  const [isGreater, setIsGreater] = useState(false)

  useEffect(() => {
    // Handler to update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)

    // Calculate the match based on the current window width and the specified breakpoint
    const calculateMatch = () => {
      const currentWidth = window.innerWidth
      // Check if the breakpointName exists in our defined breakpoints
      if (breakpoints.hasOwnProperty(breakpoint)) {
        setIsGreater(currentWidth > breakpoints[breakpoint])
      } else {
        // If an invalid breakpoint name is provided, log an error and set to false
        console.error(`Invalid breakpoint name: ${breakpoint}. Please use 'xs', 'sm', 'md', 'lg', 'xl', or '2xl'.`)
        setIsGreater(false)
      }
    }

    // Call calculateMatch initially and whenever windowWidth or breakpointName changes
    calculateMatch()

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint, windowWidth]) // Re-run effect if the breakpoint name or window width changes

  useEffect(() => {
    if( typeof window !== 'undefined' ) {
    // Initial check to set the window width
    setWindowWidth(window.innerWidth)
    }
  }, [])

  return isGreater
}
