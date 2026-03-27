'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, Building2, CreditCard, CalendarDays, MapPin, Activity } from 'lucide-react'
import { useStore } from '@/lib/store/useStore'
import { ACCOUNT_PROFILES } from '@/lib/data/accountProfiles'
import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  MERCHANTS,
  MERCHANT_CATEGORIES,
  LOCATIONS,
  TRANSACTION_TYPES,
  CARD_NETWORKS,
} from '@/lib/data/ghanaData'
import type { Transaction } from '@/lib/engine/transactionGenerator'
import TransactionTimeline from '@/components/investigation/TransactionTimeline'
import BehaviourRadar from '@/components/investigation/BehaviourRadar'
import type { BehaviourValues } from '@/components/investigation/BehaviourRadar'
import NetworkGraph from '@/components/investigation/NetworkGraph'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfidenceGauge from '@/components/shared/ConfidenceGauge'
import { formatCurrency, formatTime } from '@/lib/utils/formatters'
import { cardReveal, staggerContainer } from '@/lib/utils/animations'

// --- Deterministic pseudo-random seeded from a string ---
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickSeeded<T>(arr: readonly T[] | T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

// --- Generate fake historical transactions for the account ---
function generateHistoricalTransactions(
  tx: Transaction,
  count: number
): Transaction[] {
  const rand = seededRandom(hashCode(tx.accountId + tx.id))
  const profile = ACCOUNT_PROFILES.find((p) => p.id === tx.accountId)
  const typicalCity = profile?.typicalLocation.city ?? 'Accra'
  const typicalArea = profile?.typicalLocation.area ?? 'Osu'
  const typicalCats = profile?.typicalMerchantCategories ?? ['Retail', 'Restaurants']
  const amtRange = profile?.typicalAmountRange ?? { min: 50, max: 1500 }
  const typicalHours = profile?.typicalHours ?? { start: 8, end: 20 }

  const history: Transaction[] = []
  const baseTime = tx.timestamp.getTime()

  for (let i = count; i >= 1; i--) {
    const hoursAgo = i * (4 + rand() * 20) // spread over past days
    const ts = new Date(baseTime - hoursAgo * 3600 * 1000)
    ts.setHours(
      typicalHours.start + Math.floor(rand() * (typicalHours.end - typicalHours.start)),
      Math.floor(rand() * 60)
    )

    const cat = pickSeeded(typicalCats, rand)
    const merchantList = MERCHANTS[cat] ?? MERCHANTS.Retail
    const amount = Math.round((amtRange.min + rand() * (amtRange.max - amtRange.min)) * 100) / 100
    const riskScore = Math.floor(rand() * 30)
    const type = pickSeeded(TRANSACTION_TYPES, rand)
    const channel = pickSeeded(CARD_NETWORKS, rand)

    history.push({
      id: `TXN-GH-2026-${String(90000 + i).padStart(5, '0')}`,
      timestamp: ts,
      accountId: tx.accountId,
      senderName: tx.senderName,
      receiverName: pickSeeded(merchantList, rand),
      amount,
      type,
      channel: channel as string,
      location: { city: typicalCity, area: typicalArea },
      bank: tx.bank,
      riskScore,
      riskFactors: [],
      decision: 'APPROVED',
      explanation: '',
      matchedPattern: null,
      isFraud: false,
      merchantCategory: cat,
      processingTime: Math.round(30 + rand() * 50),
    })
  }

  // Append the flagged transaction at the end
  history.push(tx)
  return history
}

// --- Compute radar values ---
function computeRadarValues(
  tx: Transaction,
  profileOrNull: typeof ACCOUNT_PROFILES[number] | undefined
): { typical: BehaviourValues; current: BehaviourValues } {
  const profile = profileOrNull ?? ACCOUNT_PROFILES[0]
  const amtRange = profile.typicalAmountRange
  const typicalHours = profile.typicalHours

  // Amount deviation (0-100 where 100 = way outside range)
  const amtMid = (amtRange.min + amtRange.max) / 2
  const amtSpan = amtRange.max - amtRange.min
  const amtDeviation = Math.min(100, Math.abs(tx.amount - amtMid) / (amtSpan || 1) * 100)

  // Time of day risk
  const hour = tx.timestamp.getHours()
  const inRange = hour >= typicalHours.start && hour <= typicalHours.end
  const timeDeviation = inRange ? 15 + Math.random() * 10 : 70 + Math.random() * 25

  // Merchant category risk
  const isTypicalCat = profile.typicalMerchantCategories.includes(tx.merchantCategory)
  const merchantDeviation = isTypicalCat ? 10 + Math.random() * 15 : 65 + Math.random() * 30

  // Location risk
  const isTypicalLoc = tx.location.city === profile.typicalLocation.city
  const locationDeviation = isTypicalLoc ? 10 + Math.random() * 10 : 70 + Math.random() * 25

  // Device risk (simulated from risk factors)
  const deviceFactor = tx.riskFactors.find((f) => f.name.toLowerCase().includes('device') || f.name.toLowerCase().includes('channel'))
  const deviceDeviation = deviceFactor ? Math.min(100, deviceFactor.score) : 15 + Math.random() * 15

  return {
    typical: {
      amount: 20,
      timeOfDay: 15,
      merchantRisk: 12,
      locationRisk: 10,
      deviceRisk: 15,
    },
    current: {
      amount: Math.round(amtDeviation),
      timeOfDay: Math.round(timeDeviation),
      merchantRisk: Math.round(merchantDeviation),
      locationRisk: Math.round(locationDeviation),
      deviceRisk: Math.round(deviceDeviation),
    },
  }
}

// --- Generate connected accounts for the network graph ---
function generateConnectedAccounts(tx: Transaction) {
  const rand = seededRandom(hashCode(tx.accountId + 'network'))
  const allFirst = [...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES]
  const relationships = [
    'shared merchant',
    'same device',
    'same beneficiary',
    'shared IP',
    'same location',
    'linked phone',
  ]

  const count = 4 + Math.floor(rand() * 3) // 4-6 connections
  const accounts = []

  for (let i = 0; i < count; i++) {
    const flagged = i < 2 // First 2 are flagged
    accounts.push({
      name: `${pickSeeded(allFirst, rand)} ${pickSeeded(LAST_NAMES, rand)}`,
      flagged,
      relationship: relationships[i % relationships.length],
    })
  }

  return accounts
}

// --- AI Recommendation ---
function getRecommendation(riskScore: number): {
  action: string
  color: string
  bgColor: string
  description: string
} {
  if (riskScore > 80) {
    return {
      action: 'Block and Investigate',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      description:
        'This transaction exhibits multiple high-risk indicators consistent with known fraud patterns. Immediate blocking is recommended while a full investigation is conducted. The account holder should be contacted via verified channels to confirm or deny the activity.',
    }
  }
  if (riskScore > 60) {
    return {
      action: 'Request Additional Verification',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      description:
        'This transaction shows moderate risk indicators that warrant additional verification before approval. Recommend sending an OTP or biometric verification request to the registered device. Monitor subsequent transactions closely for 24 hours.',
    }
  }
  return {
    action: 'Monitor Closely',
    color: 'text-teal',
    bgColor: 'bg-teal/10 border-teal/20',
    description:
      'While some minor anomalies were detected, the overall risk profile is within acceptable limits. The account has been placed on enhanced monitoring for the next 48 hours. No immediate action is required unless follow-up transactions trigger additional alerts.',
  }
}

export default function InvestigatePage() {
  const selectedTransaction = useStore((s) => s.selectedTransaction)
  const tx = selectedTransaction

  const profile = useMemo(
    () => (tx ? ACCOUNT_PROFILES.find((p) => p.id === tx.accountId) : undefined),
    [tx]
  )

  const historicalTxns = useMemo(
    () => (tx ? generateHistoricalTransactions(tx, 19) : []),
    [tx]
  )

  const radarData = useMemo(
    () => (tx ? computeRadarValues(tx, profile) : null),
    [tx, profile]
  )

  const connectedAccounts = useMemo(
    () => (tx ? generateConnectedAccounts(tx) : []),
    [tx]
  )

  const recommendation = tx ? getRecommendation(tx.riskScore) : null
  const confidence = tx ? Math.min(99.5, 75 + tx.riskScore * 0.22 + (tx.riskFactors.length * 2.5)) : 0

  // --- No transaction selected ---
  if (!tx) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-navy-700 border border-navy-600 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-200 mb-3">
            No Transaction Selected
          </h2>
          <p className="text-slate-400 mb-8 max-w-md">
            Select a flagged transaction from the live monitor to begin a detailed fraud investigation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold/10 text-gold border border-gold/20 font-medium text-sm hover:bg-gold/20 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Transaction Monitor
          </Link>
        </motion.div>
      </div>
    )
  }

  // --- Investigation view ---
  const riskBadge =
    profile?.riskLevel === 'high'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : profile?.riskLevel === 'medium'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex-1 min-h-screen p-6 lg:p-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardReveal} custom={0} className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-700 border border-navy-600 text-slate-400 hover:text-slate-200 hover:bg-navy-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Fraud Investigation
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-mono text-slate-400">{tx.id}</span>
            <StatusBadge status={tx.decision} size="sm" />
            {tx.matchedPattern && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                Pattern: {tx.matchedPattern.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Account Profile Card */}
      <motion.div
        variants={cardReveal}
        custom={1}
        className="bg-navy-700 rounded-xl border border-navy-600 p-6"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Account Profile
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Account Holder</div>
            <div className="text-sm font-semibold text-slate-100">{tx.senderName}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {profile?.accountNumber ?? tx.accountId}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 size={10} /> Bank
            </div>
            <div className="text-sm font-medium text-slate-200">{tx.bank}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CreditCard size={10} /> Card Network
            </div>
            <div className="text-sm font-medium text-slate-200">
              {profile?.cardNetwork ?? tx.channel}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <CalendarDays size={10} /> Account Age
            </div>
            <div className="text-sm font-medium text-slate-200">
              {profile ? `${Math.floor(profile.accountAge / 12)}y ${profile.accountAge % 12}m` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Activity size={10} /> Monthly Txns
            </div>
            <div className="text-sm font-medium text-slate-200">
              {profile?.monthlyTransactionCount ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin size={10} /> Typical Location
            </div>
            <div className="text-sm font-medium text-slate-200">
              {profile
                ? `${profile.typicalLocation.area}, ${profile.typicalLocation.city}`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Risk Level</div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${riskBadge}`}>
              {profile?.riskLevel ?? 'unknown'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Transaction Details Summary */}
      <motion.div
        variants={cardReveal}
        custom={2}
        className="bg-navy-700 rounded-xl border border-navy-600 p-6"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Flagged Transaction Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Amount</div>
            <div className="text-lg font-bold text-slate-100">{formatCurrency(tx.amount)}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Timestamp</div>
            <div className="text-sm font-medium text-slate-200">{formatTime(tx.timestamp)}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Merchant</div>
            <div className="text-sm font-medium text-slate-200">{tx.receiverName}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Location</div>
            <div className="text-sm font-medium text-slate-200">
              {tx.location.area}, {tx.location.city}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Type / Channel</div>
            <div className="text-sm font-medium text-slate-200">
              {tx.type} / {tx.channel}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Risk Score</div>
            <div className="flex items-center gap-2">
              <span
                className={`text-lg font-bold ${
                  tx.riskScore > 75
                    ? 'text-red-400'
                    : tx.riskScore > 50
                      ? 'text-amber-400'
                      : 'text-teal'
                }`}
              >
                {tx.riskScore}
              </span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        {tx.explanation && (
          <div className="mt-5 p-4 rounded-lg bg-navy-800 border border-navy-600">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">AI Analysis</div>
            <p className="text-sm text-slate-300 leading-relaxed">{tx.explanation}</p>
          </div>
        )}
      </motion.div>

      {/* Two-column layout: Timeline + Radar/Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Timeline */}
        <motion.div variants={cardReveal} custom={3}>
          <TransactionTimeline
            transactions={historicalTxns}
            highlightedId={tx.id}
          />
        </motion.div>

        {/* Right: Radar + Network */}
        <div className="space-y-6">
          <motion.div variants={cardReveal} custom={4}>
            {radarData && (
              <BehaviourRadar typical={radarData.typical} current={radarData.current} />
            )}
          </motion.div>

          <motion.div variants={cardReveal} custom={5}>
            <NetworkGraph
              centralAccount={tx.senderName}
              connectedAccounts={connectedAccounts}
            />
          </motion.div>
        </div>
      </div>

      {/* AI Recommendation Card */}
      {recommendation && (
        <motion.div
          variants={cardReveal}
          custom={6}
          className={`rounded-xl border p-6 ${recommendation.bgColor}`}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Confidence Gauge */}
            <div className="flex-shrink-0">
              <ConfidenceGauge
                value={Math.round(confidence * 10) / 10}
                size={110}
                label="AI Confidence"
              />
            </div>

            {/* Recommendation text */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                AI Recommendation
              </h3>
              <div className={`text-xl font-bold mb-3 ${recommendation.color}`}>
                {recommendation.action}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {recommendation.description}
              </p>

              {/* Risk factor pills */}
              {tx.riskFactors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tx.riskFactors
                    .sort((a, b) => b.contribution - a.contribution)
                    .map((factor) => {
                      const fc =
                        factor.score > 75
                          ? 'bg-red-500/15 text-red-400 border-red-500/20'
                          : factor.score > 50
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            : 'bg-teal/15 text-teal border-teal/20'
                      return (
                        <span
                          key={factor.name}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${fc}`}
                        >
                          {factor.name}
                          <span className="opacity-60">({factor.score})</span>
                        </span>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Processing time */}
            <div className="flex-shrink-0 text-center">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
                Processing Time
              </div>
              <div className="text-2xl font-bold text-slate-100">
                {tx.processingTime}<span className="text-sm font-normal text-slate-400">ms</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
