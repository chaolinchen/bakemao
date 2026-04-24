type ToastPayload = { message: string; subtitle?: string }
type Listener = (payload: ToastPayload) => void
const listeners: Listener[] = []
export function showToast(message: string, subtitle?: string) {
  listeners.forEach(l => l({ message, subtitle }))
}
export function subscribeToast(l: Listener) {
  listeners.push(l)
  return () => { const i = listeners.indexOf(l); if (i !== -1) listeners.splice(i, 1) }
}
