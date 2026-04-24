# 🧠 SECOND BRAIN V2 — BRIEFING PARA CLAUDE CODE
**Fecha**: 2026-04-22
**Proyecto**: ~/Documents/second-brain
**Estado**: Base lista, hay que corregir estilos y construir el frontend completo

---

## 📍 DÓNDE ESTAMOS

### ✅ YA ESTÁ HECHO:
- Next.js 15 + TypeScript + Supabase corriendo en localhost:3000
- 12 tablas en Supabase con RLS y triggers
- middleware.ts (protección de rutas por auth + status + rol)
- lib/supabase/server.ts y client.ts
- app/_actions/auth.ts (signUp, signIn, signOut, getUserProfile)
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- app/(auth)/pending/page.tsx
- app/(app)/dashboard/page.tsx (placeholder vacío)
- types/index.ts (todos los tipos)

### ❌ PROBLEMA ACTUAL:
Los estilos de Tailwind CSS no se aplican. El login se ve sin estilos.
Además, el diseño actual usa tema oscuro (gris/indigo) pero el diseño
real del proyecto es BEIGE/MARRÓN (ver sección de diseño abajo).

---

## 🎨 DISEÑO OFICIAL DEL PROYECTO

### Paleta de colores (OBLIGATORIO respetar):

```
Fondo general:     #F5EFE6  (beige claro)
Fondo cards:       #EDE8DF  (beige medio, con borde marrón suave)
Borde cards:       #C4A882  (marrón claro)
Texto principal:   #2C1810  (marrón muy oscuro, casi negro)
Texto secundario:  #8B6F47  (marrón medio)
Acento/botones:    #3D2010  (marrón oscuro)
FAB button:        #3D2010  (marrón oscuro, redondo)
Checkboxes:        borde marrón, fondo transparente
Fondo puntitos:    patrón de puntos beige sobre beige claro
```

### Tipografía:
- Fuente: estilo serif/monospace typewriter (usar: `font-mono` o importar
  una fuente como `Courier Prime` o `Space Mono` de Google Fonts)
- Títulos grandes y bold
- Texto de contenido en monospace

### Layout Mobile (375px base):

```
HEADER:
  - Título "Second Brain" muy grande, bold, marrón oscuro
  - Subtítulo: fecha actual (ej: "Miércoles, 22 de abril")
  - Fondo con patrón de puntos

CARD HÁBITOS (card grande):
  - Label: "Hábitos de hoy"
  - Contador grande: "0 / 6"
  - Subtexto: "X pendientes"
  - Link "Ver →" arriba a la derecha
  - Lista de hábitos con checkboxes cuadrados

GRID 2x2 DE MÓDULOS:
  - Finanzas   | Gym
  - Proyectos  | Trabajo
  - Objetivos  | Fechas (abajo, parcialmente visible)
  Cada card tiene: icono arriba izq, flecha arriba der, título bold, subtítulo

BOTTOM NAVIGATION BAR:
  - Dashboard | Hábitos | Finanzas | Trabajo | Gym | Más
  - Iconos + texto debajo
  - Fondo beige, ítem activo en marrón oscuro

FAB BUTTON (+):
  - Círculo marrón oscuro, fijo abajo a la derecha
  - Encima del bottom nav
```

### Layout Desktop (1280px+):
- Sidebar izquierdo con los mismos ítems del bottom nav
- Contenido principal en el centro
- Mismo esquema de colores

---

## 🔧 TAREA 1: ARREGLAR TAILWIND CSS

El problema es que Tailwind no está configurado correctamente para la versión instalada.

### Pasos a seguir:

1. Verificar qué versión de Tailwind está instalada:
```bash
cat package.json | grep tailwind
```

2. Si es Tailwind v4, el globals.css debe usar `@import "tailwindcss"` y
   el postcss.config debe usar `@tailwindcss/postcss`.

3. Si es Tailwind v3, el globals.css debe usar las 3 directivas clásicas:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
Y el postcss.config debe usar `tailwindcss` y `autoprefixer`.

4. Instalar lo que falte según la versión detectada.

5. Verificar que tailwind.config.ts tenga el content correcto:
```ts
content: ['./app/**/*.{js,ts,jsx,tsx,mdx}']
```

---

## 🔧 TAREA 2: ACTUALIZAR TEMA DE COLORES EN TAILWIND

Agregar colores custom al tailwind.config.ts:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:       '#F5EFE6',
          card:     '#EDE8DF',
          border:   '#C4A882',
          text:     '#2C1810',
          muted:    '#8B6F47',
          dark:     '#3D2010',
        }
      },
      fontFamily: {
        mono: ['Space Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
export default config
```

---

## 🔧 TAREA 3: ACTUALIZAR globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-bg: #F5EFE6;
  --brand-card: #EDE8DF;
  --brand-border: #C4A882;
  --brand-text: #2C1810;
  --brand-muted: #8B6F47;
  --brand-dark: #3D2010;
}

body {
  background-color: var(--brand-bg);
  color: var(--brand-text);
  font-family: 'Space Mono', 'Courier New', monospace;
}

/* Patrón de puntos para el header */
.dot-pattern {
  background-image: radial-gradient(circle, #C4A882 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 🔧 TAREA 4: REESCRIBIR LOGIN Y REGISTER CON NUEVO TEMA

### Login (app/(auth)/login/page.tsx):
- Fondo: brand-bg con dot-pattern sutil
- Card centrada: bg brand-card, borde brand-border, rounded-2xl
- Título "Second Brain" grande, font-mono, brand-text
- Inputs: bg brand-bg, borde brand-border, texto brand-text
- Botón: bg brand-dark, texto blanco, rounded-xl
- Links: color brand-muted

### Register: mismo esquema que login

---

## 🔧 TAREA 5: CREAR DASHBOARD REAL

### Archivo: app/(app)/dashboard/page.tsx

El dashboard es un Server Component que:
1. Obtiene el perfil del usuario
2. Obtiene hábitos del día y cuántos están completados
3. Obtiene datos de finanzas del mes
4. Obtiene sesiones de gym de la semana
5. Obtiene proyectos activos
6. Obtiene tareas de trabajo pendientes
7. Renderiza el layout del diseño

### Componentes a crear:

```
app/_components/
├── ui/
│   ├── BottomNav.tsx       → Navegación inferior mobile
│   ├── Sidebar.tsx         → Sidebar desktop
│   └── ModuleCard.tsx      → Card de módulo (Finanzas, Gym, etc.)
└── dashboard/
    ├── HabitsDayCard.tsx   → Card grande de hábitos del día
    └── DashboardGrid.tsx   → Grid 2x2 de módulos
```

### BottomNav items:
```
Dashboard | Hábitos | Finanzas | Trabajo | Gym | Más
```

---

## 🔧 TAREA 6: APROBAR USUARIO ADMIN (MANUAL)

En Supabase Dashboard → Table Editor → tabla `profiles`:
- Buscar el usuario con email: secondbrain.admin@gmail.com
- Cambiar `status`: pendiente → activo
- Cambiar `role`: usuario_base → admin
- Guardar

---

## 📋 ORDEN DE EJECUCIÓN RECOMENDADO

```
1. Arreglar Tailwind (Tarea 1)
2. Actualizar tailwind.config.ts con colores brand (Tarea 2)
3. Actualizar globals.css con fuente y colores (Tarea 3)
4. Reescribir login y register con nuevo tema (Tarea 4)
5. Aprobar usuario admin en Supabase (Tarea 6 — manual)
6. Crear componentes UI base: BottomNav, ModuleCard (Tarea 5)
7. Crear dashboard real con datos reales (Tarea 5)
8. Verificar que el flujo completo funciona:
   register → pending → aprobar → login → dashboard
```

---

## ⛔ RESTRICCIONES (leer CLAUDE.md para más detalle)

- NO usar Zustand
- NO fetch del lado cliente si puede hacerse en servidor
- NO omitir try/catch en Server Actions
- NO user_id del cliente (siempre auth.getUser() en servidor)
- NO SELECT * en queries
- NO omitir revalidatePath() después de mutaciones
- SIEMPRE mobile first (base = móvil, luego md: lg:)
- SIEMPRE respetar la paleta beige/marrón del diseño

---

## 🗄️ BASE DE DATOS (referencia rápida)

### Tablas disponibles:
- `profiles` → usuarios (id, email, full_name, role, status)
- `habits` → hábitos (name, type, color, is_active)
- `habit_logs` → registro diario (habit_id, date, completed, metric_value)
- `projects` → proyectos (name, status, type, deadline)
- `project_tasks` → tareas de proyectos (title, completed, priority)
- `work_items` → tareas de trabajo (title, status, hours_worked, date)
- `transactions` → finanzas (type, amount, category, date)
- `workouts` → entrenamientos (date, type, duration_minutes)
- `objectives` → objetivos (title, progress_manual, status, deadline)
- `ro_dates` → fechas importantes (name, date, is_recurring)
- `global_todos` → todos globales (title, completed, priority)
- `audit_logs` → logs de auditoría (solo admin)

### Credenciales Supabase:
- URL: https://oiaohhltfctxwjqzwcxk.supabase.co
- Variables en: .env.local (ya configurado)

---

## 🎯 OBJETIVO FINAL DE ESTA SESIÓN

Al terminar estas tareas, el usuario debe poder:
1. Registrarse → ver pantalla "pendiente"
2. Admin aprueba → usuario entra al dashboard
3. Dashboard muestra: hábitos del día, cards de módulos, bottom nav
4. Todo con el diseño beige/marrón de la referencia visual

---

*Second Brain v2 — Next.js 15 + Supabase + Tailwind CSS + TypeScript 5*
*Diseño: Mobile First — Tema Beige/Marrón typewriter*
