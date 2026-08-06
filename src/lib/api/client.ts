/**
 * The one place this site talks to the account API.
 *
 * # Where the credential lives
 *
 * Nowhere in this file. The session is an `HttpOnly` cookie the API sets and
 * the browser attaches; no token is read, stored or logged here, and there is
 * deliberately no `localStorage` anywhere in `web/`. A web login never receives
 * a token in a body — `meta/internal/httpapi/auth.go` only puts one there for a
 * game client — so there is nothing for script to leak.
 *
 * # CSRF
 *
 * The session cookie is `SameSite=Lax`, which means a browser will not attach
 * it to a cross-site `POST`/`PATCH` at all. Every mutation this site performs
 * is one of those, so the cross-site version of it arrives unauthenticated.
 * Two further things have to hold for that to be the whole answer, and both do:
 *
 *   - every request here sends `Content-Type: application/json`, which a plain
 *     cross-site `<form>` cannot produce; and the API decodes JSON with
 *     unknown fields refused, so a form-encoded body is rejected before it
 *     reaches a handler;
 *   - `X-Requested-With` is sent on same-origin calls. A cross-origin caller
 *     cannot set it without a preflight, and the API answers no preflight.
 *
 * There is no CSRF *token*, because the API does not check one. Inventing a
 * header it ignores would look like protection and be none.
 *
 * # Errors
 *
 * Every non-2xx carries `{"error":{code,message,…}}`. `code` is the stable
 * string to branch on; `message` is Thai and written for a player, so it is
 * usually the right thing to show. `ApiError` keeps `request_id` so a support
 * message can quote it.
 */
import { apiBase, apiIsCrossOrigin } from './config';
import type { ApiErrorBody, FieldDetail } from './types';

export class ApiError extends Error {
	readonly status: number;
	readonly code: string;
	readonly details: FieldDetail[];
	readonly requestId: string;
	/** Seconds, from `Retry-After`, when the API asked us to wait. */
	readonly retryAfter: number | null;

	constructor(
		status: number,
		code: string,
		message: string,
		details: FieldDetail[],
		requestId: string,
		retryAfter: number | null
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.details = details;
		this.requestId = requestId;
		this.retryAfter = retryAfter;
	}

	/** The issue string the API attached to one field, if it attached one. */
	issueFor(field: string): string | null {
		return this.details.find((d) => d.field === field)?.issue ?? null;
	}

	/**
	 * The API's own sentence per field, for the fields it wrote one for.
	 *
	 * A whole map rather than one lookup, so a form stores the answer to *this*
	 * failure in one assignment and cannot end up showing a message left over
	 * from the previous one.
	 */
	fieldMessages(): Record<string, string> {
		const out: Record<string, string> = {};
		for (const d of this.details) {
			if (d.message) out[d.field] = d.message;
		}
		return out;
	}
}

/** Thrown when the API could not be reached at all. */
export class NetworkError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NetworkError';
	}
}

export interface RequestOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	/** Serialised as JSON. Send exactly the documented fields: the API refuses unknown ones. */
	body?: unknown;
	query?: Record<string, string | number | undefined>;
	signal?: AbortSignal;
}

function buildURL(path: string, query?: RequestOptions['query']): string {
	const url = apiBase + path;
	if (!query) return url;
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(query)) {
		if (v !== undefined && v !== '') params.set(k, String(v));
	}
	const qs = params.toString();
	return qs ? `${url}?${qs}` : url;
}

function parseRetryAfter(res: Response): number | null {
	const raw = res.headers.get('Retry-After');
	if (!raw) return null;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { method = 'GET', body, query, signal } = options;

	const headers: Record<string, string> = { Accept: 'application/json' };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (!apiIsCrossOrigin) headers['X-Requested-With'] = 'blockking-web';

	let res: Response;
	try {
		res = await fetch(buildURL(path, query), {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body),
			// The cookie is the whole authentication mechanism, so it has to go
			// out. `include` rather than `same-origin` so that a future
			// cross-origin deployment does not silently sign everybody out — it
			// will fail loudly on CORS instead, which is the correct signal.
			credentials: 'include',
			signal,
			redirect: 'error',
			// The API sets `Cache-Control: no-store`; this stops a proxy or a
			// back/forward navigation resurrecting an authenticated response.
			cache: 'no-store'
		});
	} catch (err) {
		if (err instanceof DOMException && err.name === 'AbortError') throw err;
		throw new NetworkError(String(err));
	}

	if (res.status === 204) return undefined as T;

	const text = await res.text();
	let parsed: unknown = null;
	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			parsed = null;
		}
	}

	if (!res.ok) {
		const envelope = parsed as ApiErrorBody | null;
		const e = envelope?.error;
		throw new ApiError(
			res.status,
			e?.code ?? 'INTERNAL',
			e?.message ?? 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง',
			e?.details ?? [],
			e?.request_id ?? '',
			parseRetryAfter(res)
		);
	}
	return parsed as T;
}
