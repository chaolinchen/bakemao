'use client'

import { SessionProvider } from 'next-auth/react'
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset'

function KeyboardOffsetRoot({ children }: { children: React.ReactNode }) {
  useKeyboardOffset()
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <KeyboardOffsetRoot>{children}</KeyboardOffsetRoot>
    </SessionProvider>
  )
}
