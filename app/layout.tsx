import './globals.css'
import type { Metadata } from 'next'
import AppAuthWrapper from '@/components/AppAuthWrapper'

export const metadata: Metadata = {
  title: 'Cowboy Band Manager',
  description: 'Band booking management for The Cowboy Saloon',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppAuthWrapper>
          {children}
        </AppAuthWrapper>
      </body>
    </html>
  )
}
