'use client'

import { motion } from 'framer-motion'
import { cardReveal } from '@/lib/utils/animations'

interface MetricRow {
  label: string
  ruleBased: string
  ai: string
  // Values for bar widths (0-100 normalized)
  ruleBasedBar: number
  aiBar: number
  // Whether higher is better (for coloring)
  higherIsBetter: boolean
}

const metrics: MetricRow[] = [
  {
    label: 'Fraud detected',
    ruleBased: '127',
    ai: '389',
    ruleBasedBar: 33,
    aiBar: 100,
    higherIsBetter: true,
  },
  {
    label: 'False positives',
    ruleBased: '1,247',
    ai: '312',
    ruleBasedBar: 100,
    aiBar: 25,
    higherIsBetter: false,
  },
  {
    label: 'Detection rate',
    ruleBased: '38%',
    ai: '97.3%',
    ruleBasedBar: 38,
    aiBar: 97,
    higherIsBetter: true,
  },
  {
    label: 'Avg response time',
    ruleBased: '2.3s',
    ai: '47ms',
    ruleBasedBar: 100,
    aiBar: 2,
    higherIsBetter: false,
  },
  {
    label: 'Novel fraud caught',
    ruleBased: '0',
    ai: '43',
    ruleBasedBar: 0,
    aiBar: 100,
    higherIsBetter: true,
  },
]

function Bar({
  width,
  color,
  delay,
}: {
  width: number
  color: string
  delay: number
}) {
  return (
    <div className="w-full h-3 rounded-full bg-navy-900/60 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${width}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </div>
  )
}

export default function ComparisonTable() {
  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-navy-700 border border-navy-600 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-slate-100">AI vs Rule-Based Detection</h3>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal/10 text-teal border border-teal/20">
          KEY COMPARISON
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Side-by-side performance comparison demonstrating the dramatic improvement
      </p>

      {/* Header row */}
      <div className="grid grid-cols-[200px_1fr_1fr] gap-4 mb-4 px-2">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Metric</div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Rule-Based</div>
        <div className="text-xs font-medium uppercase tracking-wider text-teal">AI Model</div>
      </div>

      <div className="space-y-5">
        {metrics.map((metric, index) => {
          const ruleColor = metric.higherIsBetter ? '#475569' : '#EF4444'
          const aiColor = metric.higherIsBetter ? '#0EA5A0' : '#0EA5A0'

          return (
            <div
              key={metric.label}
              className="grid grid-cols-[200px_1fr_1fr] gap-4 items-center px-2 py-2 rounded-lg hover:bg-navy-800/50 transition-colors"
            >
              <div className="text-sm font-medium text-slate-300">{metric.label}</div>

              {/* Rule-based column */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400">{metric.ruleBased}</span>
                </div>
                <Bar width={metric.ruleBasedBar} color={ruleColor} delay={index * 0.1} />
              </div>

              {/* AI column */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-teal">{metric.ai}</span>
                  {metric.higherIsBetter && metric.aiBar > metric.ruleBasedBar && (
                    <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">
                      {metric.ruleBasedBar > 0
                        ? `${(metric.aiBar / metric.ruleBasedBar).toFixed(1)}x`
                        : 'NEW'}
                    </span>
                  )}
                  {!metric.higherIsBetter && metric.aiBar < metric.ruleBasedBar && (
                    <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">
                      {metric.label === 'Avg response time' ? '49x faster' : `${(metric.ruleBasedBar / metric.aiBar).toFixed(1)}x fewer`}
                    </span>
                  )}
                </div>
                <Bar width={metric.aiBar} color={aiColor} delay={index * 0.1 + 0.15} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom summary */}
      <motion.div
        className="mt-6 p-4 rounded-lg bg-teal/5 border border-teal/20 text-center"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p className="text-sm text-teal font-semibold">
          AI detects <span className="text-lg">3.1x</span> more fraud with{' '}
          <span className="text-lg">4x</span> fewer false positives and{' '}
          <span className="text-lg">49x</span> faster response times
        </p>
      </motion.div>
    </motion.div>
  )
}
