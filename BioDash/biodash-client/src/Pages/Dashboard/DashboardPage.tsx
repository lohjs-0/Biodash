import { useState } from 'react'
import { useTanks } from '../../hooks/useTanks'
import StatCard from '../../components/ui/StatCard'
import TankCard from '../../components/tanks/TankCard'
import TankModal from '../../components/tanks/TankModal'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts'

function IconDroplet({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}
function IconLeaf({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}
function IconZap({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
function IconSprout({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 1 1.8 4.5c-2 0-3.5-.5-4.8-1.3" />
    </svg>
  )
}
function IconFuel({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="15" y2="22" /><line x1="4" y1="9" x2="14" y2="9" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </svg>
  )
}
function IconSun({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

const soilData = [
  { name: 'Ativ. Bio.',   antes: 45,  depois: 78  },
  { name: 'Div. Micro.',  antes: 38,  depois: 71  },
  { name: 'Mat. Org.',    antes: 3,   depois: 6   },
  { name: 'pH Solo',      antes: 6,   depois: 8   },
  { name: 'Nitrogênio',   antes: 120, depois: 195 },
]

const cycleData = [
  { hora: '0h', atividadeBiologica: 42, diversidadeMicrobiana: 36 },
  { hora: '2h', atividadeBiologica: 51, diversidadeMicrobiana: 44 },
  { hora: '4h', atividadeBiologica: 64, diversidadeMicrobiana: 58 },
  { hora: '6h', atividadeBiologica: 75, diversidadeMicrobiana: 69 },
  { hora: '8h', atividadeBiologica: 82, diversidadeMicrobiana: 76 },
]

const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
}

export default function DashboardPage() {
  const { tanks, loading } = useTanks()
  const [showModal, setShowModal] = useState(false)
  const [fertInput, setFertInput] = useState('0')

  const activeTanks  = tanks.filter((t) => t.isOnline).length
  const alertTanks   = tanks.filter((t) => t.alertActive)
  const fertEvitado  = parseFloat(fertInput || '0') * 0.3
  const co2Reduzido  = fertEvitado * 1.5
  const arvores      = (co2Reduzido / 21).toFixed(1)
  const combustivel  = (co2Reduzido * 0.43).toFixed(1)
  const energiaSolar = (co2Reduzido / 5.5).toFixed(1)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <img src="/logo-biodash.png" alt="BioDash logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">BioDash</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Monitoramento de tanques biológicos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Tanques ativos"       value={activeTanks}            unit=""   icon={<IconDroplet    className="w-4 h-4" />} color="teal"   />
        <StatCard label="Fertilizante evitado" value={fertEvitado.toFixed(1)} unit="kg" icon={<IconLeaf       className="w-4 h-4" />} color="blue"   />
        <StatCard label="Redução CO₂"          value={co2Reduzido.toFixed(1)} unit="kg" icon={<IconZap        className="w-4 h-4" />} color="yellow" />
        <StatCard label="Ciclos concluídos"    value={tanks.length}           unit=""   icon={<IconTrendingUp className="w-4 h-4" />} color="purple" />
      </div>

      {/* Tanques + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lista de tanques */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-medium text-white">Tanques</h2>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Gerenciar tanques de produção</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              + Novo tanque
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32 gap-3 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-teal-500 rounded-full animate-spin" />
              <span className="text-sm">Carregando tanques...</span>
            </div>
          ) : tanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-gray-600 text-sm">Nenhum tanque cadastrado</p>
              <p className="text-gray-700 text-xs">Clique em "Novo tanque" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tanks.map((tank) => <TankCard key={tank.id} tank={tank} />)}
            </div>
          )}
        </div>

        {/* Alertas */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <h2 className="text-base font-medium text-white">Alertas</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">
            {alertTanks.length} {alertTanks.length === 1 ? 'alerta ativo' : 'alertas ativos'}
          </p>

          {alertTanks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-1">
              <span className="text-teal-500 text-sm">Todos os parâmetros normais</span>
              <span className="text-gray-700 text-xs">Nenhum alerta ativo</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alertTanks.map((tank) => {
                const tempAlert = tank.currentTemperature > 35 || tank.currentTemperature < 10
                const phAlert   = tank.currentPh < 6 || tank.currentPh > 8.5
                const critical  = tempAlert && phAlert
                return (
                  <div key={tank.id} className={`rounded-xl p-3 border ${critical ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className={`text-sm font-medium truncate max-w-[120px] ${critical ? 'text-red-400' : 'text-yellow-400'}`}>
                        {tank.name}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${critical ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {critical ? 'Crítico' : 'Atenção'}
                        </span>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${critical ? 'bg-red-500' : 'bg-yellow-500'}`} />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {tempAlert && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          {tank.currentTemperature.toFixed(1)}°C
                        </span>
                      )}
                      {phAlert && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                          pH {tank.currentPh.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico barras + Calculadora */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico de barras */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <h2 className="text-base font-medium text-white">Saúde biológica do solo</h2>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">Comparativo antes e depois da aplicação</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={soilData} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="antes"  name="Antes"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="depois" name="Depois" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calculadora */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-base font-medium text-white">Calculadora de sustentabilidade</h2>
            <p className="text-xs text-gray-500 mt-0.5">Impacto ambiental positivo</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">Volume de biofertilizante (L)</label>
            <input
              type="number" min="0" value={fertInput}
              onChange={(e) => setFertInput(e.target.value)}
              inputMode="decimal"
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-base sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <IconLeaf className="w-3.5 h-3.5 text-teal-400" />
                <p className="text-xs text-teal-400">Fert. evitado</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-teal-400 mt-1 tabular-nums">{fertEvitado.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kg NPK</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <IconZap className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-xs text-blue-400">Redução CO₂</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-blue-400 mt-1 tabular-nums">{co2Reduzido.toFixed(1)}</p>
              <p className="text-xs text-gray-500">kg CO₂e</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-xs font-medium text-gray-300">Impacto equivalente</p>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-gray-500"><IconSprout className="w-3.5 h-3.5" /> Árvores</span>
              <span className="text-white tabular-nums">{arvores}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-gray-500"><IconFuel className="w-3.5 h-3.5" /> Combustível</span>
              <span className="text-white tabular-nums">{combustivel}L</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-gray-500"><IconSun className="w-3.5 h-3.5" /> Energia solar</span>
              <span className="text-white tabular-nums">{energiaSolar}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de linha */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
        <h2 className="text-base font-medium text-white mb-1">Evolução durante o ciclo de 8h</h2>
        <p className="text-xs text-gray-500 mb-4">Atividade biológica e diversidade microbiana</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={cycleData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hora" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
            <Line type="monotone" dataKey="atividadeBiologica"    name="Ativ. biológica"   stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="diversidadeMicrobiana" name="Div. microbiana"   stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-teal-400 font-medium">Melhoria média</p>
            <p className="text-2xl sm:text-3xl font-semibold text-teal-400 mt-1">+82%</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">em indicadores biológicos</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
            <p className="text-xs text-blue-400 font-medium">Eficiência</p>
            <p className="text-2xl sm:text-3xl font-semibold text-blue-400 mt-1">94%</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">de efetividade comprovada</p>
          </div>
        </div>

        <div className="mt-4 bg-gray-800 border border-gray-700 rounded-xl p-3">
          <p className="text-xs text-gray-400">
            <span className="text-white font-medium">Nota:</span> Dados agregados de ciclos recentes. Cada aplicação resulta em melhoria significativa da saúde biológica do solo.
          </p>
        </div>
      </div>

      {showModal && <TankModal onClose={() => setShowModal(false)} />}
    </div>
  )
}