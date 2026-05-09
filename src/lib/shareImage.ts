import html2canvas from 'html2canvas'

// ── Recipe Card Screenshot ─────────────────────────────────────────────────

export interface RecipeCardIngredient {
  name: string
  brand?: string
  pct: number
  gram?: number
}

export interface RecipeCardComponent {
  name: string
  qty: number
  ingredients: RecipeCardIngredient[]
  subtotalGram?: number
}

export function generateRecipeCard(
  comps: RecipeCardComponent[],
  globalQty: number,
  lossRate: number,
): HTMLCanvasElement {
  const W = 1080
  const M = 56
  const CW = W - M * 2

  const HEADER_H = 180
  const COMP_HEADER_H = 68
  const COL_HEADER_H = 44
  const ROW_H = 54
  const SUBTOTAL_H = 62
  const COMP_GAP = 20
  const GRAND_TOTAL_H = comps.length > 1 ? 72 : 0
  const FOOTER_H = 64

  const compsH = comps.reduce(
    (sum, c) =>
      sum + COMP_HEADER_H + COL_HEADER_H + c.ingredients.length * ROW_H + SUBTOTAL_H + COMP_GAP,
    0,
  )
  const H = HEADER_H + compsH + GRAND_TOTAL_H + FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#FFFBF2'
  ctx.fillRect(0, 0, W, H)

  // Header
  ctx.fillStyle = '#C8602A'
  ctx.font = 'bold 54px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('BakeMao 烘焙貓', W / 2, 72)

  ctx.fillStyle = '#6B4A2F'
  ctx.font = '34px sans-serif'
  ctx.fillText('配方備料清單', W / 2, 118)

  const pad2 = (n: number) => String(n).padStart(2, '0')
  const now = new Date()
  const dateStr = `${now.getFullYear()}/${pad2(now.getMonth() + 1)}/${pad2(now.getDate())}`
  const lossStr = lossRate > 0 ? `  ·  含 ${Math.round(lossRate * 100)}% 損耗` : ''
  ctx.fillStyle = '#9B7B5A'
  ctx.font = '26px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`${dateStr}  ·  共 ${globalQty} 份${lossStr}`, M, 155)

  ctx.strokeStyle = '#E5D8C8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(M, HEADER_H - 12)
  ctx.lineTo(W - M, HEADER_H - 12)
  ctx.stroke()

  let y = HEADER_H
  let grandTotal = 0

  for (const comp of comps) {
    // Component header
    ctx.fillStyle = '#F0E0CC'
    ctx.fillRect(M, y, CW, COMP_HEADER_H)
    ctx.fillStyle = '#3D2918'
    ctx.font = 'bold 40px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(truncateText(ctx, comp.name || '未命名配方', CW - 180), M + 24, y + COMP_HEADER_H / 2)
    if (comp.qty !== globalQty) {
      ctx.fillStyle = '#C8602A'
      ctx.font = 'bold 30px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`×${comp.qty}份`, W - M - 20, y + COMP_HEADER_H / 2)
    }
    y += COMP_HEADER_H

    // Column headers
    ctx.fillStyle = '#F7EEE2'
    ctx.fillRect(M, y, CW, COL_HEADER_H)
    ctx.fillStyle = '#9B7B5A'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('材料', M + 24, y + COL_HEADER_H / 2)
    ctx.textAlign = 'right'
    ctx.fillText('%', M + CW * 0.67, y + COL_HEADER_H / 2)
    ctx.fillText('克數', W - M - 16, y + COL_HEADER_H / 2)
    y += COL_HEADER_H

    // Ingredient rows
    for (let i = 0; i < comp.ingredients.length; i++) {
      const ing = comp.ingredients[i]
      ctx.fillStyle = i % 2 === 0 ? '#FFFBF2' : '#FFF7EE'
      ctx.fillRect(M, y, CW, ROW_H)

      const fullName = ing.name + (ing.brand ? ` · ${ing.brand}` : '')
      ctx.fillStyle = '#3D2918'
      ctx.font = '32px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(truncateText(ctx, fullName, CW * 0.58), M + 24, y + ROW_H / 2)

      ctx.fillStyle = '#9B7B5A'
      ctx.font = '28px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`${ing.pct}%`, M + CW * 0.67, y + ROW_H / 2)

      if (ing.gram !== undefined) {
        ctx.fillStyle = '#C8602A'
        ctx.font = 'bold 34px monospace'
        ctx.textAlign = 'right'
        ctx.fillText(
          `${Number.isInteger(ing.gram) ? ing.gram : ing.gram.toFixed(1)} g`,
          W - M - 16,
          y + ROW_H / 2,
        )
      }

      ctx.strokeStyle = '#EDE0D0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(M + 16, y + ROW_H)
      ctx.lineTo(W - M - 16, y + ROW_H)
      ctx.stroke()

      y += ROW_H
    }

    // Subtotal
    ctx.fillStyle = '#E8D5C0'
    ctx.fillRect(M, y, CW, SUBTOTAL_H)
    ctx.fillStyle = '#4A3322'
    ctx.font = 'bold 34px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('小計', M + 24, y + SUBTOTAL_H / 2)
    if (comp.subtotalGram !== undefined && comp.subtotalGram > 0) {
      grandTotal += comp.subtotalGram
      ctx.fillStyle = '#6B4A2F'
      ctx.font = 'bold 38px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(
        `${Number.isInteger(comp.subtotalGram) ? comp.subtotalGram : comp.subtotalGram.toFixed(1)} g`,
        W - M - 16,
        y + SUBTOTAL_H / 2,
      )
    } else {
      ctx.fillStyle = '#9B7B5A'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('（未設定目標量）', W - M - 16, y + SUBTOTAL_H / 2)
    }
    y += SUBTOTAL_H + COMP_GAP
  }

  // Grand total
  if (comps.length > 1 && grandTotal > 0) {
    ctx.fillStyle = '#6B4A2F'
    ctx.fillRect(M, y, CW, GRAND_TOTAL_H)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 38px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('總計', M + 24, y + GRAND_TOTAL_H / 2)
    ctx.font = 'bold 44px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(
      `${Number.isInteger(grandTotal) ? grandTotal : grandTotal.toFixed(1)} g`,
      W - M - 16,
      y + GRAND_TOTAL_H / 2,
    )
    y += GRAND_TOTAL_H
  }

  // Footer brand
  ctx.fillStyle = '#C8602A'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('BakeMao 烘焙貓', W - M, y + 48)

  return canvas
}

export async function shareRecipeCard(
  comps: RecipeCardComponent[],
  globalQty: number,
  lossRate: number,
): Promise<void> {
  if (typeof document === 'undefined') return
  const canvas = generateRecipeCard(comps, globalQty, lossRate)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { resolve(); return }

      const file = new File([blob], 'bakemao-配方.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'BakeMao 配方備料清單' })
          resolve()
          return
        } catch { /* fallback */ }
      }

      const url = URL.createObjectURL(blob)
      const overlay = document.createElement('div')
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:16px;'
      const img = document.createElement('img')
      img.src = url
      img.alt = 'BakeMao 配方截圖'
      img.style.cssText = 'max-width:100%;max-height:70vh;border-radius:12px;'
      const hint = document.createElement('p')
      hint.textContent = '長按圖片儲存到相冊'
      hint.style.cssText = 'color:#fff;font-size:14px;font-weight:bold;text-align:center;margin:0;'
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '關閉'
      closeBtn.style.cssText =
        'padding:10px 32px;background:#fff;border:none;border-radius:20px;font-weight:bold;font-size:14px;cursor:pointer;'
      const cleanup = () => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay)
        URL.revokeObjectURL(url)
        resolve()
      }
      closeBtn.onclick = cleanup
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup() })
      overlay.appendChild(img)
      overlay.appendChild(hint)
      overlay.appendChild(closeBtn)
      document.body.appendChild(overlay)
    })
  })
}

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
const MAX_ROWS = 12

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

  // Responsive row height: shrink when many items so everything fits in 1080px
  const displayCount = Math.min(ingredients.length, MAX_ROWS)
  const rowHeight = displayCount <= 6 ? 84 : displayCount <= 9 ? 74 : 62
  const startY = displayCount <= 6 ? 220 : displayCount <= 9 ? 205 : 188
  let y = startY

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

      // Fallback: show overlay so user can long-press to save (works in IG in-app browser)
      const url = URL.createObjectURL(blob)
      const overlay = document.createElement('div')
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;gap:16px;'
      const img = document.createElement('img')
      img.src = url
      img.alt = 'BakeMao IG 備料卡'
      img.style.cssText = 'max-width:100%;max-height:65vh;border-radius:12px;'
      const hint = document.createElement('p')
      hint.textContent = '長按圖片儲存到相冊'
      hint.style.cssText = 'color:#fff;font-size:14px;font-weight:bold;text-align:center;margin:0;'
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '關閉'
      closeBtn.style.cssText =
        'padding:10px 32px;background:#fff;border:none;border-radius:20px;font-weight:bold;font-size:14px;cursor:pointer;'
      const cleanup = () => {
        if (document.body.contains(overlay)) document.body.removeChild(overlay)
        URL.revokeObjectURL(url)
        resolve()
      }
      closeBtn.onclick = cleanup
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup() })
      overlay.appendChild(img)
      overlay.appendChild(hint)
      overlay.appendChild(closeBtn)
      document.body.appendChild(overlay)
    })
  })
}
