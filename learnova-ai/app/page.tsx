import Link from 'next/link'
import { CalendarDays, Target, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { MasteryRing } from '@/components/mastery-ring'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubjectCard } from '@/components/dashboard/subject-card'
import { AiInsightCard } from '@/components/dashboard/ai-insight-card'
import {
  student,
  overallMastery,
  examCountdownDays,
  subjects,
} from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`Welcome back, ${student.name.split(' ')[0]}`}
        title="Your learning dashboard"
        description="A live snapshot of your mastery, powered by continuous AI assessment and analysis."
      >
        <Button nativeButton={false} render={<Link href="/diagnostic" />}>
          Take diagnostic test
          <ArrowRight className="size-4" />
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-strong flex flex-col items-center justify-center gap-4 p-6 text-center">
          <MasteryRing value={overallMastery} label="Overall" sublabel="Mastery" />
          <p className="text-sm text-muted-foreground text-pretty">
            You are on track. Focus on weak topics to push past 70%.
          </p>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-2">
          {subjects.map((s) => (
            <SubjectCard key={s.key} subject={s} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass flex items-center gap-4 p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <CalendarDays className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Exam countdown</p>
            <p className="text-2xl font-semibold">{examCountdownDays} days</p>
          </div>
        </Card>
        <Card className="glass flex items-center gap-4 p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-violet/15 text-violet">
            <Target className="size-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Priority topic</p>
            <p className="text-2xl font-semibold">Inheritance</p>
          </div>
        </Card>
        <Card className="glass flex items-center gap-4 p-5">
          <span className="flex size-11 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
            <span className="text-lg font-semibold">64</span>
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Overall mastery</p>
            <p className="text-2xl font-semibold">{overallMastery}%</p>
          </div>
        </Card>
      </div>

      <AiInsightCard />
    </div>
  )
}
