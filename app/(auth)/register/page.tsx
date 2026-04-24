'use client'

import { useState } from 'react'
import { signUp } from '@/app/_actions/auth'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signUp(email, password, fullName)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen dot-pattern flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-brand-card rounded-2xl p-6 border border-brand-border shadow-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-brand-text font-mono mb-2">
            ¡Registro exitoso!
          </h2>
          <p className="text-brand-muted text-sm font-mono">
            Tu cuenta está pendiente de aprobación por el administrador.
          </p>
          <Link
            href="/login"
            className="block mt-6 text-brand-dark underline text-sm font-mono hover:opacity-70 transition"
          >
            Volver al login
          </Link>
        </div>
      </div>
    )
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
        <h2 className="text-lg font-bold text-brand-text font-mono mb-1">
          Crear cuenta
        </h2>
        <p className="text-brand-muted text-xs font-mono mb-6">
          Requiere aprobación del administrador
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-brand-muted font-mono uppercase tracking-wide">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="h-11 px-4 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-border text-sm font-mono focus:outline-none focus:border-brand-dark transition"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
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
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted font-mono mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="text-brand-dark underline hover:opacity-70 transition"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
