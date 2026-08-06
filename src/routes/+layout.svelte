<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { session } from '$lib/api/session.svelte';
	import { locale } from '$lib/i18n/locale.svelte';

	let { children } = $props();

	if (browser) {
		// The locale is resolved on the client, because the build is prerendered
		// and has no request whose cookie it could read. `app.html` ships
		// `lang="th"`, which is right for the default and for every crawler; this
		// corrects the attribute for a reader who has chosen English.
		locale.init();

		// One call to `/account/me`, once per page load, so that every header on
		// the site shows the right link. Script cannot read the session cookie —
		// that is the point of `HttpOnly` — so "am I signed in" has no local
		// answer and asking is the only way to know. A 401 is the ordinary
		// negative answer and costs one small request.
		void session.load();
	}
</script>

{@render children()}
