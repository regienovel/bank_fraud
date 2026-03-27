'use client'

import { motion } from 'framer-motion'

interface ConnectedAccount {
  name: string
  flagged: boolean
  relationship: string
}

interface NetworkGraphProps {
  centralAccount: string
  connectedAccounts: ConnectedAccount[]
}

const nodeSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 18,
}

export default function NetworkGraph({
  centralAccount,
  connectedAccounts,
}: NetworkGraphProps) {
  const cx = 250
  const cy = 200
  const orbitRadius = 140

  // Distribute connected nodes evenly around the center
  const angleStep = (2 * Math.PI) / connectedAccounts.length
  const startAngle = -Math.PI / 2

  const nodes = connectedAccounts.map((account, i) => {
    const angle = startAngle + i * angleStep
    return {
      ...account,
      x: cx + orbitRadius * Math.cos(angle),
      y: cy + orbitRadius * Math.sin(angle),
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-navy-700 rounded-xl border border-navy-600 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-100 mb-4">
        Network Analysis
      </h3>

      <svg viewBox="0 0 500 400" className="w-full h-auto">
        {/* Connection lines */}
        {nodes.map((node, i) => (
          <motion.line
            key={`line-${i}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke={node.flagged ? '#EF4444' : '#0EA5A0'}
            strokeWidth={node.flagged ? 2 : 1.5}
            strokeDasharray={node.flagged ? '6 4' : 'none'}
            strokeOpacity={node.flagged ? 0.7 : 0.4}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
          />
        ))}

        {/* Relationship labels on the lines */}
        {nodes.map((node, i) => {
          const midX = (cx + node.x) / 2
          const midY = (cy + node.y) / 2
          // Offset label slightly to avoid the line
          const dx = node.y - cy
          const dy = -(node.x - cx)
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const offsetX = (dx / len) * 12
          const offsetY = (dy / len) * 12

          return (
            <motion.text
              key={`label-${i}`}
              x={midX + offsetX}
              y={midY + offsetY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#64748B"
              fontSize={9}
              fontWeight={500}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              {node.relationship}
            </motion.text>
          )
        })}

        {/* Connected nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={`node-${i}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...nodeSpring, delay: 0.3 + i * 0.12 }}
            style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
          >
            {/* Node glow for flagged */}
            {node.flagged && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={30}
                fill="none"
                stroke="#EF4444"
                strokeWidth={1}
                strokeOpacity={0.3}
                animate={{
                  r: [30, 36, 30],
                  strokeOpacity: [0.3, 0.1, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={26}
              fill="#131D33"
              stroke={node.flagged ? '#EF4444' : '#0EA5A0'}
              strokeWidth={2}
            />
            {/* Node name — split into lines if needed */}
            {node.name.split(' ').map((word, wi) => (
              <text
                key={wi}
                x={node.x}
                y={node.y + (wi - 0.5) * 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.flagged ? '#F87171' : '#94A3B8'}
                fontSize={9}
                fontWeight={500}
              >
                {word}
              </text>
            ))}
            {/* Flagged indicator */}
            {node.flagged && (
              <text
                x={node.x}
                y={node.y + 38}
                textAnchor="middle"
                fill="#EF4444"
                fontSize={8}
                fontWeight={700}
                letterSpacing="0.05em"
              >
                FLAGGED
              </text>
            )}
          </motion.g>
        ))}

        {/* Central node — drawn last so it's on top */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...nodeSpring, delay: 0.1 }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
        >
          {/* Outer glow ring */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={44}
            fill="none"
            stroke="#D4A843"
            strokeWidth={1}
            strokeOpacity={0.3}
            animate={{
              r: [44, 50, 44],
              strokeOpacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Central circle */}
          <circle
            cx={cx}
            cy={cy}
            r={38}
            fill="#1A2744"
            stroke="#D4A843"
            strokeWidth={2.5}
          />
          {/* Central name */}
          {centralAccount.split(' ').map((word, wi) => (
            <text
              key={wi}
              x={cx}
              y={cy + (wi - 0.5) * 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F1F5F9"
              fontSize={11}
              fontWeight={600}
            >
              {word}
            </text>
          ))}
        </motion.g>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-teal" />
          <span className="text-slate-400">Normal connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-red-500" />
          <span className="text-slate-400">Flagged connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 border-t-2 border-dashed border-red-500/60" />
          <span className="text-slate-400">Suspicious link</span>
        </div>
      </div>
    </motion.div>
  )
}
