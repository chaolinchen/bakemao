import molds from '@/data/molds.json'
import { boxVolumeCC, cylinderVolumeCC } from '@/lib/moldsVolume'

export type MoldShape = 'cylinder' | 'rectangle' | 'muffin' | 'direct'
export type ChiffonKey = 'small' | 'medium' | 'large'

export function parseMoldNum(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(n) ? Math.abs(n) : 0
}

/**
 * Derive per-mold volume × quantity from UI (same logic as MoldSelector 的「共 X g」).
 */
export function getMoldParts(
  preset: (typeof molds)[number] | undefined,
  presetId: string,
  chiffonKey: ChiffonKey,
  shape: MoldShape,
  cyl: { d: string; h: string },
  box: { l: string; w: string; h: string },
  muffin: { single: string; qty: number },
  direct: string,
  fixedQty: number
): { volumeCC: number; quantity: number } | null {
  if (!preset) return null

  if (preset.type === 'chiffon' && preset.volumes) {
    return { volumeCC: preset.volumes[chiffonKey], quantity: 1 }
  }

  if (shape === 'muffin') {
    const s = parseMoldNum(muffin.single)
    const q = Math.max(1, Math.min(99, muffin.qty))
    if (s <= 0) return null
    return { volumeCC: s, quantity: q }
  }

  if (shape === 'cylinder') {
    const d = parseMoldNum(cyl.d)
    const h = parseMoldNum(cyl.h)
    if (d <= 0 || h <= 0) return null
    return { volumeCC: cylinderVolumeCC(d, h), quantity: 1 }
  }

  if (shape === 'rectangle') {
    const l = parseMoldNum(box.l)
    const w = parseMoldNum(box.w)
    const h = parseMoldNum(box.h)
    if (l <= 0 || w <= 0 || h <= 0) return null
    return { volumeCC: boxVolumeCC(l, w, h), quantity: 1 }
  }

  const per = parseMoldNum(direct)
  if (per <= 0) return null
  if (preset.type === 'fixed') {
    const q = Math.max(1, Math.min(99, fixedQty))
    return { volumeCC: per, quantity: q }
  }
  return { volumeCC: per, quantity: 1 }
}
