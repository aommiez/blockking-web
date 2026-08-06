<script lang="ts">
	/**
	 * The account page: who you are, and the four things you can change.
	 *
	 * The order is not arbitrary. Recovery comes first and is loud, because an
	 * account with no verified email is one forgotten password away from being
	 * gone and there is no support route back (ACCOUNTS.md §5.5). Everything
	 * else on this page is reversible; that one is not.
	 *
	 * Two API shapes leak into the UI here and are shown honestly rather than
	 * papered over:
	 *   - the session list carries no address and no device — deliberately, so
	 *     that whoever steals a session is not also handed the owner's address;
	 *   - there is no route to revoke a *single* session, only "everywhere". The
	 *     page says so instead of offering a button that would do the wrong
	 *     thing.
	 */
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { ApiError } from '$lib/api/client';
	import * as api from '$lib/api/endpoints';
	import { errorMessage, fieldMessage, isUnauthenticated } from '$lib/api/messages';
	import { session } from '$lib/api/session.svelte';
	import type { SessionRow } from '$lib/api/types';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import Field from '$lib/components/Field.svelte';
	import { appCopy } from '$lib/content/app';
	import { fill, formatDateTime } from '$lib/format';
	import { locale } from '$lib/i18n/locale.svelte';
	import {
		DISPLAY_NAME_MAX,
		DISPLAY_NAME_MAX_BYTES,
		countBytes,
		countGraphemes,
		normaliseDisplayName,
		validateDisplayName,
		validateEmail,
		validatePassword
	} from '$lib/validate';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.account);

	const account = $derived(session.account);
	const me = $derived(session.me);

	let sessions = $state<SessionRow[]>([]);
	let sessionsError = $state('');

	onMount(async () => {
		await session.load(true);
		if (session.status === 'in') await loadSessions();
	});

	async function loadSessions() {
		try {
			const res = await api.listSessions();
			sessions = res.data;
			sessionsError = '';
		} catch (err) {
			sessions = [];
			sessionsError = errorMessage(err, copy);
		}
	}

	/** A 401 from anywhere means the session died; show the signed-out state. */
	function handle(err: unknown): string {
		if (isUnauthenticated(err)) session.clear();
		return errorMessage(err, copy);
	}

	// --- display name --------------------------------------------------------

	let nameDraft = $state('');
	let nameIssue = $state<string | null>(null);
	let nameBusy = $state(false);
	let nameError = $state('');
	let nameDone = $state('');

	// Seed the field once the account arrives, and only while it is untouched.
	let nameSeeded = false;
	$effect(() => {
		if (!nameSeeded && account) {
			nameDraft = account.display_name;
			nameSeeded = true;
		}
	});

	const nameNormalised = $derived(normaliseDisplayName(nameDraft));
	const nameGraphemes = $derived(countGraphemes(nameNormalised));
	const nameBytes = $derived(countBytes(nameNormalised));

	const nameAllowance = $derived.by(() => {
		if (!account) return '';
		if (account.display_name_change_count === 0) return c.name.firstFree;
		if (!account.email_verified) return c.name.secondNeedsEmail;
		return c.name.cooldown;
	});

	async function submitName(event: SubmitEvent) {
		event.preventDefault();
		nameError = '';
		nameDone = '';
		nameIssue = validateDisplayName(nameDraft);
		if (nameIssue) return;
		nameBusy = true;
		try {
			const res = await api.setDisplayName(nameNormalised);
			if (res.account) session.adopt(res.account);
			nameDone = c.name.done;
		} catch (err) {
			nameError = handle(err);
			if (err instanceof ApiError) nameIssue = err.issueFor('display_name') ?? nameIssue;
		} finally {
			nameBusy = false;
		}
	}

	// --- email ---------------------------------------------------------------

	let emailDraft = $state('');
	let emailPassword = $state('');
	let emailIssue = $state<string | null>(null);
	let emailBusy = $state(false);
	let emailError = $state('');
	let emailDone = $state('');

	async function submitEmail(event: SubmitEvent) {
		event.preventDefault();
		emailError = '';
		emailDone = '';
		emailIssue = validateEmail(emailDraft);
		if (emailIssue) return;
		if (emailPassword === '') {
			emailError = fieldMessage('required', copy) ?? '';
			return;
		}
		emailBusy = true;
		try {
			await api.linkEmail(emailDraft.trim(), emailPassword);
			// 202 whatever happened, including an address already verified on
			// another account — which gets a notice sent to its real owner
			// instead. One confirmation covers all of it, by design (§4.4).
			emailDone = c.email.sent;
			emailPassword = '';
			await session.load(true);
		} catch (err) {
			emailError = handle(err);
			if (err instanceof ApiError) emailIssue = err.issueFor('email') ?? emailIssue;
		} finally {
			emailBusy = false;
		}
	}

	let resendBusy = $state(false);
	let resendDone = $state('');

	async function resend() {
		resendBusy = true;
		resendDone = '';
		try {
			await api.resendVerification();
			resendDone = c.recovery.resent;
		} catch (err) {
			resendDone = handle(err);
		} finally {
			resendBusy = false;
		}
	}

	// --- password ------------------------------------------------------------

	let pwCurrent = $state('');
	let pwNext = $state('');
	let pwConfirm = $state('');
	let pwIssue = $state<string | null>(null);
	// The API's own wording for `new_password`, for the rules that live only in
	// `meta` — the blocklist and "not built out of your own name" — which this
	// build would otherwise render as a flat "invalid".
	let pwApiMessages = $state<Record<string, string>>({});
	let pwMismatch = $state(false);
	let pwBusy = $state(false);
	let pwError = $state('');
	let pwDone = $state('');

	async function submitPassword(event: SubmitEvent) {
		event.preventDefault();
		pwError = '';
		pwDone = '';
		pwApiMessages = {};
		pwIssue = validatePassword(pwNext);
		pwMismatch = pwNext !== pwConfirm;
		if (pwIssue || pwMismatch || pwCurrent === '') {
			if (pwCurrent === '') pwError = fieldMessage('required', copy) ?? '';
			return;
		}
		pwBusy = true;
		try {
			await api.changePassword(pwCurrent, pwNext);
			// The API revokes every session, this one included. Say so and stop
			// pretending to be signed in.
			pwDone = c.password.done;
			session.clear();
			sessions = [];
		} catch (err) {
			pwError = handle(err);
			if (err instanceof ApiError) {
				pwApiMessages = err.fieldMessages();
				pwIssue = err.issueFor('new_password') ?? pwIssue;
			}
		} finally {
			pwCurrent = '';
			pwNext = '';
			pwConfirm = '';
			pwBusy = false;
		}
	}

	// --- sessions ------------------------------------------------------------

	let allPassword = $state('');
	let allBusy = $state(false);
	let allError = $state('');
	let allDone = $state('');

	async function signOutEverywhere(event: SubmitEvent) {
		event.preventDefault();
		allError = '';
		allDone = '';
		if (allPassword === '') {
			allError = fieldMessage('required', copy) ?? '';
			return;
		}
		allBusy = true;
		try {
			const res = await api.logoutEverywhere(allPassword);
			allDone = fill(c.sessions.done, { n: res.sessions_revoked ?? 0 });
			await loadSessions();
		} catch (err) {
			allError = handle(err);
		} finally {
			allPassword = '';
			allBusy = false;
		}
	}

	let signOutBusy = $state(false);

	async function signOut() {
		signOutBusy = true;
		try {
			await api.logout();
		} catch {
			// Either way this browser is done with the session.
		} finally {
			session.clear();
			signOutBusy = false;
			await goto(resolve('/'));
		}
	}
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	{#if !session.settled}
		<p class="muted">{copy.common.state.loading}</p>
	{:else if session.status === 'out' || !account || !me}
		<Alert tone="info">
			<p>
				{session.unreachable ? copy.common.state.unreachable : copy.common.state.requiresSignIn}
			</p>
		</Alert>
		<p class="gap">
			<a class="btn btn--primary" href={resolve('/login')}>{copy.common.nav.login}</a>
		</p>
	{:else}
		<!-- identity ------------------------------------------------------- -->
		<div class="panel identity">
			<div class="identity__main">
				<p class="identity__name">
					{account.display_name}<span class="tag"
						>#{String(account.player_tag).padStart(4, '0')}</span
					>
				</p>
				<p class="muted">{c.tagExplain}</p>
			</div>
			<dl class="identity__meta">
				<div>
					<dt>{c.memberSince}</dt>
					<dd>{formatDateTime(account.created_at, locale.current)}</dd>
				</div>
				<div>
					<dt>{c.lastLogin}</dt>
					<dd>
						{account.last_login_at
							? formatDateTime(account.last_login_at, locale.current)
							: c.never}
					</dd>
				</div>
			</dl>
			<div class="identity__actions">
				<a class="btn btn--ghost btn--sm" href={resolve('/players') + `?id=${account.account_id}`}>
					{c.publicProfile}
				</a>
				<button
					class="btn btn--ghost btn--sm"
					type="button"
					disabled={signOutBusy}
					onclick={signOut}
				>
					{copy.common.actions.signOut}
				</button>
			</div>
		</div>

		<!-- recovery ------------------------------------------------------- -->
		{#if account.recoverable}
			<Alert tone="ok" title={c.recovery.safeHeading}>
				<p>{c.recovery.safeBody}</p>
				{#if me.email}<p class="muted">{me.email.address} · {c.email.verifiedAs}</p>{/if}
			</Alert>
		{:else if me.email && !me.email.verified}
			<Alert tone="warn" title={c.recovery.pendingHeading}>
				<p>{c.recovery.pendingBody}</p>
				<p class="muted">{me.email.address} · {c.email.pendingAs}</p>
				<p class="gap">
					<button
						class="btn btn--ghost btn--sm"
						type="button"
						disabled={resendBusy}
						onclick={resend}
					>
						{c.recovery.resend}
					</button>
				</p>
				{#if resendDone}<p class="muted">{resendDone}</p>{/if}
			</Alert>
		{:else}
			<Alert tone="danger" title={c.recovery.unsafeHeading}>
				<p>{c.recovery.unsafeBody}</p>
			</Alert>
		{/if}

		<div class="cards">
			<!-- display name ------------------------------------------------ -->
			<section class="card">
				<h2 class="card__title">{c.name.heading}</h2>
				<p class="card__body">{c.name.body}</p>
				<ul class="rules">
					{#each c.name.rules as rule, i (i)}<li>{rule}</li>{/each}
				</ul>

				<form onsubmit={submitName} novalidate>
					{#if nameError}<Alert tone="danger" assertive><p>{nameError}</p></Alert>{/if}
					{#if nameDone}<Alert tone="ok"><p>{nameDone}</p></Alert>{/if}

					<Field
						id="display-name"
						label={c.name.label}
						bind:value={nameDraft}
						counter={fill(copy.register.displayNameCounter, {
							n: nameGraphemes,
							max: DISPLAY_NAME_MAX
						})}
						message={fieldMessage(nameIssue, copy) ?? ''}
						onblur={() => (nameIssue = validateDisplayName(nameDraft))}
					/>
					<p class="muted meta-line">
						{fill(c.name.changesUsed, { n: account.display_name_change_count })} · {nameAllowance}
						{#if nameBytes > DISPLAY_NAME_MAX_BYTES * 0.7}
							· {fill(copy.register.displayNameBytes, {
								n: nameBytes,
								max: DISPLAY_NAME_MAX_BYTES
							})}
						{/if}
					</p>
					<button class="btn btn--primary btn--sm" type="submit" disabled={nameBusy}>
						{nameBusy ? copy.common.state.saving : c.name.submit}
					</button>
				</form>
			</section>

			<!-- email -------------------------------------------------------- -->
			<section class="card">
				<h2 class="card__title">{c.email.heading}</h2>
				<p class="card__body">{account.recoverable ? c.email.bodyLinked : c.email.bodyUnlinked}</p>

				{#if me.email}
					<p class="email-line">
						<span>{me.email.address}</span>
						<span
							class="chip"
							class:chip--ok={me.email.verified}
							class:chip--warn={!me.email.verified}
						>
							{me.email.verified ? c.email.verifiedAs : c.email.pendingAs}
						</span>
					</p>
				{/if}

				<!--
					The form is only for an account that has no verified address. §5.4's
					"change my email" flow needs an endpoint this API does not have yet,
					and re-using the link endpoint would start a second link rather than
					replace the first — so the page says what is true instead.
				-->
				{#if me.email?.verified}
					<p class="muted meta-line">{c.email.changeNotAvailable}</p>
				{:else}
					<form onsubmit={submitEmail} novalidate>
						{#if emailError}<Alert tone="danger" assertive><p>{emailError}</p></Alert>{/if}
						{#if emailDone}<Alert tone="ok"><p>{emailDone}</p></Alert>{/if}

						<Field
							id="link-email"
							label={c.email.label}
							type="email"
							bind:value={emailDraft}
							autocomplete="email"
							message={fieldMessage(emailIssue, copy) ?? ''}
						/>
						<Field
							id="link-email-password"
							label={c.email.passwordLabel}
							type="password"
							bind:value={emailPassword}
							autocomplete="current-password"
							hint={c.email.passwordWhy}
						/>
						<button class="btn btn--primary btn--sm" type="submit" disabled={emailBusy}>
							{emailBusy ? copy.common.state.saving : c.email.submit}
						</button>
					</form>
				{/if}
			</section>

			<!-- password ----------------------------------------------------- -->
			<section class="card">
				<h2 class="card__title">{c.password.heading}</h2>
				<p class="card__body">{c.password.body}</p>

				<form onsubmit={submitPassword} novalidate>
					{#if pwError}<Alert tone="danger" assertive><p>{pwError}</p></Alert>{/if}
					{#if pwDone}<Alert tone="ok"><p>{pwDone}</p></Alert>{/if}

					<Field
						id="current-password"
						label={c.password.currentLabel}
						type="password"
						bind:value={pwCurrent}
						autocomplete="current-password"
					/>
					<Field
						id="next-password"
						label={c.password.newLabel}
						type="password"
						bind:value={pwNext}
						autocomplete="new-password"
						hint={copy.register.passwordHint}
						message={fieldMessage(pwIssue, copy, pwApiMessages.new_password) ?? ''}
					/>
					<Field
						id="confirm-password"
						label={c.password.confirmLabel}
						type="password"
						bind:value={pwConfirm}
						autocomplete="new-password"
						message={pwMismatch ? c.password.mismatch : ''}
					/>
					<button class="btn btn--primary btn--sm" type="submit" disabled={pwBusy}>
						{pwBusy ? copy.common.state.saving : c.password.submit}
					</button>
				</form>
			</section>

			<!-- sessions ----------------------------------------------------- -->
			<section class="card">
				<h2 class="card__title">{c.sessions.heading}</h2>
				<p class="card__body">{c.sessions.body}</p>

				{#if sessionsError}
					<Alert tone="danger"><p>{sessionsError}</p></Alert>
				{:else if sessions.length === 0}
					<p class="muted">{copy.common.state.nothingHere}</p>
				{:else}
					<ul class="sessions">
						{#each sessions as row (row.id)}
							<li class="sessions__row">
								<span class="chip" class:chip--ok={row.current}>
									{row.kind === 'client' ? c.sessions.kindClient : c.sessions.kindWeb}
									{#if row.current}· {c.sessions.current}{/if}
								</span>
								<span class="muted">
									{c.sessions.issued}
									{formatDateTime(row.issued_at, locale.current)} · {c.sessions.expires}
									{formatDateTime(row.expires_at, locale.current)}
								</span>
							</li>
						{/each}
					</ul>
				{/if}

				<p class="muted meta-line">{c.sessions.privacyNote}</p>
				<p class="muted meta-line">{c.sessions.noPerSessionNote}</p>

				<form class="danger-zone" onsubmit={signOutEverywhere} novalidate>
					<h3 class="danger-zone__title">{c.sessions.signOutAll}</h3>
					<p class="card__body">{c.sessions.signOutAllBody}</p>

					{#if allError}<Alert tone="danger" assertive><p>{allError}</p></Alert>{/if}
					{#if allDone}<Alert tone="ok"><p>{allDone}</p></Alert>{/if}

					<Field
						id="logout-all-password"
						label={c.sessions.passwordLabel}
						type="password"
						bind:value={allPassword}
						autocomplete="current-password"
						hint={c.sessions.passwordWhy}
					/>
					<button class="btn btn--danger btn--sm" type="submit" disabled={allBusy}>
						{allBusy ? copy.common.state.saving : c.sessions.signOutAll}
					</button>
				</form>
			</section>
		</div>
	{/if}
</AppShell>

<style>
	.identity {
		display: grid;
		gap: 1.25rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		margin-block-end: 1.25rem;
		border-color: var(--line-hi);
	}

	.identity__name {
		font-size: clamp(1.5rem, 1rem + 3vw, 2.25rem);
		font-weight: 800;
		line-height: 1.3;
	}

	.identity__meta {
		display: grid;
		gap: 0.75rem 2rem;
		margin: 0;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
	}

	.identity__meta dt {
		color: var(--text-faint);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.identity__meta dd {
		margin: 0.2rem 0 0;
		font-size: 0.9375rem;
	}

	.identity__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.cards {
		display: grid;
		gap: 1.25rem;
		margin-block-start: 1.25rem;
	}

	.cards .card + .card {
		margin-block-start: 0;
	}

	.rules {
		margin: 1rem 0 1.5rem;
		padding-inline-start: 1.1rem;
		display: grid;
		gap: 0.4rem;
		color: var(--text-dim);
		font-size: 0.875rem;
		line-height: 1.55;
	}

	.email-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		margin-block: 1rem;
		font-size: 0.9375rem;
		word-break: break-all;
	}

	.sessions {
		margin: 1rem 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.75rem;
	}

	.sessions__row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.9rem;
		padding-block-end: 0.75rem;
		border-bottom: 1px solid var(--line);
	}

	.meta-line {
		margin-block: 0.75rem 1.25rem;
	}

	.danger-zone {
		margin-block-start: 1.75rem;
		padding-block-start: 1.5rem;
		border-top: 2px solid var(--line);
	}

	.danger-zone__title {
		margin: 0 0 0.5rem;
		color: var(--danger);
		font-size: 1.05rem;
		font-weight: 800;
	}

	.gap {
		margin-block-start: 1rem;
	}

	@media (min-width: 62rem) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
