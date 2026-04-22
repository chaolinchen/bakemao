'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

function fmtG(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2).replace(/\.?0+$/, '')} kg`
  return `${g.toFixed(1)} g`
}
import { useShallow } from 'zustand/react/shallow'
import { aggregateIngredientsAcrossComponents } from '@/lib/multiComponentAggregate'
import { useCalcStore } from '@/store/calcStore'
import { Sparkle } from './ui/Sparkle'

export function SummaryCard() {
  const [open, setOpen] = useState(false)
  const autoOpenedRef = useRef(false)
  const { components, compQuantity, compLossRate } = useCalcStore(
    useShallow((s) => ({
      components: s.components ?? [],
      compQuantity: s.compQuantity ?? 6,
      compLossRate: s.compLossRate ?? 0,
    }))
  )

  const { rows, totalGram, shouldShow } = useMemo(
    () =>
      aggregateIngredientsAcrossComponents(
        components,
        compQuantity,
        compLossRate
      ),
    [components, compQuantity, compLossRate]
  )

  useEffect(() => {
    if (shouldShow && rows.length > 0 && !autoOpenedRef.current) {
      autoOpenedRef.current = true
      setOpen(true)
    }
    if (!shouldShow) {
      autoOpenedRef.current = false
    }
  }, [shouldShow, rows.length])

  if (!shouldShow || rows.length === 0) {
    return null
  }

  const maxGram = Math.max(...rows.map((r) => r.gram), 0.001)
  const nKind = rows.length

  return (
    <section
      className="overflow-hidden rounded-3xl border-[2.5px] border-[#6B4A2F] shadow-[0_4px_0_#6B4A2F]"
      style={{ background: '#FFE9D1' }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2.5 border-b-2 border-[#6B4A2F] bg-[#C8602A] px-3.5 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Sparkle size={16} color="#fff" />
        <div className="flex-1">
          <div className="text-base font-extrabold text-white">備料彙總</div>
          <div className="text-[11.5px] font-bold text-[#FFE1C7]">
            共 {nKind} 種材料 · {fmtG(totalGram)}
          </div>
        </div>
        <span className="rounded-full border-2 border-[#6B4A2F] bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-[#C8602A]">
          {open ? '▲ 收起' : '▼ 展開'}
        </span>
      </button>

      {open ? (
        <div className="space-y-1.5 px-4 pb-4 pt-3">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-sm text-[#4A3322]">
                {row.name}
                {row.brand ? (
                  <span className="text-xs text-[#9E8672]"> · {row.brand}</span>
                ) : null}
              </span>
              <span className="w-16 shrink-0 text-right font-[family-name:var(--font-roboto-mono)] text-sm font-extrabold text-[#4A3322]">
                {fmtG(row.gram)}
              </span>
              <div
                className="min-w-0 flex-1 rounded-full border-[1.5px] border-[#6B4A2F] bg-[#E6D3BF]"
                style={{ height: 8 }}
              >
                <div
                  className="h-full rounded-full bg-[#C8602A]"
                  style={{
                    width: `${Math.min(100, (row.gram / maxGram) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-2xl border-2 border-[#6B4A2F] bg-white px-3 py-2.5">
            <span className="text-[14px] font-extrabold text-[#4A3322]">合計</span>
            <span className="font-[family-name:var(--font-roboto-mono)] text-[22px] font-extrabold text-[#C8602A]">
              {fmtG(totalGram)}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  )
}
