'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

type PageRevealProps = {
  children: ReactNode
  duration?: number
  stagger?: number
  triggerKey?: string | number
}

export function PageReveal({ children, duration = 0.8, stagger = 0.08, triggerKey }: PageRevealProps) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!scopeRef.current) return

    const ctx = gsap.context(() => {
      const targets = scopeRef.current ? Array.from(scopeRef.current.children) : []
      if (targets.length === 0) return

      gsap.fromTo(
        targets,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          ease: 'power3.out',
        }
      )
    }, scopeRef)

    return () => ctx.revert()
  }, [duration, stagger, triggerKey])

  return (
    <div ref={scopeRef} className="space-y-0">
      {children}
    </div>
  )
}


