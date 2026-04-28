'use client'

import { useRef, useState, useEffect } from 'react'

const GAUGE_MARKS_PCT = [0, 75, 85, 100]

/** Ángulo en grados para un % dado: arco 225° → -45° CW */
function angleForPct(pct: number): number {
  return 225 - (pct / 100) * 270
}

interface GaugeTicksProps {
  outerRadius: number
  cyPercent?: number
  /** Altura real do gráfico (para que o centro e as etiquetas non se recorten) */
  chartHeight?: number
  tickLength?: number
  stroke?: string
  showLabels?: boolean
}

export function GaugeTicks({
  outerRadius,
  cyPercent = 0.65,
  chartHeight,
  tickLength = 4,
  stroke = '#ffffff',
  showLabels = true,
}: GaugeTicksProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 0, height: 0 }
      setSize({ width, height })
    })
    ro.observe(el)
    setSize(el.getBoundingClientRect())
    return () => ro.disconnect()
  }, [])

  if (size.width === 0 || size.height === 0) {
    return (
      <div ref={wrapperRef} className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden />
    )
  }

  const cx = size.width / 2
  const cy = chartHeight != null ? chartHeight * cyPercent : size.height * cyPercent
  const r = outerRadius
  const RAD = Math.PI / 180
  const labelOffset = 10

  return (
    <div ref={wrapperRef} className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden>
      <svg width={size.width} height={size.height} className="block overflow-visible">
        <g>
          {GAUGE_MARKS_PCT.map((pct) => {
            const angleDeg = angleForPct(pct)
            const rad = angleDeg * RAD
            const x1 = cx + r * Math.cos(rad)
            const y1 = cy - r * Math.sin(rad)
            const x2 = cx + (r + tickLength) * Math.cos(rad)
            const y2 = cy - (r + tickLength) * Math.sin(rad)
            const labelX = cx + (r + tickLength + labelOffset) * Math.cos(rad)
            const labelY = cy - (r + tickLength + labelOffset) * Math.sin(rad)
            return (
              <g key={pct}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {showLabels && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={stroke}
                    fontSize={10}
                    fontWeight={500}
                  >
                    {pct}%
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
