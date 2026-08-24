# CyberFingers.net

Modern CyberFingers SEO consulting site, deployed to Cloudflare Pages from GitHub.

## Local development

```powershell
npm install
npm run dev
```

The deploy-ready site lives in `public/`. The secure contact endpoint lives in `functions/api/contact.js` and runs as a Cloudflare Pages Function.

## Deployment

GitHub Actions deploys `main` to production and the rebuild branch to a preview deployment. The repository requires encrypted Actions secrets named `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

The Pages project also requires these server-side settings. Their values must remain in Cloudflare and must not be committed:

- `TURNSTILE_SECRET_KEY` encrypted secret
- `CONTACT_SENDER` encrypted secret
- `CONTACT_DESTINATION` encrypted secret
- `CONTACT_EMAIL` send-email binding restricted to the verified destination

A manual deployment can be run with:

```powershell
npm run deploy
```
