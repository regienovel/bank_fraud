'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cardReveal } from '@/lib/utils/animations'

interface CityData {
  name: string
  x: number
  y: number
  fraudCount: number
  totalTransactions: number
  riskLevel: 'high' | 'moderate' | 'low'
}

// City positions mapped to the SVG viewBox (0-400 x 0-520)
// Based on actual geographic coordinates of Ghanaian cities
const cities: CityData[] = [
  { name: 'Accra',      x: 248, y: 420, fraudCount: 156, totalTransactions: 12450, riskLevel: 'high' },
  { name: 'Tema',       x: 268, y: 410, fraudCount: 89,  totalTransactions: 6230,  riskLevel: 'high' },
  { name: 'Kumasi',     x: 188, y: 340, fraudCount: 67,  totalTransactions: 5890,  riskLevel: 'moderate' },
  { name: 'Tamale',     x: 212, y: 150, fraudCount: 23,  totalTransactions: 2340,  riskLevel: 'low' },
  { name: 'Cape Coast', x: 210, y: 440, fraudCount: 18,  totalTransactions: 1870,  riskLevel: 'low' },
  { name: 'Takoradi',   x: 175, y: 445, fraudCount: 21,  totalTransactions: 2100,  riskLevel: 'low' },
  { name: 'Sunyani',    x: 160, y: 290, fraudCount: 12,  totalTransactions: 1240,  riskLevel: 'low' },
  { name: 'Ho',         x: 280, y: 355, fraudCount: 14,  totalTransactions: 1050,  riskLevel: 'low' },
  { name: 'Koforidua',  x: 248, y: 380, fraudCount: 28,  totalTransactions: 2180,  riskLevel: 'moderate' },
]

function getDotColor(level: string) {
  switch (level) {
    case 'high': return '#EF4444'
    case 'moderate': return '#F59E0B'
    default: return '#0EA5A0'
  }
}

function getDotSize(count: number) {
  if (count > 100) return 16
  if (count > 50) return 12
  if (count > 20) return 8
  return 6
}

// Accurate simplified Ghana boundary path (viewBox 0 0 400 520)
// Traced from actual geographic coordinates
const GHANA_OUTLINE = `
  M 215 18 L 225 16 L 240 18 L 252 22 L 268 20 L 280 24 L 295 22
  L 305 28 L 310 35 L 308 48 L 315 58 L 312 72 L 318 85
  L 315 95 L 320 108 L 318 118 L 322 130 L 318 142
  L 315 155 L 318 168 L 312 180 L 316 195 L 310 210
  L 314 225 L 308 240 L 312 255 L 305 268 L 310 282
  L 305 295 L 308 308 L 302 320 L 306 335 L 298 348
  L 295 362 L 290 372 L 285 380 L 280 388 L 275 395
  L 278 405 L 282 412 L 290 418 L 295 428 L 288 435
  L 275 440 L 262 445 L 250 450 L 235 452 L 220 455
  L 205 458 L 190 455 L 178 450 L 165 448 L 152 442
  L 142 435 L 138 425 L 140 415 L 138 405 L 132 395
  L 128 385 L 125 375 L 120 365 L 115 355 L 112 342
  L 108 330 L 105 318 L 102 305 L 100 290 L 98 275
  L 96 260 L 95 245 L 94 230 L 96 215 L 98 200
  L 100 185 L 105 170 L 108 155 L 112 140 L 115 125
  L 120 110 L 125 95 L 130 82 L 138 70 L 145 58
  L 152 48 L 160 40 L 170 32 L 180 26 L 192 22 L 205 20 Z
`

// Lake Volta — large Y-shaped reservoir in eastern Ghana
const LAKE_VOLTA = `
  M 250 210 L 256 225 L 260 245 L 258 265 L 255 280
  L 252 295 L 248 310 L 245 325 L 240 340 L 238 350
  L 242 345 L 248 335 L 255 330 L 260 322 L 258 312
  L 262 300 L 268 288 L 272 275 L 268 260 L 265 245
  L 262 230 L 258 218 L 255 210 Z
`

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
          viewBox="0 0 400 520"
          className="w-full max-w-[420px] mx-auto h-auto"
          onMouseLeave={() => setHoveredCity(null)}
        >
          {/* Background subtle glow under the country */}
          <defs>
            <radialGradient id="countryGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0EA5A0" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#0EA5A0" stopOpacity="0" />
            </radialGradient>
            <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#0EA5A0" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Ambient glow */}
          <ellipse cx="200" cy="260" rx="140" ry="200" fill="url(#countryGlow)" />

          {/* Ghana country shape */}
          <path
            d={GHANA_OUTLINE}
            fill="#1A2744"
            stroke="#3A5070"
            strokeWidth="1.8"
            strokeLinejoin="round"
            filter="url(#mapShadow)"
          />

          {/* Subtle inner border for depth */}
          <path
            d={GHANA_OUTLINE}
            fill="none"
            stroke="#2A3A5A"
            strokeWidth="0.5"
            strokeLinejoin="round"
            strokeDasharray="2 3"
            opacity="0.4"
          />

          {/* Lake Volta */}
          <path
            d={LAKE_VOLTA}
            fill="#0B1120"
            stroke="#1A2744"
            strokeWidth="0.5"
            opacity="0.6"
          />

          {/* Region divider lines (subtle) */}
          <line x1="95" y1="300" x2="310" y2="300" stroke="#2A3A5A" strokeWidth="0.3" strokeDasharray="4 4" opacity="0.3" />
          <line x1="95" y1="200" x2="318" y2="200" stroke="#2A3A5A" strokeWidth="0.3" strokeDasharray="4 4" opacity="0.3" />

          {/* Region labels */}
          <text x="105" y="135" fill="#2A3A5A" fontSize="9" fontFamily="Inter, system-ui" fontWeight="500" letterSpacing="2">
            NORTHERN
          </text>
          <text x="105" y="255" fill="#2A3A5A" fontSize="9" fontFamily="Inter, system-ui" fontWeight="500" letterSpacing="2">
            MIDDLE BELT
          </text>
          <text x="105" y="385" fill="#2A3A5A" fontSize="9" fontFamily="Inter, system-ui" fontWeight="500" letterSpacing="2">
            SOUTHERN
          </text>

          {/* City dots */}
          {cities.map((city) => {
            const r = getDotSize(city.fraudCount)
            const color = getDotColor(city.riskLevel)
            const isHovered = hoveredCity?.name === city.name

            return (
              <g
                key={city.name}
                onMouseEnter={(e) => {
                  setHoveredCity(city)
                  const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                  setTooltipPos({
                    x: (city.x / 400) * svgRect.width,
                    y: (city.y / 520) * svgRect.height,
                  })
                }}
                onMouseLeave={() => setHoveredCity(null)}
                className="cursor-pointer"
              >
                {/* Pulsing glow ring */}
                <circle cx={city.x} cy={city.y} r={r + 6} fill={color} opacity="0.1">
                  <animate
                    attributeName="r"
                    values={`${r + 6};${r + 14};${r + 6}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.12;0.03;0.12"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Main dot */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isHovered ? r + 2 : r}
                  fill={color}
                  opacity="0.9"
                  style={{ transition: 'r 0.2s ease' }}
                />

                {/* White center highlight */}
                <circle
                  cx={city.x - r * 0.25}
                  cy={city.y - r * 0.25}
                  r={r * 0.2}
                  fill="white"
                  opacity="0.3"
                />

                {/* City label */}
                <text
                  x={city.x + r + 6}
                  y={city.y + 4}
                  fill={isHovered ? '#F1F5F9' : '#94A3B8'}
                  fontSize="11"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight={isHovered ? '600' : '400'}
                  style={{ transition: 'fill 0.2s ease' }}
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
              left: tooltipPos.x + 24,
              top: tooltipPos.y - 40,
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
            <span className="w-2.5 h-2.5 rounded-full bg-coral" />
            High
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber" />
            Moderate
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" />
            Low
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block w-3.5 h-3.5 rounded-full border border-slate-600" />
            Dot size = volume
          </div>
        </div>
      </div>
    </motion.div>
  )
}
