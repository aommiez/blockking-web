<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();
</script>

<footer class="footer">
	<div class="shell footer__inner">
		<div>
			<p class="footer__brand">BLOCKKING</p>
			<p class="footer__tagline">{copy.footer.tagline}</p>
		</div>
		<div class="footer__meta">
			<p>{copy.footer.builtWith}</p>
			<p>{copy.footer.copyright}</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--line);
		background: var(--bg-alt);
		padding-block: 3rem;
	}

	.footer__inner {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem 2rem;
		justify-content: space-between;
	}

	.footer__brand {
		font-weight: 900;
		letter-spacing: 0.08em;
	}

	.footer__tagline {
		margin-block-start: 0.35rem;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.footer__meta {
		color: var(--text-faint);
		font-size: 0.8125rem;
		text-align: start;
	}

	@media (min-width: 40rem) {
		.footer__meta {
			text-align: end;
		}
	}
</style>
