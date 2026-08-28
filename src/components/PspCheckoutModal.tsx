import { useState } from 'react';
import { X, Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import type { PspOption } from '@/lib/psp';

/**
 * The customer never needs to know which processor is behind the scenes
 * (Flutterwave, PayUnit, or a future one) — only the payment METHOD
 * matters to them (card, mobile money, etc.), which is what
 * PspOption.method already describes. This modal only ever renders
 * `.method`, never `.label` (the internal PSP name).
 */
export function PspCheckoutModal({
  planLabel,
  priceLabel,
  availablePsps,
  selectedPsp,
  onSelect,
  onConfirm,
  onClose,
  busy,
  error,
  lang,
}: {
  planLabel: string;
  priceLabel: string;
  availablePsps: PspOption[];
  selectedPsp: string;
  onSelect: (key: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  busy: boolean;
  error: string;
  lang: string;
}) {
  const [localError] = useState(error);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-950">{lang === 'fr' ? 'Confirmer le paiement' : 'Confirm payment'}</h3>
            <p className="mt-1 text-sm text-ink-500">{planLabel} — {priceLabel}</p>
          </div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600"><X size={18} /></button>
        </div>

        {availablePsps.length === 0 ? (
          <p className="mt-4 rounded-lg bg-warning-50 p-3 text-sm text-warning-700">
            {lang === 'fr' ? 'Aucun moyen de paiement n\'est disponible actuellement. Contactez le support.' : 'No payment method is currently available. Contact support.'}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-ink-500">{lang === 'fr' ? 'Mode de paiement' : 'Payment method'}</p>
            {availablePsps.map((psp) => (
              <button
                key={psp.key}
                onClick={() => onSelect(psp.key)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${selectedPsp === psp.key ? 'border-primary-400 bg-primary-50' : 'border-ink-200 hover:bg-ink-50'}`}
              >
                <span className="text-sm text-ink-800">{psp.method}</span>
                {selectedPsp === psp.key && <CheckCircle2 size={16} className="text-primary-600" />}
              </button>
            ))}
          </div>
        )}

        {(localError || error) && (
          <p className="mt-3 rounded-lg bg-error-50 p-2 text-xs text-error-700">{error || localError}</p>
        )}

        <button
          onClick={onConfirm}
          disabled={busy || !selectedPsp || availablePsps.length === 0}
          className="btn-primary btn-sm mt-5 flex w-full items-center justify-center gap-1.5"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          {busy ? (lang === 'fr' ? 'Paiement...' : 'Paying...') : (lang === 'fr' ? 'Payer maintenant' : 'Pay now')}
        </button>
      </div>
    </div>
  );
}
