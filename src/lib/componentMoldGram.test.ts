import { describe, expect, it } from 'vitest'
import { gramPerUnitFromComponentMold } from './componentMoldGram'

describe('gramPerUnitFromComponentMold', () => {
  it('圓模 6 吋：圓柱體積（cm）', () => {
    const g = gramPerUnitFromComponentMold('round', 6, 6)
    expect(g).toBeGreaterThan(0)
  })

  it('塔圈 8 cm', () => {
    const g = gramPerUnitFromComponentMold('tart', 8, 6)
    expect(g).toBeGreaterThan(0)
  })

  it('杯型：單杯 90cc，cupCount 不影響結果', () => {
    expect(gramPerUnitFromComponentMold('cup', 0, 6)).toBe(90)
    expect(gramPerUnitFromComponentMold('cup', 0, 12)).toBe(90)
  })
})
