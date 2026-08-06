import type { AppCopy } from './types';

export const appEn: AppCopy = {
	locale: 'en',
	common: {
		brand: 'BLOCKKING',
		nav: {
			home: 'Home',
			leaderboard: 'Leaderboard',
			account: 'My account',
			login: 'Sign in',
			register: 'Create account'
		},
		localeLabel: 'Language',
		localeNames: { th: 'ไทย', en: 'English' },
		actions: {
			save: 'Save',
			cancel: 'Cancel',
			submit: 'Confirm',
			back: 'Back',
			retry: 'Try again',
			close: 'Close',
			understood: 'I understand',
			signOut: 'Sign out',
			copy: 'Copy',
			copied: 'Copied'
		},
		state: {
			loading: 'Loading…',
			saving: 'Saving…',
			unreachable: 'Could not reach the server. Please try again.',
			signedOut: 'You are signed out.',
			requiresSignIn: 'Sign in to open this page.',
			nothingHere: 'Nothing here yet.'
		},
		units: { seconds: 's', minutes: 'min', hours: 'h', days: 'd' },
		guestBadge: 'Guest',
		staffBadge: 'Staff',
		retryAfter: 'You can try again in {n} seconds.'
	},
	issues: {
		required: 'This field is required.',
		invalid: 'That does not look right.',
		too_short: 'Too short.',
		too_long: 'Too long.',
		too_long_bytes:
			'This name is over the technical limit of 48 bytes. Thai characters with tone marks take more room than Latin ones — please use a shorter name.',
		must_start_with_letter: 'Must start with a letter a–z.',
		bad_separator: 'No repeated . or _, and it cannot end with . or _.',
		character_not_allowed: 'Contains a character that is not allowed.',
		control_character: 'Contains a control character.',
		invisible_character: 'Contains an invisible character, which names may not use.',
		text_direction_override: 'Contains a text-direction override, which names may not use.',
		too_many_marks: 'More than two marks stacked on one character.',
		starts_with_mark: 'Cannot start with a vowel sign or tone mark.',
		no_content: 'Nothing is left of this name once it is normalised.',
		same_as_name: 'The password cannot be your user name or your display name.',
		too_common: 'This password is too common. Please pick another.',
		invalid_encoding: 'Invalid character encoding.',
		taken: 'Already taken.',
		reserved: 'This name is reserved.',
		full: 'This name is full.',
		cooldown: 'Not available yet.',
		tag_taken: 'Your personal number is already in use under that name. Please pick another name.',
		email_verification_required: 'Verify your email first.'
	},
	errors: {
		VALIDATION_FAILED: 'Some of the details are not valid.',
		AUTH_INVALID_CREDENTIALS: 'Wrong user name or password.',
		AUTH_REQUIRED: 'Please sign in.',
		FORBIDDEN: 'You are not allowed to do that.',
		NOT_FOUND: 'Not found.',
		CONFLICT: 'That conflicts with something that already exists.',
		LOGIN_ID_TAKEN: 'That user name is taken.',
		NAME_RESERVED: 'That name cannot be used.',
		NAME_FULL: 'This name already has 9,999 players. Please pick another.',
		TAG_TAKEN_UNDER_NAME:
			'Another player already uses that name with your number. Please pick another name.',
		RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
		SERVER_BUSY: 'The service is busy. Please try again.',
		ACCOUNT_BANNED: 'This account is suspended.',
		ACCOUNT_DISABLED: 'This account is suspended.',
		TOKEN_INVALID: 'That link is not valid.',
		TOKEN_EXPIRED: 'That link has expired. Please request a new one.',
		TOKEN_ALREADY_USED: 'That link has already been used.',
		EMAIL_VERIFICATION_REQUIRED: 'Verify your email before doing this.',
		NAME_CHANGE_COOLDOWN: 'You cannot change your name yet.',
		INTERNAL: 'Something went wrong on our side. Please try again.'
	},
	register: {
		eyebrow: 'Create account',
		title: 'Create a BlockKing account',
		intro:
			'It takes under a minute. An email is optional — but read the warning before choosing to skip it, because it cannot be undone once the password is forgotten.',
		loginIdLabel: 'User name (for signing in)',
		loginIdHint: '3–20 characters, a–z, 0–9, _ and . only, starting with a letter.',
		loginIdPrivacyNote:
			'This user name is only ever used to sign in. It is never shown anywhere in public — not on the leaderboard, not in game — and it cannot be changed later.',
		loginIdChecking: 'Checking…',
		loginIdAvailable: 'Available.',
		loginIdTaken: 'Already taken.',
		displayNameLabel: 'Display name',
		displayNameHint:
			'3–16 characters. Thai, English, digits and _ - . ’ are allowed. Names may repeat — a permanent four-digit number tells you apart.',
		displayNameThaiNote: 'Full Thai support, including vowel signs and tone marks.',
		displayNameCounter: '{n}/{max} characters',
		displayNameBytes: '{n}/{max} bytes',
		passwordLabel: 'Password',
		passwordHint:
			'At least 6 characters. No forced capitals or symbols · not a common password, and not built out of your own name — a couple of words you thought of yourself is both safe and easy to remember.',
		emailLabel: 'Email',
		emailOptional: 'optional',
		emailHint: 'Add one so the password can be reset later. We will send a verification link.',
		submit: 'Create account',
		haveAccount: 'Already have an account?',
		signIn: 'Sign in',
		warning: {
			heading: 'This account will have no email',
			lines: [
				'If you forget the password, the account cannot be recovered — and we cannot recover it for you.',
				'There is no support route for recovering an account with no email. No exceptions.',
				'Every point, skin and rank goes with the account.'
			],
			linkNow: 'Add an email now',
			acknowledge: 'I understand — create it without an email',
			reminder:
				'You can add an email later from your account page — but before you forget the password.'
		},
		success: {
			title: 'Account created',
			body: 'Your account is ready.',
			linkEmail: 'Add an email now',
			goAccount: 'Go to my account'
		}
	},
	login: {
		eyebrow: 'Sign in',
		title: 'Sign in',
		intro: 'Use the user name you chose when registering, not your in-game display name.',
		loginIdLabel: 'User name',
		passwordLabel: 'Password',
		submit: 'Sign in',
		forgot: 'Forgot your password?',
		noAccount: 'No account yet?',
		createAccount: 'Create one',
		genericFailure: 'Wrong user name or password.'
	},
	forgot: {
		eyebrow: 'Forgot password',
		title: 'Request a reset link',
		intro: 'Enter the email linked to your account and we will send a link to set a new password.',
		emailLabel: 'Email',
		submit: 'Send the link',
		sent: 'If an account is linked to that address, we have sent a reset link.',
		noEmailWarning:
			'An account with no linked email cannot be recovered — there is no other route, and we cannot do it for you.',
		backToLogin: 'Back to sign in'
	},
	reset: {
		eyebrow: 'New password',
		title: 'Set a new password',
		intro: 'Setting a new password signs every device out.',
		missingToken: 'That link is incomplete. Please open the link from the email again.',
		newPasswordLabel: 'New password',
		confirmLabel: 'Repeat the new password',
		mismatch: 'The two passwords do not match.',
		submit: 'Set the new password',
		done: 'Your password is set and every session has been signed out.',
		goLogin: 'Sign in with the new password'
	},
	verifyEmail: {
		eyebrow: 'Verify email',
		title: 'Verify your email',
		intro: 'Press the button below to confirm. This link works once.',
		missingToken: 'That link is incomplete. Please open the link from the email again.',
		confirm: 'Verify my email',
		verifying: 'Verifying…',
		done: 'Your email is verified. Your account can now be recovered.',
		goAccount: 'Go to my account'
	},
	account: {
		eyebrow: 'My account',
		title: 'My account',
		memberSince: 'Member since',
		lastLogin: 'Last signed in',
		never: 'never',
		publicProfile: 'View public profile',
		tagExplain:
			'The four digits after your name are permanently yours and do not change when you rename — they tell you apart from players with the same name.',
		recovery: {
			unsafeHeading: 'This account cannot be recovered',
			unsafeBody:
				'No email is linked. If you forget the password, the account is gone — we cannot recover it for you, and every point and rank goes with it.',
			safeHeading: 'This account can be recovered',
			safeBody: 'An email is linked and verified, so a forgotten password can be reset by mail.',
			pendingHeading: 'Waiting for verification',
			pendingBody:
				'We sent a verification link. The account is not recoverable until you press the button in that email. The link lasts 6 hours.',
			resend: 'Send the verification link again',
			resent: 'If a verification is pending, we have sent a new link.'
		},
		name: {
			heading: 'Display name',
			body: 'This is the name other players see in game and on the leaderboard.',
			label: 'Display name',
			rules: [
				'3–16 characters · Thai, English, digits and _ - . ’',
				'Names may repeat; your four-digit number is what tells you apart.',
				'First change free · second needs a verified email · third and later, 30 days apart'
			],
			changesUsed: 'Renamed {n} time(s) so far',
			firstFree: 'This one is still free.',
			secondNeedsEmail: 'Verify your email before renaming again.',
			cooldown: 'The next rename is 30 days away.',
			submit: 'Change name',
			done: 'Name changed. It takes effect in game from your next session.'
		},
		email: {
			heading: 'Email',
			bodyUnlinked:
				'Link an email so the password can be reset. It is the only way to recover this account.',
			bodyLinked:
				'This address is the spare key to the account and can reset a forgotten password.',
			label: 'Email',
			passwordLabel: 'Current password',
			passwordWhy:
				'Linking an email hands over a spare key to the account rather than editing a profile, so the password is asked for again.',
			submit: 'Link this email',
			sent: 'We sent a verification link to that address. Please check your inbox.',
			verifiedAs: 'verified',
			pendingAs: 'pending',
			changeNotAvailable:
				'Changing the address from the web is not available yet — the API has no route for it. Contact the team if you need it changed.'
		},
		password: {
			heading: 'Password',
			body: 'Changing the password signs out every device, including this one.',
			currentLabel: 'Current password',
			newLabel: 'New password',
			confirmLabel: 'Repeat the new password',
			mismatch: 'The two passwords do not match.',
			submit: 'Change password',
			done: 'Password changed. Please sign in again.'
		},
		sessions: {
			heading: 'Signed-in devices',
			body: 'Sessions of this account that are still valid.',
			privacyNote:
				'No addresses and no device details, deliberately: whoever steals a session must not also be handed the owner’s address.',
			current: 'this device',
			kindWeb: 'web',
			kindClient: 'game client',
			issued: 'started',
			expires: 'expires',
			signOutAll: 'Sign out everywhere',
			signOutAllBody: 'Revokes every session except this one.',
			passwordLabel: 'Current password',
			passwordWhy:
				'The password is required so that an attacker holding your session cannot lock you out of your own account first.',
			noPerSessionNote:
				'Revoking one device at a time is not possible yet — the API has no route for it. Only "sign out everywhere".',
			done: 'Revoked {n} session(s).'
		}
	},
	leaderboard: {
		eyebrow: 'Leaderboard',
		title: 'Leaderboard',
		intro: 'One world, no lobbies — everybody is on the same board.',
		tabs: { career: 'Career score', live: 'Score held now' },
		freshness: 'As of {time}',
		freshnessNote:
			'Not real time — the board is cached for {n} seconds, so in-game numbers can run slightly ahead of this page.',
		whyDifferentHeading: 'Why the two boards disagree — and why that is not a bug',
		whyDifferentBody:
			'When a player dies, part of their score drops into the world as orbs for other players to collect. The career total never falls; the score they are holding falls by whatever they dropped. The two boards answer two questions: who has earned the most, and who is holding the most right now.',
		example:
			'A real example: a player who has earned 8,925 points may be holding only 232, having dropped 8,693.',
		columns: {
			rank: 'Rank',
			player: 'Player',
			career: 'Career',
			live: 'Held now',
			dropped: 'Dropped',
			kd: 'K/D',
			streak: 'Best streak',
			playtime: 'Playtime',
			lastSeen: 'Last seen'
		},
		perPage: 'per page',
		rangeLabel: 'Ranks {from}–{to} of {total}',
		prev: 'Previous',
		next: 'Next',
		empty: 'Nobody is on this board yet.',
		privacyNote: 'This board shows display names, player numbers and statistics — nothing else.'
	},
	players: {
		eyebrow: 'Player profile',
		title: 'Player profile',
		missingId: 'No player was named.',
		notFound: 'No such player, or this player has never joined a match.',
		stats: {
			career: 'Career score',
			live: 'Score held now',
			dropped: 'Score dropped',
			kills: 'Kills',
			deaths: 'Deaths',
			kd: 'K/D',
			bestStreak: 'Best streak',
			playtime: 'Total playtime',
			sessions: 'Sessions played',
			firstSeen: 'First played',
			lastSeen: 'Last seen'
		},
		privacyNote: 'Public data only: no user name, no email, no network address.'
	}
};
