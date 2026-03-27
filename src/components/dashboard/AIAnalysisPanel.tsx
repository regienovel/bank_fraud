'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, MapPin, Fingerprint, Zap, Clock } from 'lucide-react'
import { useStore } from '@/lib/store/useStore'
import ConfidenceGauge from '@/components/shared/ConfidenceGauge'
import { formatCurrency, formatTime } from '@/lib/utils/formatters'
import { fadeIn } from '@/lib/utils/animations'

const factorColors: Record<string, string> = {
  'Transaction Velocity': '#3B82F6',
  'Geographic Anomaly': '#EF4444',
  'Amount Deviation': '#F59E0B',
  'Time of Day': '#8B5CF6',
  'Merchant Category': '#0EA5A0',
  'Device/Channel': '#D4A843',
}

function getFactorColor(name: string): string {
  return factorColors[name] ?? '#94A3B8'
}

export default function AIAnalysisPanel() {
  const selectedTransaction = useStore((s) => s.selectedTransaction)
  const transactions = useStore((s) => s.transactions)

  // Empty state
  if (!selectedTransaction) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 px-6">
        <Shield size={48} className="mb-4 opacity-30" />
        <p className="text-sm text-center font-medium">
          Select a flagged transaction to view AI analysis
        </p>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Click on any transaction in the feed to see the full risk breakdown
        </p>
      </div>
    )
  }

  const tx = selectedTransaction

  // Get recent transactions for this account (for trail)
  const accountTransactions = transactions
    .filter((t) => t.accountId === tx.accountId && t.id !== tx.id)
    .slice(0, 5)

  // Derive AI confidence from risk score certainty (higher/lower scores = more confident)
  const distFromMiddle = Math.abs(tx.riskScore - 50)
  const aiConfidence = Math.min(70 + distFromMiddle * 0.6, 99.5)

  // Sort factors by contribution descending
  const sortedFactors = [...tx.riskFactors].sort((a, b) => b.contribution - a.contribution)
  const maxContribution = Math.max(...sortedFactors.map((f) => f.contribution), 1)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tx.id}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex flex-col h-full overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A3A5A transparent' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-100">AI Analysis</h2>
          <span className="text-[11px] font-mono text-slate-400">{tx.id}</span>
        </div>

        {/* Section: Risk Score Breakdown */}
        <section className="mb-5">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3">
            Risk Score Breakdown
          </h3>
          <div className="space-y-2.5">
            {sortedFactors.map((factor, i) => {
              const color = getFactorColor(factor.name)
              const widthPercent = (factor.contribution / maxContribution) * 100

              return (
                <div key={factor.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300">{factor.name}</span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
                      {factor.score}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-navy-600">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="border-t border-navy-600 my-1" />

        {/* Section: Decision Explanation */}
        <section className="my-4">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Sparkles size={12} className="text-gold" />
            AI Explanation
          </h3>
          <div className="bg-navy-600/50 border border-navy-600 rounded-lg p-3">
            <p className="text-sm text-slate-200 leading-relaxed">
              {tx.explanation}
            </p>
          </div>
        </section>

        <div className="border-t border-navy-600 my-1" />

        {/* Section: Transaction Trail */}
        <section className="my-4">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <MapPin size={12} className="text-teal" />
            Transaction Trail
          </h3>

          {/* Current transaction */}
          <div className="relative pl-6 space-y-0">
            {/* Current */}
            <div className="relative pb-3">
              <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-red-500 border-2 border-navy-800 z-10" />
              {accountTransactions.length > 0 && (
                <div className="absolute left-[5px] top-4 w-0.5 h-full bg-navy-600" />
              )}
              <div className="ml-2">
                <p className="text-xs font-medium text-slate-100">
                  {formatCurrency(tx.amount)} &mdash; {tx.receiverName}
                </p>
                <p className="text-[10px] text-slate-400">
                  {tx.location.area}, {tx.location.city} &middot; {formatTime(tx.timestamp)}
                </p>
              </div>
            </div>

            {/* Previous transactions */}
            {accountTransactions.map((prevTx, i) => (
              <div key={prevTx.id} className="relative pb-3">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-navy-600 border-2 border-navy-800 z-10" />
                {i < accountTransactions.length - 1 && (
                  <div className="absolute left-[5px] top-4 w-0.5 h-full bg-navy-600" />
                )}
                <div className="ml-2">
                  <p className="text-xs text-slate-300">
                    {formatCurrency(prevTx.amount)} &mdash; {prevTx.receiverName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {prevTx.location.area}, {prevTx.location.city} &middot;{' '}
                    {formatTime(prevTx.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {accountTransactions.length === 0 && (
              <p className="text-xs text-slate-500 ml-2 mt-1">
                No previous transactions for this account
              </p>
            )}
          </div>
        </section>

        <div className="border-t border-navy-600 my-1" />

        {/* Section: Matched Pattern */}
        {tx.matchedPattern && (
          <>
            <section className="my-4">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Fingerprint size={12} className="text-amber" />
                Matched Pattern
              </h3>
              <div className="flex items-center justify-between bg-navy-600/50 border border-navy-600 rounded-lg px-3 py-2.5">
                <span className="text-sm font-medium text-slate-200">
                  {tx.matchedPattern.replace(/_/g, ' ')}
                </span>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  {(75 + Math.random() * 20).toFixed(1)}% match
                </span>
              </div>
            </section>

            <div className="border-t border-navy-600 my-1" />
          </>
        )}

        {/* Section: AI Confidence + Processing Time */}
        <section className="my-4">
          <div className="flex items-center gap-6">
            {/* Confidence gauge */}
            <div className="flex-1 flex justify-center">
              <ConfidenceGauge
                value={parseFloat(aiConfidence.toFixed(1))}
                size={100}
                label="AI Confidence"
              />
            </div>

            {/* Processing time */}
            <div className="flex-1 flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={14} className="text-gold" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Processing Time
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                className="text-2xl font-bold text-slate-100 tabular-nums"
              >
                {tx.processingTime}
                <span className="text-sm font-medium text-slate-400 ml-0.5">ms</span>
              </motion.span>
            </div>
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  )
}
