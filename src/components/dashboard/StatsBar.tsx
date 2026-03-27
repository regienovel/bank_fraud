'use client'

import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Shield, TrendingDown } from 'lucide-react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import { useStore } from '@/lib/store/useStore'
import { staggerContainer, cardReveal } from '@/lib/utils/animations'

const stats = [
  {
    key: 'totalProcessed' as const,
    label: 'Total Transactions Processed',
    icon: Activity,
    accentColor: '#3B82F6',
    prefix: '',
    suffix: '',
    decimals: 0,
  },
  {
    key: 'fraudDetected' as const,
    label: 'Fraud Detected',
    icon: AlertTriangle,
    accentColor: '#EF4444',
    prefix: '',
    suffix: '',
    decimals: 0,
    pulse: true,
  },
  {
    key: 'detectionRate' as const,
    label: 'Detection Rate',
    icon: Shield,
    accentColor: '#0EA5A0',
    prefix: '',
    suffix: '%',
    decimals: 1,
  },
  {
    key: 'falsePositiveRate' as const,
    label: 'False Positive Rate',
    icon: TrendingDown,
    accentColor: '#D4A843',
    prefix: '',
    suffix: '%',
    decimals: 1,
  },
] as const

export default function StatsBar() {
  const storeStats = useStore((s) => s.stats)

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const value = storeStats[stat.key]

        return (
          <motion.div
            key={stat.key}
            variants={cardReveal}
            custom={i}
            className="relative bg-navy-700 border border-navy-600 rounded-xl p-5 overflow-hidden"
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ backgroundColor: stat.accentColor }}
            />

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">
                  {stat.label}
                </p>
                <div className="flex items-center gap-2">
                  <AnimatedCounter
                    value={value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    className="text-3xl lg:text-4xl"
                  />
                  {/* Pulse indicator for fraud detected */}
                  {'pulse' in stat && stat.pulse && value > 0 && (
                    <span className="relative flex h-3 w-3">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: stat.accentColor }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-3 w-3"
                        style={{ backgroundColor: stat.accentColor }}
                      />
                    </span>
                  )}
                </div>
              </div>

              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: `${stat.accentColor}15` }}
              >
                <Icon size={20} style={{ color: stat.accentColor }} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
