import React from 'react'

interface Props {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  color: 'teal' | 'blue' | 'yellow' | 'purple'
}

const colorMap = {
  teal:   { text: 'text-teal-400',   bg: 'bg-teal-400/10',   border: 'border-teal-400/15',  glow: 'shadow-teal-900/20' },
  blue:   { text: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/15',  glow: 'shadow-blue-900/20' },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/15',glow: 'shadow-yellow-900/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/15',glow: 'shadow-purple-900/20' },
}

export default function StatCard({ label, value, unit, icon, color }: Props) {
  const c = colorMap[color]

  return (
    <div className={`bg-gray-900 border ${c.border} rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg ${c.glow} transition-all duration-200 sm:hover:scale-[1.02] sm:hover:border-opacity-40 group`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={`text-lg w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl ${c.bg} sm:group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl sm:text-3xl font-bold ${c.text} tabular-nums`}>{value}</span>
        {unit && <span className="text-sm text-gray-500 font-medium">{unit}</span>}
      </div>
    </div>
  )
}