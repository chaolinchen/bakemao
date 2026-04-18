'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CalcResult } from '@/components/CalcResult'
import { MoldSelector } from '@/components/MoldSelector'
import { RecipeInput } from '@/components/RecipeInput'
import { SaveRecipeBar } from '@/components/SaveRecipeBar'
import { OfflineBanner } from '@/components/ui/Banner'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useWakeLock } from '@/hooks/useWakeLock'

const ONBOARD_KEY = 'bakemao_onboarded'

export default function Home() {
  useWakeLock(true)
  const online = useOnlineStatus()
  const [showOnboard, setShowOnboard] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShowOnboard(!localStorage.getItem(ONBOARD_KEY))
  }, [])

  const dismissOnboard = () => {
    localStorage.setItem(ONBOARD_KEY, '1')
    setShowOnboard(false)
  }

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

      {showOnboard ? (
        <div
          className="flex items-start justify-between gap-2 border-b border-[#E8D4BC] px-4 py-2 text-xs text-[#5C4A3A]"
          style={{ backgroundColor: '#FDF3E7' }}
          role="status"
        >
          <div className="min-w-0 space-y-1.5 pt-0.5 leading-relaxed">
            <p>
              {
                '\u7b2c\u4e00\u6b21\u4f7f\u7528\uff1f\u9078\u6a21\u5177 \u2192 \u8f38\u5165\u914d\u65b9\u6bd4\u4f8b \u2192 \u5373\u6642\u770b\u514b\u6578\u7d50\u679c'
              }
            </p>
            <p className="text-[11px] text-[#6B5A4A]">
              {
                '\u8907\u96dc\u914d\u65b9\u53ef\u5728\u6750\u6599\u524d\u52a0\u300c\u3010\u7fa4\u7d44\u540d\u3011\u300d\u524d\u7db4\uff0c\u4f8b\uff1a\u300c\u3010\u86cb\u7cd5\u9ad4\u3011\u4f4e\u7b4b\u9eb5\u7c89\u300d\u3002'
              }
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md px-2 py-0.5 text-lg leading-none text-[#8A7968] hover:bg-black/5"
            aria-label={'\u95dc\u9589\u63d0\u793a'}
            onClick={dismissOnboard}
          >
            ×
          </button>
        </div>
      ) : null}

      <main className="mx-auto flex max-w-lg flex-col gap-4 p-4">
        <MoldSelector />
        <RecipeInput />
        <CalcResult />
      </main>

      <SaveRecipeBar />
    </div>
  )
}
