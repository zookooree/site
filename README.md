# zookooree/site

The public storefront for Zookooree: The Agent Factory.

Copy lives in `copy/`. The words come before the pixels. The page in `src/`
is typeset by hand from `copy/site-copy.md`, and the copy file is the source
of truth: `npm run check:copy` verifies that every paragraph of it renders
verbatim in the built page and fails the build if the two drift. If the
words change in `copy/`, they must change in `src/` — the gate is what makes
that rule real.

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
npm run check      # astro check: types and template diagnostics
npm run check:copy # copy-fidelity gate (run after build)
```

The build must produce zero warnings. Treat a warning as a broken thread.
The full gate sequence is `npm run check && npm run build && npm run
check:copy`; wiring it into GitHub Actions is a pending setup step (the
workflow file must be pushed with `workflow`-scoped credentials).

## Knowledge base links

The KB subdomain is not live yet. Every "details" reference goes through
`KB_URL` in `src/consts.ts` — a single constant. While it holds the
placeholder value `"#"`, the site renders a plain "coming soon" note instead
of a live link. When the KB ships, change that one value and the links go
live.

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
