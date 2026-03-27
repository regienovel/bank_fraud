'use client'

import { motion } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import ChartContainer from '@/components/shared/ChartContainer'

export interface BehaviourValues {
  amount: number
  timeOfDay: number
  merchantRisk: number
  locationRisk: number
  deviceRisk: number
}

interface BehaviourRadarProps {
  typical: BehaviourValues
  current: BehaviourValues
}

export default function BehaviourRadar({ typical, current }: BehaviourRadarProps) {
  const data = [
    {
      subject: 'Spend Amount',
      typical: typical.amount,
      current: current.amount,
    },
    {
      subject: 'Time of Day',
      typical: typical.timeOfDay,
      current: current.timeOfDay,
    },
    {
      subject: 'Merchant Category',
      typical: typical.merchantRisk,
      current: current.merchantRisk,
    },
    {
      subject: 'Location',
      typical: typical.locationRisk,
      current: current.locationRisk,
    },
    {
      subject: 'Device/Channel',
      typical: typical.deviceRisk,
      current: current.deviceRisk,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-navy-700 rounded-xl border border-navy-600 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        Behavioural Deviation
      </h3>

      <ChartContainer height={320} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#2A3A5A" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#64748B', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Typical Behaviour"
              dataKey="typical"
              stroke="#0EA5A0"
              fill="#0EA5A0"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="This Transaction"
              dataKey="current"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#94A3B8' }}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span style={{ color: '#94A3B8', fontSize: 12 }}>{value}</span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  )
}
