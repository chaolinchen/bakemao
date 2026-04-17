'use client'

type Opt<T extends string> = { value: T; label: string }

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: Opt<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  return (
    <div
      className={`inline-flex rounded-xl bg-[#F0E8DC] p-1 ${className}`}
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            value === o.value
              ? 'bg-white text-[#3D2918] shadow'
              : 'text-[#6B5A4A]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
