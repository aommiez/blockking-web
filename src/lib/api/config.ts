/**
 * Where the account API is.
 *
 * The default is `/v1` — a *relative* path, so the browser talks to whatever
 * origin served the page. That is not a shortcut; it is the only arrangement in
 * which the session works at all today:
 *
 *   - the session is an `HttpOnly` cookie minted by the API, and in production
 *     that cookie carries the `__Host-` prefix, which forbids a `Domain`
 *     attribute. A `__Host-` cookie set by `api.example` is never sent to
 *     `www.example`;
 *   - the API sends no CORS headers at all, so a cross-origin `fetch` from this
 *     page cannot read a response even if the cookie did travel.
 *
 * Both are fixed by putting the API and the page on one origin, which is a
 * reverse-proxy route, not a change here. Until that exists the value stays
 * relative and the dev server proxies `/v1` (see `vite.config.ts`).
 *
 * `VITE_META_API_BASE` overrides it at build time for the day the API has its
 * own name and its own CORS policy.
 */
const configured = import.meta.env.VITE_META_API_BASE;

/** Base URL of the API, without a trailing slash. */
export const apiBase: string = (configured?.trim() || '/v1').replace(/\/+$/, '');

/** True when the API is on a different origin, so requests need `include`. */
export const apiIsCrossOrigin: boolean = /^https?:\/\//i.test(apiBase);
