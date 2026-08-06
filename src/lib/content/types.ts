/**
 * Copy for the landing page lives in typed dictionaries, one file per locale.
 * Thai ships today; English is added by writing `en.ts` against these types and
 * registering it in `index.ts` — no component has to change.
 */

export type Locale = 'th' | 'en';

export interface NavLink {
	href: string;
	label: string;
}

export interface Stat {
	value: string;
	label: string;
}

export interface Feature {
	/** Short tag rendered in the card's corner chip. */
	tag: string;
	title: string;
	body: string;
}

export interface Shot {
	/** Path under `static/`, so it resolves the same in dev and in the build. */
	src: string;
	width: number;
	height: number;
	alt: string;
	caption: string;
}

export interface Step {
	title: string;
	body: string;
}

/** One line of the update section: a short label and what it actually does. */
export interface RoadmapItem {
	title: string;
	body: string;
}

/**
 * A tier of the update section. The tiers exist because the page must not put
 * "shipped" and "designed" in the same voice: `label` is the honest status of
 * everything under it, and it is the only thing separating the two.
 */
export interface RoadmapGroup {
	label: string;
	items: RoadmapItem[];
}

/**
 * The one file a player downloads through a browser. `href` is an absolute URL
 * because the build lives on the CDN, not in this site's `static/`, and
 * DISTRIBUTION.md 4.6 requires that URL and that file name to stay fixed
 * forever: SmartScreen reputation accrues to the pair, so renaming either
 * throws the accumulated trust away.
 */
export interface Download {
	label: string;
	href: string;
	/** Platform, size and version, rendered under the button. */
	meta: string;
	hashLabel: string;
	/** Lowercase hex SHA-256 of the file at `href`. */
	hash: string;
	verifyLabel: string;
	verifyCommand: string;
	copyLabel: string;
	copiedLabel: string;
}

/**
 * The unsigned-executable warning, spelled out rather than glossed over. An
 * alpha handed to friends dies at this dialog if the page does not say in
 * advance what it looks like and which button to press.
 */
export interface SmartScreenNotice {
	title: string;
	body: string;
	/** The clicks, in order, that get past the dialog. */
	clicks: string[];
	footnote: string;
}

export interface SiteCopy {
	locale: Locale;
	/** Value for `<html lang>`. */
	htmlLang: string;
	meta: {
		title: string;
		description: string;
		/**
		 * Absolute origin the site is served from, no trailing slash. This is the
		 * one place the public host name is written down: `<link rel="canonical">`
		 * and the Open Graph tags need an absolute URL, and a relative `og:image`
		 * is ignored by every scraper. Keep it on `www`, which is the app's PRIMARY
		 * domain — the apex is an alias of it.
		 */
		origin: string;
		/**
		 * Path under `static/` for the Open Graph card, and the one image on this
		 * site that may not be WebP. It is deliberately not `hero.shot.src`, which
		 * it used to follow: the hero is chosen to look good in a browser, where
		 * WebP is universal, but an `og:image` is read by link scrapers and
		 * several of those still only take JPEG or PNG. A hero swap must not be
		 * able to silently blank the share preview, so the card carries its own
		 * 1200×630-ish JPEG.
		 */
		ogImage: string;
	};
	nav: {
		links: NavLink[];
		cta: string;
	};
	hero: {
		badge: string;
		title: string;
		tagline: string;
		primaryCta: string;
		primaryHref: string;
		secondaryCta: string;
		secondaryHref: string;
		note: string;
		stats: Stat[];
		shot: Shot;
	};
	features: {
		eyebrow: string;
		title: string;
		items: Feature[];
	};
	shots: {
		eyebrow: string;
		title: string;
		note: string;
		items: Shot[];
	};
	/**
	 * What has changed since the last build and what is being built next.
	 *
	 * This section is why the landing page can talk about towns, the death
	 * screen and the corpse box at all. They are real and merged, but the client
	 * a visitor downloads today predates them and the public shard runs with
	 * them off, so listing them beside "2,048 players" as though both were
	 * equally true of a fresh download would be a lie the page tells to every
	 * player it recruits. `groups[].label` carries the status instead, which
	 * keeps the claim honest through a release rather than only on the day it
	 * was written. When a paired client+server release lands, the item moves up
	 * a group — the sentence about it does not have to change.
	 */
	roadmap: {
		eyebrow: string;
		title: string;
		note: string;
		groups: RoadmapGroup[];
	};
	play: {
		eyebrow: string;
		title: string;
		download: Download;
		steps: Step[];
		notice: string;
		smartScreen: SmartScreenNotice;
	};
	/**
	 * The account call to action. This block used to hold an inert mailing-list
	 * form; accounts are real now (`meta/`), so it points at the register and
	 * sign-in pages instead. `note` is the recoverability line — it belongs on
	 * the landing page and not only inside the flow, because ACCOUNTS.md §5.1's
	 * warning is a decision a player should meet before they start typing.
	 */
	signup: {
		eyebrow: string;
		title: string;
		body: string;
		primaryCta: string;
		secondaryCta: string;
		leaderboardCta: string;
		note: string;
	};
	footer: {
		tagline: string;
		builtWith: string;
		copyright: string;
	};
}
