/**
 * The shapes `meta/` returns, transcribed from `meta/README.md` §API and the
 * handlers it documents. Hand-written rather than generated: there is no
 * committed OpenAPI file yet (ACCOUNTS.md §10 asks for one at
 * `web/openapi/accounts.yaml`), and a wrong guess here shows up as a blank
 * field on screen rather than as a type error, so the field list is worth
 * writing out.
 *
 * Note what is *absent* and must stay absent: there is no `login_id` anywhere.
 * No endpoint returns one, not even to its owner (ACCOUNTS.md §2.1), so no type
 * here has a place to put one.
 */

/**
 * One field's validation problem, keyed by the API's closed vocabulary.
 *
 * `message` is the API's own Thai sentence for this exact problem, and it is
 * there because a client left to compose the sentence composes "invalid" —
 * `meta/README.md` §"Errors say what to do". It is optional because not every
 * handler attaches one, so it is a fallback for an `issue` this build has no
 * wording for, never a replacement for the locale's own table.
 */
export interface FieldDetail {
	field: string;
	issue: string;
	message?: string;
}

export interface ApiErrorBody {
	error: {
		code: string;
		message: string;
		details?: FieldDetail[];
		request_id: string;
	};
}

/** The account, as its owner sees it. */
export interface Account {
	/** A u64 as a string — it does not fit in a JavaScript number. */
	account_id: string;
	display_name: string;
	player_tag: number;
	/** `display_name#0421`, pre-formatted by the API. */
	tagged_name: string;
	email_verified: boolean;
	has_email: boolean;
	/** False means: forget the password and the account is gone. */
	recoverable: boolean;
	staff_level: number;
	created_at: string;
	last_login_at?: string;
	display_name_change_count: number;
}

export interface AccountWarning {
	code: string;
	message: string;
}

export interface SessionResponse {
	account: Account;
	expires_at: string;
	/** Only ever set for a game-client (bearer) session. Never for the web. */
	token?: string;
	warning?: AccountWarning;
}

/** §6.2's permission table, computed by the API so no client re-derives it. */
export interface Permissions {
	play: boolean;
	live_top10: boolean;
	report_players: boolean;
	set_display_name: boolean;
	season_leaderboard: boolean;
	purchase: boolean;
	change_display_name: boolean;
	chat_global: boolean;
}

export interface MeResponse {
	account: Account;
	session: { kind: string; expires_at: string };
	warning?: AccountWarning;
	/** The owner's own address, and nobody else's. Absent when none is linked. */
	email?: { address: string; verified: boolean };
	permissions: Permissions;
}

/**
 * One signed-in session. Deliberately carries no address and no user agent:
 * this list is readable by anybody holding a session, and handing them the
 * owner's home address is not a feature.
 */
export interface SessionRow {
	id: string;
	kind: string;
	current: boolean;
	issued_at: string;
	expires_at: string;
}

export type Board = 'career' | 'live';

/** The Thai wording for the two boards, shipped with the data. */
export interface BoardExplanation {
	career: string;
	live: string;
}

export interface LeaderboardEntry {
	rank: number;
	display_name: string;
	/** 0 for a guest identity, which has no account and therefore no tag. */
	player_tag: number;
	registered: boolean;
	score_career: number;
	score_live: number;
	score_dropped: number;
	kills: number;
	deaths: number;
	best_streak: number;
	playtime_seconds: number;
	sessions_total: number;
	last_seen_at: string;
}

export interface LeaderboardResponse {
	board: Board;
	data: LeaderboardEntry[];
	total: number;
	limit: number;
	offset: number;
	/** When the board was *computed*, not when it was served. Meant to be shown. */
	generated_at: string;
	/** Cache lifetime in seconds. Also meant to be shown. */
	stale_after_s: number;
	explain: BoardExplanation;
}

export interface PlayerProfile {
	display_name: string;
	player_tag: number;
	registered: boolean;
	score_career: number;
	score_live: number;
	score_dropped: number;
	kills: number;
	deaths: number;
	kd_ratio: number;
	best_streak: number;
	playtime_seconds: number;
	sessions_total: number;
	first_seen_at: string;
	last_seen_at: string;
}

export interface PlayerProfileResponse {
	data: PlayerProfile;
	generated_at: string;
	explain: BoardExplanation;
}

export interface OkResponse {
	ok: boolean;
	message?: string;
	note?: string;
	account?: Account;
	sessions_revoked?: number;
}

export interface LoginIDAvailability {
	available: boolean;
	reason?: string;
}
