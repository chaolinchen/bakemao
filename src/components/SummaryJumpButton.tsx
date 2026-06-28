'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { aggregateIngredientsAcrossComponents } from '@/lib/multiComponentAggregate'
import { useCalcStore } from '@/store/calcStore'

function fmtG(g: number): string {
  if (g >= 1000) return `${Math.round(g).toLocaleString('en-US')} g`
  return `${Math.round(g)} g`
}

/**
 * 手機專用：常駐右下角「🛒 備料 X g」快捷，點了捲到備料彙總。
 * 桌機備料彙總已 sticky 在右欄，故 lg 以上隱藏。
 */
export function SummaryJumpButton() {
  const { components, compQuantity, compLossRate } = useCalcStore(
    useShallow((s) => ({
      components: s.components ?? [],
      compQuantity: s.compQuantity ?? 1,
      compLossRate: s.compLossRate ?? 0,
    }))
  )

  const { totalGram, shouldShow, nKind } = useMemo(() => {
    const r = aggregateIngredientsAcrossComponents(components, compQuantity, compLossRate)
    return { totalGram: r.totalGram, shouldShow: r.shouldShow, nKind: r.rows.length }
  }, [components, compQuantity, compLossRate])

  if (!shouldShow || nKind === 0) return null

  const jump = () => {
    const el = document.getElementById('summary-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={jump}
      aria-label={`備料彙總 ${fmtG(totalGram)}，點此查看`}
      className="fixed right-4 z-30 flex items-center gap-1.5 rounded-full border-2 border-[#6B4A2F] bg-[#FFE1C7] px-4 py-3 text-sm font-extrabold text-[#8B3B1C] shadow-[0_4px_0_#6B4A2F,0_8px_16px_rgba(107,74,47,0.25)] transition active:translate-y-[2px] active:shadow-[0_2px_0_#6B4A2F] lg:hidden"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <span aria-hidden>🛒</span>
      <span>備料 {fmtG(totalGram)}</span>
      <span aria-hidden className="text-[#C8602A]">↓</span>
    </button>
  )
}
