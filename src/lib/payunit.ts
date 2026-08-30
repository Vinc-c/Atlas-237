import { supabase } from '@/lib/supabase';

/**
 * All subscription plans are priced in USD (see src/lib/plans.ts — the
 * single source of truth for the $ amount). PayUnit settles in XAF, so
 * the actual charge amount is computed server-side, in
 * supabase/functions/payunit-initialize, by converting the USD price to
 * XAF at the live exchange rate at the moment of checkout — never a
 * fixed/guessed peg on the client. The frontend never computes or
 * displays a currency-converted amount itself; it always shows the USD
 * price and lets the PayUnit-hosted payment page show the customer the
 * converted total in their own currency before they pay.
 */
const KNOWN_PLANS = new Set(['starter', 'growth', 'pro', 'enterprise']);

/**
 * Unlike Flutterwave (which uses a public key safe to expose to the
 * browser), PayUnit's credentials (api_user/api_password/api_key) must
 * stay entirely server-side — there is no public/client key. Availability
 * can only be confirmed by asking the edge function, not by checking an
 * env var in the browser.
 */
export async function isPayunitConfigured(): Promise<boolean> {
  try {
    // This edge function requires a valid JWT at the Supabase gateway level
    // (verify_jwt: true) — a request with no Authorization header at all is
    // rejected by the platform before the function code ever runs, which
    // looks identical from here to "PayUnit isn't configured" even when
    // it genuinely is. The anon key is itself a valid signed JWT, so it's
    // enough to pass this public availability check (no user session or
    // sensitive data involved) without requiring the caller to be logged in.
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payunit-initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ check: true }),
    });
    const result = await res.json();
    return Boolean(res.ok && result.ok && result.configured);
  } catch {
    return false;
  }
}

export async function initiatePayunitCheckout(params: {
  plan: string;
  orgId: string;
  paymentCountry?: string;
}): Promise<{ ok: boolean; transactionUrl?: string; msg?: string }> {
  const { plan, orgId, paymentCountry } = params;
  if (!KNOWN_PLANS.has(plan)) {
    return { ok: false, msg: 'unknown_plan' };
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
