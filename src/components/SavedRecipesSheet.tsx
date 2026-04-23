'use client'

import { useState } from 'react'
import type { SavedRecipe, SavedMultiRecipe } from '@/lib/savedRecipes'

interface Props {
  open: boolean
  onClose: () => void
  onLoad: (recipe: SavedRecipe) => void
  onDelete: (id: string) => void
  recipes: SavedRecipe[]
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const M = d.getMonth() + 1
  const D = d.getDate()
  const HH = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${M}/${D} ${HH}:${mm}`
}

export function SavedRecipesSheet({ open, onClose, onLoad, onDelete, recipes }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (!open) return null

  const displayed = recipes.slice(0, 20)

  function handleDeleteClick(id: string) {
    if (confirmId === id) {
      onDelete(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
    }
  }

  function handleLoad(recipe: SavedRecipe) {
    onLoad(recipe)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="relative w-full flex flex-col"
        style={{
          maxHeight: '80vh',
          background: '#FFFBF2',
          border: '2.5px solid #6B4A2F',
          borderBottom: 'none',
          boxShadow: '0 -4px 0 #6B4A2F',
          borderRadius: '24px 24px 0 0',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '2px solid #6B4A2F' }}
        >
          <div>
            <span
              className="text-lg font-extrabold"
              style={{ color: '#3D2918' }}
            >
              我的配方本
            </span>
            <p className="text-xs mt-0.5" style={{ color: '#9B7B5A' }}>
              本機儲存，不需登入
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-base"
            style={{
              background: '#FFE9D1',
              border: '2px solid #6B4A2F',
              color: '#6B4A2F',
            }}
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        {/* Recipe list */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
          {displayed.length === 0 ? (
            <p
              className="text-center py-10 text-sm font-bold"
              style={{ color: '#9B7B5A' }}
            >
              還沒有儲存的配方
            </p>
          ) : (
            displayed.map((recipe) => {
              const isMulti = recipe.snapshot.kind === 'multi'
              const multiSnap = isMulti ? (recipe.snapshot as SavedMultiRecipe) : null
              const componentNames = multiSnap
                ? multiSnap.components.map((c) => c.name).slice(0, 3).join(' · ') +
                  (multiSnap.components.length > 3 ? ` +${multiSnap.components.length - 3}` : '')
                : null

              return (
                <div
                  key={recipe.id}
                  className="flex items-center gap-2 rounded-2xl px-3 py-3"
                  style={{
                    background: '#FFF5E8',
                    border: '2px solid #6B4A2F',
                    boxShadow: '0 2px 0 #6B4A2F',
                  }}
                >
                  {/* Delete button — left side */}
                  <button
                    onClick={() => handleDeleteClick(recipe.id)}
                    className="shrink-0 flex items-center justify-center rounded-lg text-base font-bold"
                    style={{
                      width: 32,
                      height: 32,
                      background: confirmId === recipe.id ? '#DC2626' : '#FFE9D1',
                      border: `1.5px solid ${confirmId === recipe.id ? '#DC2626' : '#D9C9B5'}`,
                      color: confirmId === recipe.id ? '#fff' : '#6B4A2F',
                    }}
                    title={confirmId === recipe.id ? '再按一次確認刪除' : '刪除'}
                    aria-label="刪除配方"
                  >
                    {confirmId === recipe.id ? '!' : '🗑'}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-extrabold text-sm truncate"
                      style={{ color: '#3D2918' }}
                    >
                      {recipe.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: '#9B7B5A' }}>
                        {formatDate(recipe.createdAt)}
                      </span>
                      {isMulti ? (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: '#FFE9D1',
                            color: '#C8602A',
                            border: '1.5px solid #C8602A',
                          }}
                        >
                          多組件
                        </span>
                      ) : (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: '#E0EEFF',
                            color: '#1D4ED8',
                            border: '1.5px solid #1D4ED8',
                          }}
                        >
                          單配方
                        </span>
                      )}
                    </div>
                    {componentNames && (
                      <p
                        className="mt-0.5 text-xs truncate"
                        style={{ color: '#9B7B5A' }}
                      >
                        {componentNames}
                      </p>
                    )}
                  </div>

                  {/* Load button — right side */}
                  <button
                    onClick={() => handleLoad(recipe)}
                    className="shrink-0 text-xs font-bold px-3 py-1 rounded-lg"
                    style={{
                      background: '#C8602A',
                      border: '1.5px solid #6B4A2F',
                      color: '#fff',
                      boxShadow: '0 2px 0 #6B4A2F',
                    }}
                  >
                    載入
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
