import Link from 'next/link'
import { BrainCircuit, TriangleAlert, Lightbulb, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MistakeBreakdown } from '@/components/mistake-breakdown'
import { ConfidenceGap } from '@/components/analysis/confidence-gap'
import { accentClasses, scoreAccent } from '@/lib/accents'
import { analysis, weakTopics } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analyze"
        title="AI Analysis"
        description="Learnova interprets your diagnostic — not just the score, but why you missed what you missed and where your self-perception is off."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-strong flex flex-col justify-between gap-4 p-6">
          <div className="flex items-center gap-2 text-violet">
            <BrainCircuit className="size-5" />
            <span className="text-sm font-medium">Diagnostic score</span>
          </div>
          <div>
            <p className="text-4xl font-semibold">{analysis.score}%</p>
            <Badge className="mt-2 bg-warning/15 text-warning shadow-none">Weak band</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Java · Inheritance · Medium difficulty
          </p>
        </Card>

        <Card className="glass p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-warning" />
            <h3 className="text-base font-semibold">Weak topics</h3>
          </div>
          <div className="mt-4 space-y-3">
            {weakTopics.map((t) => {
              const a = accentClasses[scoreAccent(t.score)]
              return (
                <div key={t.topic} className="flex items-center gap-4">
                  <span className="w-40 shrink-0 text-sm">
                    {t.topic}
                    <span className="ml-1 text-xs text-muted-foreground">· {t.subject}</span>
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn('h-full rounded-full', a.bar)}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                  <span className={cn('w-10 text-right text-sm font-semibold', a.text)}>
                    {t.score}%
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass p-6">
          <h3 className="text-base font-semibold">Mistake intelligence</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Classifying errors reveals the fix — conceptual gaps need teaching, careless ones
            need pacing.
          </p>
          <div className="mt-5">
            <MistakeBreakdown />
          </div>
        </Card>

        <Card className="glass p-6">
          <h3 className="text-base font-semibold">Confidence vs performance</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The single most predictive signal Learnova tracks.
          </p>
          <div className="mt-5">
            <ConfidenceGap />
          </div>
        </Card>
      </div>

      <Card className="glass-strong border-violet/25 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-blue text-primary-foreground">
            <Lightbulb className="size-4.5" />
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Recommended action</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 text-pretty">
              {analysis.recommendedAction}
            </p>
            <Button nativeButton={false} className="mt-4" render={<Link href="/study-plan" />}>
              Generate Adaptive Plan
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
