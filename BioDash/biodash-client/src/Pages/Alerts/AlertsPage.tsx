import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'

interface Alert {
  id: number
  tankId: number
  tankName: string
  parameter: 'temperature' | 'ph' | 'level'
  value: number
  minValue: number
  maxValue: number
  triggeredAt: string
  resolved: boolean
  resolvedAt: string | null
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5071/api'

const PARAM_LABELS: Record<Alert['parameter'], string> = {
  temperature: 'Temperatura',
  ph: 'pH',
  level: 'Nível',
}

const PARAM_UNITS: Record<Alert['parameter'], string> = {
  temperature: '°C',
  ph: '',
  level: '%',
}

function IconThermometer({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}
function IconFlask({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M9 3v8l-4 9h14L15 11V3" /><path d="M7.5 15h9" />
    </svg>
  )
}
function IconDroplet({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}
function IconBell({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function IconAlertCircle({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
function IconCheckCircle({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function IconCalendar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconSearch({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconWarning({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function IconBellOff({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" /><path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

const PARAM_ICONS = { temperature: IconThermometer, ph: IconFlask, level: IconDroplet }

type FilterType = 'all' | 'active' | 'resolved'
type ParamFilter = 'all' | Alert['parameter']

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function AlertRow({ alert }: { alert: Alert }) {
  const isHigh = alert.value > alert.maxValue
  const ParamIcon = PARAM_ICONS[alert.parameter]

  return (
    <div className={`bg-gray-900 border rounded-xl p-3 sm:p-4 transition-all duration-150 hover:border-gray-700 ${!alert.resolved ? 'border-red-500/25' : 'border-gray-800/80'
      }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${!alert.resolved
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-gray-800 border border-gray-700 text-gray-400'
          }`}>
          <ParamIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{alert.tankName}</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-xs text-gray-400">{PARAM_LABELS[alert.parameter]}</span>
            {!alert.resolved ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                Ativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20">
                <IconCheckCircle className="w-3 h-3" /> Resolvido
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-sm font-semibold ${!alert.resolved ? 'text-red-300' : 'text-gray-300'}`}>
              {isHigh ? '↑' : '↓'} {alert.value.toFixed(1)}{PARAM_UNITS[alert.parameter]}
            </span>
            <span className="text-xs text-gray-600 hidden sm:inline">
              {isHigh ? 'Acima do limite' : 'Abaixo do limite'}
              {' '}({alert.minValue}{PARAM_UNITS[alert.parameter]} – {alert.maxValue}{PARAM_UNITS[alert.parameter]})
            </span>
            <span className="text-xs text-gray-600 sm:hidden">
              lim: {alert.minValue}–{alert.maxValue}{PARAM_UNITS[alert.parameter]}
            </span>
          </div>

          <div className="mt-1.5 text-[11px] text-gray-600">
            {formatDate(alert.triggeredAt)}
            {alert.resolvedAt && (
              <span className="hidden sm:inline"> · Resolvido: {formatDate(alert.resolvedAt)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const PAGE_SIZE = 15

export default function AlertsPage() {
  const { token } = useAuthStore()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<FilterType>('all')
  const [paramFilter, setParamFilter] = useState<ParamFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/alerts`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (!res.ok) throw new Error('Falha ao carregar alertas'); return res.json() })
      .then(setAlerts)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro desconhecido'))
      .finally(() => setLoading(false))
  }, [token])

  // --- Handlers que resetam a página junto com o filtro ---
  const handleStatusFilter = (value: FilterType) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleParamFilter = (value: ParamFilter) => {
    setParamFilter(value)
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setParamFilter('all')
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = [...alerts]
    if (statusFilter === 'active') list = list.filter((a) => !a.resolved)
    if (statusFilter === 'resolved') list = list.filter((a) => a.resolved)
    if (paramFilter !== 'all') list = list.filter((a) => a.parameter === paramFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.tankName.toLowerCase().includes(q))
    }
    return list.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
  }, [alerts, statusFilter, paramFilter, search])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const stats = useMemo(() => ({
    total: alerts.length,
    active: alerts.filter((a) => !a.resolved).length,
    resolved: alerts.filter((a) => a.resolved).length,
    today: alerts.filter((a) => new Date(a.triggeredAt).toDateString() === new Date().toDateString()).length,
  }), [alerts])

  const statCards = [
    { label: 'Total', value: stats.total, Icon: IconBell, color: 'text-gray-200', iconColor: 'text-gray-400' },
    { label: 'Ativos', value: stats.active, Icon: IconAlertCircle, color: 'text-red-300', iconColor: 'text-red-400' },
    { label: 'Resolvidos', value: stats.resolved, Icon: IconCheckCircle, color: 'text-teal-300', iconColor: 'text-teal-400' },
    { label: 'Hoje', value: stats.today, Icon: IconCalendar, color: 'text-yellow-300', iconColor: 'text-yellow-400' },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Alertas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Histórico de todos os alertas disparados no sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {statCards.map(({ label, value, Icon, color, iconColor }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
              <span className="text-[11px] text-gray-500">{label}</span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por tanque..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-shrink-0">
            {(['all', 'active', 'resolved'] as FilterType[]).map((key) => (
              <button
                key={key}
                onClick={() => handleStatusFilter(key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${statusFilter === key
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {key === 'all' ? 'Todos' : key === 'active' ? 'Ativos' : 'Resolvidos'}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-shrink-0">
            {([
              { key: 'all' as ParamFilter, label: 'Todos', Icon: null },
              { key: 'temperature' as ParamFilter, label: 'Temp', Icon: IconThermometer },
              { key: 'ph' as ParamFilter, label: 'pH', Icon: IconFlask },
              { key: 'level' as ParamFilter, label: 'Nível', Icon: IconDroplet },
            ]).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => handleParamFilter(key)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${paramFilter === key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-800 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconWarning className="w-8 h-8 text-yellow-500" />
          <p className="text-gray-400 text-sm text-center">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <IconBellOff className="w-10 h-10 text-gray-600" />
          <p className="text-gray-400 text-sm">Nenhum alerta encontrado</p>
          {(search || statusFilter !== 'all' || paramFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-teal-400 hover:underline cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-600">
            {filtered.length} alerta{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {paginated.map((alert) => <AlertRow key={alert.id} alert={alert} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                ← Anterior
              </button>
              <span className="text-xs text-gray-500">Página {page} de {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}