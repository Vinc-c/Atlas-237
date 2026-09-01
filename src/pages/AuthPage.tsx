import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { t, type Language } from '@/lib/i18n';
import { Logo } from '@/components/Logo';
import { BrandLogo } from '@/components/BrandLogos';
import { VideoBackground } from '@/components/VideoBackground';
import { AUTH_VIDEO_SOURCES, AUTH_VIDEO_POSTER } from '@/lib/media';
import { COUNTRIES, CURRENCIES, TIMEZONES, suggestCurrency } from '@/lib/i18n-countries';

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [countryOther, setCountryOther] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [salesCode, setSalesCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
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
      if (!isSupabaseConfigured) {
        setError(t('auth.notConfigured', lang));
        return;
      }
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName, company_name: companyName, country, currency, timezone, sales_code: salesCode },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate('/app');
        } else {
          setMessage(t('auth.confirmEmail', lang));
          setMode('login');
        }
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
      } else if (msg.includes('Database error saving new user')) {
        setError(lang === 'fr'
          ? 'Erreur lors de la création du compte. Notre équipe a été notifiée. Réessayez — si le problème persiste, connectez-vous avec cet e-mail après confirmation.'
          : 'Error creating account. Our team has been notified. Please retry — if the issue persists, try signing in with this email after confirmation.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setOauthLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setError(t('auth.notConfigured', lang));
        return;
      }
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (oauthErr) {
        if (oauthErr.message?.toLowerCase().includes('provider is not enabled') || (oauthErr as { code?: number }).code === 400) {
          setError(lang === 'fr'
            ? "La connexion Google n'est pas encore activée pour ce compte. Un administrateur doit l'activer dans Supabase (Authentication → Providers → Google)."
            : 'Google sign-in is not yet enabled for this account. An admin needs to enable it in Supabase (Authentication → Providers → Google).');
        } else {
          setError(oauthErr.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (lang === 'fr' ? 'OAuth Google indisponible' : 'Google OAuth unavailable'));
    } finally {
      setOauthLoading(false);
    }
  }

  const highlights = lang === 'fr'
    ? ['Pipelines & automatisation des ventes', 'Service client unifié en temps réel', 'Sécurité RGPD & conformité multi-régions']
    : ['Sales pipelines & automation', 'Unified real-time customer service', 'GDPR security & multi-region compliance'];

  return (
    <div className="min-h-screen bg-white text-ink-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ───────── Brand / marketing panel (Salesforce cloud blue) ───────── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-600 p-10 text-white lg:flex xl:p-14">
          <VideoBackground
            sources={AUTH_VIDEO_SOURCES}
            poster={AUTH_VIDEO_POSTER}
            overlayClassName="bg-gradient-to-br from-primary-700/90 via-primary-600/85 to-primary-900/90"
          />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-800/40 blur-3xl" />

          <div className="relative">
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={40} />
              <span className="text-xl font-bold tracking-tight">Atlas CRM</span>
            </Link>
          </div>

          <div className="relative">
            <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
              {t('auth.brandTagline', lang)}
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-primary-100">
              {t('auth.brandSub', lang)}
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
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">{lang === 'fr' ? 'Aperçu tableau de bord' : 'Dashboard preview'}</p>
                <span className="rounded-full bg-success-400/30 px-2 py-0.5 text-[10px] font-bold text-white">+12%</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[[lang === 'fr' ? 'Revenu' : 'Revenue', '$248K'], [lang === 'fr' ? 'Deals' : 'Deals', '34'], [lang === 'fr' ? 'Leads' : 'Leads', '18']].map(([l, v]) => (
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

            {/* Real connected apps, tying into the marketplace — not decorative placeholders */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-200">{lang === 'fr' ? 'Se connecte à vos outils' : 'Connects with your tools'}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {['slack', 'whatsapp', 'shopify', 'hubspot', 'mailchimp', 'zapier'].map((provider) => (
                  <div key={provider} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 p-1.5 shadow-sm">
                    <BrandLogo provider={provider} size={22} />
                  </div>
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
            <p className="text-xs text-primary-100">{t('auth.socialProof', lang)}</p>
          </div>
        </div>

        {/* ───────── Form panel ───────── */}
        <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-16 lg:py-10">
          {/* Mobile/tablet brand banner */}
          <div className="-mx-5 -mt-8 mb-8 bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-6 sm:-mx-10 sm:px-10 lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <Link to="/" className="flex items-center gap-2.5">
                <Logo size={36} />
                <span className="text-lg font-bold tracking-tight text-white">Atlas CRM</span>
              </Link>
              <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-sm text-white">
                <Globe size={14} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent text-white focus:outline-none [&>option]:text-ink-900"
                  aria-label="Language"
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                  <option value="es">ES</option>
                  <option value="pt">PT</option>
                  <option value="ar">AR</option>
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-primary-100">{t('auth.brandTagline', lang)}</p>
          </div>

          <div className="hidden items-center justify-end lg:flex">
            <div className="flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-500">
              <Globe size={15} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-ink-700 focus:outline-none"
                aria-label="Language"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
                <option value="ar">AR</option>
              </select>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6 sm:py-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
                {mode === 'login' ? t('auth.welcome', lang) : mode === 'signup' ? t('auth.createAccount', lang) : t('auth.resetPassword', lang)}
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                {mode === 'forgot' ? t('auth.forgotInstruction', lang) : t('auth.trialNote', lang)}
              </p>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                <AlertCircle size={16} className="mt-0.5 flex-none" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
                <CheckCircle2 size={16} className="mt-0.5 flex-none" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              {mode === 'signup' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="label">{t('auth.firstName', lang)}</span>
                    <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                  </label>
                  <label className="block">
                    <span className="label">{t('auth.lastName', lang)}</span>
                    <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
                  </label>
                </div>
              )}
              {mode === 'signup' && (
                <label className="block">
                  <span className="label">{t('auth.companyName', lang)}</span>
                  <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required autoComplete="organization" />
                </label>
              )}
              {mode === 'signup' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">{lang === 'fr' ? 'Pays' : 'Country'}</span>
                      <select
                        className="input"
                        value={COUNTRIES.some(c => c.code === country) || !country ? country : '__other__'}
                        onChange={(e) => {
                          if (e.target.value === '__other__') {
                            setCountry('');
                            setCountryOther(true);
                          } else {
                            setCountryOther(false);
                            setCountry(e.target.value);
                            setCurrency(suggestCurrency(e.target.value));
                          }
                        }}
                      >
                        <option value="">{lang === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{lang === 'fr' ? c.nameFr : c.name}</option>
                        ))}
                        <option value="__other__">{lang === 'fr' ? 'Autre (préciser)…' : 'Other (specify)…'}</option>
                      </select>
                      {countryOther && (
                        <input
                          type="text"
                          className="input mt-2"
                          placeholder={lang === 'fr' ? 'Nom du pays' : 'Country name'}
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                        />
                      )}
                    </label>
                    <label className="block">
                      <span className="label">{lang === 'fr' ? 'Devise' : 'Currency'}</span>
                      <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.code} — {c.symbol} ({c.name})</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">{lang === 'fr' ? 'Fuseau horaire' : 'Timezone'}</span>
                      <select className="input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="label">{lang === 'fr' ? 'Code commercial (optionnel)' : 'Sales code (optional)'}</span>
                      <input className="input" value={salesCode} onChange={(e) => setSalesCode(e.target.value)} placeholder="ATLAS-XXX" />
                    </label>
                  </div>
                </>
              )}
              <label className="block">
                <span className="label">{t('auth.email', lang)}</span>
                <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" autoComplete="email" />
              </label>
              {mode !== 'forgot' && (
                <label className="block">
                  <span className="label">{t('auth.password', lang)}</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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

              <button type="submit" disabled={submitting} className="btn-primary w-full btn-lg">
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {mode === 'login' ? t('auth.login', lang) : mode === 'signup' ? t('auth.signup', lang) : t('auth.resetPassword', lang)}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </form>

            {mode !== 'forgot' && (
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-ink-100" />
                <span className="text-xs font-medium uppercase tracking-wide text-ink-400">{t('auth.or', lang)}</span>
                <div className="h-px flex-1 bg-ink-100" />
              </div>
            )}

            {mode !== 'forgot' && (
              <button
                type="button"
                onClick={handleGoogle}
                disabled={oauthLoading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
              >
                {oauthLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                {t('auth.continueGoogle', lang)}
              </button>
            )}

            {mode === 'signup' && (
              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-ink-500">
                <CheckCircle2 size={15} className="mt-0.5 flex-none text-success-500" />
                {t('auth.terms', lang)}
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
                  <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); setPassword(''); setShowPassword(false); }} className="font-semibold text-primary-700 hover:text-primary-800 transition-colors">
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
