import { signOut } from '@/app/_actions/auth'

export default function PendingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Cuenta pendiente de aprobación
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Tu cuenta fue creada correctamente. El administrador debe aprobarla antes de que puedas acceder al sistema.
        </p>
        <p className="text-gray-500 text-xs mt-4">
          Esto puede tardar algunas horas. Te notificaremos cuando esté activa.
        </p>

        <form action={signOut}>
          <button
            type="submit"
            className="mt-8 w-full h-11 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl text-sm transition"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
