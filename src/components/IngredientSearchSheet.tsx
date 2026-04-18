'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import ingredients from '@/data/ingredients.json'
import { BottomSheet } from './ui/BottomSheet'

type IngRow = (typeof ingredients)[number]

export function IngredientSearchSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  onPick: (p: { name: string; brand?: string }) => void
}) {
  const [q, setQ] = useState('')
  const [brandPick, setBrandPick] = useState<IngRow | null>(null)
  const [sheetMaxHeight, setSheetMaxHeight] = useState<number | undefined>(
    undefined
  )

  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      setSheetMaxHeight(vv.height + vv.offsetTop - 8)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open])

  const sheetPanelStyle =
    sheetMaxHeight !== undefined ? { maxHeight: sheetMaxHeight } : undefined

  useEffect(() => {
    if (open) {
      setQ('')
      setBrandPick(null)
    }
  }, [open])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return ingredients.slice(0, 30)
    return ingredients.filter((row) => {
      const hay = [row.name, ...(row.aliases ?? [])].join('\n').toLowerCase()
      return hay.includes(s)
    })
  }, [q])

  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  if (brandPick && brandPick.brands && brandPick.brands.length > 0) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={`\u9078\u64c7\u300c${brandPick.name}\u300d\u54c1\u724c`}
        panelStyle={sheetPanelStyle}
      >
        <ul className="space-y-2">
          {brandPick.brands.map((b) => (
            <li key={b.name}>
              <button
                type="button"
                className="w-full rounded-lg border border-[#D9C9B5] bg-white px-3 py-2 text-left text-sm hover:bg-[#F0E8DC]"
                onClick={() => {
                  onPick({ name: brandPick.name, brand: b.name })
                  setBrandPick(null)
                  onClose()
                }}
              >
                {b.name}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="text-sm text-[#C8602A] underline"
              onClick={() => {
                onPick({ name: brandPick.name })
                setBrandPick(null)
                onClose()
              }}
            >
              {'\u7565\u904e\u54c1\u724c'}
            </button>
          </li>
        </ul>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="\u65b0\u589e\u6750\u6599"
      panelStyle={sheetPanelStyle}
    >
      <input
        ref={searchRef}
        inputMode="search"
        type="search"
        placeholder="\u641c\u5c0b\u98df\u6750\uff0c\u627e\u4e0d\u5230\u53ef\u76f4\u63a5\u8f38\u5165"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={(e) =>
          e.currentTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
        className="mb-3 w-full rounded-lg border border-[#D9C9B5] px-3 py-2"
      />
      <ul className="max-h-[50vh] space-y-1 overflow-auto">
        {filtered.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className="w-full rounded-lg px-2 py-2 text-left hover:bg-[#EDE4D6]"
              onClick={() => {
                if ('brands' in row && row.brands && row.brands.length > 0) {
                  setBrandPick(row)
                  return
                }
                onPick({ name: row.name })
                onClose()
              }}
            >
              <span className="font-medium text-[#3D2918]">{row.name}</span>
              {row.aliases?.length ? (
                <span className="ml-2 text-xs text-[#8A7968]">
                  {row.aliases.join('\u3001')}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {q.trim() && filtered.length === 0 ? (
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#C8602A] py-3 text-base font-medium text-white"
          onClick={() => {
            onPick({ name: q.trim() })
            onClose()
          }}
        >
          <span aria-hidden>{'\u2795'}</span>
          {`\u76f4\u63a5\u4f7f\u7528\u300c${q.trim()}\u300d`}
        </button>
      ) : null}
    </BottomSheet>
  )
}
