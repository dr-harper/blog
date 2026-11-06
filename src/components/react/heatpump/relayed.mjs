/*
 * The emoncms.org calls the heat pump page makes, relayed through /api/emoncms/.
 * astro.config.mjs relays exactly these in development; netlify.toml has one
 * [[redirects]] rule for each in production and must be kept in step by hand.
 * Anything else under /api/emoncms/ is not relayed, so the site can't be used
 * to write to an emoncms account.
 */
export const RELAYED = ['feed/fetch.json', 'feed/data.json', 'feed/list.json'];
