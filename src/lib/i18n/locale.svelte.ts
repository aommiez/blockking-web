/**
 * Which language the site is in.
 *
 * `my-code-style/time-locale.md` §4: the language is resolved from the session
 * or a cookie, never from the URL. There is no session on a static site, so it
 * is a cookie — a plain preference cookie, readable by script on purpose, and
 * carrying nothing but `th` or `en`. It is not `localStorage`, so a future
 * server-rendered build can read the same value without a round trip.
 *
 * The default is Thai, and a first-time visitor whose browser prefers English
 * gets English. Nothing here touches the session cookie.
 */
import { browser } from '$app/environment';
import type { Locale } from '$lib/content';

const COOKIE = 'bk_lang';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(): Locale | null {
	if (!browser) return null;
	const found = document.cookie
		.split(';')
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${COOKIE}=`));
	const value = found?.slice(COOKIE.length + 1);
	return value === 'th' || value === 'en' ? value : null;
}

function fromBrowser(): Locale {
	if (!browser) return 'th';
	const preferred = navigator.languages ?? [navigator.language];
	for (const tag of preferred) {
		if (tag?.toLowerCase().startsWith('th')) return 'th';
		if (tag?.toLowerCase().startsWith('en')) return 'en';
	}
	return 'th';
}

class LocaleStore {
	current = $state<Locale>('th');

	/** Called once, on the client, after hydration. */
	init(): void {
		this.current = readCookie() ?? fromBrowser();
		this.apply();
	}

	set(next: Locale): void {
		this.current = next;
		if (browser) {
			// `SameSite=Lax` and no `Secure` flag so it also works on the plain
			// http dev server. It is a display preference; there is nothing here
			// worth protecting, and nothing here worth sending anywhere.
			document.cookie = `${COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
		}
		this.apply();
	}

	private apply(): void {
		if (browser) document.documentElement.lang = this.current;
	}
}

export const locale = new LocaleStore();
