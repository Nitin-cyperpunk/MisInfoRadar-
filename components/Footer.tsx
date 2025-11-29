'use client'

import Link from 'next/link'
import { Github, Shield } from 'lucide-react'

export function Footer() {
  const links = [
    { label: 'Overview', href: '/' },
    { label: 'Live Monitor', href: '/live' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Sources', href: '/sources' },
  ]

  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="glass-panel gradient-border glow flex h-11 w-11 items-center justify-center rounded-2xl text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Autonomous Watchtower</p>
            <p className="text-lg font-semibold tracking-tight text-white">MisinfoRadar</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 transition hover:border-white/40 hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            View Code
          </a>
          <p>
            © {new Date().getFullYear()} MisinfoRadar · Team MahaDev · Built for MumbaiHacks
          </p>
        </div>
      </div>
    </footer>
  )
}


