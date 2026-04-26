import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { toast } from '../../components/ui/toastService'

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

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#&?_\-]).{8,}$/

const checks = [
  { label: '8+ caracteres',      ok: password.length >= 8 },
  { label: 'Letra maiúscula',    ok: /[A-Z]/.test(password) },
  { label: 'Letra minúscula',    ok: /[a-z]/.test(password) },
  { label: 'Número',             ok: /\d/.test(password) },
  { label: 'Caractere especial', ok: /[@$!%*#&?_\-]/.test(password) },
]

  const score = checks.filter((c) => c.ok).length

  const barColor =
    score <= 1 ? 'bg-red-500' :
    score === 2 ? 'bg-orange-500' :
    score === 3 ? 'bg-yellow-500' :
    'bg-teal-500'

  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? barColor : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map(({ label, ok }) => (
          <span key={label} className={`text-[10px] ${ok ? 'text-teal-400' : 'text-gray-600'}`}>
            {ok ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [organization, setOrganization] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (isRegister && !PASSWORD_REGEX.test(password)) {
      toast('A senha deve ter 8+ caracteres, com maiúscula, minúscula e número.', 'error')
      setLoading(false)
      return
    }

    try {
      const data = isRegister
        ? await authApi.register({ name, email, password, organization })
        : await authApi.login({ email, password })
      setAuth(data.token, data.user)
      setTimeout(() => navigate('/dashboard', { replace: true }), 50)
    } catch {
      toast(isRegister ? 'Erro ao criar conta.' : 'E-mail ou senha inválidos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-[blobDrift_8s_ease-in-out_infinite_alternate]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none animate-[blobDrift_10s_ease-in-out_infinite_alternate-reverse]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none animate-[blobDrift_12s_ease-in-out_infinite_alternate]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm animate-[fadeSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">

        {/* Logo */}
        <div className="text-center mb-6 animate-[fadeSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.05s_both]">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-3 animate-[logoFloat_4s_ease-in-out_infinite]">
            <img src="/logo-biodash.png" alt="BioDash" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">BioDash</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Monitoramento de tanques biológicos</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl p-5 sm:p-8 shadow-2xl shadow-black/40 animate-[fadeSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.1s_both]">

          {/* Tab switcher */}
          <div className="flex bg-gray-800/60 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                !isRegister ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                isRegister ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400'
              }`}
            >
              Criar conta
            </button>
          </div>

          <div
            key={isRegister ? 'register' : 'login'}
            className="animate-[fadeSlideUp_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
              {isRegister && (
                <>
                  <Field label="Nome completo">
                    <input
                      value={name} onChange={(e) => setName(e.target.value)} required
                      autoComplete="name"
                      className={inputCls}
                      placeholder="Seu nome"
                    />
                  </Field>
                  <Field label="Organização">
                    <input
                      value={organization} onChange={(e) => setOrganization(e.target.value)} required
                      autoComplete="organization"
                      className={inputCls}
                      placeholder="Laboratório ou empresa"
                    />
                  </Field>
                </>
              )}

              <Field label="E-mail">
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  autoComplete="email" inputMode="email"
                  className={inputCls}
                  placeholder="voce@email.com"
                />
              </Field>

              <Field label="Senha">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    className={`${inputCls} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && <PasswordStrength password={password} />}
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 bg-teal-600 active:bg-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white rounded-xl py-3.5 sm:py-3 text-sm font-semibold transition-all duration-200 shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Aguarde...
                  </>
                ) : isRegister ? 'Criar conta' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-5 animate-[fadeSlideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_0.2s_both]">
          Monitoramento inteligente de sistemas biológicos
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes blobDrift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.08); }
        }
      `}</style>
    </div>
  )
}

const inputCls = 'bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all placeholder:text-gray-600 w-full'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}
