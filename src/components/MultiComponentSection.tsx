'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { calculateExam } from '@/lib/calculator'
import type { IngredientInput } from '@/lib/calculator'
import { CAKE_TYPE_PRESETS } from '@/lib/componentMoldGram'
import type { CakeType, ComponentMoldType } from '@/lib/componentMoldGram'
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
          className="shrink-0 rounded-md px-1.5 py-0.5 text-lg leading-none text-[#B0A090] transition hover:bg-red-50 hover:text-red-600"
          title="刪除此組合"
          onClick={onRemove}
        >
          ×
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
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          active
                            ? 'bg-[#7B5E3A] text-white'
                            : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
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
                      <div className="mt-2 rounded-xl bg-[#F0E8DC] p-3 text-xs text-[#5C4A3A]">
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
                    <div className="mt-2 rounded-xl bg-[#F0E8DC] p-3 text-xs text-[#5C4A3A]">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-md bg-[#C8602A]/15 px-2 py-0.5 text-[#7B3A1A] font-medium">
                          {info.whip}
                        </span>
                        <span className="text-[#8A7968]">
                          比重 {preset.gravity.toFixed(2)}　填充率 {Math.round(preset.fillRate * 100)}%
                        </span>
                      </div>
                      <p className="mb-1 text-[#5C4A3A]">{info.desc}</p>
                      {info.examples && (
                        <p className="text-[#8A7968]">例：{info.examples}</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}

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
                <p className="mb-1.5 text-xs text-[#6B5A4A]">每杯容積（cc）</p>
                <div className="flex flex-wrap gap-1.5">
                  {([63, 80, 90, 100, 120, 166] as const).map((cc) => (
                    <button
                      key={cc}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        comp.cupCount === cc
                          ? 'bg-[#C8602A] text-white'
                          : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
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
            max={30}
            value={effectiveQty}
            onChange={(q) => setComponentCustomQty(comp.id, q)}
          />
          {isCustomQty ? (
            <button
              type="button"
              className="rounded-full bg-[#F5E6D0] px-2 py-0.5 text-xs font-medium text-[#C8602A]"
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

        <div className="mb-2 space-y-2">
          {comp.ingredients.map((line) => {
            const invalid = parseNum(line.value) === 0
            return (
              <div
                key={line.id}
                className="flex flex-wrap items-end gap-2 rounded-xl bg-[#FAF6F0] px-3 py-2"
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

        <div className="mb-3 flex items-center justify-end gap-1.5">
          <span className="text-xs text-[#6B5A4A]">
            合計 {totalPct.toFixed(1)} %
          </span>
          <span
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#D9C9B5] text-[10px] text-[#8A7968] cursor-default"
            title="烘焙百分比：主要材料（通常為麵粉）設為 100，其他材料為相對比例。合計通常遠超 100，是正常的。"
          >
            ?
          </span>
        </div>

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
                  <span className="w-20 shrink-0 whitespace-nowrap text-right font-mono text-base font-semibold text-[#3D2918]">
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
                <span className="w-20 shrink-0 whitespace-nowrap text-right font-mono text-base font-semibold text-[#C8602A]">
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
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-[#3D2918]">範本配方</h3>
        <p className="mt-1 text-xs text-[#8A7968]">
          套用後會新增一組配方，你可以繼續修改比例。
        </p>
        <div className="mt-4 space-y-3">
          {RECIPE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-[#E5D8C8] bg-[#FAF6F0] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#3D2918]">{tpl.label}</p>
                  <p className="mt-0.5 text-xs text-[#8A7968]">{tpl.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tpl.ingredients.map((ing) => (
                      <span
                        key={ing.name}
                        className="rounded-full bg-[#E5D8C8] px-2 py-0.5 text-xs text-[#5C4D3E]"
                      >
                        {ing.name} {ing.value}%
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-[#C8602A] px-3 py-1.5 text-xs font-medium text-white transition active:scale-95"
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-sm text-[#C8602A] underline underline-offset-2"
            onClick={() => setShowTemplates(true)}
          >
            範本配方
          </button>
          <button
            type="button"
            className="text-sm text-red-700 underline"
            onClick={() => setConfirmClear(true)}
          >
            新配方
          </button>
        </div>
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

      {/* 空狀態：唯一組合且無材料時，顯示範本入口 */}
      {components.length === 1 && components[0].ingredients.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#C8602A]/40 bg-[#FDF3E7] p-4 text-center">
          <p className="mb-1 text-sm font-medium text-[#3D2918]">第一次使用？</p>
          <p className="mb-3 text-xs text-[#6B5A4A]">套用範本配方快速開始，或直接加材料自行輸入。</p>
          <button
            type="button"
            className="rounded-xl bg-[#C8602A] px-4 py-2 text-sm font-medium text-white transition active:scale-95"
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

      <Button
        variant="ghost"
        className="w-full border border-dashed border-[#D9C9B5]"
        onClick={addComponent}
      >
        ＋ 新增組合
      </Button>

      {confirmClear ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="背景"
            onClick={() => setConfirmClear(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#3D2918]">開始新配方？</h3>
            <p className="mt-2 text-sm text-[#5C4D3E]">
              目前的配方組合將被清除，份數設定將重置為 6，備料損耗比例將重置為
              0%。請確認已儲存，或先點下方「先儲存配方」。
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                className="w-full rounded-xl bg-[#C8602A] py-2.5 text-sm font-medium text-white shadow-sm transition active:scale-[0.99]"
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
