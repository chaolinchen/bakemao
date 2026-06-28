'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { componentGramPerUnit } from '@/lib/multiComponentAggregate'
import { queueOfflineSave } from '@/lib/offlineSync'
import { loadSavedRecipes, saveRecipe, updateRecipe } from '@/lib/savedRecipes'
import { trackEvent } from '@/lib/analytics'
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
  const [notes, setNotes] = useState('')
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true

  const hasAnyResult = useCalcStore((s) => {
    const comps = s.components ?? []
    return comps.some(
      (c) => c.ingredients.length > 0 && componentGramPerUnit(c) > 0
    )
  })

  const loadedRecipeId = useCalcStore((s) => s.loadedRecipeId ?? null)
  const loadedRecipeName = useCalcStore((s) => s.loadedRecipeName ?? null)
  // 載入來源仍存在於配方本時，才顯示「覆蓋」選項
  const [existingLoaded, setExistingLoaded] = useState(false)
  useEffect(() => {
    if (!saveOpen) return
    if (!loadedRecipeId) {
      setExistingLoaded(false)
      return
    }
    setExistingLoaded(loadSavedRecipes().some((r) => r.id === loadedRecipeId))
  }, [saveOpen, loadedRecipeId])

  // Detect keyboard open via visualViewport
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kh = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOpen(kh > 100)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const ln = useCalcStore.getState().loadedRecipeName
      setName(ln || defaultRecipeName())
      setNotes('')
      setSaveOpen(true)
    }
    window.addEventListener('bakemao:requestSave', handler)
    return () => window.removeEventListener('bakemao:requestSave', handler)
  }, [])

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current)
    }
  }, [])

  // overwrite=true 時覆蓋目前載入的配方，否則另存新配方
  const saveLocal = (overwrite: boolean) => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const finalName = name.trim() || '未命名配方'
    const snap =
      comps.length > 0
        ? {
            kind: 'multi' as const,
            components: comps,
            compQuantity: snapshot.compQuantity ?? 1,
            compLossRate: snapshot.compLossRate ?? 0,
          }
        : {
            kind: 'single' as const,
            mode: snapshot.mode,
            ingredients: snapshot.ingredients.map((i) => ({ ...i, brand: i.brand ?? '' })),
            targetKind: snapshot.targetKind,
            totalGram: snapshot.totalGram,
            loss: snapshot.loss,
            moldUi: snapshot.moldUi,
          }

    if (overwrite && loadedRecipeId) {
      const updated = updateRecipe(loadedRecipeId, finalName, snap, notes)
      if (updated) {
        snapshot.setLoadedRecipe(updated.id, updated.name)
        trackEvent('save_recipe', { method: 'local', label: 'overwrite' })
        showToast('已更新配方', `「${updated.name}」已覆蓋`)
        setSaveOpen(false)
        return
      }
      // 找不到舊配方（可能已被刪除）→ 退回另存新檔
    }

    const entry = saveRecipe(finalName, snap, notes)
    snapshot.setLoadedRecipe(entry.id, entry.name)
    trackEvent('save_recipe', { method: 'local', label: overwrite ? 'overwrite_fallback' : 'new' })
    showToast('已存到配方本', '僅限此裝置，換裝置請用雲端備份')
    setSaveOpen(false)
  }

  const saveCloud = async () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQ = snapshot.compQuantity ?? 1

    function multiApproxTargetGram(): number {
      let sum = 0
      for (const c of comps) {
        const qty = c.customQty ?? globalQ
        sum += Math.max(0, componentGramPerUnit(c)) * Math.max(1, qty)
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
      trackEvent('save_recipe', { method: 'cloud' })
      showToast('雲端備份成功 ✓')
    }
    setSaveOpen(false)
  }

  // FAB: only show when there are results AND keyboard is closed
  if (!hasAnyResult || keyboardOpen) return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setName(loadedRecipeName || defaultRecipeName())
          setNotes('')
          setSaveOpen(true)
        }}
        className="fixed left-4 z-30 flex items-center gap-2 rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-4 py-3 text-sm font-extrabold tracking-wide text-white shadow-[0_4px_0_#6B4A2F,0_8px_16px_rgba(107,74,47,0.3)] transition active:translate-y-[2px] active:shadow-[0_2px_0_#6B4A2F]"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Sparkle size={13} color="#fff" />
        儲存配方
      </button>

      <BottomSheet open={saveOpen} onClose={() => setSaveOpen(false)} title="儲存配方">
        <label className="text-xs text-[#6B5A4A]">名稱（最多 30 字）</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          className="mb-3 w-full rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-3 py-2"
        />
        <label className="text-xs text-[#6B5A4A]">備註（選填，最多 100 字）</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 100))}
          placeholder="版本說明、調整記錄…"
          rows={2}
          className="mb-5 w-full resize-none rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-3 py-2 text-sm"
        />

        <div className="flex flex-col gap-3">
          {existingLoaded ? (
            <>
              <button
                type="button"
                onClick={() => saveLocal(true)}
                className="flex flex-col items-start gap-0.5 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFE1C7] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px"
              >
                <span className="text-sm font-extrabold text-[#4A3322]">更新此配方（覆蓋）</span>
                <span className="text-xs text-[#9B7B5A] truncate max-w-full">
                  覆蓋「{loadedRecipeName}」· 僅限此裝置
                </span>
              </button>
              <button
                type="button"
                onClick={() => saveLocal(false)}
                className="flex flex-col items-start gap-0.5 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px"
              >
                <span className="text-sm font-extrabold text-[#4A3322]">另存為新配方</span>
                <span className="text-xs text-[#9B7B5A]">保留舊配方，新增一筆 · 僅限此裝置</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => saveLocal(false)}
              className="flex flex-col items-start gap-0.5 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px"
            >
              <span className="text-sm font-extrabold text-[#4A3322]">存到配方本（本機）</span>
              <span className="text-xs text-[#9B7B5A]">免登入 · 僅限此裝置</span>
            </button>
          )}

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
    </>
  )
}
