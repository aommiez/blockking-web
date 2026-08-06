<script lang="ts">
	import { copy as canonicalCopy, siteCopy } from '$lib/content';
	import { locale } from '$lib/i18n/locale.svelte';
	import FeatureGrid from '$lib/components/FeatureGrid.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import PlaySection from '$lib/components/PlaySection.svelte';
	import RoadmapSection from '$lib/components/RoadmapSection.svelte';
	import ShotGallery from '$lib/components/ShotGallery.svelte';
	import SignupSection from '$lib/components/SignupSection.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	const copy = $derived(siteCopy(locale.current));
</script>

<!--
	The head stays on the Thai copy whatever the reader has chosen. It is emitted
	at build time into one prerendered `index.html`, so it can only carry one
	title, one description and one canonical URL — and this site's canonical
	language is Thai. Swapping it after hydration would change what a share
	preview says without changing what a crawler read, which is worse than
	either.
-->
<svelte:head>
	<title>{canonicalCopy.meta.title}</title>
	<meta name="description" content={canonicalCopy.meta.description} />
	<link rel="canonical" href="{canonicalCopy.meta.origin}/" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="BlockKing" />
	<meta property="og:url" content="{canonicalCopy.meta.origin}/" />
	<meta property="og:title" content={canonicalCopy.meta.title} />
	<meta property="og:description" content={canonicalCopy.meta.description} />
	<meta property="og:image" content="{canonicalCopy.meta.origin}{canonicalCopy.meta.ogImage}" />
	<meta property="og:locale" content="th_TH" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SiteHeader {copy} />

<main>
	<HeroSection {copy} />
	<FeatureGrid {copy} />
	<ShotGallery {copy} />
	<RoadmapSection {copy} />
	<PlaySection {copy} />
	<SignupSection {copy} />
</main>

<SiteFooter {copy} />
