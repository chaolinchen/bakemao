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
    width: el.offsetWidth,
    height: el.offsetHeight,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
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

// ── IG Card (1080×1080) ──────────────────────────────────────────────────────

const IG_SIZE = 1080
const IG_MARGIN = 40
const IG_RADIUS = 40
const MAX_ROWS = 8

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let lo = 0
  let hi = text.length
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  return text.slice(0, lo) + '…'
}

export function generateIgCard(
  ingredients: Array<{ name: string; gram: number }>,
  totalGram: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = IG_SIZE
  canvas.height = IG_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // Background
  ctx.fillStyle = '#FFFBF2'
  ctx.fillRect(0, 0, IG_SIZE, IG_SIZE)

  // Border
  ctx.strokeStyle = '#6B4A2F'
  ctx.lineWidth = 4
  roundRect(
    ctx,
    IG_MARGIN,
    IG_MARGIN,
    IG_SIZE - IG_MARGIN * 2,
    IG_SIZE - IG_MARGIN * 2,
    IG_RADIUS
  )
  ctx.stroke()

  // Title
  ctx.fillStyle = '#3D2918'
  ctx.font = 'bold 52px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('配方一覽', IG_SIZE / 2, 120)

  // Determine rows to display
  const showAll = ingredients.length <= MAX_ROWS
  const rows = showAll ? ingredients : ingredients.slice(0, MAX_ROWS - 1)
  const extraCount = showAll ? 0 : ingredients.length - (MAX_ROWS - 1)

  // Ingredient rows
  const rowHeight = 80
  let y = 220

  for (const ing of rows) {
    // Name
    ctx.fillStyle = '#3D2918'
    ctx.font = '36px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncateText(ctx, ing.name, 500), 120, y + rowHeight / 2)

    // Gram value
    ctx.fillStyle = '#C8602A'
    ctx.font = 'bold 44px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Number.isInteger(ing.gram) ? ing.gram : ing.gram.toFixed(1)} g`, 960, y + rowHeight / 2)

    // Separator
    ctx.strokeStyle = '#E5D8C8'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, y + rowHeight)
    ctx.lineTo(960, y + rowHeight)
    ctx.stroke()

    y += rowHeight
  }

  // "...還有 N 種" row if truncated
  if (!showAll && extraCount > 0) {
    ctx.fillStyle = '#9B7B5A'
    ctx.font = '36px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`...還有 ${extraCount} 種`, 120, y + rowHeight / 2)

    ctx.strokeStyle = '#E5D8C8'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(120, y + rowHeight)
    ctx.lineTo(960, y + rowHeight)
    ctx.stroke()

    y += rowHeight
  }

  // Total row
  y += 8
  ctx.fillStyle = '#6B4A2F'
  ctx.font = 'bold 44px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('合計', 120, y + rowHeight / 2)

  ctx.fillStyle = '#6B4A2F'
  ctx.font = 'bold 44px monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${Number.isInteger(totalGram) ? totalGram : totalGram.toFixed(1)} g`, 960, y + rowHeight / 2)

  // Brand
  ctx.fillStyle = '#C8602A'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('BakeMao 烘焙貓', 960, 1040)

  return canvas
}

export async function shareIgCard(
  ingredients: Array<{ name: string; gram: number }>,
  totalGram: number
): Promise<void> {
  if (typeof document === 'undefined') return

  const canvas = generateIgCard(ingredients, totalGram)

  await new Promise(resolve => requestAnimationFrame(resolve))

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(); return }

      const file = new File([blob], 'bakemao-ig.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'BakeMao 烘焙貓' })
          resolve()
          return
        } catch {
          /* fallback to download */
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bakemao-ig.png'
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    })
  })
}
