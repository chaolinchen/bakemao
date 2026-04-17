const PENDING = 'bakemao_pending_saves'

export type PendingRecipe = Record<string, unknown>

export function queueOfflineSave(recipe: PendingRecipe) {
  try {
    const raw = localStorage.getItem(PENDING)
    const list: PendingRecipe[] = raw ? JSON.parse(raw) : []
    list.push(recipe)
    localStorage.setItem(PENDING, JSON.stringify(list))
  } catch {
    /* quota */
  }
}

export function drainPendingSaves() {
  /* Call after online + auth; wire upload in app layer */
}
