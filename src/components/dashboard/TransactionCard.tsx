'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MapPin, CreditCard, Clock } from 'lucide-react'
import type { Transaction } from '@/lib/engine/transactionGenerator'
import RiskScoreBar from '@/components/shared/RiskScoreBar'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency, formatTime } from '@/lib/utils/formatters'
import { slideInRight, pulseGlow, expandCollapse } from '@/lib/utils/animations'

interface TransactionCardProps {
  transaction: Transaction
  isSelected: boolean
  onClick: () => void
  index?: number
}

function getBorderColor(score: number): string {
  if (score <= 25) return '#10B981'
  if (score <= 50) return '#0EA5A0'
  if (score <= 75) return '#F59E0B'
  return '#EF4444'
}

function TransactionCardInner({ transaction, isSelected, onClick, index = 0 }: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const tx = transaction
  const borderColor = getBorderColor(tx.riskScore)
  const isHighRisk = tx.riskScore > 75
  const hasTags = tx.riskScore > 50 && tx.riskFactors.length > 0

  return (
    <motion.div
      layout
      variants={slideInRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      onClick={onClick}
      className={`
        relative bg-navy-700 border rounded-lg cursor-pointer
        transition-colors duration-200
        ${isSelected
          ? 'border-slate-400 ring-1 ring-slate-400/30'
          : 'border-navy-600 hover:border-navy-500'
        }
      `}
      style={isSelected ? { transform: 'scale(1.01)' } : undefined}
    >
      {/* Left colored border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: borderColor }}
      />

      <div className="pl-4 pr-3 py-3">
        {/* Row 1: ID + timestamp */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono text-slate-400">{tx.id}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock size={10} />
            {formatTime(tx.timestamp)}
          </span>
        </div>

        {/* Row 2: Names + Amount */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-100 truncate block">
              {tx.senderName}
            </span>
            <span className="text-xs text-slate-400 truncate block">
              &rarr; {tx.receiverName}
            </span>
          </div>
          <span className="text-lg font-bold text-slate-100 ml-3 whitespace-nowrap">
            {formatCurrency(tx.amount)}
          </span>
        </div>

        {/* Row 3: Pills + Location */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-navy-600 text-slate-300">
            <CreditCard size={10} />
            {tx.type}
          </span>
          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-navy-600 text-slate-300">
            {tx.channel}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <MapPin size={10} />
            {tx.location.area}, {tx.location.city}
          </span>
        </div>

        {/* Row 4: Risk bar + Status badge */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <RiskScoreBar score={tx.riskScore} showLabel size="sm" />
          </div>
          <StatusBadge status={tx.decision} size="sm" />
        </div>

        {/* Expandable risk factor tags */}
        {hasTags && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="flex items-center gap-1 mt-2 text-[10px] font-medium text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
              {tx.riskFactors.filter((f) => f.score > 40).length} risk factors
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  variants={expandCollapse}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex flex-wrap gap-1.5 mt-2"
                >
                  {tx.riskFactors
                    .filter((f) => f.score > 40)
                    .sort((a, b) => b.contribution - a.contribution)
                    .map((factor) => {
                      const factorColor =
                        factor.score > 75
                          ? 'bg-red-500/15 text-red-400 border-red-500/20'
                          : factor.score > 50
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            : 'bg-teal-500/15 text-teal-400 border-teal-500/20'

                      return (
                        <span
                          key={factor.name}
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${factorColor}`}
                        >
                          {factor.name}
                        </span>
                      )
                    })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* High risk pulse glow overlay — Framer Motion spring-based */}
      {isHighRisk && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          variants={pulseGlow}
          initial="idle"
          animate="pulse"
        />
      )}
    </motion.div>
  )
}

const TransactionCard = memo(TransactionCardInner)
export default TransactionCard
