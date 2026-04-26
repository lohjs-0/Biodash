import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth'
import { toast } from '../../components/ui/toastService'

type Tab = 'profile' | 'notifications' | 'about'

interface NotifPrefs {
  emailAlerts: boolean
  temperatureAlerts: boolean
  phAlerts: boolean
  levelAlerts: boolean
  weeklyReport: boolean
}

const DEFAULT_NOTIF: NotifPrefs = {
  emailAlerts: true,
  temperatureAlerts: true,
  phAlerts: true,
  levelAlerts: true,
  weeklyReport: false,
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function IconUser({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconBell({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconInfo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function IconCheck({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

function IconEye({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── Components ─────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-200 leading-snug">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer mt-0.5 ${
          checked ? 'bg-teal-500' : 'bg-gray-700'
        }`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', disabled = false, placeholder }: {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; disabled?: boolean; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 sm:py-2.5 text-base sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      />
    </div>
  )
}

function PasswordField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 sm:py-2.5 pr-11 text-base sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {show ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const [name, setName] = useState(user?.name ?? '')
  const [organization, setOrganization] = useState(user?.organization ?? '')
  const [profileSaved, setProfileSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [notif, setNotif] = useState<NotifPrefs>(DEFAULT_NOTIF)
  const [notifSaved, setNotifSaved] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  function handleProfileSave() {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function handlePasswordSave() {
    setPasswordError(null)
    if (!currentPassword) { setPasswordError('Informe a senha atual'); return }
    if (newPassword.length < 6) { setPasswordError('Nova senha deve ter ao menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Senhas não coincidem'); return }

    setPasswordLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setPasswordSaved(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch {
      setPasswordError('Senha atual incorreta.')
    } finally {
      setPasswordLoading(false)
    }
  }

  function handleNotifSave() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 3000)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      await authApi.deleteAccount(deletePassword)
      clearAuth()
      navigate('/login')
      toast('Conta excluída com sucesso.', 'success')
    } catch {
      toast('Senha incorreta. Tente novamente.', 'error')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
      setDeletePassword('')
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Perfil',       icon: <IconUser className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notificações', icon: <IconBell className="w-4 h-4" /> },
    { key: 'about',         label: 'Sobre',        icon: <IconInfo className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5 hidden sm:block">Gerencie seu perfil e preferências</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit min-w-full sm:min-w-0">
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 sm:flex-none justify-center sm:justify-start cursor-pointer ${
                activeTab === key
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/20'
                  : 'text-gray-500'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="space-y-3 sm:space-y-4">

          {/* Avatar */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-600/30 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-xl font-bold text-teal-300">
                  {name.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{name || 'Seu nome'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-gray-600 mt-0.5 truncate">{organization || 'Sem organização'}</p>
              </div>
            </div>
          </div>

          {/* Informações pessoais */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <h2 className="text-sm font-semibold text-gray-200">Informações pessoais</h2>
            <InputField label="Nome"        value={name}              onChange={setName}         placeholder="Seu nome" />
            <InputField label="E-mail"      value={user?.email ?? ''} disabled />
            <InputField label="Organização" value={organization}      onChange={setOrganization} placeholder="Nome da organização" />
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                onClick={handleProfileSave}
                className="px-4 sm:px-5 py-2.5 bg-teal-600/20 border border-teal-500/25 text-teal-300 rounded-xl text-sm font-medium active:bg-teal-600/30 transition-all cursor-pointer"
              >
                Salvar alterações
              </button>
              {profileSaved && (
                <span className="text-xs text-teal-400 flex items-center gap-1.5">
                  <IconCheck className="w-3 h-3" /> Salvo com sucesso
                </span>
              )}
            </div>
          </div>

          {/* Alterar senha */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4">
            <h2 className="text-sm font-semibold text-gray-200">Alterar senha</h2>
            <PasswordField label="Senha atual"          value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
            <PasswordField label="Nova senha"           value={newPassword}     onChange={setNewPassword}     placeholder="••••••••" />
            <PasswordField label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
            {passwordError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <IconAlertTriangle className="w-3.5 h-3.5" /> {passwordError}
              </p>
            )}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="px-4 sm:px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : 'Atualizar senha'}
              </button>
              {passwordSaved && (
                <span className="text-xs text-teal-400 flex items-center gap-1.5">
                  <IconCheck className="w-3 h-3" /> Senha atualizada
                </span>
              )}
            </div>
          </div>

          {/* Zona de perigo */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 sm:p-5 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-red-400">Zona de perigo</h2>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Ao excluir sua conta, todos os tanques, leituras e alertas serão permanentemente removidos. Essa ação não pode ser desfeita.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium active:bg-red-500/20 transition-all cursor-pointer"
              >
                Excluir minha conta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                  <IconAlertTriangle className="w-3.5 h-3.5" />
                  Confirme sua senha para excluir a conta permanentemente.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-800/60 border border-red-500/20 rounded-xl px-4 py-3 text-base sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword('') }}
                    className="flex-1 px-4 py-3 sm:py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deletePassword}
                    className="flex-1 px-4 py-3 sm:py-2.5 bg-red-600 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Excluindo...
                      </>
                    ) : 'Sim, excluir tudo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-1 divide-y divide-gray-800/60">
            <h2 className="text-sm font-semibold text-gray-200 pb-3">Preferências de alertas</h2>
            <Toggle checked={notif.emailAlerts}       onChange={(v) => setNotif({ ...notif, emailAlerts: v })}       label="Alertas por e-mail"    description="Receba notificações por e-mail quando um alerta for disparado" />
            <Toggle checked={notif.temperatureAlerts} onChange={(v) => setNotif({ ...notif, temperatureAlerts: v })} label="Alertas de temperatura" description="Notificações quando a temperatura sair dos limites configurados" />
            <Toggle checked={notif.phAlerts}          onChange={(v) => setNotif({ ...notif, phAlerts: v })}          label="Alertas de pH"          description="Notificações quando o pH sair dos limites configurados" />
            <Toggle checked={notif.levelAlerts}       onChange={(v) => setNotif({ ...notif, levelAlerts: v })}       label="Alertas de nível"       description="Notificações quando o nível do fluido estiver crítico" />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-1 divide-y divide-gray-800/60">
            <h2 className="text-sm font-semibold text-gray-200 pb-3">Relatórios automáticos</h2>
            <Toggle checked={notif.weeklyReport} onChange={(v) => setNotif({ ...notif, weeklyReport: v })} label="Relatório semanal" description="Receba um resumo semanal do estado de todos os tanques" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleNotifSave}
              className="px-4 sm:px-5 py-2.5 bg-teal-600/20 border border-teal-500/25 text-teal-300 rounded-xl text-sm font-medium active:bg-teal-600/30 transition-all cursor-pointer"
            >
              Salvar preferências
            </button>
            {notifSaved && (
              <span className="text-xs text-teal-400 flex items-center gap-1.5">
                <IconCheck className="w-3 h-3" /> Preferências salvas
              </span>
            )}
          </div>
        </div>
      )}

      {/* About tab */}
      {activeTab === 'about' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0">
                <img src="/logo-biodash.png" alt="BioDash logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">BioDash</p>
                <p className="text-xs text-gray-500">Monitoramento biológico em tempo real</p>
              </div>
            </div>

            <div className="divide-y divide-gray-800/60 text-sm">
              {[
                { label: 'Versão',         value: '1.0.0' },
                { label: 'Framework',      value: 'React 18 + .NET 9' },
                { label: 'Banco de dados', value: 'PostgreSQL 18' },
                { label: 'Tempo real',     value: 'SignalR' },
                { label: 'Estado global',  value: 'Zustand' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5 gap-2">
                  <span className="text-gray-500 text-xs sm:text-sm">{label}</span>
                  <span className="text-gray-300 font-medium text-xs sm:text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-500/5 border border-teal-500/15 rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              BioDash é uma aplicação de portfólio open-source desenvolvida para demonstrar
              monitoramento em tempo real de sistemas biológicos. Desenvolvido com foco em
              Arquitetura Limpa, escalabilidade e boas práticas fullstack.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}