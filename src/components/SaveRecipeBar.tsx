'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { gramPerUnitFromComponentMold } from '@/lib/componentMoldGram'
import { queueOfflineSave } from '@/lib/offlineSync'
import { saveRecipe } from '@/lib/savedRecipes'
import { showToast } from '@/lib/toast'
import { computeResult, useCalcStore } from '@/store/calcStore'
import { BottomSheet } from './ui/BottomSheet'
import { Sparkle } from './ui/Sparkle'

function defaultRecipeName() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `配方 ${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SaveRecipeBar() {
  const { data: session, status } = useSession()
  const [saveOpen, setSaveOpen] = useState(false)
  const [name, setName] = useState(defaultRecipeName)
  const [nudge, setNudge] = useState(false)
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true

  const hasAnyResult = useCalcStore((s) => {
    const comps = s.components ?? []
    return comps.some(
      (c) =>
        c.ingredients.length > 0 &&
        (c.targetMode === 'mold' || c.gramPerUnit > 0)
    )
  })

  useEffect(() => {
    if (!hasAnyResult || status !== 'unauthenticated') return
    const key = 'bakemao_save_nudge'
    if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) return
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, '1')
    setNudge(true)
    nudgeTimerRef.current = setTimeout(() => setNudge(false), 6000)
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    }
  }, [hasAnyResult, status])

  useEffect(() => {
    const handler = () => {
      setName(defaultRecipeName())
      setSaveOpen(true)
    }
    window.addEventListener('bakemao:requestSave', handler)
    return () => window.removeEventListener('bakemao:requestSave', handler)
  }, [])

  const saveLocal = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    if (comps.length > 0) {
      saveRecipe(name.trim() || '未命名配方', {
        kind: 'multi',
        components: comps,
        compQuantity: snapshot.compQuantity ?? 6,
        compLossRate: snapshot.compLossRate ?? 0,
      })
    } else {
      saveRecipe(name.trim() || '未命名配方', {
        kind: 'single',
        mode: snapshot.mode,
        ingredients: snapshot.ingredients.map((i) => ({ ...i, brand: i.brand ?? '' })),
        targetKind: snapshot.targetKind,
        totalGram: snapshot.totalGram,
        loss: snapshot.loss,
        moldUi: snapshot.moldUi,
      })
    }
    showToast('已存到配方本', '僅限此裝置，換裝置請用雲端備份')
    setSaveOpen(false)
  }

  const saveCloud = async () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQ = snapshot.compQuantity ?? 6

    function multiApproxTargetGram(): number {
      let sum = 0
      for (const c of comps) {
        const qty = c.customQty ?? globalQ
        const g =
          c.targetMode === 'mold'
            ? gramPerUnitFromComponentMold(c.moldType, c.moldSize, c.cupCount)
            : c.gramPerUnit
        sum += Math.max(0, g) * Math.max(1, qty)
      }
      return sum
    }

    const legacyResult =
      snapshot.ingredients.length > 0 ? computeResult(snapshot) : null
    const targetGram = legacyResult?.targetGram ?? multiApproxTargetGram()

    const ingredientsBlob = {
      lines: snapshot.ingredients,
      components: comps,
      compQuantity: snapshot.compQuantity,
      compLossRate: snapshot.compLossRate,
      mode: snapshot.mode,
      targetKind: snapshot.targetKind,
      moldVolumeCC: snapshot.moldVolumeCC,
      moldQuantity: snapshot.moldQuantity,
      totalGram: snapshot.totalGram,
      loss: snapshot.loss,
      moldUi: snapshot.moldUi,
      resultSnapshot: legacyResult?.ingredients ?? [],
    }
    const payload = {
      name: name.slice(0, 30),
      mode: snapshot.mode,
      target_type: (legacyResult
        ? snapshot.targetKind
        : 'gram') as typeof snapshot.targetKind | 'gram',
      target_gram: targetGram,
      mold_id: null as string | null,
      mold_params: snapshot.moldUi as unknown as Record<string, unknown>,
      quantity: comps.length > 0 ? globalQ : snapshot.moldQuantity,
      loss_type: snapshot.loss.type,
      loss_value:
        snapshot.loss.type === 'manual'
          ? snapshot.loss.ratio
          : snapshot.loss.type === 'preset'
            ? snapshot.loss.extra
            : 0,
      ingredients: ingredientsBlob,
      client_updated_at: new Date().toISOString(),
    }

    if (status !== 'authenticated' || !session) {
      void signIn('google', { callbackUrl: '/' })
      return
    }

    if (!online) {
      queueOfflineSave(payload)
      showToast('已暫存於本機，連線後同步')
      setSaveOpen(false)
      return
    }

    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      showToast(`雲端備份失敗：${(err as { error?: string }).error ?? res.statusText}`)
    } else {
      showToast('雲端備份成功 ✓')
    }
    setSaveOpen(false)
  }

  return (
    <div
      className="sticky bottom-0 z-30 px-4"
      style={{
        paddingTop: '14px',
        paddingBottom:
          'calc(14px + env(safe-area-inset-bottom) + var(--keyboard-offset, 0px))',
      }}
    >
      {nudge ? (
        <p className="mb-2 text-center text-xs text-[#6B5A4A]">
          計算完成！可儲存配方以便下次使用 ↓
        </p>
      ) : null}

      <div className="mx-auto max-w-lg">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-[20px] border-[2.5px] border-[#6B4A2F] bg-[#C8602A] py-4 text-base font-extrabold tracking-[2px] text-white shadow-[0_5px_0_#6B4A2F,0_10px_20px_rgba(107,74,47,0.25)] transition active:translate-y-[2px] active:shadow-[0_3px_0_#6B4A2F,0_5px_10px_rgba(107,74,47,0.15)]"
          onClick={() => {
            setName(defaultRecipeName())
            setSaveOpen(true)
          }}
        >
          <Sparkle size={14} color="#fff" />
          儲存配方
        </button>
      </div>

      <BottomSheet open={saveOpen} onClose={() => setSaveOpen(false)} title="儲存配方">
        <label className="text-xs text-[#6B5A4A]">名稱（最多 30 字）</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          className="mb-5 w-full rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-3 py-2"
        />

        <div className="flex flex-col gap-3">
          {/* Local save */}
          <button
            type="button"
            onClick={saveLocal}
            className="flex flex-col items-start gap-0.5 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px"
          >
            <span className="text-sm font-extrabold text-[#4A3322]">存到配方本（本機）</span>
            <span className="text-xs text-[#9B7B5A]">免登入 · 僅限此裝置</span>
          </button>

          {/* Cloud save */}
          <button
            type="button"
            onClick={() => void saveCloud()}
            className="flex flex-col items-start gap-0.5 rounded-2xl border-[2.5px] border-[#6B4A2F] bg-[#C8602A] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px"
          >
            <span className="text-sm font-extrabold text-white">
              {status === 'authenticated' ? '雲端備份' : '雲端備份（需登入）'}
            </span>
            <span className="text-xs text-[#FFE0C8]">跨裝置同步 · Google 帳號</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
