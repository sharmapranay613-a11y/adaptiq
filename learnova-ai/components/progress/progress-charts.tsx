'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { progressTrend, topicMasteryProgress } from '@/lib/mock-data'

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

export function LearningTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={progressTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="mastery" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="session" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
        <Area
          type="monotone"
          dataKey="mastery"
          name="Mastery"
          stroke="var(--violet)"
          strokeWidth={2.5}
          fill="url(#mastery)"
        />
        <Area
          type="monotone"
          dataKey="confidence"
          name="Confidence"
          stroke="var(--cyan)"
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="url(#confidence)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TopicMasteryChart() {
  const colors = ['var(--violet)', 'var(--blue)', 'var(--warning)', 'var(--cyan)']
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={topicMasteryProgress} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--secondary)', opacity: 0.4 }} />
        <Bar dataKey="mastery" name="Mastery" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {topicMasteryProgress.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function InheritanceGrowthChart() {
  const data = [
    { label: 'Before', value: 42 },
    { label: 'Session 3', value: 51 },
    { label: 'Session 6', value: 62 },
    { label: 'Now', value: 68 },
  ]
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[30, 80]} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
        <Line
          type="monotone"
          dataKey="value"
          name="Inheritance mastery"
          stroke="var(--success)"
          strokeWidth={3}
          dot={{ r: 4, fill: 'var(--success)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
