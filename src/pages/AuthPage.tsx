import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Globe, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { t, type Language } from '@/lib/i18n';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { language, setLanguage } = useAuth();
  const navigate = useNavigate();
  const lang = language;

  useEffect(() => {
    const storedEmail = localStorage.getItem('atlas-remember-email');
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (rememberMe) {
          localStorage.setItem('atlas-remember-email', email);
        } else {
          localStorage.removeItem('atlas-remember-email');
        }
        navigate('/app');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, company_name: companyName },
          },
        });
        if (error) throw error;
        navigate('/app');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage(t('auth.resetSent', lang));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError(t('auth.emailExists', lang));
      } else if (msg.includes('Invalid credentials') || msg.includes('invalid')) {
        setError(t('auth.invalidCredentials', lang));
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const highlights = [
    'Pipelines & automatisation des ventes',
    'Service client unifié en temps réel',
    'Sécurité RGPD & conformité multi-régions',
  ];

  return (
    <div className="min-h-screen bg-white text-ink-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ───────── Brand / marketing panel (Salesforce cloud blue) ───────── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-600 p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-800/40 blur-3xl" />

          <div className="relative">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">Atlas CRM</span>
            </Link>
          </div>

          <div className="relative">
            <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              La plateforme CRM agentique n°1
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-primary-100">
              Ventes, service client et intelligence artificielle réunis sur un seul cloud. Conçu pour Dubai, l’Afrique et le monde.
            </p>
            <ul className="mt-9 space-y-4">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm text-primary-50">{h}</span>
                </li>
              ))}
            </ul>

            {/* Dashboard illustration */}
            <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">Aperçu tableau de bord</p>
                <span className="rounded-full bg-success-400/30 px-2 py-0.5 text-[10px] font-bold text-white">+12%</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[['Revenu', '$248K'], ['Deals', '34'], ['Leads', '18']].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-white/10 p-3">
                    <p className="text-[10px] text-primary-100">{l}</p>
                    <p className="mt-1 text-base font-bold">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex h-16 items-end gap-1.5">
                {[45, 70, 55, 85, 60, 95, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-white/40" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex -space-x-2">
              {['AM', 'KO', 'RD'].map((i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-600 bg-white text-[11px] font-bold text-primary-600">{i}</div>
              ))}
            </div>
            <p className="text-xs text-primary-100">Rejoint par plus de 150 000 professionnels à travers le monde.</p>
          </div>
        </div>

        {/* ───────── Form panel ───────── */}
        <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Sparkles size={18} />
              </div>
              <span className="text-lg font-bold">Atlas CRM</span>
            </Link>
            <div className="ml-auto flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-500">
              <Globe size={15} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-ink-700 focus:outline-none"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
                <option value="ar">AR</option>
              </select>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink-950">
                {mode === 'login' ? t('auth.welcome', lang) : mode === 'signup' ? t('auth.createAccount', lang) : t('auth.resetPassword', lang)}
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                {mode === 'forgot' ? t('auth.forgotInstruction', lang) : t('auth.trialNote', lang)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {mode === 'signup' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">{t('auth.firstName', lang)}</span>
                    <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </label>
                  <label className="block">
                    <span className="label">{t('auth.lastName', lang)}</span>
                    <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </label>
                </div>
              )}
              {mode === 'signup' && (
                <label className="block">
                  <span className="label">{t('auth.companyName', lang)}</span>
                  <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </label>
              )}
              <label className="block">
                <span className="label">{t('auth.email', lang)}</span>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" />
              </label>
              {mode !== 'forgot' && (
                <label className="block">
                  <span className="label">{t('auth.password', lang)}</span>
                  <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </label>
              )}

              {mode === 'login' && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-ink-600">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500" />
                    {t('auth.rememberMe', lang)}
                  </label>
                  <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                    {t('auth.forgotPassword', lang)}
                  </button>
                </div>
              )}

              {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
              {message && <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">{message}</div>}

              <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg">
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {mode === 'login' ? t('auth.login', lang) : mode === 'signup' ? t('auth.signup', lang) : t('auth.resetPassword', lang)}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>

            {mode !== 'forgot' && (
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-ink-100" />
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">ou</span>
                <div className="h-px flex-1 bg-ink-100" />
              </div>
            )}

            {mode !== 'forgot' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/app` } });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'OAuth Google indisponible');
                  }
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-[10px] font-bold text-white">G</span>
                Continuer avec Google
              </button>
            )}

            {mode === 'signup' && (
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-ink-500">
                <CheckCircle2 size={15} className="mt-0.5 flex-none text-success-500" />
                En créant un compte, vous acceptez les Conditions d’utilisation et la Politique de confidentialité d’Atlas CRM.
              </p>
            )}

            <div className="mt-8 border-t border-ink-100 pt-6 text-center text-sm text-ink-600">
              {mode === 'forgot' ? (
                <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                  {t('auth.backToLogin', lang)}
                </button>
              ) : (
                <span>
                  {mode === 'login' ? t('auth.noAccount', lang) : t('auth.haveAccount', lang)}{' '}
                  <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                    {mode === 'login' ? t('auth.signup', lang) : t('auth.login', lang)}
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
