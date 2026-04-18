export type IngredientInput = {
  name: string
  brand?: string
  value: number
  isFixed: boolean
}

export type CalcMode = 'percent' | 'gram'

export type TargetInput =
  | { type: 'mold'; volumeCC: number; quantity: number }
  | { type: 'gram'; totalGram: number }

export type LossInput =
  | { type: 'preset'; extra: 0 | 1 | 2 }
  | { type: 'manual'; ratio: number }

export type CalcResult = {
  targetGram: number
  lossRatio: number
  unitGram: number
  ingredients: {
    name: string
    brand?: string
    pct: number
    gram: number
    isFixed: boolean
  }[]
  totalPct: number
  totalGram: number
}

/** Pure numeric: negative → abs; NaN → 0 for loss ratio safety */
function n(x: number): number {
  const v = Number.isFinite(x) ? Math.abs(x) : 0
  return v
}

/**
 * Preset +0 → 1
 * Preset +1/+2 → (quantity + extra) / quantity — 多做備份個數時等比放大
 * Manual → 1 / (1 - ratio)，ratio ∈ [0, 1)
 */
export function calcLossRatio(
  input: LossInput,
  quantity: number = 1
): number {
  const q = Math.max(1, Math.floor(n(quantity)))
  if (input.type === 'preset') {
    if (input.extra === 0) return 1
    return (q + input.extra) / q
  }
  const ratio = Math.min(0.999999, Math.max(0, n(input.ratio)))
  if (ratio >= 1) return Number.POSITIVE_INFINITY
  return 1 / (1 - ratio)
}

export function calcTargetGram(target: TargetInput): number {
  if (target.type === 'mold') {
    return n(target.volumeCC) * Math.max(0, n(target.quantity))
  }
  return n(target.totalGram)
}

function inferPercentsFromGrams(ingredients: IngredientInput[]): {
  pcts: number[]
  totalPct: number
} {
  const prop = ingredients.filter((i) => !i.isFixed)
  const sumGram = prop.reduce((s, i) => s + n(i.value), 0)
  if (sumGram <= 0) {
    return { pcts: ingredients.map(() => 0), totalPct: 0 }
  }
  const pcts = ingredients.map((i) => {
    if (i.isFixed) return 0
    return (n(i.value) / sumGram) * 100
  })
  const totalPct = pcts.reduce((s, p) => s + p, 0)
  return { pcts, totalPct }
}

function percentsForMode(
  mode: CalcMode,
  ingredients: IngredientInput[]
): { pcts: number[]; totalPct: number } {
  if (mode === 'gram') {
    return inferPercentsFromGrams(ingredients)
  }
  const pcts = ingredients.map((i) => (i.isFixed ? 0 : n(i.value)))
  const totalPct = pcts.reduce((s, p) => s + p, 0)
  return { pcts, totalPct }
}

export function calculate(
  mode: CalcMode,
  ingredients: IngredientInput[],
  target: TargetInput,
  loss: LossInput,
  moldQuantityForLoss: number = 1
): CalcResult {
  const targetGram = calcTargetGram(target)
  const qtyForLoss =
    target.type === 'mold' ? n(target.quantity) : moldQuantityForLoss
  const lossRatio = calcLossRatio(loss, qtyForLoss)

  if (ingredients.length === 0) {
    return {
      targetGram,
      lossRatio,
      unitGram: 0,
      ingredients: [],
      totalPct: 0,
      totalGram: 0,
    }
  }

  const { pcts, totalPct } = percentsForMode(mode, ingredients)

  if (totalPct <= 0) {
    const fixedOnly = ingredients.map((i) => ({
      name: i.name,
      brand: i.brand,
      pct: 0,
      gram: i.isFixed ? n(i.value) : 0,
      isFixed: i.isFixed,
    }))
    return {
      targetGram,
      lossRatio,
      unitGram: 0,
      ingredients: fixedOnly,
      totalPct: 0,
      totalGram: fixedOnly.reduce((s, r) => s + r.gram, 0),
    }
  }

  if (targetGram <= 0) {
    const rows = ingredients.map((i, idx) => ({
      name: i.name,
      brand: i.brand,
      pct: pcts[idx] ?? 0,
      gram: i.isFixed ? n(i.value) : 0,
      isFixed: i.isFixed,
    }))
    return {
      targetGram,
      lossRatio,
      unitGram: 0,
      ingredients: rows,
      totalPct,
      totalGram: rows.reduce((s, r) => s + r.gram, 0),
    }
  }

  const unitGram = targetGram / lossRatio / totalPct

  const rows = ingredients.map((i, idx) => {
    const pct = pcts[idx] ?? 0
    if (i.isFixed) {
      return {
        name: i.name,
        brand: i.brand,
        pct: 0,
        gram: n(i.value),
        isFixed: true,
      }
    }
    return {
      name: i.name,
      brand: i.brand,
      pct,
      gram: pct * unitGram,
      isFixed: false,
    }
  })

  const totalGram = rows.reduce((s, r) => s + r.gram, 0)

  return {
    targetGram,
    lossRatio,
    unitGram,
    ingredients: rows,
    totalPct,
    totalGram,
  }
}

/**
 * 逐件計算（多組合 / 考試模式）
 * 公式：每1%克數 = gramPerUnit × quantity ÷ 良率 ÷ totalPct
 * 例：225 × 3 ÷ 0.9 ÷ 200 = 3.75
 */
export function calculateExam(
  mode: CalcMode,
  ingredients: IngredientInput[],
  gramPerUnit: number,
  quantity: number,
  lossRate: number // 0–0.3，e.g. 0.1 代表 10%
): CalcResult {
  const yieldRate = Math.max(0.001, 1 - Math.min(0.3, Math.max(0, lossRate)))
  const totalGramNeeded = (n(gramPerUnit) * Math.max(1, Math.floor(n(quantity)))) / yieldRate
  return calculate(mode, ingredients, { type: 'gram', totalGram: totalGramNeeded }, { type: 'preset', extra: 0 })
}
