import { useEffect } from 'react'

/**
 * Sets `--keyboard-offset` on `:root` from visualViewport (mobile keyboard).
 * Pair with `padding-bottom: calc(env(safe-area-inset-bottom) + var(--keyboard-offset, 0px))`.
 */
export function useKeyboardOffset() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handler = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop
      document.documentElement.style.setProperty(
        '--keyboard-offset',
        `${Math.max(0, offset)}px`
      )
    }
    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    handler()
    return () => {
      vv.removeEventListener('resize', handler)
      vv.removeEventListener('scroll', handler)
      document.documentElement.style.removeProperty('--keyboard-offset')
    }
  }, [])
}
