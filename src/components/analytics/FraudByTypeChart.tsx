'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { cardReveal } from '@/lib/utils/animations'
import ChartContainer from '@/components/shared/ChartContainer'

const data = [
  { name: 'Card-not-present', value: 34, color: '#EF4444' },
  { name: 'Account takeover', value: 22, color: '#F59E0B' },
  { name: 'Synthetic identity', value: 18, color: '#D4A843' },
  { name: 'SIM swap related', value: 14, color: '#0EA5A0' },
  { name: 'Counterfeit card', value: 8, color: '#10B981' },
  { name: 'Other', value: 4, color: '#64748B' },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-slate-100">{entry.name}</p>
      <p className="text-xs text-slate-400">{entry.value}% of all fraud</p>
    </div>
  )
}

export default function FraudByTypeChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-navy-700 border border-navy-600 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-1">Fraud by Type</h3>
      <p className="text-xs text-slate-400 mb-4">Distribution of detected fraud categories</p>

      <div className="relative">
        <ChartContainer height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    strokeWidth={activeIndex === index ? 2 : 0}
                    stroke={activeIndex === index ? '#F1F5F9' : 'none'}
                    style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {activeIndex !== null ? (
            <div className="text-center">
              <p className="text-base font-semibold text-slate-100">{data[activeIndex].name}</p>
              <p className="text-sm text-slate-400">{data[activeIndex].value}%</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl font-bold text-slate-100">389</p>
              <p className="text-xs text-slate-400">Total cases</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
        {data.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300 truncate">{entry.name}</span>
            <span className="text-slate-500 ml-auto text-xs">{entry.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
