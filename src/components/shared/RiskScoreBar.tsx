'use client'

import { motion } from 'framer-motion'
import { riskBarFill } from '@/lib/utils/animations'

interface RiskScoreBarProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

function getColor(score: number): string {
  if (score <= 25) return '#10B981' // green
  if (score <= 50) return '#0EA5A0' // teal
  if (score <= 75) return '#F59E0B' // amber
  return '#EF4444' // red
}

const sizeStyles = {
  sm: { bar: 'h-1.5', text: 'text-[10px]' },
  md: { bar: 'h-2.5', text: 'text-xs' },
}

export default function RiskScoreBar({
  score,
  showLabel = false,
  size = 'md',
}: RiskScoreBarProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100)
  const color = getColor(clampedScore)
  const styles = sizeStyles[size]

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`relative flex-1 rounded-full bg-navy-600 ${styles.bar}`}>
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${styles.bar}`}
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedScore}%` }}
          transition={riskBarFill}
        />
      </div>
      {showLabel && (
        <span
          className={`font-semibold tabular-nums ${styles.text}`}
          style={{ color }}
        >
          {clampedScore}
        </span>
      )}
    </div>
  )
}
