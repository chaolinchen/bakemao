'use client'

import Link from 'next/link'
import { CalcResult } from '@/components/CalcResult'
import { MoldSelector } from '@/components/MoldSelector'
import { RecipeInput } from '@/components/RecipeInput'
import { SaveRecipeBar } from '@/components/SaveRecipeBar'
import { OfflineBanner } from '@/components/ui/Banner'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useWakeLock } from '@/hooks/useWakeLock'

export default function Home() {
  useWakeLock(true)
  const online = useOnlineStatus()

  return (
    <div className="min-h-screen bg-[#F7F0E6] pb-36 text-[#3D2918]">
      <OfflineBanner show={!online} />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5D8C8] bg-[#F7F0E6]/90 px-4 py-3 backdrop-blur">
        <span
          className="font-serif text-xl font-semibold"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          BakeMao
        </span>
        <Link
          href="/recipes"
          className="text-sm font-medium text-[#C8602A] underline underline-offset-4"
        >
          我的配方
        </Link>
      </header>

      <main className="mx-auto flex max-w-lg flex-col gap-4 p-4">
        <MoldSelector />
        <RecipeInput />
        <CalcResult />
      </main>

      <SaveRecipeBar />
    </div>
  )
}
