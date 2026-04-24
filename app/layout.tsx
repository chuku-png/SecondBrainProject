import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Second Brain',
  description: 'Tu sistema operativo de vida',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-brand-bg text-brand-text antialiased font-mono">
        {children}
      </body>
    </html>
  )
}
