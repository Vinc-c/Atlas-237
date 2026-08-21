import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

/**
 * Generic OAuth redirect target for third-party app connections
 * (Gmail, Slack, Outlook, Zoom, QuickBooks, Google Meet).
 *
 * The connecting provider is stored in sessionStorage by
 * IntegrationPages.oauthConnect() right before opening the popup, along
 * with a per-provider `state` value used to guard against CSRF.
 */
export function OAuthCallbackPage() {
  const { language } = useAuth();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'working' | 'success' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const code = params.get('code');
      const returnedState = params.get('state');
      const oauthError = params.get('error');
      const provider = sessionStorage.getItem('oauth_provider');

      if (oauthError) {
        setStatus('error');
        setMessage(params.get('error_description') || oauthError);
        return;
      }
      if (!code || !provider) {
        setStatus('error');
        setMessage(language === 'fr' ? "Réponse d'autorisation invalide." : 'Invalid authorization response.');
        return;
      }
      const expectedState = sessionStorage.getItem('oauth_state_' + provider);
      if (!expectedState || expectedState !== returnedState) {
        setStatus('error');
        setMessage(language === 'fr' ? "Vérification de sécurité échouée (state mismatch)." : 'Security check failed (state mismatch).');
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session?.access_token || ''}`,
          },
          body: JSON.stringify({ provider, code, redirect_uri: `${window.location.origin}/auth/callback` }),
        });
        const result = await res.json();
        if (!res.ok || !result.ok) {
          setStatus('error');
          setMessage(result.msg || (language === 'fr' ? "Échec de l'échange du jeton." : 'Token exchange failed.'));
          return;
        }
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(getErrorMessage(err));
      } finally {
        sessionStorage.removeItem('oauth_state_' + provider);
        sessionStorage.removeItem('oauth_provider');
      }
    })();
  }, [params, language]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
      <div className="card max-w-sm w-full p-8 text-center">
        {status === 'working' && (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-primary-500" size={32} />
            <p className="text-sm text-ink-600">{language === 'fr' ? 'Connexion en cours...' : 'Connecting...'}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-success-500" size={32} />
            <p className="font-semibold text-ink-900 mb-1">{language === 'fr' ? 'Connecté avec succès' : 'Connected successfully'}</p>
            <p className="text-sm text-ink-500 mb-4">{language === 'fr' ? 'Vous pouvez fermer cette fenêtre.' : 'You can close this window.'}</p>
            <Link to="/app/integrations" className="btn-primary btn-sm">{language === 'fr' ? 'Retour aux intégrations' : 'Back to integrations'}</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 text-error-500" size={32} />
            <p className="font-semibold text-ink-900 mb-1">{language === 'fr' ? 'Échec de la connexion' : 'Connection failed'}</p>
            <p className="text-sm text-ink-500 mb-4">{message}</p>
            <Link to="/app/integrations" className="btn-secondary btn-sm">{language === 'fr' ? 'Retour aux intégrations' : 'Back to integrations'}</Link>
          </>
        )}
      </div>
    </div>
  );
}
