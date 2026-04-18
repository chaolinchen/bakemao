import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import molds from '@/data/molds.json'
import {
  calculate,
  type CalcMode,
  type IngredientInput,
  type LossInput,
  type TargetInput,
} from '@/lib/calculator'
import { getMoldParts } from '@/lib/moldParts'
import type { RecipeLine } from '@/types/recipe-line'

export type TargetKind = 'mold' | 'gram'

export type MoldShape = 'cylinder' | 'rectangle' | 'muffin' | 'direct'
export type ChiffonKey = 'small' | 'medium' | 'large'

/** Persisted mold UI (dropdown / segment / inputs) for recipe save & load */
export interface MoldUiState {
  presetId: string
  chiffonKey: ChiffonKey
  shape: MoldShape
  cyl: { d: string; h: string }
  box: { l: string; w: string; h: string }
  muffin: { single: string; qty: number }
  direct: string
}

export const defaultMoldUi: MoldUiState = {
  presetId: 'pudding-90',
  chiffonKey: 'medium',
  shape: 'direct',
  cyl: { d: '15', h: '6' },
  box: { l: '17', w: '8', h: '6' },
  muffin: { single: '90', qty: 18 },
  direct: '90',
}

function moldUiShallowEqual(a: MoldUiState, b: MoldUiState): boolean {
  return (
    a.presetId === b.presetId &&
    a.chiffonKey === b.chiffonKey &&
    a.shape === b.shape &&
    a.direct === b.direct &&
    a.cyl.d === b.cyl.d &&
    a.cyl.h === b.cyl.h &&
    a.box.l === b.box.l &&
    a.box.w === b.box.w &&
    a.box.h === b.box.h &&
    a.muffin.single === b.muffin.single &&
    a.muffin.qty === b.muffin.qty
  )
}

export interface CalcStateSlice {
  mode: CalcMode
  targetKind: TargetKind
  moldVolumeCC: number
  moldQuantity: number
  totalGram: number
  loss: LossInput
  ingredients: RecipeLine[]
  moldUi: MoldUiState
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`
}

/** Fields used by calculator when caller builds state by hand (tests / partial spreads) */
export type CalcMathSlice = Pick<
  CalcStateSlice,
  | 'mode'
  | 'targetKind'
  | 'moldVolumeCC'
  | 'moldQuantity'
  | 'totalGram'
  | 'loss'
  | 'ingredients'
>

/**
 * 模具目標一律由 moldUi + getMoldParts 推算（與畫面「共 X g」一致），
 * 不依賴 moldVolumeCC/moldQuantity 與 useEffect 同步 → 避免無限 re-render。
 */
export function computeResult(s: CalcStateSlice) {
  const ing: IngredientInput[] = s.ingredients.map((row) => ({
    name: row.name,
    brand: row.brand,
    value: row.value,
    isFixed: row.isFixed,
  }))

  let target: TargetInput
  let qtyForLoss = s.moldQuantity

  if (s.targetKind === 'gram') {
    target = { type: 'gram', totalGram: s.totalGram }
  } else {
    const preset = molds.find((m) => m.id === s.moldUi.presetId)
    const parts = getMoldParts(
      preset,
      s.moldUi.presetId,
      s.moldUi.chiffonKey,
      s.moldUi.shape,
      s.moldUi.cyl,
      s.moldUi.box,
      s.moldUi.muffin,
      s.moldUi.direct,
      s.moldQuantity
    )
    if (!parts) {
      target = { type: 'mold', volumeCC: 0, quantity: 0 }
      qtyForLoss = 0
    } else {
      target = {
        type: 'mold',
        volumeCC: parts.volumeCC,
        quantity: parts.quantity,
      }
      qtyForLoss = parts.quantity
    }
  }

  return calculate(s.mode, ing, target, s.loss, qtyForLoss)
}

export const useCalcStore = create<
  CalcStateSlice & {
    setMode: (m: CalcMode) => void
    setTargetKind: (k: TargetKind) => void
    setMoldVolumeCC: (v: number) => void
    setMoldQuantity: (q: number) => void
    setTotalGram: (g: number) => void
    setLoss: (l: LossInput) => void
    setMoldUi: (p: Partial<MoldUiState>) => void
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
      loss: { type: 'preset', extra: 0 },
      ingredients: [],
      moldUi: { ...defaultMoldUi },

      setMode: (mode) => set({ mode }),
      setTargetKind: (targetKind) => set({ targetKind }),
      setMoldVolumeCC: (moldVolumeCC) =>
        set((s) => {
          if (Math.abs(moldVolumeCC - s.moldVolumeCC) < 1e-5) return s
          return { moldVolumeCC }
        }),
      setMoldQuantity: (moldQuantity) =>
        set((s) => {
          if (moldQuantity === s.moldQuantity) return s
          return { moldQuantity }
        }),
      setTotalGram: (totalGram) => set({ totalGram }),
      setLoss: (loss) => set({ loss }),
      setMoldUi: (p) =>
        set((s) => {
          const next = { ...s.moldUi, ...p }
          if (moldUiShallowEqual(next, s.moldUi)) return s
          return { moldUi: next }
        }),
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
      replaceAll: (partial) =>
        set((s) => ({
          ...s,
          ...partial,
          moldUi:
            partial.moldUi !== undefined
              ? { ...defaultMoldUi, ...partial.moldUi }
              : s.moldUi,
        })),
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
      merge: (persisted, current) => {
        const p = persisted as Partial<CalcStateSlice> | undefined
        if (!p) return current as never
        const c = current as unknown as CalcStateSlice
        return {
          ...(current as object),
          mode: p.mode ?? c.mode,
          targetKind: p.targetKind ?? c.targetKind,
          moldVolumeCC: Number(p.moldVolumeCC ?? c.moldVolumeCC),
          moldQuantity: Number(p.moldQuantity ?? c.moldQuantity),
          totalGram: Number(p.totalGram ?? c.totalGram),
          loss: p.loss ?? c.loss,
          ingredients: p.ingredients ?? c.ingredients,
          moldUi: { ...defaultMoldUi, ...(p.moldUi ?? {}) },
        } as never
      },
      partialize: (s) => ({
        mode: s.mode,
        targetKind: s.targetKind,
        moldVolumeCC: s.moldVolumeCC,
        moldQuantity: s.moldQuantity,
        totalGram: s.totalGram,
        loss: s.loss,
        ingredients: s.ingredients,
        moldUi: s.moldUi,
      }),
    }
  )
)
