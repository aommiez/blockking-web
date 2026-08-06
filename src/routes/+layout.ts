// Static build: every route is rendered at build time, nothing runs at serve time.
export const prerender = true;
export const ssr = true;
export const csr = true;

// Emit `register/index.html` rather than `register.html`, because the host only
// resolves the first shape.
//
// App Platform serves a static tree by exact path, plus `index_document` for a
// path that names a directory. It does **not** try adding `.html`. With the
// default (`'never'`) SvelteKit writes `register.html`, so `/register` matched
// no file, fell through to `error_document`, and every account page answered
// 404 in production while building perfectly well — the landing page at `/` was
// the only route that worked, because it was the only one already sitting in a
// directory as `index.html`.
//
// `'always'` puts every page in that same shape. Keep it: dropping it silently
// 404s the whole site except the front page, and only in production.
export const trailingSlash = 'always';
