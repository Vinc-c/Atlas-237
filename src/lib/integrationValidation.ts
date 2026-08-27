// Per-provider API key format validation.
//
// Why this exists: the integration "Connect" flow used to accept any
// string at all and immediately mark the integration as "connected" —
// so pasting a Google Gemini key into the Anthropic (Claude) field, for
// example, was silently accepted as a working connection. This file is
// the first line of defense against that: every provider's *primary*
// secret field is checked against its real, documented key format
// before anything is saved. A format match doesn't prove the key is
// live/active (only `verify-integration-key` can do that, for the
// subset of providers listed there) — but a format MISMATCH proves
// the key is definitely wrong, which is exactly the bug being fixed.
//
// Patterns are sourced from each provider's own developer docs. Where a
// provider doesn't publish a stable, checkable prefix (many regional
// PSPs just issue opaque tokens), no pattern is enforced beyond a
// sensible minimum length — inventing a fake-looking pattern would just
// be a different kind of bluff.

interface KeyRule {
  /** Which configField key this rule applies to (the "primary secret"). */
  field: string;
  pattern: RegExp;
  hint: string;
}

const RULES: Record<string, KeyRule> = {
  openai: { field: 'api_key', pattern: /^sk-[A-Za-z0-9_-]{20,}$/, hint: 'starts with "sk-"' },
  anthropic: { field: 'api_key', pattern: /^sk-ant-[A-Za-z0-9_-]{20,}$/, hint: 'starts with "sk-ant-"' },
  gemini: { field: 'api_key', pattern: /^AIza[A-Za-z0-9_-]{20,}$/, hint: 'starts with "AIza"' },
  stripe: { field: 'secret_key', pattern: /^sk_(live|test)_[A-Za-z0-9]{20,}$/, hint: 'starts with "sk_live_" or "sk_test_"' },
  twilio: { field: 'account_sid', pattern: /^AC[a-f0-9]{32}$/, hint: 'starts with "AC" followed by 32 hex characters' },
  shopify: { field: 'access_token', pattern: /^shp(at|ca|ss)_[a-f0-9]{32,}$/, hint: 'starts with "shpat_", "shpca_" or "shpss_"' },
  hubspot: { field: 'api_key', pattern: /^(pat-|)[A-Za-z0-9-]{20,}$/, hint: 'a HubSpot private app token (usually starts with "pat-")' },
  mailchimp: { field: 'api_key', pattern: /^[a-f0-9]{32}-us[0-9]{1,2}$/, hint: 'a 32-char key ending in "-usX" (your datacenter)' },
  sendgrid: { field: 'api_key', pattern: /^SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}$/, hint: 'starts with "SG."' },
  paypal: { field: 'client_secret', pattern: /^[A-Za-z0-9_-]{20,}$/, hint: 'a PayPal REST app client secret' },
  flutterwave: { field: 'secret_key', pattern: /^FLWSECK(_TEST)?-[a-zA-Z0-9]{20,}(-X)?$/, hint: 'starts with "FLWSECK-" or "FLWSECK_TEST-"' },
  paystack: { field: 'secret_key', pattern: /^sk_(live|test)_[A-Za-z0-9]{20,}$/, hint: 'starts with "sk_live_" or "sk_test_"' },
  chapa: { field: 'secret_key', pattern: /^CHASECK(_TEST)?-[A-Za-z0-9]{20,}$/, hint: 'starts with "CHASECK-" or "CHASECK_TEST-"' },
  mollie: { field: 'api_key', pattern: /^(live|test)_[A-Za-z0-9]{20,}$/, hint: 'starts with "live_" or "test_"' },
  checkout_com: { field: 'secret_key', pattern: /^sk_(sbox_)?[a-f0-9-]{20,}$/, hint: 'starts with "sk_" (or "sk_sbox_" for sandbox)' },
  wave: { field: 'api_key', pattern: /^wave_(sn|ci)_(prod|test)_[A-Za-z0-9]{15,}$/, hint: 'starts with "wave_sn_prod_" or similar' },
  telegram: { field: 'bot_token', pattern: /^\d{6,10}:[A-Za-z0-9_-]{30,}$/, hint: 'a bot token like "123456789:ABC-DEF..."' },
  calendly: { field: 'personal_access_token', pattern: /^eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/, hint: 'a Calendly personal access JWT (three dot-separated parts)' },
  freshdesk: { field: 'api_key', pattern: /^[A-Za-z0-9]{15,25}$/, hint: 'a Freshdesk API key (alphanumeric, ~20 chars)' },
  sage: { field: 'api_key', pattern: /^[A-Za-z0-9_-]{20,}$/, hint: 'a Sage API access token' },
  xero: { field: 'client_secret', pattern: /^[A-Za-z0-9_-]{20,}$/, hint: 'a Xero OAuth client secret' },
  docusign: { field: 'integration_key', pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, hint: 'a DocuSign Integration Key (UUID format)' },
};

/** Generic fallback: reject empty/placeholder-looking or obviously too-short values. */
const PLACEHOLDER_VALUES = new Set(['xxx', 'xxxx', 'xxxxx', 'todo', 'changeme', 'test', 'n/a', 'none']);

export function validateKeyFormat(provider: string, configData: Record<string, string>): { ok: true } | { ok: false; field: string; message: string } {
  const rule = RULES[provider];
  if (rule) {
    const value = (configData[rule.field] || '').trim();
    if (!value) return { ok: false, field: rule.field, message: 'required' };
    if (!rule.pattern.test(value)) {
      return { ok: false, field: rule.field, message: `format_mismatch:${rule.hint}` };
    }
    return { ok: true };
  }
  // No documented pattern for this provider — still catch the obviously-fake
  // cases (empty, placeholder text, a value copy-pasted with < 6 characters).
  const values = Object.values(configData).map((v) => (v || '').trim());
  for (const v of values) {
    if (v && v.length < 6) return { ok: false, field: '', message: 'too_short' };
    if (v && PLACEHOLDER_VALUES.has(v.toLowerCase())) return { ok: false, field: '', message: 'placeholder' };
  }
  return { ok: true };
}

/** Providers with a real live-verification call in the verify-integration-key edge function. */
export const LIVE_VERIFIABLE_PROVIDERS = new Set([
  'openai', 'anthropic', 'gemini', 'stripe', 'twilio', 'shopify', 'hubspot',
  'mailchimp', 'flutterwave', 'paystack', 'calendly', 'telegram', 'freshdesk',
]);
