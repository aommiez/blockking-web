/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />

declare global {
	/**
	 * Build-time configuration. Nothing here may carry a host name, an address
	 * or a port: this directory is mirrored to a public repository (see
	 * web/README.md), so every environment-specific value arrives through
	 * Vite's env at build time and has a same-origin default that is safe to
	 * publish.
	 */
	interface ImportMetaEnv {
		/**
		 * Where the meta API lives, as seen by the browser. Defaults to `/v1`,
		 * i.e. same-origin, which is the only shape that works with the API's
		 * `HttpOnly` session cookie without CORS. Set it at build time only if
		 * the API is served from somewhere else and that somewhere else sends
		 * the CORS headers to match.
		 */
		readonly VITE_META_API_BASE?: string;
	}
}

export {};
