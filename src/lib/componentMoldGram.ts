import { cylinderVolumeCC } from './moldsVolume'

export type ComponentMoldType = 'round' | 'tart' | 'cup'

const ROUND_HEIGHT_CM = 5
const TART_HEIGHT_CM = 2.5
const CUP_SINGLE_CC = 90

/**
 * Per-component mold volume → gramPerUnit（1cc≈1g），對應 TASK-16 公式。
 */
export function gramPerUnitFromComponentMold(
  moldType: ComponentMoldType,
  moldSize: number,
  cupCount: number
): number {
  if (moldType === 'round') {
    const dCm = moldSize * 2.54
    return Math.max(0, cylinderVolumeCC(dCm, ROUND_HEIGHT_CM))
  }
  if (moldType === 'tart') {
    return Math.max(0, cylinderVolumeCC(moldSize, TART_HEIGHT_CM))
  }
  const n = Math.max(1, Math.floor(Math.abs(cupCount)))
  return Math.max(0, CUP_SINGLE_CC * n)
}
