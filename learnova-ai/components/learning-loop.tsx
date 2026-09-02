import { ArrowRight, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { learningLoop } from '@/lib/mock-data'

export function LearningLoop() {
  return (
    <Card className="glass-strong p-6">
      <div className="flex items-center gap-2">
        <RefreshCw className="size-5 text-violet" />
        <h3 className="text-base font-semibold">The Learnova learning loop</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground text-pretty">
        Every stage feeds the next. The loop never ends — it adapts as you improve.
      </p>

      <div className="mt-6 flex flex-wrap items-stretch gap-2">
        {learningLoop.map((stage, i) => (
          <div key={stage.key} className="flex items-stretch gap-2">
            <div className="flex w-40 flex-col rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-violet to-blue text-[11px] font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{stage.label}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-tight text-muted-foreground text-pretty">
                {stage.description}
              </p>
            </div>
            {i < learningLoop.length - 1 && (
              <div className="flex items-center text-muted-foreground">
                <ArrowRight className="size-4" />
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 text-violet">
          <RefreshCw className="size-4" />
          <span className="text-xs font-medium">repeat</span>
        </div>
      </div>
    </Card>
  )
}
