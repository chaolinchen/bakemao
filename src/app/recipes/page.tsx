'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RecipeLine } from '@/types/recipe-line'
import { useCalcStore } from '@/store/calcStore'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Dialog'

type Stored = {
  lines?: RecipeLine[]
  mode?: 'percent' | 'gram'
  targetKind?: 'mold' | 'gram'
  moldVolumeCC?: number
  moldQuantity?: number
  totalGram?: number
  loss?: import('@/lib/calculator').LossInput
}

type Row = {
  id: string
  name: string
  ingredients: Stored | null
  updated_at: string
}

export default function RecipesPage() {
  const router = useRouter()
  const replaceAll = useCalcStore((s) => s.replaceAll)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [auth, setAuth] = useState<boolean | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setAuth(false)
      setRows([])
      return
    }
    setAuth(true)
    const { data } = await supabase
      .from('recipes')
      .select('id,name,ingredients,updated_at')
      .order('updated_at', { ascending: false })
    setRows((data as Row[]) ?? [])
  }, [supabase])

  useEffect(() => {
    void load()
  }, [load])

  const loadRecipe = (r: Row) => {
    const raw = r.ingredients
    if (raw?.lines && Array.isArray(raw.lines)) {
      replaceAll({
        ingredients: raw.lines,
        mode: raw.mode ?? 'percent',
        targetKind: raw.targetKind ?? 'mold',
        moldVolumeCC: Number(raw.moldVolumeCC ?? 90),
        moldQuantity: Number(raw.moldQuantity ?? 1),
        totalGram: Number(raw.totalGram ?? 1000),
        loss: raw.loss ?? { type: 'preset', extra: 0 },
      })
    }
    router.push('/')
  }

  if (auth === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E6]">
        <p className="text-[#6B5A4A]">檢查登入…</p>
      </div>
    )
  }

  if (auth === false) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="mb-4 font-serif text-xl">我的配方</h1>
        <p className="mb-4 text-[#6B5A4A]">請先登入以管理配方。</p>
        <Link className="text-[#C8602A] underline" href="/">
          返回首頁登入
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
        {(rows ?? []).map((r) => {
          const nIng = r.ingredients?.lines?.length ?? 0
          return (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-[#E5D8C8] bg-white p-3"
            >
              <button
                type="button"
                className="text-left"
                onClick={() => loadRecipe(r)}
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-[#8A7968]">
                  {nIng} 項材料 ·{' '}
                  {new Date(r.updated_at).toLocaleString('zh-TW')}
                </div>
              </button>
              <Button variant="ghost" onClick={() => setDelId(r.id)}>
                刪除
              </Button>
            </li>
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
          await supabase.from('recipes').delete().eq('id', delId)
          setDelId(null)
          void load()
        }}
      />
    </div>
  )
}
