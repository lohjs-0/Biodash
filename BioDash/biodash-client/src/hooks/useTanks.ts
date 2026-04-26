import { useEffect, useState } from 'react'
import { tanksApi } from '../api/tanks'
import { useTankStore } from '../store/tankStore'

export function useTanks() {
  const { tanks, setTanks } = useTankStore()
  const [loading, setLoading] = useState(tanks.length === 0)

  useEffect(() => {
    tanksApi.getAll()
      .then(setTanks)
      .catch(console.error)
      .finally(() => setLoading(false))

    const interval = setInterval(() => {
      tanksApi.getAll().then(setTanks).catch(console.error)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { tanks, loading }
}