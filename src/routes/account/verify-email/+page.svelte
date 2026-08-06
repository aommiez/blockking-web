<script lang="ts">
	/**
	 * The verification landing page.
	 *
	 * ACCOUNTS.md §5.3 condition 3, spelled out: **the GET shows a button and
	 * the POST spends the token.** Verifying on load would let a corporate mail
	 * scanner, a link preview or a browser prefetch consume the single-use token
	 * before the player ever opens the message — and they would then arrive at
	 * "this link has already been used", with no way to tell that from an
	 * attack.
	 *
	 * The token is read from the query string, held in memory, and sent in a
	 * request body. It is never rendered, never copied into a link, never
	 * logged.
	 */
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as api from '$lib/api/endpoints';
	import { errorMessage } from '$lib/api/messages';
	import { session } from '$lib/api/session.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { appCopy } from '$lib/content/app';
	import { locale } from '$lib/i18n/locale.svelte';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.verifyEmail);

	const token = $derived(page.url.searchParams.get('token') ?? '');

	let busy = $state(false);
	let done = $state(false);
	let failure = $state('');

	async function confirm() {
		busy = true;
		failure = '';
		try {
			const res = await api.verifyEmail(token);
			done = true;
			if (res.account) session.adopt(res.account);
		} catch (err) {
			failure = errorMessage(err, copy);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="referrer" content="no-referrer" />
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	<div class="wrap">
		{#if done}
			<Alert tone="ok"><p>{c.done}</p></Alert>
			<p class="foot">
				<a class="btn btn--primary" href={resolve('/account')}>{c.goAccount}</a>
			</p>
		{:else if !token}
			<Alert tone="danger"><p>{c.missingToken}</p></Alert>
		{:else}
			<div class="panel box">
				<p class="box__intro">{c.intro}</p>
				{#if failure}
					<Alert tone="danger" assertive><p>{failure}</p></Alert>
				{/if}
				<button class="btn btn--primary btn--block" type="button" disabled={busy} onclick={confirm}>
					{busy ? c.verifying : c.confirm}
				</button>
			</div>
		{/if}
	</div>
</AppShell>

<style>
	.wrap {
		max-width: 32rem;
	}

	.box {
		padding: clamp(1.5rem, 5vw, 2.5rem);
	}

	.box__intro {
		margin-block-end: 1.5rem;
		color: var(--text-dim);
	}

	.foot {
		margin-block-start: 1.25rem;
	}
</style>
