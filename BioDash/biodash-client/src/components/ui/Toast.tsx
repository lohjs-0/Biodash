import { useEffect, useState } from 'react'
import { setAddToastFn } from './toastService'

export type ToastType = 'success' | 'error' | 'warning'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
  visible: boolean
}

const styles = {
  success: { bar: 'bg-teal-500',   bg: 'bg-gray-900 border-teal-500/30',  icon: '✓', iconBg: 'bg-teal-500/15 text-teal-400' },
  error:   { bar: 'bg-red-500',    bg: 'bg-gray-900 border-red-500/30',   icon: '✕', iconBg: 'bg-red-500/15 text-red-400' },
  warning: { bar: 'bg-yellow-500', bg: 'bg-gray-900 border-yellow-500/30',icon: '⚠', iconBg: 'bg-yellow-500/15 text-yellow-400' },
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    setAddToastFn((message, type) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, type, visible: true }])
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => t.id === id ? { ...t, visible: false } : t))
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 300)
      }, 3200)
    })
    return () => setAddToastFn(null)
  }, [])

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:w-auto flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => {
        const s = styles[t.type]
        return (
          <div
            key={t.id}
            className={`
              relative flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl border shadow-2xl shadow-black/40
              ${s.bg} pointer-events-auto w-full sm:w-auto
              transition-all duration-300
              ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
            style={{ minWidth: 260 }}
          >
            <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${s.iconBg}`}>
              {s.icon}
            </span>
            <span className="text-sm text-gray-200 font-medium">{t.message}</span>
            <div className={`absolute bottom-0 left-0 h-0.5 rounded-full ${s.bar} animate-[shrink_3.2s_linear_forwards]`} style={{ width: '100%' }} />
          </div>
        )
      })}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}