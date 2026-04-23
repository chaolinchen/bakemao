'use client'

import type { CakeType } from '@/lib/componentMoldGram'

type TemplateIngredient = { name: string; value: number }

export type RecipeTemplate = {
  id: string
  label: string
  description: string
  gramPerUnit: number
  ingredients: TemplateIngredient[]
  cakeType?: CakeType
}

export const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'pound-cake',
    label: '法式磅蛋糕',
    description: '1:1:0.8:0.8 黃金比例，適合初學者',
    gramPerUnit: 450,
    cakeType: 'pound' as CakeType,
    ingredients: [
      { name: '中筋麵粉', value: 100 },
      { name: '無鹽奶油', value: 100 },
      { name: '細砂糖', value: 80 },
      { name: '全蛋', value: 80 },
    ],
  },
  {
    id: 'chiffon-cake',
    label: '戚風蛋糕',
    description: '蛋黃糊＋蛋白霜，輕盈口感',
    gramPerUnit: 600,
    cakeType: 'chiffon' as CakeType,
    ingredients: [
      { name: '低筋麵粉', value: 100 },
      { name: '蛋黃', value: 60 },
      { name: '沙拉油', value: 50 },
      { name: '牛奶', value: 50 },
      { name: '蛋白', value: 180 },
      { name: '細砂糖', value: 100 },
    ],
  },
  {
    id: 'sponge-cake',
    label: '海綿蛋糕',
    description: '全蛋打發，合計 410%，共五組材料',
    gramPerUnit: 600,
    cakeType: 'sponge' as CakeType,
    ingredients: [
      { name: '全蛋', value: 150 },
      { name: '蛋黃', value: 25 },
      { name: '砂糖', value: 93 },
      { name: '鹽', value: 1 },
      { name: '低筋麵粉', value: 100 },
      { name: '香草粉', value: 1 },
      { name: '奶粉', value: 2 },
      { name: '熱水', value: 18 },
      { name: '沙拉油', value: 20 },
    ],
  },
]

export function TemplateDialog({
  open,
  onClose,
  onApply,
}: {
  open: boolean
  onClose: () => void
  onApply: (tpl: RecipeTemplate) => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="關閉"
        onClick={onClose}
      />
      <div className="mao-card relative w-full max-w-sm p-5">
        <h3 className="text-lg font-extrabold text-[#4A3322]">範本配方</h3>
        <p className="mt-1 text-xs text-[#9E8672]">
          套用後會新增一組配方，你可以繼續修改比例。
        </p>
        <div className="mt-4 space-y-3">
          {RECIPE_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="rounded-2xl border-2 border-[#6B4A2F] bg-[#FFE9D1] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#3D2918]">{tpl.label}</p>
                  <p className="mt-0.5 text-xs text-[#8A7968]">{tpl.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tpl.ingredients.map((ing) => (
                      <span
                        key={ing.name}
                        className="rounded-full border border-[#6B4A2F] bg-[#FFFBF2] px-2 py-0.5 text-xs font-extrabold text-[#6B4A2F]"
                      >
                        {ing.name} {ing.value}%
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-xl border-2 border-[#6B4A2F] bg-[#C8602A] px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
                  onClick={() => {
                    onApply(tpl)
                    onClose()
                  }}
                >
                  套用
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-[#6B5A4A] transition hover:bg-black/5"
          onClick={onClose}
        >
          取消
        </button>
      </div>
    </div>
  )
}
