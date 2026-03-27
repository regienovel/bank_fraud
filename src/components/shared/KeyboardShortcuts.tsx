'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store/useStore'
import { ACCOUNT_PROFILES } from '@/lib/data/accountProfiles'
import { injectFraudTransaction } from '@/lib/engine/transactionGenerator'
import { FRAUD_PATTERNS } from '@/lib/engine/fraudPatterns'

/**
 * Global keyboard shortcuts:
 *   Space  = pause/resume
 *   F      = inject fraud
 *   R      = reset
 *   1      = Transaction Monitor
 *   2      = Analytics
 *   3      = Investigation
 *   C      = toggle comparison mode
 */
export default function KeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()
  const toggleRunning = useStore((s) => s.toggleRunning)
  const resetAll = useStore((s) => s.resetAll)
  const addTransaction = useStore((s) => s.addTransaction)
  const transactions = useStore((s) => s.transactions)
  const scenario = useStore((s) => s.scenario)
  const setScenario = useStore((s) => s.setScenario)
  const setFraudRate = useStore((s) => s.setFraudRate)
  const setSpeed = useStore((s) => s.setSpeed)

  const handleInjectFraud = useCallback(() => {
    const patternId =
      FRAUD_PATTERNS[Math.floor(Math.random() * FRAUD_PATTERNS.length)].id
    const fraudTxn = injectFraudTransaction(
      ACCOUNT_PROFILES,
      transactions,
      patternId
    )
    addTransaction(fraudTxn)
  }, [transactions, addTransaction])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      // Ignore if modifier keys are held (except for Ctrl+Shift+D handled elsewhere)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          toggleRunning()
          break
        case 'f':
        case 'F':
          if (!e.shiftKey) {
            e.preventDefault()
            handleInjectFraud()
          }
          break
        case 'r':
        case 'R':
          if (!e.shiftKey) {
            e.preventDefault()
            resetAll()
          }
          break
        case '1':
          e.preventDefault()
          if (pathname !== '/') router.push('/')
          // If already on / and in comparison mode, exit it
          if (scenario === 'comparison') {
            setScenario('normal')
            setFraudRate(0.04)
            setSpeed(1)
          }
          break
        case '2':
          e.preventDefault()
          router.push('/analytics')
          break
        case '3':
          e.preventDefault()
          router.push('/investigate')
          break
        case 'c':
        case 'C':
          if (!e.shiftKey) {
            e.preventDefault()
            if (scenario === 'comparison') {
              setScenario('normal')
              setFraudRate(0.04)
              setSpeed(1)
            } else {
              setScenario('comparison')
            }
            // Navigate to main page if not already there
            if (pathname !== '/') router.push('/')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    toggleRunning,
    handleInjectFraud,
    resetAll,
    router,
    pathname,
    scenario,
    setScenario,
    setFraudRate,
    setSpeed,
  ])

  return null // This is a behavior-only component
}
