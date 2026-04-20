'use client'

import { useShallow } from 'zustand/react/shallow'
import { useCalcStore } from '@/store/calcStore'
import { Stepper } from './ui/Stepper'

const QUICK_QTY = [1, 2, 4, 6, 8, 12]

export function GlobalQtyCard() {
  const { compQuantity, setCompQuantity } = useCalcStore(
    useShallow((s) => ({
      compQuantity: s.compQuantity ?? 6,
      setCompQuantity: s.setCompQuantity,
    }))
  )

  return (
    <section className="rounded-2xl border border-[#E5D8C8] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#3D2918]">共做幾個？</span>
        <span className="text-sm font-bold text-[#C8602A]">{compQuantity} 個</span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {QUICK_QTY.map((q) => (
          <button
            key={q}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              compQuantity === q
                ? 'bg-[#C8602A] text-white shadow-sm'
                : 'border border-[#D9C9B5] bg-[#FAF6F0] text-[#3D2918] hover:bg-[#F0E8DC]'
            }`}
            onClick={() => setCompQuantity(q)}
          >
            {q}
          </button>
        ))}
      </div>
      <Stepper min={1} max={30} value={compQuantity} onChange={setCompQuantity} />
    </section>
  )
}
