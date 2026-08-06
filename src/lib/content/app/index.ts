import type { Locale } from '../types';
import type { AppCopy } from './types';
import { appTh } from './th';
import { appEn } from './en';

/** Both locales ship. Adding a third is one file and one entry here. */
export const appCopyByLocale: Record<Locale, AppCopy> = { th: appTh, en: appEn };

export function appCopy(locale: Locale): AppCopy {
	return appCopyByLocale[locale] ?? appTh;
}

export type * from './types';
