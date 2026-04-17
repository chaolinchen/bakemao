'use client'

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import molds from '@/data/molds.json'
import { getMoldParts } from '@/lib/moldParts'
import { computeResult, useCalcStore, type CalcStateSlice } from '@/store/calcStore'
import { Button } from './ui/Button'
import { captureAndShare } from '@/lib/shareImage'

export function CalcResult() {
  // Object selector must be shallow-compared — else every render gets a new `{}` → infinite loop
  const slice = useCalcStore(
    useShallow((s): CalcStateSlice => ({
      mode: s.mode,
      targetKind: s.targetKind,
      moldVolumeCC: s.moldVolumeCC,
      moldQuantity: s.moldQuantity,
      totalGram: s.totalGram,
      loss: s.loss,
      ingredients: s.ingredients,
      moldUi: s.moldUi,
    }))
  )

  const result = useMemo(
    () => computeResult(slice),
    [slice]
  )

  const propRows = result.ingredients.filter((i) => !i.isFixed)
  const fixRows = result.ingredients.filter((i) => i.isFixed)
  const maxG =
    propRows.length > 0 ? Math.max(...propRows.map((r) => r.gram), 1) : 1

  const lossLabel =
    slice.loss.type === 'manual'
      ? Math.round(slice.loss.ratio * 1000) / 10
      : 0

  const moldTotalCc = useMemo(() => {
    if (slice.targetKind !== 'mold') return 0
    const preset = molds.find((m) => m.id === slice.moldUi.presetId)
    const p = getMoldParts(
      preset,
      slice.moldUi.presetId,
      slice.moldUi.chiffonKey,
      slice.moldUi.shape,
      slice.moldUi.cyl,
      slice.moldUi.box,
      slice.moldUi.muffin,
      slice.moldUi.direct,
      slice.moldQuantity
    )
    return p ? p.volumeCC * p.quantity : 0
  }, [slice.targetKind, slice.moldUi, slice.moldQuantity])

  const empty =
    slice.ingredients.length === 0 ||
    (slice.targetKind === 'mold' && moldTotalCc <= 0) ||
    (slice.targetKind === 'gram' && slice.totalGram <= 0)

  if (empty || (result.totalGram <= 0 && fixRows.length === 0)) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-[#D9C9B5] bg-[#FAF6F0]/80 py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cat-empty-bowl.svg"
          alt=""
          width={120}
          height={120}
          className="mb-2 opacity-90"
        />
        <p className="text-center text-[#6B5A4A]">還沒有材料，新增一個吧</p>
      </section>
    )
  }

  return (
    <section
      id="bakemao-calc-result"
      className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex justify-between gap-2">
        <h2 className="font-serif text-xl text-[#3D2918]">計算結果</h2>
        <Button
          variant="ghost"
          className="!text-xs"
          onClick={() => void captureAndShare('bakemao-calc-result')}
        >
          分享圖
        </Button>
      </div>

      <div className="space-y-3">
        {propRows.map((row, i) => (
          <div key={`${row.name}-${i}`} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                {row.name}
              </span>
              <span
                className="text-[28px] font-bold leading-none text-[#3D2918]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {row.gram.toFixed(1)} g
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#F0E8DC]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(row.gram / maxG) * 100}%`,
                  backgroundColor: '#C8602A',
                  minWidth: row.gram > 0 ? '4px' : 0,
                  height: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {fixRows.length ? (
        <div className="mt-6 rounded-xl bg-[#EDE4D6] p-3">
          <p className="mb-2 text-xs text-[#8A7968]">固定用量</p>
          {fixRows.map((row, j) => (
            <div
              key={`fix-${row.name}-${j}`}
              className="flex justify-between font-mono text-lg"
            >
              <span style={{ fontFamily: 'var(--font-noto-serif)' }}>
                {row.name}
              </span>
              <span>{row.gram.toFixed(1)} g</span>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-[#8A7968]">
        {slice.loss.type === 'manual'
          ? `含 ${lossLabel}% 備用量（固定材料不納入備用倍率計算）`
          : `備用：+${slice.loss.type === 'preset' ? slice.loss.extra : 0} 份（預設備貨）`}
      </p>
    </section>
  )
}
