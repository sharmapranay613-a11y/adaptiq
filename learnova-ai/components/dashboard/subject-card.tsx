import { Card } from '@/components/ui/card'
import { accentClasses } from '@/lib/accents'
import type { Subject } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function SubjectCard({ subject }: { subject: Subject }) {
  const a = accentClasses[subject.accent]
  return (
    <Card className="glass gap-0 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{subject.name}</span>
        <span className={cn('size-2 rounded-full', a.dot)} />
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{subject.mastery}</span>
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all duration-700', a.bar)}
          style={{ width: `${subject.mastery}%` }}
        />
      </div>
    </Card>
  )
}
