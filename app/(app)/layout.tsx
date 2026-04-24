import { getUserProfile } from '@/app/_actions/auth'
import { signOut } from '@/app/_actions/auth'
import SidebarNav from './_components/SidebarNav'
import BottomNav from './_components/BottomNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  const initial = profile?.full_name
    ? profile.full_name[0].toUpperCase()
    : profile?.email
    ? profile.email[0].toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-52 bg-brand-bg border-r border-brand-border/20 z-20">
        {/* Branding */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-brand-border/10">
          <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <span className="text-sm font-bold text-brand-text font-mono truncate">
            Second Brain
          </span>
        </div>

        {/* Nav items — client component para active state */}
        <SidebarNav />

        {/* Salir */}
        <div className="px-4 py-4 border-t border-brand-border/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-muted flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initial}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="text-brand-muted hover:text-brand-text text-sm font-mono transition-colors"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="md:pl-52 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* Bottom nav mobile */}
      <BottomNav />
    </div>
  )
}
