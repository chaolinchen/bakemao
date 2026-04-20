'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { calculateExam } from '@/lib/calculator'
import type { IngredientInput } from '@/lib/calculator'
import type { ComponentMoldType } from '@/lib/componentMoldGram'
import { effectiveGramPerUnit } from '@/lib/multiComponentAggregate'
import type { RecipeComponent } from '@/store/calcStore'
import { useCalcStore } from '@/store/calcStore'
import type { RecipeLine } from '@/types/recipe-line'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { Button } from './ui/Button'
import { ConfirmDialog } from './ui/Dialog'
import { NumberInput } from './ui/NumberInput'
import { Stepper } from './ui/Stepper'

function parseNum(s: string | number): number {
  const v = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(v) ? Math.abs(v) : 0
}

const ROUND_SIZES = [4, 5, 6, 7, 8, 9, 10, 12]
const TART_SIZES = [6, 7, 8, 9, 10, 12, 15]
const CUP_COUNTS = [6, 12, 24]

const MOLD_TYPE_OPTS: { value: ComponentMoldType; label: string }[] = [
  { value: 'round', label: '圓模（吋）' },
  { value: 'tart', label: '塔圈（cm）' },
  { value: 'cup', label: '杯型' },
]

function SegmentedTargetMode({
  value,
  onChange,
}: {
  value: 'gram' | 'mold'
  onChange: (v: 'gram' | 'mold') => void
}) {
  return (
    <div className="flex rounded-lg border border-[#D9C9B5] bg-[#FAF6F0] p-0.5">
      {(
        [
          { value: 'gram' as const, label: '輸入克數' },
          { value: 'mold' as const, label: '按模具算' },
        ] as const
      ).map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all duration-150 ${
            value === opt.value
              ? 'bg-white text-[#C8602A] shadow-sm'
              : 'text-[#6B5A4A]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── ComponentCard ──────────────────────────────────────────────────────────

function ComponentCard({
  comp,
  globalQty,
  lossRate,
  onRemove,
  onRemoveIngredient,
}: {
  comp: RecipeComponent
  globalQty: number
  lossRate: number
  onRemove: () => void
  onRemoveIngredient: (line: RecipeLine) => void
}) {
  const updateComponentName = useCalcStore((s) => s.updateComponentName)
  const updateComponentGram = useCalcStore((s) => s.updateComponentGram)
  const updateCompLine = useCalcStore((s) => s.updateCompLine)
  const addCompLine = useCalcStore((s) => s.addCompLine)
  const setComponentTargetMode = useCalcStore((s) => s.setComponentTargetMode)
  const setComponentMold = useCalcStore((s) => s.setComponentMold)
  const setComponentCustomQty = useCalcStore((s) => s.setComponentCustomQty)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [showFormula, setShowFormula] = useState(false)

  const effectiveQty = comp.customQty ?? globalQty
  const isCustomQty = comp.customQty !== null

  const gramForCalc = useMemo(() => effectiveGramPerUnit(comp), [comp])

  const result = useMemo(() => {
    const ing: IngredientInput[] = comp.ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      value: i.value,
      isFixed: i.isFixed,
    }))
    return calculateExam('percent', ing, gramForCalc, effectiveQty, lossRate)
  }, [comp.ingredients, gramForCalc, effectiveQty, lossRate])

  const hasResult = gramForCalc > 0 && comp.ingredients.length > 0

  const maxGram = hasResult
    ? Math.max(...result.ingredients.map((r) => r.gram), 0.001)
    : 1

  const yieldPct = Math.round((1 - lossRate) * 100)
  const totalPct = comp.ingredients
    .filter((i) => !i.isFixed)
    .reduce((s, i) => s + parseNum(i.value), 0)

  const moldVolumeLabel =
    comp.targetMode === 'mold' ? effectiveGramPerUnit(comp) : 0

  return (
    <div className="rounded-2xl border border-[#E5D8C8] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5D8C8] px-4 py-3">
        <input
          className="flex-1 rounded-lg border border-[#D9C9B5] bg-[#FAF6F0] px-3 py-1.5 text-sm font-medium text-[#3D2918] outline-none focus:border-[#C8602A]"
          value={comp.name}
          onChange={(e) => updateComponentName(comp.id, e.target.value)}
          placeholder="例：派皮、蛋糕體、奶油霜"
        />
        <button
          type="button"
          className="shrink-0 text-sm text-red-700 underline"
          onClick={onRemove}
        >
          刪除
        </button>
      </div>

      <div className="px-4 pt-3">
        {/* 目標量模式 */}
        <div className="mb-3">
          <p className="mb-2 text-xs text-[#6B5A4A]">目標量</p>
          <SegmentedTargetMode
            value={comp.targetMode}
            onChange={(m) => setComponentTargetMode(comp.id, m)}
          />
        </div>

        {comp.targetMode === 'gram' ? (
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-3">
              <label className="shrink-0 text-sm text-[#6B5A4A]">每份</label>
              <div className="w-28">
                <NumberInput
                  value={comp.gramPerUnit === 0 ? '' : String(comp.gramPerUnit)}
                  onChange={(e) =>
                    updateComponentGram(comp.id, parseNum(e.target.value))
                  }
                  placeholder="例：225"
                />
              </div>
              <span className="text-sm text-[#8A7968]">g</span>
            </div>
            <p className="text-xs text-[#8A7968]">這組配方，每個成品的目標重量</p>
          </div>
        ) : (
          <div className="mb-3 space-y-3 rounded-xl bg-[#FAF6F0] p-3">
            <div>
              <p className="mb-1.5 text-xs text-[#6B5A4A]">模具類型</p>
              <div className="flex flex-wrap gap-1.5">
                {MOLD_TYPE_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      comp.moldType === opt.value
                        ? 'bg-[#C8602A] text-white'
                        : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                    }`}
                    onClick={() => setComponentMold(comp.id, { moldType: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {comp.moldType !== 'cup' ? (
              <div>
                <p className="mb-1.5 text-xs text-[#6B5A4A]">
                  {comp.moldType === 'round' ? '尺寸（吋）' : '尺寸（cm）'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(comp.moldType === 'round' ? ROUND_SIZES : TART_SIZES).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                          comp.moldSize === s
                            ? 'bg-[#C8602A] text-white'
                            : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                        }`}
                        onClick={() => setComponentMold(comp.id, { moldSize: s })}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-xs text-[#6B5A4A]">杯數</p>
                <div className="flex flex-wrap gap-1.5">
                  {CUP_COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        comp.cupCount === c
                          ? 'bg-[#C8602A] text-white'
                          : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                      }`}
                      onClick={() => setComponentMold(comp.id, { cupCount: c })}
                    >
                      {c} 連
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#8A7968]">
              共 <span className="font-semibold text-[#3D2918]">{moldVolumeLabel}</span>{' '}
              g（1cc≈1g）
            </p>
          </div>
        )}

        {/* 份數 override */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6B5A4A]">份數</span>
          <Stepper
            min={1}
            max={30}
            value={effectiveQty}
            onChange={(q) => setComponentCustomQty(comp.id, q)}
          />
          {isCustomQty ? (
            <button
              type="button"
              className="rounded-full bg-[#F5E6D0] px-2 py-0.5 text-xs font-medium text-[#C8602A]"
              onClick={() => setComponentCustomQty(comp.id, null)}
            >
              已自訂 × 重置
            </button>
          ) : (
            <span className="text-xs text-[#B0A090]">沿用 {globalQty} 份</span>
          )}
        </div>

        <div className="mb-2 space-y-2">
          {comp.ingredients.map((line) => {
            const invalid = parseNum(line.value) === 0
            return (
              <div
                key={line.id}
                className="flex flex-wrap items-end gap-2 rounded-xl bg-[#FAF6F0] px-3 py-2"
              >
                <div className="min-w-[90px] flex-1">
                  <span className="text-xs text-[#6B5A4A]">材料</span>
                  <p className="text-sm font-medium text-[#3D2918]">
                    {line.name}
                    {line.brand ? (
                      <span className="text-xs text-[#8A7968]">
                        {' '}
                        · {line.brand}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="w-20">
                  <label className="text-xs text-[#6B5A4A]">%</label>
                  <NumberInput
                    invalid={invalid}
                    value={line.value === 0 ? '' : String(line.value)}
                    onChange={(e) =>
                      updateCompLine(comp.id, line.id, {
                        value: parseNum(e.target.value),
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="text-sm text-red-700 underline"
                  onClick={() => onRemoveIngredient(line)}
                >
                  刪除
                </button>
              </div>
            )
          })}
        </div>

        <Button
          variant="ghost"
          className="mb-1 w-full border border-dashed border-[#D9C9B5]"
          onClick={() => setSheetOpen(true)}
        >
          + 新增材料
        </Button>

        <p className="mb-3 text-right text-xs text-[#6B5A4A]">
          總計 {totalPct.toFixed(2)} %
        </p>

        {hasResult && result.totalPct > 0 ? (
          <div className="mb-4 rounded-xl border border-[#E5D8C8] bg-[#FAF6F0] p-3">
            <div className="space-y-1.5">
              {result.ingredients.map((row) => (
                <div
                  key={row.name + (row.brand ?? '')}
                  className="flex items-center gap-2"
                >
                  <span className="w-24 shrink-0 truncate text-sm text-[#3D2918]">
                    {row.name}
                    {row.brand ? (
                      <span className="text-xs text-[#8A7968]">
                        {' '}
                        · {row.brand}
                      </span>
                    ) : null}
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-base font-semibold text-[#3D2918]">
                    {row.gram.toFixed(1)} g
                  </span>
                  <div
                    className="flex-1 rounded-full bg-[#E5D8C8]"
                    style={{ height: 6 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (row.gram / maxGram) * 100).toFixed(1)}%`,
                        backgroundColor: '#C8602A',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-2 border-t border-[#E5D8C8] pt-1.5">
                <span className="w-24 shrink-0 text-sm font-semibold text-[#3D2918]">
                  合計
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-base font-semibold text-[#C8602A]">
                  {result.totalGram.toFixed(1)} g
                </span>
              </div>
            </div>

            <div className="mt-2 border-t border-[#E5D8C8] pt-2">
              <button
                type="button"
                className="text-xs text-[#8A7968] underline underline-offset-2"
                onClick={() => setShowFormula((x) => !x)}
              >
                {showFormula ? '收起計算過程' : '顯示計算過程'}
              </button>
              {showFormula ? (
                <p className="mt-1 text-xs text-[#6B5A4A]">
                  每1%的克數：
                  <span className="font-semibold text-[#3D2918]">
                    {result.unitGram.toFixed(3)} g
                  </span>
                  <span className="ml-1 text-[#8A7968]">
                    （= {gramForCalc.toFixed(1)}g × {effectiveQty}個 ÷ {yieldPct}
                    %良率 ÷ 總{result.totalPct.toFixed(0)}%）
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <IngredientSearchSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPick={({ name, brand }) =>
          addCompLine(comp.id, { name, brand, value: 0, isFixed: false })
        }
      />
    </div>
  )
}

// ─── MultiComponentSection ───────────────────────────────────────────────────

export function MultiComponentSection() {
  const {
    components: rawComponents,
    compQuantity: rawCompQuantity,
    compLossRate: rawCompLossRate,
    addComponent,
    removeComponent,
    removeCompLine,
    addCompLineWithId,
    setCompLossRate,
    clearComponents,
  } = useCalcStore(
    useShallow((s) => ({
      components: s.components,
      compQuantity: s.compQuantity,
      compLossRate: s.compLossRate,
      addComponent: s.addComponent,
      removeComponent: s.removeComponent,
      removeCompLine: s.removeCompLine,
      addCompLineWithId: s.addCompLineWithId,
      setCompLossRate: s.setCompLossRate,
      clearComponents: s.clearComponents,
    }))
  )

  const components = rawComponents ?? []
  const compQuantity = rawCompQuantity ?? 6
  const compLossRate = rawCompLossRate ?? 0

  useLayoutEffect(() => {
    if (components.length === 0) addComponent()
  }, [components.length, addComponent])

  const [confirmClear, setConfirmClear] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [showLoss, setShowLoss] = useState(false)
  const [lineToast, setLineToast] = useState<{
    msg: string
    onUndo: () => void
  } | null>(null)
  const lineToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (lineToastTimerRef.current) clearTimeout(lineToastTimerRef.current)
    }
  }, [])

  const deleteIngredientLine = (compId: string, line: RecipeLine) => {
    removeCompLine(compId, line.id)
    const label = line.name + (line.brand ? ` · ${line.brand}` : '')
    if (lineToastTimerRef.current) {
      clearTimeout(lineToastTimerRef.current)
      lineToastTimerRef.current = null
    }
    setLineToast({
      msg: `已刪除 ${label}`,
      onUndo: () => {
        addCompLineWithId(compId, line)
        setLineToast(null)
        if (lineToastTimerRef.current) {
          clearTimeout(lineToastTimerRef.current)
          lineToastTimerRef.current = null
        }
      },
    })
    lineToastTimerRef.current = setTimeout(() => {
      setLineToast(null)
      lineToastTimerRef.current = null
    }, 3000)
  }

  const yieldPct = Math.round((1 - compLossRate) * 100)
  const lossDisplayPct = Math.round(compLossRate * 100)

  if (components.length === 0) {
    return null
  }

  return (
    <>
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-[#3D2918]">多組配方計算</h2>
        <button
          type="button"
          className="text-sm text-red-700 underline"
          onClick={() => setConfirmClear(true)}
        >
          新配方
        </button>
      </div>

      <div className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between text-sm text-[#6B5A4A]"
          onClick={() => setShowLoss((x) => !x)}
        >
          <span>進階：備料損耗比例</span>
          <span className="text-xs text-[#8A7968]">
            {lossDisplayPct > 0
              ? `${lossDisplayPct}%（目前套用中）`
              : '展開設定 ▾'}
          </span>
        </button>

        {showLoss ? (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="w-24">
                <NumberInput
                  value={lossDisplayPct === 0 ? '' : String(lossDisplayPct)}
                  onChange={(e) => {
                    const v = parseNum(e.target.value)
                    setCompLossRate(Math.min(30, v) / 100)
                  }}
                  placeholder="0"
                />
              </div>
              <span className="text-sm text-[#6B5A4A]">%</span>
              {lossDisplayPct > 0 ? (
                <span className="text-xs text-[#8A7968]">
                  材料 = 目標 ÷ {yieldPct}%
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs text-[#8A7968]">
              備料時的預計損耗（沾鍋、試做等），不確定可不填
            </p>
          </div>
        ) : null}
      </div>

      {components.map((comp) => (
        <ComponentCard
          key={comp.id}
          comp={comp}
          globalQty={compQuantity}
          lossRate={compLossRate}
          onRemove={() => setRemoveId(comp.id)}
          onRemoveIngredient={(line) => deleteIngredientLine(comp.id, line)}
        />
      ))}

      <Button
        variant="ghost"
        className="w-full border border-dashed border-[#D9C9B5]"
        onClick={addComponent}
      >
        ＋ 新增組合
      </Button>

      <ConfirmDialog
        open={confirmClear}
        title="開始新配方？"
        message="目前的配方組合將被清除，份數設定將重置為 6。"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearComponents()
          setConfirmClear(false)
        }}
      />

      <ConfirmDialog
        open={removeId !== null}
        title="刪除組合"
        message="確定刪除此組合？"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) removeComponent(removeId)
          setRemoveId(null)
        }}
      />
    </section>

    {lineToast ? (
      <div
        className="fixed bottom-24 left-4 right-4 z-40 flex items-center justify-between gap-3 rounded-xl border border-[#E5D8C8] bg-[#3D2918] px-4 py-3 text-sm text-white shadow-lg"
        style={{
          paddingBottom:
            'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        }}
        role="status"
      >
        <span className="min-w-0 flex-1">{lineToast.msg}</span>
        <button
          type="button"
          className="shrink-0 font-medium text-[#F5E6D0] underline underline-offset-2"
          onClick={() => lineToast.onUndo()}
        >
          復原
        </button>
      </div>
    ) : null}
    </>
  )
}
