import { useState } from 'react';
import { MessageCircle, Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useConnectedProviders, callIntegrationAction } from '@/lib/integrations';
import { useAuth } from '@/context/AuthContext';

interface QuickMessageButtonProps {
  /** Recipient's phone number (E.164-ish, digits with optional +). Falls back to whatsapp field if phone is empty. */
  phone?: string | null;
  /** For context in the modal title only. */
  name?: string | null;
}

/**
 * Small icon button that opens a "Send a message" modal for one contact or
 * lead — the actual, discoverable place someone uses a connected WhatsApp
 * or Twilio integration day-to-day, instead of having to build a Workflow
 * for a single message. Only shows channels that are (a) actually connected
 * and (b) have a phone number to send to. Calls the same real
 * integration-action edge function Workflows use — no separate code path.
 */
export function QuickMessageButton({ phone, name }: QuickMessageButtonProps) {
  const { language } = useAuth();
  const lang = language;
  const { connected } = useConnectedProviders();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<'whatsapp' | 'twilio'>('whatsapp');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const hasWhatsapp = connected.has('whatsapp');
  const hasTwilio = connected.has('twilio');
  if (!phone || (!hasWhatsapp && !hasTwilio)) return null;

  async function send() {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    const action = channel === 'whatsapp' ? 'send_whatsapp' : 'send_sms';
    const params = channel === 'whatsapp' ? { to: phone, message } : { to: phone, message };
    const res = await callIntegrationAction(action, params);
    setResult(res);
    setSending(false);
    if (res.ok) setMessage('');
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); setResult(null); setChannel(hasWhatsapp ? 'whatsapp' : 'twilio'); }}
        className="p-1.5 rounded text-ink-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
        title={lang === 'fr' ? 'Envoyer un message' : 'Send a message'}
      >
        <MessageCircle size={14} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={lang === 'fr' ? `Envoyer un message${name ? ` à ${name}` : ''}` : `Send a message${name ? ` to ${name}` : ''}`}>
        <div className="space-y-4">
          {hasWhatsapp && hasTwilio && (
            <div className="flex gap-2">
              <button onClick={() => setChannel('whatsapp')} className={`btn-sm flex-1 ${channel === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}>WhatsApp</button>
              <button onClick={() => setChannel('twilio')} className={`btn-sm flex-1 ${channel === 'twilio' ? 'btn-primary' : 'btn-secondary'}`}>SMS (Twilio)</button>
            </div>
          )}
          <div>
            <label className="label">{lang === 'fr' ? 'Destinataire' : 'To'}</label>
            <input className="input" value={phone} disabled />
          </div>
          <div>
            <label className="label">{lang === 'fr' ? 'Message' : 'Message'}</label>
            <textarea className="input" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder={lang === 'fr' ? 'Votre message…' : 'Your message…'} />
          </div>
          {result && (
            <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${result.ok ? 'border-success-200 bg-success-50 text-success-700' : 'border-error-200 bg-error-50 text-error-700'}`}>
              {result.ok ? <CheckCircle2 size={16} className="mt-0.5 flex-none" /> : <AlertCircle size={16} className="mt-0.5 flex-none" />}
              <span>{result.msg}</span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-secondary btn-sm">{lang === 'fr' ? 'Fermer' : 'Close'}</button>
            <button onClick={send} disabled={sending || !message.trim()} className="btn-primary btn-sm">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {lang === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
