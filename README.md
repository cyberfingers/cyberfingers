# CyberFingers.net

Modern static site for CyberFingers SEO consulting, deployed to Cloudflare Workers from GitHub.

## Local development

```powershell
npm install
npm run dev
```

The deploy-ready site lives in `public/`. Cloudflare serves the HTML and assets directly; no application server or PHP runtime is required.

## Deployment

Cloudflare builds and deploys the `main` branch. A manual deployment can be run with:

```powershell
npm run deploy
```
