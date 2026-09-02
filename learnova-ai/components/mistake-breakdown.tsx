import { accentClasses } from '@/lib/accents'
import { mistakeTypes } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function MistakeBreakdown() {
  const max = Math.max(...mistakeTypes.map((m) => m.count), 1)
  return (
    <div className="space-y-3">
      {mistakeTypes.map((m) => {
        const a = accentClasses[m.color]
        return (
          <div key={m.label} className="flex items-center gap-4">
            <div className="w-32 shrink-0">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                {m.description}
              </p>
            </div>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full rounded-full transition-all duration-700', a.bar)}
                style={{ width: `${(m.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums">
              {m.count}
            </span>
          </div>
        )
      })}
    </div>
  )
}
