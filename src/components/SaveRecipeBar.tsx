'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { componentGramPerUnit } from '@/lib/multiComponentAggregate'
import { queueOfflineSave } from '@/lib/offlineSync'
import { loadSavedRecipes, saveRecipe, updateRecipe, type SavedRecipe } from '@/lib/savedRecipes'
import { trackEvent } from '@/lib/analytics'
import { showToast } from '@/lib/toast'
import { computeResult, useCalcStore } from '@/store/calcStore'
import { BottomSheet } from './ui/BottomSheet'
import { Sparkle } from './ui/Sparkle'

type Dest = 'local' | 'cloud'
type SaveMode = 'new' | 'overwrite'
type PickItem = { id: string; name: string }

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

  // 儲存位置（本機 / 雲端）+ 儲存方式（新增 / 覆蓋哪一份）
  const [dest, setDest] = useState<Dest>('local')
  const [saveMode, setSaveMode] = useState<SaveMode>('new')
  const [overwriteId, setOverwriteId] = useState<string | null>(null)
  const [localList, setLocalList] = useState<SavedRecipe[]>([])
  const [cloudList, setCloudList] = useState<PickItem[]>([])
  const [cloudLoading, setCloudLoading] = useState(false)

  const currentList: PickItem[] =
    dest === 'local' ? localList.map((r) => ({ id: r.id, name: r.name })) : cloudList

  // 開啟面板：載入本機清單並設定預設（本機；若是從配方本載入的就預設覆蓋該份）
  useEffect(() => {
    if (!saveOpen) return
    const list = loadSavedRecipes()
    setLocalList(list)
    setDest('local')
    if (loadedRecipeId && list.some((r) => r.id === loadedRecipeId)) {
      setSaveMode('overwrite')
      setOverwriteId(loadedRecipeId)
    } else {
      setSaveMode('new')
      setOverwriteId(null)
    }
  }, [saveOpen, loadedRecipeId])

  // 切到雲端且已登入時，抓取雲端配方清單供「更新哪一份」挑選
  useEffect(() => {
    if (!saveOpen || dest !== 'cloud' || status !== 'authenticated') return
    let aborted = false
    setCloudLoading(true)
    fetch('/api/recipes', { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: Array<{ id: string; name: string }>) => {
        if (!aborted) setCloudList(rows.map((r) => ({ id: r.id, name: r.name })))
      })
      .catch(() => {})
      .finally(() => {
        if (!aborted) setCloudLoading(false)
      })
    return () => {
      aborted = true
    }
  }, [saveOpen, dest, status])

  const switchDest = (d: Dest) => {
    setDest(d)
    setSaveMode('new')
    setOverwriteId(null)
  }

  const pickOverwrite = (item: PickItem) => {
    setOverwriteId(item.id)
    setName(item.name)
  }

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

  const buildSnapshot = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
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
    return { snapshot, snap }
  }

  // 本機：saveMode='overwrite' 覆蓋 overwriteId，否則新增
  const saveLocal = () => {
    const { snapshot, snap } = buildSnapshot()
    const finalName = name.trim() || '未命名配方'
    const overwrite = saveMode === 'overwrite' && !!overwriteId

    if (overwrite && overwriteId) {
      const updated = updateRecipe(overwriteId, finalName, snap, notes)
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

  const buildCloudPayload = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQ = snapshot.compQuantity ?? 1

    const multiApproxTargetGram = (): number => {
      let sum = 0
      for (const c of comps) {
        const qty = c.customQty ?? globalQ
        sum += Math.max(0, componentGramPerUnit(c)) * Math.max(1, qty)
      }
      return sum
    }

    const legacyResult = snapshot.ingredients.length > 0 ? computeResult(snapshot) : null
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
    return {
      name: (name.trim() || '未命名配方').slice(0, 30),
      mode: snapshot.mode,
      target_type: (legacyResult ? snapshot.targetKind : 'gram') as
        | typeof snapshot.targetKind
        | 'gram',
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
  }

  // 雲端：未登入→登入；overwrite→PUT 指定 id；否則→POST 新增
  const saveCloud = async () => {
    if (status !== 'authenticated' || !session) {
      void signIn('google', { callbackUrl: '/' })
      return
    }

    const overwrite = saveMode === 'overwrite' && !!overwriteId
    const payload = buildCloudPayload()

    if (!online) {
      if (overwrite) {
        showToast('離線時雲端只能新增，更新請連線後再試')
        return
      }
      queueOfflineSave(payload)
      showToast('已暫存於本機，連線後同步')
      setSaveOpen(false)
      return
    }

    const res = overwrite
      ? await fetch(`/api/recipes/${overwriteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      : await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      showToast(`雲端${overwrite ? '更新' : '備份'}失敗：${(err as { error?: string }).error ?? res.statusText}`)
      return
    }
    trackEvent('save_recipe', { method: 'cloud', label: overwrite ? 'overwrite' : 'new' })
    showToast(overwrite ? '雲端配方已更新 ✓' : '雲端備份成功 ✓')
    setSaveOpen(false)
  }

  const primarySave = () => (dest === 'local' ? saveLocal() : void saveCloud())

  // FAB: only show when there are results AND keyboard is closed
  if (!hasAnyResult || keyboardOpen) return null

  const cloudNeedsLogin = dest === 'cloud' && status !== 'authenticated'
  const overwriteBlocked = saveMode === 'overwrite' && !overwriteId
  const showModeChooser = !cloudNeedsLogin && currentList.length > 0
  const targetName = currentList.find((r) => r.id === overwriteId)?.name ?? ''

  let primaryTitle: string
  let primarySub: string
  if (cloudNeedsLogin) {
    primaryTitle = '登入並雲端備份'
    primarySub = '需 Google 帳號 · 跨裝置同步'
  } else if (dest === 'local') {
    primaryTitle = saveMode === 'overwrite' ? '更新此配方（覆蓋）' : '存到配方本（新增一份）'
    primarySub = saveMode === 'overwrite' ? `覆蓋「${targetName}」· 僅限此裝置` : '免登入 · 僅限此裝置'
  } else {
    primaryTitle = saveMode === 'overwrite' ? '更新雲端配方（覆蓋）' : '雲端備份（新增一份）'
    primarySub = saveMode === 'overwrite' ? `覆蓋「${targetName}」· 跨裝置同步` : '跨裝置同步 · Google 帳號'
  }

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
          className="mb-4 w-full resize-none rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-3 py-2 text-sm"
        />

        {/* 儲存位置：本機 / 雲端 */}
        <p className="mb-1.5 text-xs font-bold text-[#6B5A4A]">儲存到哪裡</p>
        <div className="mb-3 flex gap-1 rounded-[14px] border-2 border-[#6B4A2F] bg-[#FFE1C7] p-1">
          {(
            [
              { v: 'local' as const, label: '本機配方本' },
              { v: 'cloud' as const, label: '雲端同步' },
            ]
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => switchDest(opt.v)}
              className={`flex-1 rounded-[10px] py-2 text-[13px] font-extrabold transition-all ${
                dest === opt.v ? 'border-2 border-[#6B4A2F] bg-white text-[#C8602A]' : 'text-[#9E8672]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {cloudNeedsLogin && (
          <p className="mb-4 rounded-xl border border-[#D9C9B5] bg-[#FFF8F0] px-3 py-2 text-[11.5px] text-[#8A7968]">
            雲端同步需登入 Google 帳號，可跨裝置存取。點下方按鈕登入後即可備份。
          </p>
        )}

        {/* 儲存方式：新增 / 覆蓋哪一份（該位置已有配方時才需要選） */}
        {showModeChooser && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-bold text-[#6B5A4A]">儲存方式</p>
            <div className="mb-2 flex gap-1 rounded-[14px] border-2 border-[#6B4A2F] bg-[#FFE1C7] p-1">
              {(
                [
                  { v: 'new' as const, label: '新增一份' },
                  { v: 'overwrite' as const, label: '更新現有' },
                ]
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => {
                    setSaveMode(opt.v)
                    if (opt.v === 'overwrite') {
                      const target =
                        (overwriteId && currentList.find((r) => r.id === overwriteId)) || currentList[0]
                      if (target) pickOverwrite(target)
                    }
                  }}
                  className={`flex-1 rounded-[10px] py-2 text-[13px] font-extrabold transition-all ${
                    saveMode === opt.v ? 'border-2 border-[#6B4A2F] bg-white text-[#C8602A]' : 'text-[#9E8672]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {saveMode === 'overwrite' && (
              <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-xl border-2 border-[#6B4A2F] bg-[#FFFBF2] p-2">
                <p className="px-1 text-[11px] text-[#8A7968]">要覆蓋哪一份？</p>
                {currentList.map((r) => {
                  const active = overwriteId === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => pickOverwrite(r)}
                      className={`flex w-full items-center gap-2 rounded-lg border-2 px-2.5 py-2 text-left transition ${
                        active ? 'border-[#C8602A] bg-[#FFE1C7]' : 'border-[#E5D8C8] bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          active ? 'border-[#C8602A]' : 'border-[#C0AE99]'
                        }`}
                      >
                        {active ? <span className="h-2 w-2 rounded-full bg-[#C8602A]" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#4A3322]">{r.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {dest === 'cloud' && status === 'authenticated' && cloudLoading && (
          <p className="mb-3 text-[11.5px] text-[#8A7968]">讀取雲端配方中…</p>
        )}

        <button
          type="button"
          onClick={primarySave}
          disabled={overwriteBlocked}
          className={`flex w-full flex-col items-start gap-0.5 rounded-2xl border-[2.5px] border-[#6B4A2F] px-4 py-3 text-left shadow-[0_3px_0_#6B4A2F] transition active:translate-y-px disabled:opacity-50 ${
            dest === 'cloud' ? 'bg-[#C8602A]' : 'bg-[#FFFBF2]'
          }`}
        >
          <span className={`text-sm font-extrabold ${dest === 'cloud' ? 'text-white' : 'text-[#4A3322]'}`}>
            {primaryTitle}
          </span>
          <span className={`max-w-full truncate text-xs ${dest === 'cloud' ? 'text-[#FFE0C8]' : 'text-[#9B7B5A]'}`}>
            {primarySub}
          </span>
        </button>
      </BottomSheet>
    </>
  )
}
