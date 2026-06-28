import { calculateExam } from './calculator'
import type { IngredientInput } from './calculator'
import { CAKE_TYPE_PRESETS, gramPerUnitFromComponentMold } from './componentMoldGram'
import type { RecipeComponent } from '../store/calcStore'

/** 與首頁 ComponentCard 的 gramForCalc 一致 */
export function effectiveGramPerUnit(comp: RecipeComponent): number {
  if (comp.targetMode === 'mold') {
    let gravity = 1.0
    let fillRate = 0.95
    const cakeType = comp.cakeType ?? 'mousse'
    if (cakeType === 'custom') {
      gravity = comp.customGravity ?? 0.85
      fillRate = comp.customFillRate ?? 0.8
    } else if (cakeType in CAKE_TYPE_PRESETS) {
      const preset = CAKE_TYPE_PRESETS[cakeType as keyof typeof CAKE_TYPE_PRESETS]
      gravity = preset.gravity
      fillRate = preset.fillRate
    }
    return gramPerUnitFromComponentMold(
      comp.moldType,
      comp.moldSize,
      comp.cupCount,
      gravity,
      fillRate,
      comp.roundUnit ?? 'inch',
      comp.roundHeight ?? 6,
      comp.rectBox?.l ?? 17,
      comp.rectBox?.w ?? 8,
      comp.rectBox?.h ?? 6
    )
  }
  return comp.gramPerUnit
}

/**
 * 某組合「每份總克重」：
 * - 克數模式：各材料實際克數加總（使用者輸入的就是答案）
 * - 模具模式：依模具容積×填充率×比重推算
 * - 比例模式：使用者填的每份目標克重
 */
export function componentGramPerUnit(comp: RecipeComponent): number {
  if (comp.gramMode) {
    const gv = comp.gramValues ?? {}
    return comp.ingredients.reduce((s, i) => s + (gv[i.id] ?? 0), 0)
  }
  return effectiveGramPerUnit(comp)
}

/**
 * 計算用的材料百分比陣列：
 * - 克數模式：以基底材料為 100% 推算各材料百分比（基底選擇不影響最終克數，只影響顯示）
 * - 比例模式：直接用使用者填的 value
 * 克數模式一律視為比例材料（非固定），確保加總後等於「總克重 ÷ 良率」。
 */
export function componentIngredientInputs(comp: RecipeComponent): IngredientInput[] {
  if (comp.gramMode) {
    const gv = comp.gramValues ?? {}
    const validIds = new Set(comp.ingredients.map((i) => i.id))
    const entries = comp.ingredients.map((i) => ({ id: i.id, g: gv[i.id] ?? 0 }))
    const autoBaseGram = Math.max(...entries.map((e) => e.g), 0)
    const autoBaseId =
      autoBaseGram > 0 ? entries.reduce((a, b) => (a.g >= b.g ? a : b)).id : null
    const manualBaseId =
      comp.gramBase && validIds.has(comp.gramBase) ? comp.gramBase : null
    const baseId = manualBaseId ?? autoBaseId
    const baseGram = baseId ? (gv[baseId] ?? 0) : autoBaseGram
    return comp.ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      value: baseGram > 0 ? ((gv[i.id] ?? 0) / baseGram) * 100 : 0,
      isFixed: false,
    }))
  }
  return comp.ingredients.map((i) => ({
    name: i.name,
    brand: i.brand,
    value: i.value,
    isFixed: i.isFixed,
  }))
}

export type AggregatedIngredientRow = {
  key: string
  name: string
  brand?: string
  gram: number
}

/**
 * 跨組合合併材料克數（name + brand）；僅納入該組 calculateExam 有效結果。
 */
export function aggregateIngredientsAcrossComponents(
  components: RecipeComponent[],
  globalQty: number,
  lossRate: number
): {
  rows: AggregatedIngredientRow[]
  totalGram: number
  shouldShow: boolean
} {
  const merged = new Map<string, AggregatedIngredientRow>()
  let shouldShow = false

  for (const comp of components) {
    const gramForCalc = componentGramPerUnit(comp)
    const qty = comp.customQty ?? globalQty
    const ing = componentIngredientInputs(comp)
    const result = calculateExam('percent', ing, gramForCalc, qty, lossRate)
    const valid =
      gramForCalc > 0 &&
      comp.ingredients.length > 0 &&
      result.totalPct > 0

    if (!valid) continue
    shouldShow = true

    for (const row of result.ingredients) {
      const key = `${row.name}\u0000${row.brand ?? ''}`
      const prev = merged.get(key)
      const add = row.gram
      if (prev) {
        merged.set(key, { ...prev, gram: prev.gram + add })
      } else {
        merged.set(key, {
          key,
          name: row.name,
          brand: row.brand,
          gram: add,
        })
      }
    }
  }

  const rows = Array.from(merged.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'zh-Hant')
  )
  const totalGram = rows.reduce((s, r) => s + r.gram, 0)

  return { rows, totalGram, shouldShow }
}
