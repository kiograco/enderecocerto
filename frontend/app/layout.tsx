import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/auth-context'
import { QueryProvider } from '@/lib/query-provider'
import './globals.css'

export const metadata: Metadata = { title: 'EnderecoCerto — Seus endereços, sempre no lugar', description: 'Cadastre, organize e encontre seus endereços com simplicidade.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f8f7f2' }, { media: '(prefers-color-scheme: dark)', color: '#202b31' }] }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <Toaster position="top-right" richColors />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
