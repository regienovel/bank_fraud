'use client'

import { motion } from 'framer-motion'
import { staggerContainer, cardReveal } from '@/lib/utils/animations'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import FraudByTypeChart from '@/components/analytics/FraudByTypeChart'
import FraudByTimeChart from '@/components/analytics/FraudByTimeChart'
import GeoHeatmap from '@/components/analytics/GeoHeatmap'
import ComparisonTable from '@/components/analytics/ComparisonTable'

function MetricCard({
  title,
  icon,
  children,
  index,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.div
      variants={cardReveal}
      custom={index}
      className="bg-navy-700 border border-navy-600 rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-lg">
          {icon}
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
      </div>
      <div>{children}</div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-100">Analytics Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Fraud Detection Performance Overview</p>
      </motion.div>

      {/* Row 1 — Key Metrics */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
      >
        <MetricCard title="Total Value Screened" index={0} icon={
          <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }>
          <AnimatedCounter value={45678230} prefix="GH₵ " className="text-2xl lg:text-3xl" />
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3.5 h-3.5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="text-xs text-emerald font-medium">+12.4% from last week</span>
          </div>
        </MetricCard>

        <MetricCard title="Fraud Value Prevented" index={1} icon={
          <svg className="w-4 h-4 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }>
          <AnimatedCounter value={2341567} prefix="GH₵ " className="text-2xl lg:text-3xl" />
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3.5 h-3.5 text-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-coral font-medium">389 fraud cases blocked</span>
          </div>
        </MetricCard>

        <MetricCard title="Avg Processing Time" index={2} icon={
          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter value={47} className="text-2xl lg:text-3xl" />
            <span className="text-lg text-slate-400 font-medium">ms</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs text-gold font-medium">Real-time decisioning</span>
          </div>
        </MetricCard>

        <MetricCard title="AI vs Rule-Based" index={3} icon={
          <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter value={3.2} decimals={1} className="text-2xl lg:text-3xl" />
            <span className="text-lg text-teal font-semibold">x</span>
          </div>
          <p className="text-xs text-teal font-medium mt-1">More fraud caught than rule-based</p>
        </MetricCard>
      </motion.div>

      {/* Row 2 — Charts */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"
      >
        <FraudByTypeChart />
        <FraudByTimeChart />
      </motion.div>

      {/* Row 3 — Geographic Heatmap */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mb-6"
      >
        <GeoHeatmap />
      </motion.div>

      {/* Row 4 — Comparison Table (KEY conversion visual) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        <ComparisonTable />
      </motion.div>
    </div>
  )
}
