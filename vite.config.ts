import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

/**
 * The account pages talk to the meta API at `/v1`, same-origin, because the
 * session is an `HttpOnly` cookie that a cross-origin request cannot carry
 * (see `src/lib/api/config.ts`). Same-origin needs something in front of both;
 * in development that something is this proxy.
 *
 * The target is **not** written down here. Everything under `web/` is mirrored
 * to a public repository, so an address or a port committed in this file is a
 * published address and port. Put the real one in `.env.local`, which is
 * git-ignored, or export it before `npm run dev`:
 *
 *     $env:META_API_PROXY = "http://127.0.0.1:<port>"   # e.g. over an SSH tunnel
 *     npm run dev
 *
 * With it unset the dev server simply does not proxy, and the account pages
 * report that the API is unreachable — which is the truth, and a clearer
 * failure than a default that silently points somewhere wrong.
 */
export default defineConfig(({ mode }) => {
	// The empty prefix loads every key, not only `VITE_`: this one is read here
	// in the config, never shipped to the browser, and must not be.
	// '.' rather than `process.cwd()`: Vite resolves it the same way and this
	// file then needs no Node type declarations.
	const env = loadEnv(mode, '.', '');
	const target = (env.META_API_PROXY ?? '').trim();

	if (!target && mode === 'development') {
		console.warn(
			'[web] META_API_PROXY is not set — /v1 will not be proxied and the account ' +
				'pages will report the API as unreachable. See vite.config.ts.'
		);
	}

	return {
		plugins: [sveltekit()],
		server: target
			? {
					proxy: {
						'/v1': {
							target,
							// The Host header is left alone: the API sets a host-only
							// cookie, and rewriting Host would set it for the wrong name.
							changeOrigin: false
						}
					}
				}
			: undefined
	};
});
