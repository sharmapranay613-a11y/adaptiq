import { PageHeader } from '@/components/page-header'
import { AiTutor } from '@/components/tutor/ai-tutor'

export default function TutorPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Learn"
        title="AI Tutor"
        description="A scaffolded tutor that moves from Hint to Explanation to Example to Practice. Gemini integration is wired as a future drop-in — responses are mocked for the demo."
      />
      <AiTutor />
    </div>
  )
}
