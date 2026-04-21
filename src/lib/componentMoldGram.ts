import { cylinderVolumeCC } from './moldsVolume'

export type ComponentMoldType = 'round' | 'tart' | 'cup'

const ROUND_HEIGHT_CM = 6
const TART_HEIGHT_CM = 2.5

/**
 * Per-component mold volume → gramPerUnit（1cc≈1g）
 * 杯型：cupVolumeCC 為使用者選定的每杯容積（cc），直接回傳。
 */
export function gramPerUnitFromComponentMold(
  moldType: ComponentMoldType,
  moldSize: number,
  cupVolumeCC = 90
): number {
  if (moldType === 'round') {
    const dCm = moldSize * 2.54
    return Math.max(0, cylinderVolumeCC(dCm, ROUND_HEIGHT_CM))
  }
  if (moldType === 'tart') {
    return Math.max(0, cylinderVolumeCC(moldSize, TART_HEIGHT_CM))
  }
  return Math.max(1, cupVolumeCC)
}
