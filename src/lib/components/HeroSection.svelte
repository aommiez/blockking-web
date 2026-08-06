<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();

	const hero = $derived(copy.hero);
</script>

<section class="hero" id="top">
	<div class="shell hero__grid">
		<div class="hero__copy">
			<p class="badge">{hero.badge}</p>

			<h1 class="hero__title">{hero.title}</h1>
			<p class="hero__tagline">{hero.tagline}</p>

			<div class="hero__actions">
				<a class="btn btn--primary" href={hero.primaryHref}>{hero.primaryCta}</a>
				<a class="btn btn--ghost" href={hero.secondaryHref}>{hero.secondaryCta}</a>
			</div>

			<p class="hero__note">{hero.note}</p>

			<dl class="stats">
				{#each hero.stats as stat (stat.label)}
					<div class="stats__item">
						<dt class="stats__value">{stat.value}</dt>
						<dd class="stats__label">{stat.label}</dd>
					</div>
				{/each}
			</dl>
		</div>

		<figure class="hero__figure">
			<div class="frame">
				<img
					src={hero.shot.src}
					width={hero.shot.width}
					height={hero.shot.height}
					alt={hero.shot.alt}
					fetchpriority="high"
				/>
			</div>
			<figcaption class="hero__caption">{hero.shot.caption}</figcaption>
		</figure>
	</div>
</section>

<style>
	.hero {
		padding-block: clamp(3rem, 8vw, 6rem) var(--section-gap);
		overflow: hidden;
	}

	.hero__grid {
		display: grid;
		gap: clamp(2.5rem, 6vw, 4rem);
		align-items: center;
	}

	.badge {
		display: inline-block;
		margin: 0 0 1.4rem;
		padding: 0.4rem 0.85rem;
		background: rgb(255 138 43 / 12%);
		border: 2px solid var(--ember);
		color: var(--ember);
		font-size: 0.78125rem;
		font-weight: 800;
		letter-spacing: 0.16em;
	}

	.hero__title {
		/*
		 * One long unbreakable word, so the size is bounded by the column it sits
		 * in, not by taste. Single-column here; the two-column override is below.
		 */
		font-size: clamp(2.5rem, 9vw, 5.5rem);
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 0.92;
		/* Stacked offsets read as extruded voxel type without an image. */
		text-shadow:
			0.055em 0.055em 0 var(--ember-deep),
			0.11em 0.11em 0 rgb(47 122 42 / 55%);
	}

	.hero__tagline {
		margin-block: 1.5rem 0;
		max-width: 34ch;
		color: var(--text-dim);
		font-size: clamp(1.0625rem, 1rem + 0.5vw, 1.3125rem);
		line-height: 1.6;
	}

	.hero__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.25rem;
		margin-block-start: 2.25rem;
	}

	.hero__note {
		margin-block-start: 1.5rem;
		max-width: 42ch;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1px;
		margin: 2.75rem 0 0;
		background: var(--line);
		border: 1px solid var(--line);
	}

	.stats__item {
		background: var(--bg-alt);
		padding: 0.9rem 1rem;
	}

	.stats__value {
		font-size: 1.5rem;
		font-weight: 900;
		color: var(--grass);
		line-height: 1.2;
	}

	.stats__label {
		margin: 0.15rem 0 0;
		color: var(--text-faint);
		font-size: 0.8125rem;
	}

	.hero__figure {
		margin: 0;
	}

	.frame {
		border: 3px solid var(--line-hi);
		box-shadow: 12px 12px 0 rgb(255 138 43 / 18%);
		background: var(--surface);
	}

	.frame img {
		width: 100%;
		height: auto;
	}

	.hero__caption {
		margin-block-start: 1rem;
		color: var(--text-faint);
		font-size: 0.8125rem;
	}

	@media (min-width: 30rem) {
		.stats {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (min-width: 62rem) {
		.hero__grid {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		}

		/* The copy column is now ~half the shell, so the title has to come down
		   with it or it runs under the screenshot. */
		.hero__title {
			font-size: clamp(3.25rem, 6.2vw, 5rem);
		}

		.stats {
			max-width: 34rem;
		}
	}
</style>
