'use client'

import Link from 'next/link'
import { Shield, Activity, AlertTriangle, BarChart3, Rss, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RefreshProvider } from '@/components/providers/RefreshProvider'
import { Footer } from '@/components/Footer'
import { LaunchAgentsButton } from '@/components/dashboard/LaunchAgentsButton'
import { PageShell } from '@/components/animations/PageShell'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/live', label: 'Live Monitor', icon: Shield },
    { href: '/analysis', label: 'Analysis', icon: AlertTriangle },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/sources', label: 'Sources', icon: Rss },
  ]
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <RefreshProvider>
      <div className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="glass-panel gradient-border glow flex h-11 w-11 items-center justify-center rounded-2xl text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Autonomous Watchtower
                </p>
                <p className="text-xl font-semibold tracking-tight text-white">
                  MisinfoRadar
                </p>
              </div>
            </Link>
            <nav className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-lg lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                asChild
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/alerts" className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  Alerts
                </Link>
              </Button>
              <div className="hidden sm:flex">
                <LaunchAgentsButton />
              </div>
              <button
                type="button"
                className="rounded-2xl border border-white/15 p-2 text-white transition hover:border-white/40 lg:hidden sm:hidden"
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="border-t border-white/10 bg-black/80 px-4 py-6 lg:hidden">
              <div className="space-y-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Open</span>
                    </Link>
                  )
                })}
                <div className="sm:hidden">
                  <LaunchAgentsButton />
                </div>
              </div>
            </div>
          )}
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          <PageShell>{children}</PageShell>
        </main>
        <Footer />
      </div>
    </RefreshProvider>
  )
}

