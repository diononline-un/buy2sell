import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Buy2Sell — Reselling Tracker',
  description: 'Self-hosted reselling tracker for managing hauls, items, and sales.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex md:shrink-0">
            <Sidebar />
          </div>

          {/* Main content */}
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile header */}
            <div className="flex h-14 items-center border-b border-white/10 glass px-4 md:hidden">
              <span className="text-lg font-bold text-indigo-400">Buy2Sell</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
