'use client'

import { useState } from 'react'
import type { LossInput } from '@/lib/calculator'
import { useCalcStore } from '@/store/calcStore'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { Button } from './ui/Button'
import { ConfirmDialog } from './ui/Dialog'
import { NumberInput } from './ui/NumberInput'
import { SegmentControl } from './ui/SegmentControl'

function parseNum(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(n) ? Math.abs(n) : 0
}

export function RecipeInput() {
  const mode = useCalcStore((s) => s.mode)
  const setMode = useCalcStore((s) => s.setMode)
  const loss = useCalcStore((s) => s.loss)
  const setLoss = useCalcStore((s) => s.setLoss)
  const ingredients = useCalcStore((s) => s.ingredients)
  const updateLine = useCalcStore((s) => s.updateLine)
  const removeLine = useCalcStore((s) => s.removeLine)
  const addLine = useCalcStore((s) => s.addLine)
  const clearIngredients = useCalcStore((s) => s.clearIngredients)

  const [sheet, setSheet] = useState(false)
  const [confirmMode, setConfirmMode] = useState(false)
  const [pendingMode, setPendingMode] = useState(mode)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [lossAdvanced, setLossAdvanced] = useState(
    () => loss.type === 'manual'
  )

  const totalPct = ingredients
    .filter((i) => !i.isFixed)
    .reduce((s, i) => s + parseNum(String(i.value)), 0)
  const totalG = ingredients
    .filter((i) => !i.isFixed)
    .reduce((s, i) => s + parseNum(String(i.value)), 0)

  return (
    <section className="rounded-2xl border border-[#E5D8C8] bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 font-serif text-lg text-[#3D2918]">配方</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SegmentControl
          options={[
            { value: 'percent', label: '我有百分比配方' },
            { value: 'gram', label: '我有克數配方' },
          ]}
          value={mode}
          onChange={(v) => {
            if (v === mode) return
            setPendingMode(v)
            setConfirmMode(true)
          }}
        />
      </div>

      <div className="max-h-[min(360px,50vh)] space-y-2 overflow-auto pr-1">
        {ingredients.map((line) => {
          const raw = parseNum(String(line.value))
          const invalid = raw === 0
          return (
            <div
              key={line.id}
              className="flex flex-wrap items-end gap-2 rounded-xl bg-[#FAF6F0] p-2"
            >
              <div className="min-w-[100px] flex-1">
                <span className="text-xs text-[#6B5A4A]">材料</span>
                <p className="font-medium text-[#3D2918]">
                  {line.name}
                  {line.brand ? (
                    <span className="text-xs text-[#8A7968]"> · {line.brand}</span>
                  ) : null}
                </p>
              </div>
              <div className="w-24">
                <label className="text-xs text-[#6B5A4A]">
                  {mode === 'percent' ? '%' : 'g'}
                </label>
                <NumberInput
                  invalid={invalid}
                  value={line.value === 0 ? '' : String(line.value)}
                  onChange={(e) =>
                    updateLine(line.id, {
                      value: parseNum(e.target.value),
                    })
                  }
                />
              </div>
              <SegmentControl
                options={[
                  { value: 'prop', label: '比例' },
                  { value: 'fix', label: '固定' },
                ]}
                value={line.isFixed ? 'fix' : 'prop'}
                onChange={(v) =>
                  updateLine(line.id, { isFixed: v === 'fix' })
                }
              />
              <button
                type="button"
                className="text-sm text-red-700 underline"
                onClick={() => setDeleteId(line.id)}
              >
                刪除
              </button>
              {invalid ? (
                <p className="w-full text-xs text-red-600">
                  請輸入大於 0 的數字
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      <Button
        className="mt-3 h-12 w-full !text-base"
        onClick={() => setSheet(true)}
      >
        + 新增材料
      </Button>

      <p className="mt-2 text-right text-sm text-[#6B5A4A]">
        {mode === 'percent' ? (
          <>總計 {totalPct.toFixed(2)} %</>
        ) : (
          <>總計 {totalG.toFixed(1)} g</>
        )}
      </p>

      <div className="mt-4 border-t border-[#E5D8C8] pt-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-[#3D2918]">耗損 / 備用</span>
          <button
            type="button"
            className="text-xs text-[#C8602A] underline"
            onClick={() => setLossAdvanced((x) => !x)}
          >
            {lossAdvanced ? '使用快捷' : '進階'}
          </button>
        </div>
        {lossAdvanced ? (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#6B5A4A]">耗損比例 0–30%</label>
            <NumberInput
              value={
                loss.type === 'manual'
                  ? String(Math.round(loss.ratio * 1000) / 10)
                  : '0'
              }
              onChange={(e) => {
                const v = parseNum(e.target.value) / 100
                const next: LossInput = {
                  type: 'manual',
                  ratio: Math.min(0.3, v),
                }
                setLoss(next)
              }}
            />
          </div>
        ) : (
          <SegmentControl
            options={[
              { value: '0', label: '備用 +0' },
              { value: '1', label: '備用 +1' },
              { value: '2', label: '備用 +2' },
            ]}
            value={
              loss.type === 'preset'
                ? String(loss.extra)
                : '0'
            }
            onChange={(v) => {
              const extra = Number(v) as 0 | 1 | 2
              setLoss({ type: 'preset', extra })
            }}
          />
        )}
      </div>

      <IngredientSearchSheet
        open={sheet}
        onClose={() => setSheet(false)}
        onPick={({ name, brand }) => {
          addLine({
            name,
            brand,
            value: mode === 'percent' ? 0 : 0,
            isFixed: false,
          })
        }}
      />

      <ConfirmDialog
        open={confirmMode}
        title="切換模式"
        message="切換模式會清空目前輸入，確定嗎？"
        onCancel={() => setConfirmMode(false)}
        onConfirm={() => {
          clearIngredients()
          setMode(pendingMode)
          setConfirmMode(false)
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="刪除材料"
        message="確定刪除此列？"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) removeLine(deleteId)
          setDeleteId(null)
        }}
      />
    </section>
  )
}
