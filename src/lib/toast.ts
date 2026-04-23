type Listener = (message: string) => void
const listeners: Listener[] = []
export function showToast(message: string) {
  listeners.forEach(l => l(message))
}
export function subscribeToast(l: Listener) {
  listeners.push(l)
  return () => { const i = listeners.indexOf(l); if (i !== -1) listeners.splice(i, 1) }
}
