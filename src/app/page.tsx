'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { GlobalQtyCard } from '@/components/GlobalQtyCard'
import { MultiComponentSection } from '@/components/MultiComponentSection'
import { SaveRecipeBar } from '@/components/SaveRecipeBar'
import { SummaryCard } from '@/components/SummaryCard'
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
    <div className="min-h-screen bg-[#FDF8F2] pb-36 text-[#3D2918]">
      <OfflineBanner show={!online} />
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5D8C8] bg-[#FDF8F2]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* 貓臉底色 */}
            <ellipse cx="14" cy="16" rx="11" ry="10" fill="#F5DEB3"/>
            {/* 左耳（橘色色塊） */}
            <polygon points="4,9 7,3 10,9" fill="#E8955A"/>
            {/* 右耳（深色） */}
            <polygon points="18,9 21,3 24,9" fill="#6B4C3B"/>
            {/* 左耳內 */}
            <polygon points="5,9 7,5 9,9" fill="#F7C09A"/>
            {/* 右耳內 */}
            <polygon points="19,9 21,5 23,9" fill="#C08070"/>
            {/* 橘色左側毛斑 */}
            <ellipse cx="9" cy="14" rx="4.5" ry="5.5" fill="#E8955A" opacity="0.7"/>
            {/* 深色右側毛斑 */}
            <ellipse cx="20" cy="13" rx="4" ry="5" fill="#6B4C3B" opacity="0.6"/>
            {/* 鼻子 */}
            <ellipse cx="14" cy="18" rx="1.2" ry="0.8" fill="#E88080"/>
            {/* 左眼（瞇眼） */}
            <path d="M10 14.5 Q11 13.5 12 14.5" stroke="#3D2918" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            {/* 右眼（瞇眼） */}
            <path d="M16 14.5 Q17 13.5 18 14.5" stroke="#3D2918" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            {/* 嘴巴 */}
            <path d="M12.8 19 Q14 20 15.2 19" stroke="#3D2918" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
            {/* 鬍鬚左 */}
            <line x1="5" y1="17" x2="11" y2="17.5" stroke="#3D2918" strokeWidth="0.6" opacity="0.5"/>
            <line x1="5" y1="18.5" x2="11" y2="18.5" stroke="#3D2918" strokeWidth="0.6" opacity="0.5"/>
            {/* 鬍鬚右 */}
            <line x1="17" y1="17.5" x2="23" y2="17" stroke="#3D2918" strokeWidth="0.6" opacity="0.5"/>
            <line x1="17" y1="18.5" x2="23" y2="18.5" stroke="#3D2918" strokeWidth="0.6" opacity="0.5"/>
          </svg>
          <span
            className="font-serif text-xl font-semibold"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            BakeMao
          </span>
        </div>
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
                '\u7b2c\u4e00\u6b21\u4f7f\u7528\uff1f\u8a2d\u5b9a\u4efd\u6578 \u2192 \u8f38\u5165\u6bcf\u7d44\u76ee\u6a19\u91cf\u8207\u767e\u5206\u6bd4 \u2192 \u5373\u6642\u770b\u514b\u6578\u7d50\u679c'
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
        <GlobalQtyCard />
        <MultiComponentSection />
        <SummaryCard />
      </main>

      <SaveRecipeBar />
    </div>
  )
}
