<script lang="ts">
	/**
	 * The account call to action.
	 *
	 * This block used to hold a disabled email box with "coming soon" under it.
	 * Accounts are real now, so it points at the register and sign-in pages —
	 * and it carries ACCOUNTS.md §5.1's consequence in full sentences, on the
	 * landing page, before anybody starts typing. The blocking version of that
	 * warning still appears inside the registration flow; this is the version a
	 * reader meets first.
	 */
	import { resolve } from '$app/paths';
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();

	const signup = $derived(copy.signup);
</script>

<section class="section" id="signup">
	<div class="shell">
		<div class="panel box">
			<p class="section__eyebrow">{signup.eyebrow}</p>
			<h2 class="section__title">{signup.title}</h2>
			<p class="box__body">{signup.body}</p>

			<div class="box__actions">
				<a class="btn btn--primary" href={resolve('/register')}>{signup.primaryCta}</a>
				<a class="btn btn--ghost" href={resolve('/login')}>{signup.secondaryCta}</a>
				<a class="btn btn--ghost" href={resolve('/leaderboard')}>{signup.leaderboardCta}</a>
			</div>

			<p class="box__note">{signup.note}</p>
		</div>
	</div>
</section>

<style>
	.box {
		padding: clamp(1.75rem, 5vw, 3.25rem);
		border-color: var(--line-hi);
		box-shadow: 12px 12px 0 rgb(87 192 74 / 12%);
	}

	.box__body {
		margin-block-start: 1rem;
		max-width: 48ch;
		color: var(--text-dim);
	}

	.box__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-block-start: 2rem;
	}

	.box__note {
		display: flex;
		align-items: start;
		gap: 0.6rem;
		max-width: 62ch;
		margin-block-start: 1.75rem;
		color: var(--ember);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.65;
	}

	.box__note::before {
		content: '';
		flex: none;
		width: 0.6rem;
		height: 0.6rem;
		margin-block-start: 0.5rem;
		background: var(--ember);
	}
</style>
