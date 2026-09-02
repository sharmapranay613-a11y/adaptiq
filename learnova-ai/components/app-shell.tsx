'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  ClipboardCheck,
  BrainCircuit,
  CalendarClock,
  Sparkles,
  LineChart,
  Menu,
  X,
  GraduationCap,
  CalendarDays,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { student, examCountdownDays } from '@/lib/mock-data'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diagnostic', label: 'Diagnostic Test', icon: ClipboardCheck },
  { href: '/analysis', label: 'AI Analysis', icon: BrainCircuit },
  { href: '/study-plan', label: 'Study Plan', icon: CalendarClock },
  { href: '/tutor', label: 'AI Tutor', icon: Sparkles },
  { href: '/progress', label: 'Progress', icon: LineChart },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const NavList = () => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              active
                ? 'bg-gradient-to-r from-violet/25 to-blue/15 text-foreground shadow-[inset_0_0_0_1px_var(--border)]'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-[18px] shrink-0 transition-colors',
                active ? 'text-violet' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const Brand = () => (
    <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet via-blue to-cyan text-primary-foreground shadow-lg shadow-violet/30">
        <GraduationCap className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          LEARNOVA <span className="text-violet">AI</span>
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Your Learning. Your Pace.
        </span>
      </span>
    </Link>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r p-4 lg:flex">
        <div className="px-2 pt-2">
          <Brand />
        </div>
        <div className="px-1">
          <NavList />
        </div>
        <StudentCard className="mt-auto" />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="glass-strong absolute left-0 top-0 flex h-full w-72 flex-col gap-6 border-r p-4">
            <div className="flex items-center justify-between px-1 pt-1">
              <Brand />
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavList />
            <StudentCard className="mt-auto" />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-40 flex items-center justify-between gap-4 border-b px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
            <CalendarDays className="size-3.5" />
            Exam in {examCountdownDays} days
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function StudentCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'glass-strong flex items-center gap-3 rounded-2xl border p-3',
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-blue text-sm font-semibold text-primary-foreground">
        {student.initials}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{student.name}</p>
        <p className="truncate text-xs text-muted-foreground">{student.program}</p>
      </div>
    </div>
  )
}
