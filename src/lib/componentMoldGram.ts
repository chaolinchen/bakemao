import { cylinderVolumeCC } from './moldsVolume'

export type ComponentMoldType = 'round' | 'tart' | 'cup'

export const CAKE_TYPE_PRESETS = {
  mousse:  { gravity: 1.0,  fillRate: 0.95 },
  pound:   { gravity: 0.85, fillRate: 0.50 },
  sponge:  { gravity: 0.46, fillRate: 0.60 },
  chiffon: { gravity: 0.42, fillRate: 0.65 },
} as const

export type CakeType = 'mousse' | 'pound' | 'sponge' | 'chiffon' | 'custom'

const ROUND_HEIGHT_CM = 6
const TART_HEIGHT_CM = 2.5

/**
 * Per-component mold volume → gramPerUnit
 * 杯型：cupVolumeCC 為使用者選定的每杯容積（cc），直接回傳。
 * gravity：麵糊比重（g/cc），fillRate：填充率（0-1）。
 * 公式：模具容積(cc) × fillRate × gravity
 */
export function gramPerUnitFromComponentMold(
  moldType: ComponentMoldType,
  moldSize: number,
  cupVolumeCC = 90,
  gravity = 1.0,
  fillRate = 0.95
): number {
  if (moldType === 'round') {
    const dCm = moldSize * 2.54
    const vol = Math.max(0, cylinderVolumeCC(dCm, ROUND_HEIGHT_CM))
    return vol * fillRate * gravity
  }
  if (moldType === 'tart') {
    const vol = Math.max(0, cylinderVolumeCC(moldSize, TART_HEIGHT_CM))
    return vol * fillRate * gravity
  }
  // 杯型：容積直接是目標克重（慕斯/布丁類），不套比重
  return Math.max(1, cupVolumeCC)
}
