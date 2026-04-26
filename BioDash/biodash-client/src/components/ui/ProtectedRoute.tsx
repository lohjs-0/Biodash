import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'

export default function ProtectedRoute() {
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  )

  useEffect(() => {
    if (hydrated) return
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    return () => unsub()
  }, [hydrated])

  const token = useAuthStore.getState().token

  if (!hydrated) return null

  return token ? <Outlet /> : <Navigate to="/login" replace />
}
