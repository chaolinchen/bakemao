'use client'

import { useEffect, useState } from 'react'
import { subscribeToast } from '@/lib/toast'

export function ToastContainer() {
  const [state, setState] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  useEffect(() => {
    const unsub = subscribeToast((message) => {
      setState({ message, visible: true })
      setTimeout(() => {
        setState((prev) => ({ ...prev, visible: false }))
      }, 2500)
    })
    return unsub
  }, [])

  if (!state.visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg"
      style={{ background: '#3D2918' }}
      role="status"
      aria-live="polite"
    >
      ✓ {state.message}
    </div>
  )
}
