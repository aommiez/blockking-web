import type { SiteCopy } from './types';

/**
 * English landing-page copy, written against the same `SiteCopy` type as `th`.
 *
 * The download block is deliberately identical to the Thai one where it is a
 * fact rather than a sentence: the URL, the file name and the SHA-256 are the
 * same object and `DISTRIBUTION.md` §4.6 fixes the first two forever. If the
 * hash is re-typed in `th.ts` after a launcher release, it has to be re-typed
 * here in the same commit or one language advertises a hash that no longer
 * matches the file.
 */
export const en: SiteCopy = {
	locale: 'en',
	htmlLang: 'en',
	meta: {
		title: 'BLOCKKING — a borderless block-world FPS, 2,048 players in one world',
		description:
			'BlockKing is a third-person shooter in an 8×8 km borderless block world shaped like a torus. ' +
			'Everybody plays in the same world. King Hunt: the higher you rank, the harder you are hunted. ' +
			'Servers in Thailand, 30 Hz tick.',
		origin: 'https://www.blockking.gg',
		ogImage: '/shots/og-world.jpg'
	},
	nav: {
		links: [
			{ href: '#features', label: 'Features' },
			{ href: '#shots', label: 'Screenshots' },
			{ href: '#roadmap', label: 'Updates' },
			{ href: '#play', label: 'Play' },
			{ href: '#signup', label: 'Account' }
		],
		cta: 'Download'
	},
	hero: {
		badge: 'CLOSED ALPHA — playable now',
		title: 'BLOCKKING',
		tagline:
			'A borderless block-world FPS with 2,048 players in one world — hunt the number one, or become the target.',
		primaryCta: 'Download the game',
		primaryHref: '#download',
		secondaryCta: 'How to play',
		secondaryHref: '#play',
		note: 'Windows 64-bit · one 13 MB download · no installer, no registry, uninstall by deleting the folder',
		stats: [
			{ value: '8×8', label: 'km, one world' },
			{ value: '2,048', label: 'players at once' },
			{ value: '30', label: 'Hz server tick' },
			{ value: '1–5', label: 'ms from Thailand' }
		],
		shot: {
			src: '/shots/world.webp',
			width: 930,
			height: 523,
			alt: 'A wide block grassland running to a hazy coastline, with a compass marker top left putting the King 142 metres away.',
			caption: 'The compass puts the King 142 m away — a real frame from the build'
		}
	},
	features: {
		eyebrow: 'Why BlockKing',
		title: 'One world, no matches, nowhere to hide',
		items: [
			{
				tag: 'TORUS 8×8 KM',
				title: 'A borderless world you can walk straight through',
				body:
					'The world is a finite 8×8 km, but it has no walls and no edge to hit — walk off one side and you appear on the other, ' +
					'on both the X and Z axes. The compass measures distance the same way, so it always points along the shortcut across the seam. ' +
					'On a closed surface there is no "furthest away" to flee to: running is changing neighbourhood, not leaving the game.'
			},
			{
				tag: 'KING HUNT',
				title: 'The higher you rank, the harder you are hunted',
				body:
					'One mode, one world, no round timer. Top-ranked players appear as a mark on the compass of everybody near them, ' +
					'over a radius that widens with rank. Reaching first place is not the hard part; staying there is.'
			},
			{
				tag: 'TPP + 64×64 SKINS',
				title: 'Shoot from third person and always see yourself',
				body:
					'The third-person camera is the default. Characters are six-box models that read clearly at distance, ' +
					'and a skin is a single 64×64 sheet in the layout you already know — draw one and drop it in.'
			},
			{
				tag: 'THAI SERVERS, 30 Hz',
				title: 'Ping your aim can trust',
				body:
					'The simulation is an authoritative server written in Go, ticking at 30 Hz, ' +
					'load-tested at 2,048 players inside its per-tick budget. It is hosted in Thailand, ' +
					'so Thai players sit at 1–5 ms instead of sharing frames with the other side of the planet.'
			}
		]
	},
	shots: {
		eyebrow: 'Screenshots',
		title: 'Every shot is from a build you can play',
		note: 'All captured from a development build, untouched. The town, warp-pad, chat, map, death-screen and ground-loot frames come from a test build that is not on the public server yet — see "Updates".',
		items: [
			{
				src: '/shots/tpp.jpg',
				width: 1096,
				height: 616,
				alt: 'Third-person view of a blocky character on a grass step, with block mountains in the distance.',
				caption: 'Third person — terrain generated from one seed, identically on every machine'
			},
			{
				src: '/shots/combat.jpg',
				width: 1096,
				height: 617,
				alt: 'A gun firing into grass, with block debris kicking up around the impact point.',
				caption: 'Firing — debris marks the impact, with the ammo counter bottom right'
			},
			{
				src: '/shots/multiplayer.jpg',
				width: 1080,
				height: 608,
				alt: 'Another player called Player 13 stands ahead in the same world, our weapon in view.',
				caption: 'Real multiplayer over UDP — other players in the same world'
			},
			{
				src: '/shots/town.webp',
				width: 850,
				height: 478,
				alt: 'Standing on a warp pad inside the safe zone of town NW, with a "safe zone · town NW" banner and a "press E · to town SW" prompt on screen, the minimap top right, grassland and sea behind.',
				caption:
					'A town safe zone — inside this 64 m radius nobody can shoot anybody, and the pad underfoot goes straight to another town'
			},
			{
				src: '/shots/warp-pad.webp',
				width: 850,
				height: 478,
				alt: 'A glowing pink warp pad beside the wall of town NW, with the words "out to the field" floating above it.',
				caption: 'Warp pads — one throws you out to the field, three go to the other towns'
			},
			{
				src: '/shots/chat.webp',
				width: 568,
				height: 320,
				alt: 'A stack of chat lines in the lower left: lines prefixed [town] in green and [near] in blue, above an input box with a half-typed Thai sentence in it.',
				caption:
					'Two chat channels — [town] and [near], each its own colour, and Thai fits a whole line'
			},
			{
				src: '/shots/map.webp',
				width: 917,
				height: 516,
				alt: 'The full map open over the game, showing lakes, snow and the labels of all four towns — SE, SW, NW and NE — with the player marker in the middle and the small corner minimap still visible top right.',
				caption: 'M opens the whole 8 km world — the corner minimap stays where it was'
			},
			{
				src: '/shots/death.webp',
				width: 782,
				height: 440,
				alt: 'The death screen, saying TowerRat_42 killed you with a sniper rifle at 287 metres, with a green respawn button.',
				caption:
					'Death tells you who shot you, with what, and from how far — then you choose when to go back'
			},
			{
				src: '/shots/loot.webp',
				width: 720,
				height: 405,
				alt: 'Items lying on red village ground: a rifle, an ammo box, an armour plate and a green pack.',
				caption: 'Village ground loot — guns, ammo, armour, and the box somebody else left behind'
			}
		]
	},
	roadmap: {
		eyebrow: 'Updates',
		title: 'What just landed, and what is being built',
		note: 'This is an alpha and it ships in steps. The client and the server have to move together, so the first group is not in the build this page hands you today — the launcher will update itself when the next release goes out.',
		groups: [
			{
				label: 'Done, in the test build — going to the public server next release',
				items: [
					{
						title: 'Four safe towns',
						body:
							'One town in each quarter of the map. Within 64 m of a town centre nobody can be hurt: the server refuses the damage if either side is inside — and a refused shot does not cost you the round. ' +
							'Your first spawn is the emptiest town; after a death it is the town nearest where you fell.'
					},
					{
						title: 'Warp pads across the map',
						body:
							'Every town has four pads on a 30 m ring. Stand on one and press E. ' +
							'One throws you out to a random point in the field at least 200 m away; the other three go straight to the other three towns. ' +
							'Eight kilometres without walking.'
					},
					{
						title: 'A death screen, and when you go back',
						body:
							'Death tells you who killed you, with which weapon, from how many metres, whether it was a headshot, and what it cost you in score. ' +
							'You can respawn after 3 seconds, and if you never press the button you go back within 30. ' +
							'Every number comes off the server — editing your own files cannot get you up sooner.'
					},
					{
						title: 'A corpse box you can run back for',
						body:
							'Your gear does not evaporate. It drops as one box where you fell and stays for 120 seconds, ' +
							"holding the primary you looted, that gun's ammo, and half the armour you had left. " +
							'Whoever reaches it first keeps it — including the player who killed you.'
					},
					{
						title: 'You spawn with a pistol and a knife',
						body:
							'Primaries are not issued, they are found — in villages and towers, taken by holding E for about a second. ' +
							'Picking up a second primary drops the first where you stand. A looted spot restocks after roughly 10 to 20 seconds.'
					},
					{
						title: 'Four kinds of ammunition',
						body:
							'Rifle, pistol, shotgun and sniper rounds are four separate pools with their own carry ceilings — 120, 48, 24 and 15. ' +
							'A gun you found reloads like any other; it is not disposable.'
					},
					{
						title: 'Walking quietly',
						body:
							'Hold Shift to walk at 55% speed. Your footsteps go quieter and lower — and, more to the point, nobody else hears them at all. ' +
							'You can actually close on someone who is busy with somebody else.'
					},
					{
						title: 'Two chat channels, and no world-wide one',
						body:
							'Press T to type. "Town" reaches everyone inside the same safe zone; "near" reaches about 120 m around you. ' +
							'The server picks the channel from where you actually are — you cannot ask for one. A line is 192 bytes, which is about 64 Thai characters. ' +
							'Click a name in the log to mute that player for the session you are playing, or to report the line. ' +
							'And while you are typing, your character no longer walks off on the keys you press.'
					},
					{
						title: 'A minimap, and the whole map on M',
						body:
							'A corner map about 300 m across, always north-up. M opens the whole 8 km world: the four towns and their safe-zone rings, warp pads, villages, towers, ' +
							'and the players the game was already telling you about. ' +
							'The map knows nothing beyond that — someone who walks out of range leaves it immediately, with no trail left behind to follow.'
					},
					{
						title: 'Two rifles, two styles',
						body:
							'The AR-4 and the AK-46 draw from the same rifle ammo pool and, on paper, kill in the same time — by opposite routes. ' +
							'The AR-4 fires at 600 RPM with a 30-round magazine and a tighter cone, and holds range better. ' +
							'The AK-46 fires at 450 RPM with 25 rounds, hitting hard enough to need only four of them for a kill, and pays for it in recoil and in falloff that starts sooner. ' +
							'AR-4s are found in villages, AK-46s on towers. Four things are holdable today: those two rifles, the pistol and the knife.'
					}
				]
			},
			{
				label: 'Being built now',
				items: [
					{
						title: 'The shotgun and the sniper',
						body: 'Their numbers and their sounds are written, but no player can hold one yet. They are being made findable on the ground like the rifles.'
					},
					{
						title: 'Airdrops',
						body: 'Still a draft; none of the numbers have settled.'
					},
					{
						title: 'World events',
						body:
							'Also a draft, and nothing about it is decided. The problem it is for: making people meet at the same time in the same place, ' +
							'instead of spreading out across eight kilometres of map.'
					},
					{
						title: 'An in-game console (F8)',
						body: 'A window onto your own client log while you play, to attach when you report something. The first version reads only — there is nothing to type into it.'
					}
				]
			}
		]
	},
	play: {
		eyebrow: 'Play',
		title: 'Three steps, done',
		download: {
			label: 'Download BlockKingPatcher.exe',
			href: 'https://blockking-cdn.sgp1.cdn.digitaloceanspaces.com/launcher/BlockKingPatcher.exe',
			meta: 'Windows 64-bit · 13.0 MB · launcher 0.2.1 · game 0.4.0-alpha.1',
			hashLabel: 'SHA-256 of this file',
			hash: '52a94f7cb7e6561aba860e4834e2d82cc5f0b02b2d40adb0646b0bc494946f4a',
			verifyLabel: 'Check it yourself in PowerShell',
			verifyCommand: 'Get-FileHash .\\BlockKingPatcher.exe -Algorithm SHA256',
			copyLabel: 'Copy',
			copiedLabel: 'Copied'
		},
		steps: [
			{
				title: 'Download one file',
				body: 'Press the button above. You get BlockKingPatcher.exe, 13 MB — not a zip, not an installer.'
			},
			{
				title: 'Put it where you want the game to live',
				body:
					'Make a folder for it, say D:\\Games\\BlockKing, and move the file there. ' +
					'The game installs beside that file, so do not leave it sitting in Downloads.'
			},
			{
				title: 'Double-click it',
				body:
					'The launcher fetches the ~91 MB of game data from Singapore for you (usually under a minute). ' +
					'Then press Play. Next time, open the same file — it patches itself.'
			}
		],
		notice:
			'Everything lives in one folder — nothing is written to the registry and nothing is left elsewhere. ' +
			'To uninstall, delete the folder.',
		smartScreen: {
			title: 'Windows will warn "Windows protected your PC" — why, and what to press',
			body:
				'BlockKing has no code-signing certificate yet (they cost a few hundred dollars a year and are only issued to verifiable companies). ' +
				'Windows shows this warning for every unsigned program, safe or not. ' +
				'It means "this file is unknown", not "this file was scanned and found dangerous".',
			clicks: [
				'If the browser says the file is "not commonly downloaded", press the ⋯ next to the download and choose Keep → Keep anyway.',
				'On first launch the blue box shows only "Don\'t run" — press "More info" first.',
				'A "Run anyway" button appears. Press it, and this machine will not ask again.'
			],
			footnote:
				'To be sure before opening it, compare the SHA-256 above with the file you downloaded — a match means it is the file we published. · ' +
				'Download only from this page: there is no mirror and no link from any other site.'
		}
	},
	signup: {
		eyebrow: 'Account',
		title: 'Create a BlockKing account',
		body:
			'Claim your display name, follow your rank on the leaderboard, and keep your progress. ' +
			'An email is optional — but an account without one cannot be recovered.',
		primaryCta: 'Create an account',
		secondaryCta: 'Sign in',
		leaderboardCta: 'See the leaderboard',
		note: 'An account with no email cannot be recovered if the password is forgotten — not even by us. Adding one takes a minute and can be done later.'
	},
	footer: {
		tagline: 'A borderless block-world FPS — one world, everybody together',
		builtWith: 'Godot 4 + godot_voxel · Go server at 30 Hz',
		copyright: '© 2026 BlockKing'
	}
};
