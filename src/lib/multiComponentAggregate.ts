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
      comp.roundHeight ?? 6
    )
  }
  return comp.gramPerUnit
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
    const gramForCalc = effectiveGramPerUnit(comp)
    const qty = comp.customQty ?? globalQty
    const ing: IngredientInput[] = comp.ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      value: i.value,
      isFixed: i.isFixed,
    }))
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
