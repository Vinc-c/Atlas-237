import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface FlutterwaveCallbackResponse {
  status: string;
  transaction_id?: string | number;
  id?: string | number;
}

interface FlutterwaveModalHandle {
  close: () => void;
}

interface FlutterwaveCheckoutOptions {
  public_key: string | undefined;
  tx_ref: string;
  amount: string;
  currency: string;
  payment_options: string;
  customer: { email: string };
  custom_title: string;
  custom_description: string;
  redirect_url: string;
  on_close: () => void;
  callback: (response: FlutterwaveCallbackResponse) => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: FlutterwaveCheckoutOptions) => FlutterwaveModalHandle;
  }
}


export const PLAN_PRICES: Record<string, { cents: number; label: string }> = {
  starter: { cents: 1900, label: 'Starter — $19/mo' },
  growth: { cents: 4900, label: 'Growth — $49/mo' },
  pro: { cents: 11900, label: 'Pro — $119/mo' },
  enterprise: { cents: 21900, label: 'Enterprise — $219/mo' },
};

export const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY as string | undefined;
// NOTE: there is intentionally no client-side "FLW_SECRET_KEY" export here.
// A payment provider's secret key can charge cards, issue refunds, and
// read full transaction history — it must never be bundled into
// client-side JS (a VITE_-prefixed env var is baked into the public
// bundle at build time and readable by anyone). The real secret key is
// read only inside supabase/functions/flutterwave-verify, from a
// server-only Deno.env var with no VITE_ prefix.

export function isFlutterwaveConfigured() {
  return Boolean(FLW_PUBLIC_KEY);
}

/**
 * Check whether the org has an active subscription or is within the trial period.
 * Returns { allowed: true } if access should be granted, otherwise paywall info.
 */
export async function checkSubscriptionAccess(orgId: string): Promise<{
  allowed: boolean;
  status: 'trialing' | 'active' | 'expired';
  plan: string;
  trialEndsAt: string | null;
  periodEnd: string | null;
}> {
  const { data, error } = await supabase.rpc('org_subscription_status', { check_org_id: orgId });
  if (error || !data || data.length === 0) {
    return { allowed: false, status: 'expired', plan: 'starter', trialEndsAt: null, periodEnd: null };
  }
  const row = data[0];
  const allowed = row.status === 'active' || row.status === 'trialing';
  return {
    allowed,
    status: row.status,
    plan: row.plan,
    trialEndsAt: row.trial_ends_at,
    periodEnd: row.current_period_end,
  };
}

/**
 * Initiate a Flutterwave checkout for a subscription plan.
 * Opens the Flutterwave inline checkout modal.
 */
export function initiateFlutterwaveCheckout(params: {
  plan: string;
  email: string;
  orgId: string;
  onSuccess: (txRef: string, paymentId: string) => void;
  onClose: () => void;
}) {
  const { plan, email, orgId, onSuccess, onClose } = params;
  const price = PLAN_PRICES[plan];
  if (!price || price.cents === 0) {
    // Defensive fallback only — every plan in PLAN_PRICES currently has a
    // real price. Should this ever be hit (unknown plan key), don't try to
    // charge $0; send the user to sales instead of opening a broken modal.
    window.location.href = `mailto:sales@liafrik.com?subject=Atlas%20CRM%20Subscription`;
    return;
  }

  const txRef = `atlas_${orgId.slice(0, 8)}_${Date.now()}`;

  // Load Flutterwave inline script
  const existing = document.getElementById('flutterwave-script');
  const loadScript = () => new Promise<void>((resolve) => {
    if (window.FlutterwaveCheckout) return resolve();
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'flutterwave-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  loadScript().then(() => {
    const modal = window.FlutterwaveCheckout?.({
      public_key: FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: (price.cents / 100).toFixed(2),
      currency: 'USD',
      payment_options: 'card, mobilemoneyghana, mobilemoneyrwanda, mobilemoneyuganda, mobilemoneyzambia, mobilemoneytanzania, banktransfer, ussd, qr, credit',
      customer: { email },
      custom_title: 'Atlas CRM Subscription',
      custom_description: price.label,
      redirect_url: `${window.location.origin}/app/billing?flw_status=success&tx_ref=${txRef}`,
      on_close: () => onClose(),
      callback: (response: FlutterwaveCallbackResponse) => {
        if (response.status === 'completed' || response.status === 'successful') {
          onSuccess(txRef, String(response.transaction_id || response.id || ''));
        }
        modal?.close();
      },
    });
  });
}

/**
 * Confirm a Flutterwave payment and activate the subscription.
 *
 * This calls the flutterwave-verify edge function, which independently
 * re-checks the transaction with Flutterwave's own server-side API (using
 * the secret key, which never reaches the browser) before writing
 * anything — the amount, currency, and status the client-side checkout
 * callback reported are never trusted on their own. Writing directly to
 * the subscriptions/organizations tables from the browser is no longer
 * possible (RLS + column privileges were locked down specifically to
 * close that gap), so this edge function is the only path to activating
 * a plan.
 */
export async function recordSubscription(params: {
  orgId: string;
  plan: string;
  txRef: string;
  paymentId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/flutterwave-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({ org_id: params.orgId, plan: params.plan, tx_ref: params.txRef, transaction_id: params.paymentId }),
    });
    const result = await res.json();
    return result.ok ? { success: true } : { success: false, error: result.msg || 'Verification failed' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

/** React hook for subscription access in protected routes */
export function useSubscriptionGuard() {
  const { organization, session } = useAuth();
  return {
    check: () => organization ? checkSubscriptionAccess(organization.id) : Promise.resolve({ allowed: true, status: 'trialing' as const, plan: 'starter', trialEndsAt: null, periodEnd: null }),
    orgId: organization?.id,
    email: session?.user?.email,
  };
}
