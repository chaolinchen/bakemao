'use client'

import { useMemo, useState } from 'react'
import { calculateExam } from '@/lib/calculator'
import type { IngredientInput } from '@/lib/calculator'
import { CAKE_TYPE_PRESETS } from '@/lib/componentMoldGram'
import type { CakeType, ComponentMoldType } from '@/lib/componentMoldGram'
import { effectiveGramPerUnit } from '@/lib/multiComponentAggregate'
import type { RecipeComponent } from '@/store/calcStore'
import { useCalcStore } from '@/store/calcStore'
import type { RecipeLine } from '@/types/recipe-line'
import { IngredientSearchSheet } from './IngredientSearchSheet'
import { NumberInput } from './ui/NumberInput'
import { Stepper } from './ui/Stepper'

export function parseNum(s: string | number): number {
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

const PERCENT_TOOLTIP_KEY = 'bakemao_percent_tooltip_seen'

function PercentTooltip() {
  const [open, setOpen] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    return !localStorage.getItem(PERCENT_TOOLTIP_KEY)
  })
  const toggle = () => {
    setOpen((x) => {
      if (!x && typeof localStorage !== 'undefined') {
        localStorage.setItem(PERCENT_TOOLTIP_KEY, '1')
      }
      return !x
    })
  }
  return (
    <div className="mb-2">
      <button
        type="button"
        className="flex items-center gap-1 text-[11px] text-[#6B4A2F] underline underline-offset-2"
        onClick={toggle}
      >
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E5D8C8] text-[10px] font-bold text-[#6B4A2F]">?</span>
        烘焙百分比說明
      </button>
      {open && (
        <div className="mt-1.5 rounded-xl border border-[#6B4A2F] bg-[#FFF8F0] p-3 text-[11px] text-[#5C4A3A]">
          以麵粉重量為 <strong>100</strong>，其他材料填相對比例。例：麵粉 100、奶油 80 → 奶油是麵粉重量的 80%。合計通常遠超 100，是正常的。
        </div>
      )}
    </div>
  )
}

export function ComponentCard({
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
  const maxGram = hasResult ? Math.max(...result.ingredients.map((r) => r.gram), 0.001) : 1
  const yieldPct = Math.round((1 - lossRate) * 100)
  const totalPct = comp.ingredients.filter((i) => !i.isFixed).reduce((s, i) => s + parseNum(i.value), 0)
  const moldVolumeLabel = comp.targetMode === 'mold' ? effectiveGramPerUnit(comp) : 0

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
            <div className="mt-1.5 space-y-0.5">
              <p className="text-[10px] text-[#8A7968]">
                輸入每份的實際克數，克數最高的材料自動設為基底（100%）
              </p>
              {Object.keys(gramValues).length > 0 && (
                <p className="text-[11px] font-bold text-[#6B4A2F]">
                  每份合計：{gramEntries.reduce((s, e) => s + e.g, 0).toFixed(1)} g
                </p>
              )}
            </div>
          )}
        </div>

        {/* 目標量模式 */}
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
                  onChange={(e) => updateComponentGram(comp.id, parseNum(e.target.value))}
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
                      comp.moldType === opt.value ? 'bg-[#C8602A] text-white' : 'bg-[#FFFBF2] text-[#6B4A2F]'
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
                          active ? 'bg-[#6B4A2F] text-white' : 'bg-[#FFFBF2] text-[#6B4A2F]'
                        }`}
                        onClick={() => setComponentMold(comp.id, { cakeType: opt.value })}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

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
                      {info.examples && <p className="mb-1 text-[#8A7968]">例：{info.examples}</p>}
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
                    {comp.moldType === 'round' ? `尺寸（${roundUnit === 'cm' ? 'cm' : '吋'}）` : '尺寸（cm）'}
                  </p>
                  {comp.moldType === 'round' && (
                    <div className="flex overflow-hidden rounded-[10px] border-2 border-[#6B4A2F]">
                      {(['inch', 'cm'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          className={`px-2 py-0.5 text-xs font-extrabold transition-all ${
                            roundUnit === u ? 'bg-[#C8602A] text-white' : 'bg-white text-[#6B4A2F]'
                          }`}
                          onClick={() => setComponentMold(comp.id, { roundUnit: u, moldSize: u === 'cm' ? 17 : 8 })}
                        >
                          {u === 'inch' ? '吋' : 'cm'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(comp.moldType === 'round'
                    ? roundUnit === 'cm' ? ROUND_SIZES_CM : ROUND_SIZES_INCH
                    : TART_SIZES
                  ).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`rounded-[10px] border-2 border-[#6B4A2F] px-2.5 py-1 text-xs font-extrabold transition-all ${
                        comp.moldSize === s ? 'bg-[#C8602A] text-white' : 'bg-[#FFFBF2] text-[#6B4A2F]'
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
                        comp.cupCount === cc ? 'bg-[#C8602A] text-white' : 'bg-[#FFFBF2] text-[#6B4A2F]'
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
            <span className="text-xs text-[#B0A090]" title="每組可以獨立設定份數，不設定則沿用全局份數">
              沿用 {globalQty} 份
            </span>
          )}
        </div>

        {comp.ingredients.length > 0 && (
          <p className="mb-1.5 text-[10px] text-[#B0A090]">
            主要材料（通常為麵粉）設 100，其他材料填相對比例
          </p>
        )}

        {!isGramMode && <PercentTooltip />}

        <div className="mb-2 space-y-2">
          {comp.ingredients.filter((l) => l.name.trim() !== '').map((line) => {
            const invalid = isGramMode ? (gramValues[line.id] ?? 0) === 0 : parseNum(line.value) === 0
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
                      <span className="text-xs text-[#8A7968]"> · {line.brand}</span>
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
                      onChange={(e) => setCompLineGramValue(comp.id, line.id, parseNum(e.target.value))}
                      placeholder="200"
                    />
                  </div>
                ) : (
                  <div className="w-20">
                    <label className="text-xs text-[#6B5A4A]">%</label>
                    <NumberInput
                      invalid={invalid}
                      value={line.value === 0 ? '' : String(line.value)}
                      onChange={(e) => updateCompLine(comp.id, line.id, { value: parseNum(e.target.value) })}
                      placeholder="100"
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
              <span className="text-xs text-[#6B5A4A]">合計 {totalPct.toFixed(1)} %</span>
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
                <div key={row.name + (row.brand ?? '')} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-sm text-[#3D2918]">
                    {row.name}
                    {row.brand ? <span className="text-xs text-[#8A7968]"> · {row.brand}</span> : null}
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
                      style={{ width: `${Math.min(100, (row.gram / maxGram) * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-2 border-t-2 border-[#6B4A2F] pt-1.5">
                <span className="w-24 shrink-0 text-sm font-extrabold text-[#4A3322]">合計</span>
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
                  <span className="font-semibold text-[#3D2918]">{result.unitGram.toFixed(3)} g</span>
                  <span className="ml-1 text-[#8A7968]">
                    （= {gramForCalc.toFixed(1)}g × {effectiveQty}個 ÷ {yieldPct}%良率 ÷ 總{result.totalPct.toFixed(0)}%）
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
        onPick={({ name, brand }) => addCompLine(comp.id, { name, brand, value: 0, isFixed: false })}
      />
    </div>
  )
}
