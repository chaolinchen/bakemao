import html2canvas from 'html2canvas'

function loadLogo(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('logo load failed'))
    img.src = src
  })
}

export async function captureAndShare(rootId: string) {
  if (typeof document === 'undefined') return
  await document.fonts?.ready

  const el = document.getElementById(rootId)
  if (!el) return

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#F7F0E6',
  })

  const w = canvas.width
  const h = canvas.height
  const pad = 16
  const logoMaxH = 32
  const logoPad = 8
  const out = document.createElement('canvas')
  out.width = w + pad * 2
  out.height = h + pad * 2 + logoMaxH + logoPad
  const ctx = out.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#F7F0E6'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(canvas, pad, pad)

  const bottomY = h + pad * 2
  const logoSrc = '/logo.svg'
  try {
    const logo = await loadLogo(logoSrc)
    const ratio = logo.naturalWidth / Math.max(logo.naturalHeight, 1)
    const lw = Math.min(logoMaxH * ratio, out.width - pad * 2)
    const lh = lw / ratio
    ctx.drawImage(
      logo,
      out.width - pad - lw,
      bottomY + (logoMaxH - lh) / 2,
      lw,
      lh
    )
  } catch {
    ctx.fillStyle = '#C8602A'
    ctx.font = '600 14px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText('BakeMao 烘焙貓', out.width - pad, bottomY + logoMaxH / 2)
  }

  out.toBlob(async (blob) => {
    if (!blob) return
    const file = new File([blob], 'bakemao.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'BakeMao' })
        return
      } catch {
        /* fallback */
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bakemao.png'
    a.click()
    URL.revokeObjectURL(url)
  })
}
