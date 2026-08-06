/**
 * Copy for the account and leaderboard pages, in the same shape as the landing
 * page's `SiteCopy`: one typed dictionary per locale, no strings in components.
 *
 * Two entries deserve an explanation.
 *
 * `issues` mirrors the closed vocabulary `meta`'s `identIssue`/`passwordIssue`
 * return. Both the client-side check in `$lib/validate` and the API's `details`
 * array speak it, so one table renders both and they cannot drift apart.
 *
 * `errors` maps the API's stable `code` to a message. The API's own `message`
 * is Thai — correct for Thai players and useless in English mode — so English
 * needs its own text keyed by the code, with the API's message as the fallback
 * for a code this build has not seen.
 */
import type { Locale } from '../types';

/** Issue strings, as returned by the API's `details[].issue`. */
export interface IssueCopy {
	required: string;
	invalid: string;
	too_short: string;
	too_long: string;
	too_long_bytes: string;
	must_start_with_letter: string;
	bad_separator: string;
	character_not_allowed: string;
	control_character: string;
	invisible_character: string;
	text_direction_override: string;
	too_many_marks: string;
	starts_with_mark: string;
	no_content: string;
	same_as_name: string;
	too_common: string;
	invalid_encoding: string;
	taken: string;
	reserved: string;
	full: string;
	cooldown: string;
	tag_taken: string;
	email_verification_required: string;
}

export interface CommonCopy {
	brand: string;
	nav: { home: string; leaderboard: string; account: string; login: string; register: string };
	localeLabel: string;
	localeNames: Record<Locale, string>;
	actions: {
		save: string;
		cancel: string;
		submit: string;
		back: string;
		retry: string;
		close: string;
		understood: string;
		signOut: string;
		copy: string;
		copied: string;
	};
	state: {
		loading: string;
		saving: string;
		unreachable: string;
		signedOut: string;
		requiresSignIn: string;
		nothingHere: string;
	};
	units: { seconds: string; minutes: string; hours: string; days: string };
	guestBadge: string;
	staffBadge: string;
	/** Rendered under a form when the API asks for a wait. `{n}` is seconds. */
	retryAfter: string;
}

export interface RegisterCopy {
	eyebrow: string;
	title: string;
	intro: string;
	loginIdLabel: string;
	loginIdHint: string;
	loginIdPrivacyNote: string;
	loginIdChecking: string;
	loginIdAvailable: string;
	loginIdTaken: string;
	displayNameLabel: string;
	displayNameHint: string;
	displayNameThaiNote: string;
	displayNameCounter: string;
	displayNameBytes: string;
	passwordLabel: string;
	passwordHint: string;
	emailLabel: string;
	emailOptional: string;
	emailHint: string;
	submit: string;
	haveAccount: string;
	signIn: string;
	/** ACCOUNTS.md §5.1's blocking warning. */
	warning: {
		heading: string;
		lines: string[];
		linkNow: string;
		acknowledge: string;
		reminder: string;
	};
	success: { title: string; body: string; linkEmail: string; goAccount: string };
}

export interface LoginCopy {
	eyebrow: string;
	title: string;
	intro: string;
	loginIdLabel: string;
	passwordLabel: string;
	submit: string;
	forgot: string;
	noAccount: string;
	createAccount: string;
	/** One message for every failure, on purpose. */
	genericFailure: string;
}

export interface ForgotCopy {
	eyebrow: string;
	title: string;
	intro: string;
	emailLabel: string;
	submit: string;
	sent: string;
	noEmailWarning: string;
	backToLogin: string;
}

export interface ResetCopy {
	eyebrow: string;
	title: string;
	intro: string;
	missingToken: string;
	newPasswordLabel: string;
	confirmLabel: string;
	mismatch: string;
	submit: string;
	done: string;
	goLogin: string;
}

export interface VerifyEmailCopy {
	eyebrow: string;
	title: string;
	intro: string;
	missingToken: string;
	confirm: string;
	verifying: string;
	done: string;
	goAccount: string;
}

export interface AccountCopy {
	eyebrow: string;
	title: string;
	memberSince: string;
	lastLogin: string;
	never: string;
	publicProfile: string;
	tagExplain: string;
	recovery: {
		unsafeHeading: string;
		unsafeBody: string;
		safeHeading: string;
		safeBody: string;
		pendingHeading: string;
		pendingBody: string;
		resend: string;
		resent: string;
	};
	name: {
		heading: string;
		body: string;
		label: string;
		rules: string[];
		changesUsed: string;
		firstFree: string;
		secondNeedsEmail: string;
		cooldown: string;
		submit: string;
		done: string;
	};
	email: {
		heading: string;
		bodyUnlinked: string;
		bodyLinked: string;
		label: string;
		passwordLabel: string;
		passwordWhy: string;
		submit: string;
		sent: string;
		verifiedAs: string;
		pendingAs: string;
		changeNotAvailable: string;
	};
	password: {
		heading: string;
		body: string;
		currentLabel: string;
		newLabel: string;
		confirmLabel: string;
		mismatch: string;
		submit: string;
		done: string;
	};
	sessions: {
		heading: string;
		body: string;
		privacyNote: string;
		current: string;
		kindWeb: string;
		kindClient: string;
		issued: string;
		expires: string;
		signOutAll: string;
		signOutAllBody: string;
		passwordLabel: string;
		passwordWhy: string;
		noPerSessionNote: string;
		done: string;
	};
}

export interface LeaderboardCopy {
	eyebrow: string;
	title: string;
	intro: string;
	tabs: { career: string; live: string };
	freshness: string;
	freshnessNote: string;
	whyDifferentHeading: string;
	whyDifferentBody: string;
	example: string;
	columns: {
		rank: string;
		player: string;
		career: string;
		live: string;
		dropped: string;
		kd: string;
		streak: string;
		playtime: string;
		lastSeen: string;
	};
	perPage: string;
	rangeLabel: string;
	prev: string;
	next: string;
	empty: string;
	privacyNote: string;
}

export interface PlayersCopy {
	eyebrow: string;
	title: string;
	missingId: string;
	notFound: string;
	stats: {
		career: string;
		live: string;
		dropped: string;
		kills: string;
		deaths: string;
		kd: string;
		bestStreak: string;
		playtime: string;
		sessions: string;
		firstSeen: string;
		lastSeen: string;
	};
	privacyNote: string;
}

export interface AppCopy {
	locale: Locale;
	common: CommonCopy;
	issues: IssueCopy;
	/** Keyed by the API's `error.code`. */
	errors: Record<string, string>;
	register: RegisterCopy;
	login: LoginCopy;
	forgot: ForgotCopy;
	reset: ResetCopy;
	verifyEmail: VerifyEmailCopy;
	account: AccountCopy;
	leaderboard: LeaderboardCopy;
	players: PlayersCopy;
}
