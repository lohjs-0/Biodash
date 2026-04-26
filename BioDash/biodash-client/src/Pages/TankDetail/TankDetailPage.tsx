import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { tanksApi } from '../../api/tanks'
import { useTankStore } from '../../store/tankStore'
import { joinTank, leaveTank, onNewReading, offNewReading, startConnection } from '../../services/Signalrservice'
import type { Reading, AlertRule, Tank } from '../../types'

const tooltipStyle = {
  backgroundColor: '#111827', border: '1px solid #1f2937',
  borderRadius: '8px', color: '#f9fafb', fontSize: '12px',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function StatBadge({ label, value, unit, color, alert }: {
  label: string; value: string | number; unit?: string
  color: 'teal' | 'blue' | 'yellow' | 'red'; alert?: boolean
}) {
  const colors = {
    teal:   'text-teal-400 bg-teal-500/10 border-teal-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red:    'text-red-400 bg-red-500/10 border-red-500/30',
  }
  return (
    <div className={`rounded-2xl border p-3 sm:p-4 flex flex-col gap-1 transition-all duration-300 ${alert ? colors.red : colors[color]}`}>
      <p className="text-[10px] sm:text-xs opacity-70 uppercase tracking-wider font-medium">{label}</p>
      <p className="text-xl sm:text-2xl font-bold tabular-nums">
        {value}{unit && <span className="text-xs sm:text-sm font-normal ml-1 opacity-60">{unit}</span>}
      </p>
      {alert && <p className="text-[10px] text-red-400 font-medium">⚠ Fora do limite</p>}
    </div>
  )
}

const PARAM_LABELS: Record<string, string> = { temperature: 'Temperatura', ph: 'pH', level: 'Nível' }

export default function TankDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tankId = Number(id)

  const tanks = useTankStore((s) => s.tanks)
  const updateTank = useTankStore((s) => s.updateTank)
  const tank = tanks.find((t) => t.id === tankId) as Tank | undefined

  const [readings, setReadings] = useState<Reading[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [loadingReadings, setLoadingReadings] = useState(true)
  const [hours, setHours] = useState(24)
  const [liveReading, setLiveReading] = useState<Reading | null>(null)
  const [connected, setConnected] = useState(false)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [ruleParam, setRuleParam] = useState<'temperature' | 'ph' | 'level'>('temperature')
  const [ruleMin, setRuleMin] = useState('')
  const [ruleMax, setRuleMax] = useState('')
  const [savingRule, setSavingRule] = useState(false)
  const handlerRef = useRef<((r: Reading) => void) | null>(null)

  useEffect(() => {
    if (!tankId) return
    setLoadingReadings(true)
    Promise.all([tanksApi.getReadings(tankId, hours), tanksApi.getAlertRules(tankId)])
      .then(([r, rules]) => { setReadings(r); setAlertRules(rules) })
      .catch(console.error).finally(() => setLoadingReadings(false))
  }, [tankId, hours])

  useEffect(() => {
    if (!tankId) return
    const handler = (reading: Reading) => {
      if (reading.tankId !== tankId) return
      setLiveReading(reading)
      setReadings((prev) => [...prev.slice(-287), reading])
    }
    handlerRef.current = handler
    onNewReading(handler)
    startConnection().then(() => joinTank(tankId)).then(() => setConnected(true)).catch(console.error)
    return () => {
      if (handlerRef.current) offNewReading(handlerRef.current)
      leaveTank(tankId).catch(console.error)
      setConnected(false)
    }
  }, [tankId])

  async function handleCreateRule(e: React.FormEvent) {
    e.preventDefault(); setSavingRule(true)
    try {
      const rule = await tanksApi.createAlertRule(tankId, { parameter: ruleParam, minValue: Number(ruleMin), maxValue: Number(ruleMax) })
      setAlertRules((prev) => [...prev, rule])
      setShowRuleForm(false); setRuleMin(''); setRuleMax('')
    } catch (err) { console.error(err) } finally { setSavingRule(false) }
  }

  async function handleDeleteRule(ruleId: number) {
    try { await tanksApi.deleteAlertRule(tankId, ruleId); setAlertRules((prev) => prev.filter((r) => r.id !== ruleId)) }
    catch (err) { console.error(err) }
  }

  async function handleToggle() {
    try { await tanksApi.toggleOnline(tankId); const u = await tanksApi.getById(tankId); if (u) updateTank(u) }
    catch (err) { console.error(err) }
  }

  const chartData = readings.map((r) => ({
    time: formatTime(r.recordedAt),
    temperature: +r.temperature.toFixed(2),
    ph: +r.ph.toFixed(2),
    level: +r.level.toFixed(1),
  }))

  const tempRule   = alertRules.find((r) => r.parameter === 'temperature')
  const phRule     = alertRules.find((r) => r.parameter === 'ph')
  const levelRule  = alertRules.find((r) => r.parameter === 'level')
  const current    = liveReading ?? (readings.length > 0 ? readings[readings.length - 1] : null)
  const tempAlert  = current && tempRule  ? current.temperature < tempRule.minValue  || current.temperature > tempRule.maxValue  : false
  const phAlert    = current && phRule    ? current.ph < phRule.minValue             || current.ph > phRule.maxValue             : false
  const levelAlert = current && levelRule ? current.level < levelRule.minValue       || current.level > levelRule.maxValue       : false

  if (!tank) return <div className="flex items-center justify-center h-64 text-gray-500">Tanque não encontrado.</div>

  const periodLabel = hours === 168 ? '7d' : `${hours}h`

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-[fadeIn_0.3s_ease]">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-white transition-colors text-sm cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-800 flex-shrink-0 mt-0.5"
          >
            ← Voltar
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{tank.name}</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5 truncate">{tank.description}</p>
          </div>
        </div>

        {/* Status badges + toggle — scroll horizontal em mobile */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 flex-shrink-0">
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border whitespace-nowrap flex-shrink-0 ${connected ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-gray-500 bg-gray-800 border-gray-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${connected ? 'bg-teal-400 animate-pulse' : 'bg-gray-600'}`} />
            {connected ? 'Ao vivo' : 'Conectando...'}
          </span>
          <span className={`flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border whitespace-nowrap flex-shrink-0 ${tank.isOnline ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-gray-500 bg-gray-800 border-gray-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tank.isOnline ? 'bg-teal-400 animate-pulse' : 'bg-gray-600'}`} />
            {tank.isOnline ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={handleToggle}
            className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            {tank.isOnline ? 'Pausar' : 'Ativar'}
          </button>
        </div>
      </div>

      {/* Stats — 2 colunas em mobile, 4 em lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatBadge label="Temperatura" value={current ? current.temperature.toFixed(1) : '—'} unit="°C" color="yellow" alert={tempAlert} />
        <StatBadge label="pH"          value={current ? current.ph.toFixed(2) : '—'}            color="blue"   alert={phAlert}    />
        <StatBadge label="Nível"       value={current ? current.level.toFixed(1) : '—'}  unit="%" color="teal"   alert={levelAlert} />
        <StatBadge label="Volume"      value={tank.volumeLiters.toFixed(0)}               unit="L" color="teal"   />
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">Período:</span>
        {[6, 24, 48, 168].map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${hours === h ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'}`}
          >
            {h === 168 ? '7d' : `${h}h`}
          </button>
        ))}
      </div>

      {/* Charts */}
      {loadingReadings ? (
        <div className="flex items-center justify-center h-40 sm:h-48 gap-3 text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-sm">Carregando leituras...</span>
        </div>
      ) : readings.length === 0 ? (
        <div className="flex items-center justify-center h-40 sm:h-48 text-gray-600 text-sm">
          Nenhuma leitura para este período.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            { key: 'temperature', label: 'Temperatura', sub: `°C — últimas ${periodLabel}`, stroke: '#fbbf24', rule: tempRule,  domain: ['auto', 'auto'] as [string, string] },
            { key: 'ph',          label: 'pH',          sub: `Potencial hidrogeniônico — últimas ${periodLabel}`, stroke: '#60a5fa', rule: phRule,    domain: [0, 14] as [number, number] },
            { key: 'level',       label: 'Nível',       sub: `% de capacidade — últimas ${periodLabel}`,          stroke: '#34d399', rule: levelRule, domain: [0, 100] as [number, number] },
          ].map(({ key, label, sub, stroke, rule, domain }) => (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 sm:p-5">
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">{label}</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 truncate">{sub}</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} domain={domain} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {rule && <ReferenceLine y={rule.minValue} stroke="#ef4444" strokeDasharray="4 4" />}
                  {rule && <ReferenceLine y={rule.maxValue} stroke="#ef4444" strokeDasharray="4 4" />}
                  <Line type="monotone" dataKey={key} stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Alert Rules */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-white">Regras de alerta</h2>
            <p className="text-xs text-gray-500 mt-0.5">Limites mínimos e máximos por parâmetro</p>
          </div>
          <button
            onClick={() => setShowRuleForm((v) => !v)}
            className="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            + Nova regra
          </button>
        </div>

        {/* Rule form — empilhado em mobile */}
        {showRuleForm && (
          <form onSubmit={handleCreateRule} className="bg-gray-800 rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Parâmetro</label>
              <select
                value={ruleParam}
                onChange={(e) => setRuleParam(e.target.value as 'temperature' | 'ph' | 'level')}
                className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 cursor-pointer w-full"
              >
                <option value="temperature">Temperatura</option>
                <option value="ph">pH</option>
                <option value="level">Nível</option>
              </select>
            </div>
            <div className="flex gap-3 flex-1">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Mínimo</label>
                <input
                  type="number" step="0.1" required value={ruleMin}
                  onChange={(e) => setRuleMin(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 w-full"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">Máximo</label>
                <input
                  type="number" step="0.1" required value={ruleMax}
                  onChange={(e) => setRuleMax(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 w-full"
                  placeholder="100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRuleForm(false)}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingRule}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {savingRule
                  ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</>
                  : 'Salvar'
                }
              </button>
            </div>
          </form>
        )}

        {alertRules.length === 0 ? (
          <div className="flex items-center justify-center h-16 sm:h-20 text-gray-600 text-sm">
            Nenhuma regra configurada.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {alertRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-700/80 transition-colors gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-medium text-white w-20 sm:w-28 flex-shrink-0 truncate">
                    {PARAM_LABELS[rule.parameter] ?? rule.parameter}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Mín: <span className="text-white font-medium">{rule.minValue}</span>
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    Máx: <span className="text-white font-medium">{rule.maxValue}</span>
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}