'use client'

import { useEffect, useRef, useState, type FocusEvent, type InputHTMLAttributes, type KeyboardEvent } from 'react'

export function NumberInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
    invalid?: boolean
  }
) {
  const { className = '', invalid, value, onFocus, onBlur, onKeyDown, onChange, ...rest } = props

  // Keep a local display string so "1." doesn't get swallowed by controlled re-render
  const [localValue, setLocalValue] = useState(String(value ?? ''))
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(String(value ?? ''))
    }
  }, [value])

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    isFocused.current = true
    // 不在 focus 時強制 scrollIntoView：每次點欄位都置中會造成畫面跳動。
    // 交給瀏覽器原生捲動 + visualViewport keyboard offset 處理。
    onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    isFocused.current = false
    // Normalise display on blur (remove trailing dot)
    const parsed = parseFloat(localValue)
    setLocalValue(Number.isFinite(parsed) ? String(parsed) : '')
    onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    onChange?.(e)
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
        setTimeout(() => {
          next.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    }
    onKeyDown?.(e)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      data-ingredient-input
      className={`w-full rounded-xl border-2 bg-[#FFFBF2] px-3 py-2 text-base font-extrabold outline-none focus:ring-2 focus:ring-[#C8602A]/30 font-[family-name:var(--font-roboto-mono)] ${
        invalid ? 'border-red-500' : 'border-[#6B4A2F]'
      } ${className}`}
      {...rest}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  )
}
