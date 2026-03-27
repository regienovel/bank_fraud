'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/shared/Sidebar'
import DemoControls from '@/components/controls/DemoControls'
import LoadingScreen from '@/components/shared/LoadingScreen'
import KeyboardShortcuts from '@/components/shared/KeyboardShortcuts'
import LiveIndicator from '@/components/shared/LiveIndicator'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  const handleLoadComplete = useCallback(() => {
    setLoading(false)
  }, [])

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!loading && (
        <div className="flex min-h-screen bg-navy-900">
          <Sidebar />
          <main className="flex-1 ml-[260px] transition-all duration-200 p-6">
            {children}
          </main>
          <LiveIndicator />
          <DemoControls />
          <KeyboardShortcuts />
        </div>
      )}
    </>
  )
}
