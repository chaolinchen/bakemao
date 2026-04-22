'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GlobalQtyCard } from '@/components/GlobalQtyCard'
import { MultiComponentSection } from '@/components/MultiComponentSection'
import { SaveRecipeBar } from '@/components/SaveRecipeBar'
import { SummaryCard } from '@/components/SummaryCard'
import { OfflineBanner } from '@/components/ui/Banner'
import { Sparkle } from '@/components/ui/Sparkle'
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
    <div
      className="min-h-screen pb-36 text-[#4A3322]"
      style={{
        background: '#E6EEF5',
        backgroundImage:
          'radial-gradient(circle at 15% 10%, rgba(255,255,255,0.7) 0, transparent 40%), radial-gradient(circle at 90% 85%, rgba(255,231,217,0.6) 0, transparent 42%)',
      }}
    >
      <OfflineBanner show={!online} />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-[#6B4A2F] bg-[#E6EEF5]/92 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/maologo.png" width={42} height={42} alt="BakeMao logo" />
          <div>
            <div className="text-[22px] font-extrabold leading-none text-[#6B4A2F]">
              BakeMao
            </div>
            <div className="text-[10.5px] font-bold tracking-[3px] text-[#C8602A]">
              烘 焙 貓
            </div>
          </div>
        </div>
        <Link
          href="/recipes"
          className="flex items-center gap-1.5 rounded-full border-2 border-[#6B4A2F] bg-[#FFE1C7] px-3.5 py-1.5 text-[13.5px] font-extrabold text-[#6B4A2F] shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px active:shadow-[0_1px_0_#6B4A2F]"
        >
          <Sparkle size={12} color="#C8602A" />
          我的配方
        </Link>
      </header>

      {showOnboard ? (
        <div
          className="flex items-start justify-between gap-2 border-b border-[#D0A578] px-4 py-2 text-xs text-[#5C4A3A]"
          style={{ backgroundColor: '#FFF3E7' }}
          role="status"
        >
          <div className="min-w-0 space-y-1.5 pt-0.5 leading-relaxed">
            <p>
              {
                '第一次使用？設定份數 → 輸入每組目標量與百分比 → 即時看克數結果'
              }
            </p>
            <p className="text-[11px] text-[#6B5A4A]">
              {
                '複雜配方可在材料前加「【群組名】」前綴，例如「【蛋糕體】低筋麵粉」。'
              }
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md px-2 py-0.5 text-lg leading-none text-[#8A7968] hover:bg-black/5"
            aria-label="關閉提示"
            onClick={dismissOnboard}
          >
            ×
          </button>
        </div>
      ) : null}

      <main className="relative z-[1] mx-auto flex max-w-lg flex-col gap-4 p-4">
        <GlobalQtyCard />
        <MultiComponentSection />
        <SummaryCard />
      </main>

      <SaveRecipeBar />
    </div>
  )
}
