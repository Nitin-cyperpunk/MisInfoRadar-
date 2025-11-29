'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PageReveal } from './PageReveal'

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <PageReveal triggerKey={pathname}>
      {children}
    </PageReveal>
  )
}


