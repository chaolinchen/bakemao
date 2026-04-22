'use client'

import { useShallow } from 'zustand/react/shallow'
import { useCalcStore } from '@/store/calcStore'
import { Sparkle } from './ui/Sparkle'
import { Stepper } from './ui/Stepper'

const QUICK_QTY = [1, 2, 4, 6, 12, 24, 48, 100]

export function GlobalQtyCard() {
  const { compQuantity, setCompQuantity } = useCalcStore(
    useShallow((s) => ({
      compQuantity: s.compQuantity ?? 6,
      setCompQuantity: s.setCompQuantity,
    }))
  )

  return (
    <section className="mao-card relative p-4">
      <Sparkle size={18} color="#6BA3D6" style={{ position: 'absolute', top: -12, left: 16 }} />
      <Sparkle size={14} color="#FFB38C" style={{ position: 'absolute', top: -8, right: 30 }} />

      <div className="mb-1 flex items-center justify-between">
        <span className="text-[15.5px] font-extrabold text-[#4A3322]">共做幾個成品？</span>
        <span className="rounded-full border-2 border-[#6B4A2F] bg-[#C8602A] px-3.5 py-1 text-[14px] font-extrabold text-white shadow-[0_2px_0_#6B4A2F]">
          {compQuantity} 個
        </span>
      </div>
      <p className="mb-3 text-[11.5px] text-[#9E8672]">蛋糕幾個、塔幾個、杯子蛋糕幾個…</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {QUICK_QTY.map((q) => (
          <button
            key={q}
            type="button"
            className={`min-w-[44px] rounded-[14px] border-2 border-[#6B4A2F] px-3 py-2 text-[14px] font-extrabold transition ${
              compQuantity === q
                ? 'translate-y-px bg-[#C8602A] text-white shadow-[0_1px_0_#6B4A2F]'
                : 'bg-[#FFFBF2] text-[#6B4A2F] shadow-[0_2px_0_#6B4A2F]'
            }`}
            onClick={() => setCompQuantity(q)}
          >
            {q}
          </button>
        ))}
      </div>

      <Stepper min={1} max={999} value={compQuantity} onChange={setCompQuantity} />
    </section>
  )
}
