'use client'

import { useState } from 'react'
import type { LossInput } from '@/lib/calculator'
import { loadSavedRecipes, saveRecipe, deleteRecipe, type SavedRecipe } from '@/lib/savedRecipes'
import { useCalcStore } from '@/store/calcStore'
import { showToast } from '@/lib/toast'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { SavedRecipesSheet } from './SavedRecipesSheet'
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
  const setTargetKind = useCalcStore((s) => s.setTargetKind)
  const setTotalGram = useCalcStore((s) => s.setTotalGram)
  const setMoldUi = useCalcStore((s) => s.setMoldUi)

  const [sheet, setSheet] = useState(false)
  const [confirmMode, setConfirmMode] = useState(false)
  const [pendingMode, setPendingMode] = useState(mode)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [lossAdvanced, setLossAdvanced] = useState(
    () => loss.type === 'manual'
  )
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [recipesSheetOpen, setRecipesSheetOpen] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])

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

      {/* Collapsible tooltip for baking percentage */}
      <div className="mb-3">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-[#6B4A2F] underline underline-offset-2"
          onClick={() => setTooltipOpen((x) => !x)}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E5D8C8] text-[10px] font-bold text-[#6B4A2F]">?</span>
          {mode === 'percent' ? '什麼是烘焙百分比？' : '克數模式說明'}
        </button>
        {tooltipOpen && (
          <div className="mt-2 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] p-3 text-xs text-[#5C4A3A]">
            {mode === 'percent'
              ? '「烘焙百分比」以麵粉重量為 100%，其他材料相對麵粉的比例。例如：麵粉 100%、奶油 80% 代表奶油是麵粉重量的 80%。'
              : '直接輸入每種材料的克數。系統會自動以最重的材料為基準換算比例。'}
          </div>
        )}
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

      {/* Save / Load buttons */}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] py-2 text-xs font-bold text-[#6B4A2F]"
          onClick={() => {
            setSaveName('')
            setSaveDialogOpen(true)
          }}
        >
          儲存配方
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] py-2 text-xs font-bold text-[#6B4A2F]"
          onClick={() => {
            setSavedRecipes(loadSavedRecipes())
            setRecipesSheetOpen(true)
          }}
        >
          我的配方本
        </button>
      </div>

      {/* Inline save dialog */}
      {saveDialogOpen && (
        <div className="mt-2 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] p-3">
          <label className="mb-1 block text-xs text-[#6B5A4A]">配方名稱</label>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value.slice(0, 30))}
            placeholder="例：磅蛋糕 v1"
            className="mb-2 w-full rounded-lg border border-[#D9C9B5] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#6B4A2F]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-[#6B4A2F] bg-[#C8602A] py-1.5 text-xs font-bold text-white"
              onClick={() => {
                const name = saveName.trim() || '未命名配方'
                const moldUiSnapshot = useCalcStore.getState().moldUi
                saveRecipe(name, {
                  kind: 'single',
                  mode,
                  ingredients: ingredients.map((i) => ({
                    id: i.id,
                    name: i.name,
                    brand: i.brand ?? '',
                    value: i.value,
                    isFixed: i.isFixed,
                  })),
                  targetKind: useCalcStore.getState().targetKind,
                  totalGram: useCalcStore.getState().totalGram,
                  loss,
                  moldUi: moldUiSnapshot,
                })
                setSaveDialogOpen(false)
                showToast('配方已儲存')
              }}
            >
              儲存
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-[#D9C9B5] bg-white py-1.5 text-xs text-[#6B5A4A]"
              onClick={() => setSaveDialogOpen(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}
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
          <div>
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
            <p className="mt-1 text-xs text-[#8A7968]">
              目標 × (1 − 比例)，適用於模具填充調整
            </p>
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

      <SavedRecipesSheet
        open={recipesSheetOpen}
        recipes={savedRecipes}
        onClose={() => setRecipesSheetOpen(false)}
        onLoad={(r) => {
          if (r.snapshot.kind !== 'single') return
          const snap = r.snapshot
          clearIngredients()
          setMode(snap.mode)
          for (const ing of snap.ingredients) {
            addLine({ name: ing.name, brand: ing.brand, value: ing.value, isFixed: ing.isFixed })
          }
          if (snap.targetKind === 'mold' || snap.targetKind === 'gram') {
            setTargetKind(snap.targetKind as 'mold' | 'gram')
          }
          if (typeof snap.totalGram === 'number') setTotalGram(snap.totalGram)
          if (snap.moldUi && typeof snap.moldUi === 'object') {
            setMoldUi(snap.moldUi as Parameters<typeof setMoldUi>[0])
          }
          if (snap.loss) setLoss(snap.loss as LossInput)
        }}
        onDelete={(id) => {
          deleteRecipe(id)
          setSavedRecipes((prev) => prev.filter((r) => r.id !== id))
        }}
      />
    </section>
  )
}
