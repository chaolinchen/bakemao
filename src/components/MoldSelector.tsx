'use client'

import { useMemo } from 'react'
import molds from '@/data/molds.json'
import { getMoldParts, parseMoldNum } from '@/lib/moldParts'
import {
  useCalcStore,
  type ChiffonKey,
  type MoldUiState,
} from '@/store/calcStore'
import { SegmentControl } from './ui/SegmentControl'
import { NumberInput } from './ui/NumberInput'
import { Stepper } from './ui/Stepper'

/** Apply preset defaults when user picks from dropdown (no useEffect → no sync loops) */
function moldUiPatchForPreset(
  pr: (typeof molds)[number],
  chiffonKey: ChiffonKey,
  mi: MoldUiState
): Partial<MoldUiState> {
  if (pr.type === 'fixed') {
    const v = String(pr.volume)
    return {
      direct: mi.direct === v ? mi.direct : v,
      muffin:
        mi.muffin.single === v ? mi.muffin : { ...mi.muffin, single: v },
    }
  }
  if (pr.type === 'chiffon' && pr.volumes) {
    const v = String(pr.volumes[chiffonKey])
    return {
      shape: 'direct',
      direct: mi.direct === v ? mi.direct : v,
    }
  }
  if (pr.type === 'cylinder') {
    const next = { d: String(pr.diameter), h: String(pr.height) }
    return {
      shape: 'cylinder',
      cyl:
        mi.cyl.d === next.d && mi.cyl.h === next.h ? mi.cyl : next,
    }
  }
  if (pr.type === 'rectangle') {
    const next = {
      l: String(pr.length),
      w: String(pr.width),
      h: String(pr.height),
    }
    return {
      shape: 'rectangle',
      box:
        mi.box.l === next.l &&
        mi.box.w === next.w &&
        mi.box.h === next.h
          ? mi.box
          : next,
    }
  }
  return {}
}

export function MoldSelector() {
  const targetKind = useCalcStore((s) => s.targetKind)
  const setTargetKind = useCalcStore((s) => s.setTargetKind)
  const moldQuantity = useCalcStore((s) => s.moldQuantity)
  const setMoldQuantity = useCalcStore((s) => s.setMoldQuantity)
  const totalGram = useCalcStore((s) => s.totalGram)
  const setTotalGram = useCalcStore((s) => s.setTotalGram)
  const moldUi = useCalcStore((s) => s.moldUi)
  const setMoldUi = useCalcStore((s) => s.setMoldUi)

  const { presetId, chiffonKey, shape, cyl, box, muffin, direct } = moldUi

  const preset = useMemo(
    () => molds.find((m) => m.id === presetId),
    [presetId]
  )

  const parts = useMemo(
    () =>
      getMoldParts(
        preset,
        presetId,
        chiffonKey,
        shape,
        cyl,
        box,
        muffin,
        direct,
        moldQuantity
      ),
    [
      preset,
      presetId,
      chiffonKey,
      shape,
      cyl,
      box,
      muffin,
      direct,
      moldQuantity,
    ]
  )

  const totalCc =
    targetKind === 'mold' && parts
      ? parts.volumeCC * parts.quantity
      : totalGram

  const showDash = targetKind === 'mold' && parts === null

  return (
    <section className="rounded-2xl border border-[#E5D8C8] bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 font-serif text-lg text-[#3D2918]">模具與目標</h2>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#6B5A4A]">目標</span>
        <SegmentControl
          options={[
            { value: 'mold', label: '選模具' },
            { value: 'gram', label: '輸入總克數' },
          ]}
          value={targetKind}
          onChange={(v) => setTargetKind(v)}
        />
      </div>

      {targetKind === 'gram' ? (
        <div className="mb-2">
          <label className="text-xs text-[#6B5A4A]">總克數（成品）</label>
          <NumberInput
            value={totalGram === 0 ? '' : String(totalGram)}
            onChange={(e) => setTotalGram(parseMoldNum(e.target.value))}
          />
        </div>
      ) : (
        <>
          <label className="mb-1 block text-xs text-[#6B5A4A]">模具快選</label>
          <select
            className="mb-3 w-full rounded-lg border border-[#D9C9B5] bg-white px-3 py-2"
            value={presetId}
            onChange={(e) => {
              const nextId = e.target.value
              const pr = molds.find((m) => m.id === nextId)
              if (!pr) return
              const mi = useCalcStore.getState().moldUi
              const patch = moldUiPatchForPreset(pr, mi.chiffonKey, mi)
              setMoldUi({ presetId: nextId, ...patch })
            }}
          >
            {molds.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {preset?.type === 'chiffon' ? (
            <div className="mb-3">
              <span className="text-sm text-[#6B5A4A]">容積偏好</span>
              <SegmentControl
                className="mt-1"
                options={[
                  { value: 'small', label: '偏小' },
                  { value: 'medium', label: '標準' },
                  { value: 'large', label: '偏大' },
                ]}
                value={chiffonKey}
                onChange={(v) => {
                  const nextKey = v as ChiffonKey
                  const pr = preset
                  if (pr?.type === 'chiffon' && pr.volumes) {
                    const mi = useCalcStore.getState().moldUi
                    const vol = String(pr.volumes[nextKey])
                    setMoldUi({
                      chiffonKey: nextKey,
                      shape: 'direct',
                      direct: mi.direct === vol ? mi.direct : vol,
                    })
                  } else {
                    setMoldUi({ chiffonKey: nextKey })
                  }
                }}
              />
            </div>
          ) : null}

          <div className="mb-2">
            <span className="text-sm text-[#6B5A4A]">計算方式</span>
            <SegmentControl
              className="mt-1 block max-w-full flex-wrap"
              options={[
                { value: 'cylinder', label: '圓柱' },
                { value: 'rectangle', label: '長方' },
                { value: 'muffin', label: '馬芬' },
                { value: 'direct', label: '直接 cc' },
              ]}
              value={shape}
              onChange={(v) => setMoldUi({ shape: v })}
            />
          </div>

          {shape === 'cylinder' ? (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="直徑 cm"
                value={cyl.d}
                onChange={(v) =>
                  setMoldUi({ cyl: { ...cyl, d: v } })
                }
              />
              <Field
                label="高 cm"
                value={cyl.h}
                onChange={(v) =>
                  setMoldUi({ cyl: { ...cyl, h: v } })
                }
              />
            </div>
          ) : null}
          {shape === 'rectangle' ? (
            <div className="grid grid-cols-3 gap-2">
              <Field
                label="長 cm"
                value={box.l}
                onChange={(v) =>
                  setMoldUi({ box: { ...box, l: v } })
                }
              />
              <Field
                label="寬 cm"
                value={box.w}
                onChange={(v) =>
                  setMoldUi({ box: { ...box, w: v } })
                }
              />
              <Field
                label="高 cm"
                value={box.h}
                onChange={(v) =>
                  setMoldUi({ box: { ...box, h: v } })
                }
              />
            </div>
          ) : null}
          {shape === 'muffin' ? (
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[120px] flex-1">
                <label className="text-xs text-[#6B5A4A]">單個容積 cc</label>
                <NumberInput
                  value={muffin.single}
                  onChange={(e) =>
                    setMoldUi({
                      muffin: { ...muffin, single: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-[#6B5A4A]">
                  數量
                </span>
                <Stepper
                  min={1}
                  max={99}
                  value={muffin.qty}
                  onChange={(n) =>
                    setMoldUi({ muffin: { ...muffin, qty: n } })
                  }
                />
              </div>
            </div>
          ) : null}
          {shape === 'direct' ? (
            <div>
              <label className="text-xs text-[#6B5A4A]">
                {preset?.type === 'fixed'
                  ? '單個容積 cc'
                  : '容積 cc'}
              </label>
              <NumberInput
                value={direct}
                onChange={(e) => setMoldUi({ direct: e.target.value })}
              />
              {preset?.type === 'fixed' ? (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-[#6B5A4A]">份數</span>
                  <Stepper
                    min={1}
                    max={99}
                    value={moldQuantity}
                    onChange={setMoldQuantity}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      <p className="mt-3 text-right font-mono text-lg text-[#C8602A]">
        共{' '}
        {showDash ? (
          <span className="text-[#9A8775]">—</span>
        ) : (
          <>{Math.round(totalCc)} g</>
        )}
      </p>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-[#6B5A4A]">{label}</label>
      <NumberInput value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
