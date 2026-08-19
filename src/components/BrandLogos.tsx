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
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label={provider}>
          <rect width="24" height="24" rx="4" fill="#E5E7EB" />
          <path d="M12 7v10M7 12h10" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
