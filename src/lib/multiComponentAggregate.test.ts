import { describe, expect, it } from 'vitest'
import type { RecipeComponent } from '../store/calcStore'
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
    const a: RecipeComponent = {
      id: 'a',
      name: 'A',
      gramPerUnit: 100,
      ingredients: [line('低筋麵粉', 100, '1')],
      targetMode: 'gram',
      moldPresetId: null,
      moldType: 'round',
      moldSize: 6,
      cupCount: 6,
      customQty: null,
    }
    const b: RecipeComponent = {
      id: 'b',
      name: 'B',
      gramPerUnit: 100,
      ingredients: [line('低筋麵粉', 100, '2')],
      targetMode: 'gram',
      moldPresetId: null,
      moldType: 'round',
      moldSize: 6,
      cupCount: 6,
      customQty: null,
    }
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
    const one: RecipeComponent = {
      id: 'a',
      name: 'A',
      gramPerUnit: 0,
      ingredients: [],
      targetMode: 'gram',
      moldPresetId: null,
      moldType: 'round',
      moldSize: 6,
      cupCount: 6,
      customQty: null,
    }
    const { shouldShow, rows } = aggregateIngredientsAcrossComponents(
      [one],
      6,
      0
    )
    expect(shouldShow).toBe(false)
    expect(rows.length).toBe(0)
  })
})
