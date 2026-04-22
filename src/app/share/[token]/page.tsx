'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { calculateExam } from '@/lib/calculator'
import { aggregateIngredientsAcrossComponents, effectiveGramPerUnit } from '@/lib/multiComponentAggregate'
import {
  defaultMoldUi,
  defaultRecipeComponent,
  makeRecipeId,
  normalizeRecipeComponent,
  useCalcStore,
  type MoldUiState,
  type RecipeComponent,
} from '@/store/calcStore'
import type { RecipeLine } from '@/types/recipe-line'
import { Button } from '@/components/ui/Button'

type Stored = {
  lines?: RecipeLine[]
  components?: unknown[]
  compQuantity?: number
  compLossRate?: number
  mode?: 'percent' | 'gram'
  targetKind?: 'mold' | 'gram'
  moldVolumeCC?: number
  moldQuantity?: number
  totalGram?: number
  loss?: { type: string; extra: number }
  moldUi?: Partial<MoldUiState>
}

type SharedRecipe = {
  name: string
  ingredients: Stored
}

type PreviewLine =
  | { kind: 'header'; label: string; meta: string }
  | { kind: 'ingredient'; label: string; pct: string; gram: string | null }

const SHARE_QUICK_QTY = [1, 2, 4, 6, 12, 24, 48]

function fmtG(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(2).replace(/\.?0+$/, '')} kg`
  return `${g.toFixed(1)} g`
}

function IngredientPreview({
  ingredients,
  overrideQty,
}: {
  ingredients: Stored
  overrideQty?: number
}) {
  const compQuantity = overrideQty ?? Number(ingredients.compQuantity ?? 6)
  const compLossRate = Number(ingredients.compLossRate ?? 0)
  const lines: PreviewLine[] = []

  if (Array.isArray(ingredients.components) && ingredients.components.length > 0) {
    for (const c of ingredients.components) {
      const comp = normalizeRecipeComponent(c)
      if (!comp || comp.ingredients.length === 0) continue

      const gramForCalc = effectiveGramPerUnit(comp)
      const qty = comp.customQty ?? compQuantity
      const gramMap = new Map<string, number>()

      if (gramForCalc > 0) {
        const result = calculateExam(
          'percent',
          comp.ingredients.map((i) => ({
            name: i.name,
            brand: i.brand,
            value: i.value,
            isFixed: i.isFixed,
          })),
          gramForCalc,
          qty,
          compLossRate
        )
        for (const row of result.ingredients) {
          gramMap.set(`${row.name}\0${row.brand ?? ''}`, row.gram)
        }
      }

      const meta = gramForCalc > 0 ? `× ${qty} 個` : ''
      lines.push({ kind: 'header', label: comp.name ?? '組合', meta })
      for (const item of comp.ingredients) {
        const key = `${item.name}\0${item.brand ?? ''}`
        const gram = gramMap.get(key)
        lines.push({
          kind: 'ingredient',
          label: item.name + (item.brand ? ` · ${item.brand}` : ''),
          pct: `${item.value}%`,
          gram: gram != null ? fmtG(gram) : null,
        })
      }
    }
  } else if (Array.isArray(ingredients.lines)) {
    for (const item of ingredients.lines) {
      lines.push({
        kind: 'ingredient',
        label: item.name + (item.brand ? ` · ${item.brand}` : ''),
        pct: `${item.value}%`,
        gram: null,
      })
    }
  }

  if (lines.length === 0) {
    return <p className="text-sm text-[#9E8672]">無材料資料</p>
  }

  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) =>
        l.kind === 'header' ? (
          <li key={i} className="flex items-baseline gap-2 pt-2">
            <span className="text-xs font-extrabold text-[#6B4A2F]">【{l.label}】</span>
            {l.meta && <span className="text-[10px] text-[#B0A090]">{l.meta}</span>}
          </li>
        ) : (
          <li key={i} className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-[#4A3322]">
              {l.label}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              {l.gram && (
                <span className="font-[family-name:var(--font-roboto-mono)] text-sm font-extrabold text-[#4A3322]">
                  {l.gram}
                </span>
              )}
              <span className="w-10 text-right font-[family-name:var(--font-roboto-mono)] text-xs text-[#9E8672]">
                {l.pct}
              </span>
            </div>
          </li>
        )
      )}
    </ul>
  )
}

export default function SharePage({
  params,
}: {
  params: { token: string }
}) {
  const router = useRouter()
  const replaceAll = useCalcStore((s) => s.replaceAll)
  const [recipe, setRecipe] = useState<SharedRecipe | null>(null)
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [copied, setCopied] = useState(false)
  const [confirmLoad, setConfirmLoad] = useState(false)
  const [shareQty, setShareQty] = useState<number>(0)

  const normalizedComponents = useMemo(
    () =>
      Array.isArray(recipe?.ingredients.components)
        ? recipe.ingredients.components
            .map(normalizeRecipeComponent)
            .filter((x): x is RecipeComponent => x !== null)
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipe]
  )

  const aggregate = useMemo(
    () =>
      aggregateIngredientsAcrossComponents(
        normalizedComponents,
        shareQty || 1,
        Number(recipe?.ingredients.compLossRate ?? 0)
      ),
    [normalizedComponents, shareQty, recipe]
  )

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: SharedRecipe) => {
        setRecipe(data)
        setShareQty(Number(data.ingredients.compQuantity ?? 6))
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [params.token])

  const loadRecipe = () => {
    if (!recipe) return
    const raw = recipe.ingredients

    if (Array.isArray(raw.components) && raw.components.length > 0) {
      const components = raw.components
        .map(normalizeRecipeComponent)
        .filter((x): x is RecipeComponent => x !== null)
      replaceAll({
        ingredients: [],
        components,
        compQuantity: Number(raw.compQuantity ?? 6),
        compLossRate: Number(raw.compLossRate ?? 0),
        mode: raw.mode ?? 'percent',
        targetKind: raw.targetKind ?? 'mold',
        moldVolumeCC: Number(raw.moldVolumeCC ?? 1060),
        moldQuantity: Number(raw.moldQuantity ?? 1),
        totalGram: Number(raw.totalGram ?? 1000),
        loss: (raw.loss as Parameters<typeof replaceAll>[0]['loss']) ?? {
          type: 'preset',
          extra: 0,
        },
        moldUi: raw.moldUi ? { ...defaultMoldUi, ...raw.moldUi } : defaultMoldUi,
      })
    } else if (raw.lines && Array.isArray(raw.lines)) {
      const moldQuantity = Number(raw.moldQuantity ?? 3)
      replaceAll({
        ingredients: [],
        components: [
          defaultRecipeComponent({
            id: makeRecipeId(),
            name: '組合 1',
            gramPerUnit: 0,
            ingredients: raw.lines,
          }),
        ],
        compQuantity: moldQuantity,
        compLossRate: 0,
        mode: raw.mode ?? 'percent',
        targetKind: raw.targetKind ?? 'mold',
        moldVolumeCC: Number(raw.moldVolumeCC ?? 1060),
        moldQuantity,
        totalGram: Number(raw.totalGram ?? 1000),
        loss: (raw.loss as Parameters<typeof replaceAll>[0]['loss']) ?? {
          type: 'preset',
          extra: 0,
        },
        moldUi: raw.moldUi ? { ...defaultMoldUi, ...raw.moldUi } : defaultMoldUi,
      })
    }

    router.push('/')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E6EEF5]">
        <p className="text-[#9E8672]">載入中…</p>
      </div>
    )
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#E6EEF5] p-6 text-center">
        <p className="text-lg font-extrabold text-[#4A3322]">找不到這份配方</p>
        <p className="text-sm text-[#9E8672]">連結可能已失效或被刪除。</p>
        <Link href="/" className="text-sm text-[#C8602A] underline underline-offset-4">
          前往 BakeMao
        </Link>
      </div>
    )
  }

  const nCombos =
    Array.isArray(recipe.ingredients.components) &&
    recipe.ingredients.components.length > 0
      ? recipe.ingredients.components.length
      : null

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: '#E6EEF5' }}
    >
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-[#6B4A2F] bg-[#E6EEF5]/92 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/maologo.png" width={36} height={36} alt="BakeMao logo" />
          <div>
            <div className="text-[18px] font-extrabold leading-none text-[#6B4A2F]">BakeMao</div>
            <div className="text-[9px] font-bold tracking-[3px] text-[#C8602A]">烘 焙 貓</div>
          </div>
        </div>
        <span className="rounded-full border-2 border-[#6B4A2F] bg-[#FFE1C7] px-3 py-1 text-xs font-extrabold text-[#6B4A2F]">
          分享配方
        </span>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* Recipe title card */}
        <section className="mao-card p-4">
          <h1 className="text-xl font-extrabold text-[#4A3322]">
            {recipe.name}
          </h1>
          {nCombos !== null && (
            <p className="mt-1 text-sm text-[#9E8672]">{nCombos} 個組合</p>
          )}
        </section>

        {/* 份數調整 */}
        <section className="mao-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#4A3322]">調整份數</span>
            <span className="rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-3 py-0.5 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F]">
              {shareQty} 個
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SHARE_QUICK_QTY.map((q) => (
              <button
                key={q}
                type="button"
                className={`min-w-[40px] rounded-[12px] border-2 border-[#6B4A2F] px-2.5 py-1.5 text-sm font-extrabold transition ${
                  shareQty === q
                    ? 'translate-y-px bg-[#C8602A] text-white shadow-[0_1px_0_#6B4A2F]'
                    : 'bg-[#FFFBF2] text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]'
                }`}
                onClick={() => setShareQty(q)}
              >
                {q}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={999}
              value={shareQty}
              onChange={(e) => {
                const v = Math.min(999, Math.max(1, parseInt(e.target.value) || 1))
                setShareQty(v)
              }}
              className="w-16 rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2 py-1.5 text-center text-sm font-extrabold"
            />
          </div>
        </section>

        {/* Ingredient list */}
        <section className="mao-card p-4">
          <h2 className="mb-3 text-sm font-extrabold text-[#6B4A2F]">材料比例</h2>
          <IngredientPreview ingredients={recipe.ingredients} overrideQty={shareQty || undefined} />
        </section>

        {/* 備料彙總 */}
        {aggregate.shouldShow && aggregate.rows.length > 0 && nCombos !== null && nCombos > 1 && (
          <section className="mao-card overflow-hidden">
            <div className="border-b-2 border-[#6B4A2F] bg-[#C8602A] px-4 py-2.5">
              <h2 className="text-sm font-extrabold text-white">
                備料彙總・{fmtG(aggregate.totalGram)}
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-1.5">
                {aggregate.rows.map((row) => (
                  <li key={row.key} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-[#4A3322]">
                      {row.name}
                      {row.brand ? (
                        <span className="text-xs text-[#9E8672]"> · {row.brand}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-[family-name:var(--font-roboto-mono)] text-sm font-extrabold text-[#4A3322]">
                      {fmtG(row.gram)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button className="w-full py-3 text-base" onClick={() => setConfirmLoad(true)}>
            用 BakeMao 開啟
          </Button>
          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] py-3 text-sm font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px active:shadow-[0_1px_0_#6B4A2F]"
          >
            {copied ? '✓ 已複製連結' : '複製分享連結'}
          </button>
        </div>

        <p className="text-center text-xs text-[#9E8672]">
          由{' '}
          <Link href="/" className="text-[#C8602A] underline underline-offset-2">
            BakeMao 烘焙貓
          </Link>{' '}
          提供
        </p>
      </main>

      {confirmLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="取消"
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmLoad(false)}
          />
          <div className="mao-card relative w-full max-w-xs p-5">
            <h3 className="text-lg font-extrabold text-[#4A3322]">載入此配方？</h3>
            <p className="mt-2 text-sm text-[#5C4D3E]">
              計算機目前的內容將被覆蓋，請確認已儲存或不需保留。
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button className="w-full" onClick={loadRecipe}>
                直接開啟
              </Button>
              <button
                type="button"
                className="w-full rounded-xl py-2.5 text-sm font-medium text-[#6B5A4A] transition hover:bg-black/5"
                onClick={() => setConfirmLoad(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
