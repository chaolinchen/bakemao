import { describe, expect, it } from 'vitest'
import { gramPerUnitFromComponentMold } from './componentMoldGram'

describe('gramPerUnitFromComponentMold', () => {
  it('圓模 6 吋：圓柱體積（cm）', () => {
    const g = gramPerUnitFromComponentMold('round', 6, 90)
    expect(g).toBeGreaterThan(0)
  })

  it('塔圈 8 cm', () => {
    const g = gramPerUnitFromComponentMold('tart', 8, 90)
    expect(g).toBeGreaterThan(0)
  })

  it('杯型：直接回傳每杯容積 cc', () => {
    expect(gramPerUnitFromComponentMold('cup', 0, 80)).toBe(80)
    expect(gramPerUnitFromComponentMold('cup', 0, 100)).toBe(100)
    expect(gramPerUnitFromComponentMold('cup', 0, 90)).toBe(90)
  })
})
