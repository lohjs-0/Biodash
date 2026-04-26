import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTankStore } from '../../store/tankStore'
import { useAuthStore } from '../../store/authStore'
import type { Tank } from '../../types'

type StatusFilter = 'all' | 'online' | 'offline' | 'alert'
type SortField = 'name' | 'temperature' | 'ph' | 'level'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5071/api'

function StatusBadge({ tank }: { tank: Tank }) {
  if (tank.alertActive)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
        Alerta
      </span>
    )
  if (tank.isOnline)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/20 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
        Online
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-700/50 text-gray-500 border border-gray-700 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
      Offline
    </span>
  )
}

function MetricPill({ label, value, unit, warn }: { label: string; value: number; unit: string; warn?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-lg flex-1 ${warn ? 'bg-red-500/10 border border-red-500/20' : 'bg-gray-800/60 border border-gray-700/50'}`}>
      <span className={`text-xs font-semibold ${warn ? 'text-red-300' : 'text-gray-200'}`}>
        {value.toFixed(1)}{unit}
      </span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
}

function TankCard({ tank }: { tank: Tank }) {
  const navigate = useNavigate()
  const tempWarn  = tank.currentTemperature > 35 || tank.currentTemperature < 15
  const phWarn    = tank.currentPh > 8.5 || tank.currentPh < 6.0
  const levelWarn = tank.currentLevel < 20

  return (
    <div
      onClick={() => navigate(`/tanks/${tank.id}`)}
      className={`group relative bg-gray-900 border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:border-teal-500/30 hover:bg-gray-900/80 active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${
        tank.alertActive ? 'border-red-500/30' : 'border-gray-800/80'
      }`}
    >
      {tank.alertActive && (
        <div className="absolute top-3 right-3">
          <span className="text-red-400 text-base animate-pulse">⚠️</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3 pr-6 gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
            {tank.name}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{tank.description || 'Sem descrição'}</p>
        </div>
        <StatusBadge tank={tank} />
      </div>

      {/* Métricas — ocupam toda a largura igualmente */}
      <div className="flex gap-1.5 sm:gap-2 mt-3">
        <MetricPill label="Temp"  value={tank.currentTemperature} unit="°C" warn={tempWarn}  />
        <MetricPill label="pH"    value={tank.currentPh}          unit=""   warn={phWarn}    />
        <MetricPill label="Nível" value={tank.currentLevel}       unit="%"  warn={levelWarn} />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center justify-between">
        <span className="text-[10px] text-gray-600">{tank.volumeLiters}L total</span>
        <span className="text-[10px] text-teal-500 group-hover:text-teal-300 transition-colors">Ver detalhes →</span>
      </div>
    </div>
  )
}

export default function TanksPage() {
  const { tanks, setTanks } = useTankStore()
  const { token } = useAuthStore()
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField]       = useState<SortField>('name')
  const [sortAsc, setSortAsc]           = useState(true)

  useEffect(() => {
    async function fetchTanks() {
      try {
        const res = await fetch(`${API_URL}/tanks`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Falha ao carregar tanques')
        const data: Tank[] = await res.json()
        setTanks(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchTanks()
  }, [token, setTanks])

  const filtered = useMemo(() => {
    let list = [...tanks]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q),
      )
    }

    if (statusFilter === 'online')  list = list.filter((t) => t.isOnline && !t.alertActive)
    if (statusFilter === 'offline') list = list.filter((t) => !t.isOnline)
    if (statusFilter === 'alert')   list = list.filter((t) => t.alertActive)

    list.sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortField === 'name')        { av = a.name;                bv = b.name }
      else if (sortField === 'temperature') { av = a.currentTemperature; bv = b.currentTemperature }
      else if (sortField === 'ph')     { av = a.currentPh;           bv = b.currentPh }
      else                             { av = a.currentLevel;        bv = b.currentLevel }

      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      return sortAsc ? av - (bv as number) : (bv as number) - av
    })

    return list
  }, [tanks, search, statusFilter, sortField, sortAsc])

  const counts = useMemo(() => ({
    all:     tanks.length,
    online:  tanks.filter((t) => t.isOnline && !t.alertActive).length,
    offline: tanks.filter((t) => !t.isOnline).length,
    alert:   tanks.filter((t) => t.alertActive).length,
  }), [tanks])

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortAsc ? ' ↑' : ' ↓') : ''

  // Labels curtos para mobile
  const statusLabels: Record<StatusFilter, string> = {
    all:     `Todos (${counts.all})`,
    online:  `Online (${counts.online})`,
    offline: `Offline (${counts.offline})`,
    alert:   `Alertas (${counts.alert})`,
  }

  const sortLabels: Record<SortField, string> = {
    name:        'Nome',
    temperature: 'Temp',
    ph:          'pH',
    level:       'Nível',
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Tanques</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
          Gerencie e monitore todos os seus tanques biológicos
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-2 sm:gap-3">

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar tanque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        {/* Status filter + Sort — scroll horizontal em mobile, lado a lado */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">

          {/* Status filter */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-shrink-0">
            {(['all', 'online', 'offline', 'alert'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  statusFilter === f
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {statusLabels[f]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-shrink-0">
            {(['name', 'temperature', 'ph', 'level'] as SortField[]).map((f) => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  sortField === f ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {sortLabels[f]}{sortIcon(f)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2 mb-4" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-10 bg-gray-800 rounded-lg flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
          <span className="text-3xl">⚠️</span>
          <p className="text-gray-400 text-sm text-center">{error}</p>
          <button onClick={() => window.location.reload()} className="text-xs text-teal-400 hover:underline cursor-pointer">
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
          <span className="text-4xl">🧪</span>
          <p className="text-gray-400 text-sm">Nenhum tanque encontrado</p>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs text-teal-400 hover:underline cursor-pointer">
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-600">
            {filtered.length} tanque{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((tank) => (
              <TankCard key={tank.id} tank={tank} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}