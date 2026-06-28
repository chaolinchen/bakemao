'use client'

import { useEffect, useState } from 'react'

// 烘進 bundle 的 commit（部署時由 next.config 的 env 注入）。
// 主畫面 PWA 跑的是「被 service worker 快取的舊 bundle」，其 BUILD_COMMIT 會停在舊值；
// 而 /api/version 走網路拿到的是「目前線上」的 commit → 兩者不同就代表有新版。
// /api/version 回傳的是 7 碼短 SHA，但 NEXT_PUBLIC_COMMIT 是完整 40 碼 →
// 必須都正規化成 7 碼再比，否則永遠不相等 → 橫幅每次都跳、按更新也消不掉。
const BUILD_COMMIT = (process.env.NEXT_PUBLIC_COMMIT || '').slice(0, 7)

function isRealCommit(c: string): boolean {
  return !!c && c !== 'local' && c !== 'unknown' && c !== 'dev'
}

export function UpdatePrompt() {
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // 本地 dev / 無 commit 資訊時不啟用（避免一直跳）
    if (!isRealCommit(BUILD_COMMIT)) return
    let stopped = false

    const check = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { commit?: string }
        const live = String(data.commit ?? '')
        if (!stopped && isRealCommit(live) && live !== BUILD_COMMIT) {
          setShow(true)
        }
      } catch {
        /* 離線或失敗就忽略，下次再試 */
      }
    }

    check()
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(check, 60_000)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [])

  if (!show) return null

  const apply = async () => {
    setBusy(true)
    // sw.js 是 skipWaiting + clientsClaim，沒有 SKIP_WAITING 訊息監聽 →
    // 最可靠的更新＝註銷舊 SW + 清掉快取，讓重載直接從網路抓最新 bundle。
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      if (typeof caches !== 'undefined') {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      }
    } catch {
      /* 忽略，直接重載 */
    }
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-x-3 top-[72px] z-[80] mx-auto flex max-w-md items-center gap-3 rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] px-4 py-3 shadow-[0_4px_0_#6B4A2F]"
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-[#4A3322]">有新版本可用 ✨</p>
        <p className="text-[11.5px] text-[#9B7B5A]">點「更新」載入最新版（修正與新功能）</p>
      </div>
      <button
        type="button"
        onClick={() => void apply()}
        disabled={busy}
        className="shrink-0 rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px disabled:opacity-60"
      >
        {busy ? '更新中…' : '更新'}
      </button>
      <button
        type="button"
        onClick={() => setShow(false)}
        disabled={busy}
        className="shrink-0 px-1 text-lg leading-none text-[#8A7968] disabled:opacity-40"
        aria-label="稍後再說"
      >
        ×
      </button>
    </div>
  )
}
