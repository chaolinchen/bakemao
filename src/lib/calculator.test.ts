import { describe, expect, it } from 'vitest'
import { calculate, calcLossRatio, calcTargetGram } from './calculator'

describe('calcLossRatio', () => {
  it('preset +0 → 1', () => {
    expect(calcLossRatio({ type: 'preset', extra: 0 }, 18)).toBe(1)
  })
  it('preset +1/+2 uses quantity', () => {
    expect(calcLossRatio({ type: 'preset', extra: 1 }, 18)).toBeCloseTo(19 / 18)
    expect(calcLossRatio({ type: 'preset', extra: 2 }, 18)).toBeCloseTo(20 / 18)
  })
  it('manual 10%', () => {
    expect(calcLossRatio({ type: 'manual', ratio: 0.1 }, 1)).toBeCloseTo(1 / 0.9)
  })
})

describe('calcTargetGram', () => {
  it('mold = volume × qty', () => {
    expect(
      calcTargetGram({ type: 'mold', volumeCC: 90, quantity: 18 })
    ).toBe(1620)
  })
})

describe('calculate — mode percent', () => {
  it('布丁 18×90cc、總% 165.5、耗損 10%：鮮奶 1088g', () => {
    // 1088 = pct_milk × (1620 / (1/0.9) / 165.5)
    const milkPct = (1088 * 165.5) / (1620 * 0.9)
    const ingredients = [
      { name: '鮮奶', value: milkPct, isFixed: false },
      { name: '其他', value: 165.5 - milkPct, isFixed: false },
    ]
    const r = calculate(
      'percent',
      ingredients,
      { type: 'mold', volumeCC: 90, quantity: 18 },
      { type: 'manual', ratio: 0.1 }
    )
    const milk = r.ingredients.find((i) => i.name === '鮮奶')
    expect(milk?.gram).toBeCloseTo(1088, 5)
  })
})

describe('calculate — mode gram', () => {
  it('鮮奶+砂糖克數配方，改目標 2000g 比例不變', () => {
    const ing = [
      { name: '鮮奶', value: 1088, isFixed: false },
      { name: '砂糖', value: 163, isFixed: false },
    ]
    const r2000 = calculate(
      'gram',
      ing,
      { type: 'gram', totalGram: 2000 },
      { type: 'manual', ratio: 0.1 }
    )
    const m = r2000.ingredients.find((i) => i.name === '鮮奶')!.gram
    const s = r2000.ingredients.find((i) => i.name === '砂糖')!.gram
    expect(m / s).toBeCloseTo(1088 / 163, 5)
  })
})

describe('calculate — 固定材料', () => {
  it('焦糖 100g 在目標改變時維持 100g', () => {
    const ing = [
      { name: '鮮奶', value: 100, isFixed: false },
      { name: '焦糖', value: 100, isFixed: true },
    ]
    const r1 = calculate(
      'percent',
      ing,
      { type: 'gram', totalGram: 1000 },
      { type: 'manual', ratio: 0 }
    )
    const r2 = calculate(
      'percent',
      ing,
      { type: 'gram', totalGram: 5000 },
      { type: 'manual', ratio: 0 }
    )
    expect(r1.ingredients.find((i) => i.name === '焦糖')?.gram).toBe(100)
    expect(r2.ingredients.find((i) => i.name === '焦糖')?.gram).toBe(100)
  })
})

describe('calculate — 目標 0', () => {
  it('比例材料 0g，固定材料不變', () => {
    const ing = [
      { name: '鮮奶', value: 50, isFixed: false },
      { name: '焦糖', value: 100, isFixed: true },
    ]
    const r = calculate(
      'percent',
      ing,
      { type: 'gram', totalGram: 0 },
      { type: 'manual', ratio: 0 }
    )
    expect(r.ingredients.find((i) => i.name === '鮮奶')?.gram).toBe(0)
    expect(r.ingredients.find((i) => i.name === '焦糖')?.gram).toBe(100)
  })
})
