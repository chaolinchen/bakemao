import type { ButtonHTMLAttributes } from 'react'

export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const base =
    'rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99] disabled:opacity-40'
  const styles =
    variant === 'primary'
      ? 'bg-[#C8602A] text-white shadow-sm'
      : 'bg-transparent text-[#3D2918] hover:bg-black/5'
  return (
    <button type="button" className={`${base} ${styles} ${className}`} {...props} />
  )
}
