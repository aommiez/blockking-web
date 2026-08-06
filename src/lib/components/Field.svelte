<script lang="ts">
	/**
	 * One labelled input with a hint and a message slot.
	 *
	 * The message slot is always present and `aria-live="polite"`, so an answer
	 * that arrives late — the availability check for a user name, or a
	 * validation `details` entry from the API — is announced instead of just
	 * appearing, and the layout does not jump when it does.
	 */
	import type { Snippet } from 'svelte';

	type MessageTone = 'error' | 'ok' | 'busy';

	let {
		id,
		label,
		value = $bindable(''),
		type = 'text',
		hint = '',
		message = '',
		tone = 'error',
		optionalLabel = '',
		autocomplete = undefined,
		inputmode = undefined,
		placeholder = '',
		disabled = false,
		required = false,
		maxlength = undefined,
		counter = '',
		oninput = undefined,
		onblur = undefined,
		footer = undefined
	}: {
		id: string;
		label: string;
		value?: string;
		type?: 'text' | 'password' | 'email';
		hint?: string;
		message?: string;
		tone?: MessageTone;
		optionalLabel?: string;
		autocomplete?: string;
		inputmode?: 'text' | 'email' | 'numeric';
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		maxlength?: number;
		counter?: string;
		oninput?: () => void;
		onblur?: () => void;
		footer?: Snippet;
	} = $props();

	const describedBy = $derived([hint ? `${id}-hint` : '', `${id}-msg`].filter(Boolean).join(' '));
</script>

<div class="field">
	<label class="field__label" for={id}>
		<span>{label}</span>
		{#if optionalLabel}<span class="field__optional">{optionalLabel}</span>
		{:else if counter}<span class="field__optional">{counter}</span>{/if}
	</label>

	<!--
		`type` cannot be a dynamic attribute on an input Svelte also binds, so the
		three we use are spelled out. It is three lines and it keeps the binding.
	-->
	{#if type === 'password'}
		<input
			class="field__control"
			{id}
			type="password"
			bind:value
			{placeholder}
			{disabled}
			{required}
			{maxlength}
			autocomplete={autocomplete as never}
			aria-describedby={describedBy}
			aria-invalid={message !== '' && tone === 'error'}
			{oninput}
			{onblur}
		/>
	{:else if type === 'email'}
		<input
			class="field__control"
			{id}
			type="email"
			bind:value
			{placeholder}
			{disabled}
			{required}
			{maxlength}
			inputmode="email"
			autocomplete={autocomplete as never}
			aria-describedby={describedBy}
			aria-invalid={message !== '' && tone === 'error'}
			{oninput}
			{onblur}
		/>
	{:else}
		<input
			class="field__control"
			{id}
			type="text"
			bind:value
			{placeholder}
			{disabled}
			{required}
			{maxlength}
			{inputmode}
			autocomplete={autocomplete as never}
			aria-describedby={describedBy}
			aria-invalid={message !== '' && tone === 'error'}
			{oninput}
			{onblur}
		/>
	{/if}

	{#if hint}
		<p class="field__hint" id="{id}-hint">{hint}</p>
	{/if}
	{#if footer}
		<div class="field__hint">{@render footer()}</div>
	{/if}

	<p
		class="field__msg"
		class:field__msg--error={tone === 'error'}
		class:field__msg--ok={tone === 'ok'}
		class:field__msg--busy={tone === 'busy'}
		id="{id}-msg"
		aria-live="polite"
	>
		{message}
	</p>
</div>
