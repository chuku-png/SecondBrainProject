'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CheckSquare2,
  DollarSign,
  Briefcase,
  Dumbbell,
  Plus,
} from 'lucide-react'
import QuickActionsSheet from './QuickActionsSheet'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/habits',    icon: CheckSquare2,    label: 'Hábitos' },
  { href: '/finance',   icon: DollarSign,      label: 'Finanzas' },
  { href: '/work',      icon: Briefcase,       label: 'Trabajo' },
  { href: '/gym',       icon: Dumbbell,        label: 'Gym' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [showActions, setShowActions] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-card border-t border-brand-border/30 z-20">
        <div className="flex items-center">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-mono transition-colors ${
                  active ? 'text-brand-dark' : 'text-brand-muted'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                <span className="leading-none">{label}</span>
              </Link>
            )
          })}

          {/* Quick actions trigger */}
          <button
            onClick={() => setShowActions(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center -mt-4 shadow-md">
              <Plus size={18} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-mono text-brand-muted leading-none mt-0.5">Nuevo</span>
          </button>
        </div>
      </nav>

      {showActions && <QuickActionsSheet onClose={() => setShowActions(false)} />}
    </>
  )
}
