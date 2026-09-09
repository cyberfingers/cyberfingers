# CyberFingers.net

David Britton’s personal CyberFingers career portfolio, deployed to Cloudflare Pages from GitHub.

## Local development

```powershell
npm install
npm run dev
```

The deploy-ready site lives in `public/`. The secure contact endpoint lives in `functions/api/contact.js` and runs as a Cloudflare Pages Function.

## Deployment

GitHub Actions runs on pushes to `main` and `codex/cloudflare-rebuild`. Both currently deploy to the Cloudflare Pages production target (`--branch=main`), including the custom domain. Pushing either branch publishes its contents. The repository requires encrypted Actions secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The Pages project also requires these server-side settings. Their values must remain in Cloudflare and must not be committed:

- `TURNSTILE_SECRET_KEY` encrypted secret
- `CONTACT_SENDER` encrypted secret
- `CONTACT_DESTINATION` encrypted secret
- `CONTACT_EMAIL` send-email binding restricted to the verified destination

A manual deployment can be run with:

```powershell
npm run deploy
```

The manual command uses Wrangler's branch detection. Use the GitHub workflow for the configured production release.

## Portfolio and public resume

Career information lives on the About and Selected Work pages. Employer work is identified as in-house experience. The public resume at `public/assets/david-britton-resume.pdf` is a general version with no phone number, email address, street address, hiring-specific wording or internal company metrics. Update its text source in `scripts/build_public_resume.py` and rebuild it with Python and ReportLab when career details change.

Stylesheets use a version query because CSS and JavaScript assets are cached as immutable. Increment the version on every HTML page when changing CSS. The resume PDF has its own revalidation policy in `_headers` so its stable download URL can receive updates.
