'use client'

import { useState } from 'react'
import { signIn } from '@/app/_actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen dot-pattern flex flex-col items-center justify-center px-4 py-12">
      {/* Título */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-brand-text font-mono tracking-tight">
          SECOND BRAIN
        </h1>
        <p className="text-brand-muted text-sm mt-2 font-mono">
          Tu sistema operativo de vida
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-brand-card rounded-2xl p-6 border border-brand-border shadow-sm">
        <h2 className="text-lg font-bold text-brand-text font-mono mb-6">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="h-11 bg-brand-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm font-mono transition mt-2"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted font-mono mt-6">
          ¿No tenés cuenta?{' '}
          <Link
            href="/register"
            className="text-brand-dark underline hover:opacity-70 transition"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
