'use client'

import html2canvas from 'html2canvas'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { calculateExam } from '@/lib/calculator'
import type { IngredientInput } from '@/lib/calculator'
import { CAKE_TYPE_PRESETS } from '@/lib/componentMoldGram'
import type { CakeType, ComponentMoldType } from '@/lib/componentMoldGram'
import { aggregateIngredientsAcrossComponents, effectiveGramPerUnit } from '@/lib/multiComponentAggregate'
import { loadSavedRecipes, saveRecipe, deleteRecipe, type SavedRecipe } from '@/lib/savedRecipes'
import { showToast } from '@/lib/toast'
import type { RecipeComponent } from '@/store/calcStore'
import { useCalcStore } from '@/store/calcStore'
import type { RecipeLine } from '@/types/recipe-line'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { SavedRecipesSheet } from './SavedRecipesSheet'
import { ConfirmDialog } from './ui/Dialog'
import { NumberInput } from './ui/NumberInput'
import { Sparkle } from './ui/Sparkle'
import { Stepper } from './ui/Stepper'

function parseNum(s: string | number): number {
  const v = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(v) ? Math.abs(v) : 0
}

const ROUND_SIZES_INCH = [4, 5, 6, 7, 8, 9, 10, 12]
const ROUND_SIZES_CM = [15, 17, 18, 20, 22, 24, 26]
const TART_SIZES = [6, 7, 8, 9, 10, 12, 15]

const MOLD_TYPE_OPTS: { value: ComponentMoldType; label: string }[] = [
  { value: 'round', label: '圓模（吋）' },
  { value: 'tart', label: '塔圈（cm）' },
  { value: 'cup', label: '杯型' },
]

const CAKE_TYPE_OPTS: { value: CakeType; label: string }[] = [
  { value: 'mousse', label: '慕斯類' },
  { value: 'pound', label: '磅蛋糕' },
  { value: 'sponge', label: '海綿蛋糕' },
  { value: 'chiffon', label: '戚風蛋糕' },
  { value: 'custom', label: '自訂' },
]

const CAKE_TYPE_INFO: Record<CakeType, { whip: string; desc: string; examples: string }> = {
  mousse: {
    whip: '不打發',
    desc: '直接混合或融化後倒入模具，麵糊密度接近水，幾乎填滿模具。',
    examples: '慕斯、生乳酪蛋糕、義式奶酪、布丁',
  },
  pound: {
    whip: '奶油打發',
    desc: '奶油加糖打發至蓬鬆泛白，麵糊濃稠，進爐後適度膨脹。',
    examples: '磅蛋糕、瑪德蓮、費南雪',
  },
  sponge: {
    whip: '全蛋打發',
    desc: '全蛋加糖隔水打發，呈現濃稠緞帶狀，充滿細緻氣泡，膨脹顯著。',
    examples: '海綿蛋糕、蛋糕捲、草莓蛋糕底',
  },
  chiffon: {
    whip: '蛋白打發',
    desc: '蛋白打發至乾性發泡，麵糊最輕盈，需中空模才能支撐組織攀爬。',
    examples: '戚風蛋糕、天使蛋糕',
  },
  custom: {
    whip: '自訂',
    desc: '適合特殊配方或參考烘焙書數值，自行輸入比重與填充率。',
    examples: '',
  },
}

function SegmentedTargetMode({
  value,
  onChange,
}: {
  value: 'gram' | 'mold'
  onChange: (v: 'gram' | 'mold') => void
}) {
  return (
    <div className="flex gap-1 rounded-[14px] border-2 border-[#6B4A2F] bg-[#FFE1C7] p-1">
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
          className={`flex-1 rounded-[10px] py-2 text-[13px] font-extrabold transition-all duration-150 ${
            value === opt.value
              ? 'border-2 border-[#6B4A2F] bg-white text-[#C8602A]'
              : 'text-[#9E8672]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── PercentTooltip ─────────────────────────────────────────────────────────

function PercentTooltip() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-[#6B4A2F] underline underline-offset-2"
        onClick={() => setOpen((x) => !x)}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E5D8C8] text-[10px] font-bold text-[#6B4A2F]">?</span>
        烘焙百分比說明
      </button>
      {open && (
        <div className="mt-1.5 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] p-3 text-[11px] text-[#5C4A3A]">
          「烘焙百分比」以麵粉重量為 100%，其他材料相對麵粉的比例。例如：麵粉 100%、奶油 80% 代表奶油是麵粉重量的 80%。
        </div>
      )}
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
  const insertCompLineAfter = useCalcStore((s) => s.insertCompLineAfter)
  const duplicateComponent = useCalcStore((s) => s.duplicateComponent)
  const setComponentTargetMode = useCalcStore((s) => s.setComponentTargetMode)
  const setComponentMold = useCalcStore((s) => s.setComponentMold)
  const setComponentCustomQty = useCalcStore((s) => s.setComponentCustomQty)
  const setComponentGramMode = useCalcStore((s) => s.setComponentGramMode)
  const setCompLineGramValue = useCalcStore((s) => s.setCompLineGramValue)

  const roundUnit = comp.roundUnit ?? 'inch'
  const roundHeight = comp.roundHeight ?? 6
  const isGramMode = comp.gramMode ?? false
  const gramValues = comp.gramValues ?? {}

  // 克數模式：找最大 g 值作為基底（100%）
  const gramEntries = comp.ingredients.map((ing) => ({
    id: ing.id,
    g: gramValues[ing.id] ?? 0,
  }))
  const baseGram = Math.max(...gramEntries.map((e) => e.g), 0)
  const baseId = baseGram > 0
    ? gramEntries.reduce((a, b) => (a.g >= b.g ? a : b)).id
    : null
  const derivedPcts: Record<string, number> = {}
  for (const e of gramEntries) {
    derivedPcts[e.id] = baseGram > 0 ? (e.g / baseGram) * 100 : 0
  }

  const [sheetOpen, setSheetOpen] = useState(false)
  const [showFormula, setShowFormula] = useState(false)

  const effectiveQty = comp.customQty ?? globalQty
  const isCustomQty = comp.customQty !== null

  const gramForCalc = useMemo(
    () => (isGramMode ? baseGram : effectiveGramPerUnit(comp)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comp, isGramMode, baseGram]
  )

  const result = useMemo(() => {
    const ing: IngredientInput[] = comp.ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      value: isGramMode ? (derivedPcts[i.id] ?? 0) : i.value,
      isFixed: i.isFixed,
    }))
    return calculateExam('percent', ing, gramForCalc, effectiveQty, lossRate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comp.ingredients, gramForCalc, effectiveQty, lossRate, isGramMode, derivedPcts])

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
    <div className="overflow-hidden rounded-3xl border-[2.5px] border-[#6B4A2F] bg-[#FFFBF2] shadow-[0_4px_0_#6B4A2F]">
      {/* 三花貓 tricolor tab */}
      <div
        className="border-b-[2.5px] border-[#6B4A2F]"
        style={{
          height: 10,
          background:
            'linear-gradient(90deg, #E8955A 0 33.33%, #FFFBF2 33.33% 66.66%, #3D2918 66.66% 100%)',
        }}
      />
      <div className="flex items-center gap-2 border-b-2 border-dashed border-[#D0A578] px-3.5 py-3">
        <input
          className="flex-1 rounded-xl border-2 border-[#6B4A2F] bg-[#FFE1C7] px-3 py-2 text-[15px] font-extrabold text-[#4A3322] outline-none"
          value={comp.name}
          onChange={(e) => updateComponentName(comp.id, e.target.value)}
          placeholder="例：派皮、蛋糕體、奶油霜"
        />
        <button
          type="button"
          className="shrink-0 flex h-8 items-center rounded-[10px] border-2 border-[#6B4A2F] bg-white px-2 text-[11.5px] font-extrabold text-[#6B4A2F]"
          title="複製此組合"
          onClick={() => duplicateComponent(comp.id)}
        >
          複製
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-[#6B4A2F] bg-white text-base font-extrabold text-[#B54728]"
          title="刪除此組合"
          onClick={onRemove}
        >
          ×
        </button>
      </div>

      <div className="px-4 pt-3">
        {/* 輸入模式切換 */}
        <div className="mb-3">
          <div className="flex gap-1 rounded-[14px] border-2 border-[#6B4A2F] bg-[#FFE1C7] p-1">
            {(
              [
                { value: false, label: '% 比例輸入' },
                { value: true, label: 'g 克數輸入' },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setComponentGramMode(comp.id, opt.value)}
                className={`flex-1 rounded-[10px] py-2 text-[13px] font-extrabold transition-all duration-150 ${
                  isGramMode === opt.value
                    ? 'border-2 border-[#6B4A2F] bg-white text-[#C8602A]'
                    : 'text-[#9E8672]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {isGramMode && (
            <p className="mt-1.5 text-[10px] text-[#8A7968]">
              輸入每份的實際克數，克數最高的材料自動設為基底（100%）
            </p>
          )}
        </div>

        {/* 目標量模式（克數模式下自動用 g 最大值，隱藏此設定） */}
        {!isGramMode && (
        <div className="mb-3">
          <p className="mb-2 text-xs text-[#6B5A4A]">目標量</p>
          <SegmentedTargetMode
            value={comp.targetMode}
            onChange={(m) => setComponentTargetMode(comp.id, m)}
          />
        </div>
        )}

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
          <div className="mb-3 space-y-3 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFE1C7] p-3">
            <div>
              <p className="mb-1.5 text-xs text-[#6B5A4A]">模具類型</p>
              <div className="flex flex-wrap gap-1.5">
                {MOLD_TYPE_OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`rounded-[10px] border-2 border-[#6B4A2F] px-3 py-1.5 text-xs font-extrabold transition-all ${
                      comp.moldType === opt.value
                        ? 'bg-[#C8602A] text-white'
                        : 'bg-[#FFFBF2] text-[#6B4A2F]'
                    }`}
                    onClick={() => setComponentMold(comp.id, { moldType: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {comp.moldType !== 'cup' && (
              <div>
                <p className="mb-1.5 text-xs text-[#6B5A4A]">蛋糕類型</p>
                <div className="flex flex-wrap gap-1.5">
                  {CAKE_TYPE_OPTS.map((opt) => {
                    const active = (comp.cakeType ?? 'mousse') === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`rounded-[10px] border-2 border-[#6B4A2F] px-3 py-1.5 text-xs font-extrabold transition-all ${
                          active
                            ? 'bg-[#6B4A2F] text-white'
                            : 'bg-[#FFFBF2] text-[#6B4A2F]'
                        }`}
                        onClick={() => setComponentMold(comp.id, { cakeType: opt.value })}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                {/* 選中類型展開說明 */}
                {(() => {
                  const ct = comp.cakeType ?? 'mousse'
                  const info = CAKE_TYPE_INFO[ct]
                  if (ct === 'custom') {
                    return (
                      <div className="mt-2 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] p-3 text-xs text-[#5C4A3A]">
                        <p className="mb-2 text-[#8A7968]">{info.desc}</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-[#6B5A4A]">比重</label>
                            <div className="w-20">
                              <NumberInput
                                value={String(comp.customGravity ?? 0.85)}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value)
                                  if (Number.isFinite(v) && v > 0 && v <= 1.0) {
                                    setComponentMold(comp.id, { customGravity: v })
                                  }
                                }}
                                placeholder="0.85"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[#6B5A4A]">填充率 %</label>
                            <div className="w-20">
                              <NumberInput
                                value={String(Math.round((comp.customFillRate ?? 0.8) * 100))}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value)
                                  if (Number.isFinite(v) && v > 0 && v <= 100) {
                                    setComponentMold(comp.id, { customFillRate: v / 100 })
                                  }
                                }}
                                placeholder="80"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  const preset = CAKE_TYPE_PRESETS[ct as keyof typeof CAKE_TYPE_PRESETS]
                  return (
                    <div className="mt-2 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] p-3 text-xs text-[#5C4A3A]">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border-2 border-[#6B4A2F] bg-[#FFE1C7] px-2.5 py-0.5 text-[12px] font-extrabold text-[#8B3B1C]">
                          {info.whip}
                        </span>
                        {gramForCalc > 0 && (
                          <span className="font-semibold text-[#3D2918]">
                            此設定約需 {gramForCalc.toFixed(0)} g 麵糊
                          </span>
                        )}
                      </div>
                      <p className="mb-1 text-[#5C4A3A]">{info.desc}</p>
                      {info.examples && (
                        <p className="mb-1 text-[#8A7968]">例：{info.examples}</p>
                      )}
                      <p className="text-[10px] text-[#B0A090]">
                        比重 {preset.gravity.toFixed(2)} · 填充率 {Math.round(preset.fillRate * 100)}%
                      </p>
                    </div>
                  )
                })()}
              </div>
            )}

            {comp.moldType !== 'cup' ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs text-[#6B5A4A]">
                    {comp.moldType === 'round'
                      ? `尺寸（${roundUnit === 'cm' ? 'cm' : '吋'}）`
                      : '尺寸（cm）'}
                  </p>
                  {comp.moldType === 'round' && (
                    <div className="flex overflow-hidden rounded-[10px] border-2 border-[#6B4A2F]">
                      {(['inch', 'cm'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          className={`px-2 py-0.5 text-xs font-extrabold transition-all ${
                            roundUnit === u
                              ? 'bg-[#C8602A] text-white'
                              : 'bg-white text-[#6B4A2F]'
                          }`}
                          onClick={() =>
                            setComponentMold(comp.id, {
                              roundUnit: u,
                              moldSize: u === 'cm' ? 17 : 8,
                            })
                          }
                        >
                          {u === 'inch' ? '吋' : 'cm'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(comp.moldType === 'round'
                    ? roundUnit === 'cm'
                      ? ROUND_SIZES_CM
                      : ROUND_SIZES_INCH
                    : TART_SIZES
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`rounded-[10px] border-2 border-[#6B4A2F] px-2.5 py-1 text-xs font-extrabold transition-all ${
                        comp.moldSize === s
                          ? 'bg-[#C8602A] text-white'
                          : 'bg-[#FFFBF2] text-[#6B4A2F]'
                      }`}
                      onClick={() => setComponentMold(comp.id, { moldSize: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-xs text-[#6B5A4A]">每杯容積（cc）</p>
                <div className="flex flex-wrap gap-1.5">
                  {([63, 80, 90, 100, 120, 166] as const).map((cc) => (
                    <button
                      key={cc}
                      type="button"
                      className={`rounded-[10px] border-2 border-[#6B4A2F] px-3 py-1.5 text-xs font-extrabold transition-all ${
                        comp.cupCount === cc
                          ? 'bg-[#C8602A] text-white'
                          : 'bg-[#FFFBF2] text-[#6B4A2F]'
                      }`}
                      onClick={() => setComponentMold(comp.id, { cupCount: cc })}
                    >
                      {cc} cc
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-[#8A7968]">
                  每杯 <span className="font-semibold text-[#3D2918]">{comp.cupCount}</span> g；份數設定做幾個
                </p>
              </div>
            )}

            {comp.moldType === 'round' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#6B5A4A]">模具高度</label>
                <div className="w-16">
                  <NumberInput
                    value={String(roundHeight)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (Number.isFinite(v) && v > 0 && v <= 25) {
                        setComponentMold(comp.id, { roundHeight: v })
                      }
                    }}
                    placeholder="6"
                  />
                </div>
                <span className="text-xs text-[#8A7968]">cm</span>
              </div>
            )}
            {comp.moldType !== 'cup' && (
              <p className="text-xs text-[#8A7968]">
                共 <span className="font-semibold text-[#3D2918]">{moldVolumeLabel}</span>{' '}
                g（1cc≈1g）
              </p>
            )}
          </div>
        )}

        {/* 份數 override */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#6B5A4A]">份數</span>
          <Stepper
            min={1}
            max={200}
            value={effectiveQty}
            onChange={(q) => setComponentCustomQty(comp.id, q)}
          />
          {isCustomQty ? (
            <button
              type="button"
              className="rounded-full border-2 border-[#6B4A2F] bg-[#FFE1C7] px-2.5 py-0.5 text-xs font-extrabold text-[#C8602A]"
              title="每組可以獨立設定份數，不設定則沿用全局份數。點此重置為全局份數。"
              onClick={() => setComponentCustomQty(comp.id, null)}
            >
              已自訂 × 重置
            </button>
          ) : (
            <span
              className="text-xs text-[#B0A090]"
              title="每組可以獨立設定份數，不設定則沿用全局份數"
            >
              沿用 {globalQty} 份
            </span>
          )}
        </div>

        {comp.ingredients.length > 0 && (
          <p className="mb-1.5 text-[10px] text-[#B0A090]">
            主要材料（通常為麵粉）設 100，其他材料填相對比例
          </p>
        )}

        {/* Collapsible percent tooltip */}
        {!isGramMode && <PercentTooltip />}

        <div className="mb-2 space-y-2">
          {comp.ingredients.map((line) => {
            const invalid = isGramMode
              ? (gramValues[line.id] ?? 0) === 0
              : parseNum(line.value) === 0
            const isBase = isGramMode && line.id === baseId
            return (
              <div
                key={line.id}
                className={`flex flex-wrap items-end gap-2 rounded-2xl border-2 border-[#6B4A2F] px-3 py-3 shadow-[0_2px_0_#6B4A2F] ${isBase ? 'bg-[#FFE1C7]' : 'bg-white'}`}
              >
                <div className="min-w-[90px] flex-1">
                  <p className="text-sm font-medium text-[#3D2918]">
                    {line.name}
                    {line.brand ? (
                      <span className="text-xs text-[#8A7968]">
                        {' '}
                        · {line.brand}
                      </span>
                    ) : null}
                    {isBase && (
                      <span className="ml-1.5 rounded-full border border-[#6B4A2F] bg-[#C8602A] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                        基底
                      </span>
                    )}
                  </p>
                  {isGramMode && (gramValues[line.id] ?? 0) > 0 && (
                    <p className="text-[10px] text-[#B0A090]">
                      {derivedPcts[line.id]?.toFixed(1) ?? '0'} %
                    </p>
                  )}
                </div>
                {isGramMode ? (
                  <div className="w-20">
                    <label className="text-xs text-[#6B5A4A]">g</label>
                    <NumberInput
                      invalid={invalid}
                      value={(gramValues[line.id] ?? 0) === 0 ? '' : String(gramValues[line.id])}
                      onChange={(e) =>
                        setCompLineGramValue(comp.id, line.id, parseNum(e.target.value))
                      }
                    />
                  </div>
                ) : (
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
                )}
                <button
                  type="button"
                  className="text-xs text-[#8A7968] underline underline-offset-2"
                  onClick={() =>
                    insertCompLineAfter(comp.id, line.id, {
                      name: line.name,
                      brand: line.brand,
                      value: line.value,
                      isFixed: line.isFixed,
                    })
                  }
                >
                  複製
                </button>
                <button
                  type="button"
                  className="text-xs text-red-700 underline underline-offset-2"
                  onClick={() => onRemoveIngredient(line)}
                >
                  刪除
                </button>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className="mb-1 flex w-full items-center justify-center gap-1.5 rounded-2xl border-[2.5px] border-dashed border-[#6B4A2F] bg-[#FFFBF2] py-3 text-[13.5px] font-extrabold text-[#6B4A2F]"
          onClick={() => setSheetOpen(true)}
        >
          + 新增材料
        </button>

        <div className="mb-3 flex items-center justify-end gap-1.5">
          {isGramMode ? (
            <span className="text-xs text-[#6B5A4A]">
              合計 {gramEntries.reduce((s, e) => s + (e.g ?? 0), 0).toFixed(1)} g
            </span>
          ) : (
            <>
              <span className="text-xs text-[#6B5A4A]">
                合計 {totalPct.toFixed(1)} %
              </span>
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#D9C9B5] text-[10px] text-[#8A7968] cursor-default"
                title="烘焙百分比：主要材料（通常為麵粉）設為 100，其他材料為相對比例。合計通常遠超 100，是正常的。"
              >
                ?
              </span>
            </>
          )}
        </div>

        {hasResult && result.totalPct > 0 ? (
          <div className="mb-4 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] p-3">
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
                  <span className="w-20 shrink-0 whitespace-nowrap text-right font-mono text-base font-semibold text-[#3D2918]">
                    {row.gram.toFixed(1)} g
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
              <div className="mt-1.5 flex items-center gap-2 border-t-2 border-[#6B4A2F] pt-1.5">
                <span className="w-24 shrink-0 text-sm font-extrabold text-[#4A3322]">
                  合計
                </span>
                <span className="w-20 shrink-0 whitespace-nowrap text-right font-[family-name:var(--font-roboto-mono)] text-base font-extrabold text-[#C8602A]">
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

// ─── Template recipes ────────────────────────────────────────────────────────

type TemplateIngredient = { name: string; value: number }
type RecipeTemplate = {
  id: string
  label: string
  description: string
  gramPerUnit: number
  ingredients: TemplateIngredient[]
  cakeType?: CakeType
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'pound-cake',
    label: '法式磅蛋糕',
    description: '1:1:0.8:0.8 黃金比例，適合初學者',
    gramPerUnit: 450,
    cakeType: 'pound' as CakeType,
    ingredients: [
      { name: '中筋麵粉', value: 100 },
      { name: '無鹽奶油', value: 100 },
      { name: '細砂糖', value: 80 },
      { name: '全蛋', value: 80 },
    ],
  },
  {
    id: 'chiffon-cake',
    label: '戚風蛋糕',
    description: '蛋黃糊＋蛋白霜，輕盈口感',
    gramPerUnit: 600,
    cakeType: 'chiffon' as CakeType,
    ingredients: [
      { name: '低筋麵粉', value: 100 },
      { name: '蛋黃', value: 60 },
      { name: '沙拉油', value: 50 },
      { name: '牛奶', value: 50 },
      { name: '蛋白', value: 180 },
      { name: '細砂糖', value: 100 },
    ],
  },
  {
    id: 'sponge-cake',
    label: '海綿蛋糕',
    description: '全蛋打發，合計 410%，共五組材料',
    gramPerUnit: 600,
    cakeType: 'sponge' as CakeType,
    ingredients: [
      { name: '全蛋', value: 150 },
      { name: '蛋黃', value: 25 },
      { name: '砂糖', value: 93 },
      { name: '鹽', value: 1 },
      { name: '低筋麵粉', value: 100 },
      { name: '香草粉', value: 1 },
      { name: '奶粉', value: 2 },
      { name: '熱水', value: 18 },
      { name: '沙拉油', value: 20 },
    ],
  },
]

function TemplateDialog({
  open,
  onClose,
  onApply,
}: {
  open: boolean
  onClose: () => void
  onApply: (tpl: RecipeTemplate) => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="關閉"
        onClick={onClose}
      />
      <div className="mao-card relative w-full max-w-sm p-5">
        <h3 className="text-lg font-extrabold text-[#4A3322]">範本配方</h3>
        <p className="mt-1 text-xs text-[#9E8672]">
          套用後會新增一組配方，你可以繼續修改比例。
        </p>
        <div className="mt-4 space-y-3">
          {RECIPE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl border-2 border-[#6B4A2F] bg-[#FFE9D1] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#3D2918]">{tpl.label}</p>
                  <p className="mt-0.5 text-xs text-[#8A7968]">{tpl.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tpl.ingredients.map((ing) => (
                      <span
                        key={ing.name}
                        className="rounded-full border border-[#6B4A2F] bg-[#FFFBF2] px-2 py-0.5 text-xs font-extrabold text-[#6B4A2F]"
                      >
                        {ing.name} {ing.value}%
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl border-2 border-[#6B4A2F] bg-[#C8602A] px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
                  onClick={() => {
                    onApply(tpl)
                    onClose()
                  }}
                >
                  套用
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-[#6B5A4A] transition hover:bg-black/5"
          onClick={onClose}
        >
          取消
        </button>
      </div>
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
    addComponentFromTemplate,
    removeComponent,
    removeCompLine,
    addCompLineWithId,
    setCompLossRate,
    clearComponents,
    setComponentTargetMode,
  } = useCalcStore(
    useShallow((s) => ({
      components: s.components,
      compQuantity: s.compQuantity,
      compLossRate: s.compLossRate,
      addComponent: s.addComponent,
      addComponentFromTemplate: s.addComponentFromTemplate,
      removeComponent: s.removeComponent,
      removeCompLine: s.removeCompLine,
      addCompLineWithId: s.addCompLineWithId,
      setCompLossRate: s.setCompLossRate,
      clearComponents: s.clearComponents,
      setComponentTargetMode: s.setComponentTargetMode,
    }))
  )

  const components = rawComponents ?? []
  const compQuantity = rawCompQuantity ?? 6
  const compLossRate = rawCompLossRate ?? 0

  // 等 Zustand persist rehydration 完成後，若仍為空才補一個預設組合
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    // client-only：persist 在 SSR 不存在
    if (useCalcStore.persist?.hasHydrated?.()) {
      setHydrated(true)
      return
    }
    const unsub = useCalcStore.persist?.onFinishHydration?.(() => setHydrated(true))
    return unsub ?? undefined
  }, [])
  useEffect(() => {
    if (hydrated && components.length === 0) addComponent()
  }, [hydrated, components.length, addComponent])

  const [confirmClear, setConfirmClear] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [showLoss, setShowLoss] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [multiSaveDialogOpen, setMultiSaveDialogOpen] = useState(false)
  const [multiSaveName, setMultiSaveName] = useState('')
  const [multiRecipesSheetOpen, setMultiRecipesSheetOpen] = useState(false)
  const [multiSavedRecipes, setMultiSavedRecipes] = useState<SavedRecipe[]>([])

  const handleScreenshot = async () => {
    const el = document.querySelector('main')
    if (!el) return
    setScreenshotting(true)
    try {
      const mainEl = el as HTMLElement
      const canvas = await html2canvas(mainEl, {
        backgroundColor: '#F7F0E6',
        scale: 2,
        useCORS: true,
        width: mainEl.offsetWidth,
        height: mainEl.scrollHeight,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        onclone: (_doc, cloned) => {
          // 隱藏輸入框邊框，讓截圖像乾淨備料單
          cloned.querySelectorAll('input').forEach((inp) => {
            inp.style.border = 'none'
            inp.style.background = 'transparent'
            inp.style.outline = 'none'
          })
          // 隱藏按鈕類（刪除/複製/展開）
          cloned.querySelectorAll('button').forEach((btn) => {
            const t = btn.textContent?.trim() ?? ''
            if (['刪除', '複製', '復原', '收起計算過程', '顯示計算過程'].includes(t)) {
              btn.style.display = 'none'
            }
          })
        },
      })
      // 加 watermark
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = `bold ${30}px sans-serif`
        ctx.fillStyle = 'rgba(200, 96, 42, 0.55)'
        ctx.textAlign = 'right'
        ctx.fillText('BakeMao 烘焙貓', canvas.width - 32, canvas.height - 32)
      }
      setScreenshotUrl(canvas.toDataURL('image/png'))
    } finally {
      setScreenshotting(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshotUrl) return
    const a = document.createElement('a')
    a.href = screenshotUrl
    a.download = 'bakemao-配方.png'
    a.click()
  }

  const handleExportCsv = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQty = snapshot.compQuantity ?? 6
    const lossRate = snapshot.compLossRate ?? 0

    const rows: string[][] = [['組合', '材料', '烘焙百分比', '克數']]

    for (const comp of comps) {
      const gramForCalc = effectiveGramPerUnit(comp)
      const qty = comp.customQty ?? globalQty
      const gramMap = new Map<string, number>()
      if (gramForCalc > 0 && comp.ingredients.length > 0) {
        const result = calculateExam(
          'percent',
          comp.ingredients.map((i) => ({ name: i.name, brand: i.brand, value: i.value, isFixed: i.isFixed })),
          gramForCalc,
          qty,
          lossRate
        )
        for (const r of result.ingredients) {
          gramMap.set(`${r.name}\0${r.brand ?? ''}`, r.gram)
        }
      }
      for (const ing of comp.ingredients) {
        const key = `${ing.name}\0${ing.brand ?? ''}`
        const gram = gramMap.get(key)
        const label = ing.name + (ing.brand ? ` · ${ing.brand}` : '')
        rows.push([comp.name, label, `${ing.value}%`, gram != null ? `${gram.toFixed(1)}` : ''])
      }
    }

    // 備料彙總
    const { rows: summaryRows, totalGram } = aggregateIngredientsAcrossComponents(comps, globalQty, lossRate)
    if (summaryRows.length > 0) {
      rows.push([])
      rows.push(['備料彙總（跨組合加總）', '', '', ''])
      for (const r of summaryRows) {
        const label = r.name + (r.brand ? ` · ${r.brand}` : '')
        rows.push(['', label, '', r.gram.toFixed(1)])
      }
      rows.push(['', '合計', '', totalGram.toFixed(1)])
    }

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const bom = '\uFEFF' // UTF-8 BOM for Excel
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bakemao-配方.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
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
      <div className="flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-[#4A3322]">
          <span className="inline-flex rounded-full border-2 border-[#6B4A2F] bg-[#FFD089] p-1 shadow-[0_2px_0_#6B4A2F]">
            <Sparkle size={12} color="#C8602A" />
          </span>
          多組配方計算
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] sm:flex"
            onClick={handleExportCsv}
          >
            匯出 CSV
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] disabled:opacity-50"
            onClick={() => void handleScreenshot()}
            disabled={screenshotting}
          >
            {screenshotting ? '截圖中…' : '截圖'}
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]"
            onClick={() => {
              setMultiSaveName('')
              setMultiSaveDialogOpen(true)
            }}
          >
            儲存配方
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]"
            onClick={() => {
              setMultiSavedRecipes(loadSavedRecipes())
              setMultiRecipesSheetOpen(true)
            }}
          >
            配方本
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]"
            onClick={() => setShowTemplates(true)}
          >
            範本
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-2.5 py-1 text-[12.5px] font-extrabold text-white shadow-[0_2px_0_#6B4A2F]"
            onClick={() => setConfirmClear(true)}
          >
            + 新配方
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#6B4A2F] bg-white px-3.5 py-3 shadow-[0_3px_0_#6B4A2F]">
        <button
          type="button"
          className="flex w-full items-center justify-between text-[13.5px] text-[#6B5A4A]"
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

      {/* 空狀態：唯一組合且無材料時，顯示範本入口 */}
      {components.length === 1 && components[0].ingredients.length === 0 && (
        <div className="rounded-3xl border-[2.5px] border-dashed border-[#6B4A2F] bg-[#FFFBF2] p-4 text-center">
          <p className="mb-1 text-sm font-extrabold text-[#4A3322]">第一次使用？</p>
          <p className="mb-3 text-xs text-[#9E8672]">套用範本配方快速開始，或直接加材料自行輸入。</p>
          <button
            type="button"
            className="rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
            onClick={() => setShowTemplates(true)}
          >
            套用範本配方
          </button>
        </div>
      )}

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

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border-[2.5px] border-dashed border-[#6B4A2F] bg-transparent py-3 text-[14px] font-extrabold text-[#6B4A2F]"
        onClick={addComponent}
      >
        ＋ 新增組合
      </button>

      {/* Inline save dialog */}
      {multiSaveDialogOpen && (
        <div className="rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] p-3">
          <label className="mb-1 block text-xs text-[#6B5A4A]">配方名稱</label>
          <input
            type="text"
            value={multiSaveName}
            onChange={(e) => setMultiSaveName(e.target.value.slice(0, 30))}
            placeholder="例：生日蛋糕組合"
            className="mb-2 w-full rounded-lg border border-[#D9C9B5] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#6B4A2F]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-[#6B4A2F] bg-[#C8602A] py-1.5 text-xs font-bold text-white"
              onClick={() => {
                const name = multiSaveName.trim() || '未命名配方'
                saveRecipe(name, {
                  kind: 'multi',
                  components,
                  compQuantity: compQuantity ?? 6,
                  compLossRate: compLossRate ?? 0,
                })
                setMultiSaveDialogOpen(false)
                showToast('配方已儲存')
              }}
            >
              儲存
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-[#D9C9B5] bg-white py-1.5 text-xs text-[#6B5A4A]"
              onClick={() => setMultiSaveDialogOpen(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {confirmClear ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="背景"
            onClick={() => setConfirmClear(false)}
          />
          <div className="mao-card relative w-full max-w-sm p-5">
            <h3 className="text-lg font-extrabold text-[#4A3322]">開始新配方？</h3>
            <p className="mt-2 text-sm text-[#5C4D3E]">
              目前的配方組合將被清除，份數設定將重置為 6，備料損耗比例將重置為
              0%。請確認已儲存，或先點下方「先儲存配方」。
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] py-2.5 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
                onClick={() => {
                  setConfirmClear(false)
                  window.dispatchEvent(new CustomEvent('bakemao:requestSave'))
                }}
              >
                先儲存配方
              </button>
              <button
                type="button"
                className="w-full rounded-xl py-2.5 text-sm font-medium text-[#6B5A4A] transition hover:bg-black/5"
                onClick={() => setConfirmClear(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="w-full py-1.5 text-xs font-medium text-[#C45C5C] transition hover:underline active:scale-[0.99]"
                onClick={() => {
                  clearComponents()
                  setConfirmClear(false)
                }}
              >
                直接清空
              </button>
            </div>
          </div>
        </div>
      ) : null}

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

      <TemplateDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={(tpl) => {
          clearComponents()
          addComponentFromTemplate(
            tpl.label,
            tpl.ingredients.map((ing) => ({
              name: ing.name,
              value: ing.value,
              isFixed: false,
            })),
            tpl.gramPerUnit,
            tpl.cakeType
          )
          // 打發類範本自動切到「按模具算」模式，讓比重生效
          if (tpl.cakeType && tpl.cakeType !== 'mousse') {
            const comps = useCalcStore.getState().components ?? []
            if (comps.length > 0) {
              setComponentTargetMode(comps[comps.length - 1].id, 'mold')
            }
          }
        }}
      />

      <SavedRecipesSheet
        open={multiRecipesSheetOpen}
        recipes={multiSavedRecipes}
        onClose={() => setMultiRecipesSheetOpen(false)}
        onLoad={(r) => {
          if (r.snapshot.kind !== 'multi') return
          const snap = r.snapshot
          clearComponents()
          // Restore components via store replaceAll
          useCalcStore.getState().replaceAll({
            components: snap.components,
            compQuantity: snap.compQuantity,
            compLossRate: snap.compLossRate,
          })
        }}
        onDelete={(id) => {
          deleteRecipe(id)
          setMultiSavedRecipes((prev) => prev.filter((r) => r.id !== id))
        }}
      />
    </section>

    {screenshotUrl && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="關閉"
          className="absolute inset-0 bg-black/60"
          onClick={() => setScreenshotUrl(null)}
        />
        <div className="mao-card relative flex w-full max-w-sm flex-col gap-3 p-4">
          <h3 className="text-base font-extrabold text-[#4A3322]">配方截圖</h3>
          <div className="max-h-[50vh] overflow-auto rounded-xl border border-[#E5D8C8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt="配方截圖" className="w-full" />
          </div>
          <p className="text-center text-xs text-[#8A7968]">
            行動裝置：長按圖片可儲存到相冊
          </p>
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] py-2.5 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
            onClick={downloadScreenshot}
          >
            下載圖片
          </button>
          <button
            type="button"
            className="w-full rounded-xl py-2 text-sm text-[#6B5A4A] transition hover:bg-black/5"
            onClick={() => setScreenshotUrl(null)}
          >
            關閉
          </button>
        </div>
      </div>
    )}

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
