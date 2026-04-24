'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  CheckSquare2,
  Dumbbell,
  FolderOpen,
  Briefcase,
  Heart,
  Crosshair,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/finance', icon: DollarSign, label: 'Finanzas' },
  { href: '/habits', icon: CheckSquare2, label: 'Hábitos' },
  { href: '/gym', icon: Dumbbell, label: 'Entrenamientos' },
  { href: '/projects', icon: FolderOpen, label: 'Proyectos' },
  { href: '/work', icon: Briefcase, label: 'Trabajo' },
  { href: '/ro', icon: Heart, label: 'Ro' },
  { href: '/objectives', icon: Crosshair, label: 'Objetivos' },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono transition-colors ${
              active
                ? 'bg-brand-border/25 text-brand-dark font-bold'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-border/10'
            }`}
          >
            <Icon size={16} strokeWidth={active ? 2.5 : 1.75} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
