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
  enterprise: { cents: 0, label: 'Enterprise — Custom' },
};

export const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY as string | undefined;
export const FLW_SECRET_KEY = import.meta.env.VITE_FLW_SECRET_KEY as string | undefined;

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
    // Enterprise → contact sales
    window.location.href = `mailto:sales@atlascrm.com?subject=Atlas%20CRM%20Enterprise%20Plan`;
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
 * Record a successful subscription payment in the database.
 * This updates the subscription + organization plan.
 */
export async function recordSubscription(params: {
  orgId: string;
  plan: string;
  txRef: string;
  paymentId: string;
}): Promise<{ success: boolean; error?: string }> {
  const { orgId, plan, txRef, paymentId } = params;
  const price = PLAN_PRICES[plan];
  if (!price) return { success: false, error: 'Invalid plan' };

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  // Upsert subscription record
  const { error: subError } = await supabase.from('subscriptions').upsert({
    org_id: orgId,
    plan,
    status: 'active',
    price_cents: price.cents,
    currency: 'USD',
    billing_cycle: 'monthly',
    flutterwave_tx_ref: txRef,
    flutterwave_payment_id: paymentId,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
  }, { onConflict: 'org_id' });

  if (subError) return { success: false, error: subError.message };

  // Update org plan
  const { error: orgError } = await supabase
    .from('organizations')
    .update({ plan })
    .eq('id', orgId);

  if (orgError) return { success: false, error: orgError.message };

  return { success: true };
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
