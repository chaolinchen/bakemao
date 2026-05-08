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
