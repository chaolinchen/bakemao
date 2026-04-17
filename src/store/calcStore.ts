import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  calculate,
  type CalcMode,
  type IngredientInput,
  type LossInput,
  type TargetInput,
} from '@/lib/calculator'
import type { RecipeLine } from '@/types/recipe-line'

export type TargetKind = 'mold' | 'gram'

export interface CalcStateSlice {
  mode: CalcMode
  targetKind: TargetKind
  moldVolumeCC: number
  moldQuantity: number
  totalGram: number
  loss: LossInput
  ingredients: RecipeLine[]
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`
}

function targetFromSlice(s: CalcStateSlice): TargetInput {
  if (s.targetKind === 'gram') {
    return { type: 'gram', totalGram: s.totalGram }
  }
  return { type: 'mold', volumeCC: s.moldVolumeCC, quantity: s.moldQuantity }
}

export function computeResult(s: CalcStateSlice) {
  const ing: IngredientInput[] = s.ingredients.map((row) => ({
    name: row.name,
    brand: row.brand,
    value: row.value,
    isFixed: row.isFixed,
  }))
  return calculate(s.mode, ing, targetFromSlice(s), s.loss, s.moldQuantity)
}

export const useCalcStore = create<
  CalcStateSlice & {
    setMode: (m: CalcMode) => void
    setTargetKind: (k: TargetKind) => void
    setMoldVolumeCC: (v: number) => void
    setMoldQuantity: (q: number) => void
    setTotalGram: (g: number) => void
    setLoss: (l: LossInput) => void
    setIngredients: (rows: RecipeLine[]) => void
    updateLine: (id: string, patch: Partial<IngredientInput>) => void
    removeLine: (id: string) => void
    addLine: (row: Omit<RecipeLine, 'id'>) => void
    addLineWithId: (row: RecipeLine) => void
    replaceAll: (partial: Partial<CalcStateSlice>) => void
    clearIngredients: () => void
    resetRecipeInput: () => void
  }
>()(
  persist(
    (set) => ({
      mode: 'percent',
      targetKind: 'mold',
      moldVolumeCC: 90,
      moldQuantity: 18,
      totalGram: 1000,
      loss: { type: 'manual', ratio: 0.1 },
      ingredients: [],

      setMode: (mode) => set({ mode }),
      setTargetKind: (targetKind) => set({ targetKind }),
      setMoldVolumeCC: (moldVolumeCC) => set({ moldVolumeCC }),
      setMoldQuantity: (moldQuantity) => set({ moldQuantity }),
      setTotalGram: (totalGram) => set({ totalGram }),
      setLoss: (loss) => set({ loss }),
      setIngredients: (ingredients) => set({ ingredients }),
      updateLine: (id, patch) =>
        set((s) => ({
          ingredients: s.ingredients.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        })),
      removeLine: (id) =>
        set((s) => ({
          ingredients: s.ingredients.filter((r) => r.id !== id),
        })),
      addLine: (row) =>
        set((s) => ({
          ingredients: [...s.ingredients, { ...row, id: makeId() }],
        })),
      addLineWithId: (row) =>
        set((s) => ({ ingredients: [...s.ingredients, row] })),
      replaceAll: (partial) => set(partial),
      clearIngredients: () => set({ ingredients: [] }),
      resetRecipeInput: () =>
        set({
          ingredients: [],
          mode: 'percent',
          loss: { type: 'preset', extra: 0 },
        }),
    }),
    {
      name: 'bakemao_calc_state',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        targetKind: s.targetKind,
        moldVolumeCC: s.moldVolumeCC,
        moldQuantity: s.moldQuantity,
        totalGram: s.totalGram,
        loss: s.loss,
        ingredients: s.ingredients,
      }),
    }
  )
)
