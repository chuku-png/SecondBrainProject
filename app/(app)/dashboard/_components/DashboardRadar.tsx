'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

interface RadarDataPoint {
  subject: string
  score: number
}

export default function DashboardRadar({ data }: { data: RadarDataPoint[] }) {
  return (
    <div className="bg-[#2A2118] rounded-2xl p-5">
      <h2 className="text-brand-border font-bold text-center text-sm font-mono mb-1 italic">
        Equilibrio de vida
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 15, right: 35, bottom: 15, left: 35 }}>
          <PolarGrid stroke="#C4A882" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#C4A882', fontSize: 11, fontFamily: 'Space Mono, monospace' }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={4}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#C4A882"
            fill="#C4A882"
            fillOpacity={0.15}
            strokeWidth={1.5}
            dot={{ fill: '#C4A882', strokeWidth: 0, r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
