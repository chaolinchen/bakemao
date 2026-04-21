import { cylinderVolumeCC } from './moldsVolume'

export type ComponentMoldType = 'round' | 'tart' | 'cup'

const ROUND_HEIGHT_CM = 6
const TART_HEIGHT_CM = 2.5
const CUP_SINGLE_CC = 90

/**
 * Per-component mold volume → gramPerUnit（1cc≈1g），對應 TASK-16 公式。
 * 杯型：回傳單杯容積（90cc），份數由 compQuantity 控制。
 */
export function gramPerUnitFromComponentMold(
  moldType: ComponentMoldType,
  moldSize: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _cupCount?: number
): number {
  if (moldType === 'round') {
    const dCm = moldSize * 2.54
    return Math.max(0, cylinderVolumeCC(dCm, ROUND_HEIGHT_CM))
  }
  if (moldType === 'tart') {
    return Math.max(0, cylinderVolumeCC(moldSize, TART_HEIGHT_CM))
  }
  // 杯型：每杯 90cc，份數由外層 compQuantity 控制
  return CUP_SINGLE_CC
}
