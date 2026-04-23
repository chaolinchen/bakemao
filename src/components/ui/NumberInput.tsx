import type { FocusEvent, InputHTMLAttributes, KeyboardEvent } from 'react'

export function NumberInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    invalid?: boolean
  }
) {
  const { className = '', invalid, onFocus, onKeyDown, ...rest } = props
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onFocus?.(e)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const all = Array.from(
        document.querySelectorAll<HTMLInputElement>('[data-ingredient-input]')
      )
      const idx = all.indexOf(e.currentTarget)
      if (idx !== -1 && idx < all.length - 1) {
        e.preventDefault()
        const next = all[idx + 1]
        next.focus()
        next.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    onKeyDown?.(e)
  }
  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*"
      autoComplete="off"
      data-ingredient-input
      className={`w-full rounded-xl border-2 bg-[#FFFBF2] px-3 py-2 text-base font-extrabold outline-none focus:ring-2 focus:ring-[#C8602A]/30 font-[family-name:var(--font-roboto-mono)] ${
        invalid ? 'border-red-500' : 'border-[#6B4A2F]'
      } ${className}`}
      {...rest}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    />
  )
}
