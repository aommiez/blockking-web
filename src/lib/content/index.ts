import type { Locale, SiteCopy } from './types';
import { th } from './th';
import { en } from './en';

/** Registry of shipped locales. Thai is the default; English ships beside it. */
export const copyByLocale: Record<Locale, SiteCopy> = { th, en };

export const defaultLocale: Locale = 'th';

/** The landing-page copy for one locale. */
export function siteCopy(locale: Locale): SiteCopy {
	return copyByLocale[locale] ?? th;
}

/**
 * The Thai copy, for the one place the locale is not known yet: `<svelte:head>`
 * on the prerendered landing page has to emit a canonical title and description
 * at build time, and Thai is the canonical language of this site.
 */
export const copy: SiteCopy = th;

export type { Locale, SiteCopy } from './types';
