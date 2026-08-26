import { supabase } from '@/lib/supabase';

/**
 * PayUnit plan prices in XAF (Central African CFA Franc — zero-decimal
 * currency, no cents). PayUnit's confirmed API example only demonstrates
 * XAF; its supported mobile-money operators (MTN MoMo, Orange Money,
 * Express Union, YUP) are all CFA-zone providers, so pricing is expressed
 * in XAF rather than converted from the USD prices used elsewhere.
 *
 * ⚠️ These XAF amounts are a placeholder peg (~600 XAF / USD) and MUST be
 * reviewed and set to your actual desired local pricing before enabling
 * PayUnit in production — do not rely on this exchange rate for real
 * charges.
 */
export const PAYUNIT_PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  starter: { amount: 11400, label: 'Starter — ~19 USD/mo' },
  growth: { amount: 29400, label: 'Growth — ~49 USD/mo' },
  pro: { amount: 71400, label: 'Pro — ~119 USD/mo' },
  enterprise: { amount: 131400, label: 'Enterprise — ~219 USD/mo' },
};

/**
 * Unlike Flutterwave (which uses a public key safe to expose to the
 * browser), PayUnit's credentials (api_user/api_password/api_key) must
 * stay entirely server-side — there is no public/client key. Availability
 * can only be confirmed by asking the edge function, not by checking an
 * env var in the browser.
 */
export async function initiatePayunitCheckout(params: {
  plan: string;
  orgId: string;
  paymentCountry?: string;
}): Promise<{ ok: boolean; transactionUrl?: string; msg?: string }> {
  const { plan, orgId, paymentCountry } = params;
  const price = PAYUNIT_PLAN_PRICES[plan];
  if (!price || price.amount === 0) {
    return { ok: false, msg: 'enterprise_contact_sales' };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payunit-initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token || ''}`,
      },
      body: JSON.stringify({
        plan,
        org_id: orgId,
        payment_country: paymentCountry,
        return_url: `${window.location.origin}/app/billing?payunit_status=return`,
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      return { ok: false, msg: result.msg || 'PayUnit checkout failed' };
    }
    return { ok: true, transactionUrl: result.transaction_url };
  } catch (err) {
    return { ok: false, msg: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Called when the user lands back on /app/billing?payunit_status=return
 * after completing (or abandoning) the hosted PayUnit payment page. The
 * actual status is always re-confirmed server-side via the edge function
 * (which calls PayUnit's own paymentstatus endpoint) — the redirect alone
 * proves nothing about whether the payment succeeded.
 */
export async function confirmPayunitPayment(transactionId: string): Promise<{ ok: boolean; status?: string; msg?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payunit-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token || ''}`,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      return { ok: false, msg: result.msg || 'Could not confirm payment' };
    }
    return { ok: true, status: result.status };
  } catch (err) {
    return { ok: false, msg: err instanceof Error ? err.message : String(err) };
  }
}
