export function OfflineBanner({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="sticky top-0 z-40 bg-amber-800 px-4 py-2 text-center text-sm text-amber-50">
      目前離線，變更將在連線後同步（若已登入）
    </div>
  )
}
