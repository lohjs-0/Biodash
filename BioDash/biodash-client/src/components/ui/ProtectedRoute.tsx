import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return () => unsub()
  }, [])

  if (!hydrated) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
