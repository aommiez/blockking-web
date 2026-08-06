// This page's content is chosen by the query string, and a prerendered page has
// no query string to read — `adapter-static` writes one HTML file per route,
// not one per set of parameters. So the shell is still prerendered (there is no
// server to render it on), and the page itself renders in the browser, where
// `page.url` is real.
export const prerender = true;
export const ssr = false;
