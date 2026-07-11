// Single source for external destinations. Swap here, nowhere else.

// The knowledge base subdomain is not live yet. Every "details" reference on
// the site goes through this constant; when the KB ships, change this one
// value and the links go live. (Type is widened to string on purpose so the
// swap does not trip literal-type comparison errors in KB_PENDING.)
export const KB_URL: string = "#";
export const KB_PENDING = KB_URL === "#";

export const GITHUB_URL = "https://github.com/zookooree";

export const SITE_TITLE = "Zookooree: The Agent Factory";
export const SITE_DESCRIPTION =
  "We build AI agents and sign our name to them: every one ships with a certificate — evidence attached, expiry date printed.";
