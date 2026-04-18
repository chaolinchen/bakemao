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
      className={`w-full rounded-lg border px-3 py-2 text-base outline-none ring-[#C8602A]/30 focus:ring-2 ${
        invalid ? 'border-red-500' : 'border-[#D9C9B5]'
      } ${className}`}
      {...rest}
      onFocus={handleFocus}
    />
  )
}
