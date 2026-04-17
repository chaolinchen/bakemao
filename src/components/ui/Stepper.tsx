'use client'

import { Button } from './Button'

export function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        className="!px-3"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </Button>
      <span className="min-w-[2rem] text-center font-mono text-lg">{value}</span>
      <Button
        variant="ghost"
        className="!px-3"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        +
      </Button>
    </div>
  )
}
