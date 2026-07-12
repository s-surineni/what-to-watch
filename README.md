# What to Watch

A mobile-first PWA that shows the most recent OTT releases (movies & TV shows) with the streaming platform they're available on. Built with React + Vite, powered by the [Watchmode API](https://api.watchmode.com/) and [JustWatch](https://www.justwatch.com/).

## Features

- Latest OTT movie & TV releases with platform badges (Netflix, Prime, Hulu, etc.)
- Language filter: All / English / Hindi / Telugu
- Installable PWA with offline support (service worker + runtime caching)
- Tap a title to find where to watch on JustWatch

## Local development

```bash
npm install
cp .env.example .env   # then add your Watchmode API key
npm run dev
```

### Environment variables

| Variable                  | Description                                              |
| ------------------------- | ------------------------------------------------------- |
| `VITE_WATCHMODE_API_KEY`  | API key from https://api.watchmode.com/requestApiKey    |

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
4. Under **Environment Variables**, add:
   - `VITE_WATCHMODE_API_KEY` = your Watchmode API key
5. Click **Deploy**.

After the first deploy, every push to `main` auto-deploys. Your site will be live at
`https://<project-name>.vercel.app`.

### Deploy via CLI (optional)

```bash
npm i -g vercel
vercel            # first run links the project
vercel --prod     # production deploy
```

Remember to add `VITE_WATCHMODE_API_KEY` in the Vercel project settings (or via `vercel env add`).
