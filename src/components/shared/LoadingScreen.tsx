'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield } from 'lucide-react'

const MESSAGES = [
  'Loading transaction models...',
  'Calibrating risk engine...',
  'Initializing fraud pattern database...',
  'Connecting to monitoring systems...',
  'Ready.',
]

const MESSAGE_INTERVAL = 400 // ms per message
const TOTAL_DURATION = 2000  // max total ms

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [done, setDone] = useState(false)

  // Progress bar animation
  useEffect(() => {
    const start = performance.now()
    let frame: number

    function tick() {
      const elapsed = performance.now() - start
      const pct = Math.min((elapsed / TOTAL_DURATION) * 100, 100)
      setProgress(pct)

      if (pct < 100) {
        frame = requestAnimationFrame(tick)
      } else {
        setDone(true)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Rotating messages
  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) return
    const timer = setTimeout(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1))
    }, MESSAGE_INTERVAL)
    return () => clearTimeout(timer)
  }, [messageIndex])

  // Exit after done
  useEffect(() => {
    if (!done) return
    const timer = setTimeout(onComplete, 350)
    return () => clearTimeout(timer)
  }, [done, onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-navy-900"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,168,67,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Logo + text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center relative"
      >
        {/* Shield icon with pulse */}
        <div className="relative mb-6">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 0px rgba(212, 168, 67, 0)',
                '0 0 40px rgba(212, 168, 67, 0.3)',
                '0 0 0px rgba(212, 168, 67, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="w-10 h-10 text-navy-900" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-1">
          FraudShield AI
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Initializing AI Engine...
        </p>

        {/* Progress bar */}
        <div className="w-72 h-1.5 rounded-full bg-navy-700 overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #D4A843, #0EA5A0)',
            }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Rotating message */}
        <div className="h-5 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`text-xs font-medium tracking-wide ${
                done ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
