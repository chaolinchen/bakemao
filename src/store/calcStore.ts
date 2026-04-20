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
import { gramPerUnitFromComponentMold } from '@/lib/componentMoldGram'
import type { ComponentMoldType } from '@/lib/componentMoldGram'
import { getMoldParts } from '@/lib/moldParts'
import type { RecipeLine } from '@/types/recipe-line'

export type ComponentTargetMode = 'gram' | 'mold'

export type RecipeComponent = {
  id: string
  name: string
  gramPerUnit: number
  ingredients: RecipeLine[]
  targetMode: ComponentTargetMode
  /** 對應 molds.json id；簡化 UI 未用 preset 時為 null */
  moldPresetId: string | null
  moldType: ComponentMoldType
  /** 圓模：吋；塔圈：cm；杯型時忽略 */
  moldSize: number
  /** 杯型：6 / 12 / 24 連 */
  cupCount: number
  /** null = 繼承全局 compQuantity */
  customQty: number | null
}

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
  presetId: 'round-6',
  chiffonKey: 'medium',
  shape: 'cylinder',
  cyl: { d: '15', h: '6' },
  box: { l: '17', w: '8', h: '6' },
  muffin: { single: '90', qty: 18 },
  direct: '1060',
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
  components?: RecipeComponent[]
  compQuantity?: number     // 1–30, default 3
  compLossRate?: number     // 0–0.3, default 0
}

export function makeRecipeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`
}

export function defaultRecipeComponent(partial: {
  id: string
  name: string
  gramPerUnit?: number
  ingredients?: RecipeLine[]
}): RecipeComponent {
  return {
    id: partial.id,
    name: partial.name,
    gramPerUnit: partial.gramPerUnit ?? 0,
    ingredients: partial.ingredients ?? [],
    targetMode: 'gram',
    moldPresetId: null,
    moldType: 'round',
    moldSize: 6,
    cupCount: 6,
    customQty: null,
  }
}

export function normalizeRecipeComponent(c: unknown): RecipeComponent | null {
  if (!c || typeof c !== 'object') return null
  const o = c as Partial<RecipeComponent> & { id?: string; name?: string }
  if (!o.id || typeof o.name !== 'string') return null
  return {
    id: o.id,
    name: o.name,
    gramPerUnit: Number(o.gramPerUnit ?? 0),
    ingredients: Array.isArray(o.ingredients) ? o.ingredients : [],
    targetMode: o.targetMode === 'mold' ? 'mold' : 'gram',
    moldPresetId: o.moldPresetId ?? null,
    moldType:
      o.moldType === 'tart' || o.moldType === 'cup' ? o.moldType : 'round',
    moldSize: Number.isFinite(Number(o.moldSize)) ? Number(o.moldSize) : 6,
    cupCount: Number.isFinite(Number(o.cupCount)) ? Number(o.cupCount) : 6,
    customQty:
      o.customQty === null || o.customQty === undefined
        ? null
        : Math.min(30, Math.max(1, Math.floor(Number(o.customQty)))),
  }
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
  | 'moldUi'
>

/**
 * 模具目標一律由 moldUi + getMoldParts 推算（與畫面「共 X g」一致），
 * 不依賴 moldVolumeCC/moldQuantity 與 useEffect 同步 → 避免無限 re-render。
 */
export function computeResult(s: CalcMathSlice) {
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
    // multi-component actions
    addComponent: () => void
    removeComponent: (id: string) => void
    updateComponentName: (id: string, name: string) => void
    updateComponentGram: (id: string, gram: number) => void
    updateCompLine: (compId: string, lineId: string, patch: Partial<IngredientInput>) => void
    removeCompLine: (compId: string, lineId: string) => void
    addCompLine: (compId: string, line: Omit<RecipeLine, 'id'>) => void
    setCompQuantity: (q: number) => void
    setCompLossRate: (r: number) => void
    clearComponents: () => void
    setComponentTargetMode: (id: string, mode: ComponentTargetMode) => void
    setComponentMold: (
      id: string,
      patch: Partial<Pick<RecipeComponent, 'moldType' | 'moldSize' | 'cupCount'>>
    ) => void
    setComponentCustomQty: (id: string, qty: number | null) => void
  }
>()(
  persist(
    (set) => ({
      mode: 'percent',
      targetKind: 'mold',
      moldVolumeCC: 1060,
      moldQuantity: 1,
      totalGram: 1000,
      loss: { type: 'preset', extra: 0 },
      ingredients: [],
      moldUi: { ...defaultMoldUi },
      components: [],
      compQuantity: 3,
      compLossRate: 0,

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
          ingredients: [...s.ingredients, { ...row, id: makeRecipeId() }],
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

      // multi-component actions
      addComponent: () =>
        set((s) => {
          const comps = s.components ?? []
          const n = comps.length + 1
          return {
            components: [
              ...comps,
              defaultRecipeComponent({
                id: makeRecipeId(),
                name: `組合 ${n}`,
              }),
            ],
          }
        }),
      removeComponent: (id) =>
        set((s) => ({
          components: (s.components ?? []).filter((c) => c.id !== id),
        })),
      updateComponentName: (id, name) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),
      updateComponentGram: (id, gram) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id ? { ...c, gramPerUnit: gram } : c
          ),
        })),
      updateCompLine: (compId, lineId, patch) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === compId
              ? {
                  ...c,
                  ingredients: c.ingredients.map((r) =>
                    r.id === lineId ? { ...r, ...patch } : r
                  ),
                }
              : c
          ),
        })),
      removeCompLine: (compId, lineId) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === compId
              ? {
                  ...c,
                  ingredients: c.ingredients.filter((r) => r.id !== lineId),
                }
              : c
          ),
        })),
      addCompLine: (compId, line) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === compId
              ? {
                  ...c,
                  ingredients: [
                    ...c.ingredients,
                    { ...line, id: makeRecipeId() },
                  ],
                }
              : c
          ),
        })),
      setCompQuantity: (q) => set({ compQuantity: Math.min(30, Math.max(1, Math.floor(q))) }),
      setCompLossRate: (r) => set({ compLossRate: Math.min(0.3, Math.max(0, r)) }),
      clearComponents: () => set({ components: [] }),

      setComponentTargetMode: (id, targetMode) =>
        set((s) => ({
          components: (s.components ?? []).map((c) => {
            if (c.id !== id) return c
            if (targetMode === 'mold') {
              const gramPerUnit = gramPerUnitFromComponentMold(
                c.moldType,
                c.moldSize,
                c.cupCount
              )
              return { ...c, targetMode, gramPerUnit }
            }
            return { ...c, targetMode }
          }),
        })),

      setComponentMold: (id, patch) =>
        set((s) => ({
          components: (s.components ?? []).map((c) => {
            if (c.id !== id) return c
            const next = { ...c, ...patch }
            if (next.targetMode !== 'mold') return next
            const gramPerUnit = gramPerUnitFromComponentMold(
              next.moldType,
              next.moldSize,
              next.cupCount
            )
            return { ...next, gramPerUnit }
          }),
        })),

      setComponentCustomQty: (id, qty) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id
              ? {
                  ...c,
                  customQty:
                    qty === null
                      ? null
                      : Math.min(30, Math.max(1, Math.floor(qty))),
                }
              : c
          ),
        })),
    }),
    {
      name: 'bakemao_calc_state',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<CalcStateSlice> | undefined
        if (!p) return current as never
        const c = current as unknown as CalcStateSlice
        const rawComps = p.components
        const mergedComponents = Array.isArray(rawComps)
          ? rawComps
              .map((x) => normalizeRecipeComponent(x))
              .filter((x): x is RecipeComponent => x !== null)
          : c.components

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
          components: mergedComponents,
          compQuantity: Number(p.compQuantity ?? c.compQuantity),
          compLossRate: Number(p.compLossRate ?? c.compLossRate),
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
        components: s.components,
        compQuantity: s.compQuantity,
        compLossRate: s.compLossRate,
      }),
    }
  )
)
