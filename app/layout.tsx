import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { LanguageProvider } from '@/hooks/use-language'

export const metadata: Metadata = {
  title: 'AquaNexis - Community Health Monitoring',
  description: 'Smart Community Health Monitoring & Early Warning System for Water-Borne Diseases in Rural Northeast India',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased mesh-bg min-h-screen bg-white">
        {/* Noise texture overlay for premium feel */}
        <div className="noise-overlay" aria-hidden="true" />
        <LanguageProvider>
          {children}
          <Toaster
            position="top-center"
            richColors
            theme="light"
            toastOptions={{
              style: {
                background: 'hsl(0 0% 100% / 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid hsl(220 15% 90% / 0.6)',
                color: 'hsl(220 25% 12%)',
              },
            }}
          />
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
