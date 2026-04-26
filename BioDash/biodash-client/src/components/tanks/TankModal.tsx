import { useState } from 'react'
import { tanksApi } from '../../api/tanks'
import { useTankStore } from '../../store/tankStore'
import { toast } from '../ui/toastService'

interface Props { onClose: () => void }

export default function TankModal({ onClose }: Props) {
  const setTanks = useTankStore((s) => s.setTanks)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [volume, setVolume] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await tanksApi.create({ name, description, volumeLiters: Number(volume) })
      const tanks = await tanksApi.getAll()
      setTanks(tanks)
      toast(`Tanque "${name}" criado com sucesso!`, 'success')
      onClose()
    } catch {
      toast('Erro ao criar tanque. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-[fadeIn_0.15s_ease]"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700/80 rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 w-full sm:max-w-md shadow-2xl shadow-black/50 animate-[slideUp_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — só aparece no mobile */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🧪</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Novo tanque</h2>
            <p className="text-xs text-gray-500">Configure seu tanque biológico</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} required
              autoComplete="off"
              className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-600"
              placeholder="ex: Tanque A1"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</label>
            <input
              value={description} onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
              className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-600"
              placeholder="ex: Tanque de fermentação aeróbica"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Volume (litros)</label>
            <input
              value={volume} onChange={(e) => setVolume(e.target.value)} required
              type="number" min="1"
              inputMode="numeric"
              className="bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-gray-600"
              placeholder="ex: 500"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-gray-800 active:bg-gray-700 text-gray-300 rounded-xl py-3.5 sm:py-2.5 text-sm font-medium transition-all border border-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-teal-600 active:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3.5 sm:py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando...
                </>
              ) : 'Criar tanque'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}