<script lang="ts">
	/**
	 * Ask for a reset link.
	 *
	 * The API answers 202 for an unknown address, for an address whose account
	 * has no verified link, and for a successful send — so this page shows one
	 * confirmation for all three. Saying "no account uses that address" would
	 * turn the form into a way of testing whether a given person plays this
	 * game, which identifies them outside it.
	 */
	import { resolve } from '$app/paths';
	import * as api from '$lib/api/endpoints';
	import { errorMessage } from '$lib/api/messages';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import Field from '$lib/components/Field.svelte';
	import { appCopy } from '$lib/content/app';
	import { locale } from '$lib/i18n/locale.svelte';
	import { fieldMessage } from '$lib/api/messages';
	import { validateEmail } from '$lib/validate';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.forgot);

	let email = $state('');
	let issue = $state<string | null>(null);
	let busy = $state(false);
	let sent = $state(false);
	let failure = $state('');

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		failure = '';
		issue = validateEmail(email);
		if (issue) return;
		busy = true;
		try {
			await api.forgotPassword(email.trim());
			sent = true;
		} catch (err) {
			failure = errorMessage(err, copy);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	<div class="wrap">
		{#if sent}
			<Alert tone="ok">
				<p>{c.sent}</p>
			</Alert>
			<p class="foot"><a href={resolve('/login')}>{c.backToLogin}</a></p>
		{:else}
			<form class="panel form" onsubmit={onSubmit} novalidate>
				<p class="form__intro">{c.intro}</p>

				{#if failure}
					<Alert tone="danger" assertive><p>{failure}</p></Alert>
				{/if}

				<Field
					id="email"
					label={c.emailLabel}
					type="email"
					bind:value={email}
					autocomplete="email"
					message={fieldMessage(issue, copy) ?? ''}
				/>

				<button class="btn btn--primary btn--block" type="submit" disabled={busy}>
					{busy ? copy.common.state.loading : c.submit}
				</button>
			</form>

			<Alert tone="warn"><p>{c.noEmailWarning}</p></Alert>
			<p class="foot"><a href={resolve('/login')}>{c.backToLogin}</a></p>
		{/if}
	</div>
</AppShell>

<style>
	.wrap {
		max-width: 32rem;
	}

	.form {
		padding: clamp(1.5rem, 5vw, 2.5rem);
		margin-block-end: 1.25rem;
	}

	.form__intro {
		margin-block-end: 1.75rem;
		color: var(--text-dim);
	}

	.foot {
		margin-block-start: 1.25rem;
		font-size: 0.9375rem;
	}
</style>
