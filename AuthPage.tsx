import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe, Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm sm:mx-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.24em] text-primary-600">Atlas CRM</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
              Connexion et inscription sécurisées pour vos équipes.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600">
              Accédez à votre CRM avec une authentification simple, responsive et prête pour les équipes de Dubai et d’Afrique.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-ink-200 bg-white p-8 shadow-card sm:p-10">
          <div className="flex items-center justify-between gap-4 pb-6 sm:pb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-ink-500">{mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Inscription' : 'Réinitialisation'}</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink-950">{mode === 'login' ? 'Bienvenue de retour' : mode === 'signup' ? 'Créer un compte Atlas' : 'Mot de passe oublié'}</h2>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-ink-50 px-4 py-2 text-sm text-ink-500">
              <Globe size={16} />
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  {t('auth.forgotPassword', lang)}
                </button>
              </div>
            )}

            {error && <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
            {message && <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">{message}</div>}

            <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {mode === 'login' ? t('auth.login', lang) : mode === 'signup' ? t('auth.signup', lang) : t('auth.resetPassword', lang)}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-ink-200 pt-6 text-sm text-ink-600 sm:flex-row">
            <span>
              {mode === 'forgot'
                ? t('auth.forgotInstruction', lang)
                : mode === 'login'
                ? t('auth.noAccount', lang)
                : t('auth.haveAccount', lang)}
            </span>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              {mode === 'login' ? t('auth.signup', lang) : t('auth.login', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
