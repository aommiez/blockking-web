# web — blockking.gg landing page

Static marketing site for BlockKing. **SvelteKit + `@sveltejs/adapter-static`**, no
runtime on the server: `npm run build` emits a fully prerendered tree into `build/`
that any static host can serve.

> **This directory is published.** Its contents are mirrored to the _public_ repo
> `aommiez/blockking-web` (see "Publishing" below), so everything under `web/` —
> this README included — is world-readable. Keep server addresses, host names,
> credentials and other infrastructure detail out of it; that material belongs in
> `infra/`, which is not published.

It is no longer only a landing page: the account pages (register, sign in,
profile, leaderboard) live here too and talk to the **meta API** from the
browser. That still needs no server of ours — see "The account pages" below for
what it does need, which is one routing rule in front of the site.

Everything is self-contained — no CDN, no webfonts, no third-party scripts. Copy
lives in typed dictionaries under `src/lib/content/`: `SiteCopy` (th + en) for
the landing page, `AppCopy` (th + en) under `content/app/` for everything else.
No component holds a user-visible string.

## Commands

```powershell
npm install          # first time

# The account pages need /v1 proxied to a meta API (see "The account pages").
# The address is not in this repo; put it in `.env.local`, which is git-ignored.
#   META_API_PROXY=http://127.0.0.1:<port>
npm run dev          # dev server, http://localhost:5173
npm run build        # -> build/  (must exit 0)
npm run preview      # serve build/ locally
npm run check        # svelte-check, strict TS
npm run lint         # prettier --check + eslint
npm run format       # prettier --write
```

> **npm on the current dev box:** the `npm` on `PATH`
> (`%APPDATA%\npm\npm.cmd`) is broken — it resolves to an npm install whose
> `package.json` is missing and dies with `MODULE_NOT_FOUND`. Node's own bundled
> npm is fine; call it directly:
>
> ```powershell
> node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
> ```
>
> Fixing the `PATH` shim is a workstation chore, not a repo change.

## Layout

```
web/
  .env.example                 the two environment variables, with placeholders
  src/
    app.css                    design system: palette, type scale, .btn/.panel/.field
    app.html                   <html lang="th">, favicon, theme-color
    app.d.ts                   the build-time env contract
    lib/api/                   the only code that talks to the meta API
      config.ts                where the API is (default `/v1`, same-origin)
      client.ts                fetch wrapper, error envelope, CSRF reasoning
      endpoints.ts             one function per endpoint
      types.ts                 the response shapes
      messages.ts              failure -> a sentence, without leaking which failure
      session.svelte.ts        who is signed in, as far as this tab knows
    lib/content/               typed copy — SiteCopy (th, en) + content/app (th, en)
    lib/components/            landing sections + AppShell/Field/Alert/NoEmailWarning
    lib/i18n/locale.svelte.ts  the language, from a cookie
    lib/format.ts              numbers, Bangkok time, พ.ศ., durations, name#tag
    lib/validate.ts            client echo of meta's ident rules (Thai graphemes)
    routes/+layout.ts          prerender = true
    routes/+page.svelte        landing page
    routes/register/           account creation + the §5.1 blocking warning
    routes/login/              sign in
    routes/account/            profile, name, password, email, sessions
    routes/account/verify-email/   GET shows a button, POST spends the token
    routes/account/forgot|reset/   password recovery
    routes/leaderboard/        the two boards
    routes/players/            one player's public page (`?id=`)
  static/
    favicon.svg                blocky crown
    shots/*.jpg                in-game screenshots
  deploy/do-app.yaml           DigitalOcean App Platform spec
```

## The account pages

`meta/README.md` is the API contract; `ACCOUNTS.md` is the specification behind
it. What follows is only what the _browser_ side of it needs.

### Where the API is, and why it must be same-origin

`src/lib/api/config.ts` defaults to **`/v1` — relative**. That is not a
shortcut; it is the only arrangement that works today:

- the session is an `HttpOnly` cookie the API mints. In production it carries
  the `__Host-` prefix, which forbids a `Domain` attribute, so a cookie set by
  one host is never sent to another;
- the API sends **no CORS headers at all**, so a cross-origin `fetch` cannot
  read the response even when the cookie does travel.

Both are fixed by putting the API and the site on one origin, which is a routing
rule in front of them — not a change in here. `VITE_META_API_BASE` overrides the
base at build time for the day the API has its own name _and_ a CORS policy.

### The routing rule, and the three ways it was not done

The API is deployed and reachable, on its own name, in front of the meta
service. The site is a **static** build on App Platform — there is no runtime of
ours anywhere in the request path — so the one place left that sees both the
site and the API is the CDN in front of them.

**Chosen: one routing rule at the edge**, sending `www.blockking.gg/v1/*` to the
API's origin and everything else to App Platform. The browser then only ever
talks to one origin, which means `__Host-`, `SameSite=Lax` and "no CORS at all"
all keep working exactly as written above — nothing in this repo changes, and no
security property is traded away. **It is the one step that is not done**: it
needs a permission the deploy credentials on the dev box do not carry, so it is
the owner's to add.

The three that were rejected, so nobody re-proposes them:

1. **Absolute API base + CORS** (`VITE_META_API_BASE`, the override above). It
   reads like the intended path and is the worst of the three. It needs the
   cookie to drop `__Host-`, take a `Domain`, and move from `SameSite=Lax` to
   `SameSite=None` — and `Lax` is _the_ CSRF defence here, because as the
   Sessions section says there is deliberately no CSRF token. That is not a
   trade-off, it is removing the only lock and adding no other.
2. **A proxy component beside the static site.** Same-origin and it would work,
   but it puts a second always-on service in another region in front of every
   auth call, and the API would then see that proxy's shared egress address
   instead of the player's — which quietly turns a per-player rate limit into a
   global one. The lockout in `ACCOUNTS.md` §4.3 would lock out everybody at
   once.
3. **Serving this site from our own box too.** Same-origin for free, one DNS
   change, no rule needed — but it abandons App Platform, and where the site is
   hosted is not a decision to take on the way past.

### Sessions, and what is deliberately not stored

Nothing. There is no token in `localStorage`, no token in a body, no token in
this code at all: a web login is answered with a `Set-Cookie` and an account
object, and the token field of that response is only ever populated for a game
client. "Am I signed in" therefore has no local answer — `+layout.svelte` asks
`GET /v1/account/me` once per page load and every header reads the result.

CSRF is the cookie's `SameSite=Lax` plus `Content-Type: application/json` on
every mutation (a cross-site `<form>` cannot send that, and the API refuses a
body with unknown fields), plus an `X-Requested-With` header on same-origin
calls. There is no CSRF **token**, because the API checks none — sending a
header it ignores would look like protection and be none.

### Two rules the pages exist to keep

1. **The no-email warning is a blocking step** (`ACCOUNTS.md` §5.1). Registering
   without an email opens a modal that has to be answered, with "add an email
   now" as the primary button; `no_email_ack` is sent only when the other button
   was pressed. It is not a checkbox at the foot of the form, because the thing
   being agreed to is that a forgotten password destroys the account with no
   appeal and no support route (§5.5).
2. **Sign-in never says which part was wrong.** The API answers every failed
   login identically and has a test pinning it byte for byte (§4.4); the form
   shows one sentence for every cause, does no per-field validation, and the
   recovery and email-link flows show their one confirmation whatever happened.

### Prerendering and query strings

`adapter-static` writes one HTML file per route, so a page whose content comes
from the query string cannot be server-rendered at build time. Those four —
`leaderboard`, `players`, `account/verify-email`, `account/reset` — carry a
`+page.ts` with `ssr = false`; the shell is still prerendered and the page
renders in the browser.

The same constraint is why a player profile is `/players?id=123` and not
`/players/123`: a dynamic path segment has no known value at build time, and a
query parameter needs no SPA fallback and no change to the host's routing.

### Screenshots

`static/shots/*` are crops of real playtest captures. Each one is a 16:9
sub-rectangle chosen to exclude the in-game debug overlay (the FPS/position panel
top-left, and the NET panel top-right on the multiplayer frame) and the
click-to-play prompt across the lower middle. The remaining HUD (ammo counter,
key hints, compass, safe-zone banner) is real game UI and is kept on purpose.

Two formats, for one reason only — the three original captures are JPEG q88 at
~1080px wide (64–93 KB each) and everything added since is **WebP q82** at its
native crop size (19–44 KB), which is a third of the bytes for the same picture.
There is no `<picture>` fallback and none is needed. The precedent is
`artwork/icons/*.webp`. Encoding is one `ffmpeg` call, e.g.

```powershell
ffmpeg -y -i <capture>.png -vf "crop=<w>:<h>:<x>:<y>" `
  -c:v libwebp -quality 82 -preset picture -compression_level 6 <name>.webp
```

`width`/`height` in the copy dictionaries must match the file, or the gallery
reserves the wrong box and the page shifts as the images arrive.

**The NET panel is not just clutter — it prints the shard's address.** A frame
captured against a live server carries an IP in its top-right corner, and this
directory is published (see the warning at the top of this file). Crop it out or
do not use the frame.

Re-cropping is a manual step; there is no build-time image pipeline.

## The download button

The game is **not** served from this site. `src/lib/content/th.ts` →
`play.download.href` is an absolute URL on the Spaces CDN:

```
https://blockking-cdn.sgp1.cdn.digitaloceanspaces.com/launcher/BlockKingPatcher.exe
```

Two rules about that link, both from `DISTRIBUTION.md` §4.6:

1. **The URL and the file name never change.** SmartScreen builds reputation
   against the pair, so a rename throws away every "Run anyway" a player has
   ever clicked. Publishing a new launcher overwrites that object; it does not
   get a new name here. (The CDN also holds `BlockKingPatcher-<ver>.exe`, but
   that copy exists for the launcher's self-update, not for this page.)
2. **`play.download.hash` must be re-typed on every launcher release.** The page
   invites the reader to verify it, which is worse than saying nothing if it is
   stale. `build.ps1` prints the sha256 it just built.

The download is one 12.8 MB file; the ~91 MB of game data is fetched by the
launcher from the same CDN afterwards, so nothing large ever passes through
this app or its GitHub mirror.

## Publishing — the `blockking-web` mirror

App Platform can only build from a source it can fetch: GitHub, GitLab, a
publicly clonable git URL, or a container image. There is no `doctl` flow that
uploads a local `build/` directory. The r5 working copy has no git remote and
the game sources must not go to GitHub, so the site is published on its own:

|             |                                                                   |
| ----------- | ----------------------------------------------------------------- |
| Mirror repo | <https://github.com/aommiez/blockking-web> (**public**)           |
| Contents    | exactly the tracked files of r5 `web/`, at the repo **root**      |
| History     | none of r5's — the mirror is squashed to a single commit per sync |

**Why public.** The spec uses App Platform's `git` source type rather than
`github`. `github` needs the DigitalOcean<->GitHub OAuth integration, which can
only be authorised in a browser; `git` clones over plain HTTPS with no
integration, and an unauthenticated clone means the repo must be public. Nothing
here is secret — a static site plus three in-game screenshots — but see the
warning at the top of this file before adding anything.

**Why not `git subtree split`.** A subtree split would carry r5's commit history
for `web/` into a public repo, so anything ever written in a `web/` file stays
readable there even after it is edited out. A squashed mirror publishes the
current tree and nothing else. The cost is that the mirror has no shared history
with r5, so a sync force-pushes.

### Syncing `web/` -> the mirror

Stateless: clone nothing permanent, keep no second checkout. From `D:\Work\r5`,
with `gh` authenticated as `aommiez`:

```powershell
$stage = Join-Path $env:TEMP "blockking-web-sync"
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory $stage | Out-Null

# Only files git tracks under web/ — never node_modules/, build/, .svelte-kit/
git -C D:\Work\r5 ls-files web | ForEach-Object {
  $rel = $_ -replace '^web/', ''
  $dst = Join-Path $stage $rel
  New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
  Copy-Item (Join-Path 'D:\Work\r5' $_) $dst
}

git -C $stage init -b main
git -C $stage add -A
git -C $stage commit -m "sync web/ from r5"
git -C $stage remote add origin https://github.com/aommiez/blockking-web.git
git -C $stage push --force origin main
```

`git ls-files` is what keeps the mirror honest: the copy set is exactly what r5
tracks, so a build artifact or a stray `.env` can never be swept in. The push is
`--force` by design — each sync replaces the single commit.

Pushing the mirror does **not** redeploy: the `git` source type has no push
webhook, so `deploy_on_push` is unavailable. Trigger the deploy explicitly.

## Deploy

Target is **DigitalOcean App Platform** as a static site, spec in
`deploy/do-app.yaml`.

|        |                                                  |
| ------ | ------------------------------------------------ |
| App id | `31510d0c-4e3b-4efe-90ef-d91dc647a838`           |
| URL    | <https://blockking-web-sbawq.ondigitalocean.app> |
| Region | `sgp`                                            |

```powershell
# Redeploy after a sync — this is the normal path
doctl apps create-deployment 31510d0c-4e3b-4efe-90ef-d91dc647a838 --wait

# Watch it / read the URL. `apps get` has no phase column — the phase lives on
# the deployment, so it takes the two commands.
doctl apps get 31510d0c-4e3b-4efe-90ef-d91dc647a838 --format ID,Spec.Name,DefaultIngress
doctl apps list-deployments 31510d0c-4e3b-4efe-90ef-d91dc647a838 --format ID,Phase,Progress,Created
doctl apps logs 31510d0c-4e3b-4efe-90ef-d91dc647a838 --type build

# After editing deploy/do-app.yaml, push the spec itself
doctl apps update 31510d0c-4e3b-4efe-90ef-d91dc647a838 --spec web/deploy/do-app.yaml

# First time only — creates the app (already done)
doctl apps create --spec web/deploy/do-app.yaml
```

A full change therefore takes two steps: **sync the mirror, then
`create-deployment`.**

### Not yet: what the account pages need before they can go to production

The landing page deploys as it always did. The account pages **must not** be
deployed until all of this is true, because without it they render and then fail
on every request:

1. **A DNS name and a certificate for the meta API.** `ACCOUNTS.md` §15 open
   question 2 is still undecided and nothing can be issued until it is.
   Everything below depends on it.
2. **`/v1` served from this site's origin.** Three ways, in order of how little
   they disturb:
   - a **Cloudflare rule or Worker** on the site's own name forwarding `/v1/*`
     to the API origin. The zone is already there and proxied, and neither the
     App Platform deployment nor the API changes. Still needs (1) for the
     origin.
   - **serve the built site from the same reverse proxy as the API** — one
     vhost, `/v1` to the API and everything else to `build/`. Simplest to reason
     about; it moves the site off App Platform.
   - **a separate API host plus CORS.** Needs a change on the API side that does
     not exist today: an origin allowlist, `Access-Control-Allow-Credentials`,
     and an `OPTIONS` route. The cookie survives this only while both names are
     under one registrable domain, because `SameSite=Lax` is about site, not
     origin. Set `VITE_META_API_BASE` at build time if this is the one chosen.
3. **A mail provider.** `meta` writes verification links to its log instead of
   sending them (§15 open question 3). Until that changes, "link an email" is a
   dead end for a real player and the §5.1 warning is the only true statement in
   the product.
4. **`Referrer-Policy: no-referrer` on `/account/verify-email` and
   `/account/reset`.** Both pages ship `<meta name="referrer" content="no-referrer">`,
   which browsers honour, but §5.3 condition 2 asks for the header and an App
   Platform static site cannot set one. Whatever ends up in front of the site
   from (2) is where it belongs — together with §5.3 condition 4, stripping the
   query string from the access log of those two paths.
5. **A public profile a leaderboard row can link to.** `/players?id=` works, but
   nothing links to it: leaderboard rows carry no `account_id` (the API omits it
   from list responses), and no account has a linked `player_identity` yet
   (§13 — every player is still a guest), so the endpoint answers 404 for every
   id on dev today. Not a blocker for shipping; it is why that page is currently
   reachable only from your own account.

## DNS — live

The zone is in Cloudflare and the site answers on its own name as of 2 Aug 2026:

|               |                                                              |
| ------------- | ------------------------------------------------------------ |
| Canonical URL | <https://www.blockking.gg> (App Platform **PRIMARY** domain) |
| Apex          | <https://blockking.gg> (**ALIAS** of the above)              |
| Both point at | the app's default `*.ondigitalocean.app` ingress, via CNAME  |
| Certificates  | issued by App Platform, one per domain                       |

Both names are `CNAME -> <app>.ondigitalocean.app` in Cloudflare (the apex works
through Cloudflare's CNAME flattening) and both are **proxied**. The domains
themselves are in `deploy/do-app.yaml`, so `doctl apps update --spec` is what
puts them on the app; the DNS records are not in this repo.

The order matters if this is ever redone: create the CNAMEs **unproxied**, let
App Platform finish issuing the certificates, and only then turn the proxy on.
With the proxy on first, Cloudflare tries to reach an origin that has no
certificate for the name yet and the issuance never completes.

The full record table lives in `infra/blockking-dns.md`, which is not published.

**Do not touch the `play.blockking.gg` record** — it belongs to the game server,
it must stay **DNS-only**, and it is owned by another task. Cloudflare's proxy
does not carry UDP, so proxying that name takes the whole game offline.
