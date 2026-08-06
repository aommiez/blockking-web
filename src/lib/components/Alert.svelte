<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tone = 'info',
		title = '',
		children,
		assertive = false
	}: {
		tone?: 'danger' | 'warn' | 'ok' | 'info';
		title?: string;
		children?: Snippet;
		/** Errors on a submit want to interrupt; a status line does not. */
		assertive?: boolean;
	} = $props();
</script>

<div
	class="alert alert--{tone}"
	role={tone === 'danger' ? 'alert' : 'status'}
	aria-live={assertive ? 'assertive' : 'polite'}
>
	{#if title}<p class="alert__title">{title}</p>{/if}
	{#if children}{@render children()}{/if}
</div>
