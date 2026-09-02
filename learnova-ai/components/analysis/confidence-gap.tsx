import { analysis } from '@/lib/mock-data'

function Bar({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${className}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function ConfidenceGap() {
  return (
    <div className="space-y-5">
      <Bar
        label="Confidence (how sure you felt)"
        value={analysis.confidence}
        className="bg-success"
      />
      <Bar
        label="Measured performance (actual)"
        value={analysis.performance}
        className="bg-warning"
      />
      <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-warning">Confidence gap</span>
          <span className="text-2xl font-semibold text-warning">
            {analysis.confidenceGap}%
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/80 text-pretty">
          A large positive gap means overconfidence: you rate yourself far higher than you
          score. These are the topics most likely to be skipped during self-study — and the
          most dangerous going into an exam.
        </p>
      </div>
    </div>
  )
}
