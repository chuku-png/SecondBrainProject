'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, fullName: string) {
  try {
    if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
      return { error: 'Todos los campos son requeridos' }
    }

    if (password.length < 6) {
      return { error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) return { error: error.message }

    // El trigger handle_new_user crea el profile automáticamente
    // con status = 'pendiente'
    revalidatePath('/')
    return { success: true, message: 'Registro exitoso. Pendiente de aprobación del admin.' }
  } catch {
    return { error: 'Error interno del servidor' }
  }
}

export async function signIn(email: string, password: string) {
  try {
    if (!email?.trim() || !password?.trim()) {
      return { error: 'Email y contraseña requeridos' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { error: error.message }

    // Verificar que el usuario esté activo (no pendiente ni inactivo)
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', data.user.id)
      .single()

    if (profile?.status === 'pendiente') {
      return { error: 'Tu cuenta está pendiente de aprobación por el administrador' }
    }

    if (profile?.status === 'inactivo') {
      return { error: 'Tu cuenta ha sido desactivada' }
    }

    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'Error interno del servidor' }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/')
  } catch {
    // Proceed to redirect even if signOut fails
  }
  redirect('/login')
}

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, status, role, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  if (error) return null
  return profile
}
