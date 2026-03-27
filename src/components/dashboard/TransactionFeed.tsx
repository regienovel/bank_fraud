'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio } from 'lucide-react'
import { useStore } from '@/lib/store/useStore'
import TransactionCard from '@/components/dashboard/TransactionCard'

export default function TransactionFeed() {
  const transactions = useStore((s) => s.transactions)
  const selectedTransaction = useStore((s) => s.selectedTransaction)
  const selectTransaction = useStore((s) => s.selectTransaction)
  const isRunning = useStore((s) => s.isRunning)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  // Auto-scroll to top when new transaction added
  useEffect(() => {
    if (transactions.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevCountRef.current = transactions.length
  }, [transactions.length])

  const handleSelect = useCallback(
    (txId: string) => {
      const tx = transactions.find((t) => t.id === txId) ?? null
      selectTransaction(
        selectedTransaction?.id === txId ? null : tx
      )
    },
    [transactions, selectedTransaction, selectTransaction]
  )

  return (
    <div className="flex flex-col h-full relative">
      {/* Scan-line overlay */}
      <div className="scan-lines rounded-xl" />

      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-3 flex-shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Live Transaction Feed
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-navy-600 text-slate-300 tabular-nums">
            {transactions.length}
          </span>
        </div>

        {/* Running indicator */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="relative flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Live
            </span>
          )}
          {!isRunning && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <Radio size={12} />
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin relative z-20"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2A3A5A transparent' }}
      >
        <AnimatePresence initial={false}>
          {transactions.map((tx, i) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              isSelected={selectedTransaction?.id === tx.id}
              onClick={() => handleSelect(tx.id)}
              index={i}
            />
          ))}
        </AnimatePresence>

        {transactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-slate-500"
          >
            <Radio size={32} className="mb-3 opacity-40" />
            <p className="text-sm">Waiting for transactions...</p>
            <p className="text-xs text-slate-600 mt-1">
              Transactions will appear here in real time
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
