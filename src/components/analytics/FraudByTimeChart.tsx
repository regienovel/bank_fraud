'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts'
import { motion } from 'framer-motion'
import { cardReveal } from '@/lib/utils/animations'
import ChartContainer from '@/components/shared/ChartContainer'

const hours = [
  '12AM', '1AM', '2AM', '3AM', '4AM', '5AM',
  '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
  '12PM', '1PM', '2PM', '3PM', '4PM', '5PM',
  '6PM', '7PM', '8PM', '9PM', '10PM', '11PM',
]

// Normal volume peaks during business hours 9-6
// Fraud spikes during 2-5 AM
const data = hours.map((hour, i) => {
  // Normal volume curve: peaks at midday
  let normal: number
  if (i >= 8 && i <= 17) {
    // Business hours: 8AM-5PM
    normal = 180 + Math.sin((i - 8) / 9 * Math.PI) * 220
  } else if (i >= 6 && i < 8) {
    normal = 60 + (i - 6) * 60
  } else if (i > 17 && i <= 21) {
    normal = 180 - (i - 17) * 35
  } else {
    normal = 20 + Math.random() * 25
  }

  // Fraud attempts: spike at 2-5 AM
  let fraud: number
  if (i >= 2 && i <= 4) {
    fraud = 35 + (i === 3 ? 55 : 30) + Math.random() * 10
  } else if (i === 1 || i === 5) {
    fraud = 18 + Math.random() * 8
  } else if (i >= 9 && i <= 16) {
    fraud = 8 + Math.random() * 7
  } else {
    fraud = 4 + Math.random() * 6
  }

  return {
    hour,
    normal: Math.round(normal),
    fraud: Math.round(fraud),
  }
})

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name === 'normal' ? 'Normal' : 'Fraud'}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export default function FraudByTimeChart() {
  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-navy-700 border border-navy-600 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-1">Fraud by Time of Day</h3>
      <p className="text-xs text-slate-400 mb-4">Transaction volume vs fraud attempts (24h)</p>

      <ChartContainer height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5A0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0EA5A0" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3A5A" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#2A3A5A' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Annotation for high-risk hours */}
            <ReferenceLine x="3AM" stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.5}>
              <Label
                value="High-risk hours"
                position="top"
                fill="#EF4444"
                fontSize={11}
                fontWeight={600}
                offset={8}
              />
            </ReferenceLine>

            <Area
              type="monotone"
              dataKey="normal"
              stroke="#0EA5A0"
              strokeWidth={2}
              fill="url(#normalGrad)"
              name="normal"
            />
            <Area
              type="monotone"
              dataKey="fraud"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#fraudGrad)"
              name="fraud"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="flex items-center gap-6 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-0.5 bg-teal rounded-full inline-block" />
          <span className="text-slate-400">Normal volume</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-3 h-0.5 bg-coral rounded-full inline-block" />
          <span className="text-slate-400">Fraud attempts</span>
        </div>
      </div>
    </motion.div>
  )
}
