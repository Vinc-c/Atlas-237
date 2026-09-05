import { useEffect } from 'react';

const SITE_ORIGIN = 'https://atlas.liafrik.com';

/**
 * Only languages with genuinely distinct, real public-page content get a
 * URL prefix and a hreflang entry. The app itself supports es/pt/ar for
 * signed-in users (see src/lib/i18n.ts — fully translated), but the public
 * marketing/legal pages (LandingPage.tsx, LegalPage.tsx) only have real
 * fr/en copy — everything else currently falls back to English text. Add
 * es/pt/ar here (and the matching routes in App.tsx) once those pages have
 * real translations, not before — claiming hreflang="es" for a page that
 * renders in English is exactly the kind of mismatch that hurts SEO
 * instead of helping it.
 */
const LANG_PREFIXES: Record<string, string> = {
  fr: '',
  en: '/en',
};

/**
 * Injects <link rel="alternate" hreflang="..."> tags for every supported
 * language plus x-default, pointing at the real equivalent URL for each.
 * `path` is the language-agnostic part of the URL — '' for the landing
 * page, '/auth' for the auth page, '/legal/refund' for a legal page, etc.
 * Removes its own tags on unmount/path change so navigating between pages
 * never leaves stale alternates in the head.
 */
export function useHreflangLinks(path: string) {
  useEffect(() => {
    const created: HTMLLinkElement[] = [];
    for (const [lang, prefix] of Object.entries(LANG_PREFIXES)) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = `${SITE_ORIGIN}${prefix}${path}`;
      document.head.appendChild(link);
      created.push(link);
    }
    // x-default: which version to show someone whose language isn't in the
    // list above — the French root, matching this app's actual default.
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${SITE_ORIGIN}${path}`;
    document.head.appendChild(defaultLink);
    created.push(defaultLink);

    return () => { created.forEach((el) => el.remove()); };
  }, [path]);
}

/** Prefix for a given language, e.g. langPrefix('en') === '/en', langPrefix('fr') === ''. */
export function langPrefix(lang: string): string {
  return LANG_PREFIXES[lang] ?? '';
}

export const SUPPORTED_LANGS = Object.keys(LANG_PREFIXES);
