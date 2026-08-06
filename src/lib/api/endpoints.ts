/**
 * One function per endpoint, so that no component has to remember a path or a
 * field name. The bodies name exactly the fields the API declares: it decodes
 * with unknown fields refused, so an extra key is a 400 rather than a shrug.
 */
import { request } from './client';
import type {
	Board,
	LeaderboardResponse,
	LoginIDAvailability,
	MeResponse,
	OkResponse,
	PlayerProfileResponse,
	SessionResponse,
	SessionRow
} from './types';

// --- auth --------------------------------------------------------------------

export interface RegisterInput {
	loginId: string;
	password: string;
	displayName: string;
	/** Empty string when the player chose to register without one. */
	email: string;
	/** ACCOUNTS.md §5.1's acknowledgement. Required when `email` is empty. */
	noEmailAck: boolean;
}

export function register(input: RegisterInput, signal?: AbortSignal) {
	return request<SessionResponse>('/auth/register', {
		method: 'POST',
		signal,
		body: {
			login_id: input.loginId,
			password: input.password,
			display_name: input.displayName,
			email: input.email,
			no_email_ack: input.noEmailAck
		}
	});
}

export function loginIdAvailable(loginId: string, signal?: AbortSignal) {
	return request<LoginIDAvailability>('/auth/login-id-available', {
		query: { login_id: loginId },
		signal
	});
}

export function login(loginId: string, password: string, signal?: AbortSignal) {
	return request<SessionResponse>('/auth/login', {
		method: 'POST',
		signal,
		body: { login_id: loginId, password }
	});
}

export function logout() {
	return request<OkResponse>('/auth/logout', { method: 'POST' });
}

export function logoutEverywhere(password: string) {
	return request<OkResponse>('/auth/logout-all', { method: 'POST', body: { password } });
}

export function forgotPassword(email: string) {
	return request<OkResponse>('/auth/password/forgot', { method: 'POST', body: { email } });
}

export function resetPassword(token: string, newPassword: string) {
	return request<OkResponse>('/auth/password/reset', {
		method: 'POST',
		body: { token, new_password: newPassword }
	});
}

// --- the signed-in account ---------------------------------------------------

export function me(signal?: AbortSignal) {
	return request<MeResponse>('/account/me', { signal });
}

export function listSessions(signal?: AbortSignal) {
	return request<{ data: SessionRow[] }>('/account/sessions', { signal });
}

export function changePassword(currentPassword: string, newPassword: string) {
	return request<OkResponse>('/account/password', {
		method: 'POST',
		body: { current_password: currentPassword, new_password: newPassword }
	});
}

export function linkEmail(email: string, currentPassword: string) {
	return request<OkResponse>('/account/email', {
		method: 'POST',
		body: { email, current_password: currentPassword }
	});
}

export function resendVerification() {
	return request<OkResponse>('/account/email/resend', { method: 'POST' });
}

export function verifyEmail(token: string) {
	return request<OkResponse>('/account/email/verify', { method: 'POST', body: { token } });
}

export function setDisplayName(displayName: string) {
	return request<OkResponse>('/account/display-name', {
		method: 'PATCH',
		body: { display_name: displayName }
	});
}

// --- public ------------------------------------------------------------------

export function leaderboard(board: Board, limit: number, offset: number, signal?: AbortSignal) {
	return request<LeaderboardResponse>('/leaderboard', {
		query: { board, limit, offset },
		signal
	});
}

export function playerProfile(accountId: string, signal?: AbortSignal) {
	return request<PlayerProfileResponse>(`/players/${encodeURIComponent(accountId)}`, { signal });
}
