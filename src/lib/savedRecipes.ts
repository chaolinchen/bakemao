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
  createdAt: number
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
  snapshot: SavedSingleRecipe | SavedMultiRecipe
): SavedRecipe {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `id-${Math.random().toString(36).slice(2)}`

  const entry: SavedRecipe = {
    id,
    name,
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

export function deleteRecipe(id: string): void {
  const recipes = loadSavedRecipes().filter((r) => r.id !== id)
  persistRecipes(recipes)
}
