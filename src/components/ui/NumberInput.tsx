import type { FocusEvent, InputHTMLAttributes } from 'react'

export function NumberInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    invalid?: boolean
  }
) {
  const { className = '', invalid, onFocus, ...rest } = props
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onFocus?.(e)
  }
  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*"
      autoComplete="off"
      className={`w-full rounded-xl border-2 bg-[#FFFBF2] px-3 py-2 text-base font-extrabold outline-none focus:ring-2 focus:ring-[#C8602A]/30 font-[family-name:var(--font-roboto-mono)] ${
        invalid ? 'border-red-500' : 'border-[#6B4A2F]'
      } ${className}`}
      {...rest}
      onFocus={handleFocus}
    />
  )
}
