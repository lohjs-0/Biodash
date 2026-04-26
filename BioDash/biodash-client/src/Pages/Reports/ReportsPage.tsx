import { useEffect, useState, useMemo, useRef } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useTankStore } from '../../store/tankStore'
import type { Tank, Reading } from '../../types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5071/api'

type Period = '1h' | '6h' | '24h' | '7d'

const PERIOD_LABELS: Record<Period, string> = {
  '1h': '1h',
  '6h': '6h',
  '24h': '24h',
  '7d': '7 dias',
}

function formatTime(iso: string, period: Period) {
  const d = new Date(iso)
  if (period === '7d') return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid #1f2937',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '11px',
  color: '#d1d5db',
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

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
      <path d="M9 3h6" />
      <path d="M10 3v6l-4.5 9A1 1 0 0 0 6.5 20h11a1 1 0 0 0 .89-1.45L14 9V3" />
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

function IconAlertCircle({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function IconDownload({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconBarChart({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconTrendingUp({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, icon, sub }: {
  label: string
  value: string | number
  unit?: string
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[10px] sm:text-[11px] text-gray-500 leading-tight">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">
        {value}{unit && <span className="text-sm sm:text-base font-normal text-gray-500 ml-0.5">{unit}</span>}
      </p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5 hidden sm:block">{sub}</p>}
    </div>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CSVRow {
  tanque: string | number
  data_hora: string
  temperatura: number
  ph: number
  nivel: number
}

async function fetchReadingsForTanks(
  ids: number[],
  period: Period,
  token: string,
): Promise<Record<number, Reading[]>> {
  const results: Record<number, Reading[]> = {}
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`${API_URL}/tanks/${id}/readings?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) results[id] = (await res.json()) as Reading[]
      } catch {
        // skip failed reads silently
      }
    }),
  )
  return results
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { token } = useAuthStore()
  const { tanks, setTanks } = useTankStore()
  const [readings, setReadings] = useState<Record<number, Reading[]>>({})
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('24h')

  const [selectedTankIds, setSelectedTankIds] = useState<number[]>(() =>
    tanks.slice(0, 4).map((t) => t.id),
  )

  const didFetchTanks = useRef(false)

  useEffect(() => {
    if (tanks.length > 0 || didFetchTanks.current || !token) return
    didFetchTanks.current = true

    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/tanks`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await res.json()) as Tank[]
        setTanks(data)
        setSelectedTankIds(data.slice(0, 4).map((t) => t.id))
      } catch {
        setLoading(false)
      }
    }

    run()
  }, [token, tanks.length, setTanks])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    const run = async () => {
      if (selectedTankIds.length === 0) {
        setLoading(false)
        return
      }

      setLoading(true)
      const results = await fetchReadingsForTanks(selectedTankIds, period, token)

      if (!cancelled) {
        setReadings(results)
        setLoading(false)
      }
    }

    run()

    return () => { cancelled = true }
  }, [token, selectedTankIds, period])

  const chartData = useMemo(() => {
    const allReadings = selectedTankIds.flatMap((id) =>
      (readings[id] ?? []).map((r) => ({ ...r, tankId: id })),
    )
    if (allReadings.length === 0) return []

    const buckets: Record<string, { temperature: number[]; ph: number[]; level: number[] }> = {}
    allReadings.forEach((r) => {
      const d = new Date(r.recordedAt)
      let key: string
      if (period === '7d') {
        key = d.toISOString().slice(0, 10)
      } else if (period === '24h') {
        d.setMinutes(Math.floor(d.getMinutes() / 30) * 30, 0, 0)
        key = d.toISOString()
      } else {
        d.setMinutes(Math.floor(d.getMinutes() / 5) * 5, 0, 0)
        key = d.toISOString()
      }
      if (!buckets[key]) buckets[key] = { temperature: [], ph: [], level: [] }
      buckets[key].temperature.push(r.temperature)
      buckets[key].ph.push(r.ph)
      buckets[key].level.push(r.level)
    })

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        time: formatTime(key, period),
        temperature: parseFloat((vals.temperature.reduce((a, b) => a + b, 0) / vals.temperature.length).toFixed(2)),
        ph: parseFloat((vals.ph.reduce((a, b) => a + b, 0) / vals.ph.length).toFixed(2)),
        level: parseFloat((vals.level.reduce((a, b) => a + b, 0) / vals.level.length).toFixed(1)),
      }))
  }, [readings, selectedTankIds, period])

  const tankAverages = useMemo(() =>
    tanks
      .filter((t) => selectedTankIds.includes(t.id))
      .map((t) => ({
        name: t.name.length > 8 ? t.name.slice(0, 8) + '…' : t.name,
        temperature: t.currentTemperature,
        ph: t.currentPh,
        level: t.currentLevel,
      })),
    [tanks, selectedTankIds],
  )

  const stats = useMemo(() => {
    const selected = tanks.filter((t) => selectedTankIds.includes(t.id))
    if (selected.length === 0) return null
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
    return {
      avgTemp: avg(selected.map((t) => t.currentTemperature)).toFixed(1),
      avgPh: avg(selected.map((t) => t.currentPh)).toFixed(2),
      avgLevel: avg(selected.map((t) => t.currentLevel)).toFixed(1),
      alertCount: selected.filter((t) => t.alertActive).length,
    }
  }, [tanks, selectedTankIds])

  function toggleTank(id: number) {
    setSelectedTankIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function exportCSV() {
    const rows: CSVRow[] = selectedTankIds.flatMap((id) =>
      (readings[id] ?? []).map((r) => ({
        tanque: tanks.find((t) => t.id === id)?.name ?? id,
        data_hora: r.recordedAt,
        temperatura: r.temperature,
        ph: r.ph,
        nivel: r.level,
      })),
    )
    if (rows.length === 0) return

    const headers: (keyof CSVRow)[] = ['tanque', 'data_hora', 'temperatura', 'ph', 'nivel']
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => String(r[h])).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biodash-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white">Relatórios</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
            Análise agregada de todos os tanques selecionados
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600/15 border border-teal-500/25 text-teal-300 rounded-xl text-xs sm:text-sm font-medium hover:bg-teal-600/25 transition-all cursor-pointer flex-shrink-0"
        >
          <IconDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Exportar </span>CSV
        </button>
      </div>

      {/* Tank selector + period — empilhados em mobile, lado a lado em lg */}
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">

        {/* Tanques */}
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Tanques</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tanks.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTank(t.id)}
                className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border ${
                  selectedTankIds.includes(t.id)
                    ? 'bg-teal-600/20 text-teal-300 border-teal-500/25'
                    : 'text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                {t.name}
              </button>
            ))}
            {tanks.length === 0 && (
              <span className="text-xs text-gray-600">Carregando tanques...</span>
            )}
          </div>
        </div>

        {/* Período — scroll horizontal em mobile */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Período</p>
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  period === p
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats — 2 colunas em mobile, 4 em sm+ */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard label="Temp. média"    value={stats.avgTemp}    unit="°C" icon={<IconThermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} sub="Tanques selecionados" />
          <StatCard label="pH médio"       value={stats.avgPh}            icon={<IconFlask       className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} sub="Tanques selecionados" />
          <StatCard label="Nível médio"    value={stats.avgLevel}   unit="%" icon={<IconDroplet    className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} sub="Tanques selecionados" />
          <StatCard label="Alertas ativos" value={stats.alertCount}        icon={<IconAlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} sub="Nos selecionados"     />
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-48 sm:h-60" />
          ))}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
          <IconTrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
          <p className="text-gray-400 text-sm text-center">Sem dados para o período selecionado</p>
          <p className="text-xs text-gray-600 text-center">Selecione tanques e um período para ver os gráficos</p>
        </div>
      ) : (
        <>
          {/* Temperatura */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
            <h2 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">
              <IconThermometer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              Temperatura (°C)
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* pH */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
            <h2 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">
              <IconFlask className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" />
              pH ao longo do tempo
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="ph" stroke="#14b8a6" strokeWidth={2} dot={false} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Nível */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
            <h2 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">
              <IconDroplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              Nível (%)
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={2} dot={false} name="Nível (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparativo por tanque */}
          {tankAverages.length > 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5">
              <h2 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 mb-3 sm:mb-4">
                <IconBarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                Comparativo por tanque
              </h2>
              {/* Scroll horizontal para o gráfico de barras em telas muito pequenas */}
              <div className="overflow-x-auto">
                <div style={{ minWidth: Math.max(tankAverages.length * 80, 280) }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={tankAverages} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                      <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                      <Legend
                        wrapperStyle={{ fontSize: '10px', color: '#9ca3af', paddingTop: '8px' }}
                        iconSize={8}
                      />
                      <Bar dataKey="temperature" name="Temp (°C)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="ph"          name="pH"        fill="#14b8a6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="level"       name="Nível (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}