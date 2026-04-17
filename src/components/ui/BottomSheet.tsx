'use client'

import { useEffect } from 'react'

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="關閉"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] overflow-auto rounded-t-2xl bg-[#F7F0E6] p-4 shadow-xl">
        {title ? (
          <h2 className="mb-3 text-lg font-semibold text-[#3D2918]">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>
  )
}
