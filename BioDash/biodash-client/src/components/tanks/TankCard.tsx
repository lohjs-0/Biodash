import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tanksApi } from '../../api/tanks'
import { useTankStore } from '../../store/tankStore'
import { toast } from '../ui/toastService'
import type { Tank } from '../../types'

interface Props { tank: Tank }

function ParamBadge({ label, value, unit, alert }: { label: string; value: number; unit: string; alert?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-2 py-2 rounded-xl transition-colors ${
      alert ? 'bg-red-500/10 border border-red-500/25' : 'bg-gray-700/60 border border-gray-700/40'
    }`}>
      <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
      <span className={`text-base font-bold mt-0.5 tabular-nums leading-tight ${alert ? 'text-red-400' : 'text-white'}`}>
        {value.toFixed(1)}
        <span className={`text-[10px] font-normal ml-0.5 ${alert ? 'text-red-500' : 'text-gray-500'}`}>{unit}</span>
      </span>
    </div>
  )
}

export default function TankCard({ tank }: Props) {
  const navigate = useNavigate()
  const { setTanks } = useTankStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Deletar "${tank.name}"?`)) return
    setDeleting(true)
    try {
      await tanksApi.delete(tank.id)
      const tanks = await tanksApi.getAll()
      setTanks(tanks)
      toast(`Tanque "${tank.name}" removido.`, 'success')
    } catch {
      toast('Erro ao remover tanque.', 'error')
    } finally {
      setDeleting(false)
      setMenuOpen(false)
    }
  }

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      await tanksApi.toggleOnline(tank.id)
      const tanks = await tanksApi.getAll()
      setTanks(tanks)
      toast(`Tanque ${tank.isOnline ? 'pausado' : 'ativado'}.`, 'success')
    } catch {
      toast('Erro ao alterar status.', 'error')
    }
    setMenuOpen(false)
  }

  const tempAlert = tank.currentTemperature > 35 || tank.currentTemperature < 10
  const phAlert = tank.currentPh < 6 || tank.currentPh > 8.5

  return (
    <div
      onClick={() => navigate(`/tanks/${tank.id}`)}
      className={`relative bg-gray-800/40 border rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all duration-150
        ${tank.alertActive
          ? 'border-red-500/30 shadow-red-900/10'
          : 'border-gray-700/60 shadow-gray-900/20'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              tank.isOnline ? 'bg-teal-400 shadow-sm shadow-teal-400/50 animate-pulse' : 'bg-gray-600'
            }`} />
            <h3 className="text-sm font-semibold text-white truncate">{tank.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate pl-4">{tank.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {tank.alertActive && (
            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 rounded-full font-medium animate-pulse">
              ⚠ Alerta
            </span>
          )}

          {/* Menu — área de toque maior no mobile */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-200 active:bg-gray-700 transition-all"
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                {/* Overlay para fechar ao tocar fora */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                />
                <div
                  className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden min-w-[150px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleToggle}
                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 active:bg-gray-600 hover:text-white transition-colors"
                  >
                    {tank.isOnline ? '⏸ Pausar' : '▶ Ativar'}
                  </button>
                  <div className="h-px bg-gray-700" />
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Removendo...' : '🗑 Deletar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Level bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 font-medium">
          <span>NÍVEL</span>
          <span className="text-gray-400 tabular-nums">{tank.currentLevel.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              tank.currentLevel < 20 ? 'bg-red-500' :
              tank.currentLevel < 50 ? 'bg-yellow-500' : 'bg-teal-500'
            }`}
            style={{ width: `${Math.min(tank.currentLevel, 100)}%` }}
          />
        </div>
      </div>

      {/* Params */}
      <div className="grid grid-cols-3 gap-2">
        <ParamBadge label="Temp" value={tank.currentTemperature} unit="°C" alert={tempAlert} />
        <ParamBadge label="pH" value={tank.currentPh} unit="" alert={phAlert} />
        <ParamBadge label="Vol" value={tank.volumeLiters} unit="L" />
      </div>
    </div>
  )
}