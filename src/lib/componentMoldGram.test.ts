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

  it('預設 gravity=1.0 fillRate=0.95 保持向後相容（慕斯類）', () => {
    const gOld = gramPerUnitFromComponentMold('round', 8, 90)
    // 用舊預設：1946cc × 1.0 × 0.95 ≈ 1848
    expect(gOld).toBeGreaterThan(1800)
    expect(gOld).toBeLessThan(1950)
  })

  it('海綿蛋糕 8吋 ≈ 537g（gravity=0.46, fillRate=0.60）', () => {
    const vol = gramPerUnitFromComponentMold('round', 8, 90, 0.46, 0.60)
    expect(vol).toBeGreaterThan(520)
    expect(vol).toBeLessThan(560)
  })

  it('戚風蛋糕 6吋 gravity=0.42 fillRate=0.65', () => {
    const vol = gramPerUnitFromComponentMold('round', 6, 90, 0.42, 0.65)
    expect(vol).toBeGreaterThan(0)
    expect(vol).toBeLessThan(500)
  })

  it('磅蛋糕 6吋 gravity=0.85 fillRate=0.50', () => {
    const vol = gramPerUnitFromComponentMold('round', 6, 90, 0.85, 0.50)
    expect(vol).toBeGreaterThan(0)
  })
})
