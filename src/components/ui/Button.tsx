import type { ButtonHTMLAttributes } from 'react'

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const base =
    'rounded-2xl px-4 py-2.5 text-sm font-extrabold transition active:translate-y-px disabled:opacity-40'
  const styles =
    variant === 'primary'
      ? 'bg-[#C8602A] text-white border-2 border-[#6B4A2F] shadow-[0_3px_0_#6B4A2F] active:shadow-[0_1px_0_#6B4A2F]'
      : 'bg-transparent text-[#6B4A2F] hover:bg-black/5'
  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...props} />
  )
}
