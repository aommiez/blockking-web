/**
 * Who is signed in, as far as this tab knows.
 *
 * The authority is the cookie, which script cannot read, so "am I signed in" is
 * only ever answered by asking the API. This holds the last answer and the
 * request in flight; it never holds a credential.
 *
 * A 401 anywhere in the app should call `clear()`: the API revokes sessions for
 * reasons the page cannot see (a password change elsewhere, "log out
 * everywhere" from another device), and the honest response is to show the
 * signed-out state rather than a page full of stale data.
 */
import { ApiError } from './client';
import * as api from './endpoints';
import type { Account, MeResponse } from './types';

type Status = 'unknown' | 'loading' | 'in' | 'out';

class SessionStore {
	status = $state<Status>('unknown');
	me = $state<MeResponse | null>(null);
	/** Set when the API could not be reached, as opposed to answering 401. */
	unreachable = $state(false);

	get account(): Account | null {
		return this.me?.account ?? null;
	}

	/** True while the answer is genuinely not known yet, so pages can hold off. */
	get settled(): boolean {
		return this.status === 'in' || this.status === 'out';
	}

	/** ACCOUNTS.md §5.1: no verified email means no recovery, ever. */
	get recoverable(): boolean {
		return this.me?.account.recoverable ?? false;
	}

	async load(force = false): Promise<void> {
		if (!force && (this.status === 'loading' || this.status === 'in')) return;
		this.status = 'loading';
		try {
			this.me = await api.me();
			this.unreachable = false;
			this.status = 'in';
		} catch (err) {
			this.me = null;
			// 401 is the ordinary "not signed in" answer, not a failure. Anything
			// else is recorded so the page can say "cannot reach the server"
			// instead of "you are signed out", which are different problems.
			this.unreachable = !(err instanceof ApiError) || err.status >= 500;
			this.status = 'out';
		}
	}

	/** Adopt the account a register/login response just returned. */
	adopt(account: Account): void {
		this.me = {
			account,
			session: this.me?.session ?? { kind: 'web', expires_at: '' },
			permissions: this.me?.permissions ?? {
				play: true,
				live_top10: true,
				report_players: true,
				set_display_name: true,
				season_leaderboard: account.email_verified,
				purchase: account.email_verified,
				change_display_name: account.email_verified || account.display_name_change_count === 0,
				chat_global: account.email_verified
			}
		};
		this.status = 'in';
	}

	clear(): void {
		this.me = null;
		this.status = 'out';
	}
}

export const session = new SessionStore();
