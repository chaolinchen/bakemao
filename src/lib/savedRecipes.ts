import type { RecipeComponent } from '@/store/calcStore'

export interface SavedSingleRecipe {
  kind: 'single'
  mode: 'percent' | 'gram'
  ingredients: Array<{ id: string; name: string; brand: string; value: number; isFixed: boolean }>
  targetKind: string
  totalGram: number
  loss: unknown
  moldUi: unknown
}

export interface SavedMultiRecipe {
  kind: 'multi'
  components: RecipeComponent[]
  compQuantity: number
  compLossRate: number
}

export interface SavedRecipe {
  id: string
  name: string
  notes?: string
  createdAt: number
  updatedAt?: number
  snapshot: SavedSingleRecipe | SavedMultiRecipe
}

const STORAGE_KEY = 'bakemao_saved_recipes'

export const MAX_SAVED = 20

export function loadSavedRecipes(): SavedRecipe[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as SavedRecipe[]
  } catch {
    return []
  }
}

function persistRecipes(recipes: SavedRecipe[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}

export function saveRecipe(
  name: string,
  snapshot: SavedSingleRecipe | SavedMultiRecipe,
  notes?: string
): SavedRecipe {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `id-${Math.random().toString(36).slice(2)}`

  const entry: SavedRecipe = {
    id,
    name,
    ...(notes?.trim() ? { notes: notes.trim() } : {}),
    createdAt: Date.now(),
    snapshot,
  }

  let recipes = loadSavedRecipes()
  recipes = [entry, ...recipes]

  // If over limit, remove oldest entries (they end up at the tail after prepend)
  if (recipes.length > MAX_SAVED) {
    recipes = recipes.slice(0, MAX_SAVED)
  }

  persistRecipes(recipes)
  return entry
}

/**
 * 覆蓋更新既有配方（保留原 id 與 createdAt）。
 * 找不到該 id 時回傳 null（呼叫端可改用 saveRecipe 另存新檔）。
 */
export function updateRecipe(
  id: string,
  name: string,
  snapshot: SavedSingleRecipe | SavedMultiRecipe,
  notes?: string
): SavedRecipe | null {
  const recipes = loadSavedRecipes()
  const idx = recipes.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const entry: SavedRecipe = {
    ...recipes[idx],
    name,
    snapshot,
    ...(notes?.trim() ? { notes: notes.trim() } : { notes: undefined }),
    updatedAt: Date.now(),
  }
  recipes[idx] = entry
  persistRecipes(recipes)
  return entry
}

export function deleteRecipe(id: string): void {
  const recipes = loadSavedRecipes().filter((r) => r.id !== id)
  persistRecipes(recipes)
}
