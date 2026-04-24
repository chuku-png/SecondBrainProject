# 🧠 Second Brain v2 — Setup Guide

## 1️⃣ Setup de Supabase (2 minutos)

### Paso 1: Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Sign Up con tu email **secondbrain.admin@gmail.com**
3. Confirmar email
4. Click en "New Project"
5. Elegir:
   - **Project name**: `second-brain`
   - **Database password**: Tu password segura
   - **Region**: `South America (São Paulo)` ← Más cercano a Argentina
6. Esperar 2-3 minutos a que se cree

### Paso 2: Obtener credenciales

Una vez creado el proyecto:
1. Ir a **Settings** (abajo a la izquierda)
2. Click en **API**
3. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 3: Crear .env.local

En la raíz del proyecto, crear archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 2️⃣ Ejecutar SQL en Supabase

- Ir a SQL Editor
- Copiar TODO el SQL del documento
- Ejecutar en orden: Extensiones → Tablas → Triggers → RLS

## 3️⃣ Instalar y ejecutar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)
