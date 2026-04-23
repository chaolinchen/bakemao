'use client'

import html2canvas from 'html2canvas'
import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { calculateExam } from '@/lib/calculator'
import { aggregateIngredientsAcrossComponents, effectiveGramPerUnit } from '@/lib/multiComponentAggregate'
import { loadSavedRecipes, deleteRecipe, type SavedRecipe } from '@/lib/savedRecipes'
import { shareIgCard } from '@/lib/shareImage'
import { useCalcStore } from '@/store/calcStore'
import type { RecipeLine } from '@/types/recipe-line'
import { ComponentCard, parseNum } from './MultiComponentCard'
import { TemplateDialog } from './MultiTemplateDialog'
import { SavedRecipesSheet } from './SavedRecipesSheet'
import { ConfirmDialog } from './ui/Dialog'
import { NumberInput } from './ui/NumberInput'
import { Sparkle } from './ui/Sparkle'

export function MultiComponentSection() {
  const {
    components: rawComponents,
    compQuantity: rawCompQuantity,
    compLossRate: rawCompLossRate,
    addComponent,
    addComponentFromTemplate,
    removeComponent,
    removeCompLine,
    addCompLineWithId,
    setCompLossRate,
    clearComponents,
    setComponentTargetMode,
  } = useCalcStore(
    useShallow((s) => ({
      components: s.components,
      compQuantity: s.compQuantity,
      compLossRate: s.compLossRate,
      addComponent: s.addComponent,
      addComponentFromTemplate: s.addComponentFromTemplate,
      removeComponent: s.removeComponent,
      removeCompLine: s.removeCompLine,
      addCompLineWithId: s.addCompLineWithId,
      setCompLossRate: s.setCompLossRate,
      clearComponents: s.clearComponents,
      setComponentTargetMode: s.setComponentTargetMode,
    }))
  )

  const components = rawComponents ?? []
  const compQuantity = rawCompQuantity ?? 6
  const compLossRate = rawCompLossRate ?? 0

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (useCalcStore.persist?.hasHydrated?.()) { setHydrated(true); return }
    const unsub = useCalcStore.persist?.onFinishHydration?.(() => setHydrated(true))
    return unsub ?? undefined
  }, [])
  useEffect(() => {
    if (hydrated && components.length === 0) addComponent()
  }, [hydrated, components.length, addComponent])

  const [confirmClear, setConfirmClear] = useState(false)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [showLoss, setShowLoss] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [multiRecipesSheetOpen, setMultiRecipesSheetOpen] = useState(false)
  const [multiSavedRecipes, setMultiSavedRecipes] = useState<SavedRecipe[]>([])

  const handleScreenshot = async () => {
    const el = document.getElementById('multi-section-root')
    if (!el) return
    setScreenshotting(true)
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#F7F0E6',
        scale: 2,
        useCORS: true,
        width: el.offsetWidth,
        height: el.scrollHeight,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        onclone: (_doc, cloned) => {
          cloned.querySelectorAll('input').forEach((inp) => {
            inp.style.border = 'none'
            inp.style.background = 'transparent'
            inp.style.outline = 'none'
          })
          cloned.querySelectorAll('[data-screenshot-hide]').forEach((el) => {
            ;(el as HTMLElement).style.display = 'none'
          })
          cloned.querySelectorAll('button').forEach((btn) => {
            btn.style.display = 'none'
          })
        },
      })
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = `bold ${30}px sans-serif`
        ctx.fillStyle = 'rgba(200, 96, 42, 0.55)'
        ctx.textAlign = 'right'
        ctx.fillText('BakeMao 烘焙貓', canvas.width - 32, canvas.height - 32)
      }
      setScreenshotUrl(canvas.toDataURL('image/png'))
    } finally {
      setScreenshotting(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshotUrl) return
    const a = document.createElement('a')
    a.href = screenshotUrl
    a.download = 'bakemao-配方.png'
    a.click()
  }

  const handleIgShare = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQty = snapshot.compQuantity ?? 6
    const lossRate = snapshot.compLossRate ?? 0
    const { rows, totalGram } = aggregateIngredientsAcrossComponents(comps, globalQty, lossRate)
    if (rows.length === 0) return
    void shareIgCard(
      rows.map((r) => ({ name: r.name + (r.brand ? ` · ${r.brand}` : ''), gram: r.gram })),
      totalGram
    )
  }

  const handleExportCsv = () => {
    const snapshot = useCalcStore.getState()
    const comps = snapshot.components ?? []
    const globalQty = snapshot.compQuantity ?? 6
    const lossRate = snapshot.compLossRate ?? 0
    const rows: string[][] = [['組合', '材料', '烘焙百分比', '克數']]
    for (const comp of comps) {
      const gramForCalc = effectiveGramPerUnit(comp)
      const qty = comp.customQty ?? globalQty
      const gramMap = new Map<string, number>()
      if (gramForCalc > 0 && comp.ingredients.length > 0) {
        const result = calculateExam(
          'percent',
          comp.ingredients.map((i) => ({ name: i.name, brand: i.brand, value: i.value, isFixed: i.isFixed })),
          gramForCalc, qty, lossRate
        )
        for (const r of result.ingredients) gramMap.set(`${r.name}\0${r.brand ?? ''}`, r.gram)
      }
      for (const ing of comp.ingredients) {
        const gram = gramMap.get(`${ing.name}\0${ing.brand ?? ''}`)
        rows.push([comp.name, ing.name + (ing.brand ? ` · ${ing.brand}` : ''), `${ing.value}%`, gram != null ? `${gram.toFixed(1)}` : ''])
      }
    }
    const { rows: summaryRows, totalGram } = aggregateIngredientsAcrossComponents(comps, globalQty, lossRate)
    if (summaryRows.length > 0) {
      rows.push([])
      rows.push(['備料彙總（跨組合加總）', '', '', ''])
      for (const r of summaryRows) rows.push(['', r.name + (r.brand ? ` · ${r.brand}` : ''), '', r.gram.toFixed(1)])
      rows.push(['', '合計', '', totalGram.toFixed(1)])
    }
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bakemao-配方.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const [lineToast, setLineToast] = useState<{ msg: string; onUndo: () => void } | null>(null)
  const lineToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (lineToastTimerRef.current) clearTimeout(lineToastTimerRef.current) }, [])

  const deleteIngredientLine = (compId: string, line: RecipeLine) => {
    removeCompLine(compId, line.id)
    const label = line.name + (line.brand ? ` · ${line.brand}` : '')
    if (lineToastTimerRef.current) { clearTimeout(lineToastTimerRef.current); lineToastTimerRef.current = null }
    setLineToast({
      msg: `已刪除 ${label}`,
      onUndo: () => {
        addCompLineWithId(compId, line)
        setLineToast(null)
        if (lineToastTimerRef.current) { clearTimeout(lineToastTimerRef.current); lineToastTimerRef.current = null }
      },
    })
    lineToastTimerRef.current = setTimeout(() => { setLineToast(null); lineToastTimerRef.current = null }, 3000)
  }

  const yieldPct = Math.round((1 - compLossRate) * 100)
  const lossDisplayPct = Math.round(compLossRate * 100)

  if (components.length === 0) return null

  return (
    <>
    <section id="multi-section-root" className="space-y-4">
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-[#4A3322]">
            <span className="inline-flex rounded-full border-2 border-[#6B4A2F] bg-[#FFD089] p-1 shadow-[0_2px_0_#6B4A2F]">
              <Sparkle size={12} color="#C8602A" />
            </span>
            多組配方計算
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-3 py-1 text-[12.5px] font-extrabold text-white shadow-[0_2px_0_#6B4A2F]"
            onClick={() => setConfirmClear(true)}
            data-screenshot-hide
          >
            ＋ 新配方
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" data-screenshot-hide>
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] disabled:opacity-50"
            onClick={() => void handleScreenshot()}
            disabled={screenshotting}
          >
            {screenshotting ? '截圖中…' : '截圖'}
          </button>
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]"
            onClick={() => { setMultiSavedRecipes(loadSavedRecipes()); setMultiRecipesSheetOpen(true) }}
          >
            配方本
          </button>
          <button
            type="button"
            className="flex min-h-[44px] items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]"
            onClick={() => setShowTemplates(true)}
          >
            範本
          </button>
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border-2 border-[#6B4A2F] bg-[#FFFBF2] px-2.5 py-1 text-[12.5px] font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] sm:flex"
            onClick={handleExportCsv}
          >
            匯出 CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#6B4A2F] bg-white px-3.5 py-3 shadow-[0_3px_0_#6B4A2F]" data-screenshot-hide>
        <button
          type="button"
          className="flex w-full items-center justify-between text-[13.5px] text-[#6B5A4A]"
          onClick={() => setShowLoss((x) => !x)}
        >
          <span>進階：備料損耗比例</span>
          <span className="text-xs text-[#8A7968]">
            {lossDisplayPct > 0 ? `${lossDisplayPct}%（目前套用中）` : '展開設定 ▾'}
          </span>
        </button>
        {showLoss && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="w-24">
                <NumberInput
                  value={lossDisplayPct === 0 ? '' : String(lossDisplayPct)}
                  onChange={(e) => setCompLossRate(Math.min(30, parseNum(e.target.value)) / 100)}
                  placeholder="0"
                />
              </div>
              <span className="text-sm text-[#6B5A4A]">%</span>
              {lossDisplayPct > 0 && (
                <span className="text-xs text-[#8A7968]">材料 = 目標 ÷ {yieldPct}%</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-[#8A7968]">
              備料時的預計損耗（沾鍋、試做等），不確定可不填
            </p>
          </div>
        )}
      </div>

      {components.length === 1 && components[0].ingredients.length === 0 && (
        <div className="rounded-3xl border-[2.5px] border-dashed border-[#6B4A2F] bg-[#FFFBF2] p-4 text-center" data-screenshot-hide>
          <p className="mb-1 text-sm font-extrabold text-[#4A3322]">第一次使用？</p>
          <p className="mb-3 text-xs text-[#9E8672]">套用範本配方快速開始，或直接加材料自行輸入。</p>
          <button
            type="button"
            className="rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] px-4 py-2 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
            onClick={() => setShowTemplates(true)}
          >
            套用範本配方
          </button>
        </div>
      )}

      {components.map((comp) => (
        <ComponentCard
          key={comp.id}
          comp={comp}
          globalQty={compQuantity}
          lossRate={compLossRate}
          onRemove={() => setRemoveId(comp.id)}
          onRemoveIngredient={(line) => deleteIngredientLine(comp.id, line)}
        />
      ))}

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border-[2.5px] border-dashed border-[#6B4A2F] bg-transparent py-3 text-[14px] font-extrabold text-[#6B4A2F]"
        onClick={addComponent}
      >
        ＋ 新增組合
      </button>

      {confirmClear && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/45" aria-label="背景" onClick={() => setConfirmClear(false)} />
          <div className="mao-card relative w-full max-w-sm p-5">
            <h3 className="text-lg font-extrabold text-[#4A3322]">開始新配方？</h3>
            <p className="mt-2 text-sm text-[#5C4D3E]">
              目前的配方組合將被清除，份數設定將重置為 6，備料損耗比例將重置為 0%。請確認已儲存，或先點下方「先儲存配方」。
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] py-2.5 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
                onClick={() => { setConfirmClear(false); window.dispatchEvent(new CustomEvent('bakemao:requestSave')) }}
              >
                先儲存配方
              </button>
              <button type="button" className="w-full rounded-xl py-2.5 text-sm font-medium text-[#6B5A4A] transition hover:bg-black/5" onClick={() => setConfirmClear(false)}>
                取消
              </button>
              <button
                type="button"
                className="w-full py-1.5 text-xs font-medium text-[#C45C5C] transition hover:underline active:scale-[0.99]"
                onClick={() => { clearComponents(); setConfirmClear(false) }}
              >
                直接清空
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={removeId !== null}
        title="刪除組合"
        message="確定刪除此組合？"
        onCancel={() => setRemoveId(null)}
        onConfirm={() => { if (removeId) removeComponent(removeId); setRemoveId(null) }}
      />

      <TemplateDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onApply={(tpl) => {
          clearComponents()
          addComponentFromTemplate(
            tpl.label,
            tpl.ingredients.map((ing) => ({ name: ing.name, value: ing.value, isFixed: false })),
            tpl.gramPerUnit,
            tpl.cakeType
          )
          if (tpl.cakeType && tpl.cakeType !== 'mousse') {
            const comps = useCalcStore.getState().components ?? []
            if (comps.length > 0) setComponentTargetMode(comps[comps.length - 1].id, 'mold')
          }
        }}
      />

      <SavedRecipesSheet
        open={multiRecipesSheetOpen}
        recipes={multiSavedRecipes}
        onClose={() => setMultiRecipesSheetOpen(false)}
        onLoad={(r) => {
          if (r.snapshot.kind !== 'multi') return
          const snap = r.snapshot
          clearComponents()
          useCalcStore.getState().replaceAll({
            components: snap.components,
            compQuantity: snap.compQuantity,
            compLossRate: snap.compLossRate,
          })
        }}
        onDelete={(id) => {
          deleteRecipe(id)
          setMultiSavedRecipes((prev) => prev.filter((r) => r.id !== id))
        }}
      />
    </section>

    {screenshotUrl && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button type="button" aria-label="關閉" className="absolute inset-0 bg-black/60" onClick={() => setScreenshotUrl(null)} />
        <div className="mao-card relative flex w-full max-w-sm flex-col gap-3 p-4">
          <h3 className="text-base font-extrabold text-[#4A3322]">配方截圖</h3>
          <div className="max-h-[50vh] overflow-auto rounded-xl border border-[#E5D8C8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshotUrl} alt="配方截圖" className="w-full" />
          </div>
          <p className="text-center text-xs text-[#8A7968]">行動裝置：長按圖片可儲存到相冊</p>
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#C8602A] py-2.5 text-sm font-extrabold text-white shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
            onClick={downloadScreenshot}
          >
            下載圖片
          </button>
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-[#6B4A2F] bg-[#FFFBF2] py-2.5 text-sm font-extrabold text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F] transition active:translate-y-px"
            onClick={handleIgShare}
          >
            IG 備料卡分享
          </button>
          <button type="button" className="w-full rounded-xl py-2 text-sm text-[#6B5A4A] transition hover:bg-black/5" onClick={() => setScreenshotUrl(null)}>
            關閉
          </button>
        </div>
      </div>
    )}

    {lineToast && (
      <div
        className="fixed bottom-24 left-4 right-4 z-40 flex items-center justify-between gap-3 rounded-xl border border-[#E5D8C8] bg-[#3D2918] px-4 py-3 text-sm text-white shadow-lg"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        role="status"
      >
        <span className="min-w-0 flex-1">{lineToast.msg}</span>
        <button type="button" className="shrink-0 font-medium text-[#F5E6D0] underline underline-offset-2" onClick={() => lineToast.onUndo()}>
          復原
        </button>
      </div>
    )}
    </>
  )
}
