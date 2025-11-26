# Gambling Addict Simulator

A full-stack MVP that follows an average American worker with a blackjack habit. Name your character, watch their procedurally generated face, track assets and cash, play blackjack hands, sell belongings when the chips run out, and read life updates every three rounds. Stories trigger short video generations through the NanoBanana Pro API (mocked unless an API key is provided).

## Tech stack

- **Backend:** Node.js + Express, in-memory store
- **Frontend:** React + TypeScript (Vite)
- **Styling:** Custom CSS with a lightweight card layout
- **AI hooks:**
  - Mock face generation (DiceBear placeholder)
  - Rule-based life story generator
  - Real NanoBanana Pro API call when `NANOBANANA_API_KEY` is provided (gracefully degrades to `null`)

## Features

- Character creation with random starter assets, portrait, and baseline stats
- Simplified blackjack with proper deck handling, dealer AI, payouts, and round tracking
- Asset liquidation flow when cash hits zero
- Narrative beats every third round with optional video attachment
- Responsive dashboard showing cash, net worth, assets, and past stories

## Getting started

```bash
npm install                # install backend dev dependencies
(cd client && npm install)  # already run, but repeat if dependencies change
```

### Environment variables

Create a `.env` file in the project root if you need overrides:

```
PORT=4000
NANOBANANA_API_KEY=your-api-key
NANOBANANA_API_URL=https://api.nanobanana.pro/v1/videos
```

Optional client variable (place in `client/.env`):

```
VITE_API_URL=http://localhost:4000/api   # overrides the default relative /api path
```

> Tip: in hosted environments (e.g., Railway) you can simply set `URL=https://your-domain` (host only, no `/api` suffix) and the frontend will automatically call `https://your-domain/api/...`. No extra `VITE_*` variables are necessary.

### Development workflow

Run backend + frontend together:

```bash
npm run dev
```

- Backend: <http://localhost:4000>
- Frontend: <http://localhost:5173>

### Production build

```bash
npm run build:client         # type-check + production bundle
npm run start                # serves API (+ client build when `client/dist` exists)
```

The Express server automatically serves the built React app (`client/dist`) when `NODE_ENV=production`.

### Deploying on Railway

The repo includes a `railway.json` manifest and a `postinstall` script so deployments automatically install the client, run the Vite build, and serve the bundled assets from Express.

1. Install the CLI: `npm i -g @railway/cli`, then `railway login`.
2. Inside this folder run `railway init` (new project) or `railway link` (existing one).
3. Set env vars (optional): `railway variables set NANOBANANA_API_KEY=... NANOBANANA_API_URL=https://api.nanobanana.pro/v1/videos`.
4. Deploy with `railway up` (or via the dashboard). Railway will run `npm install` → `npm run postinstall` (builds the client) → `npm start`, exposing the Express server on the assigned port.

## API overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/characters` | Create a new player character |
| `GET`  | `/api/characters/:id` | Fetch current state |
| `POST` | `/api/characters/:id/blackjack/start` | Start a new blackjack round (body: `{ bet }`) |
| `POST` | `/api/characters/:id/blackjack/hit` | Player hits |
| `POST` | `/api/characters/:id/blackjack/stand` | Player stands & resolves round |
| `POST` | `/api/characters/:id/assets/sell` | Sell an asset (body: `{ assetId }`) |

Every third completed round triggers story + video generation (video requires a valid NanoBanana key).

## Testing status

- `npm run build:client` (TypeScript + Vite build) ✔️
- Manual runtime smoke testing recommended: `npm run dev` then play a few rounds via the UI.
