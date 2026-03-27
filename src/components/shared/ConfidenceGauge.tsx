'use client'

import { motion } from 'framer-motion'

interface ConfidenceGaugeProps {
  value: number
  size?: number
  label?: string
}

function getColor(value: number): string {
  if (value >= 80) return '#10B981' // green
  if (value >= 50) return '#F59E0B' // amber
  return '#EF4444' // red
}

export default function ConfidenceGauge({
  value,
  size = 120,
  label,
}: ConfidenceGaugeProps) {
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(value, 0), 100) / 100
  const strokeDashoffset = circumference * (1 - progress)
  const color = getColor(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2A3A5A"
            strokeWidth={strokeWidth}
          />
          {/* Foreground arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 0.8 }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-bold tabular-nums text-slate-100"
            style={{ fontSize: size * 0.22 }}
          >
            {value.toFixed(1)}%
          </motion.span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      )}
    </div>
  )
}
