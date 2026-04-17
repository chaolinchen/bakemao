/** Volume ≈ π r² h, r = diameter/2, output cc */
export function cylinderVolumeCC(diameterCm: number, heightCm: number): number {
  const r = diameterCm / 2
  return Math.round(Math.PI * r * r * heightCm)
}

export function boxVolumeCC(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  return Math.max(0, Math.round(lengthCm * widthCm * heightCm))
}
