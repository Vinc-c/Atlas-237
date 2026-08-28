import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

/**
 * Generic OAuth redirect target for third-party app connections
 * (Gmail, Slack, Outlook, Zoom, QuickBooks, Google Meet, and more — see
 * supabase/functions/oauth-exchange for the full provider registry).
 *
 * The connecting provider is stored in sessionStorage by
 * IntegrationPages.oauthConnect() right before opening the popup, along
 * with a per-provider `state` value used to guard against CSRF.
 *
 * Trello is the one exception: it still uses the legacy OAuth1-style
 * implicit "token" flow (response_type=token) instead of OAuth2's
 * authorization-code flow — Trello returns the token directly in the URL
 * *fragment* (`#token=...`), never as a `?code=` query param, and it
 * never echoes back a `state` (it has no such parameter). So it's handled
 * in its own branch below: no server round-trip is needed or possible
 * (Trello's "key" is the only credential — there is no client secret to
 * keep off the client), the integration row is written directly from
 * here, scoped to the caller's own org by RLS exactly as
 * oauth-exchange does server-side.
 */
export function OAuthCallbackPage() {
  const { language, profile } = useAuth();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'working' | 'success' | 'error'>('working');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const provider = sessionStorage.getItem('oauth_provider');

      if (provider === 'trello') {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const token = hashParams.get('token');
        try {
          if (!token) {
            setStatus('error');
            setMessage(language === 'fr' ? "Réponse d'autorisation invalide." : 'Invalid authorization response.');
            return;
          }
          if (!profile?.org_id) {
            setStatus('error');
            setMessage(language === 'fr' ? 'Aucune organisation trouvée pour ce compte.' : 'No organization found for this account.');
            return;
          }
          const { error: dbErr } = await supabase.from('integrations').upsert({
            org_id: profile.org_id,
            provider: 'trello',
            category: 'oauth',
            status: 'connected',
            connected_at: new Date().toISOString(),
            config: { auth_type: 'oauth_token', access_token: token },
          }, { onConflict: 'org_id,provider' });
          if (dbErr) {
            setStatus('error');
            setMessage(dbErr.message);
            return;
          }
          setStatus('success');
        } catch (err) {
          setStatus('error');
          setMessage(getErrorMessage(err));
        } finally {
          sessionStorage.removeItem('oauth_provider');
        }
        return;
      }

      const code = params.get('code');
      const returnedState = params.get('state');
      const oauthError = params.get('error');

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
  }, [params, language, profile]);

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
