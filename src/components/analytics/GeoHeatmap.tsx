'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cardReveal } from '@/lib/utils/animations'

interface CityData {
  name: string
  x: number // percentage position within SVG
  y: number
  fraudCount: number
  totalTransactions: number
  riskLevel: 'high' | 'moderate' | 'low'
}

const cities: CityData[] = [
  { name: 'Accra', x: 58, y: 82, fraudCount: 156, totalTransactions: 12450, riskLevel: 'high' },
  { name: 'Tema', x: 62, y: 79, fraudCount: 89, totalTransactions: 6230, riskLevel: 'high' },
  { name: 'Kumasi', x: 45, y: 58, fraudCount: 67, totalTransactions: 5890, riskLevel: 'moderate' },
  { name: 'Tamale', x: 48, y: 24, fraudCount: 23, totalTransactions: 2340, riskLevel: 'low' },
  { name: 'Cape Coast', x: 50, y: 88, fraudCount: 18, totalTransactions: 1870, riskLevel: 'low' },
  { name: 'Takoradi', x: 42, y: 86, fraudCount: 21, totalTransactions: 2100, riskLevel: 'low' },
  { name: 'Sunyani', x: 38, y: 50, fraudCount: 12, totalTransactions: 1240, riskLevel: 'low' },
  { name: 'Ho', x: 65, y: 60, fraudCount: 14, totalTransactions: 1050, riskLevel: 'low' },
  { name: 'Koforidua', x: 57, y: 68, fraudCount: 28, totalTransactions: 2180, riskLevel: 'moderate' },
]

function getDotColor(level: string) {
  switch (level) {
    case 'high': return '#EF4444'
    case 'moderate': return '#F59E0B'
    default: return '#0EA5A0'
  }
}

function getDotSize(count: number) {
  if (count > 100) return 14
  if (count > 50) return 10
  if (count > 20) return 7
  return 5
}

export default function GeoHeatmap() {
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-navy-700 border border-navy-600 rounded-xl p-5"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-1">Geographic Fraud Distribution</h3>
      <p className="text-xs text-slate-400 mb-4">Fraud concentration by region across Ghana</p>

      <div className="relative">
        <svg
          viewBox="0 0 300 400"
          className="w-full max-w-[440px] mx-auto h-auto"
          onMouseLeave={() => setHoveredCity(null)}
        >
          {/* Simplified Ghana outline */}
          <path
            d="M 120 10 L 155 8 L 170 15 L 180 12 L 195 20 L 200 35 L 195 55 L 205 70 L 210 90
               L 200 105 L 210 120 L 215 140 L 205 155 L 210 175 L 200 195 L 210 215
               L 205 240 L 210 260 L 200 280 L 205 300 L 195 315 L 185 325
               L 175 340 L 165 350 L 150 355 L 135 358 L 120 355 L 110 345
               L 100 340 L 95 325 L 100 310 L 95 295 L 100 275 L 95 255
               L 100 235 L 90 215 L 95 195 L 85 175 L 90 155 L 80 135
               L 85 115 L 80 95 L 90 75 L 85 55 L 95 35 L 105 20 Z"
            fill="#1A2744"
            stroke="#2A3A5A"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Lake Volta approximate shape */}
          <ellipse cx="165" cy="180" rx="20" ry="55" fill="#0B1120" opacity="0.5" />

          {/* City dots with pulse effect */}
          {cities.map((city) => {
            const cx = (city.x / 100) * 300
            const cy = (city.y / 100) * 400
            const r = getDotSize(city.fraudCount)
            const color = getDotColor(city.riskLevel)

            return (
              <g
                key={city.name}
                onMouseEnter={(e) => {
                  setHoveredCity(city)
                  const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                  setTooltipPos({
                    x: ((cx / 300) * svgRect.width),
                    y: ((cy / 400) * svgRect.height),
                  })
                }}
                onMouseLeave={() => setHoveredCity(null)}
                className="cursor-pointer"
              >
                {/* Glow ring */}
                <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity="0.15">
                  <animate
                    attributeName="r"
                    values={`${r + 4};${r + 10};${r + 4}`}
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.15;0.05;0.15"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Main dot */}
                <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.85" />
                {/* City label */}
                <text
                  x={cx + r + 5}
                  y={cy + 4}
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {city.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hoveredCity && (
          <div
            className="absolute pointer-events-none bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 shadow-xl z-10 transition-all duration-150"
            style={{
              left: tooltipPos.x + 20,
              top: tooltipPos.y - 30,
            }}
          >
            <p className="text-sm font-semibold text-slate-100">{hoveredCity.name}</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <p className="text-xs text-slate-400">
                Fraud cases:{' '}
                <span className="text-coral font-medium">{hoveredCity.fraudCount}</span>
              </p>
              <p className="text-xs text-slate-400">
                Total txns:{' '}
                <span className="text-slate-200 font-medium">
                  {hoveredCity.totalTransactions.toLocaleString()}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Fraud rate:{' '}
                <span
                  className="font-medium"
                  style={{ color: getDotColor(hoveredCity.riskLevel) }}
                >
                  {((hoveredCity.fraudCount / hoveredCity.totalTransactions) * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-coral" />
            High
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber" />
            Moderate
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal" />
            Low
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block w-3 h-3 rounded-full border border-slate-600" />
            Dot size = volume
          </div>
        </div>
      </div>
    </motion.div>
  )
}
