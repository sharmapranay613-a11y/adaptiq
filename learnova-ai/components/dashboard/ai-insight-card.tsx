import Link from 'next/link'
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { aiInsight } from '@/lib/mock-data'

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'warning' | 'success' | 'default'
}) {
  const color =
    tone === 'warning'
      ? 'text-warning'
      : tone === 'success'
        ? 'text-success'
        : 'text-foreground'
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export function AiInsightCard() {
  return (
    <Card className="glass-strong relative overflow-hidden border-violet/25 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-violet/20 blur-3xl"
      />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-blue text-primary-foreground">
              <Sparkles className="size-4.5" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet">
                AI Insight
              </p>
              <h3 className="text-lg font-semibold">{aiInsight.topic} needs attention</h3>
            </div>
          </div>
          <Badge className="gap-1 bg-warning/15 text-warning shadow-none">
            <AlertTriangle className="size-3" />
            {aiInsight.type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Performance" value={`${aiInsight.performance}%`} tone="warning" />
          <Metric label="Confidence" value={`${aiInsight.confidence}%`} tone="success" />
          <Metric label="Confidence Gap" value={`${aiInsight.confidenceGap}%`} tone="warning" />
          <Metric label="Mistakes" value={String(aiInsight.mistakes)} />
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why this is prioritized
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 text-pretty">
            {aiInsight.reasoning}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button nativeButton={false} render={<Link href="/analysis" />}>
            View full analysis
            <ArrowRight className="size-4" />
          </Button>
          <Button nativeButton={false} variant="outline" render={<Link href="/tutor" />}>
            Open AI Tutor
          </Button>
        </div>
      </div>
    </Card>
  )
}
