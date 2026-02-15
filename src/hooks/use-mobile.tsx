import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Initialize from the media query match state
    setIsMobile(mql.matches)

    // Use modern API when available, fallback to legacy addListener/removeListener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    } else {
      // @ts-ignore legacy
      mql.addListener(onChange)
      // @ts-ignore legacy
      return () => mql.removeListener(onChange)
    }
  }, [])

  return !!isMobile
}
