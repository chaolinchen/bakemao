'use client'

export function Stepper({
  value,
  min,
  max,
  onChange,
  size = 'default',
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
  size?: 'default' | 'small'
}) {
  const isSmall = size === 'small'
  const btnCls = isSmall
    ? 'w-7 h-7 rounded-lg text-base'
    : 'w-[38px] h-[38px] rounded-[14px] text-xl'
  const numCls = isSmall ? 'text-[15px] min-w-[24px]' : 'text-[22px] min-w-[32px]'
  const wrapCls = isSmall
    ? 'rounded-xl p-[3px] gap-[10px]'
    : 'rounded-[18px] p-1 gap-[18px]'

  return (
    <div
      className={`flex items-center justify-center bg-[#FFE1C7] border-2 border-[#6B4A2F] ${wrapCls}`}
    >
      <button
        type="button"
        className={`${btnCls} flex items-center justify-center bg-white border-2 border-[#6B4A2F] text-[#C8602A] font-extrabold disabled:opacity-40`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span
        className={`${numCls} text-center font-extrabold text-[#4A3322] tabular-nums font-[family-name:var(--font-roboto-mono)]`}
      >
        {value}
      </span>
      <button
        type="button"
        className={`${btnCls} flex items-center justify-center bg-white border-2 border-[#6B4A2F] text-[#C8602A] font-extrabold disabled:opacity-40`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  )
}
