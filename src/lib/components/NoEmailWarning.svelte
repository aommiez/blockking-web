<script lang="ts">
	/**
	 * ACCOUNTS.md §5.1, as a step the player cannot walk past.
	 *
	 * The document is specific about the shape and the reason: this must be a
	 * block the player has to answer, **not a small checkbox at the foot of the
	 * form**, because the thing being agreed to is that a forgotten password
	 * destroys the account with no appeal. §5.5 forbids a support route for
	 * recovering an account with no email, which means this warning is the only
	 * true statement a player will ever get about it.
	 *
	 * So:
	 *   - it is modal, and the primary button is "add an email now" (§5.1 wants
	 *     the link, it just does not force it — decision D1);
	 *   - "I understand" is the secondary button and carries the whole sentence,
	 *     not the word "OK";
	 *   - dismissing it (Escape, the backdrop) cancels, it does not register.
	 *
	 * The acknowledgement itself is recorded server-side against the wording's
	 * version, so a recovery request years from now can be answered with what
	 * the player actually saw. Nothing about that is this component's job beyond
	 * sending `no_email_ack` only when this button was the one that was pressed.
	 */
	import { tick } from 'svelte';
	import type { AppCopy } from '$lib/content/app';

	let {
		copy,
		open = false,
		busy = false,
		onLinkEmail,
		onAcknowledge,
		onCancel
	}: {
		copy: AppCopy;
		open?: boolean;
		busy?: boolean;
		/** "Add an email now" — take them back to the field, do not register. */
		onLinkEmail: () => void;
		/** "I understand" — register with `no_email_ack: true`. */
		onAcknowledge: () => void;
		onCancel: () => void;
	} = $props();

	const w = $derived(copy.register.warning);

	let dialogEl = $state<HTMLDivElement | null>(null);
	let primaryEl = $state<HTMLButtonElement | null>(null);

	$effect(() => {
		if (!open) return;
		// Focus the primary action, which is the one we would like pressed, and
		// which also anchors the screen reader inside the dialog.
		tick().then(() => primaryEl?.focus());
	});

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onCancel();
			return;
		}
		if (event.key !== 'Tab' || !dialogEl) return;
		// A small trap rather than a library: three buttons, one container.
		const focusable = dialogEl.querySelectorAll<HTMLElement>('button:not(:disabled)');
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<div class="backdrop">
		<div
			class="dialog"
			bind:this={dialogEl}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="no-email-heading"
			aria-describedby="no-email-body"
		>
			<p class="dialog__mark" aria-hidden="true">⚠</p>
			<h2 class="dialog__heading" id="no-email-heading">{w.heading}</h2>

			<ul class="dialog__lines" id="no-email-body">
				{#each w.lines as line, i (i)}
					<li>{line}</li>
				{/each}
			</ul>

			<div class="dialog__actions">
				<button
					class="btn btn--primary"
					type="button"
					bind:this={primaryEl}
					disabled={busy}
					onclick={onLinkEmail}
				>
					{w.linkNow}
				</button>
				<button class="btn btn--ghost" type="button" disabled={busy} onclick={onAcknowledge}>
					{busy ? copy.common.state.saving : w.acknowledge}
				</button>
			</div>

			<p class="dialog__note">{w.reminder}</p>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgb(4 6 8 / 82%);
		overflow-y: auto;
	}

	.dialog {
		width: min(38rem, 100%);
		padding: clamp(1.5rem, 5vw, 2.5rem);
		background: var(--surface);
		border: 3px solid var(--danger);
		box-shadow: 12px 12px 0 rgb(224 74 58 / 25%);
	}

	.dialog__mark {
		margin: 0 0 0.5rem;
		color: var(--danger);
		font-size: 2.5rem;
		line-height: 1;
	}

	.dialog__heading {
		font-size: clamp(1.4rem, 1rem + 2vw, 1.9rem);
		font-weight: 800;
		color: var(--danger);
	}

	.dialog__lines {
		margin: 1.1rem 0 0;
		padding-inline-start: 1.1rem;
		display: grid;
		gap: 0.65rem;
		font-size: 1.0625rem;
		line-height: 1.65;
	}

	.dialog__lines li::marker {
		color: var(--danger);
	}

	.dialog__actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-block-start: 1.75rem;
	}

	.dialog__note {
		margin-block-start: 1.1rem;
		color: var(--text-faint);
		font-size: 0.875rem;
	}

	@media (min-width: 34rem) {
		.dialog__actions {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}
</style>
