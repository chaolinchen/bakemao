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
import type { CakeType, ComponentMoldType } from '@/lib/componentMoldGram'
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
  /** 圓模：吋 or cm（依 roundUnit）；塔圈：cm；杯型時忽略 */
  moldSize: number
  /** 圓模尺寸單位，預設 'inch' */
  roundUnit: 'inch' | 'cm'
  /** 圓模高度 cm，預設 6 */
  roundHeight: number
  /** 杯型：每杯容積（cc），常見值 63/80/90/100/120/166 */
  cupCount: number
  /** null = 繼承全局 compQuantity */
  customQty: number | null
  /** 按模具算時的蛋糕類型（決定比重+填充率） */
  cakeType: CakeType
  /** 自訂比重（cakeType=custom 時生效） */
  customGravity: number
  /** 自訂填充率 0-1（cakeType=custom 時生效） */
  customFillRate: number
  /** 克數輸入模式：true = 輸入 g，自動換算 % */
  gramMode: boolean
  /** 克數模式下各材料的 g 輸入值（lineId → g） */
  gramValues: Record<string, number>
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
    roundUnit: 'inch',
    roundHeight: 6,
    cupCount: 90,
    customQty: null,
    cakeType: 'mousse',
    customGravity: 0.85,
    customFillRate: 0.8,
    gramMode: false,
    gramValues: {},
  }
}

export function normalizeRecipeComponent(c: unknown): RecipeComponent | null {
  if (!c || typeof c !== 'object') return null
  const o = c as Partial<RecipeComponent> & { id?: string; name?: string }
  if (!o.id || typeof o.name !== 'string') return null
  const rawCupCount = Number(o.cupCount)
  // 舊版 cupCount 儲存的是「連數」(6/12/24)，遷移到每杯容積（cc）
  const cupCount =
    Number.isFinite(rawCupCount) && rawCupCount >= 30 ? rawCupCount : 90
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
    roundUnit: o.roundUnit === 'cm' ? 'cm' : 'inch',
    roundHeight:
      Number.isFinite(Number(o.roundHeight)) && Number(o.roundHeight) > 0
        ? Number(o.roundHeight)
        : 6,
    cupCount,
    customQty:
      o.customQty === null || o.customQty === undefined
        ? null
        : Math.min(999, Math.max(1, Math.floor(Number(o.customQty)))),
    cakeType: (['mousse', 'pound', 'sponge', 'chiffon', 'custom'] as CakeType[]).includes(
      o.cakeType as CakeType
    )
      ? (o.cakeType as CakeType)
      : 'mousse',
    customGravity: Number.isFinite(Number(o.customGravity)) && Number(o.customGravity) > 0
      ? Number(o.customGravity)
      : 0.85,
    customFillRate: Number.isFinite(Number(o.customFillRate)) && Number(o.customFillRate) > 0
      ? Number(o.customFillRate)
      : 0.8,
    gramMode: o.gramMode === true,
    gramValues: (o.gramValues && typeof o.gramValues === 'object' && !Array.isArray(o.gramValues))
      ? (o.gramValues as Record<string, number>)
      : {},
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
    addComponentFromTemplate: (name: string, ingredients: Omit<RecipeLine, 'id'>[], gramPerUnit?: number, cakeType?: CakeType) => void
    removeComponent: (id: string) => void
    duplicateComponent: (id: string) => void
    setComponentGramMode: (id: string, mode: boolean) => void
    setCompLineGramValue: (compId: string, lineId: string, g: number) => void
    updateComponentName: (id: string, name: string) => void
    updateComponentGram: (id: string, gram: number) => void
    updateCompLine: (compId: string, lineId: string, patch: Partial<IngredientInput>) => void
    removeCompLine: (compId: string, lineId: string) => void
    addCompLine: (compId: string, line: Omit<RecipeLine, 'id'>) => void
    addCompLineWithId: (compId: string, line: RecipeLine) => void
    insertCompLineAfter: (compId: string, afterLineId: string, line: Omit<RecipeLine, 'id'>) => void
    setCompQuantity: (q: number) => void
    setCompLossRate: (r: number) => void
    clearComponents: () => void
    setComponentTargetMode: (id: string, mode: ComponentTargetMode) => void
    setComponentMold: (
      id: string,
      patch: Partial<Pick<RecipeComponent, 'moldType' | 'moldSize' | 'roundUnit' | 'roundHeight' | 'cupCount' | 'cakeType' | 'customGravity' | 'customFillRate'>>
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
      compQuantity: 6,
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
      addComponentFromTemplate: (name, ingredients, gramPerUnit, cakeType) =>
        set((s) => {
          const comps = s.components ?? []
          const newComp = {
            ...defaultRecipeComponent({
              id: makeRecipeId(),
              name,
              gramPerUnit,
              ingredients: ingredients.map((ing) => ({ ...ing, id: makeRecipeId() })),
            }),
            ...(cakeType ? { cakeType } : {}),
          }
          return { components: [...comps, newComp] }
        }),
      removeComponent: (id) =>
        set((s) => ({
          components: (s.components ?? []).filter((c) => c.id !== id),
        })),
      duplicateComponent: (id) =>
        set((s) => {
          const comps = s.components ?? []
          const idx = comps.findIndex((c) => c.id === id)
          if (idx === -1) return s
          const orig = comps[idx]
          const copy: RecipeComponent = {
            ...orig,
            id: makeRecipeId(),
            name: orig.name + '（複製）',
            ingredients: orig.ingredients.map((ing) => ({ ...ing, id: makeRecipeId() })),
          }
          const next = [...comps]
          next.splice(idx + 1, 0, copy)
          return { components: next }
        }),
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
      addCompLineWithId: (compId, row) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === compId
              ? { ...c, ingredients: [...c.ingredients, { ...row }] }
              : c
          ),
        })),
      insertCompLineAfter: (compId, afterLineId, line) =>
        set((s) => ({
          components: (s.components ?? []).map((c) => {
            if (c.id !== compId) return c
            const idx = c.ingredients.findIndex((r) => r.id === afterLineId)
            const newLine = { ...line, id: makeRecipeId() }
            const next = [...c.ingredients]
            if (idx === -1) {
              next.push(newLine)
            } else {
              next.splice(idx + 1, 0, newLine)
            }
            return { ...c, ingredients: next }
          }),
        })),
      setComponentGramMode: (id, mode) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id ? { ...c, gramMode: mode } : c
          ),
        })),
      setCompLineGramValue: (compId, lineId, g) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === compId
              ? { ...c, gramValues: { ...c.gramValues, [lineId]: g } }
              : c
          ),
        })),
      setCompQuantity: (q) => set({ compQuantity: Math.min(999, Math.max(1, Math.floor(q))) }),
      setCompLossRate: (r) => set({ compLossRate: Math.min(0.3, Math.max(0, r)) }),
      clearComponents: () =>
        set({
          components: [],
          compQuantity: 6,
          compLossRate: 0,
        }),

      setComponentTargetMode: (id, targetMode) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id ? { ...c, targetMode } : c
          ),
        })),

      setComponentMold: (id, patch) =>
        set((s) => ({
          components: (s.components ?? []).map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
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
                      : Math.min(999, Math.max(1, Math.floor(qty))),
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
