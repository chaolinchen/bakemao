'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RecipeLine } from '@/types/recipe-line'
import {
  computeResult,
  defaultMoldUi,
  defaultRecipeComponent,
  makeRecipeId,
  normalizeRecipeComponent,
  useCalcStore,
  type MoldUiState,
  type RecipeComponent,
} from '@/store/calcStore'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'

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
  loss?: import('@/lib/calculator').LossInput
  moldUi?: Partial<MoldUiState>
}

function countIngredientLines(ing: Stored | null): number {
  if (!ing) return 0
  if (Array.isArray(ing.components) && ing.components.length > 0) {
    let n = 0
    for (const c of ing.components) {
      const lines = (c as { ingredients?: RecipeLine[] }).ingredients
      n += Array.isArray(lines) ? lines.length : 0
    }
    return n
  }
  return ing.lines?.length ?? 0
}

type Row = {
  id: string
  name: string
  ingredients: Stored | null
  updated_at: string
}

const SWIPE_DELETE_PX = 76

function RecipeListRow({
  name,
  nIng,
  updatedAt,
  onOpen,
  onDeleteClick,
  swipeEnabled,
}: {
  name: string
  nIng: number
  updatedAt: string
  onOpen: () => void
  onDeleteClick: () => void
  swipeEnabled: boolean
}) {
  const [tx, setTx] = useState(0)
  const txRef = useRef(0)
  const drag = useRef({ x0: 0, tx0: 0 })

  useEffect(() => {
    txRef.current = tx
  }, [tx])

  if (!swipeEnabled) {
    return (
      <li className="flex items-stretch justify-between gap-2 rounded-xl border border-[#E5D8C8] bg-white p-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-[#8A7968]">
            {nIng} 項材料 · {new Date(updatedAt).toLocaleString('zh-TW')}
          </div>
        </button>
        <Button variant="ghost" onClick={onDeleteClick}>
          刪除
        </Button>
      </li>
    )
  }

  return (
    <li className="relative list-none overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 z-0 flex w-[76px] bg-[#C45C5C]">
        <button
          type="button"
          className="w-full text-xs font-medium text-white active:bg-[#B04A4A]"
          onClick={onDeleteClick}
        >
          刪除
        </button>
      </div>
      <div
        className="relative z-[1] rounded-xl border border-[#E5D8C8] bg-white"
        style={{
          transform: `translateX(${tx}px)`,
          transition:
            tx === 0 || tx === -SWIPE_DELETE_PX
              ? 'transform 0.2s ease-out'
              : 'none',
        }}
        onTouchStart={(e) => {
          drag.current = { x0: e.touches[0].clientX, tx0: txRef.current }
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - drag.current.x0
          const next = Math.max(
            -SWIPE_DELETE_PX,
            Math.min(0, drag.current.tx0 + dx)
          )
          setTx(next)
        }}
        onTouchEnd={() => {
          setTx((prev) =>
            prev < -SWIPE_DELETE_PX / 2 ? -SWIPE_DELETE_PX : 0
          )
        }}
      >
        <button
          type="button"
          className="w-full p-3 text-left"
          onClick={() => {
            if (tx !== 0) {
              setTx(0)
              return
            }
            onOpen()
          }}
        >
          <div className="font-medium">{name}</div>
          <div className="text-xs text-[#8A7968]">
            {nIng} 項材料 · {new Date(updatedAt).toLocaleString('zh-TW')}
          </div>
        </button>
      </div>
    </li>
  )
}

export default function RecipesPage() {
  const router = useRouter()
  const { status } = useSession()
  const replaceAll = useCalcStore((s) => s.replaceAll)
  const [rows, setRows] = useState<Row[]>([])
  const [delId, setDelId] = useState<string | null>(null)
  const [coarsePointer, setCoarsePointer] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const apply = () => setCoarsePointer(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const load = useCallback(async () => {
    if (status !== 'authenticated') return
    const res = await fetch('/api/recipes', { credentials: 'include' })
    if (!res.ok) return
    const data = (await res.json()) as Row[]
    setRows(data)
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') void load()
  }, [status, load])

  const loadRecipe = (r: Row) => {
    const raw = r.ingredients
    if (!raw) {
      router.push('/')
      return
    }

    if (Array.isArray(raw.components) && raw.components.length > 0) {
      const components = raw.components
        .map(normalizeRecipeComponent)
        .filter((x): x is RecipeComponent => x !== null)
      replaceAll({
        ingredients: [],
        components,
        compQuantity: Number(raw.compQuantity ?? 3),
        compLossRate: Number(raw.compLossRate ?? 0),
        mode: raw.mode ?? 'percent',
        targetKind: raw.targetKind ?? 'mold',
        moldVolumeCC: Number(raw.moldVolumeCC ?? 1060),
        moldQuantity: Number(raw.moldQuantity ?? 1),
        totalGram: Number(raw.totalGram ?? 1000),
        loss: raw.loss ?? { type: 'preset', extra: 0 },
        moldUi: raw.moldUi
          ? { ...defaultMoldUi, ...raw.moldUi }
          : defaultMoldUi,
      })
      router.push('/')
      return
    }

    if (raw.lines && Array.isArray(raw.lines)) {
      const moldQuantity = Number(raw.moldQuantity ?? 3)
      const slice = {
        mode: raw.mode ?? 'percent',
        targetKind: raw.targetKind ?? 'mold',
        moldVolumeCC: Number(raw.moldVolumeCC ?? 1060),
        moldQuantity,
        totalGram: Number(raw.totalGram ?? 1000),
        loss: raw.loss ?? { type: 'preset', extra: 0 },
        ingredients: raw.lines,
        moldUi: raw.moldUi ? { ...defaultMoldUi, ...raw.moldUi } : defaultMoldUi,
      }
      const tg = computeResult(slice).targetGram
      const gramPerUnit = moldQuantity > 0 ? tg / moldQuantity : tg
      replaceAll({
        ingredients: [],
        components: [
          defaultRecipeComponent({
            id: makeRecipeId(),
            name: '組合 1',
            gramPerUnit: Math.max(0, gramPerUnit),
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
        loss: raw.loss ?? { type: 'preset', extra: 0 },
        moldUi: raw.moldUi ? { ...defaultMoldUi, ...raw.moldUi } : defaultMoldUi,
      })
    }
    router.push('/')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E6]">
        <p className="text-[#6B5A4A]">檢查登入…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="mb-4 font-serif text-xl">我的配方</h1>
        <p className="mb-4 text-[#6B5A4A]">請先登入以管理配方。</p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => void signIn('google', { callbackUrl: '/recipes' })}>
            Google 登入
          </Button>
          <Button onClick={() => void signIn('apple', { callbackUrl: '/recipes' })}>
            Apple 登入
          </Button>
        </div>
        <Link className="mt-4 inline-block text-[#C8602A] underline" href="/">
          返回首頁
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F0E6] p-4">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-[#C8602A] underline">
          ← 返回
        </Link>
        <h1 className="font-serif text-xl">我的配方</h1>
      </header>
      <ul className="space-y-2">
        {rows.map((r) => {
          const nIng = countIngredientLines(r.ingredients)
          return (
            <RecipeListRow
              key={r.id}
              name={r.name}
              nIng={nIng}
              updatedAt={r.updated_at}
              swipeEnabled={coarsePointer}
              onOpen={() => loadRecipe(r)}
              onDeleteClick={() => setDelId(r.id)}
            />
          )
        })}
      </ul>

      <ConfirmDialog
        open={delId !== null}
        title="刪除配方"
        message="確定刪除？"
        onCancel={() => setDelId(null)}
        onConfirm={async () => {
          if (!delId) return
          await fetch(`/api/recipes/${delId}`, {
            method: 'DELETE',
            credentials: 'include',
          })
          setDelId(null)
          void load()
        }}
      />
    </div>
  )
}
