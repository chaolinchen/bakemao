'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { queueOfflineSave } from '@/lib/offlineSync'
import { computeResult, useCalcStore } from '@/store/calcStore'
import { BottomSheet } from './ui/BottomSheet'
import { Button } from './ui/Button'

function defaultRecipeName() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `配方 ${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SaveRecipeBar() {
  const { data: session, status } = useSession()
  const [authOpen, setAuthOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)
  const [name, setName] = useState(defaultRecipeName)
  const [toast, setToast] = useState<string | null>(null)
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true

  const save = async () => {
    const snapshot = useCalcStore.getState()
    const r = computeResult(snapshot)
    const ingredientsBlob = {
      lines: snapshot.ingredients,
      mode: snapshot.mode,
      targetKind: snapshot.targetKind,
      moldVolumeCC: snapshot.moldVolumeCC,
      moldQuantity: snapshot.moldQuantity,
      totalGram: snapshot.totalGram,
      loss: snapshot.loss,
      moldUi: snapshot.moldUi,
      resultSnapshot: r.ingredients,
    }
    const payload = {
      name: name.slice(0, 30),
      mode: snapshot.mode,
      target_type: snapshot.targetKind,
      target_gram: r.targetGram,
      mold_id: null as string | null,
      mold_params: snapshot.moldUi as unknown as Record<string, unknown>,
      quantity: snapshot.moldQuantity,
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
      setAuthOpen(true)
      return
    }

    if (!online) {
      queueOfflineSave(payload)
      setToast('已暫存於本機，連線後同步')
      setTimeout(() => setToast(null), 3000)
      setNameOpen(false)
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
      setToast(`儲存失敗：${(err as { error?: string }).error ?? res.statusText}`)
    } else {
      setToast('已儲存 ✓')
    }
    setTimeout(() => setToast(null), 3000)
    setNameOpen(false)
  }

  return (
    <div className="sticky bottom-0 z-30 border-t border-[#E5D8C8] bg-[#F7F0E6]/95 py-3 backdrop-blur">
      {toast ? (
        <p className="mb-2 text-center text-sm text-[#3D2918]">{toast}</p>
      ) : null}
      <Button className="w-full" onClick={() => setNameOpen(true)}>
        儲存配方
      </Button>

      <BottomSheet open={nameOpen} onClose={() => setNameOpen(false)} title="命名">
        <label className="text-xs text-[#6B5A4A]">名稱（最多 30 字）</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          className="mb-4 w-full rounded-lg border border-[#D9C9B5] px-3 py-2"
        />
        <Button className="w-full" onClick={() => void save()}>
          確認儲存
        </Button>
      </BottomSheet>

      <BottomSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="登入以儲存"
      >
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => void signIn('google', { callbackUrl: '/' })}
          >
            Google 登入
          </Button>
          <Button
            className="w-full"
            onClick={() => void signIn('apple', { callbackUrl: '/' })}
          >
            Apple 登入
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
