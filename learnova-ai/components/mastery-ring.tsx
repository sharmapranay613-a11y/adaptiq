import { cn } from '@/lib/utils'

export function MasteryRing({
  value,
  size = 160,
  stroke = 12,
  label,
  sublabel,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="mastery-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--violet)" />
            <stop offset="50%" stopColor="var(--blue)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#mastery-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight">{value}%</span>
        {label && <span className="mt-0.5 text-xs font-medium text-foreground">{label}</span>}
        {sublabel && <span className="text-[11px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}
