# FLEX (working name — "Villager Budget" in the UI)

A financial lifestyle planning platform for Africa, starting in Nigeria. Flex looks at
what a person earns and hands them a lifestyle they can actually live — how to spend,
save, and invest — then helps them follow it without falling into debt.

This repo currently holds the **static front-end prototype**: a marketing landing page
and a fully interactive demo of the app, both self-contained HTML files (no build step,
no framework, no backend yet).

## Files

```
flex-web/
├── landing.html        Public marketing page — pitch, features, pricing, FAQ, waitlist
├── index.html           The interactive app prototype/demo
├── css/
│   ├── landing.css       Styles for landing.html
│   └── app.css           Styles for index.html
├── js/
│   ├── landing.js         Behavior for landing.html (waitlist form, reveal animations, toasts)
│   └── app.js              Behavior for index.html (the whole app: routing, state, screens, simulated coach)
├── netlify.toml          Deploy config — serves landing.html at the root URL, app stays at /index.html
├── .vscode/               Editor settings + recommended extensions
└── .gitignore
```

Each page links its own CSS and JS file (`<link rel="stylesheet">` / `<script src="...">`),
rather than embedding everything inline — easier to read, diff, and edit in VS Code.

The only external dependencies are loaded via CDN at runtime:
- Google Fonts (Plus Jakarta Sans, Inter)
- [Chart.js](https://www.chartjs.org/) (charts, `index.html` only)
- [Lucide](https://lucide.dev/) (icons)

No `npm install` or build step needed — an internet connection is required for those
CDN assets to load correctly.

## Running locally

Open the folder in VS Code (recommended extensions will be suggested automatically —
accept the prompt, or install **Live Server** manually), then:

1. Right-click `landing.html` or `index.html` in the Explorer
2. Choose **"Open with Live Server"**
3. It opens at `http://127.0.0.1:5500` and auto-refreshes on save

Or just double-click either file to open it directly in a browser — everything will
render, though Live Server's auto-refresh is handier while editing.

## Deploying (Netlify)

This repo is set up for continuous deployment:

1. Push this repo to GitHub
2. In Netlify: **Add new site → Import an existing project → connect GitHub → select this repo**
3. No build command needed, publish directory is `.` (already set in `netlify.toml`)
4. Every push to the connected branch auto-deploys

## Status

This is currently a **prototype** — no real bank connections, payments, or AI calls
happen. Everything (balances, transactions, the AI coach's replies) is simulated demo
data, matching what's disclosed in the landing page's footer and FAQ. See the strategy
docs (not in this repo) for the product roadmap — the five V1 capabilities are:
Budgeting, Lifestyle Recommendations, Connecting Accounts, Insights, and Goals.

## Pricing model (as reflected on the landing page)

- **Free forever:** full lifestyle plan, budgeting, manual/cash tracking, basic insights, limited goals
- **Premium — ₦400/month or ₦4,000/year** (first month free, payday billing available): live account sync, AI coach, unlimited automated goals, deep insights
