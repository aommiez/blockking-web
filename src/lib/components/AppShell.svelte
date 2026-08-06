<script lang="ts">
	/**
	 * The frame every account and leaderboard page sits in: brand, navigation,
	 * the language switch, and whatever the session store currently knows.
	 *
	 * The nav shows "my account" or "sign in" from `session.status`, which is
	 * the *last answer from the API* rather than a guess. Until that first
	 * answer arrives it shows neither, because rendering "sign in" to somebody
	 * who is signed in — and then swapping it — is the flicker that makes a page
	 * feel broken.
	 */
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import { session } from '$lib/api/session.svelte';
	import type { AppCopy } from '$lib/content/app';
	import LocaleSwitch from './LocaleSwitch.svelte';

	let {
		copy,
		eyebrow,
		title,
		children
	}: { copy: AppCopy; eyebrow?: string; title?: string; children: Snippet } = $props();

	const nav = $derived(copy.common.nav);
</script>

<div class="page">
	<header class="bar">
		<div class="shell bar__inner">
			<a class="brand" href={resolve('/')}>
				<span class="brand__mark" aria-hidden="true"></span>
				<span class="brand__word">{copy.common.brand}</span>
			</a>

			<nav class="nav" aria-label={copy.common.brand}>
				<a class="nav__link" href={resolve('/leaderboard')}>{nav.leaderboard}</a>
				{#if session.status === 'in'}
					<a class="nav__link" href={resolve('/account')}>{nav.account}</a>
				{:else if session.status === 'out'}
					<a class="nav__link" href={resolve('/login')}>{nav.login}</a>
					<a class="nav__link nav__link--cta" href={resolve('/register')}>{nav.register}</a>
				{/if}
			</nav>

			<LocaleSwitch {copy} />
		</div>
	</header>

	<main class="shell main">
		{#if eyebrow || title}
			<div class="head">
				{#if eyebrow}<p class="section__eyebrow">{eyebrow}</p>{/if}
				{#if title}<h1 class="section__title">{title}</h1>{/if}
			</div>
		{/if}
		{@render children()}
	</main>

	<footer class="foot">
		<div class="shell foot__inner">
			<a href={resolve('/')}>{nav.home}</a>
			<a href={resolve('/leaderboard')}>{nav.leaderboard}</a>
			<span class="foot__copy">© 2026 BlockKing</span>
		</div>
	</footer>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgb(10 14 17 / 92%);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}

	.bar__inner {
		display: flex;
		align-items: center;
		gap: 0.75rem 1.25rem;
		flex-wrap: wrap;
		min-height: 4.25rem;
		padding-block: 0.6rem;
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

	.brand__mark {
		width: 1.15rem;
		height: 1.15rem;
		background: var(--ember);
		box-shadow:
			0 -0.4rem 0 -0.05rem var(--ember),
			0.35rem 0.35rem 0 rgb(201 95 19 / 55%);
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 1.1rem;
		margin-inline-start: auto;
	}

	.nav__link {
		color: var(--text-dim);
		font-size: 0.9375rem;
		font-weight: 600;
		text-decoration: none;
		padding-block: 0.25rem;
		border-bottom: 2px solid transparent;
	}

	.nav__link:hover,
	.nav__link:focus-visible {
		color: var(--text);
		border-bottom-color: var(--ember);
	}

	.nav__link--cta {
		color: var(--ember);
	}

	.main {
		flex: 1 0 auto;
		padding-block: clamp(2rem, 6vw, 3.5rem) clamp(3rem, 8vw, 5rem);
	}

	.head {
		margin-block-end: 2rem;
	}

	.foot {
		border-top: 1px solid var(--line);
		background: var(--bg-alt);
		padding-block: 1.75rem;
	}

	.foot__inner {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		align-items: center;
		font-size: 0.875rem;
	}

	.foot__copy {
		color: var(--text-faint);
		margin-inline-start: auto;
	}
</style>
