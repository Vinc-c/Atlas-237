import { isFlutterwaveConfigured, initiateFlutterwaveCheckout, recordSubscription } from '@/lib/flutterwave';
import { isPayunitConfigured, initiatePayunitCheckout } from '@/lib/payunit';
import { isPaystackConfigured, initiatePaystackCheckout, confirmPaystackPayment } from '@/lib/paystack';
import { isPaddleConfigured, initiatePaddleCheckout, confirmPaddlePayment } from '@/lib/paddle';

/**
 * Payment Service Provider registry.
 *
 * All subscription pricing is in USD (see plans.ts). Each PSP is
 * responsible for converting to whatever currency it actually settles in
 * — Flutterwave charges the USD amount directly (its checkout handles
 * the customer's local currency display); PayUnit converts USD to XAF
 * server-side at the live exchange rate. The frontend never guesses a
 * conversion itself.
 *
 * Adding a future PSP means adding one entry here — the Billing page
 * doesn't hardcode which providers exist. `checkAvailable` must reflect
 * real configuration (a real client key present, or a real server-side
 * ping), never a hardcoded `true` — an unavailable PSP must not appear
 * as a choice, the exact "always shown, sometimes broken" pattern this
 * registry replaces.
 */
export interface PspOption {
  key: string;
  /** Internal label — used only for logging/dev reference, never shown to the customer. */
  label: string;
  /** Customer-facing description of the payment method (e.g. "Card / bank transfer"). Shown in the picker instead of the PSP's name. */
  method: string;
  checkAvailable: () => Promise<boolean>;
}

export const PSP_REGISTRY: PspOption[] = [
  {
    key: 'flutterwave',
    label: 'Flutterwave',
    method: 'Card / bank transfer',
    checkAvailable: async () => isFlutterwaveConfigured(),
  },
  {
    key: 'payunit',
    label: 'PayUnit',
    method: 'Mobile Money (MTN, Orange, Express Union, YUP)',
    checkAvailable: () => isPayunitConfigured(),
  },
  {
    key: 'paystack',
    label: 'Paystack',
    method: 'Card / bank / mobile money',
    checkAvailable: async () => isPaystackConfigured(),
  },
  {
    key: 'paddle',
    label: 'Paddle',
    method: 'Card / PayPal / Apple Pay (global, Merchant of Record)',
    checkAvailable: async () => isPaddleConfigured(),
  },
  // Future PSPs are added here — the Billing page automatically picks
  // them up, checks availability, and includes them in the manual-
  // selection list. Nothing else needs to change.
];

/** Checks every registered PSP in parallel and returns only the available ones, in registry priority order. */
export async function getAvailablePsps(): Promise<PspOption[]> {
  const results = await Promise.all(PSP_REGISTRY.map(async (psp) => ({ psp, available: await psp.checkAvailable() })));
  return results.filter((r) => r.available).map((r) => r.psp);
}

export async function payWithPsp(
  pspKey: string,
  params: { plan: string; orgId: string; email: string; paymentCountry?: string },
): Promise<{ ok: boolean; msg?: string; redirected?: boolean }> {
  if (pspKey === 'flutterwave') {
    return new Promise((resolve) => {
      initiateFlutterwaveCheckout({
        plan: params.plan,
        email: params.email,
        orgId: params.orgId,
        onSuccess: async (txRef, paymentId) => {
          const res = await recordSubscription({ orgId: params.orgId, plan: params.plan, txRef, paymentId });
          resolve(res.success ? { ok: true } : { ok: false, msg: res.error });
        },
        onClose: () => resolve({ ok: false, msg: 'cancelled' }),
      });
    });
  }
  if (pspKey === 'payunit') {
    const result = await initiatePayunitCheckout({ plan: params.plan, orgId: params.orgId, paymentCountry: params.paymentCountry });
    if (!result.ok || !result.transactionUrl) {
      return { ok: false, msg: result.msg };
    }
    sessionStorage.setItem('payunit_pending_tx', result.transactionUrl.split('/').pop() || '');
    window.location.href = result.transactionUrl;
    return { ok: true, redirected: true };
  }
  if (pspKey === 'paystack') {
    return new Promise((resolve) => {
      initiatePaystackCheckout({
        plan: params.plan,
        email: params.email,
        orgId: params.orgId,
        onSuccess: async (reference) => {
          const res = await confirmPaystackPayment({ orgId: params.orgId, plan: params.plan, reference });
          resolve(res.success ? { ok: true } : { ok: false, msg: res.error });
        },
        onClose: () => resolve({ ok: false, msg: 'cancelled' }),
      });
    });
  }
  if (pspKey === 'paddle') {
    return new Promise((resolve) => {
      initiatePaddleCheckout({
        plan: params.plan,
        email: params.email,
        orgId: params.orgId,
        onSuccess: async (transactionId) => {
          const res = await confirmPaddlePayment({ orgId: params.orgId, plan: params.plan, transactionId });
          resolve(res.success ? { ok: true } : { ok: false, msg: res.error });
        },
        onClose: () => resolve({ ok: false, msg: 'cancelled' }),
      });
    });
  }
  return { ok: false, msg: 'unknown_psp' };
}
