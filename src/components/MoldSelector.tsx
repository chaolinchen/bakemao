'use client'

import { useEffect, useMemo, useState } from 'react'
import molds from '@/data/molds.json'
import { boxVolumeCC, cylinderVolumeCC } from '@/lib/moldsVolume'
import { useCalcStore } from '@/store/calcStore'
import { SegmentControl } from './ui/SegmentControl'
import { NumberInput } from './ui/NumberInput'
import { Stepper } from './ui/Stepper'

type Shape = 'cylinder' | 'rectangle' | 'muffin' | 'direct'
type ChiffonKey = 'small' | 'medium' | 'large'

function parseNum(s: string): number {
  const n = parseFloat(String(s).replace(/,/g, ''))
  return Number.isFinite(n) ? Math.abs(n) : 0
}

function getMoldParts(
  preset: (typeof molds)[number] | undefined,
  presetId: string,
  chiffonKey: ChiffonKey,
  shape: Shape,
  cyl: { d: string; h: string },
  box: { l: string; w: string; h: string },
  muffin: { single: string; qty: number },
  direct: string,
  fixedQty: number
): { volumeCC: number; quantity: number } | null {
  if (!preset) return null

  if (preset.type === 'chiffon' && preset.volumes) {
    return { volumeCC: preset.volumes[chiffonKey], quantity: 1 }
  }

  if (shape === 'muffin') {
    const s = parseNum(muffin.single)
    const q = Math.max(1, Math.min(99, muffin.qty))
    if (s <= 0) return null
    return { volumeCC: s, quantity: q }
  }

  if (shape === 'cylinder') {
    const d = parseNum(cyl.d)
    const h = parseNum(cyl.h)
    if (d <= 0 || h <= 0) return null
    return { volumeCC: cylinderVolumeCC(d, h), quantity: 1 }
  }

  if (shape === 'rectangle') {
    const l = parseNum(box.l)
    const w = parseNum(box.w)
    const h = parseNum(box.h)
    if (l <= 0 || w <= 0 || h <= 0) return null
    return { volumeCC: boxVolumeCC(l, w, h), quantity: 1 }
  }

  // direct
  const per = parseNum(direct)
  if (per <= 0) return null
  if (preset.type === 'fixed') {
    const q = Math.max(1, Math.min(99, fixedQty))
    return { volumeCC: per, quantity: q }
  }
  return { volumeCC: per, quantity: 1 }
}

export function MoldSelector() {
  const targetKind = useCalcStore((s) => s.targetKind)
  const setTargetKind = useCalcStore((s) => s.setTargetKind)
  const moldVolumeCC = useCalcStore((s) => s.moldVolumeCC)
  const moldQuantity = useCalcStore((s) => s.moldQuantity)
  const setMoldVolumeCC = useCalcStore((s) => s.setMoldVolumeCC)
  const setMoldQuantity = useCalcStore((s) => s.setMoldQuantity)
  const totalGram = useCalcStore((s) => s.totalGram)
  const setTotalGram = useCalcStore((s) => s.setTotalGram)

  const [presetId, setPresetId] = useState('pudding-90')
  const [chiffonKey, setChiffonKey] = useState<ChiffonKey>('medium')
  const [shape, setShape] = useState<Shape>('direct')
  const [cyl, setCyl] = useState({ d: '15', h: '6' })
  const [box, setBox] = useState({ l: '17', w: '8', h: '6' })
  const [muffin, setMuffin] = useState({ single: '90', qty: 18 })
  const [direct, setDirect] = useState('90')

  const preset = useMemo(
    () => molds.find((m) => m.id === presetId),
    [presetId]
  )

  useEffect(() => {
    if (!preset) return
    if (preset.type === 'fixed') {
      const v = String(preset.volume)
      setDirect((prev) => (prev === v ? prev : v))
      setMuffin((m) =>
        m.single === v ? m : { ...m, single: v }
      )
    } else if (preset.type === 'chiffon' && preset.volumes) {
      setShape('direct')
      const v = String(preset.volumes[chiffonKey])
      setDirect((prev) => (prev === v ? prev : v))
    } else if (preset.type === 'cylinder') {
      setShape('cylinder')
      const next = { d: String(preset.diameter), h: String(preset.height) }
      setCyl((c) => (c.d === next.d && c.h === next.h ? c : next))
    } else if (preset.type === 'rectangle') {
      setShape('rectangle')
      const next = {
        l: String(preset.length),
        w: String(preset.width),
        h: String(preset.height),
      }
      setBox((b) =>
        b.l === next.l && b.w === next.w && b.h === next.h ? b : next
      )
    }
  }, [presetId, preset, chiffonKey])

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

  const pv = parts?.volumeCC
  const pq = parts?.quantity

  useEffect(() => {
    if (targetKind !== 'mold' || pv == null || pq == null) return
    if (pv === moldVolumeCC && pq === moldQuantity) return
    setMoldVolumeCC(pv)
    setMoldQuantity(pq)
  }, [
    targetKind,
    pv,
    pq,
    moldVolumeCC,
    moldQuantity,
    setMoldVolumeCC,
    setMoldQuantity,
  ])

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
            onChange={(e) => setTotalGram(parseNum(e.target.value))}
          />
        </div>
      ) : (
        <>
          <label className="mb-1 block text-xs text-[#6B5A4A]">模具快選</label>
          <select
            className="mb-3 w-full rounded-lg border border-[#D9C9B5] bg-white px-3 py-2"
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
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
                onChange={(v) => setChiffonKey(v)}
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
              onChange={(v) => setShape(v)}
            />
          </div>

          {shape === 'cylinder' ? (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="直徑 cm"
                value={cyl.d}
                onChange={(v) => setCyl((c) => ({ ...c, d: v }))}
              />
              <Field
                label="高 cm"
                value={cyl.h}
                onChange={(v) => setCyl((c) => ({ ...c, h: v }))}
              />
            </div>
          ) : null}
          {shape === 'rectangle' ? (
            <div className="grid grid-cols-3 gap-2">
              <Field
                label="長 cm"
                value={box.l}
                onChange={(v) => setBox((c) => ({ ...c, l: v }))}
              />
              <Field
                label="寬 cm"
                value={box.w}
                onChange={(v) => setBox((c) => ({ ...c, w: v }))}
              />
              <Field
                label="高 cm"
                value={box.h}
                onChange={(v) => setBox((c) => ({ ...c, h: v }))}
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
                    setMuffin((m) => ({ ...m, single: e.target.value }))
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
                  onChange={(n) => setMuffin((m) => ({ ...m, qty: n }))}
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
                onChange={(e) => setDirect(e.target.value)}
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
