'use client'

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Brain,
  FileWarning,
  Ghost,
  Siren,
  Timer,
  Eye,
  EyeOff,
  Zap,
  XCircle,
} from 'lucide-react'
import { generateTransaction } from '@/lib/engine/transactionGenerator'
import type { Transaction } from '@/lib/engine/transactionGenerator'
import { ACCOUNT_PROFILES } from '@/lib/data/accountProfiles'
import { formatCurrency } from '@/lib/utils/formatters'
import AnimatedCounter from '@/components/shared/AnimatedCounter'

// ── Types ──────────────────────────────────────────────────────────────────

interface ComparisonTransaction {
  transaction: Transaction
  ruleBasedDecision: 'APPROVED' | 'REVIEW' | 'BLOCKED'
  ruleBasedResponseTime: number
  ruleBasedMissedFraud: boolean
  ruleBasedFalsePositive: boolean
  aiMissedFraud: boolean
  aiFalsePositive: boolean
}

interface ComparisonStats {
  fraudCaughtAI: number
  fraudCaughtRuleBased: number
  fraudMissedAI: number
  fraudMissedRuleBased: number
  falseAlarmsAI: number
  falseAlarmsRuleBased: number
  totalProcessed: number
  totalFraud: number
  avgResponseTimeAI: number
  avgResponseTimeRuleBased: number
}

// ── Rule-Based Detection Simulator ─────────────────────────────────────────

function simulateRuleBasedDecision(txn: Transaction): {
  decision: 'APPROVED' | 'REVIEW' | 'BLOCKED'
  responseTime: number
} {
  const responseTime = Math.round(1500 + Math.random() * 2000)

  // Only catches: amount > 10,000 GH₵
  if (txn.amount > 10000) {
    return { decision: 'BLOCKED', responseTime }
  }

  // ~15% false positive rate on legitimate transactions
  if (!txn.isFraud && Math.random() < 0.15) {
    return { decision: 'BLOCKED', responseTime }
  }

  // Only catches ~12% of remaining fraud (overall ~38% detection)
  if (txn.isFraud && Math.random() < 0.12) {
    return { decision: 'REVIEW', responseTime }
  }

  return { decision: 'APPROVED', responseTime }
}

function createComparisonTransaction(
  recentTransactions: Transaction[],
  fraudRate: number
): ComparisonTransaction {
  const txn = generateTransaction(ACCOUNT_PROFILES, recentTransactions, fraudRate)
  const ruleResult = simulateRuleBasedDecision(txn)

  const ruleBasedMissedFraud =
    txn.isFraud && ruleResult.decision === 'APPROVED'
  const ruleBasedFalsePositive =
    !txn.isFraud &&
    (ruleResult.decision === 'BLOCKED' || ruleResult.decision === 'REVIEW')

  const aiMissedFraud =
    txn.isFraud && txn.decision === 'APPROVED'
  const aiFalsePositive =
    !txn.isFraud && (txn.decision === 'BLOCKED' || txn.decision === 'REVIEW')

  return {
    transaction: txn,
    ruleBasedDecision: ruleResult.decision,
    ruleBasedResponseTime: ruleResult.responseTime,
    ruleBasedMissedFraud,
    ruleBasedFalsePositive,
    aiMissedFraud,
    aiFalsePositive,
  }
}

// ── Rule-Based Card ────────────────────────────────────────────────────────

const RuleBasedCard = memo(function RuleBasedCard({
  item,
}: {
  item: ComparisonTransaction
}) {
  const { transaction: txn, ruleBasedDecision, ruleBasedMissedFraud, ruleBasedFalsePositive, ruleBasedResponseTime } = item
  const isMissed = ruleBasedMissedFraud
  const isFalseAlarm = ruleBasedFalsePositive

  // Missed fraud: greyed out card, the fraud slipped right through
  if (isMissed) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -40, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative rounded-lg mb-2 overflow-hidden"
      >
        {/* Desaturated / greyed-out card — the fraud was invisible to this system */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5 opacity-50 grayscale">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-400 truncate block">
                {txn.senderName}
              </span>
              <span className="text-xs text-slate-500 truncate block">
                {txn.receiverName}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-semibold text-slate-400 tabular-nums">
                {formatCurrency(txn.amount)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400/50 border border-emerald-500/10">
                APPROVED
              </span>
            </div>
          </div>
        </div>

        {/* MISSED overlay — stamps across the card */}
        <motion.div
          initial={{ opacity: 0, scale: 1.5, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.25 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-red-950/80 border-2 border-red-500/60 rounded-lg px-4 py-1.5 shadow-lg shadow-red-900/30">
            <EyeOff size={14} className="text-red-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-red-400">
              Missed Fraud
            </span>
          </div>
        </motion.div>

        {/* Danger stripe at top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
          className="absolute top-0 left-0 right-0 h-[3px] bg-red-500/70 origin-left"
        />
      </motion.div>
    )
  }

  // False alarm: amber-highlighted legitimate transaction incorrectly flagged
  if (isFalseAlarm) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -40, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative rounded-lg mb-2 overflow-hidden"
      >
        {/* Amber-tinted card */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-200 truncate block">
                {txn.senderName}
              </span>
              <span className="text-xs text-slate-400 truncate block">
                {txn.receiverName}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-semibold text-slate-100 tabular-nums">
                {formatCurrency(txn.amount)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                BLOCKED
              </span>
            </div>
          </div>
          {/* Customer impact note */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-1.5 mt-2 pt-2 border-t border-amber-500/15"
          >
            <XCircle size={11} className="text-amber-400 shrink-0" />
            <span className="text-[10px] text-amber-400/80">
              Legitimate transaction blocked — customer frustrated
            </span>
          </motion.div>
        </div>

        {/* FALSE ALARM badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
          className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 rounded px-1.5 py-0.5"
        >
          <Siren size={10} className="text-amber-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
            False Alarm
          </span>
        </motion.div>

        {/* Amber stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500/60" />
      </motion.div>
    )
  }

  // Normal card for rule-based side (correctly handled)
  const borderColor =
    ruleBasedDecision === 'BLOCKED' ? '#EF4444' :
    ruleBasedDecision === 'REVIEW' ? '#F59E0B' : '#10B981'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative rounded-lg mb-2 border-l-[3px] bg-navy-700/40 border border-navy-600/50 px-3 py-2.5"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-200 truncate block">
            {txn.senderName}
          </span>
          <span className="text-xs text-slate-500 truncate block">
            {txn.receiverName}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-semibold text-slate-100 tabular-nums">
            {formatCurrency(txn.amount)}
          </span>
          <DecisionBadge decision={ruleBasedDecision} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Timer size={10} className="text-slate-500" />
        <span className="text-[10px] text-slate-500 tabular-nums">{ruleBasedResponseTime}ms</span>
      </div>
    </motion.div>
  )
})

// ── AI Card ────────────────────────────────────────────────────────────────

const AICard = memo(function AICard({
  item,
}: {
  item: ComparisonTransaction
}) {
  const { transaction: txn, aiFalsePositive } = item
  const isCaughtFraud = txn.isFraud && (txn.decision === 'BLOCKED' || txn.decision === 'REVIEW')

  // AI caught real fraud — show it proudly
  if (isCaughtFraud) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: 40, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative rounded-lg mb-2 overflow-hidden"
      >
        <div className="bg-red-950/20 border border-red-500/30 rounded-lg px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-200 truncate block">
                {txn.senderName}
              </span>
              <span className="text-xs text-slate-400 truncate block">
                {txn.receiverName}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-sm font-semibold text-slate-100 tabular-nums">
                {formatCurrency(txn.amount)}
              </span>
              <DecisionBadge decision={txn.decision} />
            </div>
          </div>
          {/* AI explanation snippet */}
          {txn.matchedPattern && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-start gap-1.5 mt-2 pt-2 border-t border-red-500/15"
            >
              <Brain size={11} className="text-teal shrink-0 mt-0.5" />
              <span className="text-[10px] text-teal/80 leading-relaxed">
                Pattern detected: {txn.matchedPattern}
              </span>
            </motion.div>
          )}
        </div>

        {/* CAUGHT badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.15 }}
          className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 rounded px-1.5 py-0.5"
        >
          <Eye size={10} className="text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
            Caught
          </span>
        </motion.div>

        {/* Teal stripe */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal/60" />

        {/* Pulse glow */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0px rgba(14, 165, 160, 0)',
              '0 0 16px rgba(14, 165, 160, 0.4)',
              '0 0 0px rgba(14, 165, 160, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
        />
      </motion.div>
    )
  }

  // Normal card for AI side
  const borderColor =
    txn.decision === 'BLOCKED' ? '#EF4444' :
    txn.decision === 'REVIEW' ? '#F59E0B' : '#10B981'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="relative rounded-lg mb-2 border-l-[3px] bg-navy-700/40 border border-navy-600/50 px-3 py-2.5"
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-200 truncate block">
            {txn.senderName}
          </span>
          <span className="text-xs text-slate-500 truncate block">
            {txn.receiverName}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-semibold text-slate-100 tabular-nums">
            {formatCurrency(txn.amount)}
          </span>
          <DecisionBadge decision={txn.decision} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Zap size={10} className="text-teal" />
        <span className="text-[10px] text-teal tabular-nums">{txn.processingTime}ms</span>
      </div>
    </motion.div>
  )
})

// ── Decision Badge ─────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: 'APPROVED' | 'REVIEW' | 'BLOCKED' }) {
  const styles = {
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    BLOCKED: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[decision]}`}>
      {decision}
    </span>
  )
}

// ── Score Counter Card ────────────────────────────────────────────────────

function ScoreCard({
  label,
  icon,
  ruleValue,
  aiValue,
  ruleColor,
  aiColor,
  ruleBad,
  suffix,
  decimals,
}: {
  label: string
  icon: React.ReactNode
  ruleValue: number
  aiValue: number
  ruleColor: string
  aiColor: string
  ruleBad?: boolean
  suffix?: string
  decimals?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-navy-800/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-navy-600/50"
    >
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {/* Rule-based */}
        <div className="flex-1 text-center">
          <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-wider">Rule-Based</div>
          <div className="relative">
            <AnimatedCounter
              value={ruleValue}
              suffix={suffix}
              decimals={decimals ?? 0}
              className="text-2xl"
            />
            {/* Make bad rule-based numbers visually alarming */}
            {ruleBad && ruleValue > 0 && (
              <motion.div
                className="absolute inset-0 rounded pointer-events-none"
                animate={{
                  boxShadow: [
                    `0 0 0px ${ruleColor}00`,
                    `0 0 12px ${ruleColor}40`,
                    `0 0 0px ${ruleColor}00`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-4 bg-navy-600" />
          <span className="text-[9px] text-slate-600 font-medium">vs</span>
          <div className="w-px h-4 bg-navy-600" />
        </div>

        {/* AI */}
        <div className="flex-1 text-center">
          <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-wider">AI Model</div>
          <AnimatedCounter
            value={aiValue}
            suffix={suffix}
            decimals={decimals ?? 0}
            className="text-2xl"
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

const MAX_FEED = 50
const INTERVAL_MS = 800

export default function SplitScreenView() {
  const [feed, setFeed] = useState<ComparisonTransaction[]>([])
  const [stats, setStats] = useState<ComparisonStats>({
    fraudCaughtAI: 0,
    fraudCaughtRuleBased: 0,
    fraudMissedAI: 0,
    fraudMissedRuleBased: 0,
    falseAlarmsAI: 0,
    falseAlarmsRuleBased: 0,
    totalProcessed: 0,
    totalFraud: 0,
    avgResponseTimeAI: 47,
    avgResponseTimeRuleBased: 2300,
  })
  const [isRunning, setIsRunning] = useState(true)
  const recentRef = useRef<Transaction[]>([])
  const ruleScrollRef = useRef<HTMLDivElement>(null)
  const aiScrollRef = useRef<HTMLDivElement>(null)

  const addTransaction = useCallback(() => {
    const compTxn = createComparisonTransaction(recentRef.current, 0.06)

    recentRef.current = [compTxn.transaction, ...recentRef.current].slice(0, 100)
    setFeed((prev) => [compTxn, ...prev].slice(0, MAX_FEED))

    setStats((prev) => {
      const txn = compTxn.transaction
      const aiCaught = txn.isFraud && (txn.decision === 'BLOCKED' || txn.decision === 'REVIEW')
      const ruleCaught = txn.isFraud && (compTxn.ruleBasedDecision === 'BLOCKED' || compTxn.ruleBasedDecision === 'REVIEW')
      const aiMissed = txn.isFraud && txn.decision === 'APPROVED'
      const ruleMissed = compTxn.ruleBasedMissedFraud
      const aiFP = compTxn.aiFalsePositive
      const ruleFP = compTxn.ruleBasedFalsePositive

      const newTotal = prev.totalProcessed + 1
      const newAvgAI = (prev.avgResponseTimeAI * prev.totalProcessed + txn.processingTime) / newTotal
      const newAvgRule = (prev.avgResponseTimeRuleBased * prev.totalProcessed + compTxn.ruleBasedResponseTime) / newTotal

      return {
        fraudCaughtAI: prev.fraudCaughtAI + (aiCaught ? 1 : 0),
        fraudCaughtRuleBased: prev.fraudCaughtRuleBased + (ruleCaught ? 1 : 0),
        fraudMissedAI: prev.fraudMissedAI + (aiMissed ? 1 : 0),
        fraudMissedRuleBased: prev.fraudMissedRuleBased + (ruleMissed ? 1 : 0),
        falseAlarmsAI: prev.falseAlarmsAI + (aiFP ? 1 : 0),
        falseAlarmsRuleBased: prev.falseAlarmsRuleBased + (ruleFP ? 1 : 0),
        totalProcessed: newTotal,
        totalFraud: prev.totalFraud + (txn.isFraud ? 1 : 0),
        avgResponseTimeAI: Math.round(newAvgAI),
        avgResponseTimeRuleBased: Math.round(newAvgRule),
      }
    })
  }, [])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(addTransaction, INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isRunning, addTransaction])

  // Auto-scroll both feeds to top
  useEffect(() => {
    ruleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    aiScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [feed.length])

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Rule-Based vs AI Detection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identical transactions — two very different outcomes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums bg-navy-700/50 px-3 py-1.5 rounded-lg border border-navy-600/50">
            <span>{stats.totalProcessed} processed</span>
            <span className="text-navy-600">|</span>
            <span className="text-red-400">{stats.totalFraud} fraud</span>
          </div>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-medium transition-all
              ${isRunning
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
              }
            `}
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Two-column feed area */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Left: Rule-Based */}
        <div className="flex flex-col rounded-xl border border-navy-600/40 overflow-hidden bg-navy-800/50">
          {/* Column header */}
          <div className="px-4 py-3 border-b border-navy-600/40 bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-500/10">
                <FileWarning size={18} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-300">Rule-Based System</h3>
                <p className="text-[10px] text-slate-500">Static thresholds · Pattern matching only</p>
              </div>
              {/* Live problem indicator */}
              {stats.fraudMissedRuleBased > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5"
                >
                  <Ghost size={10} className="text-red-400" />
                  <span className="text-[10px] font-medium text-red-400 tabular-nums">
                    {stats.fraudMissedRuleBased} missed
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <div
            ref={ruleScrollRef}
            className="flex-1 overflow-y-auto px-3 py-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A3A5A transparent', maxHeight: 'calc(100vh - 400px)' }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((item) => (
                <RuleBasedCard key={`rule-${item.transaction.id}`} item={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: AI */}
        <div className="flex flex-col rounded-xl border border-teal/20 overflow-hidden bg-navy-800/50">
          {/* Column header */}
          <div className="px-4 py-3 border-b border-teal/10 bg-teal/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal/10">
                <Brain size={18} className="text-teal" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-100">AI-Powered System</h3>
                <p className="text-[10px] text-teal/60">Decision Intelligence · Real-time ML</p>
              </div>
              {/* Live success indicator */}
              {stats.fraudCaughtAI > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
                >
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span className="text-[10px] font-medium text-emerald-400 tabular-nums">
                    {stats.fraudCaughtAI} caught
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <div
            ref={aiScrollRef}
            className="flex-1 overflow-y-auto px-3 py-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A3A5A transparent', maxHeight: 'calc(100vh - 400px)' }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((item) => (
                <AICard key={`ai-${item.transaction.id}`} item={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Running score counters */}
      <div className="grid grid-cols-4 gap-3">
        <ScoreCard
          label="Fraud Caught"
          icon={<ShieldCheck size={12} className="text-emerald-400" />}
          ruleValue={stats.fraudCaughtRuleBased}
          aiValue={stats.fraudCaughtAI}
          ruleColor="#94A3B8"
          aiColor="#10B981"
        />
        <ScoreCard
          label="Fraud Missed"
          icon={<Ghost size={12} className="text-red-400" />}
          ruleValue={stats.fraudMissedRuleBased}
          aiValue={stats.fraudMissedAI}
          ruleColor="#EF4444"
          aiColor="#0EA5A0"
          ruleBad
        />
        <ScoreCard
          label="False Alarms"
          icon={<ShieldAlert size={12} className="text-amber-400" />}
          ruleValue={stats.falseAlarmsRuleBased}
          aiValue={stats.falseAlarmsAI}
          ruleColor="#F59E0B"
          aiColor="#0EA5A0"
          ruleBad
        />
        <ScoreCard
          label="Processing Time"
          icon={<Zap size={12} className="text-teal" />}
          ruleValue={stats.avgResponseTimeRuleBased}
          aiValue={stats.avgResponseTimeAI}
          ruleColor="#EF4444"
          aiColor="#0EA5A0"
          suffix="ms"
        />
      </div>
    </div>
  )
}
