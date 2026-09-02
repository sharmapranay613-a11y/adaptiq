export type Accent = 'violet' | 'blue' | 'cyan' | 'success' | 'warning'

export const accentClasses: Record<
  Accent,
  { text: string; bg: string; ring: string; bar: string; dot: string }
> = {
  violet: {
    text: 'text-violet',
    bg: 'bg-violet/10',
    ring: 'ring-violet/30',
    bar: 'bg-violet',
    dot: 'bg-violet',
  },
  blue: {
    text: 'text-blue',
    bg: 'bg-blue/10',
    ring: 'ring-blue/30',
    bar: 'bg-blue',
    dot: 'bg-blue',
  },
  cyan: {
    text: 'text-cyan',
    bg: 'bg-cyan/10',
    ring: 'ring-cyan/30',
    bar: 'bg-cyan',
    dot: 'bg-cyan',
  },
  success: {
    text: 'text-success',
    bg: 'bg-success/10',
    ring: 'ring-success/30',
    bar: 'bg-success',
    dot: 'bg-success',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    ring: 'ring-warning/30',
    bar: 'bg-warning',
    dot: 'bg-warning',
  },
}

/** Color for a mastery/score value: low = warning, mid = cyan, high = success. */
export function scoreAccent(value: number): Accent {
  if (value < 50) return 'warning'
  if (value < 70) return 'cyan'
  return 'success'
}
