<script lang="ts">
	import { locale } from '$lib/i18n/locale.svelte';
	import type { AppCopy } from '$lib/content/app';
	import type { Locale } from '$lib/content';

	let { copy }: { copy: AppCopy } = $props();

	const options: Locale[] = ['th', 'en'];
</script>

<div class="switch" role="group" aria-label={copy.common.localeLabel}>
	{#each options as option (option)}
		<button
			type="button"
			class="switch__btn"
			class:switch__btn--on={locale.current === option}
			aria-pressed={locale.current === option}
			onclick={() => locale.set(option)}
		>
			{copy.common.localeNames[option]}
		</button>
	{/each}
</div>

<style>
	.switch {
		display: inline-flex;
		border: 1px solid var(--line-hi);
	}

	.switch__btn {
		padding: 0.35rem 0.7rem;
		background: transparent;
		border: 0;
		color: var(--text-faint);
		font: inherit;
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
	}

	.switch__btn + .switch__btn {
		border-inline-start: 1px solid var(--line-hi);
	}

	.switch__btn--on {
		background: var(--surface-hi);
		color: var(--text);
	}
</style>
