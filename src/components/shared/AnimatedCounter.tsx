'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
  className?: string
}

function formatNumber(num: number, decimals: number): string {
  const fixed = num.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const prevValueRef = useRef(0)

  // Spring-driven number for smooth transitions when value changes
  const springValue = useSpring(0, {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
  })

  // Update spring target when value changes and in view
  useEffect(() => {
    if (isInView) {
      springValue.set(value)
    }
  }, [value, isInView, springValue])

  // Subscribe to spring changes
  useEffect(() => {
    const unsubscribe = springValue.on('change', (v) => {
      setDisplayValue(v)
    })
    return unsubscribe
  }, [springValue])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      className={`font-bold tabular-nums text-slate-100 ${className}`}
    >
      {prefix}{formatNumber(displayValue, decimals)}{suffix}
    </motion.span>
  )
}
