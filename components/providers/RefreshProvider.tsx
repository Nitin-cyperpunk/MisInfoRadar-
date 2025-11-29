'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type RefreshContextValue = {
  refreshToken: number
  triggerRefresh: () => void
}

const RefreshContext = createContext<RefreshContextValue | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshToken, setRefreshToken] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshToken((token) => token + 1)
  }, [])

  const value = useMemo<RefreshContextValue>(
    () => ({
      refreshToken,
      triggerRefresh,
    }),
    [refreshToken, triggerRefresh]
  )

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
}

export function useRefresh() {
  const context = useContext(RefreshContext)
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider')
  }
  return context
}


