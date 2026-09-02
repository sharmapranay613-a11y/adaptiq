import { TrendingUp, ArrowUpRight } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LearningTrendChart,
  TopicMasteryChart,
  InheritanceGrowthChart,
} from '@/components/progress/progress-charts'
import { LearningLoop } from '@/components/learning-loop'
import { headlineImprovement } from '@/lib/mock-data'

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reassess & Adapt"
        title="Progress"
        description="Proof the loop is working. Track how targeted practice moves the needle on the topics that mattered most."
      />

      <Card className="glass-strong relative overflow-hidden border-success/25 p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-success/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
              <TrendingUp className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{headlineImprovement.topic}</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold text-muted-foreground/70 line-through decoration-1">
                  {headlineImprovement.from}%
                </span>
                <ArrowUpRight className="size-5 text-success" />
                <span className="text-3xl font-semibold text-success">
                  {headlineImprovement.to}%
                </span>
              </div>
            </div>
          </div>
          <Badge className="w-fit gap-1 bg-success/15 text-base text-success shadow-none">
            +{headlineImprovement.delta}% mastery
          </Badge>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass p-6">
          <h3 className="text-base font-semibold">Learning trend</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mastery climbing as confidence recalibrates toward reality.
          </p>
          <div className="mt-4">
            <LearningTrendChart />
          </div>
        </Card>

        <Card className="glass p-6">
          <h3 className="text-base font-semibold">Topic mastery</h3>
          <p className="mt-1 text-sm text-muted-foreground">Current mastery across subjects.</p>
          <div className="mt-4">
            <TopicMasteryChart />
          </div>
        </Card>
      </div>

      <Card className="glass p-6">
        <h3 className="text-base font-semibold">Java Inheritance recovery</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your weakest topic, session by session, after the adaptive plan kicked in.
        </p>
        <div className="mt-4">
          <InheritanceGrowthChart />
        </div>
      </Card>

      <LearningLoop />
    </div>
  )
}
