// Brand marks below fall into three categories, and it matters which:
//
// 0. Providers with a real logo FILE supplied directly (public/brand-logos/),
//    rendered via <img> instead of an inline SVG path — these are the
//    actual official brand assets, not a redrawn approximation of them.
//    See IMAGE_LOGOS below for the current list.
// 1. Providers where the exact official vector path is embedded, sourced
//    from open, permissively-licensed icon libraries: `simple-icons`
//    (https://simpleicons.org, CC0-1.0), `@lobehub/icons`
//    (https://github.com/lobehub/lobe-icons, MIT — used for OpenAI, whose
//    mark isn't in simple-icons), and the "SVG Logos" collection by Gil
//    Barbara (https://github.com/gilbarbara/logos, CC0-1.0, via
//    @iconify-json/logos — used for Slack, Microsoft Teams, whose
//    full-color marks aren't in simple-icons either). All three are
//    public-domain-equivalent or MIT, safe to embed statically, no
//    attribution required. Where the source renders flat single-color
//    (simple-icons' style), a naturally multi-color logo (Google's
//    four-color "G") will look monochrome here — a known simplification
//    of that source, not a wrong color. Where the source is full-color
//    (Slack, Microsoft Teams), the real official hex values are used.
// 2. Providers not present in any of those libraries and without a
//    supplied file — mostly regional mobile-money PSPs — get a
//    hand-drawn approximation instead: the real brand color(s) with a
//    simplified version of the mark. It is a stylized stand-in, not the
//    official artwork, and is labelled as such in code review / logo
//    audits.
// 'atlas' and 'libooks' are LiAfrik's own first-party products, not
// third-party brands, so they were always custom-designed rather than
// sourced. 'sellia' is also a first-party LiAfrik product, but as of the
// image-logo batch below it uses the actual supplied Sellia mark.

/** Providers with a real logo file in public/brand-logos/ — see category 0 above. */
const IMAGE_LOGOS: Record<string, string> = {
  trello: '/brand-logos/trello.png',
  asana: '/brand-logos/asana.png',
  notion: '/brand-logos/notion.png',
  docusign: '/brand-logos/docusign.png',
  dropbox: '/brand-logos/dropbox.png',
  google_drive: '/brand-logos/google_drive.png',
  freshdesk: '/brand-logos/freshdesk.png',
  intercom: '/brand-logos/intercom.png',
  zendesk: '/brand-logos/zendesk.png',
  pipedream: '/brand-logos/pipedream.svg',
  n8n: '/brand-logos/n8n.png',
  make: '/brand-logos/make.png',
  zapier: '/brand-logos/zapier.png',
  bigcommerce: '/brand-logos/bigcommerce.png',
  prestashop: '/brand-logos/prestashop.png',
  twilio: '/brand-logos/twilio.png',
  linkedin_ads: '/brand-logos/linkedin_ads.png',
  google_ads: '/brand-logos/google_ads.png',
  meta_ads: '/brand-logos/meta_ads.png',
  sellia: '/brand-logos/sellia.png',
};

interface BrandLogoProps {
  provider: string;
  size?: number;

  className?: string;
}

export function BrandLogo({ provider, size = 24, className = '' }: BrandLogoProps) {
  const s = { width: size, height: size };

  const imageSrc = IMAGE_LOGOS[provider];
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={provider}
        width={size}
        height={size}
        style={{ ...s, objectFit: 'contain', borderRadius: 5 }}
        className={className}
        loading="lazy"
      />
    );
  }

  switch (provider) {
    case 'gmail':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Gmail">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" transform="translate(2.6 2.6) scale(0.783)" />
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
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" fill="#635BFF" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'slack':
      return (
        <svg viewBox="0 0 256 256" fill="none" style={s} className={className} aria-label="Slack">
          <path fill="#e01e5a" d="M53.841 161.32c0 14.832-11.987 26.82-26.819 26.82S.203 176.152.203 161.32c0-14.831 11.987-26.818 26.82-26.818H53.84zm13.41 0c0-14.831 11.987-26.818 26.819-26.818s26.819 11.987 26.819 26.819v67.047c0 14.832-11.987 26.82-26.82 26.82c-14.83 0-26.818-11.988-26.818-26.82z"/><path fill="#36c5f0" d="M94.07 53.638c-14.832 0-26.82-11.987-26.82-26.819S79.239 0 94.07 0s26.819 11.987 26.819 26.819v26.82zm0 13.613c14.832 0 26.819 11.987 26.819 26.819s-11.987 26.819-26.82 26.819H26.82C11.987 120.889 0 108.902 0 94.069c0-14.83 11.987-26.818 26.819-26.818z"/><path fill="#2eb67d" d="M201.55 94.07c0-14.832 11.987-26.82 26.818-26.82s26.82 11.988 26.82 26.82s-11.988 26.819-26.82 26.819H201.55zm-13.41 0c0 14.832-11.988 26.819-26.82 26.819c-14.831 0-26.818-11.987-26.818-26.82V26.82C134.502 11.987 146.489 0 161.32 0s26.819 11.987 26.819 26.819z"/><path fill="#ecb22e" d="M161.32 201.55c14.832 0 26.82 11.987 26.82 26.818s-11.988 26.82-26.82 26.82c-14.831 0-26.818-11.988-26.818-26.82V201.55zm0-13.41c-14.831 0-26.818-11.988-26.818-26.82c0-14.831 11.987-26.818 26.819-26.818h67.25c14.832 0 26.82 11.987 26.82 26.819s-11.988 26.819-26.82 26.819z"/>
        </svg>
      );
    case 'zoom':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Zoom">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M5.033 14.649H.743a.74.74 0 0 1-.686-.458.74.74 0 0 1 .16-.808L3.19 10.41H1.06A1.06 1.06 0 0 1 0 9.35h3.957c.301 0 .57.18.686.458a.74.74 0 0 1-.161.808L1.51 13.59h2.464c.585 0 1.06.475 1.06 1.06zM24 11.338c0-1.14-.927-2.066-2.066-2.066-.61 0-1.158.265-1.537.686a2.061 2.061 0 0 0-1.536-.686c-1.14 0-2.066.926-2.066 2.066v3.311a1.06 1.06 0 0 0 1.06-1.06v-2.251a1.004 1.004 0 0 1 2.013 0v2.251c0 .586.474 1.06 1.06 1.06v-3.311a1.004 1.004 0 0 1 2.012 0v2.251c0 .586.475 1.06 1.06 1.06zM16.265 12a2.728 2.728 0 1 1-5.457 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0zm-4.82 0a2.728 2.728 0 1 1-5.458 0 2.728 2.728 0 0 1 5.457 0zm-1.06 0a1.669 1.669 0 1 0-3.338 0 1.669 1.669 0 0 0 3.338 0z" fill="#0B5CFF" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'hubspot':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="HubSpot">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z" fill="#FF7A59" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'quickbooks':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="QuickBooks">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z" fill="#2CA01C" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'mailchimp':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Mailchimp">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M11.267 0C6.791-.015-1.82 10.246 1.397 12.964l.79.669a3.88 3.88 0 0 0-.22 1.792c.084.84.518 1.644 1.22 2.266.666.59 1.542.964 2.392.964 1.406 3.24 4.62 5.228 8.386 5.34 4.04.12 7.433-1.776 8.854-5.182.093-.24.488-1.316.488-2.267 0-.956-.54-1.352-.885-1.352-.01-.037-.078-.286-.172-.586-.093-.3-.19-.51-.19-.51.375-.563.382-1.065.332-1.35-.053-.353-.2-.653-.496-.964-.296-.311-.902-.63-1.753-.868l-.446-.124c-.002-.019-.024-1.053-.043-1.497-.014-.32-.042-.822-.197-1.315-.186-.668-.508-1.253-.911-1.627 1.112-1.152 1.806-2.422 1.804-3.511-.003-2.095-2.576-2.729-5.746-1.416l-.672.285A678.22 678.22 0 0 0 12.7.504C12.304.159 11.817.002 11.267 0zm.073.873c.166 0 .322.019.465.058.297.084 1.28 1.224 1.28 1.224s-1.826 1.013-3.52 2.426c-2.28 1.757-4.005 4.311-5.037 7.082-.811.158-1.526.618-1.963 1.253-.261-.218-.748-.64-.834-.804-.698-1.326.761-3.902 1.781-5.357C5.834 3.44 9.37.867 11.34.873zm3.286 3.273c.04-.002.06.05.028.074-.143.11-.299.26-.413.414a.04.04 0 0 0 .031.064c.659.004 1.587.235 2.192.574.041.023.012.103-.034.092-.915-.21-2.414-.369-3.97.01-1.39.34-2.45.863-3.224 1.426-.04.028-.086-.023-.055-.06.896-1.035 1.999-1.935 2.987-2.44.034-.018.07.019.052.052-.079.143-.23.447-.278.678-.007.035.032.063.062.042.615-.42 1.684-.868 2.622-.926zm3.023 3.205l.056.001a.896.896 0 0 1 .456.146c.534.355.61 1.216.638 1.845.015.36.059 1.229.074 1.478.034.571.184.651.487.751.17.057.33.098.563.164.706.198 1.125.4 1.39.658.157.162.23.333.253.497.083.608-.472 1.36-1.942 2.041-1.607.746-3.557.935-4.904.785l-.471-.053c-1.078-.145-1.693 1.247-1.046 2.201.417.615 1.552 1.015 2.688 1.015 2.604 0 4.605-1.111 5.35-2.072a.987.987 0 0 0 .06-.085c.036-.055.006-.085-.04-.054-.608.416-3.31 2.069-6.2 1.571 0 0-.351-.057-.672-.182-.255-.1-.788-.344-.853-.891 2.333.72 3.801.039 3.801.039a.072.072 0 0 0 .042-.072.067.067 0 0 0-.074-.06s-1.911.283-3.718-.378c.197-.64.72-.408 1.51-.345a11.045 11.045 0 0 0 3.647-.394c.818-.234 1.892-.697 2.727-1.356.281.618.38 1.299.38 1.299s.219-.04.4.073c.173.106.299.326.213.895-.176 1.063-.628 1.926-1.387 2.72a5.714 5.714 0 0 1-1.666 1.244c-.34.18-.704.334-1.087.46-2.863.935-5.794-.093-6.739-2.3a3.545 3.545 0 0 1-.189-.522c-.403-1.455-.06-3.2 1.008-4.299.065-.07.132-.153.132-.256 0-.087-.055-.179-.102-.243-.374-.543-1.669-1.466-1.409-3.254.187-1.284 1.31-2.189 2.357-2.135.089.004.177.01.266.015.453.027.85.085 1.223.1.625.028 1.187-.063 1.853-.618.225-.187.405-.35.71-.401.028-.005.092-.028.215-.028zm.022 2.18a.42.42 0 0 0-.06.005c-.335.054-.347.468-.228 1.04.068.32.187.595.32.765.175-.02.343-.022.498 0 .089-.205.104-.557.024-.942-.112-.535-.261-.872-.554-.868zm-3.66 1.546a1.724 1.724 0 0 0-1.016.326c-.16.117-.311.28-.29.378.008.032.031.056.088.063.131.015.592-.217 1.122-.25.374-.023.684.094.923.2.239.104.386.173.443.113.037-.038.026-.11-.031-.204-.118-.192-.36-.387-.618-.497a1.601 1.601 0 0 0-.621-.129zm4.082.81c-.171-.003-.313.186-.317.42-.004.236.131.43.303.432.172.003.314-.185.318-.42.004-.236-.132-.429-.304-.432zm-3.58.172c-.05 0-.102.002-.155.008-.311.05-.483.152-.593.247-.094.082-.152.173-.152.237a.075.075 0 0 0 .075.076c.07 0 .228-.063.228-.063a1.98 1.98 0 0 1 1.001-.104c.157.018.23.027.265-.026.01-.016.022-.049-.01-.1-.063-.103-.311-.269-.66-.275zm2.26.4c-.127 0-.235.051-.283.148-.075.154.035.363.246.466.21.104.443.063.52-.09.075-.155-.035-.364-.246-.467a.542.542 0 0 0-.237-.058zm-11.635.024c.048 0 .098 0 .149.003.73.04 1.806.6 2.052 2.19.217 1.41-.128 2.843-1.449 3.069-.123.02-.248.029-.374.026-1.22-.033-2.539-1.132-2.67-2.435-.145-1.44.591-2.548 1.894-2.811.117-.024.252-.04.398-.042zm-.07.927a1.144 1.144 0 0 0-.847.364c-.38.418-.439.988-.366 1.19.027.073.07.094.1.098.064.008.16-.039.22-.2a1.2 1.2 0 0 0 .017-.052 1.58 1.58 0 0 1 .157-.37.689.689 0 0 1 .955-.199c.266.174.369.5.255.81-.058.161-.154.469-.133.721.043.511.357.717.64.738.274.01.466-.143.515-.256.029-.067.005-.107-.011-.125-.043-.053-.113-.037-.18-.021a.638.638 0 0 1-.16.022.347.347 0 0 1-.294-.148c-.078-.12-.073-.3.013-.504.011-.028.025-.058.04-.092.138-.308.368-.825.11-1.317-.195-.37-.513-.602-.894-.65a1.135 1.135 0 0 0-.138-.01z" fill="#FFE01B" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'shopify':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Shopify">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z" fill="#7AB55C" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="WhatsApp">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="#25D366" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Telegram">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="#26A5E4" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'aircall':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Aircall">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M23.451 5.906a6.978 6.978 0 0 0-5.375-5.39C16.727.204 14.508 0 12 0S7.273.204 5.924.516a6.978 6.978 0 0 0-5.375 5.39C.237 7.26.034 9.485.034 12s.203 4.74.515 6.094a6.978 6.978 0 0 0 5.375 5.39C7.273 23.796 9.492 24 12 24s4.727-.204 6.076-.516a6.978 6.978 0 0 0 5.375-5.39c.311-1.354.515-3.578.515-6.094 0-2.515-.203-4.74-.515-6.094zm-5.873 12.396l-.003.001c-.428.152-1.165.283-2.102.377l-.147.014a.444.444 0 0 1-.45-.271 1.816 1.816 0 0 0-1.296-1.074c-.351-.081-.928-.134-1.58-.134s-1.229.053-1.58.134a1.817 1.817 0 0 0-1.291 1.062.466.466 0 0 1-.471.281 8 8 0 0 0-.129-.012c-.938-.094-1.676-.224-2.105-.377l-.003-.001a.76.76 0 0 1-.492-.713c0-.032.003-.066.005-.098.073-.979.666-3.272 1.552-5.89C8.5 8.609 9.559 6.187 10.037 5.714a1.029 1.029 0 0 1 .404-.26l.004-.002c.314-.106.892-.178 1.554-.178.663 0 1.241.071 1.554.178l.005.002a1.025 1.025 0 0 1 .405.26c.478.472 1.537 2.895 2.549 5.887.886 2.617 1.479 4.91 1.552 5.89.002.032.005.066.005.098a.76.76 0 0 1-.491.713z" fill="#00B388" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'calendly':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Calendly">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z" fill="#006BFF" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'google_meet':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Meet">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z" fill="#00897B" transform="translate(2.6 2.6) scale(0.783)" />
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
    case 'paypal':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="PayPal">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" fill="#002991" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'adyen':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Adyen">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M11.64703 9.88245v2.93377c0 .13405.10867.24271.24272.24271h.46316V9.88245h1.76474v5.1503c0 .46916-.38033.8495-.8495.8495H9.94303v-1.23507h2.40991v-.52942h-1.62108c-.46917 0-.8495-.38033-.8495-.8495V9.88245h1.76467Zm-8.26124.00001c.46917 0 .8495.38034.8495.8495v3.3858H.8495c-.46916 0-.8495-.38033-.8495-.8495v-.94805c0-.46917.38034-.8495.8495-.8495h.91521v1.3455c0 .13406.10867.24272.24272.24272h.46316V11.184c0-.13405-.10867-.24271-.24272-.24271l-2.16719-.00002V9.88246Zm5.79068-1.76471v6.00001H5.79068c-.46917 0-.8495-.38033-.8495-.8495v-2.53631c0-.46917.38033-.8495.8495-.8495h.91515v2.93377c0 .13405.10867.24271.24272.24271h.46316l.00005-4.94118h1.76471Zm9.03286 1.76471a.8495.8495 0 0 1 .8495.8495v.94805c0 .46917-.38033.8495-.8495.8495h-.9152v-1.3455c0-.13404-.10868-.2427-.24272-.2427h-.46317v1.8749c0 .13406.10867.24272.24272.24272h2.16719v1.05883h-3.32511c-.46917 0-.8495-.38033-.8495-.8495v-3.3858Zm4.94117 0c.46916 0 .8495.38034.8495.8495v3.3858h-1.7647V11.184c-.0004-.13388-.10884-.24232-.24272-.24272h-.46316v3.1765H19.7647V9.88245Z" fill="#0ABF53" transform="translate(2.6 2.6) scale(0.783)" />
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
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M7.275 17.428c.376.777.949 1.223 1.572 1.228h.01c.619 0 1.191-.435 1.575-1.194l.504-1.08-4.9-10.387-3.388 1.58zm6.367.033c.382.76.957 1.195 1.575 1.195h.006c.625-.004 1.2-.45 1.574-1.226l4.567-9.852-3.389-1.581-4.844 10.381zm-1.605 1.206c-.74 1.245-1.905 1.977-3.18 1.977h-.022c-1.391-.01-2.643-.89-3.353-2.355C3.657 14.397 1.828 10.507 0 6.617l6.99-3.259 5.039 10.683 4.985-10.685L24 6.613 18.592 18.29c-.709 1.465-1.962 2.345-3.353 2.355h-.022c-1.275 0-2.442-.732-3.18-1.977Z" fill="#1F263A" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'revolut_business':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Revolut Business">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z" fill="#191C1F" transform="translate(2.6 2.6) scale(0.783)" />
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
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M1.834 18.305c-1.06-1.594-1.63-3.36-1.79-5.261C-.238 9.474.84 6.34 3.318 3.74 5.311 1.65 7.788.435 10.652.11c2.882-.325 5.538.325 7.966 1.907.227 1.012.037 1.975-.331 2.925-.534 1.398-1.313 2.65-2.19 3.851-.177.251-.447.49-.27.84.197.362.54.233.853.209.65-.062 1.294-.099 1.944-.166.264-.025.368.043.331.337-.073.472-.11.957-.16 1.435-.024.24 0 .46.264.552.27.098.466-.018.626-.24 1.232-1.771 2.336-3.61 2.637-5.806 2.692 4.206 2.09 10.18-1.41 14.055A12.05 12.05 0 0 1 6.09 22.432c-.147-.08-.282-.178-.417-.27.89-.172 1.778-.374 2.618-.73 2.282-.944 4.268-2.342 6.114-3.937.282-.245.454-.294.7.013.208.263.471.484.692.73.172.19.368.318.638.226.264-.086.288-.325.313-.545.251-2.042.49-4.09.748-6.133.055-.447-.141-.68-.601-.637-2.091.171-4.188.35-6.28.54-.508.048-.65.422-.312.815.276.331.576.638.895.92.294.251.313.417 0 .674-1.288 1.073-2.618 2.085-4.09 2.888-1.613.877-3.25 1.668-5.176 1.38h.007c0-.061-.037-.086-.105-.073" fill="#FFD300" transform="translate(2.6 2.6) scale(0.783)" />
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
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M0 0h24v24H0V0Zm3.43 20.572h17.143v-3.429H3.43v3.429Z" fill="#FF7900" transform="translate(2.6 2.6) scale(0.783)" />
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
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.585 14.655c-1.485 0-2.69-1.206-2.69-2.689 0-1.485 1.207-2.691 2.69-2.691 1.485 0 2.69 1.207 2.69 2.691s-1.207 2.689-2.69 2.689zM7.53 14.644c-.099 0-.192-.041-.267-.116l-2.043-2.04-2.052 2.047c-.069.068-.16.108-.258.108-.202 0-.368-.166-.368-.368 0-.099.04-.191.111-.263l2.04-2.05-2.038-2.047c-.075-.069-.113-.162-.113-.261 0-.203.166-.366.368-.366.098 0 .188.037.258.105l2.055 2.048 2.048-2.045c.069-.071.162-.108.26-.108.211 0 .375.165.375.366 0 .098-.029.188-.104.258l-2.056 2.055 2.055 2.051c.068.069.104.16.104.258 0 .202-.165.368-.365.368h-.01zm8.017-4.591c-.796.101-.882.476-.882 1.404v2.787c0 .202-.165.366-.366.366-.203 0-.367-.165-.368-.366v-4.53c0-.204.16-.366.362-.366.166 0 .316.125.346.289.27-.209.6-.317.93-.317h.105c.195 0 .359.165.359.368 0 .201-.164.352-.375.359 0 0-.09 0-.164.008l.053-.002zm-3.091 2.205H8.625c0 .019.003.037.006.057.02.105.045.211.083.31.194.531.765 1.275 1.829 1.29.33-.003.631-.086.9-.229.21-.12.391-.271.525-.428.045-.058.09-.112.12-.168.18-.229.405-.186.54-.083.164.135.18.391.045.57l-.016.016c-.21.27-.435.495-.689.66-.255.164-.525.284-.811.345-.33.09-.645.104-.975.06-1.095-.135-2.01-.93-2.28-2.01-.06-.21-.09-.42-.09-.645 0-.855.421-1.695 1.125-2.205.885-.615 2.085-.66 3-.075.63.405 1.035 1.021 1.185 1.771.075.419-.21.794-.734.81l.068-.046zm6.129-2.223c-1.064 0-1.931.865-1.931 1.931 0 1.064.866 1.931 1.931 1.931s1.931-.867 1.931-1.931c0-1.065-.866-1.933-1.931-1.933v.002zm0 2.595c-.367 0-.666-.297-.666-.666 0-.367.3-.665.666-.665.367 0 .667.299.667.665 0 .369-.3.667-.667.666zm-8.04-2.603c-.91 0-1.672.623-1.886 1.466v.03h3.776c-.203-.855-.973-1.494-1.891-1.494v-.002z" fill="#13B5EA" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'sage':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Sage">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M2.702 5.316C1.167 5.316 0 6.48 0 7.972c0 1.635 1.167 2.267 2.46 2.655 1.224.387 1.804.818 1.804 1.666 0 .86-.64 1.465-1.477 1.465-.84 0-1.566-.604-1.566-1.535 0-.516.242-.647.242-.934 0-.33-.227-.574-.599-.574-.423 0-.864.647-.864 1.566 0 1.48 1.266 2.57 2.787 2.57 1.535 0 2.701-1.163 2.701-2.656 0-1.623-1.166-2.267-2.472-2.655-1.209-.372-1.792-.818-1.792-1.666 0-.845.626-1.45 1.463-1.45.867 0 1.565.617 1.577 1.465.016.388.285.617.599.617a.592.592 0 0 0 .61-.647c-.027-1.48-1.263-2.543-2.771-2.543zm6.171 9.52c.683 0 1.21-.23 1.21-.69a.57.57 0 0 0-.557-.574c-.2 0-.341.085-.668.085-.882 0-1.577-.76-1.577-1.65 0-.962.71-1.725 1.608-1.725 1.009 0 1.65.775 1.65 1.895v2.054c0 .36.284.604.625.604.327 0 .61-.244.61-.604v-2.097c0-1.72-1.178-2.984-2.858-2.984-1.566 0-2.86 1.22-2.86 2.856 0 1.58 1.282 2.83 2.817 2.83zm6.257 3.848c1.535 0 2.701-1.163 2.701-2.656 0-1.635-1.166-2.267-2.472-2.655-1.209-.387-1.792-.818-1.792-1.666s.64-1.465 1.463-1.465c.84 0 1.577.604 1.577 1.535 0 .519-.241.647-.241.934 0 .33.226.574.583.574.441 0 .882-.647.882-1.566 0-1.48-1.278-2.57-2.801-2.57-1.535 0-2.687 1.163-2.687 2.656 0 1.623 1.152 2.267 2.46 2.655 1.224.372 1.804.818 1.804 1.666 0 .86-.64 1.45-1.462 1.45-.883 0-1.566-.601-1.578-1.465-.015-.388-.3-.604-.598-.604-.327 0-.626.216-.61.631.011 1.499 1.247 2.546 2.77 2.546zm6.171-3.849c.795 0 1.424-.229 1.862-.503.426-.272.595-.504.595-.76 0-.272-.2-.516-.568-.516-.441 0-.795.66-1.877.66-.952 0-1.707-.76-1.707-1.722 0-.95.725-1.724 1.635-1.724.982 0 1.508.647 1.508 1.062 0 .116-.085.174-.2.174h-1.194c-.326 0-.568.216-.568.503 0 .314.242.546.568.546h1.636c.625 0 1.009-.33 1.009-.89 0-1.408-1.194-2.512-2.774-2.512-1.566 0-2.83 1.263-2.83 2.84s1.312 2.842 2.905 2.842z" fill="#00D639" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'facebook_messenger':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Facebook Messenger">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13" fill="#0866FF" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'instagram_dm':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Instagram DM">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" fill="#FF0069" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'microsoft_teams':
      return (
        <svg viewBox="0 0 256 239" fill="none" style={s} className={className} aria-label="Microsoft Teams">
          <defs><linearGradient id="SVGCo9xpmZW" x1="17.372%" x2="82.628%" y1="-6.51%" y2="106.51%"><stop offset="0%" stop-color="#5a62c3"/><stop offset="50%" stop-color="#4d55bd"/><stop offset="100%" stop-color="#3940ab"/></linearGradient><path id="SVGhJCUgeMn" d="M136.93 64.476v12.8a32.7 32.7 0 0 1-5.953-.952a38.7 38.7 0 0 1-26.79-22.742h21.848c6.008.022 10.872 4.887 10.895 10.894"/></defs><path fill="#5059c9" d="M178.563 89.302h66.125c6.248 0 11.312 5.065 11.312 11.312v60.231c0 22.96-18.613 41.574-41.573 41.574h-.197c-22.96.003-41.576-18.607-41.579-41.568V95.215a5.91 5.91 0 0 1 5.912-5.913"/><circle cx="223.256" cy="50.605" r="26.791" fill="#5059c9"/><circle cx="139.907" cy="38.698" r="38.698" fill="#7b83eb"/><path fill="#7b83eb" d="M191.506 89.302H82.355c-6.173.153-11.056 5.276-10.913 11.449v68.697c-.862 37.044 28.445 67.785 65.488 68.692c37.043-.907 66.35-31.648 65.489-68.692v-68.697c.143-6.173-4.74-11.296-10.913-11.449"/><path d="M142.884 89.302v96.268a10.96 10.96 0 0 1-6.787 10.062c-1.3.55-2.697.833-4.108.833H76.68c-.774-1.965-1.488-3.93-2.084-5.953a72.5 72.5 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z" opacity=".1"/><path d="M136.93 89.302v102.222c0 1.411-.283 2.808-.833 4.108a10.96 10.96 0 0 1-10.062 6.787H79.48c-1.012-1.965-1.965-3.93-2.798-5.954a59 59 0 0 1-2.084-5.953a72.5 72.5 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z" opacity=".2"/><path d="M136.93 89.302v90.315c-.045 5.998-4.896 10.85-10.895 10.895H74.597a72.5 72.5 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z" opacity=".2"/><path d="M130.977 89.302v90.315c-.046 5.998-4.897 10.85-10.895 10.895H74.597a72.5 72.5 0 0 1-3.155-21.076v-68.703c-.143-6.163 4.732-11.278 10.895-11.43z" opacity=".2"/><path d="M142.884 58.523v18.753c-1.012.06-1.965.12-2.977.12s-1.965-.06-2.977-.12a32.7 32.7 0 0 1-5.953-.952a38.7 38.7 0 0 1-26.791-22.742a33 33 0 0 1-1.905-5.954h29.708c6.007.023 10.872 4.887 10.895 10.895" opacity=".1"/><use href="#SVGhJCUgeMn" opacity=".2"/><use href="#SVGhJCUgeMn" opacity=".2"/><path d="M130.977 64.476v11.848a38.7 38.7 0 0 1-26.791-22.743h15.896c6.008.023 10.872 4.888 10.895 10.895" opacity=".2"/><path fill="url(#SVGCo9xpmZW)" d="M10.913 53.581h109.15c6.028 0 10.914 4.886 10.914 10.913v109.151c0 6.027-4.886 10.913-10.913 10.913H10.913C4.886 184.558 0 179.672 0 173.645V64.495C0 58.466 4.886 53.58 10.913 53.58"/><path fill="#fff" d="M94.208 95.125h-21.82v59.416H58.487V95.125H36.769V83.599h57.439z"/>
        </svg>
      );
    case 'google_calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Calendar">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z" fill="#4285F4" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'woocommerce':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="WooCommerce">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M.754 9.58a.754.754 0 00-.754.758v2.525c0 .42.339.758.758.758h3.135l1.431.799-.326-.799h2.373a.757.757 0 00.758-.758v-2.525a.757.757 0 00-.758-.758H.754zm2.709.445h.03c.065.001.124.023.179.067a.26.26 0 01.103.19.29.29 0 01-.033.16c-.13.239-.236.64-.322 1.199-.083.541-.114.965-.094 1.267a.392.392 0 01-.039.219.213.213 0 01-.176.12c-.086.006-.177-.034-.263-.124-.31-.316-.555-.788-.735-1.416-.216.425-.375.744-.478.957-.196.376-.363.568-.502.578-.09.007-.166-.069-.233-.228-.17-.436-.352-1.277-.548-2.524a.297.297 0 01.054-.222c.047-.064.116-.095.21-.102.169-.013.265.065.288.238.103.695.217 1.284.336 1.766l.727-1.387c.066-.126.15-.192.25-.199.146-.01.237.083.273.28.083.441.188.817.315 1.136.086-.844.233-1.453.44-1.828a.255.255 0 01.218-.147zm1.293.36c.056 0 .116.006.18.02.232.05.411.177.53.386.107.18.161.395.161.654 0 .343-.087.654-.26.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.158-.659c0-.342.085-.655.258-.937.202-.333.462-.498.78-.498zm2.084 0c.056 0 .116.006.18.02.236.05.411.177.53.386.107.18.16.395.16.654 0 .343-.086.654-.259.94-.2.332-.459.5-.781.5a.88.88 0 01-.18-.022.763.763 0 01-.531-.384 1.287 1.287 0 01-.16-.659c0-.342.087-.655.26-.937.202-.333.462-.498.78-.498zm4.437.047c-.305 0-.546.102-.718.304-.173.203-.256.49-.256.856 0 .395.086.697.256.906.17.21.418.316.744.316.315 0 .559-.107.728-.316.17-.21.256-.504.256-.883s-.087-.673-.26-.879c-.176-.202-.424-.304-.75-.304zm-1.466.002a1.13 1.13 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.505.336.861.336.103 0 .22-.016.346-.052v-.54c-.117.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm12.414 0a1.135 1.135 0 00-.84.326c-.223.22-.332.499-.332.838 0 .362.108.658.328.88.22.223.506.336.861.336.103 0 .22-.016.346-.052v-.54c-.116.034-.216.051-.303.051a.545.545 0 01-.422-.177c-.106-.12-.16-.278-.16-.48 0-.19.053-.348.156-.468a.498.498 0 01.397-.181c.103 0 .212.015.332.049v-.537a1.394 1.394 0 00-.363-.045zm-9.598.06l-.29 2.264h.579l.156-1.559.395 1.559h.412l.379-1.555.164 1.555h.603l-.304-2.264h-.791l-.12.508c-.03.13-.06.264-.087.4l-.067.352a29.97 29.97 0 00-.258-1.26h-.771zm2.768 0l-.29 2.264h.579l.156-1.559.396 1.559h.412l.375-1.555.165 1.555h.603l-.305-2.264h-.789l-.119.508c-.03.13-.06.264-.086.4l-.066.352c-.063-.352-.15-.771-.26-1.26h-.771zm3.988 0v2.264h.611v-1.031h.012l.494 1.03h.645l-.489-1.019a.61.61 0 00.37-.552.598.598 0 00-.25-.506c-.167-.123-.394-.186-.68-.186h-.713zm3.377 0v2.264H24v-.483h-.63v-.414h.54v-.468h-.54v-.416h.626v-.483H22.76zm-4.793.004v2.264h1.24v-.483h-.627v-.416h.541v-.468h-.54v-.415h.622v-.482h-1.236zm2.025.432c.146.003.25.025.313.072.063.046.091.12.091.227 0 .156-.135.236-.404.24v-.54zm-15.22.011c-.104 0-.205.069-.301.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.016-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm2.083 0c-.103 0-.204.069-.3.211a1.078 1.078 0 00-.2.639c0 .096.02.2.06.303.049.13.117.198.196.215.083.016.173-.02.27-.106.123-.11.205-.273.252-.492.013-.077.023-.16.023-.246 0-.097-.02-.2-.06-.303-.05-.13-.116-.198-.196-.215a.246.246 0 00-.045-.006zm4.428.006c.233 0 .354.218.354.66-.004.273-.038.46-.098.553a.293.293 0 01-.262.139.266.266 0 01-.242-.139c-.056-.093-.084-.28-.084-.562 0-.436.11-.65.332-.65Z" fill="#96588A" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'openai':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="OpenAI">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" fill="#000000" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'anthropic':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Anthropic (Claude)">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" fill="#191919" transform="translate(2.6 2.6) scale(0.783)" />
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 24 24" fill="none" style={s} className={className} aria-label="Google Gemini">
          <rect width="24" height="24" rx="5" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
          <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="#8E75B2" transform="translate(2.6 2.6) scale(0.783)" />
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
