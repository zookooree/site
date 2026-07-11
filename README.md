# zookooree/site

The public storefront for Zookooree: The Agent Factory.

Copy lives in `copy/`. The words come before the pixels. The page in `src/`
renders `copy/site-copy.md` verbatim — the copy file is the source of truth;
if the words change there, they change here.

## Stack

[Astro](https://astro.build), static output, zero client-side JavaScript.
System font stacks, one accent color, no external requests. This is a
craftsman's storefront: mostly typography.

## Develop

```sh
npm install
npm run dev        # local dev server
npm run build      # static build into dist/
npm run preview    # serve the built site locally
```

The build must produce zero warnings. Treat a warning as a broken thread.

## Knowledge base links

The KB subdomain is not live yet. Every "details" link points at `KB_URL` in
`src/consts.ts` — a single constant. When the KB ships, change that one value.

## Deploy (Cloudflare Pages)

The site deploys via Cloudflare Pages connected to this repository. Build
output location is declared in `wrangler.toml` (`pages_build_output_dir = "dist"`).

One-time setup (dashboard, requires the Cloudflare account owner):

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Select the `zookooree/site` repository (authorize the GitHub integration
   for the `zookooree` org if prompted).
3. Project name: `zookooree-site`.
4. Build settings: framework preset **Astro**, build command `npm run build`,
   build output directory `dist`. Production branch: `main`.
5. Save and deploy.

After that, every push to `main` deploys production, and every PR gets a
preview URL. No secrets are required — the site is fully static.
