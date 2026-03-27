'use client'

import { motion } from 'framer-motion'

type Status = 'APPROVED' | 'REVIEW' | 'BLOCKED'

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

const statusStyles: Record<Status, string> = {
  APPROVED:
    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REVIEW:
    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  BLOCKED:
    'bg-red-500/10 text-red-400 border border-red-500/20',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center rounded-full font-semibold uppercase tracking-wider
        ${statusStyles[status]}
        ${sizeStyles[size]}
      `}
    >
      {status}
    </motion.span>
  )
}
