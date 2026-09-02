import { PageHeader } from '@/components/page-header'
import { DiagnosticTest } from '@/components/diagnostic/diagnostic-test'

export default function DiagnosticPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Assess"
        title="Diagnostic Test"
        description="A short, adaptive MCQ set that measures your true level on Java — Inheritance. Answer honestly; the AI uses this to find your real gaps."
      />
      <DiagnosticTest />
    </div>
  )
}
