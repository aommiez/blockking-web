<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();
</script>

<section class="section" id="shots">
	<div class="shell">
		<p class="section__eyebrow">{copy.shots.eyebrow}</p>
		<h2 class="section__title">{copy.shots.title}</h2>

		<ul class="gallery">
			{#each copy.shots.items as shot (shot.src)}
				<li>
					<figure class="shot">
						<div class="shot__frame">
							<img
								src={shot.src}
								width={shot.width}
								height={shot.height}
								alt={shot.alt}
								loading="lazy"
								decoding="async"
							/>
						</div>
						<figcaption class="shot__caption">{shot.caption}</figcaption>
					</figure>
				</li>
			{/each}
		</ul>

		<p class="note">{copy.shots.note}</p>
	</div>
</section>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 1.5rem;
		margin: clamp(2rem, 5vw, 3rem) 0 0;
		padding: 0;
		list-style: none;
	}

	.shot {
		margin: 0;
		height: 100%;
	}

	.shot__frame {
		border: 3px solid var(--line);
		background: var(--surface);
		overflow: hidden;
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.shot:hover .shot__frame {
		border-color: var(--grass);
		box-shadow: 8px 8px 0 rgb(87 192 74 / 18%);
	}

	.shot__frame img {
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	.shot__caption {
		margin-block-start: 0.85rem;
		color: var(--text-dim);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.note {
		margin-block-start: 2rem;
		color: var(--text-faint);
		font-size: 0.8125rem;
	}
</style>
