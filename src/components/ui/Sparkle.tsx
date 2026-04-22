export function Sparkle({
  size = 14,
  color = '#6BA3D6',
  style,
}: {
  size?: number
  color?: string
  style?: React.CSSProperties
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style}>
      <path
        d="M12 0 L13.5 9 L22 12 L13.5 15 L12 24 L10.5 15 L2 12 L10.5 9 Z"
        fill={color}
      />
    </svg>
  )
}
