/**
 * Display formatting. Everything here is locale-aware and time-zone explicit.
 *
 * `my-code-style/time-locale.md`: the API sends `timestamptz`, this converts to
 * `Asia/Bangkok` at the edge and nowhere else. Thai output uses the Buddhist
 * calendar, which `Intl` gives for `th-TH` without being asked; English output
 * gets the Gregorian year, because พ.ศ. in an English sentence helps nobody.
 */
import type { Locale } from '$lib/content';

export const APP_TIMEZONE = 'Asia/Bangkok';

function tag(locale: Locale): string {
	return locale === 'en' ? 'en-GB' : 'th-TH';
}

/** Thousands separators, no decimals. Scores and counts are integers. */
export function formatNumber(value: number, locale: Locale): string {
	return new Intl.NumberFormat(tag(locale)).format(value);
}

/** K/D to two decimals, which is how every shooter has always shown it. */
export function formatRatio(value: number, locale: Locale): string {
	return new Intl.NumberFormat(tag(locale), {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/** A K/D that does not divide by zero: no deaths yet means the kills stand. */
export function kdRatio(kills: number, deaths: number): number {
	return deaths > 0 ? kills / deaths : kills;
}

function parse(iso: string): Date | null {
	if (!iso) return null;
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? null : d;
}

/** Date and time, e.g. `2 ส.ค. 2569 14:45`. */
export function formatDateTime(iso: string, locale: Locale): string {
	const d = parse(iso);
	if (!d) return '—';
	return new Intl.DateTimeFormat(tag(locale), {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: APP_TIMEZONE
	}).format(d);
}

/** Date only. */
export function formatDate(iso: string, locale: Locale): string {
	const d = parse(iso);
	if (!d) return '—';
	return new Intl.DateTimeFormat(tag(locale), {
		dateStyle: 'medium',
		timeZone: APP_TIMEZONE
	}).format(d);
}

/** Clock only — used for "as of 14:45:08", where the date is today by definition. */
export function formatTime(iso: string, locale: Locale): string {
	const d = parse(iso);
	if (!d) return '—';
	return new Intl.DateTimeFormat(tag(locale), {
		timeStyle: 'medium',
		timeZone: APP_TIMEZONE
	}).format(d);
}

/** "2 ชม.ที่แล้ว" / "2 hours ago", falling back to a date past a week. */
export function formatRelative(iso: string, locale: Locale): string {
	const d = parse(iso);
	if (!d) return '—';
	const seconds = Math.round((d.getTime() - Date.now()) / 1000);
	const abs = Math.abs(seconds);
	const rtf = new Intl.RelativeTimeFormat(tag(locale), { numeric: 'auto' });
	if (abs < 60) return rtf.format(Math.round(seconds), 'second');
	if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
	if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
	if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), 'day');
	return formatDate(iso, locale);
}

/**
 * A playtime, from seconds. Hours and minutes, because a session is measured in
 * minutes and a career in hours, and "38400 seconds" is a number nobody reads.
 */
export function formatDuration(totalSeconds: number, locale: Locale): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(s / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const isTh = locale !== 'en';
	if (hours === 0 && minutes === 0) {
		return isTh ? `${s} วินาที` : `${s}s`;
	}
	if (hours === 0) {
		return isTh ? `${minutes} นาที` : `${minutes}m`;
	}
	const h = formatNumber(hours, locale);
	return isTh ? `${h} ชม. ${minutes} นาที` : `${h}h ${minutes}m`;
}

/**
 * `ชื่อ#0421`. The tag is four digits with leading zeroes, always — that is the
 * form ACCOUNTS.md §2.3 fixes and the form players quote to each other.
 *
 * A guest identity has no account and so no tag; the API sends 0 for it. Zero
 * is rendered as no tag at all rather than as `#0000`, which would look like a
 * real player number.
 */
export function taggedName(displayName: string, playerTag: number): string {
	if (!playerTag) return displayName;
	return `${displayName}#${String(playerTag).padStart(4, '0')}`;
}

/** Substitutes `{key}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in values ? String(values[key]) : match
	);
}
