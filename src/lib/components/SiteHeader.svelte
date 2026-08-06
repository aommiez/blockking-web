<script lang="ts">
	import { resolve } from '$app/paths';
	import { session } from '$lib/api/session.svelte';
	import { appCopy } from '$lib/content/app';
	import { locale } from '$lib/i18n/locale.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();

	// The account links and the language switch come from the app dictionary,
	// which is the one shared by every page that is not this landing page. The
	// alternative is the same four words duplicated into `SiteCopy`.
	const app = $derived(appCopy(locale.current));
</script>

<header class="header">
	<div class="shell header__inner">
		<a class="brand" href="#top">
			<span class="brand__mark" aria-hidden="true"></span>
			<span class="brand__word">BLOCKKING</span>
		</a>

		<nav class="nav" aria-label={app.common.brand}>
			{#each copy.nav.links as link (link.href)}
				<a class="nav__link" href={link.href}>{link.label}</a>
			{/each}
			<a class="nav__link" href={resolve('/leaderboard')}>{app.common.nav.leaderboard}</a>
			{#if session.status === 'in'}
				<a class="nav__link" href={resolve('/account')}>{app.common.nav.account}</a>
			{:else}
				<a class="nav__link" href={resolve('/login')}>{app.common.nav.login}</a>
			{/if}
		</nav>

		<div class="header__right">
			<LocaleSwitch copy={app} />
			<a class="btn btn--primary header__cta" href={copy.hero.primaryHref}>{copy.nav.cta}</a>
		</div>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgb(10 14 17 / 88%);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}

	.header__inner {
		display: flex;
		align-items: center;
		gap: 0.6rem 1.25rem;
		min-height: 4.25rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--text);
		text-decoration: none;
		font-weight: 900;
		letter-spacing: 0.06em;
	}

	/* Three-block stack: the same crown silhouette as the favicon, in miniature. */
	.brand__mark {
		width: 1.15rem;
		height: 1.15rem;
		background: var(--ember);
		box-shadow:
			0 -0.4rem 0 -0.05rem var(--ember),
			0.35rem 0.35rem 0 rgb(201 95 19 / 55%);
	}

	.brand__word {
		font-size: 1.05rem;
	}

	.nav {
		display: none;
		margin-inline-start: auto;
		gap: 1.2rem;
	}

	.nav__link {
		color: var(--text-dim);
		font-size: 0.9375rem;
		font-weight: 600;
		text-decoration: none;
		padding-block: 0.25rem;
		border-bottom: 2px solid transparent;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.nav__link:hover,
	.nav__link:focus-visible {
		color: var(--text);
		border-bottom-color: var(--ember);
	}

	.header__right {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		/* With the nav hidden on narrow screens this is what keeps the language
		   switch and the download button on the right-hand edge. */
		margin-inline-start: auto;
	}

	.header__cta {
		padding: 0.6rem 1.1rem;
		font-size: 0.9rem;
		box-shadow: 4px 4px 0 var(--ember-deep);
	}

	@media (min-width: 62rem) {
		.nav {
			display: flex;
		}
	}
</style>
