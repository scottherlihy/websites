# Morning Dashboard

A futuristic dark-themed personal dashboard at `/morning`.

## Architecture

- **Server Components** fetch data and pass it as props to Client Components
- **Client Components** (`'use client'`) handle interactivity: countdown timers, SVG charts
- Each panel is wrapped in `<Suspense>` so they stream independently
- All styling uses CSS Modules scoped to the morning route; dark theme defined via CSS custom properties in `morning.module.css`

## Component Organization

```
components/
  shared/    — Reusable pieces (Panel glass-card wrapper)
  header/    — Greeting, date, weather (Open-Meteo, no auth)
  stocks/    — 6-ticker stock cards with SVG sparkline charts (Finnhub API)
  launches/  — Upcoming rocket launches + T-minus countdown (Space Devs API, no auth)
  nfl/       — Super Bowl odds visualization + NFL Draft/Season countdowns (The Odds API)
```

## Data & Mock Pattern

All data-fetching components check for their API key in `process.env`. If missing, they fall back to realistic mock data so the dashboard renders without any keys configured.

- `FINNHUB_API_KEY` — stock quotes and candle data
- `ODDS_API_KEY` — NFL Super Bowl futures odds
- Weather and launches require no API keys

## Styling Conventions

- All CSS variables prefixed with `--morning-*`
- Font: Space Grotesk (loaded via `next/font/google` in layout.tsx)
- Accent color: `--morning-accent` (#00dc82 forest green)
- Green/red for positive/negative values
- Glass-card panel style via `shared/Panel`
