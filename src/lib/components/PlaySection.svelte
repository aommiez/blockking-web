<script lang="ts">
	import type { SiteCopy } from '$lib/content';

	let { copy }: { copy: SiteCopy } = $props();

	const play = $derived(copy.play);
	const dl = $derived(play.download);
	const sms = $derived(play.smartScreen);

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyHash(): Promise<void> {
		try {
			await navigator.clipboard.writeText(dl.hash);
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			// Clipboard is blocked (insecure origin or denied permission); the hash
			// is selectable text right beside the button, so leave the label alone.
			copied = false;
		}
	}
</script>

<section class="section" id="play">
	<div class="shell">
		<p class="section__eyebrow">{play.eyebrow}</p>
		<h2 class="section__title">{play.title}</h2>

		<div class="layout">
			<!-- `#download` is the hero's and the header's primary CTA target, so the
			     click lands on the button itself, not somewhere near it. -->
			<div class="panel download" id="download">
				<a class="btn btn--primary download__btn" href={dl.href}>{dl.label}</a>
				<p class="download__meta">{dl.meta}</p>

				<p class="download__label">{dl.hashLabel}</p>
				<div class="download__hashrow">
					<code class="download__hash">{dl.hash}</code>
					<button class="download__copy" type="button" onclick={copyHash}>
						{copied ? dl.copiedLabel : dl.copyLabel}
					</button>
				</div>
				<p class="download__label">{dl.verifyLabel}</p>
				<code class="download__cmd">{dl.verifyCommand}</code>

				<p class="download__notice" role="note">{play.notice}</p>
			</div>

			<ol class="steps">
				{#each play.steps as step, index (step.title)}
					<li class="step">
						<span class="step__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
						<div>
							<h3 class="step__title">{step.title}</h3>
							<p class="step__body">{step.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>

		<!--
			The unsigned-executable warning. This is not a footnote: an alpha handed
			to friends dies at this dialog, because the honest reaction to a blue
			"Windows protected your PC" box is to close it. Saying in advance what it
			looks like and which words to click is the whole difference between a
			download and a player.
		-->
		<aside class="panel warn" aria-labelledby="smartscreen-title">
			<h3 class="warn__title" id="smartscreen-title">{sms.title}</h3>
			<p class="warn__body">{sms.body}</p>
			<ol class="warn__clicks">
				{#each sms.clicks as click (click)}
					<li>{click}</li>
				{/each}
			</ol>
			<p class="warn__footnote">{sms.footnote}</p>
		</aside>
	</div>
</section>

<style>
	.layout {
		display: grid;
		gap: clamp(1.75rem, 4vw, 2.75rem);
		margin-block-start: clamp(2rem, 5vw, 3rem);
	}

	.download {
		padding: clamp(1.5rem, 3vw, 2rem);
		align-self: start;
		border-color: var(--line-hi);
	}

	.download__btn {
		display: inline-block;
		text-align: center;
	}

	.download__meta {
		margin-block-start: 0.9rem;
		color: var(--text-dim);
		font-size: 0.875rem;
	}

	.download__label {
		margin-block-start: 1.5rem;
		color: var(--text-faint);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.download__hashrow {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: 0.75rem;
		margin-block-start: 0.6rem;
	}

	.download__hash {
		/* 64 hex characters with nowhere to break: let it scroll inside its own
		   box rather than push the page sideways on a phone. */
		flex: 1 1 14rem;
		min-width: 0;
		padding: 0.7rem 0.85rem;
		background: var(--bg);
		border: 2px solid var(--line);
		color: var(--grass);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	.download__copy {
		padding: 0.7rem 1.1rem;
		background: var(--surface-hi);
		border: 2px solid var(--line-hi);
		border-radius: 0;
		color: var(--text);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			color 120ms ease;
	}

	.download__copy:hover,
	.download__copy:focus-visible {
		border-color: var(--ember);
		color: var(--ember);
	}

	.download__cmd {
		display: block;
		margin-block-start: 0.6rem;
		padding: 0.7rem 0.85rem;
		background: var(--bg);
		border: 2px solid var(--line);
		color: var(--text-dim);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	.download__notice {
		margin-block-start: 1.4rem;
		padding-inline-start: 0.9rem;
		border-inline-start: 3px solid var(--grass);
		color: var(--text-dim);
		font-size: 0.875rem;
		line-height: 1.65;
	}

	.steps {
		display: grid;
		gap: 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: step;
	}

	.step {
		display: flex;
		gap: 1.1rem;
		padding-block-end: 1.25rem;
		border-block-end: 1px solid var(--line);
	}

	.step:last-child {
		padding-block-end: 0;
		border-block-end: 0;
	}

	.step__num {
		flex: none;
		width: 2.6rem;
		height: 2.6rem;
		display: grid;
		place-items: center;
		background: var(--surface-hi);
		border: 2px solid var(--line-hi);
		color: var(--ember);
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 800;
	}

	.step__title {
		font-size: 1.0625rem;
		font-weight: 800;
	}

	.step__body {
		margin-block-start: 0.3rem;
		color: var(--text-dim);
		font-size: 0.9375rem;
	}

	.warn {
		margin-block-start: clamp(2rem, 5vw, 3rem);
		padding: clamp(1.5rem, 3vw, 2rem);
		border-color: var(--ember);
	}

	.warn__title {
		color: var(--ember);
		font-size: 1.0625rem;
		font-weight: 800;
		line-height: 1.45;
	}

	.warn__body {
		margin-block-start: 0.85rem;
		max-width: 68ch;
		color: var(--text-dim);
		font-size: 0.9375rem;
		line-height: 1.7;
	}

	.warn__clicks {
		display: grid;
		gap: 0.6rem;
		margin: 1.25rem 0 0;
		padding-inline-start: 1.35rem;
		max-width: 68ch;
		color: var(--text);
		font-size: 0.9375rem;
		line-height: 1.65;
	}

	.warn__footnote {
		margin-block-start: 1.25rem;
		max-width: 68ch;
		color: var(--text-faint);
		font-size: 0.875rem;
		line-height: 1.65;
	}

	@media (min-width: 56rem) {
		.layout {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: start;
		}
	}
</style>
