'use client'

/**
 * BakeMao 多組配方整合流程 — 設計原型
 * 此頁面為 UX 設計 demo，不接 store，用假資料展示互動
 * 確認後再整合進正式 page.tsx
 */

import { useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type TargetMode = 'gram' | 'mold'

type MoldType = 'round' | 'tart' | 'cup'

interface Ingredient {
  id: string
  name: string
  pct: number
}

interface Component {
  id: string
  name: string
  mode: TargetMode
  gramPerUnit: number
  moldType: MoldType
  moldSize: number
  cupCount: number
  customQty: number | null // null = inherit global
  ingredients: Ingredient[]
  showResult: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 8)
}

function makeDefaultComponent(name: string): Component {
  return {
    id: uid(),
    name,
    mode: 'gram',
    gramPerUnit: 0,
    moldType: 'tart',
    moldSize: 8,
    cupCount: 1,
    customQty: null,
    ingredients: [],
    showResult: false,
  }
}

// ─── Segmented Control ───────────────────────────────────────────────────────

function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex rounded-lg border border-[#D9C9B5] bg-[#FAF6F0] p-0.5">
      {options.map((opt) => (
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

// ─── Quick Buttons ────────────────────────────────────────────────────────────

function QuickButtons({
  values,
  active,
  onSelect,
}: {
  values: number[]
  active: number
  onSelect: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onSelect(v)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            active === v
              ? 'bg-[#C8602A] text-white shadow-sm'
              : 'border border-[#D9C9B5] bg-[#FAF6F0] text-[#3D2918]'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}

// ─── Component Card ───────────────────────────────────────────────────────────

function ComponentCard({
  comp,
  globalQty,
  index,
  canDelete,
  onChange,
  onDelete,
}: {
  comp: Component
  globalQty: number
  index: number
  canDelete: boolean
  onChange: (updated: Component) => void
  onDelete: () => void
}) {
  const effectiveQty = comp.customQty ?? globalQty
  const isCustomQty = comp.customQty !== null

  function update(patch: Partial<Component>) {
    onChange({ ...comp, ...patch })
  }

  function addIngredient() {
    const names = ['低筋麵粉', '奶油', '糖粉', '雞蛋', '鮮奶油', '可可粉', '杏仁粉']
    const used = new Set(comp.ingredients.map((i) => i.name))
    const name = names.find((n) => !used.has(n)) ?? `材料 ${comp.ingredients.length + 1}`
    update({
      ingredients: [...comp.ingredients, { id: uid(), name, pct: 0 }],
    })
  }

  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    update({
      ingredients: comp.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })
  }

  function removeIngredient(id: string) {
    update({ ingredients: comp.ingredients.filter((i) => i.id !== id) })
  }

  const totalPct = comp.ingredients.reduce((s, i) => s + i.pct, 0)

  // 假計算：gram = pct/totalPct * gramPerUnit * effectiveQty
  const hasResult = comp.gramPerUnit > 0 && comp.ingredients.length > 0 && totalPct > 0
  const maxGram = hasResult
    ? Math.max(...comp.ingredients.map((i) => (i.pct / totalPct) * comp.gramPerUnit * effectiveQty))
    : 1

  const MOLD_OPTIONS: { value: MoldType; label: string }[] = [
    { value: 'round', label: '圓模（吋）' },
    { value: 'tart', label: '塔圈（cm）' },
    { value: 'cup', label: '杯型' },
  ]

  const ROUND_SIZES = [4, 5, 6, 7, 8, 9, 10, 12]
  const TART_SIZES = [6, 7, 8, 9, 10, 12, 15]
  const CUP_COUNTS = [6, 12, 24]

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5D8C8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#F0E8DC] bg-[#FAF6F0] px-4 py-2.5">
        <span className="text-xs font-medium text-[#8B7355]">#{index + 1}</span>
        <input
          value={comp.name}
          onChange={(e) => update({ name: e.target.value })}
          className="flex-1 bg-transparent text-sm font-semibold text-[#2C1A0E] outline-none placeholder:text-[#C8B89A]"
          placeholder="組合名稱（例：塔皮、奶油霜）"
        />
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-[#B84C3A] underline underline-offset-2"
          >
            刪除
          </button>
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* 目標量模式 */}
        <div>
          <p className="mb-2 text-xs text-[#8B7355]">目標量</p>
          <SegmentedControl
            value={comp.mode}
            onChange={(v) => update({ mode: v as TargetMode })}
            options={[
              { value: 'gram', label: '輸入克數' },
              { value: 'mold', label: '按模具算' },
            ]}
          />
        </div>

        {/* 目標量輸入 */}
        {comp.mode === 'gram' ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B5A4A]">每份</span>
            <input
              type="number"
              value={comp.gramPerUnit || ''}
              onChange={(e) => update({ gramPerUnit: parseFloat(e.target.value) || 0 })}
              placeholder="例：225"
              className="w-24 rounded-lg border border-[#D9C9B5] bg-[#FAF6F0] px-3 py-1.5 text-sm text-[#2C1A0E] outline-none focus:border-[#C8602A]"
            />
            <span className="text-sm text-[#8B7355]">g</span>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl bg-[#FAF6F0] p-3">
            {/* 模具類型 */}
            <div>
              <p className="mb-1.5 text-xs text-[#8B7355]">模具類型</p>
              <div className="flex gap-1.5">
                {MOLD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update({ moldType: opt.value })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      comp.moldType === opt.value
                        ? 'bg-[#C8602A] text-white'
                        : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 模具尺寸 */}
            {comp.moldType !== 'cup' ? (
              <div>
                <p className="mb-1.5 text-xs text-[#8B7355]">
                  {comp.moldType === 'round' ? '尺寸（吋）' : '尺寸（cm）'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(comp.moldType === 'round' ? ROUND_SIZES : TART_SIZES).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update({ moldSize: s })}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                        comp.moldSize === s
                          ? 'bg-[#C8602A] text-white'
                          : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1.5 text-xs text-[#8B7355]">杯數</p>
                <div className="flex gap-1.5">
                  {CUP_COUNTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => update({ cupCount: c })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        comp.cupCount === c
                          ? 'bg-[#C8602A] text-white'
                          : 'border border-[#D9C9B5] bg-white text-[#6B5A4A]'
                      }`}
                    >
                      {c} 連
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#A09080]">
              容積計算：π × r² × h（自動換算克數）
            </p>
          </div>
        )}

        {/* 份數 override */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B7355]">份數</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                update({ customQty: effectiveQty > 1 ? effectiveQty - 1 : effectiveQty })
              }
              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#D9C9B5] bg-[#FAF6F0] text-sm text-[#6B5A4A]"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-semibold text-[#2C1A0E]">
              {effectiveQty}
            </span>
            <button
              type="button"
              onClick={() => update({ customQty: effectiveQty + 1 })}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#D9C9B5] bg-[#FAF6F0] text-sm text-[#6B5A4A]"
            >
              ＋
            </button>
          </div>
          {isCustomQty ? (
            <button
              type="button"
              onClick={() => update({ customQty: null })}
              className="rounded-full bg-[#F5E6D0] px-2 py-0.5 text-xs font-medium text-[#C8602A]"
            >
              已自訂 × 重置
            </button>
          ) : (
            <span className="text-xs text-[#B0A090]">繼承全局</span>
          )}
        </div>

        {/* 材料列表 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-[#8B7355]">材料百分比</p>
            <span
              className={`text-xs font-medium ${
                Math.abs(totalPct - 100) < 1 ? 'text-[#6B8C5A]' : 'text-[#8B7355]'
              }`}
            >
              {totalPct.toFixed(0)} %
            </span>
          </div>

          <div className="space-y-1.5">
            {comp.ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex items-center gap-2 rounded-xl bg-[#FAF6F0] px-3 py-2"
              >
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                  className="flex-1 bg-transparent text-sm text-[#2C1A0E] outline-none"
                />
                <input
                  type="number"
                  value={ing.pct || ''}
                  onChange={(e) =>
                    updateIngredient(ing.id, { pct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-14 rounded-lg border border-[#D9C9B5] bg-white px-2 py-1 text-right text-sm text-[#2C1A0E] outline-none focus:border-[#C8602A]"
                />
                <span className="text-xs text-[#8B7355]">%</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ing.id)}
                  className="text-xs text-[#B84C3A]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 w-full rounded-xl border border-dashed border-[#D9C9B5] py-2 text-xs text-[#8B7355] transition hover:border-[#C8602A] hover:text-[#C8602A]"
          >
            ＋ 新增材料
          </button>
        </div>

        {/* 計算結果 */}
        {hasResult && (
          <div>
            <button
              type="button"
              onClick={() => update({ showResult: !comp.showResult })}
              className="flex w-full items-center justify-between rounded-xl bg-[#FDF0E4] px-4 py-2.5 text-sm font-medium text-[#C8602A]"
            >
              <span>計算結果</span>
              <span className="text-xs">{comp.showResult ? '▲ 收起' : '▼ 展開'}</span>
            </button>

            {comp.showResult && (
              <div className="mt-1.5 space-y-1.5 rounded-xl border border-[#E5D8C8] bg-[#FAF6F0] p-3">
                {comp.ingredients.map((ing) => {
                  const gram = (ing.pct / totalPct) * comp.gramPerUnit * effectiveQty
                  return (
                    <div key={ing.id} className="flex items-center gap-2">
                      <span className="w-20 truncate text-sm text-[#3D2918]">{ing.name}</span>
                      <span className="w-16 shrink-0 text-right font-mono text-sm font-semibold text-[#2C1A0E]">
                        {gram.toFixed(1)} g
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full bg-[#E5D8C8]" style={{ height: 5 }}>
                        <div
                          className="h-full rounded-full bg-[#C8602A]"
                          style={{ width: `${Math.min(100, (gram / maxGram) * 100).toFixed(1)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div className="mt-1 flex items-center gap-2 border-t border-[#E5D8C8] pt-1.5">
                  <span className="w-20 text-sm font-semibold text-[#3D2918]">合計</span>
                  <span className="w-16 text-right font-mono text-sm font-bold text-[#C8602A]">
                    {(comp.gramPerUnit * effectiveQty).toFixed(1)} g
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_COMPONENTS: Component[] = [
  {
    ...makeDefaultComponent('塔皮'),
    mode: 'mold',
    moldType: 'tart',
    moldSize: 8,
    ingredients: [
      { id: 'a1', name: '低筋麵粉', pct: 100 },
      { id: 'a2', name: '奶油', pct: 50 },
      { id: 'a3', name: '糖粉', pct: 35 },
      { id: 'a4', name: '雞蛋', pct: 20 },
    ],
    gramPerUnit: 120,
    showResult: true,
  },
  {
    ...makeDefaultComponent('卡士達'),
    mode: 'gram',
    gramPerUnit: 80,
    ingredients: [
      { id: 'b1', name: '牛奶', pct: 100 },
      { id: 'b2', name: '蛋黃', pct: 40 },
      { id: 'b3', name: '細砂糖', pct: 25 },
      { id: 'b4', name: '玉米澱粉', pct: 8 },
    ],
  },
]

export default function DesignPreview() {
  const [globalQty, setGlobalQty] = useState(6)
  const [components, setComponents] = useState<Component[]>(INITIAL_COMPONENTS)

  function updateComponent(id: string, updated: Component) {
    setComponents((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  function deleteComponent(id: string) {
    setComponents((prev) => prev.filter((c) => c.id !== id))
  }

  function addComponent() {
    const names = ['塔皮', '蛋糕體', '卡士達', '奶油霜', '鮮奶油', '鏡面果凍', '餅底']
    const used = new Set(components.map((c) => c.name))
    const name = names.find((n) => !used.has(n)) ?? `組合 ${components.length + 1}`
    setComponents((prev) => [...prev, makeDefaultComponent(name)])
  }

  return (
    <div className="min-h-screen bg-[#F7F0E6] pb-24 text-[#2C1A0E]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5D8C8] bg-[#F7F0E6]/90 px-4 py-3 backdrop-blur">
        <span className="text-base font-semibold text-[#2C1A0E]">BakeMao</span>
        <span className="rounded-full bg-[#F0E4D4] px-2.5 py-0.5 text-xs font-medium text-[#8B7355]">
          設計原型
        </span>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* 全局份數 */}
        <div className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2C1A0E]">共做幾個？</span>
            <span className="text-sm font-bold text-[#C8602A]">{globalQty} 個</span>
          </div>
          <QuickButtons
            values={[1, 2, 4, 6, 8, 12]}
            active={globalQty}
            onSelect={setGlobalQty}
          />
        </div>

        {/* 子配方卡片 */}
        {components.map((comp, index) => (
          <ComponentCard
            key={comp.id}
            comp={comp}
            globalQty={globalQty}
            index={index}
            canDelete={components.length > 1}
            onChange={(updated) => updateComponent(comp.id, updated)}
            onDelete={() => deleteComponent(comp.id)}
          />
        ))}

        {/* 新增組合 */}
        <button
          type="button"
          onClick={addComponent}
          className="w-full rounded-2xl border border-dashed border-[#D9C9B5] bg-white/60 py-3.5 text-sm font-medium text-[#8B7355] transition hover:border-[#C8602A] hover:text-[#C8602A]"
        >
          ＋ 新增組合
        </button>
      </main>
    </div>
  )
}
