'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store/useStore'

/**
 * Global LIVE indicator — fixed top-right corner.
 * Blinks green when feed is active, dims to amber "PAUSED" when stopped.
 */
export default function LiveIndicator() {
  const isRunning = useStore((s) => s.isRunning)
  const totalProcessed = useStore((s) => s.stats.totalProcessed)

  return (
    <div className="fixed top-5 right-6 z-50 flex items-center gap-3">
      {/* Transaction counter */}
      {totalProcessed > 0 && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[11px] text-slate-500 tabular-nums font-medium"
        >
          {totalProcessed.toLocaleString()} txns
        </motion.span>
      )}

      {/* LIVE / PAUSED badge */}
      <AnimatePresence mode="wait">
        {isRunning ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Live
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="paused"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Paused
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
