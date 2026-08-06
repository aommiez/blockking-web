<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();
</script>

<section class="section" id="features">
	<div class="shell">
		<p class="section__eyebrow">{copy.features.eyebrow}</p>
		<h2 class="section__title">{copy.features.title}</h2>

		<ul class="grid">
			{#each copy.features.items as feature (feature.tag)}
				<li class="panel card">
					<p class="card__tag">{feature.tag}</p>
					<h3 class="card__title">{feature.title}</h3>
					<p class="card__body">{feature.body}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	/* Four features: one column on phones, a 2×2 block from tablet up. `auto-fit`
	   would give three across on a wide screen and leave a lone orphan card. */
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
		margin: clamp(2rem, 5vw, 3rem) 0 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 48rem) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.card {
		padding: clamp(1.5rem, 3vw, 2rem);
		transition:
			border-color 140ms ease,
			transform 140ms ease;
	}

	.card:hover {
		border-color: var(--line-hi);
		transform: translateY(-3px);
	}

	.card__tag {
		display: inline-block;
		margin-block-end: 1rem;
		padding: 0.25rem 0.6rem;
		background: rgb(87 192 74 / 12%);
		color: var(--grass);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.card__title {
		font-size: 1.25rem;
		font-weight: 800;
	}

	.card__body {
		margin-block-start: 0.75rem;
		color: var(--text-dim);
		font-size: 0.9375rem;
		line-height: 1.75;
	}
</style>
