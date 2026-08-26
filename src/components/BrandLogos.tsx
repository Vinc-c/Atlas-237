interface BrandLogoProps {
  provider: string;
  size?: number;
  className?: string;
}

export function BrandLogo({ provider, size = 24, className = '' }: BrandLogoProps) {
  const s = { width: size, height: size };
  switch (provider) {
    case 'gmail':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Gmail">
          <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" fill="#fff" stroke="#EA4335" strokeWidth="0.5" />
          <path d="M3 6l9 7 9-7" stroke="#EA4335" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          <path d="M3 6v12l6-5.5L3 6Z" fill="#EA4335" opacity="0.85" />
          <path d="M21 6v12l-6-5.5L21 6Z" fill="#C5221F" />
          <path d="M3 6l9 7 9-7" stroke="#4285F4" strokeWidth="0" fill="none" />
        </svg>
      );
    case 'outlook':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Outlook">
          <rect x="2" y="6" width="13" height="12" rx="1" fill="#0078D4" />
          <rect x="3.5" y="7.5" width="10" height="9" rx="0.5" fill="#fff" />
          <path d="M6 9.5h5M6 11.5h5M6 13.5h3" stroke="#0078D4" strokeWidth="1" strokeLinecap="round" />
          <circle cx="17" cy="12" r="5" fill="#0078D4" />
          <circle cx="17" cy="12" r="3.5" fill="#fff" />
          <path d="M17 8.5v7M13.5 12h7" stroke="#0078D4" strokeWidth="1" />
          <path d="M15.5 9.5l3 5M18.5 9.5l-3 5" stroke="#106EBE" strokeWidth="0.6" />
        </svg>
      );
    case 'stripe':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Stripe">
          <rect width="24" height="24" rx="4" fill="#635BFF" />
          <path d="M11.5 8.5c0-.8.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V3.8C16.7 3.1 15 2.8 13.3 2.8c-4.2 0-7 2.2-7 5.8 0 5.6 7.8 4.7 7.8 7.1 0 .9-.8 1.3-2 1.3-1.8 0-4.1-.7-5.9-1.8v5.1c2 .9 4.1 1.3 5.9 1.3 4.3 0 7.2-2.1 7.2-5.8 0-6-7.8-4.9-7.8-7.3Z" fill="#fff" />
        </svg>
      );
    case 'slack':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Slack">
          <path d="M5 15a2 2 0 1 1 0-4h2v4H5Z" fill="#E01E5A" />
          <path d="M5 8a2 2 0 1 1 4 0v2H5V8Z" fill="#36C5F0" />
          <path d="M19 9a2 2 0 1 1 0 4h-2V9h2Z" fill="#2EB67D" />
          <path d="M19 16a2 2 0 1 1-4 0v-2h4v2Z" fill="#ECB22E" />
          <path d="M9 5a2 2 0 1 1 4 0v2H9V5Z" fill="#36C5F0" />
          <path d="M8 19a2 2 0 1 1 0-4h2v4H8Z" fill="#E01E5A" />
          <path d="M15 19a2 2 0 1 1-4 0v-2h4v2Z" fill="#ECB22E" />
          <path d="M16 5a2 2 0 1 1 0 4h-2V5h2Z" fill="#2EB67D" />
        </svg>
      );
    case 'zoom':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Zoom">
          <rect width="24" height="24" rx="4" fill="#2D8CFF" />
          <path d="M4 8.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7Z" fill="#fff" />
          <path d="M14 10.5l4-3v9l-4-3v-3Z" fill="#fff" />
        </svg>
      );
    case 'hubspot':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="HubSpot">
          <path d="M18.5 9.5V7.2a1.3 1.3 0 1 0-1.3-1.3v.5a6.8 6.8 0 0 0-4.8 12.3l-1.2 1.2a1 1 0 0 0 .7 1.7 1 1 0 0 0 .7-.3l1.3-1.3a6.8 6.8 0 0 0 8.6-8.1l1.4-1a1.3 1.3 0 1 0-.7-1.3l-1.6 1.1a6.8 6.8 0 0 0-2.6-1.8Z" fill="#FF7A59" />
          <circle cx="18.5" cy="15.8" r="2.8" fill="#fff" />
          <circle cx="18.5" cy="15.8" r="1.6" fill="#FF7A59" />
        </svg>
      );
    case 'quickbooks':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="QuickBooks">
          <rect width="24" height="24" rx="4" fill="#2CA01C" />
          <path d="M4 12a8 8 0 0 1 16 0v3h-3v-3a5 5 0 0 0-10 0v3H4v-3Z" fill="#fff" />
          <path d="M4 15h3v4H4zM17 15h3v4h-3z" fill="#fff" />
        </svg>
      );
    case 'mailchimp':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Mailchimp">
          <path d="M20 12.5c0-.6-.2-1.1-.5-1.5.3-1 .1-2.3-.6-3.2-.4-1.6-1.6-3-3.2-3.7-.5-1.3-1.8-2.1-3.2-2.1-1.4 0-2.6.8-3.1 2-1.6.3-2.9 1.4-3.5 2.9-.4.9-.4 2 .1 3-.4.5-.6 1.1-.6 1.7 0 1.1.7 2 1.7 2.4.1 1.3 1.2 2.4 2.6 2.5.3 1.2 1.4 2 2.7 2 .8 0 1.5-.3 2-.8.5.5 1.2.8 2 .8 1.3 0 2.4-.8 2.7-2 1.4-.1 2.5-1.2 2.6-2.5.9-.4 1.5-1.3 1.5-2.3Z" fill="#FFE01B" />
          <path d="M12 21c-1 0-1.8-.7-2-1.6 1.3-.2 2.3-1.3 2.3-2.7v-5.2c0-.3.2-.5.5-.5s.5.2.5.5v5.2c0 1.4 1 2.5 2.3 2.7-.2.9-1 1.6-2 1.6h-1.6Z" fill="#000" opacity="0.15" />
        </svg>
      );
    case 'twilio':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Twilio">
          <rect width="24" height="24" rx="4" fill="#F22F46" />
          <circle cx="12" cy="12" r="7" fill="#fff" />
          <circle cx="9.5" cy="9.5" r="1.5" fill="#F22F46" />
          <circle cx="14.5" cy="9.5" r="1.5" fill="#F22F46" />
          <circle cx="9.5" cy="14.5" r="1.5" fill="#F22F46" />
          <circle cx="14.5" cy="14.5" r="1.5" fill="#F22F46" />
        </svg>
      );
    case 'shopify':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Shopify">
          <path d="M15.4 3.2c0-.1-.1-.2-.2-.1-.1 0-1 .3-1.4 2.4l-5.6 1.8-.6 7.8c0 .4.2.7.6.8l5.2 1.5c.4.1.7-.1.8-.4l1.3-9.8c.2-1.8-.3-3.4-.5-3.9Z" fill="#95BF47" />
          <path d="M13.8 5.5c.4-2.1 1.3-2.4 1.4-2.4.1-.1.2 0 .2.1.2.5.7 2.1.5 3.9L14 17.6c-.1.3-.4.5-.8.4l-5.2-1.5c-.4-.1-.6-.4-.6-.8l.1-1.2 4.8-1.5.5-7.5Z" fill="#5E8E3E" />
          <path d="M9 8.8c0-.5-.4-.8-.8-.7l-.4.1L7 7.8c0-1.1-.7-2-1.6-2-.9 0-1.6.8-1.6 2l-.3.3-.4-.1c-.5-.1-.8.2-.8.7l.4 4.4c0 .3.3.5.5.5h4.5c.3 0 .5-.2.5-.5l.4-4.4ZM5 8.3l.4-.3h.1V7.8c0-.7.4-1.2.9-1.2s.9.5.9 1.2v.2H5Z" fill="#FFF" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="WhatsApp">
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Z" fill="#25D366" />
          <path d="M8.2 7.5c-.2 0-.4 0-.5.2-.3.3-.8.8-.8 1.9 0 1.1.8 2.2.9 2.3.1.2 1.6 2.5 4 3.4 1.9.7 2.3.6 2.7.5.4-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.3-.2-.6-.4-.3-.2-1.2-.6-1.4-.7-.2-.1-.4-.1-.5.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-.3-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.5l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4Z" fill="#fff" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Telegram">
          <circle cx="12" cy="12" r="11" fill="#26A5E4" />
          <path d="M5.5 11.6l10.8-4.2c.5-.2 1 .1.8.8l-1.8 8.6c-.1.5-.5.7-.9.4l-2.5-1.9-1.2 1.2c-.1.1-.3.2-.5.1l.2-2.6 4.7-4.2c.2-.2 0-.3-.2-.1L8.8 11l-2.5-.8c-.5-.2-.6-.5-.1-.7Z" fill="#fff" />
        </svg>
      );
    case 'aircall':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Aircall">
          <rect width="24" height="24" rx="6" fill="#00B388" />
          <path d="M8 6.5c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v8c0 1.7-1.3 3-3 3h-2c-1.7 0-3-1.3-3-3v-8Z" fill="#fff" />
          <path d="M9 9.5h6M9 11.5h6M9 13.5h4" stroke="#00B388" strokeWidth="0.8" strokeLinecap="round" />
          <circle cx="12" cy="19" r="1.5" fill="#fff" />
        </svg>
      );
    case 'calendly':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Calendly">
          <rect width="24" height="24" rx="4" fill="#006BFF" />
          <rect x="5" y="6" width="14" height="13" rx="2" fill="#fff" />
          <path d="M8 4.5v3M16 4.5v3" stroke="#006BFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 13l2 2 4-4" stroke="#006BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'google_meet':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Meet">
          <rect x="2" y="6" width="13" height="12" rx="2" fill="#00832D" />
          <path d="M15 9l4-2v10l-4-2V9Z" fill="#00AC47" />
          <path d="M15 9l4-2-2-3-4 3 2 2Z" fill="#FFBA00" />
          <path d="M15 15l4 2-2 3-4-3 2-2Z" fill="#0066D9" />
          <path d="M11 7l-2 2h2V7Z" fill="#EA4335" />
          <path d="M9 17l2-2h-2v2Z" fill="#00AC47" />
          <rect x="5" y="9" width="4" height="6" rx="0.5" fill="#fff" opacity="0.95" />
        </svg>
      );
    case 'libooks':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Libooks">
          <rect width="24" height="24" rx="5" fill="#0F766E" />
          <path d="M6 6.5a1 1 0 0 1 1-1h5.5a3 3 0 0 1 0 6H7a1 1 0 0 1-1-1v-4Z" fill="#fff" opacity="0.95" />
          <path d="M6 12.5a1 1 0 0 1 1-1h6.5a3 3 0 0 1 0 6H7a1 1 0 0 1-1-1v-4Z" fill="#fff" />
          <circle cx="12.5" cy="8.5" r="1" fill="#0F766E" />
          <circle cx="13.5" cy="15" r="1.1" fill="#0F766E" />
        </svg>
      );
    case 'sellia':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Sellia">
          <rect width="24" height="24" rx="5" fill="#EA580C" />
          <path d="M7 9.2a2.2 2.2 0 0 1 2.2-2.2h3.4a1 1 0 1 1 0 2H9.2a.2.2 0 0 0 0 .4h3.6A2.2 2.2 0 0 1 15 11.6a2.2 2.2 0 0 1-2.2 2.2H9a1 1 0 1 1 0-2h3.6a.2.2 0 0 0 0-.4H9A2.2 2.2 0 0 1 7 9.2Z" fill="#fff" />
          <circle cx="17.3" cy="16.3" r="2" fill="#fff" opacity="0.9" />
        </svg>
      );
    case 'bigcommerce':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="BigCommerce">
          <rect width="24" height="24" rx="5" fill="#121118" />
          <path d="M7 7h6.2a2.6 2.6 0 0 1 1.7 4.5A2.7 2.7 0 0 1 13.5 17H7V7Zm2 2v2.2h3.9a1.1 1.1 0 0 0 0-2.2H9Zm0 4.2V15h4.3a1.1 1.1 0 0 0 0-2.2H9v0Z" fill="#fff" />
          <circle cx="17" cy="16.5" r="1.4" fill="#34313F" />
        </svg>
      );
    case 'zapier':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Zapier">
          <rect width="24" height="24" rx="12" fill="#FF4A00" />
          <g fill="#fff">
            <rect x="11" y="4" width="2" height="16" rx="1" />
            <rect x="11" y="4" width="2" height="16" rx="1" transform="rotate(60 12 12)" />
            <rect x="11" y="4" width="2" height="16" rx="1" transform="rotate(120 12 12)" />
          </g>
          <circle cx="12" cy="12" r="2.6" fill="#FF4A00" />
        </svg>
      );
    case 'make':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Make (Integromat)">
          <rect width="24" height="24" rx="5" fill="#6D00CC" />
          <circle cx="9" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="1.4" />
          <circle cx="15.2" cy="12" r="2.4" fill="#7B2FF7" stroke="#fff" strokeWidth="1.4" />
        </svg>
      );
    case 'n8n':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="n8n">
          <rect width="24" height="24" rx="5" fill="#EA4B71" />
          <circle cx="6.5" cy="8" r="2" fill="#fff" />
          <circle cx="17.5" cy="16" r="2" fill="#fff" />
          <path d="M6.5 10v1.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 1 2.5 2.5V16" stroke="#fff" strokeWidth="1.4" fill="none" />
          <circle cx="12" cy="12" r="1.6" fill="#fff" />
        </svg>
      );
    case 'pipedream':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Pipedream">
          <rect width="24" height="24" rx="5" fill="#00E64D" />
          <path d="M6 15c2-5 4-7.5 6-7.5s4 2.5 6 7.5c-2-2-4-3-6-3s-4 1-6 3Z" fill="#1A1A1A" />
        </svg>
      );
    case 'paypal':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="PayPal">
          <rect width="24" height="24" rx="5" fill="#003087" />
          <path d="M9 7.5h3.6c2 0 3.1 1 2.8 2.8-.35 2.1-1.9 3.2-4 3.2h-1l-.5 3H7.5L9 7.5Z" fill="#009CDE" />
          <path d="M10.2 8.7h3.6c2 0 3.1 1 2.8 2.8-.35 2.1-1.9 3.2-4 3.2h-1l-.5 3H8.7l1.5-9Z" fill="#fff" />
        </svg>
      );
    case 'adyen':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Adyen">
          <rect width="24" height="24" rx="5" fill="#0ABF53" />
          <path d="M6 16 10 8h2.4L8.4 16H6Zm7 0 4-8h2.4l-4 8H13Z" fill="#0A1E1A" />
        </svg>
      );
    case 'mollie':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Mollie">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <circle cx="8.5" cy="12" r="3.5" fill="#fff" />
          <circle cx="15.5" cy="12" r="3.5" fill="#B6F24A" />
        </svg>
      );
    case 'checkout_com':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Checkout.com">
          <rect width="24" height="24" rx="5" fill="#0CD3AA" />
          <path d="M15.5 8.2A4.2 4.2 0 1 0 15.9 15.5" stroke="#0A2540" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'worldline':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Worldline">
          <rect width="24" height="24" rx="5" fill="#00025A" />
          <path d="M5 12c1.5-3 3-4.5 4.5-4.5S12.5 9 14 12s3 4.5 4.5 4.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'nexi':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Nexi">
          <rect width="24" height="24" rx="5" fill="#FF5A00" />
          <path d="M7 16V8h2l6 5.2V8h2v8h-2l-6-5.2V16H7Z" fill="#fff" />
        </svg>
      );
    case 'gocardless':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="GoCardless">
          <rect width="24" height="24" rx="5" fill="#000000" />
          <circle cx="12" cy="9" r="3" fill="#fff" />
          <path d="M6 18c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'viva_wallet':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Viva Wallet">
          <rect width="24" height="24" rx="5" fill="#F0483E" />
          <path d="M7 8l5 8 5-8h-2.3L12 13.5 9.3 8H7Z" fill="#fff" />
        </svg>
      );
    case 'revolut_business':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Revolut Business">
          <rect width="24" height="24" rx="5" fill="#0075EB" />
          <path d="M8 7h4.3a3.3 3.3 0 0 1 1.9 6l2.3 4h-2.5l-2-3.6H10V17H8V7Zm2 1.8v2.8h2.2a1.4 1.4 0 0 0 0-2.8H10Z" fill="#fff" />
        </svg>
      );
    case 'flutterwave':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Flutterwave">
          <rect width="24" height="24" rx="5" fill="#F5A623" />
          <path d="M5 9c3 3.5 5 3.5 8 1s6-2.5 8 1" stroke="#0A3A5C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M5 14c3 3.5 5 3.5 8 1s6-2.5 8 1" stroke="#F0245C" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'paystack':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Paystack">
          <rect width="24" height="24" rx="5" fill="#00C3F7" />
          <path d="M6 14.5 10 7l2 4 2-4 4 7.5h-2.3L14 12l-2 3.8L10 12l-1.7 2.5H6Z" fill="#011B33" />
        </svg>
      );
    case 'mpesa':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="M-Pesa">
          <rect width="24" height="24" rx="5" fill="#4CAF50" />
          <path d="M6 16V8h1.8l2.2 3.5L12.2 8H14v8h-1.8v-5l-2.2 3.5L7.8 11v5H6Z" fill="#fff" />
          <rect x="15.5" y="8" width="2.5" height="8" rx="0.5" fill="#EF5350" />
        </svg>
      );
    case 'interswitch':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Interswitch">
          <rect width="24" height="24" rx="5" fill="#EE3524" />
          <path d="M6 9h7a2.5 2.5 0 0 1 0 5H9" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M18 15h-7a2.5 2.5 0 0 1 0-5h4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
        </svg>
      );
    case 'dpo_group':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="DPO Group">
          <rect width="24" height="24" rx="5" fill="#00A651" />
          <circle cx="9" cy="12" r="3" fill="#fff" />
          <circle cx="15" cy="12" r="3" fill="#fff" opacity="0.6" />
        </svg>
      );
    case 'cellulant':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Cellulant">
          <rect width="24" height="24" rx="5" fill="#00B04F" />
          <path d="M15 8.3A4 4 0 1 0 15 15.7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'fawry':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Fawry">
          <rect width="24" height="24" rx="5" fill="#F7941E" />
          <path d="M7 16V8h6v1.8H9v1.5h3.5v1.7H9V16H7Z" fill="#fff" />
        </svg>
      );
    case 'payfast':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="PayFast">
          <rect width="24" height="24" rx="5" fill="#E9420E" />
          <path d="M6 16V8h4.3a2.6 2.6 0 0 1 0 5.2H8V16H6Zm2-4.6h2.1a.9.9 0 0 0 0-1.8H8v1.8Z" fill="#fff" />
          <path d="M13.5 8h4v1.6h-2.2v1.5H17v1.6h-1.7V16h-1.8V8Z" fill="#fff" />
        </svg>
      );
    case 'peach_payments':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Peach Payments">
          <rect width="24" height="24" rx="12" fill="#FF6B6B" />
          <circle cx="12" cy="13" r="4.5" fill="#FFD3B0" />
          <path d="M9.5 8.5c1-1.5 3-2 4-1" stroke="#3C8D5A" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'payunit':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="PayUnit">
          <rect width="24" height="24" rx="5" fill="#1E88E5" />
          <path d="M8 8v5a4 4 0 0 0 8 0V8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'campay':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="CamPay">
          <rect width="24" height="24" rx="5" fill="#00A651" />
          <path d="M16 9a4 4 0 1 0 0 6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="6" y="10.2" width="3" height="1.6" rx="0.6" fill="#FCD116" />
          <rect x="6" y="12.2" width="3" height="1.6" rx="0.6" fill="#CE1126" />
        </svg>
      );
    case 'cinetpay':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="CinetPay">
          <rect width="24" height="24" rx="5" fill="#F7941D" />
          <path d="M8 9c-3 3-3 5 0 6M16 9c3 3 3 5 0 6" stroke="#0A2540" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'kkiapay':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Kkiapay">
          <rect width="24" height="24" rx="5" fill="#FF7A00" />
          <circle cx="9" cy="12" r="3.4" fill="#fff" />
          <path d="M13.5 8l3.5 4-3.5 4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Wave">
          <rect width="24" height="24" rx="12" fill="#1DD3B0" />
          <path d="M5 13c1.5-3 2.5-3 4 0s2.5 3 4 0 2.5-3 4 0 2.5 3 2 0" stroke="#0A2E2A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'orange_money':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Orange Money API">
          <rect width="24" height="24" rx="12" fill="#FF7900" />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" />
          <path d="M12 9v3l2 2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'mtn_momo':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="MTN MoMo API">
          <rect width="24" height="24" rx="5" fill="#FFCC00" />
          <path d="M6 16V8h1.6l2 3.2L11.6 8h1.6v8h-1.7v-5l-1.9 3-1.9-3v5H6Z" fill="#1A1A1A" />
          <circle cx="17.2" cy="12" r="2.4" fill="none" stroke="#1A1A1A" strokeWidth="1.3" />
        </svg>
      );
    case 'chapa':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Chapa">
          <rect width="24" height="24" rx="5" fill="#5E17EB" />
          <path d="M8 16V8l8 5V8" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'semoa':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Semoa">
          <rect width="24" height="24" rx="5" fill="#0F9D8C" />
          <path d="M7 15c0-2 1.5-3 2.5-2s1.5 2 2.5 0 2.5-3 5-1" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'maxicash':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="MaxiCash">
          <rect width="24" height="24" rx="5" fill="#EE1C25" />
          <path d="M6 16l3-8 3 6 3-6 3 8" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'xero':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Xero">
          <circle cx="12" cy="12" r="10" fill="#13B5EA" />
          <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'sage':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Sage">
          <rect width="24" height="24" rx="5" fill="#00DC00" />
          <path d="M8 15c1 1 4 1 5-.3 1-1.5-.5-2-2.3-2.4C9 12 7.5 11.4 8.4 10c.9-1.3 3.6-1.3 4.8-.2" stroke="#0A2540" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'zendesk':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Zendesk">
          <rect width="24" height="24" rx="5" fill="#03363D" />
          <path d="M6 15.5h8.5L6 8.5V15.5Z" fill="#fff" />
          <path d="M18 8.5H9.5L18 15.5V8.5Z" fill="#03A88A" />
        </svg>
      );
    case 'intercom':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Intercom">
          <rect width="24" height="24" rx="5" fill="#1F8DED" />
          <rect x="7" y="7" width="1.6" height="9" rx="0.8" fill="#fff" />
          <rect x="10.2" y="6" width="1.6" height="11" rx="0.8" fill="#fff" />
          <rect x="13.4" y="6" width="1.6" height="11" rx="0.8" fill="#fff" />
          <rect x="16.6" y="7" width="1.6" height="9" rx="0.8" fill="#fff" />
        </svg>
      );
    case 'freshdesk':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Freshdesk">
          <rect width="24" height="24" rx="5" fill="#25C16F" />
          <circle cx="12" cy="11" r="4" fill="#fff" />
          <path d="M8 15c0 2 2 3 4 3s4-1 4-3" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'facebook_messenger':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Facebook Messenger">
          <rect width="24" height="24" rx="12" fill="#00B2FF" />
          <path d="M6 13.2c0-3.4 2.7-6 6-6s6 2.6 6 6-2.7 6-6 6c-.7 0-1.4-.1-2-.4L7.5 20l.4-2.6a5.9 5.9 0 0 1-1.9-4.2Z" fill="#fff" />
          <path d="M8.5 13.8l2.2-2.3 1.9 1.5 2.7-2.3-2.4 3.1-1.9-1.5-2.5 1.5Z" fill="#00B2FF" />
        </svg>
      );
    case 'instagram_dm':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Instagram DM">
          <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
          <rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="#fff" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" strokeWidth="1.4" />
          <circle cx="15.6" cy="8.4" r="0.9" fill="#fff" />
          <defs>
            <linearGradient id="igGrad" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEDA75" />
              <stop offset="0.4" stopColor="#D62976" />
              <stop offset="0.7" stopColor="#962FBF" />
              <stop offset="1" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'microsoft_teams':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Microsoft Teams">
          <rect width="24" height="24" rx="5" fill="#5059C9" />
          <circle cx="15.5" cy="8" r="1.8" fill="#fff" />
          <rect x="13" y="10" width="6" height="6.5" rx="1.5" fill="#fff" />
          <rect x="6" y="9" width="6.5" height="8" rx="1.2" fill="#7B83EB" />
          <circle cx="9.2" cy="7" r="2" fill="#7B83EB" />
        </svg>
      );
    case 'google_calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Calendar">
          <rect x="4" y="5" width="16" height="15" rx="2" fill="#fff" stroke="#DADCE0" />
          <rect x="4" y="5" width="16" height="4" rx="2" fill="#1A73E8" />
          <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="700" fill="#1A73E8" fontFamily="Arial, sans-serif">31</text>
        </svg>
      );
    case 'meta_ads':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Meta Ads">
          <rect width="24" height="24" rx="5" fill="#0866FF" />
          <path d="M7 16c1.6 0 2.4-3 3-4.5.6 1.5 1.4 4.5 3 4.5s2.6-2.5 3.3-4.5c.5-1.6.9-2.5 1.7-2.5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'google_ads':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Ads">
          <rect width="24" height="24" rx="12" fill="#fff" />
          <path d="M7 16 11.5 6h1.4L8.4 16H7Z" fill="#4285F4" />
          <circle cx="16" cy="15" r="2.4" fill="#34A853" />
          <path d="M12.5 13.5 15 8" stroke="#FBBC04" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'linkedin_ads':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="LinkedIn Ads">
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <rect x="6" y="10" width="2.4" height="7" fill="#fff" />
          <circle cx="7.2" cy="7.2" r="1.4" fill="#fff" />
          <path d="M11 10h2.3v1.1c.5-.8 1.4-1.3 2.5-1.3 2 0 2.7 1.3 2.7 3.2V17h-2.4v-3.6c0-.9-.3-1.5-1.2-1.5-.9 0-1.4.6-1.4 1.5V17H11v-7Z" fill="#fff" />
        </svg>
      );
    case 'google_drive':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Drive">
          <path d="M8.2 4h7.6l6 10.5-3.8 6.5H6l-3.8-6.5L8.2 4Z" fill="none" />
          <path d="M8.6 4.5 2.5 15h6l6.1-10.5H8.6Z" fill="#00AC47" />
          <path d="M15 4.5 21.5 15h-6L9.4 4.5H15Z" fill="#FFBA00" />
          <path d="M2.5 15l3 5.5h13l3-5.5H2.5Z" fill="#0066DA" />
        </svg>
      );
    case 'dropbox':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Dropbox">
          <rect width="24" height="24" rx="5" fill="#0061FF" />
          <path d="M8 6.5 12 9l-4 2.5-4-2.5 4-2.5Zm8 0L20 9l-4 2.5-4-2.5 4-2.5ZM8 14l4 2.5-4 2.5-4-2.5L8 14Zm8 0 4 2.5-4 2.5-4-2.5 4-2.5ZM8 11.5 12 14l-4 2.5-4-2.5 4-2.5Zm8 0 4 2.5-4 2.5-4-2.5 4-2.5Z" fill="none" />
          <path d="M7 8 12 10.8 7 13.6 2 10.8 7 8Zm10 0 5 2.8-5 2.8-5-2.8L17 8Zm-10 8.4 5-2.8 5 2.8-5 2.8-5-2.8Z" fill="#fff" transform="translate(0 -1) scale(0.85) translate(1.8 2)" />
        </svg>
      );
    case 'docusign':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="DocuSign">
          <rect width="24" height="24" rx="5" fill="#FFCC22" />
          <path d="M7 16V8h3.2a4 4 0 0 1 0 8H7Zm2-1.7h1a2.3 2.3 0 0 0 0-4.6H9v4.6Z" fill="#1A1A1A" />
          <path d="M14.5 16l2.3-8h2l-2.3 8h-2Z" fill="#1A1A1A" />
        </svg>
      );
    case 'notion':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Notion">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" />
          <path d="M7 6.5 15.5 6l1.5 1.3v10.2l-1.5 1-9-.6V7.5L7 6.5Z" fill="#000" />
          <path d="M8.8 8.3v7.4l1.2.1V9.7l4.2 6.3 1.3-.1V8l-1.2-.1v6l-4-6-1.5.4Z" fill="#fff" />
        </svg>
      );
    case 'asana':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Asana">
          <rect width="24" height="24" rx="5" fill="#F06A6A" />
          <circle cx="12" cy="7.5" r="2.2" fill="#fff" />
          <circle cx="7" cy="15.5" r="2.2" fill="#fff" />
          <circle cx="17" cy="15.5" r="2.2" fill="#fff" />
        </svg>
      );
    case 'trello':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Trello">
          <rect width="24" height="24" rx="5" fill="#0079BF" />
          <rect x="5.5" y="5.5" width="5.5" height="9" rx="1" fill="#fff" />
          <rect x="13" y="5.5" width="5.5" height="6" rx="1" fill="#fff" />
        </svg>
      );
    case 'woocommerce':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="WooCommerce">
          <rect width="24" height="24" rx="5" fill="#7F54B3" />
          <rect x="4" y="9" width="16" height="8" rx="2" fill="#fff" />
          <path d="M7 12.5l1 2.2 1.3-3.4 1.3 3.4 1-2.2" stroke="#7F54B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14.5 12.5l1 2.2 1.3-3.4" stroke="#7F54B3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case 'prestashop':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="PrestaShop">
          <rect width="24" height="24" rx="5" fill="#DF0067" />
          <path d="M12 5.5l5 2.9v7.2l-5 2.9-5-2.9V8.4l5-2.9Z" fill="#fff" opacity="0.95" />
          <path d="M12 9l2.2 1.3v2.6L12 14.2l-2.2-1.3v-2.6L12 9Z" fill="#DF0067" />
        </svg>
      );
    case 'openai':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="OpenAI">
          <rect width="24" height="24" rx="5" fill="#10A37F" />
          <path d="M12 6.2a3.2 3.2 0 0 1 3.1 2.4 3 3 0 0 1 2 4.5 3.2 3.2 0 0 1-1.1 4.4 3 3 0 0 1-3.6 1.4 3.2 3.2 0 0 1-5.4-1.1 3 3 0 0 1-2-4.5 3.2 3.2 0 0 1 1.1-4.4A3 3 0 0 1 9.6 6.9 3.2 3.2 0 0 1 12 6.2Z" stroke="#fff" strokeWidth="1.2" fill="none" />
          <circle cx="12" cy="12" r="1.6" fill="#fff" />
        </svg>
      );
    case 'anthropic':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Anthropic Claude">
          <rect width="24" height="24" rx="5" fill="#D97757" />
          <path d="M8 16.5 11 7.5h2l3 9h-1.8l-.65-2h-3.1l-.65 2H8Zm3-3.4h2.05L12 9.6l-1.05 3.5Z" fill="#fff" />
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Gemini">
          <rect width="24" height="24" rx="5" fill="#1A1A2E" />
          <path d="M12 5c0 3.5 2.5 6 6 6-3.5 0-6 2.5-6 6 0-3.5-2.5-6-6-6 3.5 0 6-2.5 6-6Z" fill="url(#gemGrad)" />
          <defs>
            <linearGradient id="gemGrad" x1="6" y1="5" x2="18" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4285F4" />
              <stop offset="0.5" stopColor="#9B72CB" />
              <stop offset="1" stopColor="#D96570" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'atlas':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Atlas AI">
          <rect width="24" height="24" rx="5" fill="#0176d3" />
          <path d="M12 6l-6 12h3l1.2-2.6h3.6L15 18h3L12 6Zm0 4.2 1.3 2.8h-2.6L12 10.2Z" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label={provider}>
          <rect width="24" height="24" rx="4" fill="#E5E7EB" />
          <path d="M12 7v10M7 12h10" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
