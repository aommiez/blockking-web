<script lang="ts">
	import { resolve } from '$app/paths';
	import { ApiError } from '$lib/api/client';
	import * as api from '$lib/api/endpoints';
	import { errorMessage, fieldMessage } from '$lib/api/messages';
	import { session } from '$lib/api/session.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import Field from '$lib/components/Field.svelte';
	import NoEmailWarning from '$lib/components/NoEmailWarning.svelte';
	import { appCopy } from '$lib/content/app';
	import { fill, taggedName } from '$lib/format';
	import { locale } from '$lib/i18n/locale.svelte';
	import {
		DISPLAY_NAME_MAX,
		DISPLAY_NAME_MAX_BYTES,
		LOGIN_ID_MAX,
		countBytes,
		countGraphemes,
		normaliseDisplayName,
		normaliseLoginID,
		validateDisplayName,
		validateEmail,
		validateLoginID,
		validatePassword
	} from '$lib/validate';
	import type { Account } from '$lib/api/types';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.register);

	let loginId = $state('');
	let displayName = $state('');
	let password = $state('');
	let email = $state('');

	let loginIdIssue = $state<string | null>(null);
	let displayNameIssue = $state<string | null>(null);
	let passwordIssue = $state<string | null>(null);
	let emailIssue = $state<string | null>(null);

	// The API's own sentence per field, kept beside the issue strings above and
	// replaced wholesale by each failure. It is what a field falls back to when
	// this build has no wording for the issue — the password rules that live
	// only in `meta` (the common-password blocklist, "not built out of your own
	// name") are the ones that arrive this way, and showing "invalid" for them
	// is exactly what `meta/README.md` §"Errors say what to do" refuses.
	let apiMessages = $state<Record<string, string>>({});

	type Availability = 'idle' | 'checking' | 'free' | 'taken';
	let availability = $state<Availability>('idle');

	let warningOpen = $state(false);
	let busy = $state(false);
	let formError = $state('');
	let created = $state<Account | null>(null);

	let emailInput = $state<HTMLElement | null>(null);

	// --- live availability ---------------------------------------------------
	//
	// Debounced, and skipped entirely while the id is locally invalid. The
	// endpoint is rate-limited at 10 a minute per address (ACCOUNTS.md §4.4 is
	// explicit that it leaks by necessity and pays for it with a hard limit), so
	// firing on every keystroke would spend the budget on strings that cannot be
	// registered anyway and leave the player looking at a 429.
	let checkTimer: ReturnType<typeof setTimeout> | null = null;
	let checkController: AbortController | null = null;

	function scheduleAvailabilityCheck() {
		if (checkTimer) clearTimeout(checkTimer);
		checkController?.abort();
		const value = normaliseLoginID(loginId);
		const issue = validateLoginID(value);
		loginIdIssue = value === '' ? null : issue;
		if (issue !== null || value === '') {
			availability = 'idle';
			return;
		}
		availability = 'checking';
		checkTimer = setTimeout(() => void runAvailabilityCheck(value), 500);
	}

	async function runAvailabilityCheck(value: string) {
		const controller = new AbortController();
		checkController = controller;
		try {
			const res = await api.loginIdAvailable(value, controller.signal);
			if (controller.signal.aborted || normaliseLoginID(loginId) !== value) return;
			availability = res.available ? 'free' : 'taken';
			if (!res.available && res.reason && res.reason !== 'taken') loginIdIssue = res.reason;
		} catch (err) {
			if (controller.signal.aborted) return;
			// A failed check is not a validation result. Say nothing and let the
			// registration attempt be the authority — the alternative is telling
			// somebody their name is taken because a rate limit was reached.
			availability = 'idle';
			void err;
		}
	}

	// --- counters ------------------------------------------------------------

	const nameNormalised = $derived(normaliseDisplayName(displayName));
	const nameGraphemes = $derived(countGraphemes(nameNormalised));
	const nameBytes = $derived(countBytes(nameNormalised));
	// The byte counter only appears once it matters, which for a Thai name with
	// tone marks is well before the 16th character (see `$lib/validate`).
	const showByteCounter = $derived(nameBytes > DISPLAY_NAME_MAX_BYTES * 0.7);

	const availabilityMessage = $derived.by(() => {
		if (loginIdIssue) return fieldMessage(loginIdIssue, copy, apiMessages.login_id) ?? '';
		if (availability === 'checking') return c.loginIdChecking;
		if (availability === 'free') return c.loginIdAvailable;
		if (availability === 'taken') return c.loginIdTaken;
		return '';
	});

	const availabilityTone = $derived(
		loginIdIssue || availability === 'taken' ? 'error' : availability === 'free' ? 'ok' : 'busy'
	);

	// --- submit --------------------------------------------------------------

	function validateAll(): boolean {
		apiMessages = {};
		loginIdIssue = validateLoginID(loginId);
		displayNameIssue = validateDisplayName(displayName);
		passwordIssue = validatePassword(password);
		emailIssue = email.trim() === '' ? null : validateEmail(email);
		return !loginIdIssue && !displayNameIssue && !passwordIssue && !emailIssue;
	}

	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		if (!validateAll()) return;
		if (email.trim() === '') {
			// §5.1: no email means the warning is answered before anything is
			// created, not acknowledged in passing by a checkbox.
			warningOpen = true;
			return;
		}
		void submit(false);
	}

	async function submit(noEmailAck: boolean) {
		busy = true;
		formError = '';
		try {
			const res = await api.register({
				loginId: normaliseLoginID(loginId),
				password,
				displayName: nameNormalised,
				email: noEmailAck ? '' : email.trim(),
				noEmailAck
			});
			warningOpen = false;
			session.adopt(res.account);
			created = res.account;
		} catch (err) {
			warningOpen = false;
			formError = errorMessage(err, copy);
			if (err instanceof ApiError) {
				apiMessages = err.fieldMessages();
				loginIdIssue = err.issueFor('login_id') ?? loginIdIssue;
				displayNameIssue = err.issueFor('display_name') ?? displayNameIssue;
				passwordIssue = err.issueFor('password') ?? passwordIssue;
				emailIssue = err.issueFor('email') ?? emailIssue;
				if (err.code === 'LOGIN_ID_TAKEN') availability = 'taken';
			}
		} finally {
			busy = false;
		}
	}

	function linkEmailInstead() {
		warningOpen = false;
		emailInput?.focus();
		emailInput?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	{#if created}
		<div class="panel done">
			<h2 class="card__title">{c.success.title}</h2>
			<p class="card__body">{c.success.body}</p>
			<p class="done__name">{taggedName(created.display_name, created.player_tag)}</p>

			{#if !created.recoverable}
				<Alert tone="danger" title={copy.account.recovery.unsafeHeading}>
					<p>{copy.account.recovery.unsafeBody}</p>
				</Alert>
			{/if}

			<div class="done__actions">
				<a class="btn btn--primary" href={resolve('/account')}>{c.success.linkEmail}</a>
				<a class="btn btn--ghost" href={resolve('/leaderboard')}>{copy.common.nav.leaderboard}</a>
			</div>
		</div>
	{:else}
		<div class="grid">
			<form class="panel form" onsubmit={onSubmit} novalidate>
				<p class="form__intro">{c.intro}</p>

				{#if formError}
					<Alert tone="danger" assertive>
						<p>{formError}</p>
					</Alert>
				{/if}

				<Field
					id="login-id"
					label={c.loginIdLabel}
					bind:value={loginId}
					hint={c.loginIdHint}
					maxlength={LOGIN_ID_MAX}
					autocomplete="username"
					message={availabilityMessage}
					tone={availabilityTone}
					oninput={scheduleAvailabilityCheck}
				/>
				<p class="note">{c.loginIdPrivacyNote}</p>

				<Field
					id="display-name"
					label={c.displayNameLabel}
					bind:value={displayName}
					hint={c.displayNameHint}
					counter={fill(c.displayNameCounter, { n: nameGraphemes, max: DISPLAY_NAME_MAX })}
					autocomplete="nickname"
					message={fieldMessage(displayNameIssue, copy, apiMessages.display_name) ?? ''}
					onblur={() => (displayNameIssue = validateDisplayName(displayName))}
				/>
				<p class="note">
					{c.displayNameThaiNote}
					{#if showByteCounter}
						<span class="note__bytes"
							>· {fill(c.displayNameBytes, {
								n: nameBytes,
								max: DISPLAY_NAME_MAX_BYTES
							})}</span
						>
					{/if}
				</p>

				<Field
					id="password"
					label={c.passwordLabel}
					type="password"
					bind:value={password}
					hint={c.passwordHint}
					autocomplete="new-password"
					message={fieldMessage(passwordIssue, copy, apiMessages.password) ?? ''}
					onblur={() => (passwordIssue = validatePassword(password))}
				/>

				<div bind:this={emailInput} tabindex="-1" class="email-anchor">
					<Field
						id="email"
						label={c.emailLabel}
						type="email"
						bind:value={email}
						optionalLabel={c.emailOptional}
						hint={c.emailHint}
						autocomplete="email"
						message={fieldMessage(emailIssue, copy, apiMessages.email) ?? ''}
						onblur={() => (emailIssue = email.trim() === '' ? null : validateEmail(email))}
					/>
				</div>

				<button class="btn btn--primary btn--block" type="submit" disabled={busy}>
					{busy ? copy.common.state.saving : c.submit}
				</button>

				<p class="form__foot">
					{c.haveAccount}
					<a href={resolve('/login')}>{c.signIn}</a>
				</p>
			</form>

			<aside class="panel aside">
				<h2 class="card__title">{copy.register.warning.heading}</h2>
				<ul class="aside__list">
					{#each copy.register.warning.lines as line, i (i)}
						<li>{line}</li>
					{/each}
				</ul>
				<p class="muted">{copy.register.warning.reminder}</p>
			</aside>
		</div>
	{/if}
</AppShell>

<NoEmailWarning
	{copy}
	open={warningOpen}
	{busy}
	onLinkEmail={linkEmailInstead}
	onAcknowledge={() => void submit(true)}
	onCancel={() => (warningOpen = false)}
/>

<style>
	.grid {
		display: grid;
		gap: 1.5rem;
		align-items: start;
	}

	.form,
	.aside,
	.done {
		padding: clamp(1.5rem, 5vw, 2.5rem);
	}

	.form__intro {
		margin-block-end: 1.75rem;
		color: var(--text-dim);
	}

	.note {
		margin-block: -0.75rem 1.5rem;
		color: var(--text-faint);
		font-size: 0.8125rem;
		line-height: 1.6;
	}

	.note__bytes {
		font-variant-numeric: tabular-nums;
	}

	.email-anchor {
		outline: none;
	}

	.form__foot {
		margin-block-start: 1.25rem;
		color: var(--text-faint);
		font-size: 0.9375rem;
	}

	.aside {
		border-color: var(--danger);
		box-shadow: 10px 10px 0 rgb(224 74 58 / 15%);
	}

	.aside__list {
		margin: 1rem 0 1.25rem;
		padding-inline-start: 1.1rem;
		display: grid;
		gap: 0.6rem;
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.aside__list li::marker {
		color: var(--danger);
	}

	.done__name {
		margin-block: 1rem 1.5rem;
		font-size: clamp(1.5rem, 1rem + 3vw, 2.25rem);
		font-weight: 800;
	}

	.done__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-block-start: 1.75rem;
	}

	@media (min-width: 60rem) {
		.grid {
			grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
			gap: 2rem;
		}
	}
</style>
