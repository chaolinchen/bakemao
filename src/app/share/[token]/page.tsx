'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

function IngredientPreview({ ingredients }: { ingredients: Stored }) {
  const lines: { label: string; value: string }[] = []

  if (Array.isArray(ingredients.components) && ingredients.components.length > 0) {
    for (const c of ingredients.components) {
      const comp = c as { name?: string; ingredients?: RecipeLine[] }
      const items = comp.ingredients ?? []
      if (items.length > 0) {
        lines.push({ label: `【${comp.name ?? '組合'}】`, value: '' })
        for (const item of items) {
          lines.push({
            label: item.name + (item.brand ? ` · ${item.brand}` : ''),
            value: `${item.value}%`,
          })
        }
      }
    }
  } else if (Array.isArray(ingredients.lines)) {
    for (const item of ingredients.lines) {
      lines.push({
        label: item.name + (item.brand ? ` · ${item.brand}` : ''),
        value: `${item.value}%`,
      })
    }
  }

  if (lines.length === 0) {
    return <p className="text-sm text-[#8A7968]">無材料資料</p>
  }

  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) =>
        l.value === '' ? (
          <li key={i} className="pt-2 text-xs font-semibold text-[#6B5A4A]">
            {l.label}
          </li>
        ) : (
          <li key={i} className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-[#3D2918]">
              {l.label}
            </span>
            <span className="shrink-0 font-mono text-sm font-medium text-[#C8602A]">
              {l.value}
            </span>
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

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: SharedRecipe) => {
        setRecipe(data)
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
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E6]">
        <p className="text-[#6B5A4A]">載入中…</p>
      </div>
    )
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F0E6] p-6 text-center">
        <p className="text-lg font-medium text-[#3D2918]">找不到這份配方</p>
        <p className="text-sm text-[#8A7968]">連結可能已失效或被刪除。</p>
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
    <div className="min-h-screen bg-[#F7F0E6]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5D8C8] bg-[#F7F0E6]/90 px-4 py-3 backdrop-blur">
        <span
          className="font-serif text-xl font-semibold text-[#3D2918]"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          BakeMao
        </span>
        <span className="text-xs text-[#8A7968]">分享配方</span>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* Recipe title card */}
        <section className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
          <h1 className="font-serif text-xl font-semibold text-[#3D2918]">
            {recipe.name}
          </h1>
          {nCombos !== null && (
            <p className="mt-1 text-sm text-[#8A7968]">{nCombos} 個組合</p>
          )}
        </section>

        {/* Ingredient list */}
        <section className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[#6B5A4A]">材料比例</h2>
          <IngredientPreview ingredients={recipe.ingredients} />
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button className="w-full py-3 text-base" onClick={() => setConfirmLoad(true)}>
            在計算機中開啟
          </Button>
          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-xl border border-[#D9C9B5] bg-white py-3 text-sm font-medium text-[#3D2918] transition active:bg-[#F0E8DC]"
          >
            {copied ? '✓ 已複製連結' : '複製分享連結'}
          </button>
        </div>

        <p className="text-center text-xs text-[#8A7968]">
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
          <div className="relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#3D2918]">載入此配方？</h3>
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
