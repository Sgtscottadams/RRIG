# RRIG Water SCADA Demo
**Presented by KTX Electric** | Powered by Inductive Automation Ignition

Live demo mockup for RRIG Water Solutions — Azul Pipeline, Eastern Delaware Basin.

## Live URL
`https://sgtscottadams.github.io/RRIG/`

## What's Included
- **Overview** — KPI bar, pipeline schematic, facility status, recent alarms
- **Pump Stations** — Real-time card grid (7 pumps), drill-down detail modal
- **Tank Monitor** — Level gauges, fill bars, in/out flow rates
- **Alarm Summary** — Sortable alarm table, detail modal with acknowledge
- **Trend View** — 24h flow rate chart, multi-pen, time range selector

## Features
- Day / Night Liquid Glass themes
- Responsive: mobile, tablet, desktop
- Filter sidebar: facility, equipment type, alarm severity/status, category
- Global search bar (tag, facility, location)
- Multi-filter with individual chip removal + Clear All
- Interactive alarm acknowledge
- Simulated live data

## Deploy
Push to `main` — GitHub Actions auto-deploys to GitHub Pages in ~60s.

Manual deploy: `npm run build && npm run deploy`

## Local Dev
```bash
npm install
npm run dev
```

---
*Demo data only. Not connected to live systems.*
