# French Atelier · Lead Sweet Spot

Two-tab executive dashboard for the French Atelier sales team. Private: contains internal CRM data (rep names, revenue, media cost).

- `index.html` — Tab 1, lead sweet spot per day, per week and per rep-shift, ROI scenarios, golden rule. Source: CRM pivots 1 Mar – 10 Nov 2026 and media-cost exports.
- `rank.html` — Tab 2, cross-check against the data team's Employee Rank scorecard (Sisense export stamped 10 Nov 2026, French only, 1 Jan – 10 Nov 2026).
- `data.js`, `data_rank.js` — precomputed figures used by the pages. `styles.css` and `fonts/` are shared.

Static site, no build step. Open `index.html` through any static server.

Design reference: `gitteromri-ux/callcenter-kpi-dashboard` (not modified).
