'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  CheckSquare2,
  DollarSign,
  Dumbbell,
  Grid2X2,
  FolderOpen,
  Briefcase,
  Heart,
  Crosshair,
  X,
} from 'lucide-react'

const mainItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio'   },
  { href: '/habits',    icon: CheckSquare2,    label: 'Hábitos'  },
  { href: '/finance',   icon: DollarSign,      label: 'Finanzas' },
  { href: '/gym',       icon: Dumbbell,        label: 'Gym'      },
]

const moreItems = [
  { href: '/work',       icon: Briefcase,  label: 'Trabajo'   },
  { href: '/projects',   icon: FolderOpen, label: 'Proyectos' },
  { href: '/ro',         icon: Heart,      label: 'Ro'        },
  { href: '/objectives', icon: Crosshair,  label: 'Objetivos' },
]

function MoreSheet({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-30 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom duration-300 pb-safe">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-sm font-bold font-mono text-brand-text">Módulos</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-brand-muted"
          >
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5 pb-8 pt-1">
          {moreItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                  active
                    ? 'border-brand-dark bg-brand-dark text-white'
                    : 'border-gray-100 bg-gray-50 text-brand-text hover:bg-gray-100'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                <span className="text-sm font-bold font-mono">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = moreItems.some(
    i => pathname === i.href || pathname.startsWith(i.href + '/')
  )

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-brand-card border-t border-brand-border/30 z-20 pb-safe">
        <div className="flex items-center h-14">
          {mainItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-mono transition-colors ${
                  active ? 'text-brand-dark' : 'text-brand-muted'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
                <span className="leading-none">{label}</span>
              </Link>
            )
          })}

          <button
            onClick={() => setShowMore(true)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-mono transition-colors ${
              isMoreActive ? 'text-brand-dark' : 'text-brand-muted'
            }`}
          >
            <Grid2X2 size={18} strokeWidth={isMoreActive ? 2.5 : 1.75} />
            <span className="leading-none">Más</span>
          </button>
        </div>
      </nav>

      {showMore && <MoreSheet onClose={() => setShowMore(false)} />}
    </>
  )
}
