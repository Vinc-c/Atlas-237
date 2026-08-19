import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkSubscriptionAccess, initiateFlutterwaveCheckout, recordSubscription, PLAN_PRICES, isFlutterwaveConfigured } from '@/lib/flutterwave';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/Logo';

export function Paywall({ children }: { children: React.ReactNode }) {
  const { organization, session, loading, language, isSuperAdmin } = useAuth();
  const lang = language;
  const [access, setAccess] = useState<{ allowed: boolean; status: string; plan: string; trialEndsAt: string | null; periodEnd: string | null } | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [exempt, setExempt] = useState(false);

  useEffect(() => {
    if (loading || !organization) return;
    (async () => {
      if (isSuperAdmin) { setExempt(true); setChecking(false); return; }
      if (session?.user?.id) {
        try {
          const { data: isExempt } = await supabase.rpc('is_platform_exempt', { check_user_id: session.user.id });
          if (isExempt) { setExempt(true); setChecking(false); return; }
        } catch { /* function may not exist */ }
      }
      const res = await checkSubscriptionAccess(organization.id);
      setAccess(res);
      setChecking(false);
    })();
  }, [organization, loading, isSuperAdmin, session]);

  if (loading || checking) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;
  }

  if (exempt || !access || access.allowed) {
    return <>{children}</>;
  }

  // Trial expired → show paywall
  const trialEnded = access.trialEndsAt ? new Date(access.trialEndsAt) < new Date() : false;

  async function handleSubscribe(plan: string) {
    if (!organization || !session?.user?.email) return;
    setBusy(plan);
    initiateFlutterwaveCheckout({
      plan,
      email: session.user.email,
      orgId: organization.id,
      onSuccess: async (txRef, paymentId) => {
        const res = await recordSubscription({ orgId: organization.id, plan, txRef, paymentId });
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error || 'Payment verification failed');
          setBusy(null);
        }
      },
      onClose: () => setBusy(null),
    });
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

        {!isFlutterwaveConfigured() && (
          <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 p-3 text-xs text-warning-700">
            {lang === 'fr' ? 'Le paiement Flutterwave n\'est pas encore configuré. Ajoutez VITE_FLW_PUBLIC_KEY.' : 'Flutterwave payment is not yet configured. Add VITE_FLW_PUBLIC_KEY.'}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {Object.entries(PLAN_PRICES).map(([key, price]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-success-500" size={20} />
                <div>
                  <p className="font-bold text-ink-900 capitalize">{key}</p>
                  <p className="text-xs text-ink-500">{price.label}</p>
                </div>
              </div>
              {price.cents === 0 ? (
                <Link to="/legal/contact" className="btn-secondary btn-sm">Contact</Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={busy !== null}
                  className="btn-primary btn-sm"
                >
                  {busy === key ? <Loader2 className="animate-spin" size={14} /> : <CreditCard size={14} />}
                  {lang === 'fr' ? 'Payer' : 'Pay'}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1"><Lock size={12} /> {lang === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}</span>
          <span>Flutterwave</span>
        </div>
      </div>
    </div>
  );
}
