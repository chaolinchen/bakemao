'use client'

import { useEffect } from 'react'
import { releaseWakeLock, requestWakeLock } from '@/lib/wakeLock'

export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    void requestWakeLock()
    return () => releaseWakeLock()
  }, [enabled])
}
