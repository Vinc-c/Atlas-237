import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';
import { Logo } from '@/components/Logo';

/**
 * Landing page for invitation links (supabase.auth.admin.inviteUserByEmail)
 * and password-recovery links. Supabase's client automatically detects the
 * access_token in the URL hash and establishes a session before this
 * component mounts; here we just ask the person to set their own password.
 */
export function SetPasswordPage() {
  const { language, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      // No session was established from the link (expired/invalid) — send
      // them to the normal login screen instead of a dead-end form.
      navigate('/auth', { replace: true });
    }
  }, [authLoading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(language === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError(language === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.');
      return;
    }
    setSaving(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(getErrorMessage(updateErr));
      setSaving(false);
      return;
    }
    setDone(true);
    setSaving(false);
    setTimeout(() => navigate('/app', { replace: true }), 1500);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <div className="card max-w-sm w-full p-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-3 text-success-500" size={32} />
            <p className="font-semibold text-ink-900">{language === 'fr' ? 'Mot de passe défini !' : 'Password set!'}</p>
            <p className="text-sm text-ink-500 mt-1">{language === 'fr' ? 'Redirection...' : 'Redirecting...'}</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold text-ink-900 text-center mb-1">
              {language === 'fr' ? 'Définissez votre mot de passe' : 'Set your password'}
            </h1>
            <p className="text-sm text-ink-500 text-center mb-6">
              {language === 'fr' ? 'Ce mot de passe vous est propre — il ne sera partagé avec personne.' : 'This password is yours alone — it will never be shared.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{language === 'fr' ? 'Nouveau mot de passe' : 'New password'}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="password" className="input pl-9" value={password} onChange={e => setPassword(e.target.value)} autoFocus minLength={8} required />
                </div>
              </div>
              <div>
                <label className="label">{language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="password" className="input pl-9" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} required />
                </div>
              </div>
              {error && <p className="text-xs text-error-600">{error}</p>}
              <button type="submit" disabled={saving} className="btn-primary btn-sm w-full">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {language === 'fr' ? 'Valider et continuer' : 'Save and continue'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
