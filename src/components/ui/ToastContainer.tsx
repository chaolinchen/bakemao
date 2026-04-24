'use client'

import { useEffect, useState } from 'react'
import { subscribeToast } from '@/lib/toast'

export function ToastContainer() {
  const [state, setState] = useState<{ message: string; subtitle?: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  useEffect(() => {
    const unsub = subscribeToast(({ message, subtitle }) => {
      setState({ message, subtitle, visible: true })
      setTimeout(() => {
        setState((prev) => ({ ...prev, visible: false }))
      }, 3000)
    })
    return unsub
  }, [])

  if (!state.visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg"
      style={{ background: '#3D2918' }}
      role="status"
      aria-live="polite"
    >
      <div>✓ {state.message}</div>
      {state.subtitle && (
        <div className="mt-0.5 text-xs font-normal opacity-75">{state.subtitle}</div>
      )}
    </div>
  )
}
