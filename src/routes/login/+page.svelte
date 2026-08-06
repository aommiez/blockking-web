<script lang="ts">
	/**
	 * Sign in.
	 *
	 * There is deliberately no per-field validation and no per-cause message
	 * here. ACCOUNTS.md §4.4 makes every failed login answer identically — no
	 * account, wrong password, and a locked account are one response, pinned
	 * byte for byte by a test in `meta` — and a form that says "that user does
	 * not exist" for one of them hands back exactly what the API spent that
	 * effort withholding. One message, whatever happened.
	 *
	 * The 429 case is the one exception worth showing, because it is not about
	 * the account: it is "you are going too fast", and the API answers it the
	 * same way whether or not the id exists.
	 */
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ApiError, NetworkError } from '$lib/api/client';
	import * as api from '$lib/api/endpoints';
	import { session } from '$lib/api/session.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import Field from '$lib/components/Field.svelte';
	import { appCopy } from '$lib/content/app';
	import { fill } from '$lib/format';
	import { locale } from '$lib/i18n/locale.svelte';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.login);

	let loginId = $state('');
	let password = $state('');
	let busy = $state(false);
	let failure = $state('');

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		failure = '';
		if (loginId.trim() === '' || password === '') {
			failure = c.genericFailure;
			return;
		}
		busy = true;
		try {
			const res = await api.login(loginId.trim().toLowerCase(), password);
			session.adopt(res.account);
			password = '';
			// Always the account page. A `?next=` parameter would be an
			// open-redirect surface on a page whose whole job is authentication,
			// bought for the convenience of two links.
			await goto(resolve('/account'));
		} catch (err) {
			password = '';
			if (err instanceof NetworkError) {
				failure = copy.common.state.unreachable;
			} else if (err instanceof ApiError && err.status === 429) {
				failure =
					copy.errors.RATE_LIMITED +
					(err.retryAfter !== null
						? ' ' + fill(copy.common.retryAfter, { n: err.retryAfter })
						: '');
			} else {
				// Every other outcome is the same sentence, on purpose.
				failure = c.genericFailure;
			}
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
		<form class="panel form" onsubmit={onSubmit} novalidate>
			<p class="form__intro">{c.intro}</p>

			{#if failure}
				<Alert tone="danger" assertive>
					<p>{failure}</p>
				</Alert>
			{/if}

			<Field
				id="login-id"
				label={c.loginIdLabel}
				bind:value={loginId}
				autocomplete="username"
				required
			/>

			<Field
				id="password"
				label={c.passwordLabel}
				type="password"
				bind:value={password}
				autocomplete="current-password"
				required
			/>

			<button class="btn btn--primary btn--block" type="submit" disabled={busy}>
				{busy ? copy.common.state.loading : c.submit}
			</button>

			<p class="form__foot">
				<a href={resolve('/account/forgot')}>{c.forgot}</a>
			</p>
			<p class="form__foot">
				{c.noAccount}
				<a href={resolve('/register')}>{c.createAccount}</a>
			</p>
		</form>
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

	.form__foot {
		margin-block-start: 1rem;
		color: var(--text-faint);
		font-size: 0.9375rem;
	}
</style>
