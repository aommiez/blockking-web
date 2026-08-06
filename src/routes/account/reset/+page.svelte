<script lang="ts">
	/**
	 * Spend a password-reset token.
	 *
	 * The token arrives in the query string, which ACCOUNTS.md §5.3 permits only
	 * for mail links and only with five compensating conditions. Two of them are
	 * this page's to keep:
	 *
	 *   - the token is **never** put anywhere but the request body. It is not
	 *     written into a link, not put in a heading, not logged;
	 *   - the GET does nothing. Opening this page shows a form; the token is
	 *     spent by the POST the player triggers, so a mail scanner or a browser
	 *     prefetch cannot consume it before they arrive.
	 *
	 * `Referrer-Policy: no-referrer` is the third, and it is a response header —
	 * see the deployment note in web/README.md, because a static host has to be
	 * configured to send it.
	 */
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as api from '$lib/api/endpoints';
	import { errorMessage, fieldMessage } from '$lib/api/messages';
	import { session } from '$lib/api/session.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import Field from '$lib/components/Field.svelte';
	import { ApiError } from '$lib/api/client';
	import { appCopy } from '$lib/content/app';
	import { locale } from '$lib/i18n/locale.svelte';
	import { validatePassword } from '$lib/validate';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.reset);

	const token = $derived(page.url.searchParams.get('token') ?? '');

	let next = $state('');
	let confirm = $state('');
	let issue = $state<string | null>(null);
	// `meta`'s own wording, for a password rule this build has no words for.
	let apiMessages = $state<Record<string, string>>({});
	let mismatch = $state(false);
	let busy = $state(false);
	let done = $state(false);
	let failure = $state('');

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		failure = '';
		apiMessages = {};
		issue = validatePassword(next);
		mismatch = next !== confirm;
		if (issue || mismatch) return;
		busy = true;
		try {
			await api.resetPassword(token, next);
			// Every session of the account is revoked by this call, including any
			// this browser held. Reflect that rather than leaving a nav bar that
			// still says "my account".
			session.clear();
			done = true;
		} catch (err) {
			failure = errorMessage(err, copy);
			if (err instanceof ApiError) {
				apiMessages = err.fieldMessages();
				issue = err.issueFor('new_password') ?? issue;
			}
		} finally {
			next = '';
			confirm = '';
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
			<p class="foot"><a class="btn btn--primary" href={resolve('/login')}>{c.goLogin}</a></p>
		{:else if !token}
			<Alert tone="danger"><p>{c.missingToken}</p></Alert>
			<p class="foot"><a href={resolve('/account/forgot')}>{copy.forgot.title}</a></p>
		{:else}
			<form class="panel form" onsubmit={onSubmit} novalidate>
				<p class="form__intro">{c.intro}</p>

				{#if failure}
					<Alert tone="danger" assertive><p>{failure}</p></Alert>
				{/if}

				<Field
					id="new-password"
					label={c.newPasswordLabel}
					type="password"
					bind:value={next}
					autocomplete="new-password"
					hint={copy.register.passwordHint}
					message={fieldMessage(issue, copy, apiMessages.new_password) ?? ''}
				/>

				<Field
					id="confirm-password"
					label={c.confirmLabel}
					type="password"
					bind:value={confirm}
					autocomplete="new-password"
					message={mismatch ? c.mismatch : ''}
				/>

				<button class="btn btn--primary btn--block" type="submit" disabled={busy}>
					{busy ? copy.common.state.saving : c.submit}
				</button>
			</form>
		{/if}
	</div>
</AppShell>

<style>
	.wrap {
		max-width: 32rem;
	}

	.form {
		padding: clamp(1.5rem, 5vw, 2.5rem);
	}

	.form__intro {
		margin-block-end: 1.75rem;
		color: var(--text-dim);
	}

	.foot {
		margin-block-start: 1.25rem;
	}
</style>
