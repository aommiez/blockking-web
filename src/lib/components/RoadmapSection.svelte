<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();
</script>

<!--
	Two tiers, and the tier label is the whole point of the section: everything
	under a label shares that label's honesty. Rendering the groups as one flat
	list would put merged work and unstarted specs in the same voice, which is
	the thing this section exists to avoid.
-->
<section class="section" id="roadmap">
	<div class="shell">
		<p class="section__eyebrow">{copy.roadmap.eyebrow}</p>
		<h2 class="section__title">{copy.roadmap.title}</h2>

		{#each copy.roadmap.groups as group, i (group.label)}
			<div class="group" class:group--next={i > 0}>
				<h3 class="group__label">{group.label}</h3>
				<ul class="items">
					{#each group.items as item (item.title)}
						<li class="item">
							<h4 class="item__title">{item.title}</h4>
							<p class="item__body">{item.body}</p>
						</li>
					{/each}
				</ul>
			</div>
		{/each}

		<p class="note">{copy.roadmap.note}</p>
	</div>
</section>

<style>
	.group {
		margin-block-start: clamp(2rem, 5vw, 3rem);
	}

	.group__label {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--grass);
		line-height: 1.5;
	}

	/* The second tier is not a promise, so it is not painted like one. */
	.group--next .group__label {
		color: var(--text-faint);
	}

	.group__label::before {
		content: '';
		flex: none;
		width: 0.7rem;
		height: 0.7rem;
		background: currentcolor;
	}

	.items {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1px;
		margin: 1.25rem 0 0;
		padding: 0;
		list-style: none;
		background: var(--line);
		border: 1px solid var(--line);
	}

	@media (min-width: 42rem) {
		.items {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.item {
		background: var(--bg-alt);
		padding: clamp(1.1rem, 2.5vw, 1.5rem);
	}

	.item__title {
		font-size: 1.0625rem;
		font-weight: 800;
	}

	.item__body {
		margin-block-start: 0.55rem;
		color: var(--text-dim);
		font-size: 0.9375rem;
		line-height: 1.75;
	}

	.note {
		margin-block-start: 2rem;
		max-width: 68ch;
		color: var(--text-faint);
		font-size: 0.8125rem;
		line-height: 1.7;
	}
</style>
