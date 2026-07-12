# What to Watch

A mobile-first PWA that shows the most recent OTT releases (movies & TV shows) with the streaming platform they're available on. Built with React + Vite, powered by [DailyOTT.in](https://www.dailyott.in/).

## Features

- Latest OTT movie & TV releases with platform badges (Netflix, Prime Video, JioHotstar, SonyLIV, ZEE5, etc.)
- Language filter: All / English / Hindi / Telugu
- Installable PWA with offline support (service worker + runtime caching)
- Tap a title to find where to watch on JustWatch

## Data source

Content is scraped daily from [DailyOTT.in](https://www.dailyott.in/) using a Vercel serverless function (`/api/ott-india`).

## Local development

```bash
npm install
npm run dev
```

## Test scraper locally (without Vercel)

```bash
node test-scraper.mjs movie   # movies only
node test-scraper.mjs tv      # TV shows only
node test-scraper.mjs         # all
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Deployment (Vercel)

This project deploys to **Vercel**. Configuration lives in `vercel.json`.

### First-time setup

1. Go to https://vercel.com and log in with your GitHub account.
2. Click **Add New… → Project** and import the `s-surineni/what-to-watch` repo.
3. Vercel auto-detects the framework as **Vite**. Confirm:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

After the first deploy, every push to `main` auto-deploys. Your site will be live at
`https://<project-name>.vercel.app`.

### Deploy via CLI (optional)

```bash
npm i -g vercel
vercel            # first run links the project
vercel --prod     # production deploy
```
