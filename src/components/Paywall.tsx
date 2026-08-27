import { useEffect, useState } from 'react';
import { Lock, CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkSubscriptionAccess } from '@/lib/flutterwave';
import { PLAN_PRICES } from '@/lib/plans';
import { getAvailablePsps, payWithPsp, PSP_REGISTRY, type PspOption } from '@/lib/psp';
import { Logo } from '@/components/Logo';

export function Paywall({ children }: { children: React.ReactNode }) {
  const { organization, session, loading, language, isSuperAdmin, isPlatformExempt } = useAuth();
  const lang = language;
  const [access, setAccess] = useState<{ allowed: boolean; status: string; plan: string; trialEndsAt: string | null; periodEnd: string | null } | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [payError, setPayError] = useState('');
  const [availablePsps, setAvailablePsps] = useState<PspOption[] | null>(null);
  const [selectedPsp, setSelectedPsp] = useState<string>('');

  useEffect(() => {
    if (loading || !organization) return;
    (async () => {
      if (isSuperAdmin || isPlatformExempt) { setChecking(false); return; }
      const res = await checkSubscriptionAccess(organization.id);
      setAccess(res);
      setChecking(false);
    })();
  }, [organization, loading, isSuperAdmin, isPlatformExempt, session]);

  useEffect(() => {
    getAvailablePsps().then((psps) => {
      setAvailablePsps(psps);
      if (psps.length > 0) setSelectedPsp(psps[0].key);
    });
  }, []);

  if (loading || checking) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;
  }

  if (isSuperAdmin || isPlatformExempt || !access || access.allowed) {
    return <>{children}</>;
  }

  // Trial expired → show paywall
  const trialEnded = access.trialEndsAt ? new Date(access.trialEndsAt) < new Date() : false;

  async function handleSubscribe(plan: string) {
    if (!organization || !session?.user?.email || !selectedPsp) return;
    setPayError('');
    setBusy(plan);
    const result = await payWithPsp(selectedPsp, {
      plan,
      orgId: organization.id,
      email: session.user.email,
      paymentCountry: organization.country || undefined,
    });
    if (result.redirected) return; // navigating away to the PSP's hosted page
    if (result.ok) {
      window.location.reload();
    } else {
      if (result.msg && result.msg !== 'cancelled') setPayError(result.msg);
      setBusy(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-50 to-white px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Logo size={56} className="mx-auto" />
          <div className="mt-6 flex items-center justify-center gap-2">
            <AlertCircle className="text-warning-500" size={24} />
            <h1 className="text-2xl font-bold text-ink-950">{trialEnded ? (lang === 'fr' ? 'Votre essai est terminé' : 'Your trial has ended') : (lang === 'fr' ? 'Abonnement requis' : 'Subscription required')}</h1>
          </div>
          <p className="mt-2 text-sm text-ink-600">
            {trialEnded
              ? (lang === 'fr' ? 'Votre essai gratuit de 14 jours est terminé. Choisissez un plan pour continuer à utiliser Atlas CRM.' : 'Your 14-day free trial has ended. Choose a plan to continue using Atlas CRM.')
              : (lang === 'fr' ? 'Un abonnement actif est requis pour accéder à la plateforme.' : 'An active subscription is required to access the platform.')}
          </p>
        </div>

        {availablePsps !== null && availablePsps.length === 0 && (
          <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 p-3 text-xs text-warning-700">
            {lang === 'fr' ? 'Aucun moyen de paiement n\'est configuré actuellement. Contactez le support.' : 'No payment provider is currently configured. Contact support.'}
          </div>
        )}
        {availablePsps !== null && availablePsps.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-ink-500">{lang === 'fr' ? 'Payer avec :' : 'Pay with:'}</span>
            {availablePsps.map((psp) => (
              <button
                key={psp.key}
                onClick={() => setSelectedPsp(psp.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedPsp === psp.key ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
                title={psp.method}
              >
                {psp.label}
              </button>
            ))}
          </div>
        )}
        {payError && (
          <div className="mt-4 rounded-lg border border-error-200 bg-error-50 p-3 text-xs text-error-700">{payError}</div>
        )}

        <div className="mt-6 space-y-3">
          {Object.entries(PLAN_PRICES).map(([key, price]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success-500" size={20} />
                <div>
                  <p className="font-bold text-ink-900 capitalize">{key}</p>
                  <p className="text-xs text-ink-500">{price.label} — ${price.monthly}/mo</p>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe(key)}
                disabled={busy !== null || !selectedPsp}
                className="btn-primary btn-sm"
              >
                {busy === key ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
                {lang === 'fr' ? 'Payer' : 'Pay'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1"><Lock size={12} /> {lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
          {selectedPsp && <span>{PSP_REGISTRY.find(p => p.key === selectedPsp)?.label}</span>}
        </div>
      </div>
    </div>
  );
}
