import { useState, useMemo } from 'react'
import { useTankStore } from '../../store/tankStore'

// BFT / biofloc baseline assumptions (per 1000L tank per year)
const BASELINE = {
  co2KgPerYear: 2.4,
  fertilizerKgPerYear: 0.8,
  waterLitersSaved: 3500,
  energyKwhSaved: 45,
}

const CO2_EQUIV = {
  treeAbsorptionPerYear: 21,
  carKmPerKgCo2: 6.3,
  flightHoursPerTonCo2: 4.5,
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconLeaf({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function IconSettings({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconCheck({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconCloud({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  )
}

function IconSprout({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 1 1.8 4.5c-2 0-3.5-.5-4.8-1.3" />
    </svg>
  )
}

function IconDroplet({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
}

function IconZap({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function IconGlobe({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function IconTree({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14l-5-9-5 9h4v6h2v-6z" />
    </svg>
  )
}

function IconCar({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function IconPlane({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-1-5.5.5L10 6 1.8 4.2l-1.1 1.1 3 3.1-3 3-.1 1 4.5 1.5 1.5 4.5 1-.1 3-3 3.1 3 1.1-1.1z" />
    </svg>
  )
}

function IconAlertTriangle({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

// ── Components ─────────────────────────────────────────────────────────────────

function ResultCard({ label, value, unit, icon, detail }: {
  label: string; value: string; unit: string; icon: React.ReactNode; detail?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[10px] sm:text-xs text-gray-500 leading-snug">{label}</span>
      </div>
      <div>
        <span className="text-xl sm:text-2xl font-bold text-white">{value}</span>
        <span className="text-xs sm:text-sm text-gray-500 ml-1">{unit}</span>
      </div>
      {detail && <p className="text-[10px] text-gray-600 hidden sm:block">{detail}</p>}
    </div>
  )
}

function SliderInput({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs sm:text-sm text-gray-400 leading-snug">{label}</label>
        <span className="text-xs sm:text-sm font-semibold text-teal-300 whitespace-nowrap flex-shrink-0">
          {value.toLocaleString('pt-BR')} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-gray-800 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:cursor-pointer accent-teal-400"
      />
      <div className="flex justify-between text-[10px] text-gray-700">
        <span>{min.toLocaleString('pt-BR')} {unit}</span>
        <span>{max.toLocaleString('pt-BR')} {unit}</span>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SustainabilityPage() {
  const { tanks } = useTankStore()

  const [useTankData, setUseTankData] = useState(false)
  const [volumeLiters, setVolumeLiters] = useState(5000)
  const [tankCount, setTankCount] = useState(1)
  const [yearsActive, setYearsActive] = useState(1)

  const effectiveVolume = useMemo(() => {
    if (useTankData && tanks.length > 0) {
      return tanks.reduce((sum, t) => sum + t.volumeLiters, 0)
    }
    return volumeLiters * tankCount
  }, [useTankData, tanks, volumeLiters, tankCount])

  const effectiveTankCount = useTankData ? tanks.length : tankCount

  const results = useMemo(() => {
    const thousands = effectiveVolume / 1000
    const co2AvoidedTotal = BASELINE.co2KgPerYear * thousands * yearsActive
    const fertSaved = BASELINE.fertilizerKgPerYear * thousands * yearsActive
    const waterSaved = BASELINE.waterLitersSaved * thousands * yearsActive
    const energySaved = BASELINE.energyKwhSaved * thousands * yearsActive
    const treesEquiv = co2AvoidedTotal / CO2_EQUIV.treeAbsorptionPerYear
    const carKmEquiv = co2AvoidedTotal * CO2_EQUIV.carKmPerKgCo2
    return { co2AvoidedTotal, fertSaved, waterSaved, energySaved, treesEquiv, carKmEquiv }
  }, [effectiveVolume, yearsActive])

  const score = useMemo(() => {
    const raw = Math.min(100, (results.co2AvoidedTotal / 50) * 40 + (results.waterSaved / 50000) * 30 + (results.fertSaved / 20) * 30)
    return Math.round(raw)
  }, [results])

  const scoreColor =
    score >= 70 ? 'text-teal-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
  const scoreLabel =
    score >= 70 ? 'Excelente impacto ambiental' : score >= 40 ? 'Impacto moderado' : 'Impacto baixo'

  const equivalences = [
    {
      icon: <IconTree className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Árvores plantadas equivalentes',
      value: results.treesEquiv.toFixed(1),
      sub: `(absorção de ${CO2_EQUIV.treeAbsorptionPerYear}kg CO₂/árvore/ano)`,
    },
    {
      icon: <IconCar className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Km de carro não rodados',
      value: results.carKmEquiv.toFixed(0),
      sub: `(${CO2_EQUIV.carKmPerKgCo2} km/kg CO₂)`,
    },
    {
      icon: <IconPlane className="w-5 h-5 sm:w-6 sm:h-6" />,
      label: 'Horas de voo equivalentes',
      value: (results.co2AvoidedTotal / 1000 * CO2_EQUIV.flightHoursPerTonCo2).toFixed(2),
      sub: `(${CO2_EQUIV.flightHoursPerTonCo2}h/tonelada CO₂)`,
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Sustentabilidade</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-snug">
          Calculadora de impacto ambiental — estimativas baseadas em benchmarks de sistemas BFT
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-3 sm:p-4 flex gap-2.5 sm:gap-3">
        <IconLeaf className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs sm:text-sm text-teal-300 font-medium">Como funciona?</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Sistemas de bioflocos (BFT) reduzem o uso de fertilizantes, energia e emissões de CO₂
            comparados com sistemas convencionais de aquicultura. Esta calculadora estima o impacto
            positivo do seu sistema com base no volume total e tempo de operação.
          </p>
        </div>
      </div>

      {/* Calculator + Eco Score — empilhados em mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Parâmetros */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <IconSettings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" /> Parâmetros
            </h2>
            {tanks.length > 0 && (
              <button
                onClick={() => setUseTankData(!useTankData)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex-shrink-0 ${
                  useTankData
                    ? 'bg-teal-600/20 text-teal-300 border-teal-500/25'
                    : 'text-gray-500 border-gray-700 hover:text-gray-300'
                }`}
              >
                {useTankData && <IconCheck className="w-3 h-3" />}
                <span className="whitespace-nowrap">
                  {useTankData ? 'Dados reais' : 'Usar meus tanques'}
                </span>
              </button>
            )}
          </div>

          {useTankData ? (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 sm:p-4 space-y-2">
              <p className="text-xs text-gray-400 font-medium">Dados dos seus tanques</p>
              <div className="space-y-1">
                {tanks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 truncate mr-2">{t.name}</span>
                    <span className="text-gray-300 font-medium flex-shrink-0">{t.volumeLiters.toLocaleString('pt-BR')} L</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-700 flex justify-between text-xs font-semibold">
                <span className="text-gray-400">Total</span>
                <span className="text-teal-300">{effectiveVolume.toLocaleString('pt-BR')} L</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <SliderInput label="Volume por tanque" value={volumeLiters} min={500}  max={50000} step={500} unit="L"     onChange={setVolumeLiters} />
              <SliderInput label="Número de tanques" value={tankCount}    min={1}    max={50}    step={1}   unit="unid." onChange={setTankCount}    />
            </div>
          )}

          <SliderInput label="Tempo de operação" value={yearsActive} min={1} max={10} step={1} unit="ano(s)" onChange={setYearsActive} />

          <div className="bg-gray-800/50 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Tanques</span>
              <span className="font-medium text-gray-200">{effectiveTankCount}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Volume total</span>
              <span className="font-medium text-gray-200">{effectiveVolume.toLocaleString('pt-BR')} L</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Período</span>
              <span className="font-medium text-gray-200">{yearsActive} ano{yearsActive > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Eco Score — menor e mais compacto em mobile */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 flex flex-row lg:flex-col items-center justify-center gap-4 sm:gap-6">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest text-center mb-3 sm:mb-4">
              Pontuação Ecológica
            </p>
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={score >= 70 ? '#14b8a6' : score >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 326.7} 326.7`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl sm:text-3xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-[10px] text-gray-600">/ 100</span>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-center">
            <p className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</p>
            <p className="text-[11px] text-gray-600 mt-1 max-w-[180px] sm:max-w-48 leading-snug">
              Baseado em CO₂ evitado, economia de água e fertilizantes
            </p>
          </div>
        </div>
      </div>

      {/* Results grid — 2 colunas em mobile, 4 em sm+ */}
      <div>
        <h2 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3">Estimativas de impacto</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <ResultCard icon={<IconCloud   className="w-4 h-4 sm:w-5 sm:h-5" />} label="CO₂ evitado"              value={results.co2AvoidedTotal.toFixed(1)}     unit="kg"  detail={`≈ ${results.treesEquiv.toFixed(0)} árvores/ano`} />
          <ResultCard icon={<IconSprout  className="w-4 h-4 sm:w-5 sm:h-5" />} label="Fertilizante economizado" value={results.fertSaved.toFixed(1)}            unit="kg"  />
          <ResultCard icon={<IconDroplet className="w-4 h-4 sm:w-5 sm:h-5" />} label="Água economizada"         value={(results.waterSaved / 1000).toFixed(1)} unit="m³"  detail={`${results.waterSaved.toLocaleString('pt-BR')} litros`} />
          <ResultCard icon={<IconZap     className="w-4 h-4 sm:w-5 sm:h-5" />} label="Energia economizada"      value={results.energySaved.toFixed(0)}         unit="kWh" />
        </div>
      </div>

      {/* Equivalences — 1 coluna em mobile, 3 em sm+ */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-200 mb-3 sm:mb-4">
          <IconGlobe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400" /> Equivalências do CO₂ evitado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          {equivalences.map(({ icon, label, value, sub }) => (
            <div key={label} className="bg-gray-800/40 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
              <span className="text-gray-400 flex-shrink-0">{icon}</span>
              <div className="flex-1 sm:mt-2">
                <p className="text-lg sm:text-xl font-bold text-white">{Number(value).toLocaleString('pt-BR')}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5 hidden sm:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-700 text-center leading-relaxed flex items-start sm:items-center justify-center gap-1.5">
        <IconAlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5 sm:mt-0" />
        Estimativas baseadas em benchmarks médios de sistemas BFT. Os valores reais variam conforme
        espécie cultivada, clima, manejo e comparativo com sistemas convencionais da região.
      </p>
    </div>
  )
}