<script lang="ts">
	/**
	 * The two boards.
	 *
	 * The thing this page exists to prevent is a player reading `career 8,925`
	 * on one tab and `live 232` on the other and concluding the site is broken.
	 * Three decisions follow from that:
	 *
	 *   1. **both numbers are on every row of both boards.** The API sends them
	 *      that way on purpose; showing one without the other is what makes a
	 *      leaderboard look wrong.
	 *   2. **the explanation ships with the data.** `explain.career` and
	 *      `explain.live` are Thai sentences written next to the query that
	 *      produces the numbers, so the page has one source for the wording
	 *      rather than a copy that drifts. In English the local table is used,
	 *      because the API's copy is Thai only.
	 *   3. **the freshness is stated.** The board is cached (`stale_after_s`,
	 *      30 s today) and `generated_at` says when it was computed, not when it
	 *      was served. A page that does not say so produces "my score is wrong"
	 *      reports from a player who just scored.
	 *
	 * Nothing here is a login id, an address or an email — the endpoint is
	 * public and returns none of them. Guest rows arrive with `player_tag: 0`
	 * and are labelled as guests rather than rendered as `#0000`.
	 */
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as api from '$lib/api/endpoints';
	import { errorMessage } from '$lib/api/messages';
	import type { Board, LeaderboardResponse } from '$lib/api/types';
	import Alert from '$lib/components/Alert.svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { appCopy } from '$lib/content/app';
	import {
		fill,
		formatDuration,
		formatNumber,
		formatRatio,
		formatRelative,
		formatTime,
		kdRatio
	} from '$lib/format';
	import { locale } from '$lib/i18n/locale.svelte';

	const copy = $derived(appCopy(locale.current));
	const c = $derived(copy.leaderboard);

	/** House rule for every list page: 20/50/100, default 50, state in the URL. */
	const PAGE_SIZES = [20, 50, 100];

	const board = $derived<Board>(page.url.searchParams.get('board') === 'live' ? 'live' : 'career');
	const limit = $derived.by(() => {
		const raw = Number(page.url.searchParams.get('limit'));
		return PAGE_SIZES.includes(raw) ? raw : 50;
	});
	const offset = $derived.by(() => {
		const raw = Number(page.url.searchParams.get('offset'));
		return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
	});

	let data = $state<LeaderboardResponse | null>(null);
	let loading = $state(true);
	let failure = $state('');

	// One request in flight; a fast click on "next" aborts the previous page
	// rather than racing it onto the screen.
	let controller: AbortController | null = null;

	$effect(() => {
		const query = { board, limit, offset };
		controller?.abort();
		const own = new AbortController();
		controller = own;
		loading = true;
		api
			.leaderboard(query.board, query.limit, query.offset, own.signal)
			.then((res) => {
				if (own.signal.aborted) return;
				data = res;
				failure = '';
			})
			.catch((err) => {
				if (own.signal.aborted) return;
				failure = errorMessage(err, copy);
			})
			.finally(() => {
				if (!own.signal.aborted) loading = false;
			});
	});

	/**
	 * Board, page size and offset live in the URL, so a link to page four of the
	 * live board is a link to page four of the live board. `replaceState` keeps
	 * paging out of the back button's history, and `keepFocus` leaves the
	 * keyboard where it was on the control that was just used.
	 *
	 * The query string is built by hand rather than with `URLSearchParams`
	 * because these are the only three parameters this page has, all of them
	 * numbers or one of two literals, and `resolve()` wants the whole path.
	 */
	function navigate(next: { board?: Board; limit?: number; offset?: number }) {
		const query = [
			`board=${next.board ?? board}`,
			`limit=${next.limit ?? limit}`,
			`offset=${next.offset ?? 0}`
		].join('&');
		void goto(resolve(`/leaderboard?${query}`), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	const total = $derived(data?.total ?? 0);
	const from = $derived(total === 0 ? 0 : offset + 1);
	const to = $derived(Math.min(offset + limit, total));
	const hasPrev = $derived(offset > 0);
	const hasNext = $derived(offset + limit < total);

	/** In Thai the API's own wording; in English the local table. */
	const explainCareer = $derived(
		locale.current === 'th' ? (data?.explain.career ?? '') : c.tabs.career
	);
	const explainLive = $derived(locale.current === 'th' ? (data?.explain.live ?? '') : c.tabs.live);
</script>

<svelte:head>
	<title>{c.title} — BlockKing</title>
</svelte:head>

<AppShell {copy} eyebrow={c.eyebrow} title={c.title}>
	<p class="intro">{c.intro}</p>

	<!-- why the two boards disagree ------------------------------------- -->
	<section class="panel explain">
		<h2 class="explain__title">{c.whyDifferentHeading}</h2>
		<p class="explain__body">{c.whyDifferentBody}</p>
		<dl class="explain__pair">
			<div>
				<dt>{c.columns.career}</dt>
				<dd>{explainCareer}</dd>
			</div>
			<div>
				<dt>{c.columns.live}</dt>
				<dd>{explainLive}</dd>
			</div>
		</dl>
		<p class="explain__example">{c.example}</p>
	</section>

	<!-- controls --------------------------------------------------------- -->
	<div class="toolbar">
		<div class="tabs" role="tablist" aria-label={c.title}>
			<button
				class="tab"
				class:tab--on={board === 'career'}
				role="tab"
				type="button"
				aria-selected={board === 'career'}
				onclick={() => navigate({ board: 'career' })}
			>
				{c.tabs.career}
			</button>
			<button
				class="tab"
				class:tab--on={board === 'live'}
				role="tab"
				type="button"
				aria-selected={board === 'live'}
				onclick={() => navigate({ board: 'live' })}
			>
				{c.tabs.live}
			</button>
		</div>

		<label class="perpage">
			<span class="visually-hidden">{c.perPage}</span>
			<select
				class="input perpage__select"
				value={limit}
				onchange={(e) => navigate({ limit: Number(e.currentTarget.value) })}
			>
				{#each PAGE_SIZES as size (size)}
					<option value={size}>{size} {c.perPage}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- freshness -------------------------------------------------------- -->
	{#if data}
		<p class="fresh">
			<strong>{fill(c.freshness, { time: formatTime(data.generated_at, locale.current) })}</strong>
			<span>{fill(c.freshnessNote, { n: data.stale_after_s })}</span>
		</p>
	{/if}

	{#if failure}
		<Alert tone="danger"><p>{failure}</p></Alert>
	{:else if loading && !data}
		<p class="muted">{copy.common.state.loading}</p>
	{:else if data && data.data.length === 0}
		<Alert tone="info"><p>{c.empty}</p></Alert>
	{:else if data}
		<div class="table-wrap" class:table-wrap--stale={loading}>
			<table class="table">
				<thead>
					<tr>
						<th class="num">{c.columns.rank}</th>
						<th>{c.columns.player}</th>
						<th class="num">{c.columns.career}</th>
						<th class="num">{c.columns.live}</th>
						<th class="num col-extra">{c.columns.dropped}</th>
						<th class="num col-extra">{c.columns.kd}</th>
						<th class="num col-extra">{c.columns.streak}</th>
						<th class="num col-extra">{c.columns.playtime}</th>
						<th class="col-extra">{c.columns.lastSeen}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.data as row (`${row.rank}-${row.display_name}-${row.player_tag}`)}
						<tr>
							<td class="num rank">{row.rank}</td>
							<td class="player">
								<span class="player__name">{row.display_name}</span>
								{#if row.player_tag > 0}
									<span class="tag">#{String(row.player_tag).padStart(4, '0')}</span>
								{:else}
									<span class="chip">{copy.common.guestBadge}</span>
								{/if}
								<!--
									On a phone the columns to the right of the two scores are
									folded into this line instead of scrolling off the edge.
									Hidden from assistive technology on every screen: the same
									facts are already in their own cells, under their own
									headers, which is the better reading of them.
								-->
								<span class="row-meta" aria-hidden="true">
									{c.columns.kd}
									{formatRatio(kdRatio(row.kills, row.deaths), locale.current)} · {c.columns.streak}
									{row.best_streak} · {formatDuration(row.playtime_seconds, locale.current)}
								</span>
							</td>
							<td class="num" class:num--lead={board === 'career'}>
								{formatNumber(row.score_career, locale.current)}
							</td>
							<td class="num" class:num--lead={board === 'live'}>
								{formatNumber(row.score_live, locale.current)}
							</td>
							<td class="num dropped col-extra">
								{row.score_dropped > 0 ? '−' : ''}{formatNumber(row.score_dropped, locale.current)}
							</td>
							<td class="num col-extra">
								{formatRatio(kdRatio(row.kills, row.deaths), locale.current)}
								<span class="kd">{row.kills}/{row.deaths}</span>
							</td>
							<td class="num col-extra">{row.best_streak}</td>
							<td class="num col-extra">{formatDuration(row.playtime_seconds, locale.current)}</td>
							<td class="col-extra">{formatRelative(row.last_seen_at, locale.current)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="pager">
			<span class="muted">{fill(c.rangeLabel, { from, to, total })}</span>
			<div class="pager__buttons">
				<button
					class="btn btn--ghost btn--sm"
					type="button"
					disabled={!hasPrev}
					onclick={() => navigate({ offset: Math.max(0, offset - limit) })}
				>
					{c.prev}
				</button>
				<button
					class="btn btn--ghost btn--sm"
					type="button"
					disabled={!hasNext}
					onclick={() => navigate({ offset: offset + limit })}
				>
					{c.next}
				</button>
			</div>
		</div>

		<p class="muted privacy">{c.privacyNote}</p>
	{/if}
</AppShell>

<style>
	.intro {
		margin-block-end: 1.5rem;
		color: var(--text-dim);
	}

	.explain {
		padding: clamp(1.25rem, 4vw, 2rem);
		border-color: var(--line-hi);
		border-inline-start: 8px solid var(--ember);
	}

	.explain__title {
		font-size: 1.15rem;
		font-weight: 800;
	}

	.explain__body {
		margin-block-start: 0.75rem;
		color: var(--text-dim);
		font-size: 0.9375rem;
	}

	.explain__pair {
		display: grid;
		gap: 1rem;
		margin: 1.25rem 0 0;
	}

	.explain__pair dt {
		color: var(--ember);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.explain__pair dd {
		margin: 0.3rem 0 0;
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.explain__example {
		margin-block-start: 1.25rem;
		padding-block-start: 1rem;
		border-top: 1px solid var(--line);
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
		margin-block: 2rem 1rem;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		border: 2px solid var(--line-hi);
	}

	.tab {
		padding: 0.6rem 1rem;
		background: transparent;
		border: 0;
		color: var(--text-dim);
		font: inherit;
		font-size: 0.9375rem;
		font-weight: 700;
		cursor: pointer;
	}

	.tab + .tab {
		border-inline-start: 2px solid var(--line-hi);
	}

	.tab--on {
		background: var(--ember);
		color: #14100b;
	}

	.perpage {
		margin-inline-start: auto;
	}

	.perpage__select {
		width: auto;
		padding: 0.55rem 0.7rem;
		font-size: 0.875rem;
	}

	.fresh {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.75rem;
		margin-block-end: 1rem;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.fresh strong {
		color: var(--text-dim);
	}

	.table-wrap--stale {
		opacity: 0.55;
	}

	.rank {
		color: var(--text-faint);
		font-weight: 800;
	}

	.player {
		white-space: normal;
		min-width: 12rem;
	}

	.player__name {
		font-weight: 700;
		/* Thai names stack marks; give the line room so nothing is clipped. */
		line-height: 1.6;
	}

	.num--lead {
		color: var(--ember);
		font-weight: 800;
	}

	.dropped {
		color: var(--text-faint);
	}

	.kd {
		display: block;
		color: var(--text-faint);
		font-size: 0.75rem;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		align-items: center;
		justify-content: space-between;
		margin-block-start: 1.25rem;
	}

	.pager__buttons {
		display: flex;
		gap: 0.6rem;
	}

	.privacy {
		margin-block-start: 1.5rem;
	}

	.row-meta {
		display: none;
	}

	/*
	 * Below 46rem the table keeps rank, player and the two scores — the two
	 * scores are the entire point of this page, so neither may scroll off the
	 * edge — and folds the rest under the name. There is no per-player page to
	 * move them to: leaderboard rows carry no account id, by design.
	 */
	@media (max-width: 45.99rem) {
		.col-extra {
			display: none;
		}

		.table {
			white-space: normal;
		}

		.row-meta {
			display: block;
			margin-block-start: 0.15rem;
			color: var(--text-faint);
			font-size: 0.75rem;
			font-variant-numeric: tabular-nums;
		}

		.player {
			min-width: 0;
		}
	}

	@media (min-width: 46rem) {
		.explain__pair {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1.5rem;
		}
	}
</style>
