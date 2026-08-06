<script lang="ts">
	/**
	 * One player's public page.
	 *
	 * The id is a query parameter rather than a path segment (`/players?id=…`)
	 * for a build reason, not a style one: this site is prerendered by
	 * `adapter-static`, which cannot emit pages for a route whose parameter is
	 * unknown at build time. A query parameter needs no SPA fallback and no
	 * change to the host's routing, so the page works on a plain static server.
	 *
	 * Public means public. The endpoint returns a display name, a tag and
	 * statistics — no login id, no email, no address — and this page shows
	 * exactly that.
	 *
	 * Note what does *not* link here: the leaderboard rows. They carry no
	 * `account_id` (the API omits it from list responses on purpose), so there
	 * is nothing to build a link from. Reaching a profile today means having the
	 * id already — from your own account page, or from a link somebody sent.
	 */
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as api from '$lib/api/endpoints';
	import { errorMessage } from '$lib/api/messages';
	import { ApiError } from '$lib/api/client';
	import type { PlayerProfileResponse } from '$lib/api/types';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { appCopy } from '$lib/content/app';
	import {
		fill,
		formatDateTime,
		formatDuration,
		formatNumber,
		formatRatio,
		formatRelative,
		formatTime
	} from '$lib/format';
	import { locale } from '$lib/i18n/locale.svelte';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.players);

	const id = $derived(page.url.searchParams.get('id') ?? '');

	let profile = $state<PlayerProfileResponse | null>(null);
	let loading = $state(false);
	let failure = $state('');
	let notFound = $state(false);

	let controller: AbortController | null = null;

	$effect(() => {
		const wanted = id;
		profile = null;
		notFound = false;
		failure = '';
		if (!/^\d+$/.test(wanted)) return;
		controller?.abort();
		const own = new AbortController();
		controller = own;
		loading = true;
		api
			.playerProfile(wanted, own.signal)
			.then((res) => {
				if (own.signal.aborted) return;
				profile = res;
			})
			.catch((err) => {
				if (own.signal.aborted) return;
				if (err instanceof ApiError && err.status === 404) notFound = true;
				else failure = errorMessage(err, copy);
			})
			.finally(() => {
				if (!own.signal.aborted) loading = false;
			});
	});

	const p = $derived(profile?.data ?? null);

	const stats = $derived.by(() => {
		if (!p) return [];
		const l = locale.current;
		return [
			{ label: c.stats.career, value: formatNumber(p.score_career, l), lead: true },
			{ label: c.stats.live, value: formatNumber(p.score_live, l), lead: true },
			{
				label: c.stats.dropped,
				value: `${p.score_dropped > 0 ? '−' : ''}${formatNumber(p.score_dropped, l)}`,
				lead: false
			},
			{ label: c.stats.kd, value: formatRatio(p.kd_ratio, l), lead: false },
			{ label: c.stats.kills, value: formatNumber(p.kills, l), lead: false },
			{ label: c.stats.deaths, value: formatNumber(p.deaths, l), lead: false },
			{ label: c.stats.bestStreak, value: formatNumber(p.best_streak, l), lead: false },
			{ label: c.stats.playtime, value: formatDuration(p.playtime_seconds, l), lead: false },
			{ label: c.stats.sessions, value: formatNumber(p.sessions_total, l), lead: false },
			{ label: c.stats.firstSeen, value: formatDateTime(p.first_seen_at, l), lead: false },
			{ label: c.stats.lastSeen, value: formatRelative(p.last_seen_at, l), lead: false }
		];
	});
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	{#if !id}
		<Alert tone="info"><p>{c.missingId}</p></Alert>
		<p class="gap">
			<a class="btn btn--ghost" href={resolve('/leaderboard')}>{copy.common.nav.leaderboard}</a>
		</p>
	{:else if notFound}
		<Alert tone="info"><p>{c.notFound}</p></Alert>
	{:else if failure}
		<Alert tone="danger"><p>{failure}</p></Alert>
	{:else if loading && !p}
		<p class="muted">{copy.common.state.loading}</p>
	{:else if p && profile}
		<div class="panel head">
			<p class="head__name">
				{p.display_name}{#if p.player_tag > 0}<span class="tag"
						>#{String(p.player_tag).padStart(4, '0')}</span
					>{/if}
			</p>
			{#if !p.registered}
				<span class="chip">{copy.common.guestBadge}</span>
			{/if}
			<p class="muted head__fresh">
				{fill(copy.leaderboard.freshness, {
					time: formatTime(profile.generated_at, locale.current)
				})}
			</p>
		</div>

		<div class="grid">
			{#each stats as stat (stat.label)}
				<div class="stat" class:stat--lead={stat.lead}>
					<p class="stat__label">{stat.label}</p>
					<p class="stat__value">{stat.value}</p>
				</div>
			{/each}
		</div>

		<section class="panel explain">
			<h2 class="explain__title">{copy.leaderboard.whyDifferentHeading}</h2>
			<p class="explain__body">{copy.leaderboard.whyDifferentBody}</p>
		</section>

		<p class="muted gap">{c.privacyNote}</p>
	{/if}
</AppShell>

<style>
	.head {
		padding: clamp(1.25rem, 4vw, 2rem);
		border-color: var(--line-hi);
	}

	.head__name {
		font-size: clamp(1.5rem, 1rem + 3vw, 2.25rem);
		font-weight: 800;
		line-height: 1.3;
	}

	.head__fresh {
		margin-block-start: 0.75rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
		gap: 1px;
		margin-block-start: 1.25rem;
		background: var(--line);
		border: 2px solid var(--line);
	}

	.stat {
		padding: 1rem 1.1rem;
		background: var(--surface);
	}

	.stat__label {
		color: var(--text-faint);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.stat__value {
		margin-block-start: 0.35rem;
		font-size: 1.25rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}

	.stat--lead .stat__value {
		color: var(--ember);
	}

	.explain {
		margin-block-start: 1.25rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		border-color: var(--line-hi);
		border-inline-start: 8px solid var(--ember);
	}

	.explain__title {
		font-size: 1.05rem;
		font-weight: 800;
	}

	.explain__body {
		margin-block-start: 0.6rem;
		color: var(--text-dim);
		font-size: 0.9375rem;
	}

	.gap {
		margin-block-start: 1.25rem;
	}
</style>
