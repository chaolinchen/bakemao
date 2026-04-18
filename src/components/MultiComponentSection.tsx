'use client'

import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { calculateExam } from '@/lib/calculator'
import type { IngredientInput } from '@/lib/calculator'
import type { RecipeComponent } from '@/store/calcStore'
import { useCalcStore } from '@/store/calcStore'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { Button } from './ui/Button'
import { ConfirmDialog } from './ui/Dialog'
import { NumberInput } from './ui/NumberInput'
import { Stepper } from './ui/Stepper'

function parseNum(s: string | number): number {
  const v = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(v) ? Math.abs(v) : 0
}

// ─── ComponentCard ──────────────────────────────────────────────────────────

function ComponentCard({
  comp,
  quantity,
  lossRate,
  onRemove,
}: {
  comp: RecipeComponent
  quantity: number
  lossRate: number
  onRemove: () => void
}) {
  const updateComponentName = useCalcStore((s) => s.updateComponentName)
  const updateComponentGram = useCalcStore((s) => s.updateComponentGram)
  const updateCompLine = useCalcStore((s) => s.updateCompLine)
  const removeCompLine = useCalcStore((s) => s.removeCompLine)
  const addCompLine = useCalcStore((s) => s.addCompLine)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteLineId, setDeleteLineId] = useState<string | null>(null)
  const [showFormula, setShowFormula] = useState(false)

  const result = useMemo(() => {
    const ing: IngredientInput[] = comp.ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      value: i.value,
      isFixed: i.isFixed,
    }))
    return calculateExam('percent', ing, comp.gramPerUnit, quantity, lossRate)
  }, [comp.ingredients, comp.gramPerUnit, quantity, lossRate])

  const hasResult = comp.gramPerUnit > 0 && comp.ingredients.length > 0

  const maxGram = hasResult
    ? Math.max(...result.ingredients.map((r) => r.gram), 0.001)
    : 1

  const yieldPct = Math.round((1 - lossRate) * 100)
  const totalPct = comp.ingredients
    .filter((i) => !i.isFixed)
    .reduce((s, i) => s + parseNum(i.value), 0)

  return (
    <div className="rounded-2xl border border-[#E5D8C8] bg-white shadow-sm">
      {/* 卡片 header */}
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
        {/* 每個重量 */}
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-3">
            <label className="shrink-0 text-sm text-[#6B5A4A]">每個重量</label>
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

        {/* 材料列表 */}
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
                  onClick={() => setDeleteLineId(line.id)}
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

        {/* 結果區 */}
        {hasResult && result.totalPct > 0 ? (
          <div className="mb-4 rounded-xl border border-[#E5D8C8] bg-[#FAF6F0] p-3">
            <div className="space-y-1.5">
              {result.ingredients.map((row) => (
                <div key={row.name + (row.brand ?? '')} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-sm text-[#3D2918]">
                    {row.name}
                    {row.brand ? (
                      <span className="text-xs text-[#8A7968]"> · {row.brand}</span>
                    ) : null}
                  </span>
                  <span className="w-16 shrink-0 text-right font-mono text-base font-semibold text-[#3D2918]">
                    {row.gram.toFixed(1)} g
                  </span>
                  <div className="flex-1 rounded-full bg-[#E5D8C8]" style={{ height: 6 }}>
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
                <span className="w-24 shrink-0 text-sm font-semibold text-[#3D2918]">合計</span>
                <span className="w-16 shrink-0 text-right font-mono text-base font-semibold text-[#C8602A]">
                  {result.totalGram.toFixed(1)} g
                </span>
              </div>
            </div>

            {/* 計算過程（預設收折） */}
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
                    （= {comp.gramPerUnit}g × {quantity}個 ÷ {yieldPct}%良率 ÷ 總{result.totalPct.toFixed(0)}%）
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Sheets / Dialogs */}
      <IngredientSearchSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPick={({ name, brand }) =>
          addCompLine(comp.id, { name, brand, value: 0, isFixed: false })
        }
      />
      <ConfirmDialog
        open={deleteLineId !== null}
        title="刪除材料"
        message="確定刪除此列？"
        onCancel={() => setDeleteLineId(null)}
        onConfirm={() => {
          if (deleteLineId) removeCompLine(comp.id, deleteLineId)
          setDeleteLineId(null)
        }}
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
    setCompQuantity,
    setCompLossRate,
    clearComponents,
  } = useCalcStore(
    useShallow((s) => ({
      components: s.components,
      compQuantity: s.compQuantity,
      compLossRate: s.compLossRate,
      addComponent: s.addComponent,
      removeComponent: s.removeComponent,
      setCompQuantity: s.setCompQuantity,
      setCompLossRate: s.setCompLossRate,
      clearComponents: s.clearComponents,
    }))
  )

  const components = rawComponents ?? []
  const compQuantity = rawCompQuantity ?? 3
  const compLossRate = rawCompLossRate ?? 0

  const [confirmClear, setConfirmClear] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [showLoss, setShowLoss] = useState(false)

  const yieldPct = Math.round((1 - compLossRate) * 100)
  const lossDisplayPct = Math.round(compLossRate * 100)

  // 啟動前：顯示按鈕
  if (components.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#D9C9B5] bg-white/50 p-4 text-center shadow-sm">
        <Button
          variant="ghost"
          className="mx-auto text-base text-[#C8602A]"
          onClick={() => {
            addComponent()
            addComponent()
          }}
        >
          ＋ 同時計算多組配方
        </Button>
        <p className="mt-1 text-xs text-[#8A7968]">
          適合做整個品項，例：派皮 ＋ 派餡、蛋糕體 ＋ 奶油霜
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-[#3D2918]">多組配方計算</h2>
        <button
          type="button"
          className="text-sm text-red-700 underline"
          onClick={() => setConfirmClear(true)}
        >
          清除
        </button>
      </div>

      {/* 全域設定卡 */}
      <div className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
        {/* 數量 */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-[#3D2918]">要做幾個？</span>
            <span className="text-sm font-semibold text-[#C8602A]">{compQuantity} 個</span>
          </div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((q) => (
              <button
                key={q}
                type="button"
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                  compQuantity === q
                    ? 'bg-[#C8602A] text-white'
                    : 'border border-[#D9C9B5] bg-[#FAF6F0] text-[#3D2918] hover:bg-[#F0E8DC]'
                }`}
                onClick={() => setCompQuantity(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <Stepper
            min={1}
            max={30}
            value={compQuantity}
            onChange={setCompQuantity}
          />
        </div>

        {/* 耗損比例（進階，預設收折） */}
        <div className="border-t border-[#F0E8DC] pt-3">
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
      </div>

      {/* 組合卡片列表 */}
      {components.map((comp) => (
        <ComponentCard
          key={comp.id}
          comp={comp}
          quantity={compQuantity}
          lossRate={compLossRate}
          onRemove={() => setRemoveId(comp.id)}
        />
      ))}

      {/* 新增組合按鈕 */}
      <Button
        variant="ghost"
        className="w-full border border-dashed border-[#D9C9B5]"
        onClick={addComponent}
      >
        ＋ 新增組合
      </Button>

      {/* 確認清除 */}
      <ConfirmDialog
        open={confirmClear}
        title="清除多組配方計算"
        message="確定要清除所有組合嗎？"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearComponents()
          setConfirmClear(false)
        }}
      />

      {/* 確認刪除單一組合 */}
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
  )
}
