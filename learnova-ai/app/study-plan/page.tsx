import { PageHeader } from '@/components/page-header'
import { StudyPlanView } from '@/components/study-plan/study-plan-view'

export default function StudyPlanPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Personalize"
        title="Adaptive Study Plan"
        description="A daily plan generated from your analysis. Minutes are allocated by mistake density, confidence gap and exam urgency — not by a fixed template."
      />
      <StudyPlanView />
    </div>
  )
}
