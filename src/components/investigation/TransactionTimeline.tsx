'use client'

import { motion } from 'framer-motion'
import type { Transaction } from '@/lib/engine/transactionGenerator'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency, formatTime } from '@/lib/utils/formatters'
import { MapPin } from 'lucide-react'

interface TransactionTimelineProps {
  transactions: Transaction[]
  highlightedId: string
}

function getDotColor(score: number): string {
  if (score <= 25) return '#10B981'
  if (score <= 50) return '#0EA5A0'
  if (score <= 75) return '#F59E0B'
  return '#EF4444'
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function TransactionTimeline({
  transactions,
  highlightedId,
}: TransactionTimelineProps) {
  return (
    <div className="bg-navy-700 rounded-xl border border-navy-600 p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-6">
        Transaction Timeline
      </h3>

      <motion.div
        className="relative"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-navy-600" />

        <div className="space-y-1">
          {transactions.map((tx) => {
            const isHighlighted = tx.id === highlightedId
            const dotColor = getDotColor(tx.riskScore)

            return (
              <motion.div
                key={tx.id}
                variants={itemVariant}
                className={`relative pl-9 py-3 rounded-lg transition-colors ${
                  isHighlighted
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'hover:bg-navy-600/50'
                }`}
              >
                {/* Dot on the line */}
                {isHighlighted ? (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: dotColor, backgroundColor: `${dotColor}20` }}
                    animate={{
                      boxShadow: [
                        `0 0 0px ${dotColor}00`,
                        `0 0 12px ${dotColor}80`,
                        `0 0 0px ${dotColor}00`,
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                  </motion.div>
                ) : (
                  <div
                    className="absolute left-[5px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 bg-navy-800"
                    style={{ borderColor: dotColor }}
                  />
                )}

                {/* Content */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-slate-500">
                        {tx.id}
                      </span>
                      {isHighlighted && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30"
                        >
                          FLAGGED
                        </motion.span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mb-1">
                      {formatTime(tx.timestamp)}
                    </div>
                    <div className="text-sm text-slate-200 truncate">
                      {tx.receiverName}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin size={10} />
                      {tx.location.area}, {tx.location.city}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`text-sm font-bold ${
                        isHighlighted ? 'text-red-400' : 'text-slate-100'
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </span>
                    <StatusBadge status={tx.decision} size="sm" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
