'use client'

import { useShallow } from 'zustand/react/shallow'
import { useCalcStore } from '@/store/calcStore'
import { Sparkle } from './ui/Sparkle'
import { Stepper } from './ui/Stepper'

const QUICK_QTY = [1, 2, 4, 6, 12, 24, 48, 100]

export function GlobalQtyCard() {
  const { compQuantity, setCompQuantity } = useCalcStore(
    useShallow((s) => ({
      compQuantity: s.compQuantity ?? 1,
      setCompQuantity: s.setCompQuantity,
    }))
  )

  return (
    <section className="mao-card relative p-3">
      <Sparkle size={14} color="#6BA3D6" style={{ position: 'absolute', top: -10, left: 16 }} />

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[14px] font-extrabold text-[#4A3322]">共做幾個成品？</span>
        <Stepper min={1} max={999} value={compQuantity} onChange={setCompQuantity} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_QTY.map((q) => (
          <button
            key={q}
            type="button"
            className={`min-w-[40px] rounded-[12px] border-2 border-[#6B4A2F] px-2.5 py-1.5 text-[13px] font-extrabold transition ${
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
    </section>
  )
}
