'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store/useStore'
import { generateTransaction } from '@/lib/engine/transactionGenerator'
import { ACCOUNT_PROFILES } from '@/lib/data/accountProfiles'
import StatsBar from '@/components/dashboard/StatsBar'
import TransactionFeed from '@/components/dashboard/TransactionFeed'
import AIAnalysisPanel from '@/components/dashboard/AIAnalysisPanel'
import SplitScreenView from '@/components/comparison/SplitScreenView'

export default function LiveTransactionMonitor() {
  const isRunning = useStore((s) => s.isRunning)
  const speed = useStore((s) => s.speed)
  const fraudRate = useStore((s) => s.fraudRate)
  const scenario = useStore((s) => s.scenario)
  const addTransaction = useStore((s) => s.addTransaction)
  const transactions = useStore((s) => s.transactions)

  // Keep a ref to transactions so the interval callback always sees the latest
  const transactionsRef = useRef(transactions)
  useEffect(() => {
    transactionsRef.current = transactions
  }, [transactions])

  // Transaction generator interval
  useEffect(() => {
    if (!isRunning) return

    const intervalMs = 1000 / speed

    const intervalId = setInterval(() => {
      const recentTxns = transactionsRef.current.slice(0, 10)
      const txn = generateTransaction(ACCOUNT_PROFILES, recentTxns, fraudRate)
      addTransaction(txn)
    }, intervalMs)

    return () => clearInterval(intervalId)
  }, [isRunning, speed, fraudRate, addTransaction])

  // Comparison mode
  if (scenario === 'comparison') {
    return (
      <div className="flex flex-col h-full p-6">
        <SplitScreenView />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-shrink-0"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            Live Transaction Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            AI-Powered Fraud Detection
          </p>
        </div>

        {/* Keyboard hint */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600">
            <kbd className="px-1 py-0.5 rounded bg-navy-700 text-slate-500 font-mono text-[9px]">Space</kbd> pause
            <span className="mx-1.5">·</span>
            <kbd className="px-1 py-0.5 rounded bg-navy-700 text-slate-500 font-mono text-[9px]">F</kbd> fraud
            <span className="mx-1.5">·</span>
            <kbd className="px-1 py-0.5 rounded bg-navy-700 text-slate-500 font-mono text-[9px]">C</kbd> compare
          </span>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Main Content: Transaction Feed + AI Analysis Panel */}
      <div className="flex flex-1 gap-5 min-h-0">
        {/* Transaction Feed — 65% */}
        <div
          className="w-[65%] overflow-y-auto rounded-xl bg-navy-700 border border-navy-600 p-4"
          style={{
            maxHeight: 'calc(100vh - 240px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#2A3A5A transparent',
          }}
        >
          <TransactionFeed />
        </div>

        {/* AI Analysis Panel — 35% */}
        <div
          className="w-[35%] overflow-y-auto rounded-xl bg-navy-700 border border-navy-600 p-4"
          style={{
            maxHeight: 'calc(100vh - 240px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#2A3A5A transparent',
          }}
        >
          <AIAnalysisPanel />
        </div>
      </div>
    </div>
  )
}
