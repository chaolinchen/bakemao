'use client'

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { aggregateIngredientsAcrossComponents } from '@/lib/multiComponentAggregate'
import { useCalcStore } from '@/store/calcStore'

export function SummaryCard() {
  const [open, setOpen] = useState(false)
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

  if (!shouldShow || rows.length === 0) {
    return null
  }

  const maxGram = Math.max(...rows.map((r) => r.gram), 0.001)
  const nKind = rows.length

  return (
    <section className="rounded-2xl border border-[#E5D8C8] bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-semibold text-[#3D2918]">
              備料彙總
            </span>
            <span className="text-xs text-[#8A7968]">
              {open ? '▲ 收起' : '▼ 展開'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#6B5A4A]">
            共 {nKind} 種材料・{totalGram.toFixed(1)} g
          </p>
        </div>
      </button>

      {open ? (
        <div className="space-y-1.5 border-t border-[#E5D8C8] px-4 pb-4 pt-2">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-sm text-[#3D2918]">
                {row.name}
                {row.brand ? (
                  <span className="text-xs text-[#8A7968]"> · {row.brand}</span>
                ) : null}
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-sm font-semibold text-[#3D2918]">
                {row.gram.toFixed(1)} g
              </span>
              <div
                className="min-w-0 flex-1 rounded-full bg-[#E5D8C8]"
                style={{ height: 6 }}
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
          <div className="mt-2 flex items-center gap-2 border-t border-[#E5D8C8] pt-2">
            <span className="w-28 shrink-0 text-sm font-semibold text-[#3D2918]">
              合計
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-base font-bold text-[#C8602A]">
              {totalGram.toFixed(1)} g
            </span>
          </div>
        </div>
      ) : null}
    </section>
  )
}
