let ref: WakeLockSentinel | null = null

export async function requestWakeLock(): Promise<void> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
  try {
    ref = await navigator.wakeLock.request('screen')
    ref.addEventListener('release', () => {
      ref = null
    })
  } catch {
    /* silent */
  }
}

export function releaseWakeLock(): void {
  void ref?.release()
  ref = null
}
