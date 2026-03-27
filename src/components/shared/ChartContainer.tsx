'use client'

import { useState, useEffect } from 'react'

interface ChartContainerProps {
  children: React.ReactNode
  height: number | string
  className?: string
}

/**
 * Wrapper that only renders Recharts children after mount,
 * preventing the width/height SSG warning.
 */
export default function ChartContainer({
  children,
  height,
  className = '',
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={className} style={{ height, minHeight: height }}>
      {mounted ? children : null}
    </div>
  )
}
