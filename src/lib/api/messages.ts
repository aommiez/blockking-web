/**
 * Turning a failure into something to show a player.
 *
 * The rule that must not be broken here is ACCOUNTS.md §4.4. The API answers
 * every failed login identically — same code, same message, same status,
 * whether the account exists, the password is wrong, or the account is locked —
 * and there is a test in `meta` that compares those responses byte for byte.
 * All of that is undone by a page that says "no such user" for one and "wrong
 * password" for another. So: sign-in and the recovery flows never branch on
 * anything but "it failed", and the one message they show is the same for every
 * cause.
 */
import { ApiError, NetworkError } from './client';
import type { AppCopy } from '$lib/content/app';
import { fill } from '$lib/format';

/**
 * The message for a failure.
 *
 * Order matters: the locale's own table first (so English mode does not show
 * the API's Thai), then the API's message as the fallback for a code this build
 * does not know about, then a generic line.
 */
export function errorMessage(err: unknown, copy: AppCopy): string {
	if (err instanceof NetworkError) return copy.common.state.unreachable;
	if (!(err instanceof ApiError)) return copy.errors.INTERNAL;

	const known = copy.errors[err.code];
	if (err.code === 'RATE_LIMITED' && err.retryAfter !== null) {
		return `${known ?? err.message} ${fill(copy.common.retryAfter, { n: err.retryAfter })}`;
	}
	return known ?? err.message ?? copy.errors.INTERNAL;
}

/**
 * The per-field message, when the API attached one.
 *
 * `details[].issue` is a closed vocabulary shared with `$lib/validate`, so this
 * one table renders a locally-detected problem and a server-reported one
 * identically — which is what stops the form contradicting itself.
 *
 * `apiMessage` is that detail's own `message`, and the order is deliberate:
 *
 *   1. the locale's table, so English mode does not show the API's Thai for a
 *      problem this build already has words for;
 *   2. the API's sentence, for an `issue` this build has never heard of — the
 *      vocabulary is closed but it is `meta`'s to extend, and a site a version
 *      behind should say what is wrong rather than fall back to "invalid";
 *   3. "invalid", which is only ever reached when neither side wrote anything.
 */
export function fieldMessage(
	issue: string | null | undefined,
	copy: AppCopy,
	apiMessage?: string | null
): string | null {
	if (!issue) return null;
	const table = copy.issues as unknown as Record<string, string | undefined>;
	const fromApi = apiMessage?.trim();
	return table[issue] ?? (fromApi ? fromApi : copy.issues.invalid);
}

/** True when the failure means the session is gone and the UI should say so. */
export function isUnauthenticated(err: unknown): boolean {
	return err instanceof ApiError && err.status === 401;
}
