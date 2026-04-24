# 🧠 SECOND BRAIN V2 — REGLAS DEL PROYECTO

## 📱 DISEÑO: MOBILE FIRST (OBLIGATORIO)

Todo componente y página se diseña primero para móvil, luego se escala a desktop.

### Reglas de diseño:

- Breakpoints en orden: base (móvil) → md → lg → xl
- Correcto:   className="text-sm md:text-base lg:text-lg"
- Correcto:   className="flex-col md:flex-row"
- Incorrecto: className="w-[400px]" (width fijo sin responsive)

### Tamaños objetivo:
- Móvil:   375px - 430px (iPhone SE, iPhone 14, iPhone 14 Pro Max)
- Tablet:  768px - 1024px (iPad)
- Desktop: 1280px+

### Reglas de UI mobile first:
- Botones e inputs: mínimo 44px de altura (touch targets)
- Espaciado: p-4 base, md:p-6 desktop
- Fuentes: text-sm base, md:text-base desktop
- Navegación: bottom tab bar en móvil, sidebar en desktop
- Modales: full screen en móvil, centered dialog en desktop

---

## STACK TÉCNICO

- Framework:     Next.js 15+ (App Router)
- Lenguaje:      TypeScript 5 (strict mode)
- Base de datos: Supabase (PostgreSQL + Auth + RLS)
- Estilos:       Tailwind CSS
- Gráficos:      Recharts
- Iconos:        Lucide React
- Estado:        Server Components + Server Actions (sin Zustand)
- Deploy:        Vercel
- Idioma UI:     Español

---

## RESTRICCIONES

- NO usar Zustand
- NO hacer fetch del lado cliente si puede hacerse en servidor
- NO omitir try/catch en Server Actions
- NO hardcodear user_id del cliente (siempre desde auth.getUser())
- NO saltar validación de campos en Server Actions
- NO crear páginas sin verificar auth primero
- NO omitir revalidatePath() después de mutaciones
- NO hacer SELECT * (especificar columnas necesarias)
- NO diseñar solo para desktop — siempre mobile first

---

## PATRONES OBLIGATORIOS

### Server Action base:
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('No autenticado')
  return { supabase, user }
}

### Navegación mobile first:
- Móvil:   Bottom navigation bar (fija al fondo)
- Desktop: Sidebar fijo a la izquierda

---

Second Brain v2 — Next.js 15 + Supabase + Tailwind CSS + TypeScript 5
Diseño: Mobile First obligatorio en todos los componentes
