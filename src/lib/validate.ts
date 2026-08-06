/**
 * A client-side echo of `meta/internal/ident`, so the registration form can
 * answer before the network does.
 *
 * It is an echo and not a second implementation of the truth: the server
 * validates everything again and its answer wins. What matters is that the two
 * agree on the *vocabulary* — the issue strings here (`too_short`,
 * `bad_separator`, …) are the ones `identIssue` returns, so one message table
 * covers both a locally-detected problem and one the API reports.
 *
 * The Thai rules are the reason this is not a regular expression:
 *
 *   - length is counted in **grapheme clusters**, not code points and not
 *     bytes. `แม่` is one syllable a reader sees as two characters, three code
 *     points and nine bytes. Counting the wrong one gives Thai players a name
 *     allowance half the size of everybody else's.
 *   - there is a second, byte ceiling at 48 (the wire limit), which a Thai name
 *     with tone marks can hit at around 8 characters. That is a known, flagged
 *     consequence — `meta/README.md` records it — so the form has to be able to
 *     say *which* limit was hit, in words a player can act on.
 */

export const LOGIN_ID_MIN = 3;
export const LOGIN_ID_MAX = 20;
export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 16;
export const DISPLAY_NAME_MAX_BYTES = 48;
/**
 * `passwd.MinLen`. Six, set by the product owner (ACCOUNTS.md §4.2, decision
 * D7) — it was 10, and this file said 10 for an hour after `meta` moved, which
 * is a form refusing a password the service would have accepted.
 *
 * It is a floor on impossible input, not a judgement: what makes six defensible
 * is Argon2id, the lockout, and a common-password blocklist that lives in
 * `meta` and is not something to ship to a browser.
 */
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 1024;
export const MAX_COMBINING_PER_BASE = 2;

/** `null` means "nothing wrong that this side can see". */
export type Issue = string | null;

// --- counting ----------------------------------------------------------------

const segmenter =
	typeof Intl !== 'undefined' && 'Segmenter' in Intl
		? new Intl.Segmenter('th', { granularity: 'grapheme' })
		: null;

/**
 * Grapheme clusters, the unit ACCOUNTS.md §2.4 counts in.
 *
 * `Intl.Segmenter` is in every browser this site targets. The fallback counts
 * code points minus combining marks, which is close enough to keep a counter
 * from showing something absurd on an ancient browser — the server is what
 * actually enforces the limit.
 */
export function countGraphemes(value: string): number {
	if (!value) return 0;
	if (segmenter) return [...segmenter.segment(value)].length;
	let n = 0;
	for (const ch of value) {
		if (!isCombiningMark(ch.codePointAt(0) ?? 0)) n++;
	}
	return n;
}

/** UTF-8 length after NFC, which is what the 48-byte wire ceiling measures. */
export function countBytes(value: string): number {
	return new TextEncoder().encode(value.normalize('NFC')).length;
}

// --- login id ----------------------------------------------------------------

/**
 * `a-z 0-9 _ .`, first character a letter, no doubled or trailing separator.
 * Case is folded, matching `ParseLoginID`, so the form can show the player the
 * id they will actually have.
 */
export function normaliseLoginID(raw: string): string {
	return raw.trim().toLowerCase();
}

export function validateLoginID(raw: string): Issue {
	const s = normaliseLoginID(raw);
	if (s === '') return 'required';
	// Charset before length, in the API's order: telling somebody who typed
	// their name in Thai that it is "too long" is both wrong and unactionable.
	for (const ch of s) {
		const ok = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '_' || ch === '.';
		if (!ok) return 'character_not_allowed';
	}
	if (s.length < LOGIN_ID_MIN) return 'too_short';
	if (s.length > LOGIN_ID_MAX) return 'too_long';
	const first = s[0];
	if (first < 'a' || first > 'z') return 'must_start_with_letter';
	const last = s[s.length - 1];
	if (last === '.' || last === '_') return 'bad_separator';
	for (let i = 1; i < s.length; i++) {
		const a = s[i - 1];
		const b = s[i];
		if ((a === '.' || a === '_') && (b === '.' || b === '_')) return 'bad_separator';
	}
	return null;
}

// --- display name ------------------------------------------------------------

function isCombiningMark(cp: number): boolean {
	return (
		(cp >= 0x0300 && cp <= 0x036f) || // Latin combining
		(cp >= 0x0e31 && cp <= 0x0e3a) || // Thai vowels above/below
		(cp >= 0x0e47 && cp <= 0x0e4e) // Thai tone marks and signs
	);
}

function isZeroWidth(cp: number): boolean {
	return (
		(cp >= 0x200b && cp <= 0x200f) ||
		cp === 0xfeff ||
		cp === 0x00ad ||
		cp === 0x2060 ||
		(cp >= 0xfe00 && cp <= 0xfe0f) ||
		(cp >= 0xe0000 && cp <= 0xe007f)
	);
}

function isBidiControl(cp: number): boolean {
	return (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069);
}

const THAI_START = 0x0e00;
const THAI_END = 0x0e5b;

/** Store form: collapse whitespace runs to one space, then NFC. */
export function normaliseDisplayName(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').normalize('NFC');
}

/**
 * The allowed set is Latin letters, Arabic digits, Thai `U+0E00–U+0E5B`, space
 * and `_ - . '`. Mixing writing systems beyond {Latin, Thai, digits} is refused
 * outright, which removes the whole cross-script homoglyph problem without
 * anybody maintaining a confusables table.
 */
export function validateDisplayName(raw: string): Issue {
	const trimmed = raw.trim();
	if (trimmed === '') return 'required';
	// Control characters before whitespace collapsing: a newline is both, and
	// collapsing first would quietly rewrite somebody's name.
	for (const ch of trimmed) {
		const cp = ch.codePointAt(0) ?? 0;
		if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) return 'control_character';
	}
	const s = normaliseDisplayName(trimmed);
	if (s === '') return 'required';

	// There is no separate mixed-script rule to apply: the charset below admits
	// only Latin, Thai and digits, which *is* §2.4's allowed combination. The
	// cross-script homoglyph problem is closed by the charset, not by a table.
	let marks = 0;
	let first = true;
	for (const ch of s) {
		const cp = ch.codePointAt(0) ?? 0;
		if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) return 'control_character';
		if (isZeroWidth(cp)) return 'invisible_character';
		if (isBidiControl(cp)) return 'text_direction_override';

		if (isCombiningMark(cp)) {
			if (first) return 'starts_with_mark';
			marks++;
			if (marks > MAX_COMBINING_PER_BASE) return 'too_many_marks';
			first = false;
			continue;
		}
		marks = 0;

		const latin = (cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a);
		const thai = cp >= THAI_START && cp <= THAI_END;
		const digit = cp >= 0x30 && cp <= 0x39;
		const separator = cp === 0x20 || ch === '_' || ch === '-' || ch === '.' || ch === "'";
		if (!latin && !thai && !digit && !separator) return 'character_not_allowed';
		first = false;
	}

	const graphemes = countGraphemes(s);
	if (graphemes < DISPLAY_NAME_MIN) return 'too_short';
	if (graphemes > DISPLAY_NAME_MAX) return 'too_long';
	// Checked last so its message is only ever seen by a name that passed
	// everything else.
	if (countBytes(s) > DISPLAY_NAME_MAX_BYTES) return 'too_long_bytes';
	return null;
}

// --- password ----------------------------------------------------------------

/**
 * Length only, and only the length that makes a request pointless.
 *
 * Everything else a password has to be — not in the leaked top ten thousand,
 * not built out of the account's own names — is `meta`'s to decide, and comes
 * back as a per-field `message` this site shows as written (see
 * `$lib/api/messages`). The rules are deliberately *not* echoed here: the
 * blocklist is not something to ship to a browser, `passwd.containsName`
 * matches in both directions and on reduced forms rather than on equality, and
 * a second copy of either is a copy that starts disagreeing with the service
 * the first time one of them is tightened.
 *
 * Code points, not `raw.length`: `passwd.Check` counts runes, so a Thai
 * password of six characters is six here and six there — while UTF-16 units
 * would let four emoji through as eight and then have the API refuse them.
 */
export function validatePassword(raw: string): Issue {
	if (raw === '') return 'required';
	if ([...raw].length < PASSWORD_MIN) return 'too_short';
	// Bytes, because `MaxLen` bounds what reaches the hash.
	if (new TextEncoder().encode(raw).length > PASSWORD_MAX) return 'too_long';
	return null;
}

// --- email -------------------------------------------------------------------

/** Deliberately loose, and the same shape `ident.ValidEmail` accepts. */
export function validateEmail(raw: string): Issue {
	const s = raw.trim().toLowerCase();
	if (s === '') return 'required';
	if (s.length < 6 || s.length > 254) return 'invalid';
	const at = s.lastIndexOf('@');
	if (at <= 0 || at === s.length - 1) return 'invalid';
	const local = s.slice(0, at);
	const domain = s.slice(at + 1);
	if (local.length > 64) return 'invalid';
	if (/[\s,;<>"]/.test(s)) return 'invalid';
	const dot = domain.indexOf('.');
	if (dot <= 0 || dot === domain.length - 1 || domain.includes('..')) return 'invalid';
	return null;
}
