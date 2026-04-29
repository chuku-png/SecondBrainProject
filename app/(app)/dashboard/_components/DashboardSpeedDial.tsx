'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import WorkoutModal from '@/app/(app)/gym/_components/WorkoutModal'
import WorkItemModal from '@/app/(app)/work/_components/WorkItemModal'
import HabitModal from '@/app/(app)/habits/_components/HabitModal'
import TransactionModal from '@/app/(app)/finance/_components/TransactionModal'
import NewProjectModal from '@/app/(app)/projects/_components/NewProjectModal'
import NewObjectiveModal from '@/app/(app)/objectives/_components/NewObjectiveModal'

type ModalKey = 'finance' | 'gym' | 'habit' | 'work' | 'project' | 'objective'

const OPTIONS: { key: ModalKey; emoji: string; label: string; color: string }[] = [
  { key: 'finance',   emoji: '💸', label: 'Nueva transacción',   color: '#4A7C59' },
  { key: 'gym',       emoji: '🏋️', label: 'Nuevo entrenamiento', color: '#C4624A' },
  { key: 'habit',     emoji: '✅', label: 'Registrar hábito',    color: '#8B5E8B' },
  { key: 'work',      emoji: '💼', label: 'Nuevo trabajo',       color: '#5B8DB8' },
  { key: 'project',   emoji: '📁', label: 'Nuevo proyecto',      color: '#7A6B4A' },
  { key: 'objective', emoji: '🎯', label: 'Nuevo objetivo',      color: '#E07B4F' },
]

export default function DashboardSpeedDial() {
  const [open, setOpen]             = useState(false)
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null)

  function pick(key: ModalKey) {
    setOpen(false)
    setActiveModal(key)
  }

  return (
    <>
      {/* Backdrop — closes on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Speed dial container */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-6 z-30 flex flex-col items-end gap-3">
        {/* Options — stagger upward when open */}
        {OPTIONS.map((opt, i) => (
          <div
            key={opt.key}
            className="flex items-center gap-3 transition-all duration-200"
            style={{
              opacity:    open ? 1 : 0,
              transform:  open ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: open ? `${i * 45}ms` : `${(OPTIONS.length - 1 - i) * 30}ms`,
              pointerEvents: open ? 'auto' : 'none',
            }}
          >
            {/* Label */}
            <span className="text-xs font-mono font-bold text-white bg-brand-dark/80 backdrop-blur-sm px-2.5 py-1 rounded-lg whitespace-nowrap shadow-sm">
              {opt.label}
            </span>

            {/* Icon button */}
            <button
              onClick={() => pick(opt.key)}
              className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-xl flex-shrink-0 active:scale-95 transition-transform"
              style={{ backgroundColor: opt.color }}
            >
              {opt.emoji}
            </button>
          </div>
        ))}

        {/* Main FAB */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#E07B4F] shadow-xl flex items-center justify-center transition-transform duration-300 hover:opacity-90"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'finance'   && <TransactionModal  onClose={() => setActiveModal(null)} />}
      {activeModal === 'gym'       && <WorkoutModal      onClose={() => setActiveModal(null)} />}
      {activeModal === 'habit'     && <HabitModal        onClose={() => setActiveModal(null)} />}
      {activeModal === 'work'      && <WorkItemModal     onClose={() => setActiveModal(null)} />}
      {activeModal === 'project'   && <NewProjectModal   onClose={() => setActiveModal(null)} />}
      {activeModal === 'objective' && <NewObjectiveModal onClose={() => setActiveModal(null)} />}
    </>
  )
}
