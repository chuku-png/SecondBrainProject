'use client'

import { useState } from 'react'
import { X, Target, DollarSign, Briefcase, Dumbbell, CheckSquare2, FolderOpen, Heart } from 'lucide-react'
import WorkoutModal from '@/app/(app)/gym/_components/WorkoutModal'
import WorkItemModal from '@/app/(app)/work/_components/WorkItemModal'
import HabitModal from '@/app/(app)/habits/_components/HabitModal'
import RoDateModal from '@/app/(app)/ro/_components/RoDateModal'
import NewProjectModal from '@/app/(app)/projects/_components/NewProjectModal'
import NewObjectiveModal from '@/app/(app)/objectives/_components/NewObjectiveModal'
import TransactionModal from '@/app/(app)/finance/_components/TransactionModal'

type ModalKey = 'objective' | 'finance' | 'work' | 'gym' | 'habit' | 'project' | 'ro'

const ACTIONS: { key: ModalKey; icon: React.ElementType; module: string; label: string; color: string; bg: string }[] = [
  { key: 'objective', icon: Target,       module: 'Objetivo',  label: 'Nuevo objetivo',      color: '#E07B4F', bg: '#FDF0E8' },
  { key: 'finance',   icon: DollarSign,   module: 'Finanzas',  label: 'Nueva transacción',   color: '#4A7C59', bg: '#EAF3ED' },
  { key: 'work',      icon: Briefcase,    module: 'Trabajo',   label: 'Nueva tarea',          color: '#5B8DB8', bg: '#EBF2F9' },
  { key: 'gym',       icon: Dumbbell,     module: 'Gym',       label: 'Nueva sesión',         color: '#C4624A', bg: '#FAF0EE' },
  { key: 'habit',     icon: CheckSquare2, module: 'Hábitos',   label: 'Nuevo hábito',         color: '#8B5E8B', bg: '#F5EEF5' },
  { key: 'project',   icon: FolderOpen,   module: 'Proyecto',  label: 'Nuevo proyecto',       color: '#7A6B4A', bg: '#F5F1EA' },
  { key: 'ro',        icon: Heart,        module: 'Ro',        label: 'Nueva fecha',          color: '#B85B8D', bg: '#F9EDF4' },
]

export default function QuickActionsSheet({ onClose }: { onClose: () => void }) {
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null)

  function openModal(key: ModalKey) {
    setActiveModal(key)
  }

  function closeModal() {
    setActiveModal(null)
    onClose()
  }

  return (
    <>
      {!activeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 animate-in fade-in duration-200"
            onClick={onClose}
          />
          <div className="fixed bottom-0 inset-x-0 z-40 bg-white rounded-t-3xl shadow-xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-sm font-bold font-mono text-brand-text">Acciones rápidas</p>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-brand-muted hover:text-brand-text transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-8 pt-1">
              {ACTIONS.map(({ key, icon: Icon, module: mod, label, color, bg }) => (
                <button
                  key={key}
                  onClick={() => openModal(key)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-opacity active:opacity-70"
                  style={{ backgroundColor: bg }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color }}>
                    <Icon size={16} color="white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wide" style={{ color }}>{mod}</p>
                    <p className="text-xs font-bold font-mono text-brand-text leading-snug">{label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeModal === 'objective' && <NewObjectiveModal onClose={closeModal} />}
      {activeModal === 'finance'   && <TransactionModal  onClose={closeModal} />}
      {activeModal === 'work'      && <WorkItemModal     onClose={closeModal} />}
      {activeModal === 'gym'       && <WorkoutModal      onClose={closeModal} />}
      {activeModal === 'habit'     && <HabitModal        onClose={closeModal} />}
      {activeModal === 'project'   && <NewProjectModal   onClose={closeModal} />}
      {activeModal === 'ro'        && <RoDateModal       onClose={closeModal} />}
    </>
  )
}
