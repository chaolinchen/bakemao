import { describe, expect, it } from 'vitest'
import { defaultRecipeComponent } from '../store/calcStore'
import { aggregateIngredientsAcrossComponents } from './multiComponentAggregate'

function line(
  name: string,
  value: number,
  id: string,
  brand?: string
) {
  return { id, name, brand, value, isFixed: false as const }
}

describe('aggregateIngredientsAcrossComponents', () => {
  it('merges same name+brand across two components', () => {
    const a = defaultRecipeComponent({ id: 'a', name: 'A', gramPerUnit: 100, ingredients: [line('低筋麵粉', 100, '1')] })
    const b = defaultRecipeComponent({ id: 'b', name: 'B', gramPerUnit: 100, ingredients: [line('低筋麵粉', 100, '2')] })
    const { rows, shouldShow } = aggregateIngredientsAcrossComponents(
      [a, b],
      1,
      0
    )
    expect(shouldShow).toBe(true)
    const flour = rows.find((r) => r.name === '低筋麵粉')
    expect(flour).toBeDefined()
    expect(flour!.gram).toBeGreaterThan(0)
  })

  it('克數模式：每份總克重 = 各材料克數加總（loss=0 時克數原樣輸出）', () => {
    // 水 25 / 水 25 / 細砂糖 100（base=細砂糖）→ 加總 150g
    const c = defaultRecipeComponent({
      id: 'g',
      name: '克數組',
      ingredients: [
        line('水', 0, 'w1'),
        line('水', 0, 'w2'),
        line('細砂糖', 0, 's1'),
      ],
    })
    c.gramMode = true
    c.gramValues = { w1: 25, w2: 25, s1: 100 }
    c.gramBase = 's1'
    const { rows, totalGram } = aggregateIngredientsAcrossComponents([c], 1, 0)
    expect(totalGram).toBeCloseTo(150, 5)
    const sugar = rows.find((r) => r.name === '細砂糖')!.gram
    expect(sugar).toBeCloseTo(100, 5) // 不再被縮成 74.1
  })

  it('克數模式：loss 10% → 材料 = 克數 ÷ 0.9（放大而非縮小）', () => {
    const c = defaultRecipeComponent({
      id: 'g2',
      name: '克數組',
      ingredients: [line('水', 0, 'w1'), line('細砂糖', 0, 's1')],
    })
    c.gramMode = true
    c.gramValues = { w1: 50, s1: 100 }
    c.gramBase = 's1'
    const { rows, totalGram } = aggregateIngredientsAcrossComponents([c], 1, 0.1)
    expect(totalGram).toBeCloseTo(150 / 0.9, 4)
    expect(rows.find((r) => r.name === '細砂糖')!.gram).toBeCloseTo(100 / 0.9, 4)
  })

  it('hides when single component has no valid result', () => {
    const one = defaultRecipeComponent({ id: 'a', name: 'A', gramPerUnit: 0, ingredients: [] })
    const { shouldShow, rows } = aggregateIngredientsAcrossComponents(
      [one],
      6,
      0
    )
    expect(shouldShow).toBe(false)
    expect(rows.length).toBe(0)
  })
})
