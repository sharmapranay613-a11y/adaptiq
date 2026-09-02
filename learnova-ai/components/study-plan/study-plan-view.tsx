'use client'

import { useState } from 'react'
import { Clock, RefreshCw, CheckCircle2, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { accentClasses } from '@/lib/accents'
import { studyPlan, totalPlanMinutes, planReasons } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function StudyPlanView() {
  const [updated, setUpdated] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-strong flex flex-col justify-center gap-2 p-6">
          <div className="flex items-center gap-2 text-cyan">
            <Clock className="size-5" />
            <span className="text-sm font-medium">Daily focus</span>
          </div>
          <p className="text-4xl font-semibold">{totalPlanMinutes} min</p>
          <p className="text-sm text-muted-foreground">
            Front-loaded onto your weakest, highest-impact topics.
          </p>
        </Card>

        <Card className="glass flex flex-col justify-center gap-3 p-6 lg:col-span-2">
          <span className="text-sm font-medium text-muted-foreground">Time distribution</span>
          <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
            {studyPlan.map((item) => {
              const a = accentClasses[item.accent]
              return (
                <div
                  key={item.topic}
                  className={cn('h-full', a.bar)}
                  style={{ width: `${(item.minutes / totalPlanMinutes) * 100}%` }}
                  title={`${item.topic} · ${item.minutes} min`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {studyPlan.map((item) => {
              const a = accentClasses[item.accent]
              return (
                <span key={item.topic} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn('size-2 rounded-full', a.dot)} />
                  {item.topic}
                </span>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {studyPlan.map((item, i) => {
          const a = accentClasses[item.accent]
          return (
            <Card key={item.topic} className="glass flex items-center gap-4 p-4 sm:p-5">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1',
                  a.bg,
                  a.text,
                  a.ring,
                )}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <p className="font-semibold">{item.topic}</p>
                  <span className="text-xs text-muted-foreground">· {item.subject}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{item.reason}</p>
              </div>
              <div className={cn('shrink-0 text-right', a.text)}>
                <p className="text-lg font-semibold tabular-nums">{item.minutes}</p>
                <p className="text-[11px] text-muted-foreground">min</p>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-strong border-violet/25 p-6">
        <div className="flex items-center gap-2">
          <Info className="size-5 text-violet" />
          <h3 className="text-base font-semibold">Why Learnova recommends this</h3>
        </div>
        <ul className="mt-4 space-y-2.5">
          {planReasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-violet" />
              <span className="text-pretty">{reason}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setUpdated(true)}>
          <RefreshCw className="size-4" />
          Regenerate plan
        </Button>
        {updated && (
          <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" />
            Plan Updated
          </span>
        )}
      </div>
    </div>
  )
}
