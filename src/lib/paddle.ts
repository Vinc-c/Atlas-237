import { supabase } from '@/lib/supabase';

/**
 * Paddle Billing checkout. The "client-side token" (pt_...) is safe to
 * expose to the browser — like a public key, it can only open a checkout,
 * not read or charge anything on its own. The actual charge confirmation
 * happens in paddle-verify (server-side, secret API key, never exposed).
 *
 * Unlike Flutterwave/Paystack (which accept a raw amount), Paddle Billing
 * checkouts are built around Price objects you create once in the Paddle
 * dashboard — one per plan. Those Price IDs are configured via env vars
 * below; until all four are set, isPaddleConfigured() returns false and
 * Paddle simply doesn't appear as a payment option, same as any other PSP
 * in this registry when it isn't configured.
 */
export const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
export const PADDLE_ENVIRONMENT = (import.meta.env.VITE_PADDLE_ENVIRONMENT as string | undefined) || 'production';

const PADDLE_PRICE_IDS: Record<string, string | undefined> = {
  starter: import.meta.env.VITE_PADDLE_PRICE_STARTER as string | undefined,
  growth: import.meta.env.VITE_PADDLE_PRICE_GROWTH as string | undefined,
  pro: import.meta.env.VITE_PADDLE_PRICE_PRO as string | undefined,
  enterprise: import.meta.env.VITE_PADDLE_PRICE_ENTERPRISE as string | undefined,
};

export function isPaddleConfigured() {
  return Boolean(PADDLE_CLIENT_TOKEN) && Object.values(PADDLE_PRICE_IDS).every(Boolean);
}

interface PaddleCheckoutEvent {
  name: string;
  data?: { transaction_id?: string; id?: string };
}

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (opts: { token: string; eventCallback?: (event: PaddleCheckoutEvent) => void }) => void;
      Checkout: { open: (opts: { items: { priceId: string; quantity: number }[]; customData?: Record<string, unknown>; customer?: { email: string } }) => void };
    };
  }
}

let paddleInitialized = false;

function loadPaddleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Paddle) return resolve();
    const existing = document.getElementById('paddle-script');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const script = document.createElement('script');
    script.id = 'paddle-script';
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function initiatePaddleCheckout(params: {
  plan: string;
  email: string;
  orgId: string;
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}) {
  const { plan, email, orgId, onSuccess, onClose } = params;
  const priceId = PADDLE_PRICE_IDS[plan];
  if (!priceId || !PADDLE_CLIENT_TOKEN) return;

  loadPaddleScript().then(() => {
    if (!window.Paddle) return;
    if (!paddleInitialized) {
      if (PADDLE_ENVIRONMENT === 'sandbox') window.Paddle.Environment.set('sandbox');
      window.Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (event) => {
          if (event.name === 'checkout.completed') {
            const txId = event.data?.transaction_id || event.data?.id;
            if (txId) onSuccess(txId);
          } else if (event.name === 'checkout.closed') {
            onClose();
          }
        },
      });
      paddleInitialized = true;
    }
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { org_id: orgId, plan },
      customer: { email },
    });
  });
}

/**
 * Confirm a Paddle transaction and activate the subscription — verifies
 * server-side with Paddle's own API before writing anything, same pattern
 * as Flutterwave/Paystack/PayUnit.
 */
export async function confirmPaddlePayment(params: { orgId: string; plan: string; transactionId: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paddle-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({ org_id: params.orgId, plan: params.plan, transaction_id: params.transactionId }),
    });
    const result = await res.json();
    return result.ok ? { success: true } : { success: false, error: result.msg || 'Verification failed' };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
